/**
 * Phase 2: align-translations.mjs
 * For each <lang>.raw.mdx, calls Anthropic Claude Sonnet to produce a clean <lang>.mdx
 * that matches EN structure with translated text substituted.
 *
 * Usage:
 *   node scripts/align-translations.mjs
 *   node scripts/align-translations.mjs --langs=de,fr --limit=5 --type=posts --force
 */

import { readdir, readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import Anthropic from '@anthropic-ai/sdk';

// ── Load env ──────────────────────────────────────────────────────────────────
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  } else {
    const { config } = await import('dotenv');
    config({ path: '.env.local' });
  }
} catch {
  // silently ignore
}

// ── Constants ─────────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content');
const REPORT_PATH = join(CONTENT_DIR, 'translation-align-report.json');

const ALL_LANGS = ['ja', 'es', 'fr', 'ru', 'it', 'pt', 'de', 'ar', 'zh', 'ko', 'hi', 'tr', 'nl'];
const CONCURRENCY = 5;
const MAX_TOKENS = 8192;

// Hybrid model routing:
//  - Sonnet for CJK + Arabic (idiom-sensitive, distant from EN syntax)
//  - Haiku for Romance / Germanic / Slavic / Turkic / Indic (closer to EN structure,
//    alignment is largely mechanical and Haiku handles it at ~3x lower cost).
const SONNET_LANGS = new Set(['ja', 'zh', 'ko', 'ar']);

const SONNET_CANDIDATES = [
  'claude-sonnet-4-5-20250929',
  'claude-sonnet-4-5',
  'claude-sonnet-4-6',
];

const HAIKU_CANDIDATES = [
  'claude-haiku-4-5-20251001',
  'claude-haiku-4-5',
  'claude-haiku-4',
];

// Quality gate thresholds
const QUALITY_GATES = {
  wordCountRatioMin: 0.6,
  missingTranslationMax: 3,
  headingCountDeltaMax: 2,
};

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flagVal = (name) => { const f = args.find(a => a.startsWith(`--${name}`)); return f ? f.split('=')[1] : null; };

const FORCE = args.includes('--force');
const LIMIT = flagVal('limit') ? parseInt(flagVal('limit'), 10) : null;
const LANGS = flagVal('langs') ? flagVal('langs').split(',').map(l => l.trim()) : ALL_LANGS;
const TYPE_FILTER = flagVal('type');

// ── Anthropic client ──────────────────────────────────────────────────────────
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Probe resolved model IDs for each family, cached per-process.
let SONNET_MODEL_ID = null;
let HAIKU_MODEL_ID = null;

async function probeModel(candidates, label) {
  for (const candidate of candidates) {
    try {
      await client.messages.create({
        model: candidate,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'ping' }],
      });
      console.log(`Using ${label} model: ${candidate}`);
      return candidate;
    } catch (err) {
      if (err?.status === 404 || err?.message?.includes('model')) {
        console.log(`${label} model ${candidate} not available, trying next...`);
        continue;
      }
      throw err;
    }
  }
  throw new Error(`No available ${label} model among: ${candidates.join(', ')}`);
}

async function getSonnetModel() {
  if (!SONNET_MODEL_ID) SONNET_MODEL_ID = await probeModel(SONNET_CANDIDATES, 'Sonnet');
  return SONNET_MODEL_ID;
}

async function getHaikuModel() {
  if (!HAIKU_MODEL_ID) HAIKU_MODEL_ID = await probeModel(HAIKU_CANDIDATES, 'Haiku');
  return HAIKU_MODEL_ID;
}

function modelForLang(lang) {
  return SONNET_LANGS.has(lang) ? 'sonnet' : 'haiku';
}

async function resolveModelForLang(lang) {
  return modelForLang(lang) === 'sonnet' ? await getSonnetModel() : await getHaikuModel();
}

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You rewrite translated web content so it matches the original English structure exactly while using the translated text from the raw scrape. You preserve all images, internal links, markdown headings hierarchy, bullet/numbered lists, code blocks, and blockquotes from the English source. You only replace the human-readable text with the equivalent translation from the raw translated scrape. Never translate code, URLs, image alt-text that appears in /images/wp/ paths, or technical identifiers (SAP, S/4HANA, ECC, Oracle EBS, SAP PP, SAP MM, etc.). If a paragraph in the EN source has no clear equivalent in the raw translation, leave the EN text in place and prefix that paragraph with an HTML comment <!-- MISSING_TRANSLATION -->. Output only the rewritten MDX body. Do not output frontmatter. Do not explain.`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

function wordCount(text) {
  return (text.match(/\S+/g) || []).length;
}

function headingCount(text) {
  return (text.match(/^#{1,6}\s/gm) || []).length;
}

async function runPool(tasks, concurrency, fn) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await fn(tasks[i], i);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

// ── Get slugs ─────────────────────────────────────────────────────────────────
async function getSlugs(type) {
  const dir = join(CONTENT_DIR, type);
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return []; }
  const slugs = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const enPath = join(CONTENT_DIR, type, e.name, 'en.mdx');
    if (await fileExists(enPath)) slugs.push(e.name);
  }
  return slugs;
}

// ── Path helpers ──────────────────────────────────────────────────────────────
function rawPath(type, slug, lang) {
  return join(CONTENT_DIR, type, slug, `${lang}.raw.mdx`);
}

function alignedPath(type, slug, lang) {
  return join(CONTENT_DIR, type, slug, `${lang}.mdx`);
}

// ── Build frontmatter for aligned file ───────────────────────────────────────
function buildFrontmatter(enData, rawData, lang) {
  const fm = { ...enData };

  // Override with translated values
  if (rawData.title) fm.title = rawData.title;
  if (rawData.scrapedH1) fm.h1 = rawData.scrapedH1;
  if (rawData.scrapedMetaDescription) fm.metaDescription = rawData.scrapedMetaDescription;
  if (rawData.title) fm.metaTitle = rawData.title;

  // Add translation metadata
  fm.locale = lang;
  fm.translatedFrom = 'en';
  fm.translationSource = 'gtranslate-scrape';

  // Serialize
  const lines = ['---'];
  for (const [k, v] of Object.entries(fm)) {
    if (v === null || v === undefined) continue;
    if (typeof v === 'string') {
      lines.push(`${k}: ${JSON.stringify(v)}`);
    } else if (Array.isArray(v)) {
      lines.push(`${k}: [${v.map(x => JSON.stringify(x)).join(', ')}]`);
    } else {
      lines.push(`${k}: ${v}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

// ── Call Anthropic ────────────────────────────────────────────────────────────
// Prompt structure is split into two content blocks so the EN body + shared
// intro can be cached (ephemeral, 5-min TTL). Because tasks are ordered
// slug-major, the 13 language calls for a given slug land within the TTL and
// reuse the cached prefix at ~10% of input price.
async function callClaude(enBody, rawBody, lang) {
  const model = await resolveModelForLang(lang);
  const family = modelForLang(lang);

  // Cacheable prefix: the EN body is identical across all 13 lang calls for a slug.
  const cacheablePrefix = `## English Source (canonical structure — preserve all images, links, headings, code blocks):

\`\`\`
${enBody}
\`\`\``;

  // Variable tail: the raw translated content + language marker differ per call.
  const variableTail = `

## Raw Translated Content (${lang} — use this text, but follow EN structure):

\`\`\`
${rawBody}
\`\`\`

Rewrite the content now using the English structure with the translated text substituted from the raw translation.`;

  let attempt = 0;
  while (true) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: cacheablePrefix, cache_control: { type: 'ephemeral' } },
            { type: 'text', text: variableTail },
          ],
        }],
      });
      // Log cache diagnostics when present so we can verify caching is working.
      const u = response.usage || {};
      const cacheRead = u.cache_read_input_tokens || 0;
      const cacheCreate = u.cache_creation_input_tokens || 0;
      if (cacheRead || cacheCreate) {
        console.log(`    [${family}] cache read=${cacheRead} create=${cacheCreate} in=${u.input_tokens ?? 0} out=${u.output_tokens ?? 0}`);
      }
      return {
        text: response.content[0].text,
        family,
        model,
        usage: u,
      };
    } catch (err) {
      if (err?.status === 429) {
        attempt++;
        const backoff = 5000 * attempt;
        console.log(`  Rate limit hit, backing off ${backoff}ms...`);
        await sleep(backoff);
        continue;
      }
      throw err;
    }
  }
}

// ── Process one task ──────────────────────────────────────────────────────────
async function processTask({ type, slug, lang }, taskIndex, total, stats, flagged) {
  const rPath = rawPath(type, slug, lang);
  const aPath = alignedPath(type, slug, lang);
  const enPath = join(CONTENT_DIR, type, slug, 'en.mdx');
  const pct = (((taskIndex + 1) / total) * 100).toFixed(1);
  const prefix = `[${taskIndex + 1}/${total} ${pct}%] [${lang}] ${slug}`;

  // Check raw exists
  if (!(await fileExists(rPath))) {
    console.log(`${prefix} SKIP no raw.mdx`);
    return;
  }

  // Resume: skip if aligned already exists
  if (!FORCE && (await fileExists(aPath))) {
    console.log(`${prefix} SKIP already aligned`);
    return;
  }

  // Load files
  let enRaw, rawRaw;
  try {
    [enRaw, rawRaw] = await Promise.all([
      readFile(enPath, 'utf8'),
      readFile(rPath, 'utf8'),
    ]);
  } catch (err) {
    console.log(`${prefix} FAIL read error: ${err.message}`);
    stats.failed++;
    return;
  }

  const { data: enData, content: enBody } = matter(enRaw);
  const { data: rawData, content: rawBody } = matter(rawRaw);

  // Call Claude
  let callResult;
  try {
    const family = modelForLang(lang);
    console.log(`${prefix} calling Claude (${family})...`);
    callResult = await callClaude(enBody.trim(), rawBody.trim(), lang);
  } catch (err) {
    console.log(`${prefix} FAIL Claude error: ${err.message}`);
    stats.failed++;
    return;
  }
  const alignedBody = callResult.text;

  // Quality metrics
  const enWc = wordCount(enBody);
  const alignedWc = wordCount(alignedBody);
  const ratio = enWc > 0 ? +(alignedWc / enWc).toFixed(3) : null;
  const missingCount = (alignedBody.match(/<!-- MISSING_TRANSLATION -->/g) || []).length;
  const enHeadings = headingCount(enBody);
  const alignedHeadings = headingCount(alignedBody);
  const headingDelta = Math.abs(alignedHeadings - enHeadings);

  // Quality gate check
  const qfails = [];
  if (ratio !== null && ratio < QUALITY_GATES.wordCountRatioMin) qfails.push(`wordCountRatio ${ratio} < ${QUALITY_GATES.wordCountRatioMin}`);
  if (missingCount > QUALITY_GATES.missingTranslationMax) qfails.push(`missingTranslations ${missingCount} > ${QUALITY_GATES.missingTranslationMax}`);
  if (headingDelta > QUALITY_GATES.headingCountDeltaMax) qfails.push(`headingDelta ${headingDelta} > ${QUALITY_GATES.headingCountDeltaMax}`);

  // Build output
  const fm = buildFrontmatter(enData, rawData, lang);
  const fileContent = `${fm}\n\n${alignedBody.trim()}\n`;

  await mkdir(dirname(aPath), { recursive: true });
  await writeFile(aPath, fileContent, 'utf8');

  stats.succeeded++;

  const metricStr = `wc=${alignedWc}(ratio=${ratio}), missing=${missingCount}, hdgDelta=${headingDelta}`;
  if (qfails.length > 0) {
    console.log(`${prefix} OK (FLAGGED) ${metricStr} — ${qfails.join('; ')}`);
    flagged.push({
      type, slug, lang,
      wordCountRatio: ratio,
      missingTranslationCount: missingCount,
      headingCountDelta: headingDelta,
      qualityFailures: qfails,
    });
  } else {
    console.log(`${prefix} OK ${metricStr}`);
  }

  // Store in stats for report
  stats.files.push({
    type, slug, lang,
    family: callResult.family,
    model: callResult.model,
    wordCount: alignedWc,
    wordCountRatio: ratio,
    missingTranslationCount: missingCount,
    headingCountDelta: headingDelta,
    flagged: qfails.length > 0,
    usage: callResult.usage,
  });

  // Accumulate usage totals for cost tracking
  stats.usage[callResult.family] = stats.usage[callResult.family] || {
    input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, calls: 0,
  };
  const agg = stats.usage[callResult.family];
  agg.calls++;
  agg.input_tokens += callResult.usage.input_tokens || 0;
  agg.output_tokens += callResult.usage.output_tokens || 0;
  agg.cache_read_input_tokens += callResult.usage.cache_read_input_tokens || 0;
  agg.cache_creation_input_tokens += callResult.usage.cache_creation_input_tokens || 0;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const startedAt = new Date().toISOString();
  console.log(`\n=== align-translations.mjs ===`);
  console.log(`Started: ${startedAt}`);
  console.log(`Langs: ${LANGS.join(', ')}`);
  console.log(`Force: ${FORCE}, Limit: ${LIMIT ?? 'none'}, Type filter: ${TYPE_FILTER ?? 'all'}\n`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY not set. Add it to .env.local');
    process.exit(1);
  }

  // Warm-up model detection for both families (only the ones this run needs)
  const needsSonnet = LANGS.some((l) => SONNET_LANGS.has(l));
  const needsHaiku = LANGS.some((l) => !SONNET_LANGS.has(l));
  if (needsSonnet) await getSonnetModel();
  if (needsHaiku) await getHaikuModel();
  console.log(`Routing: Sonnet → [${[...SONNET_LANGS].filter((l) => LANGS.includes(l)).join(', ') || '(none)'}], Haiku → [${LANGS.filter((l) => !SONNET_LANGS.has(l)).join(', ') || '(none)'}]`);

  // Gather tasks
  const types = TYPE_FILTER ? [TYPE_FILTER] : ['posts', 'pages'];
  let tasks = [];
  for (const type of types) {
    const slugs = await getSlugs(type);
    for (const slug of slugs) {
      for (const lang of LANGS) {
        tasks.push({ type, slug, lang });
      }
    }
  }

  if (LIMIT) tasks = tasks.slice(0, LIMIT);

  console.log(`Total alignment tasks: ${tasks.length}\n`);

  const stats = { succeeded: 0, failed: 0, files: [], usage: {} };
  const flagged = [];
  let taskIndex = 0;
  const total = tasks.length;

  await runPool(tasks, CONCURRENCY, async (task) => {
    const i = taskIndex++;
    await processTask(task, i, total, stats, flagged);
  });

  const finishedAt = new Date().toISOString();

  const report = {
    startedAt,
    finishedAt,
    modelsUsed: {
      sonnet: SONNET_MODEL_ID,
      haiku: HAIKU_MODEL_ID,
    },
    routing: {
      sonnet: [...SONNET_LANGS],
      haiku: ALL_LANGS.filter((l) => !SONNET_LANGS.has(l)),
    },
    totals: {
      attempted: tasks.length,
      succeeded: stats.succeeded,
      failed: stats.failed,
    },
    usageByFamily: stats.usage,
    flagged,
    files: stats.files,
  };

  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n=== Done ===');
  console.log(`Succeeded: ${stats.succeeded}, Failed: ${stats.failed}, Flagged: ${flagged.length}`);
  console.log(`Report: ${REPORT_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
