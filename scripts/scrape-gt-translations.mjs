/**
 * Phase 1: scrape-gt-translations.mjs
 * Scrapes GTranslate-served translations from live URLs and writes <lang>.raw.mdx files.
 *
 * Usage:
 *   node scripts/scrape-gt-translations.mjs
 *   node scripts/scrape-gt-translations.mjs --langs=de,fr --limit=5 --type=posts --force
 */

import { readdir, readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import TurndownService from 'turndown';
import * as cheerio from 'cheerio';

// ── Load env ──────────────────────────────────────────────────────────────────
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  } else {
    const { config } = await import('dotenv');
    config({ path: '.env.local' });
  }
} catch {
  // .env.local may not exist — API key not needed for this script
}

// ── Constants ─────────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content');
const REPORT_PATH = join(CONTENT_DIR, 'translation-scrape-report.json');

const ALL_LANGS = ['ja', 'es', 'fr', 'ru', 'it', 'pt', 'de', 'ar', 'zh', 'ko', 'hi', 'tr', 'nl'];
const BASE_URL = 'https://noeldcosta.com';
const USER_AGENT = 'NoelBot/1.0 (+https://noeldcosta.com/about)';
const CONCURRENCY = 4;
const REQUEST_DELAY_MS = 250;
const MAX_CONSEC_ERRORS = 5;
const RETRY_DELAYS = [1000, 2000, 4000];

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name) => args.find(a => a.startsWith(`--${name}`));
const flagVal = (name) => { const f = flag(name); return f ? f.split('=')[1] : null; };

const FORCE = args.includes('--force');
const LIMIT = flagVal('limit') ? parseInt(flagVal('limit'), 10) : null;
const LANGS = flagVal('langs') ? flagVal('langs').split(',').map(l => l.trim()) : ALL_LANGS;
const TYPE_FILTER = flagVal('type'); // 'posts' | 'pages' | null

// ── Turndown setup ─────────────────────────────────────────────────────────────
function buildTurndown() {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '_',
  });

  // Preserve img tags as markdown images
  td.addRule('images', {
    filter: 'img',
    replacement(_, node) {
      const src = node.getAttribute('src') || '';
      const alt = node.getAttribute('alt') || '';
      return src ? `![${alt}](${src})` : '';
    },
  });

  // Strip empty/whitespace-only links
  td.addRule('emptyLinks', {
    filter(node) {
      return node.nodeName === 'A' && !node.textContent.trim();
    },
    replacement() { return ''; },
  });

  return td;
}

// ── DOM selectors to remove ───────────────────────────────────────────────────
const REMOVE_SELECTORS = [
  'script', 'style', 'link', 'meta', 'svg', 'noscript',
  'header', 'footer', 'nav', 'aside',
  '.gtranslate_wrapper', '#gt-wrapper', '[class*="gtranslate"]',
  '.elementor-menu-toggle', '.elementor-widget-nav-menu',
  '.e-search-input-wrapper', '.e-search-results',
  '.swiper-button-next', '.swiper-button-prev', '.swiper-pagination',
  '#wpadminbar', '.site-header', '.site-footer',
  '#comments', '.comments-area',
].join(', ');

const MAIN_SELECTORS = [
  'div[data-elementor-type="wp-page"]',
  'div[data-elementor-type="wp-post"]',
  'div[data-elementor-type="single-post"]',
  'div[data-elementor-type="single"]',
];

// ── Markdown post-processing ───────────────────────────────────────────────────
function postProcessMarkdown(md) {
  // Collapse 3+ consecutive blank lines to 2
  md = md.replace(/\n{3,}/g, '\n\n');

  // Strip lines that are only non-breaking-space or zero-width chars
  md = md.replace(/^[\u00a0\u200b\u200c\u200d\ufeff\s]*$/gm, '');

  // Dedupe consecutive identical paragraphs (Elementor carousel repetition)
  const lines = md.split('\n');
  const deduped = [];
  let prevPara = null;
  let accumulating = [];

  for (const line of lines) {
    if (line.trim() === '') {
      if (accumulating.length > 0) {
        const para = accumulating.join('\n');
        if (para !== prevPara) {
          deduped.push(...accumulating, '');
          prevPara = para;
        }
        accumulating = [];
      } else {
        deduped.push(line);
      }
    } else {
      accumulating.push(line);
    }
  }
  if (accumulating.length > 0) {
    const para = accumulating.join('\n');
    if (para !== prevPara) deduped.push(...accumulating);
  }

  // Final collapse
  return deduped.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// ── Title cleanup ─────────────────────────────────────────────────────────────
function cleanTitle(raw) {
  // Strip trailing ' - Site Name' or ' | Site Name' patterns
  return raw
    .replace(/\s*[-|]\s*Noel DCosta.*$/i, '')
    .replace(/\s*[-|]\s*noeldcosta\.com.*$/i, '')
    .trim();
}

// ── HTTP fetch with retries ───────────────────────────────────────────────────
async function fetchWithRetry(url) {
  let lastError;
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    if (attempt > 0) {
      await sleep(RETRY_DELAYS[attempt - 1]);
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.status === 404) return { ok: false, status: 404, html: null, network: false };
      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
        if (attempt < RETRY_DELAYS.length) continue;
        return { ok: false, status: res.status, html: null, network: false };
      }
      const html = await res.text();
      return { ok: true, status: res.status, html, network: false };
    } catch (err) {
      lastError = err.message || String(err);
      if (attempt < RETRY_DELAYS.length) continue;
      return { ok: false, status: 0, html: null, network: true, error: lastError };
    }
  }
  return { ok: false, status: 0, html: null, network: true, error: lastError };
}

// ── Parse HTML ────────────────────────────────────────────────────────────────
function parseHtml(html, url, lang, slug) {
  const $ = cheerio.load(html);

  const titleRaw = $('title').first().text().trim();
  const title = cleanTitle(titleRaw);
  const h1 = $('h1').first().text().trim();
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const canonical = $('link[rel="canonical"]').attr('href') || '';

  // Remove noise
  $(REMOVE_SELECTORS).remove();

  // Find main content container
  let container = null;
  let usedFallback = false;

  for (const sel of MAIN_SELECTORS) {
    const el = $(sel).first();
    if (el.length) {
      container = el;
      break;
    }
  }

  if (!container) {
    container = $('body');
    usedFallback = true;
  }

  return { title, h1, metaDescription, canonical, container, usedFallback, $ };
}

// ── Output path ───────────────────────────────────────────────────────────────
function rawMdxPath(type, slug, lang) {
  return join(CONTENT_DIR, type, slug, `${lang}.raw.mdx`);
}

// ── File exists helper ────────────────────────────────────────────────────────
async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

// ── Sleep ─────────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Promise pool ──────────────────────────────────────────────────────────────
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

// ── Word count ────────────────────────────────────────────────────────────────
function wordCount(text) {
  return (text.match(/\S+/g) || []).length;
}

// ── Get slugs ─────────────────────────────────────────────────────────────────
async function getSlugs(type) {
  const dir = join(CONTENT_DIR, type);
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return []; }
  const slugs = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const enPath = join(dir, e.name, 'en.mdx');
    if (await fileExists(enPath)) slugs.push(e.name);
  }
  return slugs;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const startedAt = new Date().toISOString();
  console.log(`\n=== scrape-gt-translations.mjs ===`);
  console.log(`Started: ${startedAt}`);
  console.log(`Langs: ${LANGS.join(', ')}`);
  console.log(`Force: ${FORCE}, Limit: ${LIMIT ?? 'none'}, Type filter: ${TYPE_FILTER ?? 'all'}\n`);

  const td = buildTurndown();

  // Gather all (type, slug) pairs
  const types = TYPE_FILTER ? [TYPE_FILTER] : ['posts', 'pages'];
  let allSlugs = [];
  for (const type of types) {
    const slugs = await getSlugs(type);
    for (const slug of slugs) allSlugs.push({ type, slug });
  }

  if (LIMIT) allSlugs = allSlugs.slice(0, LIMIT);

  console.log(`Total slugs: ${allSlugs.length}`);

  // Read EN word counts for ratio calculation
  const enWordCounts = {};
  for (const { type, slug } of allSlugs) {
    try {
      const raw = await readFile(join(CONTENT_DIR, type, slug, 'en.mdx'), 'utf8');
      const { content } = matter(raw);
      enWordCounts[`${type}/${slug}`] = wordCount(content);
    } catch { enWordCounts[`${type}/${slug}`] = 0; }
  }

  // Build task list: (type, slug, lang)
  let tasks = [];
  for (const { type, slug } of allSlugs) {
    for (const lang of LANGS) {
      tasks.push({ type, slug, lang });
    }
  }

  console.log(`Total fetch tasks: ${tasks.length}\n`);

  // Resume: skip already-scraped
  if (!FORCE) {
    const before = tasks.length;
    const filtered = [];
    for (const task of tasks) {
      const p = rawMdxPath(task.type, task.slug, task.lang);
      if (!(await fileExists(p))) filtered.push(task);
    }
    tasks = filtered;
    console.log(`Skipped (already scraped): ${before - tasks.length}`);
    console.log(`Remaining: ${tasks.length}\n`);
  }

  // Stats
  const failures = [];
  const warnings = [];
  let succeeded = 0;
  let skipped404 = 0;
  let consecErrors = 0;
  let aborted = false;

  // Per-lang accumulator
  const perLang = {};
  for (const lang of LANGS) {
    perLang[lang] = { succeeded: 0, failed: 0, wordCounts: [], enWordCounts: [] };
  }

  // Track progress
  let done = 0;
  const total = tasks.length;

  // Process one task
  async function processTask({ type, slug, lang }) {
    if (aborted) return;

    const url = `${BASE_URL}/${lang}/${slug}/`;

    await sleep(REQUEST_DELAY_MS);
    const result = await fetchWithRetry(url);

    done++;
    const pct = ((done / total) * 100).toFixed(1);

    if (!result.ok) {
      if (result.status === 404) {
        console.log(`[${done}/${total} ${pct}%] SKIP 404  [${lang}] ${slug}`);
        skipped404++;
        failures.push({ lang, slug, url, status: 404, error: 'Not Found' });
      } else {
        console.log(`[${done}/${total} ${pct}%] FAIL ${result.status || 'ERR'}  [${lang}] ${slug} — ${result.error || ''}`);
        failures.push({ lang, slug, url, status: result.status, error: result.error || `HTTP ${result.status}` });
        perLang[lang].failed++;

        if (result.network) {
          consecErrors++;
          if (consecErrors >= MAX_CONSEC_ERRORS) {
            console.error(`\nABORTING: ${MAX_CONSEC_ERRORS} consecutive network errors. Origin may be down.`);
            aborted = true;
          }
        } else {
          consecErrors = 0;
        }
      }
      return;
    }

    consecErrors = 0;

    // Parse
    const { title, h1, metaDescription, canonical, container, usedFallback, $ } = parseHtml(result.html, url, lang, slug);

    if (usedFallback) {
      warnings.push({ lang, slug, issue: 'fallback_body' });
      console.log(`[${done}/${total} ${pct}%] WARN fallback_body [${lang}] ${slug}`);
    }

    // Convert to markdown
    let markdown;
    try {
      markdown = td.turndown($.html(container));
    } catch (err) {
      console.log(`[${done}/${total} ${pct}%] FAIL turndown error [${lang}] ${slug}: ${err.message}`);
      failures.push({ lang, slug, url, status: result.status, error: `turndown: ${err.message}` });
      perLang[lang].failed++;
      return;
    }

    markdown = postProcessMarkdown(markdown);

    // Build frontmatter
    const fm = [
      '---',
      `title: ${JSON.stringify(title)}`,
      `slug: ${JSON.stringify(slug)}`,
      `lang: ${JSON.stringify(lang)}`,
      `sourceUrl: ${JSON.stringify(url)}`,
      `scrapedH1: ${JSON.stringify(h1)}`,
      `scrapedMetaDescription: ${JSON.stringify(metaDescription)}`,
      `scrapedCanonical: ${JSON.stringify(canonical)}`,
      `phase: "raw"`,
      '---',
    ].join('\n');

    const fileContent = `${fm}\n\n${markdown}\n`;

    // Write file
    const outPath = rawMdxPath(type, slug, lang);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, fileContent, 'utf8');

    const wc = wordCount(markdown);
    const enWc = enWordCounts[`${type}/${slug}`] || 0;
    perLang[lang].succeeded++;
    perLang[lang].wordCounts.push(wc);
    perLang[lang].wordCounts; // reference
    perLang[lang].enWordCounts.push(enWc);
    succeeded++;

    console.log(`[${done}/${total} ${pct}%] OK        [${lang}] ${slug} (${wc} words, ratio ${enWc ? (wc/enWc).toFixed(2) : 'n/a'})`);
  }

  await runPool(tasks, CONCURRENCY, processTask);

  const finishedAt = new Date().toISOString();

  // Compute per-lang word count ratios
  const perLangReport = {};
  for (const lang of LANGS) {
    const { succeeded: s, failed: f, wordCounts, enWordCounts: enc } = perLang[lang];
    let wordCountRatio = null;
    if (wordCounts.length > 0 && enc.some(v => v > 0)) {
      const ratios = wordCounts.map((wc, i) => enc[i] > 0 ? wc / enc[i] : null).filter(r => r !== null);
      wordCountRatio = ratios.length > 0 ? +(ratios.reduce((a, b) => a + b, 0) / ratios.length).toFixed(3) : null;
    }
    perLangReport[lang] = { succeeded: s, failed: f, wordCountRatio };
  }

  const report = {
    startedAt,
    finishedAt,
    aborted,
    totals: {
      attempted: tasks.length,
      succeeded,
      failed: failures.filter(f => f.status !== 404).length,
      skipped404,
    },
    perLang: perLangReport,
    failures,
    warnings,
  };

  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n=== Done ===');
  console.log(`Succeeded: ${succeeded}, Failed: ${report.totals.failed}, 404s: ${skipped404}`);
  console.log(`Report: ${REPORT_PATH}`);
  if (aborted) console.log('WARNING: Run was aborted due to consecutive network errors.');
}

main().catch(err => { console.error(err); process.exit(1); });
