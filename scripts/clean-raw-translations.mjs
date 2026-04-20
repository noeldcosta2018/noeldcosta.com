#!/usr/bin/env node
/**
 * clean-raw-translations.mjs
 *
 * Phase 2 (revised): deterministic, $0-API-cost cleanup of the GTranslate raw
 * scrapes into shippable <lang>.mdx files.
 *
 * For each content/<type>/<slug>/<lang>.raw.mdx:
 *   1. Read raw frontmatter + body
 *   2. Read sibling en.mdx for base frontmatter
 *   3. Clean body:
 *        - strip data: URI placeholder images
 *        - rewrite absolute noeldcosta.com/wp-content/uploads/* URLs → /images/wp/*
 *        - repair broken antispam-encoded mailto links
 *        - strip zero-width and BOM characters
 *        - collapse NBSP runs
 *        - strip leaked srcset width markers from markdown images
 *        - collapse excess blank lines
 *   4. Merge frontmatter: EN as base + translated title/h1/metaTitle/
 *      metaDescription/excerpt/canonicalUrl + locale/translatedFrom/
 *      translationSource provenance
 *   5. Write <lang>.mdx (overwrites any prior aligned output)
 *
 * Usage:
 *   node scripts/clean-raw-translations.mjs
 *   node scripts/clean-raw-translations.mjs --langs=de,fr --type=posts --limit=4 --dry
 */

import { readdir, readFile, writeFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content');
const REPORT_PATH = join(CONTENT_DIR, 'translation-cleanup-report.json');

const ALL_LANGS = ['ja','es','fr','ru','it','pt','de','ar','zh','ko','hi','tr','nl'];

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flagVal = (name) => { const f = args.find(a => a.startsWith(`--${name}`)); return f ? f.split('=')[1] : null; };

const LANG_FILTER = flagVal('langs') ? flagVal('langs').split(',').map(s => s.trim()) : ALL_LANGS;
const TYPE_FILTER = flagVal('type');
const LIMIT = flagVal('limit') ? parseInt(flagVal('limit'), 10) : null;
const DRY = args.includes('--dry');

// ── Helpers ───────────────────────────────────────────────────────────────────
async function fileExists(p) { try { await access(p); return true; } catch { return false; } }

function serializeFrontmatter(fm) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(fm)) {
    if (v === null || v === undefined) continue;
    if (typeof v === 'string') {
      lines.push(`${k}: ${JSON.stringify(v)}`);
    } else if (Array.isArray(v)) {
      lines.push(`${k}: [${v.map(x => JSON.stringify(x)).join(', ')}]`);
    } else if (typeof v === 'boolean' || typeof v === 'number') {
      lines.push(`${k}: ${v}`);
    } else {
      // objects (rare) fall through to JSON
      lines.push(`${k}: ${JSON.stringify(v)}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

// ── Body cleanup transforms ───────────────────────────────────────────────────
function cleanBody(body) {
  let b = body;

  // 1) Strip data: URI images (SVG tracking pixels and placeholders).
  b = b.replace(/!\[[^\]]*\]\(data:[^)]*\)/g, '');

  // 2) Rewrite absolute wp-content URLs → relative /images/wp/*.
  //    Handles language-prefixed variants like /de/wp-content/uploads too.
  b = b.replace(
    /https?:\/\/(?:www\.)?noeldcosta\.com(?:\/[a-z]{2})?\/wp-content\/uploads\//gi,
    '/images/wp/'
  );

  // 3) Repair broken antispam-encoded mailto links.
  //    Source pattern: [\*\*\*@\*\*\*ta.com"> TEXT](<mailto:... apbct-email-encoder ...>)
  //    Each `\*` in the source is TWO chars — literal backslash + literal asterisk —
  //    so the regex needs a group `(?:\\\*)+` (one-or-more "\*" pairs), not `\\\*+`.
  //    The whole match spans multiple lines and ends at the first `)`.
  b = b.replace(
    /\[(?:\\\*)+@(?:\\\*)+ta\.com"?>\s*([^\]]+?)\]\(<mailto:[\s\S]*?\)/g,
    '[$1](mailto:solutions@noeldcosta.com)'
  );

  // 4) Strip zero-width and BOM characters.
  b = b.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // 5) Collapse runs of NBSPs to single spaces.
  b = b.replace(/\u00A0+/g, ' ');

  // 6) Strip srcset width markers leaked into markdown image URLs:
  //    ![alt](path.webp 564w, path-300x200.webp) → ![alt](path.webp)
  b = b.replace(
    /(!\[[^\]]*\]\()([^)\s]+)\s+\d+w(?:,\s+[^)]*)?(\))/g,
    '$1$2$3'
  );

  // 7) Collapse triple+ blank lines to at most two.
  b = b.replace(/\n{4,}/g, '\n\n\n');

  return b;
}

// ── Frontmatter merge ─────────────────────────────────────────────────────────
function mergeFrontmatter(enData, rawData, lang) {
  const fm = { ...enData };

  // Override with translated values where present.
  if (rawData.title) fm.title = rawData.title;
  if (rawData.scrapedH1) fm.h1 = rawData.scrapedH1;
  if (rawData.scrapedMetaDescription) {
    fm.metaDescription = rawData.scrapedMetaDescription;
    // EN sometimes has a separate excerpt — override it too so listings show
    // translated teaser text instead of English.
    fm.excerpt = rawData.scrapedMetaDescription;
  }
  if (rawData.title) {
    // Set metaTitle to translated title when not otherwise provided.
    if (!fm.metaTitle || fm.metaTitle === enData.title) {
      fm.metaTitle = rawData.title;
    }
  }
  if (rawData.scrapedCanonical) fm.canonicalUrl = rawData.scrapedCanonical;

  // Provenance.
  fm.locale = lang;
  fm.translatedFrom = 'en';
  fm.translationSource = 'gtranslate-scrape-cleanup';

  return fm;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function getSlugs(type) {
  const dir = join(CONTENT_DIR, type);
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return []; }
  return entries.filter(e => e.isDirectory()).map(e => e.name).sort();
}

async function processOne(type, slug, lang) {
  const enPath = join(CONTENT_DIR, type, slug, 'en.mdx');
  const rawPath = join(CONTENT_DIR, type, slug, `${lang}.raw.mdx`);
  const outPath = join(CONTENT_DIR, type, slug, `${lang}.mdx`);

  if (!(await fileExists(enPath))) return { status: 'skipped', reason: 'no en.mdx' };
  if (!(await fileExists(rawPath))) return { status: 'skipped', reason: 'no raw.mdx' };

  const [enText, rawText] = await Promise.all([
    readFile(enPath, 'utf8'),
    readFile(rawPath, 'utf8'),
  ]);

  const { data: enData } = matter(enText);
  const { data: rawData, content: rawBody } = matter(rawText);

  const cleanedBody = cleanBody(rawBody);
  const fm = mergeFrontmatter(enData, rawData, lang);
  const output = `${serializeFrontmatter(fm)}\n\n${cleanedBody.trim()}\n`;

  if (!DRY) await writeFile(outPath, output, 'utf8');

  return {
    status: 'written',
    bytes: output.length,
    headings: (cleanedBody.match(/^#{1,6}\s/gm) || []).length,
  };
}

async function main() {
  const startedAt = new Date().toISOString();
  console.log(`\n=== clean-raw-translations.mjs ===`);
  console.log(`Started: ${startedAt}`);
  console.log(`Langs:  ${LANG_FILTER.join(', ')}`);
  console.log(`Type:   ${TYPE_FILTER ?? 'all'}`);
  console.log(`Limit:  ${LIMIT ?? 'none'}`);
  console.log(`Dry:    ${DRY}\n`);

  const types = TYPE_FILTER ? [TYPE_FILTER] : ['posts', 'pages'];
  const stats = { written: 0, skipped: 0, failed: 0, perLang: {} };
  const results = [];
  let count = 0;

  outer:
  for (const type of types) {
    const slugs = await getSlugs(type);
    for (const slug of slugs) {
      for (const lang of LANG_FILTER) {
        if (LIMIT && count >= LIMIT) break outer;
        count++;
        try {
          const r = await processOne(type, slug, lang);
          results.push({ type, slug, lang, ...r });
          if (r.status === 'written') {
            stats.written++;
            stats.perLang[lang] = (stats.perLang[lang] || 0) + 1;
          } else {
            stats.skipped++;
          }
        } catch (err) {
          console.log(`FAIL [${lang}] ${type}/${slug}: ${err.message}`);
          stats.failed++;
          results.push({ type, slug, lang, status: 'failed', error: err.message });
        }
      }
    }
  }

  const finishedAt = new Date().toISOString();
  const report = { startedAt, finishedAt, stats, results };
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log(`\n=== Done ===`);
  console.log(`Written: ${stats.written}`);
  console.log(`Skipped: ${stats.skipped}`);
  console.log(`Failed:  ${stats.failed}`);
  console.log(`Per-lang written:`, stats.perLang);
  console.log(`Report:  ${REPORT_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
