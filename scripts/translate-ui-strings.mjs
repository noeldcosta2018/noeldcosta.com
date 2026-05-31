#!/usr/bin/env node
/**
 * scripts/translate-ui-strings.mjs
 *
 * Self-hosted i18n: re-translates the UI string catalog in
 * `src/lib/i18n/messages.ts` (the EN constant) into 10 target languages
 * using OpenAI's Chat Completions API (gpt-5.4).
 *
 * Pipeline:
 *   1. Read messages.ts as text; extract the literal `const EN: Messages = { ... }`
 *      block via a brace-counting scanner; evaluate via `new Function`.
 *   2. Flatten to (dotPath, sourceString) leaves via `walkLeaves`.
 *   3. Chunk leaves bounded by max strings AND max source chars, preferring
 *      sub-namespace boundaries.
 *   4. For each (locale, chunk): wrap unmarked glossary terms with
 *      <span translate="no">, send to GPT-5.4 in JSON mode, validate marker
 *      and placeholder preservation, retry once on validation failure,
 *      strip wrapper spans, persist to .cache/translate-ui/<locale>.json.
 *   5. Unflatten the resume cache into a nested object matching the EN shape
 *      and emit src/lib/i18n/messages.<locale>.ts.
 *
 * Authentication: see scripts/lib/openai-shared.mjs (OPENAI_KEY_PATH or
 * OPENAI_API_KEY env var).
 *
 * Run --help for the full CLI surface.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

import {
  MODEL_NAME,
  MODEL_PRICING,
  OPENAI_KEY_PATH,
  TARGET_LANGUAGES,
  LANG_NAMES,
  LANG_REGISTER,
  TOKENS_PER_INPUT_CHAR_EN,
  SYSTEM_PROMPT_TOKENS_JSON,
  getOutputTokensPerCharForLang,
  loadApiKey,
  loadOpenAiClient,
  getRateLimitSnapshot,
  withRetry,
  callJsonTranslate,
  calcCost,
} from './lib/openai-shared.mjs';
import { wrapGlossary } from './lib/glossary.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MESSAGES_TS_PATH = join(ROOT, 'src', 'lib', 'i18n', 'messages.ts');
const CACHE_DIR = join(ROOT, '.cache', 'translate-ui');

// ── Chunking parameters ──────────────────────────────────────────────────────

const MAX_STRINGS_PER_CHUNK = 60;
const MAX_CHARS_PER_CHUNK = 4_000;
// Soft thresholds: only break early on a sub-namespace boundary if the
// current chunk has at least this much content. Prevents tiny namespaces
// from each becoming their own one-string chunk.
const SOFT_BREAK_MIN_STRINGS = 20;
const SOFT_BREAK_MIN_CHARS = 1_500;

// ── CLI parsing ──────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {
    dryRun: false, lang: null, key: null, check: null,
    force: false, yes: false, concurrency: 3,
    verbose: false, help: false,
  };
  const take = (i) => argv[i + 1];
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--force') args.force = true;
    else if (a === '--yes' || a === '--no-confirm') args.yes = true;
    else if (a === '--verbose' || a === '-v') args.verbose = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--lang') args.lang = take(i++);
    else if (a === '--key') args.key = take(i++);
    else if (a === '--check') args.check = take(i++);
    else if (a === '--concurrency') args.concurrency = parseInt(take(i++), 10);
    else if (a.startsWith('--lang=')) args.lang = a.slice(7);
    else if (a.startsWith('--key=')) args.key = a.slice(6);
    else if (a.startsWith('--check=')) args.check = a.slice(8);
    else if (a.startsWith('--concurrency=')) args.concurrency = parseInt(a.slice(14), 10);
  }
  return args;
}

function printHelp() {
  process.stdout.write(`
scripts/translate-ui-strings.mjs — UI string translation pipeline (OpenAI ${MODEL_NAME})

Re-translates the EN constant in src/lib/i18n/messages.ts into 10 target
languages via OpenAI's Chat Completions API, then emits typed per-locale
messages.<locale>.ts files.

Usage:
  node scripts/translate-ui-strings.mjs [options]

Options:
  --dry-run            Estimate cost; no API calls; no writes.
  --lang <code(s)>     Comma-separated target locales (default: all 10).
  --key <dotPath>      Translate only the specified dot-path across all
                       target locales. Useful after a single EN string
                       changes.
  --check <locale>     Re-validate the existing messages.<locale>.ts file
                       (marker preservation, placeholder preservation,
                       structural completeness vs EN) without API calls.
  --force              Clear the resume cache for the targeted locales
                       before running. Triggers cost-confirm prompt
                       unless --yes is also passed.
  --yes, --no-confirm  Skip the cost-confirm prompt on --force.
  --concurrency <n>    Parallel chunk requests per locale (default: 3).
  --verbose            Per-chunk progress logging.
  --help, -h           Show this help.

Authentication:
  Reads OPENAI_API_KEY env var if set, otherwise reads the key from:
  ${OPENAI_KEY_PATH}
  Never logs, prints, or persists the key.

Resume cache:
  .cache/translate-ui/<locale>.json — flat { dotPath: translated } map,
  written incrementally after each chunk. Already-cached leaves are
  skipped on resume. --force clears the cache for targeted locales.

Per-locale errors:
  .cache/translate-ui/<locale>.errors.json — appended when a chunk fails
  validation twice. The locale's chunk is skipped but other chunks
  continue.

Target locales: ${TARGET_LANGUAGES.join(', ')}
`);
}

// ── Load MESSAGES.en from messages.ts ───────────────────────────────────────
//
// messages.ts is TypeScript; we don't want to add a tsx loader. The EN const
// body is pure JSON-compatible JS (string values, nested objects, string
// arrays), so we extract the literal object expression as text via a
// brace-counting scanner that skips quoted strings, then evaluate it.

function findBalancedObjectLiteral(source, startSearch) {
  // Find the first `{` after startSearch and scan forward, counting braces
  // while skipping over string literals (single/double-quoted, template).
  // Returns [openIdx, closeIdx] inclusive of both braces.
  let i = startSearch;
  while (i < source.length && source[i] !== '{') i++;
  if (i >= source.length) {
    throw new Error('No opening brace found after EN declaration.');
  }
  const openIdx = i;
  let depth = 0;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      // Skip over a string literal. Handles backslash-escaped chars and
      // template literals' ${...} expressions (which can contain nested
      // braces, but EN's data block has no template literals — we still
      // walk inside ${} carefully).
      const quote = ch;
      i++;
      while (i < source.length) {
        const sc = source[i];
        if (sc === '\\') { i += 2; continue; }
        if (quote === '`' && sc === '$' && source[i + 1] === '{') {
          // Skip the ${...} expression by recursing into a brace-counted
          // scan starting after the `${`.
          i += 2;
          let inner = 1;
          while (i < source.length && inner > 0) {
            const ic = source[i];
            if (ic === '{') inner++;
            else if (ic === '}') inner--;
            i++;
          }
          continue;
        }
        if (sc === quote) { i++; break; }
        i++;
      }
      continue;
    }
    if (ch === '/' && source[i + 1] === '/') {
      // Line comment: skip to end of line.
      while (i < source.length && source[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && source[i + 1] === '*') {
      // Block comment: skip to closing */.
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return [openIdx, i];
    }
    i++;
  }
  throw new Error('Unbalanced braces while scanning EN literal.');
}

function loadEnMessages() {
  const source = readFileSync(MESSAGES_TS_PATH, 'utf8');
  // Locate the declaration. We accept either `const EN: Messages = {` or
  // `export const EN: Messages = {` so the same scanner works before and
  // after Phase 3's export change.
  const declRe = /(?:export\s+)?const\s+EN\s*:\s*Messages\s*=\s*/;
  const match = declRe.exec(source);
  if (!match) {
    throw new Error(`Could not locate \`const EN: Messages = {\` in ${MESSAGES_TS_PATH}.`);
  }
  const startSearch = match.index + match[0].length;
  const [openIdx, closeIdx] = findBalancedObjectLiteral(source, startSearch);
  const literal = source.slice(openIdx, closeIdx + 1);
  // Evaluate the literal as a JS expression. The EN block is pure JSON-
  // compatible JS — no type assertions, no `as const`, no function values.
  try {
    const obj = new Function(`return ${literal};`)();
    return obj;
  } catch (err) {
    throw new Error(`Failed to evaluate EN literal: ${err.message}`);
  }
}

// ── Walk leaves ──────────────────────────────────────────────────────────────
//
// Recursive walk that yields [dotPath, value] pairs for every leaf string.
// Array entries get numeric path segments (`.0`, `.1`). Skips empty strings,
// the literal `"_todo"`, null, undefined.

function walkLeaves(obj, prefix = '') {
  const out = [];
  walkLeavesInto(obj, prefix, out);
  return out;
}

function walkLeavesInto(node, prefix, out) {
  if (node === null || node === undefined) return;
  if (typeof node === 'string') {
    if (node === '' || node === '_todo') return;
    out.push([prefix, node]);
    return;
  }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      const next = prefix ? `${prefix}.${i}` : String(i);
      walkLeavesInto(node[i], next, out);
    }
    return;
  }
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      const next = prefix ? `${prefix}.${k}` : k;
      walkLeavesInto(v, next, out);
    }
  }
}

// ── Chunking ─────────────────────────────────────────────────────────────────
//
// Group leaves into chunks bounded by max-strings AND max-chars. Prefer
// closing the current chunk at sub-namespace boundaries (change at the
// second segment of the dot-path) when the chunk already has soft-break
// volume.

function getSubNamespace(dotPath) {
  // First two segments. For a path with only one segment, the namespace is
  // the segment itself.
  const parts = dotPath.split('.');
  if (parts.length <= 1) return parts[0] || '';
  return `${parts[0]}.${parts[1]}`;
}

function chunkLeaves(leaves) {
  const chunks = [];
  let cur = [];
  let curChars = 0;
  let curNs = null;

  const flush = () => {
    if (cur.length > 0) {
      chunks.push(cur);
      cur = [];
      curChars = 0;
      curNs = null;
    }
  };

  for (const [path, value] of leaves) {
    const ns = getSubNamespace(path);
    const wouldExceedCount = cur.length >= MAX_STRINGS_PER_CHUNK;
    const wouldExceedChars = curChars + value.length > MAX_CHARS_PER_CHUNK;
    const isNsBoundary = curNs !== null && ns !== curNs;
    const softBreakReady =
      cur.length >= SOFT_BREAK_MIN_STRINGS || curChars >= SOFT_BREAK_MIN_CHARS;

    if (wouldExceedCount || wouldExceedChars) {
      flush();
    } else if (isNsBoundary && softBreakReady) {
      flush();
    }

    cur.push([path, value]);
    curChars += value.length;
    curNs = ns;
  }
  flush();
  return chunks;
}

// ── Marker preservation validation ──────────────────────────────────────────

const NO_TRANSLATE_RE = /<noTranslate>[\s\S]*?<\/noTranslate>/g;
const PLACEHOLDER_RE = /\{(\w+)\}/g;

function countNoTranslateRegions(s) {
  return (s.match(NO_TRANSLATE_RE) || []).length;
}

function extractPlaceholders(s) {
  const set = new Set();
  let m;
  PLACEHOLDER_RE.lastIndex = 0;
  while ((m = PLACEHOLDER_RE.exec(s)) !== null) set.add(m[1]);
  return set;
}

function setsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

function validatePair(source, translated) {
  // Check noTranslate region count.
  const srcCount = countNoTranslateRegions(source);
  const trCount = countNoTranslateRegions(translated);
  if (srcCount !== trCount) {
    return { ok: false, reason: `noTranslate count mismatch: source=${srcCount} translated=${trCount}` };
  }
  // Check placeholder set equality.
  const srcSet = extractPlaceholders(source);
  const trSet = extractPlaceholders(translated);
  if (!setsEqual(srcSet, trSet)) {
    const missing = [...srcSet].filter((x) => !trSet.has(x));
    const extra = [...trSet].filter((x) => !srcSet.has(x));
    return {
      ok: false,
      reason: `placeholder mismatch: missing=[${missing.join(', ')}] extra=[${extra.join(', ')}]`,
    };
  }
  return { ok: true };
}

// ── Glossary wrapper stripping ──────────────────────────────────────────────
// Strip <span translate="no">…</span> wrappers from the translated string
// before persisting. Leaves any inline <noTranslate> wrappers alone — those
// are author-authored markers that survive into the data file.
function stripGlossaryWrappers(s) {
  return s.replace(/<span translate="no">([\s\S]*?)<\/span>/g, '$1');
}

// ── System prompts ──────────────────────────────────────────────────────────

function buildUiSystemPrompt(lang, retry = false) {
  const langName = LANG_NAMES[lang] || lang;
  const register = LANG_REGISTER[lang] || 'Use the standard professional register.';
  const head = retry
    ? 'RETRY: the previous response failed marker / placeholder preservation validation. Re-check rules 1 and 2 carefully.\n\n'
    : '';
  return head + [
    `You translate short UI strings for a senior SAP consultant's personal`,
    `brand website (noeldcosta.com) from English into natural, native-quality`,
    `${langName}.`,
    '',
    'Tone: professional, direct, first-person where the source uses first',
    `person. ${register}`,
    '',
    'Audience: enterprise CIO / CFO / Programme Director, age 45-58, fluent',
    'business English speakers reading in their native language by preference.',
    'Read like a senior consultant, not like marketing copy.',
    '',
    'Avoid marketing buzzwords. SAP product names stay in Latin script.',
    '',
    'The strings come from a calculator / form / wizard UI. Many are very',
    'short (button labels, field labels, option values). Treat each string',
    'independently — do not invent context.',
    '',
    'STRICT preservation rules (violations break the build):',
    '1. Preserve every <noTranslate>...</noTranslate> tag exactly. Do NOT',
    '   translate the inner text, do NOT remove the wrapper.',
    '2. Preserve every {placeholder} token (curly-brace identifier) exactly.',
    '   These are runtime interpolation slots — translating them breaks the',
    '   site. Examples: {count}, {months}, {industry}, {n}, {status}.',
    '3. Numbers and currency amounts ($150K, $2M, 22%) stay numeric. The "$"',
    '   sign stays for USD. Currency stays in dollars unless the source',
    '   explicitly converts.',
    '4. SAP module codes (FI-GL, EWM, TM, S/4HANA, BTP, etc.), regulatory',
    '   acronyms (IFRS 16, GDPR, ViDA), and proper nouns are wrapped in',
    '   <noTranslate> already — keep them wrapped.',
    '5. Em dashes (—) and en dashes (–) stay as-is; do not substitute hyphens.',
    `6. The "change" / "change management" rule from translate-content.mjs:`,
    '   always translate as the full management term, never a bare word.',
    '',
    'Input format: JSON array of English source strings.',
    'Output format: JSON object {"translations": [...]} same length, same',
    'order. Return JSON only.',
  ].join('\n');
}

// ── Cache I/O ───────────────────────────────────────────────────────────────

async function ensureCacheDir() {
  await mkdir(CACHE_DIR, { recursive: true });
}

function cachePathFor(locale) {
  return join(CACHE_DIR, `${locale}.json`);
}

function errorsPathFor(locale) {
  return join(CACHE_DIR, `${locale}.errors.json`);
}

function loadCache(locale) {
  const p = cachePathFor(locale);
  if (!existsSync(p)) return {};
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch (err) {
    console.warn(`  WARN: could not parse ${p}; starting fresh: ${err.message}`);
    return {};
  }
}

async function saveCache(locale, data) {
  await writeFile(cachePathFor(locale), JSON.stringify(data, null, 2), 'utf8');
}

async function appendErrors(locale, entries) {
  const p = errorsPathFor(locale);
  let existing = [];
  if (existsSync(p)) {
    try { existing = JSON.parse(readFileSync(p, 'utf8')); } catch { existing = []; }
  }
  existing.push(...entries);
  await writeFile(p, JSON.stringify(existing, null, 2), 'utf8');
}

// ── Translation execution ──────────────────────────────────────────────────

async function translateChunk(client, locale, chunk, opts) {
  // Apply glossary wrapper to each source string before sending.
  const sources = chunk.map(([, v]) => wrapGlossary(v));
  const systemPrompt = buildUiSystemPrompt(locale, false);
  const label = `ui ${locale} chunk[${chunk[0][0]} … ${chunk[chunk.length - 1][0]}] n=${chunk.length}`;

  let result;
  try {
    result = await withRetry(label, (timeoutMs) =>
      callJsonTranslate(client, MODEL_NAME, locale, sources, systemPrompt, timeoutMs)
    );
  } catch (err) {
    return { ok: false, reason: `api error: ${err.message || err}` };
  }

  let translated = result.translations.map((t, i) => ({
    raw: typeof t === 'string' ? t : String(t ?? ''),
    source: chunk[i][1], // original EN, with markers
    sourceWrapped: sources[i],
  }));

  // Validate marker / placeholder preservation against the ORIGINAL EN
  // source (not the glossary-wrapped one), after stripping the glossary
  // wrappers from the translated text.
  let failures = translated.map((t, i) => {
    const cleaned = stripGlossaryWrappers(t.raw);
    const v = validatePair(t.source, cleaned);
    return { idx: i, ok: v.ok, reason: v.reason, cleaned };
  });
  const anyFail = failures.some((f) => !f.ok);

  let promptTokens = result.promptTokens;
  let completionTokens = result.completionTokens;
  let elapsedMs = result.elapsedMs;

  if (anyFail) {
    if (opts.verbose) {
      const reasons = failures.filter((f) => !f.ok).map((f) =>
        `[${chunk[f.idx][0]}] ${f.reason}`).slice(0, 3).join('; ');
      console.warn(`  RETRY-VALIDATION ${locale}: ${reasons}`);
    }
    const retryPrompt = buildUiSystemPrompt(locale, true);
    let retryResult;
    try {
      retryResult = await withRetry(`${label} retry`, (timeoutMs) =>
        callJsonTranslate(client, MODEL_NAME, locale, sources, retryPrompt, timeoutMs)
      );
    } catch (err) {
      return {
        ok: false,
        reason: `retry api error: ${err.message || err}`,
        promptTokens, completionTokens, elapsedMs,
      };
    }
    promptTokens += retryResult.promptTokens;
    completionTokens += retryResult.completionTokens;
    elapsedMs += retryResult.elapsedMs;
    translated = retryResult.translations.map((t, i) => ({
      raw: typeof t === 'string' ? t : String(t ?? ''),
      source: chunk[i][1],
      sourceWrapped: sources[i],
    }));
    failures = translated.map((t, i) => {
      const cleaned = stripGlossaryWrappers(t.raw);
      const v = validatePair(t.source, cleaned);
      return { idx: i, ok: v.ok, reason: v.reason, cleaned };
    });
    if (failures.some((f) => !f.ok)) {
      const errors = failures.filter((f) => !f.ok).map((f) => ({
        dotPath: chunk[f.idx][0],
        source: chunk[f.idx][1],
        translated: failures[f.idx].cleaned,
        reason: f.reason,
      }));
      return {
        ok: false,
        reason: `validation failed on retry (${errors.length} strings)`,
        errors,
        promptTokens, completionTokens, elapsedMs,
      };
    }
  }

  // All translations validated. Build the path → cleaned-translation map.
  const out = {};
  for (let i = 0; i < chunk.length; i++) {
    out[chunk[i][0]] = failures[i].cleaned;
  }
  return { ok: true, translations: out, promptTokens, completionTokens, elapsedMs };
}

// ── Concurrency helper ─────────────────────────────────────────────────────

async function runWithConcurrency(items, concurrency, worker) {
  const out = new Array(items.length);
  let cursor = 0;
  const n = Math.max(1, Math.min(concurrency, items.length));
  const workers = Array.from({ length: n }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      try { out[i] = await worker(items[i], i); }
      catch (err) { out[i] = { ok: false, error: err, item: items[i] }; }
    }
  });
  await Promise.all(workers);
  return out;
}

// ── Unflatten cache into nested object matching EN ─────────────────────────
//
// Detects arrays via consecutive numeric keys starting from 0. For mixed
// objects (object whose keys are all numeric strings starting from 0) we
// emit an array; otherwise an object.

function unflatten(flat) {
  const root = {};
  for (const [path, value] of Object.entries(flat)) {
    setAtDotPath(root, path, value);
  }
  return convertNumericObjectsToArrays(root);
}

function setAtDotPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (cur[k] === undefined || cur[k] === null) cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

function convertNumericObjectsToArrays(node) {
  if (node === null || typeof node !== 'object') return node;
  if (Array.isArray(node)) {
    return node.map(convertNumericObjectsToArrays);
  }
  const keys = Object.keys(node);
  const allNumeric = keys.length > 0 && keys.every((k) => /^\d+$/.test(k));
  if (allNumeric) {
    // Verify the keys form a contiguous 0..N-1 sequence.
    const nums = keys.map(Number).sort((a, b) => a - b);
    const isSeq = nums.every((n, i) => n === i);
    if (isSeq) {
      const arr = nums.map((n) => convertNumericObjectsToArrays(node[String(n)]));
      return arr;
    }
  }
  const out = {};
  for (const k of keys) out[k] = convertNumericObjectsToArrays(node[k]);
  return out;
}

// ── Per-locale .ts file generation ─────────────────────────────────────────

// Valid JS identifier (for unquoted object keys).
const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function jsString(s) {
  // Double-quoted JS string literal with the standard escapes.
  return '"' + s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t') + '"';
}

function printValue(value, indent) {
  if (value === null) return 'null';
  if (typeof value === 'string') return jsString(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const inner = ' '.repeat(indent + 2);
    const closeIndent = ' '.repeat(indent);
    const lines = value.map((v) => `${inner}${printValue(v, indent + 2)},`);
    return `[\n${lines.join('\n')}\n${closeIndent}]`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    const inner = ' '.repeat(indent + 2);
    const closeIndent = ' '.repeat(indent);
    const lines = keys.map((k) => {
      const keyStr = IDENT_RE.test(k) ? k : jsString(k);
      return `${inner}${keyStr}: ${printValue(value[k], indent + 2)},`;
    });
    return `{\n${lines.join('\n')}\n${closeIndent}}`;
  }
  // Fallback (undefined, function, etc. — should never appear).
  return 'null';
}

function buildLocaleFile(locale, nested) {
  const langName = LANG_NAMES[locale] || locale;
  const constName = `${locale}Messages`;
  const header = [
    `// AUTO-GENERATED by scripts/translate-ui-strings.mjs`,
    `// Source: src/lib/i18n/messages.ts (EN constant)`,
    `// Locale: ${locale} (${langName})`,
    `// Generated: ${new Date().toISOString()}`,
    `//`,
    `// To regenerate, run: node scripts/translate-ui-strings.mjs --lang ${locale}`,
    `// Do NOT hand-edit this file — changes will be overwritten on next run.`,
    ``,
    `import type { Messages } from "./messages";`,
    ``,
    `export const ${constName}: Messages = ${printValue(nested, 0)};`,
    ``,
  ];
  return header.join('\n');
}

async function emitLocaleFile(locale, flat) {
  const nested = unflatten(flat);
  const content = buildLocaleFile(locale, nested);
  const outPath = join(ROOT, 'src', 'lib', 'i18n', `messages.${locale}.ts`);
  await writeFile(outPath, content, 'utf8');
  return outPath;
}

// ── Cost-confirm prompt ─────────────────────────────────────────────────────

async function promptYesNo(message) {
  if (!process.stdin.isTTY) {
    return false;
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      const v = String(answer || '').trim().toLowerCase();
      resolve(v === 'y' || v === 'yes');
    });
  });
}

// ── --check mode ───────────────────────────────────────────────────────────
//
// Re-read messages.<locale>.ts and re-run validation (marker preservation,
// placeholder preservation, structural completeness vs EN). No API calls.

async function checkLocale(locale, en) {
  const localePath = join(ROOT, 'src', 'lib', 'i18n', `messages.${locale}.ts`);
  if (!existsSync(localePath)) {
    console.error(`Error: ${localePath} does not exist.`);
    return 1;
  }
  const source = readFileSync(localePath, 'utf8');
  const declRe = new RegExp(`(?:export\\s+)?const\\s+${locale}Messages\\s*:\\s*Messages\\s*=\\s*`);
  const match = declRe.exec(source);
  if (!match) {
    console.error(`Error: could not locate \`const ${locale}Messages: Messages = …\` in ${localePath}.`);
    return 1;
  }
  // Stub form: `export const xxMessages: Messages = EN;` — the locale file
  // re-exports the English object. In that case the locale's leaves are by
  // definition identical to EN, so validation is trivially OK.
  const afterDecl = source.slice(match.index + match[0].length).trimStart();
  if (afterDecl.startsWith('EN')) {
    const enLeaves = walkLeaves(en);
    console.log(`OK: messages.${locale}.ts re-exports EN (${enLeaves.length} leaves; structure + markers + placeholders match by definition).`);
    return 0;
  }
  const startSearch = match.index + match[0].length;
  const [openIdx, closeIdx] = findBalancedObjectLiteral(source, startSearch);
  const literal = source.slice(openIdx, closeIdx + 1);
  let localeObj;
  try {
    localeObj = new Function(`return ${literal};`)();
  } catch (err) {
    console.error(`Error: could not evaluate locale literal: ${err.message}`);
    return 1;
  }

  const enLeaves = walkLeaves(en);
  const enMap = new Map(enLeaves);
  const localeLeaves = walkLeaves(localeObj);
  const localeMap = new Map(localeLeaves);

  let problems = 0;

  // Structural: every EN key must exist in locale.
  for (const [path] of enLeaves) {
    if (!localeMap.has(path)) {
      console.error(`MISSING: ${path}`);
      problems++;
    }
  }

  // Extra keys in locale not in EN.
  for (const [path] of localeLeaves) {
    if (!enMap.has(path)) {
      console.error(`EXTRA:   ${path}`);
      problems++;
    }
  }

  // Marker / placeholder preservation per leaf.
  for (const [path, srcValue] of enLeaves) {
    const trValue = localeMap.get(path);
    if (typeof trValue !== 'string') continue;
    const v = validatePair(srcValue, trValue);
    if (!v.ok) {
      console.error(`INVALID: ${path} — ${v.reason}`);
      problems++;
    }
  }

  if (problems === 0) {
    console.log(`OK: messages.${locale}.ts matches EN structure (${enLeaves.length} leaves, all markers + placeholders preserved).`);
    return 0;
  }
  console.error(`FAIL: messages.${locale}.ts has ${problems} problem(s).`);
  return 1;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) { printHelp(); process.exit(0); }

  // --check is a standalone read-only mode.
  if (opts.check) {
    if (!TARGET_LANGUAGES.includes(opts.check)) {
      console.error(`Error: --check expects a target locale. Supported: ${TARGET_LANGUAGES.join(', ')}`);
      process.exit(1);
    }
    const en = loadEnMessages();
    const code = await checkLocale(opts.check, en);
    process.exit(code);
  }

  // Validate --lang.
  const targetLangs = opts.lang
    ? opts.lang.split(',').map((s) => s.trim()).filter(Boolean)
    : [...TARGET_LANGUAGES];
  for (const l of targetLangs) {
    if (!TARGET_LANGUAGES.includes(l)) {
      console.error(`Error: unknown target language "${l}". Supported: ${TARGET_LANGUAGES.join(', ')}`);
      process.exit(1);
    }
  }

  if (!opts.dryRun) {
    try { loadApiKey(); }
    catch (err) {
      console.error(`Error: could not load OpenAI API key (${err.message}).`);
      console.error(`Expected at ${OPENAI_KEY_PATH} or in OPENAI_API_KEY env var.`);
      process.exit(1);
    }
  }

  // Load EN.
  console.log(`Source: ${MESSAGES_TS_PATH}`);
  const en = loadEnMessages();
  let leaves = walkLeaves(en);

  // --key narrows to a single dot-path.
  if (opts.key) {
    const filtered = leaves.filter(([p]) => p === opts.key);
    if (filtered.length === 0) {
      console.error(`Error: --key "${opts.key}" not found in EN (or value is empty/_todo).`);
      process.exit(1);
    }
    leaves = filtered;
  }

  console.log(`Leaves: ${leaves.length} translatable string(s)`);
  console.log(`Locales: ${targetLangs.join(', ')}`);
  console.log(`Model: ${MODEL_NAME} ($${MODEL_PRICING.input}/M input, $${MODEL_PRICING.output}/M output)`);
  console.log(`Mode: ${opts.dryRun ? 'DRY-RUN (no API calls, no writes)' : 'LIVE'}`);
  console.log('');

  await ensureCacheDir();

  // --force: clear caches for targeted locales.
  if (opts.force) {
    for (const locale of targetLangs) {
      const p = cachePathFor(locale);
      if (existsSync(p)) {
        await writeFile(p, '{}', 'utf8');
      }
      const ep = errorsPathFor(locale);
      if (existsSync(ep)) {
        await writeFile(ep, '[]', 'utf8');
      }
    }
  }

  // Per-locale plan: compute the work that's left after resume cache.
  const plans = new Map(); // locale -> { remaining, chunks, totalChars }
  for (const locale of targetLangs) {
    const cache = loadCache(locale);
    const remaining = leaves.filter(([p]) => !(p in cache) || opts.force);
    // Note: --force already cleared the cache, so `p in cache` is false for
    // all leaves on a forced run. The `|| opts.force` is just belt-and-
    // braces and also documents intent.
    const chunks = chunkLeaves(remaining);
    const totalChars = remaining.reduce((s, [, v]) => s + v.length, 0);
    plans.set(locale, { cache, remaining, chunks, totalChars });
  }

  // Cost estimate (dry-run and force confirm both use this).
  let grandInput = 0;
  let grandOutput = 0;
  let grandCost = 0;
  const perLocaleEstimates = new Map();
  for (const locale of targetLangs) {
    const { remaining, chunks, totalChars } = plans.get(locale);
    const outRatio = getOutputTokensPerCharForLang(locale);
    const inputTokens = chunks.length * SYSTEM_PROMPT_TOKENS_JSON
      + Math.ceil(totalChars * TOKENS_PER_INPUT_CHAR_EN)
      + remaining.length * 6; // JSON framing overhead per string (~6 tokens)
    const outputTokens = Math.ceil(totalChars * outRatio)
      + remaining.length * 6; // JSON framing overhead per string
    const cost = calcCost(inputTokens, outputTokens);
    perLocaleEstimates.set(locale, {
      inputTokens, outputTokens, cost,
      remaining: remaining.length, chunks: chunks.length, totalChars,
    });
    grandInput += inputTokens;
    grandOutput += outputTokens;
    grandCost += cost;
  }

  // Print chunk plan + cost estimate.
  console.log('=== Plan ===');
  for (const locale of targetLangs) {
    const est = perLocaleEstimates.get(locale);
    console.log(
      `  ${locale}: ${est.remaining} string(s) in ${est.chunks} chunk(s), ` +
      `${est.totalChars.toLocaleString()} chars, ` +
      `est in=${est.inputTokens.toLocaleString()} out=${est.outputTokens.toLocaleString()} ` +
      `cost=$${est.cost.toFixed(3)}`
    );
  }
  console.log('');
  console.log(`Estimated grand total: input=${grandInput.toLocaleString()} output=${grandOutput.toLocaleString()} cost=$${grandCost.toFixed(2)}`);

  // Runtime estimate: ~3 chunks/locale × ~10s per chunk, divided by concurrency.
  const totalChunks = [...perLocaleEstimates.values()].reduce((s, x) => s + x.chunks, 0);
  const estSec = (totalChunks * 10) / Math.max(opts.concurrency, 1);
  console.log(`Estimated runtime: ~${(estSec / 60).toFixed(1)} min at concurrency ${opts.concurrency} per locale`);
  console.log('');

  if (opts.dryRun) {
    process.exit(0);
  }

  // Cost-confirm prompt on --force without --yes.
  if (opts.force && !opts.yes) {
    if (!process.stdin.isTTY) {
      console.error('Error: --force in a non-interactive context requires --yes to skip the confirmation prompt.');
      process.exit(1);
    }
    const ok = await promptYesNo(`Continue? [y/N] `);
    if (!ok) {
      console.log('Aborted.');
      process.exit(1);
    }
  }

  // Run per-locale.
  const client = await loadOpenAiClient();
  const overallT0 = Date.now();
  let overallSucceeded = 0;
  let overallFailed = 0;
  let overallInputTokens = 0;
  let overallOutputTokens = 0;
  let overallCost = 0;
  const localeResults = new Map();

  for (const locale of targetLangs) {
    const localeT0 = Date.now();
    const plan = plans.get(locale);
    const { cache, chunks } = plan;
    console.log(`── ${locale}: ${chunks.length} chunk(s) to translate ──`);

    let stringsDone = 0;
    let stringsFailed = 0;
    let inputTokens = 0;
    let outputTokens = 0;

    const results = await runWithConcurrency(chunks, opts.concurrency, async (chunk, idx) => {
      const r = await translateChunk(client, locale, chunk, opts);
      return { ...r, chunk, idx };
    });

    // Merge successful chunks into the cache; collect failures.
    const failedEntries = [];
    for (const r of results) {
      if (!r) continue;
      if (r.ok === false) {
        stringsFailed += r.chunk.length;
        if (r.errors) failedEntries.push(...r.errors);
        else failedEntries.push({
          dotPaths: r.chunk.map(([p]) => p),
          reason: r.reason,
        });
        if (typeof r.promptTokens === 'number') inputTokens += r.promptTokens;
        if (typeof r.completionTokens === 'number') outputTokens += r.completionTokens;
        if (opts.verbose) {
          console.warn(`  CHUNK-FAIL ${locale} #${r.idx + 1}: ${r.reason}`);
        }
        continue;
      }
      Object.assign(cache, r.translations);
      stringsDone += r.chunk.length;
      inputTokens += r.promptTokens;
      outputTokens += r.completionTokens;
      if (opts.verbose) {
        console.log(`  OK ${locale} chunk #${r.idx + 1}/${chunks.length} ` +
          `(${r.chunk.length} strings, in=${r.promptTokens} out=${r.completionTokens}, ${r.elapsedMs}ms)`);
      }
      // Persist cache after each successful chunk.
      await saveCache(locale, cache);
    }

    if (failedEntries.length) {
      await appendErrors(locale, failedEntries);
    }

    // Emit messages.<locale>.ts if we have full coverage in the cache.
    const enLeafPaths = leaves.map(([p]) => p);
    const hasAll = enLeafPaths.every((p) => p in cache);
    let outPath = null;
    if (hasAll) {
      // Build a complete flat map: cache values for each EN leaf in the
      // order EN defines them. Extra keys present in the cache but absent
      // from EN are dropped.
      const flat = {};
      for (const p of enLeafPaths) flat[p] = cache[p];
      outPath = await emitLocaleFile(locale, flat);
    } else {
      const missing = enLeafPaths.filter((p) => !(p in cache));
      console.warn(`  ${locale}: ${missing.length} string(s) still missing in cache; messages.${locale}.ts NOT regenerated.`);
      // Surface first few missing paths to aid debugging.
      if (opts.verbose) {
        for (const p of missing.slice(0, 5)) console.warn(`    missing: ${p}`);
        if (missing.length > 5) console.warn(`    … and ${missing.length - 5} more`);
      }
    }

    const cost = calcCost(inputTokens, outputTokens);
    const elapsedSec = (Date.now() - localeT0) / 1000;
    overallInputTokens += inputTokens;
    overallOutputTokens += outputTokens;
    overallCost += cost;
    overallSucceeded += stringsDone;
    overallFailed += stringsFailed;
    localeResults.set(locale, {
      stringsDone, stringsFailed, inputTokens, outputTokens, cost, elapsedSec, outPath,
    });

    console.log(
      `  ${locale} done: ${stringsDone} translated, ${stringsFailed} failed; ` +
      `in=${inputTokens.toLocaleString()} out=${outputTokens.toLocaleString()} ` +
      `cost=$${cost.toFixed(3)} elapsed=${elapsedSec.toFixed(1)}s`
    );
    if (outPath) console.log(`  wrote: ${outPath}`);
    console.log('');
  }

  // Final summary.
  const overallElapsedSec = (Date.now() - overallT0) / 1000;
  console.log('=== Summary ===');
  for (const locale of targetLangs) {
    const r = localeResults.get(locale);
    if (!r) continue;
    console.log(
      `  ${locale}: ${r.stringsDone} ok, ${r.stringsFailed} failed, ` +
      `in=${r.inputTokens.toLocaleString()} out=${r.outputTokens.toLocaleString()} ` +
      `$${r.cost.toFixed(3)} ${r.elapsedSec.toFixed(1)}s`
    );
  }
  console.log('');
  console.log(`Total: ${overallSucceeded} ok, ${overallFailed} failed`);
  console.log(`Input tokens:  ${overallInputTokens.toLocaleString()}`);
  console.log(`Output tokens: ${overallOutputTokens.toLocaleString()}`);
  console.log(`Total cost:    $${overallCost.toFixed(2)}`);
  console.log(`Wall clock:    ${overallElapsedSec.toFixed(1)}s`);

  const snap = getRateLimitSnapshot();
  if (snap) {
    console.log('');
    console.log('=== Rate-limit headroom (from first response) ===');
    console.log(`  Requests: ${snap.remainingRequests}/${snap.limitRequests} remaining (reset in ${snap.resetRequests})`);
    console.log(`  Tokens:   ${snap.remainingTokens}/${snap.limitTokens} remaining (reset in ${snap.resetTokens})`);
  }

  process.exit(overallFailed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal:', err?.message || err);
  if (err?.status) console.error('HTTP status:', err.status);
  process.exit(1);
});
