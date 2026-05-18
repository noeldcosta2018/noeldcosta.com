/**
 * Mechanical pass that applies the deterministic blog-editor.md SOP fixes
 * across every English blog post in content/posts. Auto-fixes the items
 * that have unambiguous rules; flags warnings for items that need an
 * editor's judgment (title length, missing inline imagery, missing
 * frontmatter fields).
 *
 * Auto-fix scope (safe across the whole archive):
 *   - Remove duplicate body H1 if it matches frontmatter title
 *   - Insert "## Frequently asked questions" before the first <details>
 *     block when missing (and strip a stray --- separator just above it)
 *   - Unescape backslash-escaped ASCII punctuation in heading text
 *     (e.g. "## 1\. Big Bang" -> "## 1. Big Bang")
 *   - Convert top-level bullet lists of 3+ consecutive items to numbered
 *     lists. Skips nested lists, fenced code, and indented bullets.
 *   - Bump lastReviewed to today on any file that was modified
 *
 * Warning-only (no auto-fix):
 *   - title or metaTitle over 60 chars
 *   - metaDescription over 160 chars
 *   - no inline body image (![]() syntax) anywhere in body
 *   - missing experienceSource frontmatter
 *
 * Run with: node scripts/blog-sop-audit.mjs
 * Add --dry to preview without writing.
 */

import fs from 'node:fs';
import path from 'node:path';

const POSTS_DIR = 'content/posts';
const TODAY = new Date().toISOString().slice(0, 10);
const DRY = process.argv.includes('--dry');

function findEnMdx() {
  return fs.readdirSync(POSTS_DIR)
    .map(slug => path.join(POSTS_DIR, slug, 'en.mdx'))
    .filter(p => fs.existsSync(p));
}

function parseFrontmatter(content) {
  const m = content.match(/^﻿?---\r?\n([\s\S]+?)\r?\n---\r?\n/);
  if (!m) return { fm: {}, body: content, fmEnd: 0 };
  const fm = {};
  m[1].split(/\r?\n/).forEach(line => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    fm[key] = val;
  });
  return { fm, body: content.slice(m[0].length), fmEnd: m[0].length };
}

/**
 * Remove "# Title" body H1 if it appears in the first ~5 non-empty lines
 * and matches (case-insensitive) the frontmatter title. ArticleHero owns
 * the page H1 already; the body H1 creates a duplicate.
 */
function stripBodyH1(body, fmTitle) {
  const lines = body.split('\n');
  let nonEmptyCount = 0;
  for (let i = 0; i < lines.length && nonEmptyCount < 5; i++) {
    if (lines[i].trim() === '') continue;
    nonEmptyCount++;
    const m = lines[i].match(/^#\s+(.+?)\s*$/);
    if (!m) continue;
    const bodyH1 = m[1].trim().toLowerCase();
    const fmTitleLc = (fmTitle || '').trim().toLowerCase();
    // Strip if (a) it matches frontmatter title, or (b) frontmatter title
    // is absent (defensive — we cannot tell, but a single body H1 still
    // duplicates whatever the page H1 will be)
    if (!fmTitleLc || bodyH1 === fmTitleLc) {
      lines.splice(i, 1);
      if (i < lines.length && lines[i].trim() === '') lines.splice(i, 1);
      return { body: lines.join('\n'), modified: true };
    }
  }
  return { body, modified: false };
}

/**
 * Unescape backslash-escaped ASCII punct in heading text.
 * "## 1\. Big Bang" -> "## 1. Big Bang"
 */
function unescapeHeadings(body) {
  let modified = false;
  const out = body.split('\n').map(line => {
    if (!/^#{1,6}\s/.test(line)) return line;
    const before = line;
    const after = line.replace(/\\([!-/:-@[-`{-~])/g, '$1');
    if (after !== before) modified = true;
    return after;
  }).join('\n');
  return { body: out, modified };
}

/**
 * Insert "## Frequently asked questions" above the first <details> block
 * when the body has at least one <details> and no FAQ H2.
 */
function insertFaqH2(body) {
  if (!/<details/i.test(body)) return { body, modified: false };
  if (/^##\s+Frequently/im.test(body)) return { body, modified: false };

  // Find the start of the line containing the first <details>
  const detailsIdx = body.search(/<details/i);
  if (detailsIdx === -1) return { body, modified: false };
  const lineStart = body.lastIndexOf('\n', detailsIdx - 1) + 1;
  let before = body.slice(0, lineStart);
  let after = body.slice(lineStart);

  // Strip a stray "---" thematic break that sometimes sits just before
  // the FAQ block (legacy WordPress separator); the H2 replaces it.
  before = before.replace(/(\n)?---\n+(\s*\n)*$/m, '\n\n');

  return {
    body: before.replace(/\n*$/, '\n\n') + '## Frequently asked questions\n\n' + after,
    modified: true
  };
}

/**
 * Convert runs of 3+ consecutive top-level bullets ("^- ") to a numbered
 * list (1., 2., 3., ...). Skips fenced code blocks, indented (nested)
 * bullets, and runs of fewer than 3.
 *
 * Conservative: does not touch lines inside <details> / <summary> blocks,
 * because those are FAQ Q/A content and applying autoformat to them risks
 * mangling the answers (e.g. lists used as inline reference in an answer).
 */
function bulletsToNumbered(body) {
  const lines = body.split('\n');
  let inFence = false;
  let inDetails = 0;
  let modified = false;
  let i = 0;
  while (i < lines.length) {
    if (/^```/.test(lines[i])) { inFence = !inFence; i++; continue; }
    if (inFence) { i++; continue; }
    if (/<details/i.test(lines[i])) inDetails++;
    if (/<\/details/i.test(lines[i])) inDetails = Math.max(0, inDetails - 1);
    if (inDetails > 0) { i++; continue; }

    if (/^- /.test(lines[i])) {
      let j = i;
      while (j < lines.length && /^- /.test(lines[j])) j++;
      const runLen = j - i;
      if (runLen >= 3) {
        for (let k = i; k < j; k++) {
          lines[k] = `${k - i + 1}. ` + lines[k].slice(2);
        }
        modified = true;
      }
      i = j;
    } else {
      i++;
    }
  }
  return { body: lines.join('\n'), modified };
}

/**
 * Bump lastReviewed in frontmatter to today, or add it after `updated:`
 * if missing.
 */
function bumpLastReviewed(content) {
  if (/^lastReviewed:\s*"[^"]*"$/m.test(content)) {
    return content.replace(/^lastReviewed:\s*"[^"]*"$/m, `lastReviewed: "${TODAY}"`);
  }
  if (/^updated:\s*"[^"]*"$/m.test(content)) {
    return content.replace(/^(updated:\s*"[^"]*")$/m, `$1\nlastReviewed: "${TODAY}"`);
  }
  return content;
}

function processFile(filepath) {
  const original = fs.readFileSync(filepath, 'utf8');
  const { fm, body, fmEnd } = parseFrontmatter(original);
  if (fmEnd === 0) {
    return { filepath, ops: [], warnings: ['no frontmatter (skipped)'] };
  }

  let working = body;
  const ops = [];

  const r1 = stripBodyH1(working, fm.title);
  if (r1.modified) { ops.push('stripped body H1'); working = r1.body; }

  const r2 = unescapeHeadings(working);
  if (r2.modified) { ops.push('unescaped heading punct'); working = r2.body; }

  const r3 = insertFaqH2(working);
  if (r3.modified) { ops.push('inserted FAQ H2'); working = r3.body; }

  const r4 = bulletsToNumbered(working);
  if (r4.modified) { ops.push('numbered bullets'); working = r4.body; }

  const changed = ops.length > 0;
  let newContent = original.slice(0, fmEnd) + working;
  if (changed) {
    newContent = bumpLastReviewed(newContent);
    ops.push('bumped lastReviewed');
  }

  const warnings = [];
  if (fm.title && fm.title.length > 60) warnings.push(`title=${fm.title.length}c`);
  if (fm.metaTitle && fm.metaTitle.length > 60) warnings.push(`metaTitle=${fm.metaTitle.length}c`);
  if (fm.metaDescription && fm.metaDescription.length > 160) warnings.push(`metaDescription=${fm.metaDescription.length}c`);
  if (!/!\[/.test(body)) warnings.push('no inline image');
  if (!fm.experienceSource) warnings.push('no experienceSource');

  if (changed && !DRY) fs.writeFileSync(filepath, newContent, 'utf8');

  return { filepath, ops, warnings };
}

const files = findEnMdx();
const results = files.map(processFile);

console.log(`\n=== SOP audit across ${files.length} English posts${DRY ? ' (DRY)' : ''} ===\n`);

let touched = 0, warnedFiles = 0;
const counts = { 'stripped body H1': 0, 'unescaped heading punct': 0, 'inserted FAQ H2': 0, 'numbered bullets': 0 };
const warnCounts = {};

for (const r of results) {
  if (r.ops.length === 0 && r.warnings.length === 0) continue;
  const slug = path.basename(path.dirname(r.filepath));
  const left = r.ops.length ? `✅ ${r.ops.join(', ')}` : '';
  const right = r.warnings.length ? `⚠ ${r.warnings.join(', ')}` : '';
  console.log(`${slug}`);
  if (left) console.log(`  ${left}`);
  if (right) console.log(`  ${right}`);
  if (r.ops.length) touched++;
  if (r.warnings.length) warnedFiles++;
  for (const op of r.ops) if (counts[op] !== undefined) counts[op]++;
  for (const w of r.warnings) {
    const key = w.split('=')[0].split(' ')[0];
    warnCounts[key] = (warnCounts[key] || 0) + 1;
  }
}

console.log(`\n=== summary ===`);
console.log(`${touched}/${files.length} files modified, ${warnedFiles} files with warnings.\n`);
console.log('auto-fixes applied:');
for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(28)} ${v}`);
console.log('\nwarnings to triage:');
for (const [k, v] of Object.entries(warnCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(28)} ${v}`);
}
