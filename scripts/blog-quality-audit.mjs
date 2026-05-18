/**
 * Quality scan across every English blog post in content/posts.
 *
 * The mechanical SOP script (blog-sop-audit.mjs) handled structural defects:
 * duplicate H1s, missing FAQ H2s, list numbering. This script handles the
 * editorial / voice layer. Read-only — never modifies files. Outputs a
 * per-article report plus an archive summary.
 *
 * Checks (sourced from VOICE.md and blog-editor.md):
 *
 *   AI-tell openers — opening sentences that pattern-match generated content
 *     ("In today's...", "In an era of...", "It's no secret that...", "Picture this:")
 *
 *   Banned phrases — words that are hard-banned by VOICE.md because they
 *     correlate with AI-generated content or marketing fluff
 *     ("delve", "robust", "seamless", "leverage", "unlock", "empower",
 *      "synergy", "world-class", "cutting-edge", "innovative", etc.)
 *
 *   Banned transitions — formal connectives that real human writers drop
 *     ("Furthermore", "Moreover", "Additionally", "That being said")
 *
 *   Banned closers — "wrap-up" patterns that signal generated content
 *     ("In summary", "I hope this helps", "By following these steps")
 *
 *   Em-dash drama — "X doesn't just Y, it Z" and similar structures
 *
 *   Long sentences — count sentences exceeding 30 words (run-on tell)
 *
 *   Vague metaphors — "tapestry", "landscape", "realm", "sphere", "arena"
 *     used metaphorically (often AI-generated metaphorical flourishes)
 *
 *   Specificity probe — counts named entities (years, percentages, $ figures,
 *     named clients/systems). Low count signals abstract writing.
 *
 * Run: node scripts/blog-quality-audit.mjs [slug-filter]
 */

import fs from 'node:fs';
import path from 'node:path';

const POSTS_DIR = 'content/posts';
const FILTER = process.argv[2];

const BANNED_OPENERS = [
  /^In today'?s\b/i,
  /^In an era of/i,
  /^In the rapidly evolving/i,
  /^As businesses increasingly/i,
  /^It'?s no secret that/i,
  /^Have you ever wondered/i,
  /^Picture this:/i,
];

const BANNED_PHRASES = [
  'delve', 'tapestry', 'landscape of', 'realm of', 'sphere of', 'arena of',
  'robust', 'seamless', 'innovative', 'cutting-edge', 'best-in-class',
  'world-class', 'next-generation', 'transformative', 'game-changer',
  'leverage', 'unlock', 'empower', 'synergy', 'synergies',
  'AI-powered', 'AI-driven',
  'transformation journey',
  "it'?s crucial to understand",
  'plays a pivotal role',
  'a testament to',
  "stands as",
];

const BANNED_TRANSITIONS = [
  'Furthermore,', 'Moreover,', 'Additionally,',
  'That being said', 'With that in mind',
  "It'?s important to note that", "It'?s worth mentioning",
];

const BANNED_CLOSERS = [
  /In summary,/i,
  /I hope this helps/i,
  /Hopefully this (guide|article|post)/i,
  /By following these steps/i,
  /Remember that the key/i,
];

const DRAMA_PATTERNS = [
  /\bdoesn'?t just \w+,/gi,                  // "doesn't just X, ..."
  /\bnot just \w+,? it/gi,                   // "not just X, it"
];

function stripFrontmatter(s) {
  const m = s.match(/^﻿?---\r?\n[\s\S]+?\r?\n---\r?\n/);
  return m ? s.slice(m[0].length) : s;
}

function stripCode(s) {
  return s.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');
}

function stripMdxTags(s) {
  // remove <details>...</details>, custom diagram tags, raw HTML
  return s.replace(/<[^>]+>/g, '');
}

function countSentences(text, longWordThreshold = 30) {
  // crude but useful: split on . ! ? followed by space/newline + capital or end
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z(])/);
  let longCount = 0;
  for (const s of sentences) {
    const wordCount = s.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > longWordThreshold) longCount++;
  }
  return { total: sentences.length, long: longCount };
}

function findMatches(text, pattern) {
  const re = pattern instanceof RegExp ? pattern : new RegExp(`\\b${pattern}\\b`, 'gi');
  const hits = [];
  let m;
  const safeRe = re.global ? re : new RegExp(re.source, re.flags + 'g');
  while ((m = safeRe.exec(text)) !== null) {
    const start = Math.max(0, m.index - 30);
    const end = Math.min(text.length, m.index + m[0].length + 30);
    hits.push({ index: m.index, snippet: text.slice(start, end).replace(/\s+/g, ' ').trim() });
    if (hits.length >= 3) break; // cap per pattern
  }
  return hits;
}

function specificityProbe(text) {
  // count concrete signal markers
  const years = (text.match(/\b(19|20)\d{2}\b/g) || []).length;
  const percentages = (text.match(/\b\d+(\.\d+)?%/g) || []).length;
  const money = (text.match(/\$\d|[$£€]\s?\d/g) || []).length;
  const namedClients = (text.match(/\b(Etihad|EDGE Group|ADNOC|PIF|DXC|Aramco|UAE Government|TII|EDGE)\b/g) || []).length;
  const sapVersions = (text.match(/\bS\/4HANA\b|\bECC\b|\bBTP\b|\bRISE with SAP\b|\bGROW with SAP\b|\bSAP Activate\b|\bABAP\b/g) || []).length;
  return { years, percentages, money, namedClients, sapVersions, total: years + percentages + money + namedClients + sapVersions };
}

function audit(filepath) {
  const raw = fs.readFileSync(filepath, 'utf8');
  const fm = raw.match(/^﻿?---\r?\n([\s\S]+?)\r?\n---\r?\n/);
  const body = stripFrontmatter(raw);
  const clean = stripMdxTags(stripCode(body));
  const slug = path.basename(path.dirname(filepath));

  // Word count
  const words = clean.trim().split(/\s+/).filter(Boolean).length;

  // Openers
  const firstPara = clean.split(/\n\n/).find(p => p.trim().length > 30) || '';
  const openerHits = BANNED_OPENERS.filter(p => p.test(firstPara.trim())).map(p => p.source);

  // Closers — last 500 chars
  const tail = clean.slice(-800);
  const closerHits = BANNED_CLOSERS.filter(p => p.test(tail)).map(p => p.source);

  // Phrase scan
  const phraseHits = {};
  for (const phrase of BANNED_PHRASES) {
    const re = new RegExp(`\\b${phrase}\\b`, 'gi');
    const hits = findMatches(clean, re);
    if (hits.length > 0) phraseHits[phrase] = hits;
  }
  for (const phrase of BANNED_TRANSITIONS) {
    const re = new RegExp(`\\b${phrase}`, 'g');
    const hits = findMatches(clean, re);
    if (hits.length > 0) phraseHits[phrase] = hits;
  }

  // Drama patterns
  const dramaHits = {};
  for (const dp of DRAMA_PATTERNS) {
    const hits = findMatches(clean, dp);
    if (hits.length > 0) dramaHits[dp.source] = hits;
  }

  // Sentence length
  const sentenceStats = countSentences(clean);

  // Em-dash count (drama signal when used heavily)
  const emDashCount = (clean.match(/—|–/g) || []).length;

  // Specificity
  const spec = specificityProbe(clean);

  return {
    slug, words,
    openerHits, closerHits, phraseHits, dramaHits,
    sentenceStats, emDashCount, spec,
  };
}

const files = fs.readdirSync(POSTS_DIR)
  .filter(s => !FILTER || s.includes(FILTER))
  .map(s => path.join(POSTS_DIR, s, 'en.mdx'))
  .filter(p => fs.existsSync(p));

const reports = files.map(audit);

console.log(`\n=== Quality scan: ${reports.length} English posts ===\n`);

let highIssue = 0;
const summary = {
  banned_openers: 0, banned_closers: 0, banned_phrases: 0,
  drama_patterns: 0, long_sentences_3plus: 0,
  heavy_em_dash: 0, low_specificity: 0,
};

const sorted = [...reports].sort((a, b) => {
  const score = r => Object.keys(r.phraseHits).length * 3
    + Object.keys(r.dramaHits).length * 2
    + (r.openerHits.length + r.closerHits.length) * 4
    + (r.sentenceStats.long > 5 ? 2 : 0)
    + (r.spec.total < 3 ? 3 : 0);
  return score(b) - score(a);
});

for (const r of sorted) {
  const issues = [];
  if (r.openerHits.length) { issues.push(`opener: ${r.openerHits[0]}`); summary.banned_openers++; }
  if (r.closerHits.length) { issues.push(`closer: ${r.closerHits[0]}`); summary.banned_closers++; }
  const phraseList = Object.keys(r.phraseHits);
  if (phraseList.length) { issues.push(`phrases: ${phraseList.slice(0, 6).join(', ')}${phraseList.length > 6 ? '…' : ''}`); summary.banned_phrases += phraseList.length; }
  const dramaList = Object.keys(r.dramaHits);
  if (dramaList.length) { issues.push(`drama patterns: ${dramaList.length}`); summary.drama_patterns += dramaList.length; }
  if (r.sentenceStats.long >= 3) { issues.push(`long sentences: ${r.sentenceStats.long}`); summary.long_sentences_3plus++; }
  if (r.emDashCount > 15) { issues.push(`em-dashes: ${r.emDashCount}`); summary.heavy_em_dash++; }
  if (r.spec.total < 3) { issues.push(`specificity probe low (${r.spec.total} markers)`); summary.low_specificity++; }

  if (issues.length === 0) continue;
  highIssue++;
  console.log(`${r.slug}  [${r.words}w]`);
  for (const i of issues) console.log(`  · ${i}`);
}

console.log(`\n=== Summary ===`);
console.log(`Articles with quality issues:  ${highIssue}/${reports.length}`);
console.log(`Banned openers:                ${summary.banned_openers}`);
console.log(`Banned closers:                ${summary.banned_closers}`);
console.log(`Banned phrase occurrences:     ${summary.banned_phrases}`);
console.log(`Em-dash drama patterns:        ${summary.drama_patterns}`);
console.log(`Articles with 3+ long sentences: ${summary.long_sentences_3plus}`);
console.log(`Articles with heavy em-dashes (>15): ${summary.heavy_em_dash}`);
console.log(`Articles with low specificity (<3 markers): ${summary.low_specificity}`);
