#!/usr/bin/env node
/**
 * scripts/check-rtl-properties.mjs
 *
 * Warn-only RTL audit. Scans .tsx files under src/ for physical-direction
 * Tailwind classes that should be using logical (start/end) equivalents
 * so Arabic + future RTL locales render correctly.
 *
 * Block 7 (Phase 4 of the i18n migration) migrated the bulk of the
 * existing physical usages to logical. This script catches regressions
 * (new code added after Block 7 that uses ml-* / mr-* / pl-* / etc.)
 * before they reach Vercel where the Arabic preview surfaces them.
 *
 *   node scripts/check-rtl-properties.mjs            # warn-only, exits 0
 *   node scripts/check-rtl-properties.mjs --strict   # exit 1 on any hit
 *   node scripts/check-rtl-properties.mjs --help     # this message
 *
 * Notes:
 *   - The script scans className attributes only. Inline `style={{...}}`
 *     with marginLeft / right: 12 etc. is not flagged here (separate
 *     small surface, easier to spot in code review).
 *   - `(site-en)/` and `admin/` routes are scanned but their violations
 *     are de-emphasised in the report — those paths are English-only or
 *     internal and don't render under Arabic.
 *   - Tailwind v3.3+ ships the logical utilities natively (ms-, me-,
 *     ps-, pe-, start-, end-, border-s, border-e, rounded-s, rounded-e,
 *     text-start, text-end). No plugin needed.
 *
 * The intent is "warn now, fix in code review". Block 7's migration is
 * the bulk fix; this script is the backstop so the migration sticks.
 * Flip to strict mode (wire into `lint` script) after the post-launch
 * dust settles.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const SRC = join(ROOT, 'src');

// Physical-property anti-patterns we want to surface. Each entry has:
//   pattern: a regex tested against the matched className substring
//   fix:     the canonical logical replacement (for the report)
const PATTERNS = [
  { re: /\b(?:-)?ml-(?:\d+(?:\.5)?|auto|px|\[[^\]]+\])\b/g, fix: 'ms-* (margin-inline-start)' },
  { re: /\b(?:-)?mr-(?:\d+(?:\.5)?|auto|px|\[[^\]]+\])\b/g, fix: 'me-* (margin-inline-end)' },
  { re: /\b(?:-)?pl-(?:\d+(?:\.5)?|auto|px|\[[^\]]+\])\b/g, fix: 'ps-* (padding-inline-start)' },
  { re: /\b(?:-)?pr-(?:\d+(?:\.5)?|auto|px|\[[^\]]+\])\b/g, fix: 'pe-* (padding-inline-end)' },
  { re: /\btext-(?:left|right)\b/g, fix: 'text-start / text-end' },
  { re: /\b(?:-)?(?:left|right)-(?:\d+(?:\.5)?|auto|px|full|\[[^\]]+\]|1\/\d+|2\/\d+|3\/\d+)\b/g, fix: 'start-* / end-*' },
  { re: /\bborder-(?:l|r)(?:-|\b)/g, fix: 'border-s / border-e' },
  { re: /\brounded-(?:l|r|tl|tr|bl|br)(?:-|\b)/g, fix: 'rounded-s / rounded-e / rounded-ss / rounded-se / rounded-es / rounded-ee' },
  { re: /\bbg-gradient-to-(?:l|r)\b/g, fix: 'bg-gradient-to-s / bg-gradient-to-e (or explicit rtl: variant)' },
];

// className="..." or className={`...`} or className={clsx(...)} etc.
// The simplest reliable extraction: any string literal (single, double, backtick)
// that appears inside a className= attribute. We use a wider regex to find
// className contexts, then scan their contents.
const CLASSNAME_CTX = /className=(?:"([^"]+)"|'([^']+)'|\{([^}]+)\}|`([^`]+)`)/g;

const args = new Set(process.argv.slice(2));
const STRICT = args.has('--strict');
if (args.has('--help') || args.has('-h')) {
  process.stdout.write(readFileSync(fileURLToPath(import.meta.url), 'utf8')
    .split('\n').slice(2, 32).map((l) => l.replace(/^ \* ?/, '')).join('\n'));
  process.exit(0);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) { walk(p, out); continue; }
    if (p.endsWith('.tsx')) out.push(p);
  }
  return out;
}

const findings = [];
for (const file of walk(SRC)) {
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let cm;
    CLASSNAME_CTX.lastIndex = 0;
    while ((cm = CLASSNAME_CTX.exec(line)) !== null) {
      const body = cm[1] || cm[2] || cm[3] || cm[4] || '';
      for (const { re, fix } of PATTERNS) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(body)) !== null) {
          findings.push({
            file: relative(ROOT, file).split(sep).join('/'),
            line: i + 1,
            match: m[0],
            fix,
            context: line.trim().slice(0, 140),
          });
        }
      }
    }
  }
}

// Sort: site-en/ and admin/ last so the report leads with the routes that
// render under Arabic.
function priority(f) {
  if (f.file.startsWith('src/components/')) return 0;
  if (f.file.startsWith('src/app/(site-intl)')) return 1;
  if (f.file.startsWith('src/app/(site-en)')) return 2;
  if (f.file.includes('admin')) return 3;
  return 4;
}
findings.sort((a, b) => priority(a) - priority(b) || a.file.localeCompare(b.file) || a.line - b.line);

const byFile = new Map();
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file).push(f);
}

const out = process.stderr;
out.write(`\nRTL physical-property scan — ${findings.length} occurrence(s) across ${byFile.size} file(s)\n`);
out.write('('+'='.repeat(70)+')\n');

for (const [file, items] of byFile) {
  const tag = file.startsWith('src/app/(site-en)') ? ' [English-only]'
            : file.includes('admin')               ? ' [admin]'
            : '';
  out.write(`\n${file}${tag}\n`);
  for (const it of items) {
    out.write(`  L${it.line}  ${it.match.padEnd(20)} → ${it.fix}\n`);
  }
}

out.write(`\nTotal: ${findings.length} occurrence(s).\n`);
out.write('Logical-property reference: _docs/coding-conventions.md (RTL section)\n');

if (STRICT && findings.length > 0) {
  out.write('\nFAIL (--strict): physical-direction classes found.\n');
  process.exit(1);
}
process.exit(0);
