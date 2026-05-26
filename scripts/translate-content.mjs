#!/usr/bin/env node
/**
 * scripts/translate-content.mjs
 *
 * Self-hosted i18n: re-translates English MDX content into 10 target languages
 * using the OpenAI Chat Completions API (gpt-5.4).
 *
 * Authentication
 *   Reads the API key from the file at OPENAI_KEY_PATH (below).
 *   Override with OPENAI_API_KEY env var if needed.
 *
 *   PowerShell example:
 *     node scripts/translate-content.mjs --dry-run --lang ja
 *
 * Run --help for the full CLI surface. --dry-run estimates cost / runtime
 * without calling the API or writing files. The dry-run derives token usage
 * from the cost-calculator one-page benchmark ($0.09 to translate
 * sap-implementation-cost-calculator/en.mdx into Japanese).
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content');

// ── Constants ────────────────────────────────────────────────────────────────

const TARGET_LANGUAGES = [
  'ar', 'de', 'el', 'es', 'fr', 'it', 'ja', 'nl', 'pt', 'ru',
];

// OpenAI configuration
const OPENAI_KEY_PATH = 'C:\\Users\\noel_\\.config\\openai\\key.txt';
const MODEL_NAME = 'gpt-5.4';
// USD per million tokens
const MODEL_PRICING = { input: 2.50, output: 15.00 };
// Per-call timeouts. The first try uses DEFAULT; if it times out we escalate
// to EXTENDED once and retry. The default-run's only failure was a body call
// that exceeded the SDK's stock 10-min timeout on a 84KB source file.
const DEFAULT_TIMEOUT_MS = 600_000;   // 10 min — covers the ~5min p99 we saw
const EXTENDED_TIMEOUT_MS = 1_200_000; // 20 min — for retry after a timeout

// Body chunking. Files whose PREPROCESSED body exceeds BODY_CHUNK_THRESHOLD
// are split on H2 boundaries and translated chunk-by-chunk in parallel.
// Empirically GPT-5.4 timed out (even at 20-min EXTENDED) on the 83KB
// sap-modules body; the next-largest successful body was 58KB at 5 min.
// Chunking gives every page a uniform per-call latency.
const BODY_CHUNK_THRESHOLD = 40_000;
const TARGET_CHUNK_MAX_CHARS = 30_000;

// Token estimation ratios (dry-run only).
// Derived from the cost-calculator test: en.mdx (~15.1KB preprocessed
// source = body + frontmatter) → Japanese, $0.09 total observed.
//
// Back-solving against gpt-5.4 pricing ($2.50/M input, $15/M output):
//   ~5,500 input tokens × $2.50/M = $0.014 input cost
//   ~5,070 output tokens × $15/M ≈ $0.076 output cost   → $0.09 total
// → output ratio for Japanese ≈ 5,070 / 15,129 ≈ 0.34 tokens per source char.
//
// Languages cluster into two bands by output-token density:
//   high-density: ar, el, ja, ru   (CJK, Cyrillic, complex script — modern
//                                   tokenizers handle CJK well but still
//                                   emit ~0.3-0.4 tokens per source char)
//   normal:       de, es, fr, it, nl, pt   (Latin script close to English,
//                                           ~1.1-1.2x output char expansion
//                                           at ~0.20 tokens per source char)
const TOKENS_PER_INPUT_CHAR_EN = 0.30;  // English source → input tokens
const OUTPUT_TOKENS_PER_INPUT_CHAR_HIGH = 0.34;  // ar/el/ja/ru (test-derived)
const OUTPUT_TOKENS_PER_INPUT_CHAR_NORMAL = 0.20; // de/es/fr/it/nl/pt
const HIGH_DENSITY_LANGS = new Set(['ar', 'el', 'ja', 'ru']);
const SYSTEM_PROMPT_TOKENS_BODY = 700;  // approx tokens for the body system prompt
const SYSTEM_PROMPT_TOKENS_JSON = 250;  // approx tokens for the JSON system prompt

function getOutputTokensPerCharForLang(lang) {
  return HIGH_DENSITY_LANGS.has(lang)
    ? OUTPUT_TOKENS_PER_INPUT_CHAR_HIGH
    : OUTPUT_TOKENS_PER_INPUT_CHAR_NORMAL;
}

// Whole-word, case-sensitive matches. Wrapped with <span translate="no">
// before sending to the API, then unwrapped after translation so the term
// renders unchanged in the target language. GPT respects the marker when
// instructed to leave inner text unchanged.
//
// Note: deliberately excludes "FI", "CO", "MM", "SD", "PP", "QM", "PM" —
// they are common English fragments (co-founder, if I, summer, ...) that
// cause false positives. FICO / S/4HANA already cover the SAP context.
//
// Entries ending with "(?s)" allow an optional trailing 's' so plural forms
// (P-Users, S-Users) are also protected. The marker is stripped before the
// final regex is built.
const GLOSSARY = [
  'SAP Business Technology Platform',
  'Business Technology Platform',
  'Rise with SAP',
  'Grow with SAP',
  'SAP Business One',
  'SAP Activate',
  'Universal ID',
  'SuccessFactors',
  'NetSuite',
  'Salesforce',
  'Business One',
  'Workday',
  'S/4HANA',
  'S4HANA',
  'Concur',
  'Ariba',
  'Oracle',
  'Fiori',
  'S-User(?s)',
  'P-User(?s)',
  'RISE',
  'FICO',
  'ABAP',
  'BAPI',
  'BADI',
  'IDOC',
  'HANA',
  'ECC',
  'BTP',
  'SAP',
];

// MDX components are PascalCase, lowercase-hyphenated (stepper, compare-split,
// ...), or single-word lowercase from the known-tags allow-list below.
// Standard HTML tags (details, summary, a, span, h2, etc.) are NOT extracted
// — their inner text gets translated as expected. To add a new single-word
// MDX component, append it to KNOWN_MDX_SINGLE_WORD_TAGS.
const KNOWN_MDX_SINGLE_WORD_TAGS = ['stepper', 'callout'];
const MDX_TAG_RE = new RegExp(
  '<(' +
    KNOWN_MDX_SINGLE_WORD_TAGS.join('|') +
    '|[A-Z][A-Za-z0-9]*' +
    '|[a-z][a-z0-9]*-[a-z0-9-]+' +
  ')\\b([^>]*?)(\\/>|>([\\s\\S]*?)<\\/\\1\\s*>)',
  'g'
);

// Attribute names whose string values should be translated as separate
// text-format calls. Lowercase comparison.
const TRANSLATABLE_PROP_NAMES = new Set([
  'title', 'label', 'text', 'description', 'quote',
  'steps', 'bodies', 'left-label', 'left-points',
  'right-label', 'right-points', 'question', 'options',
  'source', 'heading', 'subtitle', 'caption',
]);

const FRONTMATTER_TRANSLATE_FIELDS = [
  'title', 'h1', 'metaTitle', 'metaDescription', 'excerpt', 'heroAlt',
];

const SITE_ORIGIN = 'https://noeldcosta.com';

// ── CLI parsing ──────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {
    dryRun: false, lang: null, slug: null, type: null,
    force: false, concurrency: 5, verbose: false, help: false,
  };
  const take = (i) => argv[i + 1];
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--force') args.force = true;
    else if (a === '--verbose' || a === '-v') args.verbose = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--lang') args.lang = take(i++);
    else if (a === '--slug') args.slug = take(i++);
    else if (a === '--type') args.type = take(i++);
    else if (a === '--concurrency') args.concurrency = parseInt(take(i++), 10);
    else if (a.startsWith('--lang=')) args.lang = a.slice(7);
    else if (a.startsWith('--slug=')) args.slug = a.slice(7);
    else if (a.startsWith('--type=')) args.type = a.slice(7);
    else if (a.startsWith('--concurrency=')) args.concurrency = parseInt(a.slice(14), 10);
  }
  return args;
}

function printHelp() {
  process.stdout.write(`
scripts/translate-content.mjs — Self-hosted i18n pipeline (OpenAI ${MODEL_NAME})

Re-translates content/{type}/{slug}/en.mdx into 10 target languages using
OpenAI's Chat Completions API.

Usage:
  node scripts/translate-content.mjs [options]

Options:
  --dry-run            Estimate tokens and cost; do not call API or write files.
  --lang <code>        Only the specified target language (default: all 10).
  --slug <slug>        Only the specified content slug (default: all).
  --type <posts|pages> Only the specified content type (default: both).
  --force              Overwrite existing target files (default: skip if present).
  --concurrency <n>    Parallel API calls (default: 5).
  --verbose            Per-file logging.
  --help               Show this help.

Authentication:
  Reads OPENAI_API_KEY env var if set, otherwise reads the key from:
  ${OPENAI_KEY_PATH}
  Never logs, prints, or persists the key.

Do-not-translate marker:
  Wrap verbatim content in <noTranslate>...</noTranslate> tags in the
  English MDX source. The wrapped content is preserved byte-for-byte
  across all target locales — use for attributed testimonial quotes,
  proper-noun client names, and any copyrighted content that must not
  be machine-translated. Re-running the script on a translated file is
  idempotent; the wrapper tags survive in the output so the marker is
  visible to future contributors and to subsequent re-translation runs.

Target languages: ${TARGET_LANGUAGES.join(', ')}
`);
}

// ── Content discovery ────────────────────────────────────────────────────────

async function discoverFiles({ type, slug }) {
  const types = type ? [type] : ['posts', 'pages'];
  const out = [];
  for (const t of types) {
    const baseDir = join(CONTENT_DIR, t);
    let entries;
    try {
      entries = await readdir(baseDir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      if (slug && ent.name !== slug) continue;
      const enPath = join(baseDir, ent.name, 'en.mdx');
      if (existsSync(enPath)) out.push({ type: t, slug: ent.name, enPath });
    }
  }
  return out;
}

// ── Placeholder store and preprocessing ──────────────────────────────────────

function createStore() {
  return {
    codeBlocks: [],
    components: [],          // { tag, original, rendered }
    componentStrings: [],    // { compIdx, propName, segIdx, segCount, original, translated }
    noTranslate: [],         // verbatim content from <noTranslate>...</noTranslate>
  };
}

// Extract <noTranslate>...</noTranslate> blocks first, before any other
// pass, so verbatim content (real attributed testimonial quotes, proper-
// noun client names, copyrighted material) survives translation untouched
// regardless of target locale. The inner content is stored verbatim and
// the wrapper is replaced with a sentinel comment; postprocess re-injects
// the original text — including the original wrapper tags themselves —
// so re-running the translation pipeline on a translated MDX file does
// not double-process the marker.
//
// Block 6c will route hardcoded UI string externalization through this
// mechanism for testimonial bodies and case-study quotes. See
// _docs/audits/i18n-strings-audit-2026-05-26.md for the list of files
// whose attributed-quote sections must use this marker.
const NO_TRANSLATE_RE = /<noTranslate>([\s\S]*?)<\/noTranslate>/g;

function extractNoTranslate(body, store) {
  return body.replace(NO_TRANSLATE_RE, (match) => {
    const idx = store.noTranslate.length;
    store.noTranslate.push(match);
    return `<!--NO_TRANSLATE_${idx}-->`;
  });
}

function restoreNoTranslate(body, store) {
  return body.replace(/<!--NO_TRANSLATE_(\d+)-->/g,
    (_m, idx) => store.noTranslate[Number(idx)] ?? _m);
}

function extractCodeBlocks(body, store) {
  return body.replace(/```[\s\S]*?```/g, (match) => {
    const idx = store.codeBlocks.length;
    store.codeBlocks.push(match);
    return `<!--CODE_BLOCK_${idx}-->`;
  });
}

function extractMdxComponents(body, store) {
  return body.replace(MDX_TAG_RE, (match, tag) => {
    const idx = store.components.length;
    store.components.push({ tag, original: match, rendered: match });
    extractTranslatableProps(match, idx, store);
    return `<!--MDX_COMPONENT_${idx}-->`;
  });
}

function extractTranslatableProps(componentSrc, compIdx, store) {
  const attrRe = /([A-Za-z][A-Za-z0-9_-]*)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = attrRe.exec(componentSrc)) !== null) {
    const [, name, value] = m;
    if (!TRANSLATABLE_PROP_NAMES.has(name.toLowerCase())) continue;
    // Pipe-delimited prop values (used by <stepper steps="a|b|c">) are
    // translated segment-by-segment so segment boundaries don't drift.
    const segments = value.includes('|') ? value.split('|') : [value];
    segments.forEach((seg, segIdx) => {
      if (!seg.trim()) return;
      store.componentStrings.push({
        compIdx, propName: name, segIdx,
        segCount: segments.length, original: seg,
      });
    });
  }
}

function convertMarkdownHeadingsToHtml(body) {
  // # … ###### at the start of a line → <hN data-md-h="N">text</hN>. Kept
  // from the NMT pipeline because it makes the heading structure explicit
  // for the model and survives round-tripping unambiguously.
  return body.replace(
    /^(#{1,6})[ \t]+(.+?)[ \t]*$/gm,
    (_m, hashes, text) => {
      const lvl = hashes.length;
      return `<h${lvl} data-md-h="${lvl}">${text}</h${lvl}>`;
    }
  );
}

function convertHtmlHeadingsToMarkdown(body) {
  // Only convert the headings we tagged; authored <h2> stays untouched.
  return body.replace(
    /<h([1-6])\s+data-md-h="\1">([\s\S]*?)<\/h\1>/g,
    (_m, lvl, text) => `${'#'.repeat(Number(lvl))} ${text.trim()}`
  );
}

function convertMarkdownImagesToHtml(body) {
  // ![alt](url "title") → <img src="url" alt="alt" title="title" data-md-image="1"/>
  // Done before link conversion so [![alt](img)](link) round-trips cleanly.
  return body.replace(
    /!\[((?:[^\[\]\\]|\\.)*?)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_m, alt, url, title) => {
      const t = title ? ` title="${escapeAttr(title)}"` : '';
      return `<img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}"${t} data-md-image="1"/>`;
    }
  );
}

function convertHtmlImagesToMarkdown(body) {
  // Only convert the images we marked. Authored <img> tags are left alone.
  return body.replace(
    /<img\s+src="([^"]*)"\s+alt="([^"]*)"(?:\s+title="([^"]*)")?\s+data-md-image="1"\s*\/>/g,
    (_m, url, alt, title) => {
      const t = title ? ` "${unescapeAttr(title)}"` : '';
      return `![${unescapeAttr(alt)}](${unescapeAttr(url)}${t})`;
    }
  );
}

function convertMarkdownLinksToHtml(body) {
  // [text](url "title") → <a href="url" title="title" data-md-link="1">text</a>
  // Image syntax (![alt](url)) has already been converted to <img>, so the
  // negative lookbehind below just guards against any stray `!` that wasn't
  // part of an image. Nested image-links like [<img/>](url) match cleanly
  // because the link-text class allows angle brackets.
  return body.replace(
    /(?<!!)\[((?:[^\[\]\\]|\\.)*?)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_m, text, url, title) => {
      const t = title ? ` title="${escapeAttr(title)}"` : '';
      return `<a href="${escapeAttr(url)}"${t} data-md-link="1">${text}</a>`;
    }
  );
}

function convertHtmlLinksToMarkdown(body) {
  // Only convert the ones we marked.
  return body.replace(
    /<a\s+href="([^"]*)"(?:\s+title="([^"]*)")?\s+data-md-link="1">([\s\S]*?)<\/a>/g,
    (_m, url, title, text) => {
      const t = title ? ` "${unescapeAttr(title)}"` : '';
      return `[${text}](${unescapeAttr(url)}${t})`;
    }
  );
}

function escapeAttr(s) { return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }
function unescapeAttr(s) { return s.replace(/&quot;/g, '"').replace(/&amp;/g, '&'); }

function wrapInlineCode(body) {
  // Wrap `code` (single backtick) including the backticks so markdown
  // syntax survives translation as opaque text.
  return body.replace(/`([^`\n]+)`/g, (m) => `<span translate="no">${m}</span>`);
}

function wrapGlossary(body) {
  // Build one regex matching any glossary term, longest-first. Terms ending
  // with the literal marker "(?s)" become "term(?:s)?" so the plural form is
  // also protected (e.g. P-User → P-User and P-Users).
  const terms = [...GLOSSARY].sort((a, b) => b.length - a.length);
  const escaped = terms.map((t) => {
    const pluralOpt = t.endsWith('(?s)');
    const base = pluralOpt ? t.slice(0, -4) : t;
    const escapedBase = base.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
    return pluralOpt ? `${escapedBase}(?:s)?` : escapedBase;
  });
  const re = new RegExp(`(?<![A-Za-z0-9])(?:${escaped.join('|')})(?![A-Za-z0-9])`, 'g');

  // Split body by existing <span translate="no">…</span> so we don't nest.
  const spanRe = /<span translate="no">[\s\S]*?<\/span>/g;
  const parts = [];
  let last = 0;
  let m;
  while ((m = spanRe.exec(body)) !== null) {
    if (m.index > last) parts.push({ kind: 'text', s: body.slice(last, m.index) });
    parts.push({ kind: 'span', s: m[0] });
    last = m.index + m[0].length;
  }
  if (last < body.length) parts.push({ kind: 'text', s: body.slice(last) });

  return parts
    .map((p) => p.kind === 'text'
      ? p.s.replace(re, (t) => `<span translate="no">${t}</span>`)
      : p.s)
    .join('');
}

function preprocessBody(body) {
  const store = createStore();
  let s = body;
  // noTranslate runs FIRST so any code blocks, MDX components, or
  // glossary terms inside the wrapped region are protected as one
  // opaque unit rather than re-extracted and processed individually.
  s = extractNoTranslate(s, store);
  s = extractCodeBlocks(s, store);
  s = extractMdxComponents(s, store);
  s = convertMarkdownHeadingsToHtml(s);  // before links so heading text with [link](url) works
  s = convertMarkdownImagesToHtml(s);    // before links so [![alt](img)](link) works
  s = convertMarkdownLinksToHtml(s);
  s = wrapInlineCode(s);
  s = wrapGlossary(s);
  return { preprocessed: s, store };
}

// ── Body chunking (large pages only) ────────────────────────────────────────
// Splits a preprocessed body on <h2> boundaries (the markdown-to-HTML pass
// converts every "## " heading into <h2 data-md-h="2">…</h2>). Returns a
// list of chunks where each chunk is a contiguous byte slice of the body, so
// concatenating the translated chunks reproduces the body's structure.
//
// Packing: consecutive H2 sections are merged into the same chunk while the
// running total stays under TARGET_CHUNK_MAX_CHARS. A single H2 section that
// exceeds the cap is kept whole rather than split further — splitting inside
// a section risks orphaning glossary spans or MDX placeholders.
function splitBodyOnH2(preprocessed) {
  const h2Re = /<h2 data-md-h="2">/g;
  const indices = [];
  let m;
  while ((m = h2Re.exec(preprocessed)) !== null) indices.push(m.index);
  if (indices.length === 0) return [preprocessed];

  const sections = [];
  // Any intro content before the first H2 is its own section.
  if (indices[0] > 0) sections.push(preprocessed.slice(0, indices[0]));
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i];
    const end = i + 1 < indices.length ? indices[i + 1] : preprocessed.length;
    sections.push(preprocessed.slice(start, end));
  }
  return sections;
}

function packChunks(sections, maxChars) {
  if (sections.length <= 1) return sections;
  const chunks = [];
  let cur = '';
  for (const sec of sections) {
    if (cur && cur.length + sec.length > maxChars) {
      chunks.push(cur);
      cur = sec;
    } else {
      cur += sec;
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

function buildBodyChunks(preprocessed) {
  if (preprocessed.length <= BODY_CHUNK_THRESHOLD) return [preprocessed];
  const sections = splitBodyOnH2(preprocessed);
  return packChunks(sections, TARGET_CHUNK_MAX_CHARS);
}

// ── Postprocessing ───────────────────────────────────────────────────────────

function unwrapTranslateNoSpans(body) {
  return body.replace(/<span translate="no">([\s\S]*?)<\/span>/g, '$1');
}

function restoreMdxComponents(body, store) {
  const byComp = new Map();
  for (const item of store.componentStrings) {
    if (!byComp.has(item.compIdx)) byComp.set(item.compIdx, []);
    byComp.get(item.compIdx).push(item);
  }
  for (let i = 0; i < store.components.length; i++) {
    const items = byComp.get(i) || [];
    let src = store.components[i].original;
    const byProp = new Map();
    for (const it of items) {
      if (!byProp.has(it.propName)) byProp.set(it.propName, []);
      byProp.get(it.propName).push(it);
    }
    for (const [propName, list] of byProp) {
      list.sort((a, b) => a.segIdx - b.segIdx);
      const value = list.map((it) => it.translated ?? it.original).join('|');
      const re = new RegExp(`(${escapeRegex(propName)}\\s*=\\s*")[^"]*(")`);
      src = src.replace(re, (_m, a, b) => `${a}${escapeForAttr(value)}${b}`);
    }
    store.components[i].rendered = src;
  }
  return body.replace(/<!--MDX_COMPONENT_(\d+)-->/g,
    (_m, idx) => store.components[Number(idx)]?.rendered ?? _m);
}

function restoreCodeBlocks(body, store) {
  return body.replace(/<!--CODE_BLOCK_(\d+)-->/g,
    (_m, idx) => store.codeBlocks[Number(idx)] ?? _m);
}

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function escapeForAttr(s) { return s.replace(/"/g, '&quot;'); }

// ── Post-translation glossary deduplication ─────────────────────────────────
// Kept as a safety net from the Google NMT pipeline. GPT translations
// generally don't produce these artifacts, so dedupCount in the summary
// should typically be 0; non-zero means a model output is worth inspecting.
const GLOSSARY_DEDUP_TERMS = [
  'Universal ID',
  'SuccessFactors',
  'Salesforce',
  'S/4HANA',
  'NetSuite',
  'Workday',
  'Concur',
  'Oracle',
  'FICO',
  'ABAP',
  'Fiori',
  'Ariba',
  'RISE',
  'BTP',
  'SAP',
];

function deduplicateGlossary(body) {
  let count = 0;
  let s = body;
  for (const term of GLOSSARY_DEDUP_TERMS) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
    const re = new RegExp(
      `(?<![A-Za-z0-9])(${escaped}[.,;:\\s]{0,5})(?:${escaped}[.,;:\\s]{0,5})+(?![A-Za-z0-9])`,
      'g'
    );
    s = s.replace(re, (_m, first) => {
      count++;
      return first;
    });
  }
  return { body: s, count };
}

function postprocessBody(translated, store) {
  let s = translated;
  s = unwrapTranslateNoSpans(s);
  s = convertHtmlLinksToMarkdown(s);
  s = convertHtmlImagesToMarkdown(s);
  s = convertHtmlHeadingsToMarkdown(s);
  s = restoreMdxComponents(s, store);
  s = restoreCodeBlocks(s, store);
  // noTranslate restoration runs LAST so the verbatim block (which may
  // itself contain code blocks or MDX components) re-enters the body
  // unchanged. The wrapper tags `<noTranslate>...</noTranslate>` are
  // preserved in the translated file — they're harmless to MDX rendering
  // (the parser treats unknown tags as native HTML) and they make the
  // file idempotent under repeated translation runs.
  s = restoreNoTranslate(s, store);
  return s;
}

// ── Frontmatter handling ─────────────────────────────────────────────────────

function collectFrontmatterStrings(fm) {
  const out = []; // { path: [keys...], value }
  for (const key of FRONTMATTER_TRANSLATE_FIELDS) {
    if (typeof fm[key] === 'string' && fm[key].trim()) {
      out.push({ path: [key], value: fm[key] });
    }
  }
  if (fm.pullQuote) {
    if (typeof fm.pullQuote === 'string') {
      out.push({ path: ['pullQuote'], value: fm.pullQuote });
    } else if (typeof fm.pullQuote === 'object' && typeof fm.pullQuote.text === 'string') {
      out.push({ path: ['pullQuote', 'text'], value: fm.pullQuote.text });
    }
  }
  if (Array.isArray(fm.keyTakeaways)) {
    fm.keyTakeaways.forEach((item, i) => {
      if (typeof item === 'string' && item.trim()) {
        out.push({ path: ['keyTakeaways', i], value: item });
      }
    });
  }
  if (Array.isArray(fm.mentions)) {
    fm.mentions.forEach((item, i) => {
      if (item && typeof item === 'object' && typeof item.text === 'string') {
        out.push({ path: ['mentions', i, 'text'], value: item.text });
      }
      // Mentions stored as bare strings (e.g. "SAP Universal ID") are proper
      // product names and are left unchanged in every locale.
    });
  }
  return out;
}

function setAtPath(obj, path, value) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    if (cur[k] === undefined) cur[k] = (typeof path[i + 1] === 'number') ? [] : {};
    cur = cur[k];
  }
  cur[path[path.length - 1]] = value;
}

function buildOutputFrontmatter(srcFm, translatedEntries, lang) {
  // Start from a deep-ish clone so we don't mutate the source object.
  const out = JSON.parse(JSON.stringify(srcFm));
  for (const e of translatedEntries) setAtPath(out, e.path, e.value);
  out.locale = lang;
  out.translatedFrom = 'en';
  out.translationSource = `openai-${MODEL_NAME}`;
  out.translationDate = new Date().toISOString();
  out.canonicalUrl = `${SITE_ORIGIN}/${lang}/${srcFm.slug}/`;
  return out;
}

function stringifyMdx(body, fm) {
  const yamlText = yaml.dump(fm, { lineWidth: -1, noRefs: true, sortKeys: false });
  return `---\n${yamlText}---\n\n${body}`;
}

// ── OpenAI client and prompts ────────────────────────────────────────────────

const LANG_NAMES = {
  ar: 'Arabic', de: 'German', el: 'Greek', es: 'Spanish',
  fr: 'French', it: 'Italian', ja: 'Japanese', nl: 'Dutch',
  pt: 'Portuguese', ru: 'Russian',
};

const LANG_REGISTER = {
  ja: 'Use polite Japanese (ですます調) consistently throughout body text. Do NOT mix in plain form (だ・である).',
  es: 'Use the standard professional register. Prefer "usted" only when directly addressing the reader; default is impersonal/first-person.',
  fr: 'Use the standard professional register (formal "vous" where addressing the reader; otherwise impersonal/first-person).',
  de: 'Use the standard professional register ("Sie" where addressing the reader).',
  it: 'Use the standard professional register (formal "Lei" where addressing the reader).',
  pt: 'Use the standard professional register (formal "você" / impersonal where addressing the reader).',
  nl: 'Use the standard professional register (formal "u" where addressing the reader).',
  ru: 'Use the standard professional register (formal "вы" where addressing the reader).',
  ar: 'Use Modern Standard Arabic (فصحى) in a professional register.',
  el: 'Use the standard professional register.',
};

function loadApiKey() {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) {
    return process.env.OPENAI_API_KEY.trim();
  }
  const raw = readFileSync(OPENAI_KEY_PATH, 'utf8');
  const key = raw.trim();
  if (!key) throw new Error(`Key file at ${OPENAI_KEY_PATH} is empty.`);
  return key;
}

async function loadOpenAiClient() {
  const apiKey = loadApiKey();
  const { default: OpenAI } = await import('openai');
  // Client-level timeout sets the SDK's per-request default; can be
  // overridden per-call via the second arg to .create({...}, { timeout }).
  return new OpenAI({ apiKey, timeout: DEFAULT_TIMEOUT_MS });
}

// Rate-limit headers from the first successful body response. The OpenAI
// API returns x-ratelimit-* on every response; capturing once is enough to
// answer "how much headroom do we have?" without per-call noise.
let rateLimitSnapshot = null;

function captureRateLimitHeaders(rawResponse) {
  if (rateLimitSnapshot || !rawResponse?.headers) return;
  const h = rawResponse.headers;
  const get = (k) => (typeof h.get === 'function' ? h.get(k) : h[k]) || null;
  rateLimitSnapshot = {
    limitRequests: get('x-ratelimit-limit-requests'),
    remainingRequests: get('x-ratelimit-remaining-requests'),
    resetRequests: get('x-ratelimit-reset-requests'),
    limitTokens: get('x-ratelimit-limit-tokens'),
    remainingTokens: get('x-ratelimit-remaining-tokens'),
    resetTokens: get('x-ratelimit-reset-tokens'),
  };
}

function isTimeoutError(err) {
  if (!err) return false;
  const name = err?.name || err?.constructor?.name || '';
  if (name === 'APIConnectionTimeoutError') return true;
  const msg = String(err?.message || err || '').toLowerCase();
  return /timed?\s*out|timeout/.test(msg);
}

function buildBodySystemPrompt(lang) {
  const langName = LANG_NAMES[lang] || lang;
  const register = LANG_REGISTER[lang] || 'Use the standard professional register.';
  return [
    'You are a senior professional translator specializing in B2B technology content.',
    `You translate English business writing into natural, native-quality ${langName}.`,
    '',
    'Source context: the text is from the website of an independent senior SAP consultant',
    "(Noel D'Costa). His audience is enterprise CIOs, CFOs, and programme directors at",
    '$100M–$5B companies who are evaluating SAP S/4HANA implementations.',
    '',
    'Tone:',
    '- Professional but conversational. Direct. First-person ("I built", "I have tracked").',
    '- Match the register a senior consultant would use writing to a peer CIO.',
    `- ${register}`,
    "- Avoid marketing/buzzword phrasing. Avoid over-formal corporate ${langName}.",
    "- Keep the writer's slightly contrarian, opinionated voice. Short sentences are good.",
    '',
    'STRICT preservation rules (violations break the file):',
    '1. Preserve every HTML tag exactly, including attribute names and values.',
    '   This includes <h1>..<h6>, <a>, <img>, <span>, <details>, <summary>, <br>, etc.',
    '   Translate only the visible text content between tags.',
    '2. Inside any <span translate="no">...</span>, do NOT translate the inner text.',
    '   Keep the original English/Latin script verbatim. Keep the <span> tags.',
    '3. Preserve every <!--CODE_BLOCK_NN--> and <!--MDX_COMPONENT_NN--> placeholder',
    '   exactly as written. These are markers that will be restored later.',
    '4. Preserve every URL inside href="..." and src="..." attributes unchanged.',
    '5. Preserve markdown table syntax: pipe separators (|), header rows, and the',
    '   |---|---|---| alignment row. Translate cell text only.',
    '6. Preserve paragraph breaks (blank lines), **bold** asterisks, numbered list',
    '   markers (1., 2., 3.), and the data-md-h / data-md-link / data-md-image',
    '   marker attributes inside tags.',
    '7. SAP product names, module codes, and version numbers always stay in Latin',
    '   script: SAP, S/4HANA, BTP, RISE, RISE with SAP, GROW with SAP, Fiori,',
    '   Ariba, SuccessFactors, Concur, ABAP, FICO, FI, CO, MM, SD, PP, QM, PM,',
    '   HCM, AMS, FUE, CDS, CPI, Activate, Enable Now, Migration Cockpit.',
    '   (Most are already wrapped in <span translate="no">; do not unwrap.)',
    '8. Numbers, currency amounts ($150K, $2M, 22%), and ranges stay numeric.',
    '   Currency stays in dollars unless the source converts it.',
    '',
    'DOMAIN-SPECIFIC translation guidance (from prior quality review):',
    "- In SAP implementation context, the noun 'change' or the phrase 'change management'",
    "  must always be translated as the full management term in the target language",
    `  (e.g., チェンジマネジメント in Japanese, gestión del cambio in Spanish,`,
    "  Change-Management in German, gestion du changement in French, etc.).",
    "  Never render it as a bare single word ('change', 'cambio', 'Wechsel', 'changement')",
    "  in this context — that reads as an unfinished translation.",
    "- Preserve proper product names like 'RISE with SAP' and 'GROW with SAP' verbatim",
    "  as brand names. Do not translate, transliterate, or paraphrase them.",
    "- Cost ranges (e.g., $500K-$2M, $2M-$10M+) in this content refer to PROJECT",
    "  IMPLEMENTATION COST, not company revenue. Translate the surrounding language",
    "  accordingly so the reader is not misled.",
    '',
    'Output: return ONLY the translated content. No preamble. No closing remarks.',
    'No markdown code fence wrapping the whole reply. Begin output at the first',
    'character of translated content and end at the last.',
  ].join('\n');
}

function buildBodyUserPrompt(body, lang, chunkInfo) {
  const langName = LANG_NAMES[lang] || lang;
  if (chunkInfo) {
    const { index, count, pageTitle } = chunkInfo;
    return [
      `This is chunk ${index} of ${count} for the page titled "${pageTitle}".`,
      'Maintain the same tone and terminology consistency as if you were',
      'translating the entire document. Translate the following section into',
      `${langName}. Follow every rule above.`,
      '',
      '---BEGIN CONTENT---',
      body,
      '---END CONTENT---',
    ].join('\n');
  }
  return `Translate the following content into ${langName}. Follow every rule above.\n\n---BEGIN CONTENT---\n${body}\n---END CONTENT---`;
}

function buildJsonSystemPrompt(lang, kind) {
  const langName = LANG_NAMES[lang] || lang;
  const register = LANG_REGISTER[lang] || 'Use the standard professional register.';
  const kindNote = kind === 'frontmatter'
    ? 'Length: keep titles roughly the same character budget as the English source (metaTitle <60 chars where possible, metaDescription <160 chars).'
    : 'These are short MDX component prop strings (button labels, step titles, etc.). Keep them concise.';
  return [
    `You translate short metadata strings for a senior SAP consultant's website`,
    `from English into natural, native-quality ${langName}.`,
    '',
    `Tone: professional, direct, first-person where applicable. ${register}`,
    'Avoid marketing buzzwords. SAP product names stay in Latin script (SAP, S/4HANA,',
    'BTP, RISE, Ariba, SuccessFactors, Fiori, ABAP, FICO, CIO, CFO, etc.).',
    "Preserve 'RISE with SAP' and 'GROW with SAP' verbatim as brand names.",
    `In this context, 'change' / 'change management' always translates to the full`,
    `management term in ${langName}, never a bare single word.`,
    '',
    kindNote,
    '',
    'Input format: a JSON array of English strings.',
    'Output format: a JSON object {"translations": [...]} with the same number of',
    'strings, in the same order. Return JSON only.',
  ].join('\n');
}

async function callBodyTranslate(client, model, lang, body, timeoutMs, chunkInfo) {
  const t0 = Date.now();
  const reqOpts = timeoutMs ? { timeout: timeoutMs } : undefined;
  const { data: res, response } = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: buildBodySystemPrompt(lang) },
      { role: 'user', content: buildBodyUserPrompt(body, lang, chunkInfo) },
    ],
    temperature: 0.3,
  }, reqOpts).withResponse();
  captureRateLimitHeaders(response);
  const elapsedMs = Date.now() - t0;
  const text = res.choices?.[0]?.message?.content ?? '';
  const usage = res.usage || {};
  return {
    text: text.trim(),
    promptTokens: usage.prompt_tokens || 0,
    completionTokens: usage.completion_tokens || 0,
    elapsedMs,
  };
}

async function callJsonTranslate(client, model, lang, strings, kind, timeoutMs) {
  const t0 = Date.now();
  const reqOpts = timeoutMs ? { timeout: timeoutMs } : undefined;
  const res = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: buildJsonSystemPrompt(lang, kind) },
      { role: 'user', content: JSON.stringify(strings) },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  }, reqOpts);
  const elapsedMs = Date.now() - t0;
  const raw = res.choices?.[0]?.message?.content ?? '{}';
  let parsed;
  try { parsed = JSON.parse(raw); } catch (e) {
    throw new Error(`${kind} response was not valid JSON: ${raw.slice(0, 200)}`);
  }
  const arr = Array.isArray(parsed.translations) ? parsed.translations
            : Array.isArray(parsed.items) ? parsed.items
            : Array.isArray(parsed) ? parsed
            : null;
  if (!arr || arr.length !== strings.length) {
    throw new Error(`${kind} response had ${arr?.length ?? 'no'} items; expected ${strings.length}.`);
  }
  const usage = res.usage || {};
  return {
    translations: arr,
    promptTokens: usage.prompt_tokens || 0,
    completionTokens: usage.completion_tokens || 0,
    elapsedMs,
  };
}

// Unified retry: factory takes an optional timeoutMs (undefined → SDK default).
// First attempt uses no override (DEFAULT_TIMEOUT_MS via client config).
// On a TIMEOUT specifically, retry once with EXTENDED_TIMEOUT_MS — logged so we
// can see in the run log which files needed it.
// On transient HTTP errors (429/5xx, ECONN*), exponential backoff up to 3 tries.
async function withRetry(label, requestFactory) {
  let lastErr;
  let didTimeoutEscalation = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    const timeoutMs = didTimeoutEscalation ? EXTENDED_TIMEOUT_MS : undefined;
    try { return await requestFactory(timeoutMs); }
    catch (err) {
      lastErr = err;
      if (isTimeoutError(err) && !didTimeoutEscalation) {
        console.warn(`  TIMEOUT-RETRY ${label}: extending timeout to ${EXTENDED_TIMEOUT_MS / 1000}s and retrying once`);
        didTimeoutEscalation = true;
        continue;  // immediate retry, no backoff
      }
      const status = err?.status || err?.code;
      const transient = status === 429 || status === 500 || status === 502 ||
        status === 503 || status === 504 ||
        /ECONN|ENOTFOUND|EAI_AGAIN|socket hang up/i.test(String(err?.code || err?.message || ''));
      if (transient && attempt < 2) {
        const wait = (1 << attempt) * 2000 + Math.floor(Math.random() * 1000);
        console.warn(`  RETRY ${label}: ${status || err?.message || 'transient'} — waiting ${wait}ms (attempt ${attempt + 2}/3)`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

// ── Per-file processing ──────────────────────────────────────────────────────

function calcCost(promptTokens, completionTokens) {
  return (promptTokens / 1_000_000) * MODEL_PRICING.input +
         (completionTokens / 1_000_000) * MODEL_PRICING.output;
}

function estimateTokens(bodyChars, fmCharSum, compCharSum, lang) {
  const outRatio = getOutputTokensPerCharForLang(lang);
  const inputBody = SYSTEM_PROMPT_TOKENS_BODY + Math.ceil(bodyChars * TOKENS_PER_INPUT_CHAR_EN);
  const outputBody = Math.ceil(bodyChars * outRatio);
  const inputFm = fmCharSum > 0
    ? SYSTEM_PROMPT_TOKENS_JSON + Math.ceil(fmCharSum * TOKENS_PER_INPUT_CHAR_EN)
    : 0;
  const outputFm = Math.ceil(fmCharSum * outRatio);
  const inputComp = compCharSum > 0
    ? SYSTEM_PROMPT_TOKENS_JSON + Math.ceil(compCharSum * TOKENS_PER_INPUT_CHAR_EN)
    : 0;
  const outputComp = Math.ceil(compCharSum * outRatio);
  return {
    promptTokens: inputBody + inputFm + inputComp,
    completionTokens: outputBody + outputFm + outputComp,
  };
}

async function processFile(source, lang, opts, client) {
  const { type, slug, enPath } = source;
  const src = await readFile(enPath, 'utf8');
  const parsed = matter(src);
  const { preprocessed, store } = preprocessBody(parsed.content);
  const fmStrings = collectFrontmatterStrings(parsed.data);
  const compStrings = store.componentStrings;

  const charsBody = preprocessed.length;
  const charsFm = fmStrings.reduce((s, x) => s + x.value.length, 0);
  const charsComps = compStrings.reduce((s, x) => s + x.original.length, 0);
  const totalChars = charsBody + charsFm + charsComps;

  const outPath = join(dirname(enPath), `${lang}.mdx`);
  const exists = existsSync(outPath);

  if (opts.dryRun) {
    const est = estimateTokens(charsBody, charsFm, charsComps, lang);
    return {
      ok: true, dryRun: true, type, slug, lang, totalChars,
      charsBody, charsFm, charsComps,
      codeBlocks: store.codeBlocks.length,
      components: store.components.length,
      componentProps: compStrings.length,
      estPromptTokens: est.promptTokens,
      estCompletionTokens: est.completionTokens,
      estCost: calcCost(est.promptTokens, est.completionTokens),
      exists, outPath,
    };
  }

  if (exists && !opts.force) {
    return { ok: true, skipped: true, reason: 'exists', type, slug, lang, totalChars, outPath };
  }

  const t0 = Date.now();

  // Chunk the body if it exceeds the threshold; otherwise single-call.
  const chunks = buildBodyChunks(preprocessed);
  const isChunked = chunks.length > 1;
  if (isChunked) {
    console.log(`  CHUNK ${slug}/${lang}: body ${preprocessed.length} chars → ${chunks.length} chunks ` +
      `(sizes: ${chunks.map((c) => c.length).join(', ')})`);
  }
  const pageTitle = parsed.data?.title || slug;

  const bodyP = isChunked
    ? Promise.all(chunks.map((chunk, i) =>
        withRetry(
          `body ${slug}/${lang} chunk ${i + 1}/${chunks.length}`,
          (timeoutMs) => callBodyTranslate(
            client, MODEL_NAME, lang, chunk, timeoutMs,
            { index: i + 1, count: chunks.length, pageTitle }
          )
        )
      )).then((results) => ({
        // Trim each chunk's text and rejoin with a paragraph break. Without
        // this, the H2 marker that begins chunk N+1 gets concatenated to the
        // last line of chunk N (because the model strips trailing whitespace),
        // turning "## Heading" into "...prev line## Heading" — visually fine
        // characters-wise but breaks markdown's "H2 must start a line" rule.
        // Splits are always on H2 boundaries, so the paragraph break is the
        // correct separator the source already had between those sections.
        text: results.map((r) => r.text.trim()).join('\n\n'),
        promptTokens: results.reduce((s, r) => s + r.promptTokens, 0),
        completionTokens: results.reduce((s, r) => s + r.completionTokens, 0),
        elapsedMs: Math.max(...results.map((r) => r.elapsedMs)),
        chunkCount: chunks.length,
      }))
    : withRetry(
        `body ${slug}/${lang}`,
        (timeoutMs) => callBodyTranslate(client, MODEL_NAME, lang, preprocessed, timeoutMs)
      );

  const fmP = fmStrings.length
    ? withRetry(
        `fm ${slug}/${lang}`,
        (timeoutMs) => callJsonTranslate(client, MODEL_NAME, lang, fmStrings.map((x) => x.value), 'frontmatter', timeoutMs)
      )
    : Promise.resolve({ translations: [], promptTokens: 0, completionTokens: 0, elapsedMs: 0 });
  const compP = compStrings.length
    ? withRetry(
        `comp ${slug}/${lang}`,
        (timeoutMs) => callJsonTranslate(client, MODEL_NAME, lang, compStrings.map((x) => x.original), 'component-props', timeoutMs)
      )
    : Promise.resolve({ translations: [], promptTokens: 0, completionTokens: 0, elapsedMs: 0 });

  const [bodyR, fmR, compR] = await Promise.all([bodyP, fmP, compP]);

  compR.translations.forEach((v, i) => { compStrings[i].translated = v; });
  const translatedFm = fmStrings.map((x, i) => ({ path: x.path, value: fmR.translations[i] }));

  const postprocessed = postprocessBody(bodyR.text, store);
  const { body: finalBody, count: dedupCount } = deduplicateGlossary(postprocessed);
  const newFm = buildOutputFrontmatter(parsed.data, translatedFm, lang);

  const output = stringifyMdx(finalBody, newFm);
  await writeFile(outPath, output, 'utf8');

  const promptTokens = bodyR.promptTokens + fmR.promptTokens + compR.promptTokens;
  const completionTokens = bodyR.completionTokens + fmR.completionTokens + compR.completionTokens;

  return {
    ok: true, type, slug, lang, totalChars, outPath, dedupCount,
    promptTokens, completionTokens,
    cost: calcCost(promptTokens, completionTokens),
    elapsedMs: Date.now() - t0,
    chunkCount: bodyR.chunkCount || 1,
  };
}

// ── Concurrency helper ───────────────────────────────────────────────────────

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

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) { printHelp(); process.exit(0); }

  if (!opts.dryRun) {
    try { loadApiKey(); }
    catch (err) {
      console.error(`Error: could not load OpenAI API key (${err.message}).`);
      console.error(`Expected at ${OPENAI_KEY_PATH} or in OPENAI_API_KEY env var.`);
      process.exit(1);
    }
  }

  // --lang accepts a single code ("ja") or a comma-separated list
  // ("ar,de,fr") so a single invocation can target a subset of languages.
  const targetLangs = opts.lang
    ? opts.lang.split(',').map((s) => s.trim()).filter(Boolean)
    : TARGET_LANGUAGES;
  for (const l of targetLangs) {
    if (!TARGET_LANGUAGES.includes(l)) {
      console.error(`Error: unknown target language "${l}".`);
      console.error(`Supported: ${TARGET_LANGUAGES.join(', ')}`);
      process.exit(1);
    }
  }
  if (opts.type && !['posts', 'pages'].includes(opts.type)) {
    console.error('Error: --type must be "posts" or "pages".');
    process.exit(1);
  }

  const sources = await discoverFiles({ type: opts.type, slug: opts.slug });
  if (sources.length === 0) {
    console.error('No matching en.mdx files found.');
    process.exit(1);
  }

  console.log(`Sources: ${sources.length} en.mdx file(s) ` +
    `(${opts.type ?? 'posts+pages'}${opts.slug ? `, slug=${opts.slug}` : ''})`);
  console.log(`Targets: ${targetLangs.join(', ')}`);
  console.log(`Model:   ${MODEL_NAME} ($${MODEL_PRICING.input}/M input, $${MODEL_PRICING.output}/M output)`);
  console.log(`Mode:    ${opts.dryRun ? 'DRY-RUN (no API calls, no writes)' : 'LIVE'}`);
  console.log('');

  const jobs = [];
  for (const s of sources) for (const lang of targetLangs) jobs.push({ source: s, lang });

  const client = opts.dryRun ? null : await loadOpenAiClient();

  const t0 = Date.now();
  let succeeded = 0, failed = 0, skipped = 0;
  let totalChars = 0, totalPromptTokens = 0, totalCompletionTokens = 0, totalCost = 0, totalDedup = 0;
  const perLang = new Map(); // lang → { jobs, prompt, completion, cost, chars }
  const failures = [];

  const results = await runWithConcurrency(jobs, opts.concurrency, async ({ source, lang }) => {
    let r;
    try {
      r = await processFile(source, lang, opts, client);
    } catch (err) {
      // Log failures inline so a watcher can react during the run (e.g.
      // halt the script if one language is failing repeatedly). Without
      // this, failures only surface in the end-of-run Failures: section.
      console.error(`  FAIL  ${source.type}/${source.slug} → ${lang}: ${err?.message || err}`);
      return { ok: false, error: err, item: { source, lang } };
    }
    if (opts.verbose) {
      if (r?.skipped) {
        console.log(`  SKIP  ${source.type}/${source.slug} → ${lang} (${r.reason})`);
      } else if (r?.dryRun) {
        console.log(`  DRY   ${source.type}/${source.slug} → ${lang}  ` +
          `chars=${r.totalChars} estIn=${r.estPromptTokens} estOut=${r.estCompletionTokens} estCost=$${r.estCost.toFixed(4)}`);
      } else if (r) {
        const chunkSfx = r.chunkCount ? ` chunks=${r.chunkCount}` : '';
        console.log(`  OK    ${source.type}/${source.slug} → ${lang} ` +
          `(in=${r.promptTokens} out=${r.completionTokens} $${r.cost.toFixed(4)}, ${r.elapsedMs} ms${chunkSfx})`);
      }
    }
    return r;
  });

  for (const r of results) {
    if (!r) continue;
    if (r.ok === false) {
      failed++;
      failures.push({
        slug: r.item?.source?.slug,
        lang: r.item?.lang,
        error: r.error?.message || String(r.error),
      });
      continue;
    }
    if (r.skipped) { skipped++; continue; }
    succeeded++;
    totalChars += r.totalChars || 0;
    totalDedup += r.dedupCount || 0;
    const p = r.dryRun ? r.estPromptTokens : r.promptTokens;
    const c = r.dryRun ? r.estCompletionTokens : r.completionTokens;
    const cost = r.dryRun ? r.estCost : r.cost;
    totalPromptTokens += p || 0;
    totalCompletionTokens += c || 0;
    totalCost += cost || 0;
    if (!perLang.has(r.lang)) perLang.set(r.lang, { jobs: 0, prompt: 0, completion: 0, cost: 0, chars: 0 });
    const pl = perLang.get(r.lang);
    pl.jobs++;
    pl.prompt += p || 0;
    pl.completion += c || 0;
    pl.cost += cost || 0;
    pl.chars += r.totalChars || 0;
  }

  const elapsedSec = (Date.now() - t0) / 1000;

  console.log('');
  console.log('=== Per-language breakdown ===');
  const langOrder = [...perLang.keys()].sort();
  for (const lang of langOrder) {
    const pl = perLang.get(lang);
    console.log(`  ${lang}: jobs=${pl.jobs} chars=${pl.chars.toLocaleString()} ` +
      `in=${pl.prompt.toLocaleString()} out=${pl.completion.toLocaleString()} ` +
      `cost=$${pl.cost.toFixed(2)}`);
  }

  console.log('');
  console.log('=== Summary ===');
  console.log(`Mode:                ${opts.dryRun ? 'DRY-RUN' : 'LIVE'}`);
  console.log(`Model:               ${MODEL_NAME}`);
  console.log(`Jobs (file×lang):    ${jobs.length}`);
  console.log(`Succeeded:           ${succeeded}`);
  console.log(`Skipped:             ${skipped}`);
  console.log(`Failed:              ${failed}`);
  console.log(`Total source chars:  ${totalChars.toLocaleString()}`);
  console.log(`Input tokens:        ${totalPromptTokens.toLocaleString()}${opts.dryRun ? ' (est.)' : ''}`);
  console.log(`Output tokens:       ${totalCompletionTokens.toLocaleString()}${opts.dryRun ? ' (est.)' : ''}`);
  console.log(`Total cost:          $${totalCost.toFixed(2)}${opts.dryRun ? ' (est.)' : ''}`);
  console.log(`Wall clock:          ${elapsedSec.toFixed(1)} s`);
  if (!opts.dryRun) {
    console.log(`Glossary collapses:  ${totalDedup}`);
    if (rateLimitSnapshot) {
      console.log('');
      console.log('=== Rate-limit headroom (from first body response) ===');
      console.log(`  Requests: ${rateLimitSnapshot.remainingRequests}/${rateLimitSnapshot.limitRequests} remaining (reset in ${rateLimitSnapshot.resetRequests})`);
      console.log(`  Tokens:   ${rateLimitSnapshot.remainingTokens}/${rateLimitSnapshot.limitTokens} remaining (reset in ${rateLimitSnapshot.resetTokens})`);
      // Empirical throughput
      const minutes = elapsedSec / 60;
      const apiCallsApprox = succeeded * 3;
      console.log(`  Observed: ~${(apiCallsApprox / minutes).toFixed(1)} req/min, ` +
        `~${((totalPromptTokens + totalCompletionTokens) / minutes / 1000).toFixed(1)}K tokens/min ` +
        `at concurrency ${opts.concurrency}`);
    }
  }

  if (opts.dryRun) {
    // Runtime estimate: assume ~12s per file (3 calls × ~4s each), divided
    // by concurrency. Body call dominates; fm/comp are smaller.
    const filesWithWork = jobs.length - skipped;
    const estSec = (filesWithWork * 12) / Math.max(opts.concurrency, 1);
    console.log(`Est. runtime:        ~${(estSec / 60).toFixed(1)} min at concurrency ${opts.concurrency}`);
    console.log('');
    console.log('Note: dry-run cost is an estimate based on the cost-calculator test');
    console.log('      benchmark ($0.09/page → Japanese). Actual cost will vary with');
    console.log('      target language (denser scripts produce more output tokens).');
  }

  if (failures.length) {
    console.log('');
    console.log('Failures:');
    for (const f of failures) console.log(`  ${f.slug} → ${f.lang}: ${f.error}`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  if (err.status) console.error('HTTP status:', err.status);
  process.exit(1);
});
