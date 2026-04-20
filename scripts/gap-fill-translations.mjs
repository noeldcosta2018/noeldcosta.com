/**
 * Phase 3: gap-fill-translations.mjs
 * Generates translations from scratch with Sonnet for:
 *   - Items flagged in translation-align-report.json
 *   - Items missing entirely (EN exists, no <lang>.mdx)
 *
 * Usage:
 *   node scripts/gap-fill-translations.mjs
 *   node scripts/gap-fill-translations.mjs --langs=de,fr --limit=5 --type=posts --force
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
const ALIGN_REPORT_PATH = join(CONTENT_DIR, 'translation-align-report.json');
const REPORT_PATH = join(CONTENT_DIR, 'translation-gapfill-report.json');

const ALL_LANGS = ['ja', 'es', 'fr', 'ru', 'it', 'pt', 'de', 'ar', 'zh', 'ko', 'hi', 'tr', 'nl'];
const CONCURRENCY = 2;
const MAX_TOKENS = 8192;

// Language name map for system prompt substitution
const LANG_NAMES = {
  ja: 'Japanese',
  es: 'Spanish',
  fr: 'French',
  ru: 'Russian',
  it: 'Italian',
  pt: 'Portuguese',
  de: 'German',
  ar: 'Arabic',
  zh: 'Chinese',
  ko: 'Korean',
  hi: 'Hindi',
  tr: 'Turkish',
  nl: 'Dutch',
};

// Model priority list
const MODEL_CANDIDATES = [
  'claude-sonnet-4-5-20250929',
  'claude-sonnet-4-5',
  'claude-sonnet-4-6',
];

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flagVal = (name) => { const f = args.find(a => a.startsWith(`--${name}`)); return f ? f.split('=')[1] : null; };

const FORCE = args.includes('--force');
const LIMIT = flagVal('limit') ? parseInt(flagVal('limit'), 10) : null;
const LANGS = flagVal('langs') ? flagVal('langs').split(',').map(l => l.trim()) : ALL_LANGS;
const TYPE_FILTER = flagVal('type');

// ── Anthropic client ──────────────────────────────────────────────────────────
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

let MODEL_ID = null;
async function getModel() {
  if (MODEL_ID) return MODEL_ID;
  for (const candidate of MODEL_CANDIDATES) {
    try {
      await client.messages.create({
        model: candidate,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'ping' }],
      });
      MODEL_ID = candidate;
      console.log(`Using model: ${MODEL_ID}`);
      return MODEL_ID;
    } catch (err) {
      if (err?.status === 404 || err?.message?.includes('model')) {
        console.log(`Model ${candidate} not available, trying next...`);
        continue;
      }
      throw err;
    }
  }
  throw new Error(`None of the candidate models are available: ${MODEL_CANDIDATES.join(', ')}`);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

function wordCount(text) {
  return (text.match(/\S+/g) || []).length;
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

// ── Build frontmatter ─────────────────────────────────────────────────────────
function buildFrontmatter(enData, lang, translatedTitle) {
  const fm = { ...enData };

  if (translatedTitle) fm.title = translatedTitle;
  fm.locale = lang;
  fm.translatedFrom = 'en';
  fm.translationSource = 'sonnet-generated';

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

// ── Build system prompt ───────────────────────────────────────────────────────
function buildSystemPrompt(lang) {
  const langName = LANG_NAMES[lang] || lang;
  return `You translate ERP and enterprise software content to ${langName}. Preserve all markdown structure, images, internal links, code blocks, and technical identifiers (SAP, S/4HANA, Oracle EBS, ECC, SAP MM, SAP PP, etc.) verbatim. Translate human-readable prose only. Output the translated MDX body with no frontmatter, no explanation, no wrapping.`;
}

// ── Call Claude ───────────────────────────────────────────────────────────────
async function callClaude(enBody, lang) {
  const model = await getModel();
  const systemPrompt = buildSystemPrompt(lang);

  let attempt = 0;
  while (true) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Translate the following MDX content:\n\n${enBody}`,
          },
        ],
      });
      return response.content[0].text;
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

// ── Extract likely title from translated body ─────────────────────────────────
function extractTitleFromBody(body) {
  // Look for first ATX heading
  const match = body.match(/^#{1,2}\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

// ── Process one task ──────────────────────────────────────────────────────────
async function processTask({ type, slug, lang, reason }, taskIndex, total, stats) {
  const aPath = join(CONTENT_DIR, type, slug, `${lang}.mdx`);
  const enPath = join(CONTENT_DIR, type, slug, 'en.mdx');
  const pct = (((taskIndex + 1) / total) * 100).toFixed(1);
  const prefix = `[${taskIndex + 1}/${total} ${pct}%] [${lang}] ${slug} (${reason})`;

  // Resume: skip if aligned already exists and not forced
  if (!FORCE && (await fileExists(aPath))) {
    console.log(`${prefix} SKIP already exists`);
    return;
  }

  // Load EN
  let enRaw;
  try {
    enRaw = await readFile(enPath, 'utf8');
  } catch (err) {
    console.log(`${prefix} FAIL read EN: ${err.message}`);
    stats.failed++;
    return;
  }

  const { data: enData, content: enBody } = matter(enRaw);

  // Call Claude
  let translatedBody;
  try {
    console.log(`${prefix} calling Claude...`);
    translatedBody = await callClaude(enBody.trim(), lang);
  } catch (err) {
    console.log(`${prefix} FAIL Claude error: ${err.message}`);
    stats.failed++;
    return;
  }

  // Extract translated title (best-effort)
  const translatedTitle = extractTitleFromBody(translatedBody);

  // Build output
  const fm = buildFrontmatter(enData, lang, translatedTitle);
  const fileContent = `${fm}\n\n${translatedBody.trim()}\n`;

  await mkdir(dirname(aPath), { recursive: true });
  await writeFile(aPath, fileContent, 'utf8');

  const enWc = wordCount(enBody);
  const outWc = wordCount(translatedBody);
  const ratio = enWc > 0 ? +(outWc / enWc).toFixed(3) : null;

  stats.succeeded++;
  stats.files.push({
    type, slug, lang, reason,
    wordCount: outWc,
    wordCountRatio: ratio,
  });

  console.log(`${prefix} OK wc=${outWc} ratio=${ratio}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const startedAt = new Date().toISOString();
  console.log(`\n=== gap-fill-translations.mjs ===`);
  console.log(`Started: ${startedAt}`);
  console.log(`Langs: ${LANGS.join(', ')}`);
  console.log(`Force: ${FORCE}, Limit: ${LIMIT ?? 'none'}, Type filter: ${TYPE_FILTER ?? 'all'}\n`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY not set. Add it to .env.local');
    process.exit(1);
  }

  await getModel();

  // Gather all slugs
  const types = TYPE_FILTER ? [TYPE_FILTER] : ['posts', 'pages'];
  const allSlugs = [];
  for (const type of types) {
    const slugs = await getSlugs(type);
    for (const slug of slugs) allSlugs.push({ type, slug });
  }

  // Load align report to get flagged items
  const flaggedSet = new Set();
  try {
    const alignReport = JSON.parse(await readFile(ALIGN_REPORT_PATH, 'utf8'));
    for (const item of (alignReport.flagged || [])) {
      if (LANGS.includes(item.lang)) {
        flaggedSet.add(`${item.type}/${item.slug}/${item.lang}`);
      }
    }
    console.log(`Flagged in align report: ${flaggedSet.size}`);
  } catch {
    console.log(`No align report found at ${ALIGN_REPORT_PATH} — scanning for missing files only.`);
  }

  // Build task list
  const tasks = [];
  for (const { type, slug } of allSlugs) {
    for (const lang of LANGS) {
      const key = `${type}/${slug}/${lang}`;
      const aPath = join(CONTENT_DIR, type, slug, `${lang}.mdx`);
      const isFlagged = flaggedSet.has(key);
      const isMissing = !(await fileExists(aPath));

      if (isFlagged) {
        tasks.push({ type, slug, lang, reason: 'flagged' });
      } else if (isMissing) {
        tasks.push({ type, slug, lang, reason: 'missing' });
      }
    }
  }

  let limited = tasks;
  if (LIMIT) limited = tasks.slice(0, LIMIT);

  console.log(`Total gap-fill tasks: ${limited.length} (${tasks.length} before limit)\n`);

  const stats = { succeeded: 0, failed: 0, files: [] };
  let taskIndex = 0;
  const total = limited.length;

  await runPool(limited, CONCURRENCY, async (task) => {
    const i = taskIndex++;
    await processTask(task, i, total, stats);
  });

  const finishedAt = new Date().toISOString();

  const report = {
    startedAt,
    finishedAt,
    modelUsed: MODEL_ID,
    totals: {
      attempted: limited.length,
      succeeded: stats.succeeded,
      failed: stats.failed,
    },
    files: stats.files,
  };

  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n=== Done ===');
  console.log(`Succeeded: ${stats.succeeded}, Failed: ${stats.failed}`);
  console.log(`Report: ${REPORT_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
