// Scan migrated MDX for WP image URLs, download them, rewrite MDX to local paths.
// Output: public/images/wp/<path-mirrored-from-wp-content-uploads>
// Usage: node scripts/migrate-images.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const contentRoot = join(repoRoot, 'content');
const imgRoot = join(repoRoot, 'public', 'images', 'wp');

// --- Walk content/ and collect all MDX files ---
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (entry.endsWith('.mdx')) out.push(p);
  }
  return out;
}

const mdxFiles = walk(contentRoot);
console.log(`Scanning ${mdxFiles.length} MDX files...`);

// --- Extract unique WP image URLs ---
const URL_RE = /https:\/\/noeldcosta\.com\/wp-content\/uploads\/([^\s)"'\]]+)/g;
const urls = new Map(); // url -> relative path under wp-content/uploads

for (const file of mdxFiles) {
  const text = readFileSync(file, 'utf8');
  let m;
  while ((m = URL_RE.exec(text))) {
    const full = m[0];
    const rel = m[1];
    // Strip any trailing punctuation regex might have greedy-grabbed
    const clean = rel.replace(/[.,;)]+$/, '');
    urls.set(`https://noeldcosta.com/wp-content/uploads/${clean}`, clean);
  }
}

console.log(`Found ${urls.size} unique images to download`);

// --- Download with concurrency ---
const CONCURRENCY = 8;
const failed = [];
let done = 0;

async function downloadOne(url, relPath) {
  const dest = join(imgRoot, relPath);
  if (existsSync(dest)) { done++; return; }
  mkdirSync(dirname(dest), { recursive: true });
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (migration)' },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(dest, buf);
    done++;
    if (done % 25 === 0) console.log(`  ${done}/${urls.size}`);
  } catch (e) {
    failed.push({ url, error: e.message });
  }
}

const entries = [...urls.entries()];
async function runBatch() {
  const queue = [...entries];
  async function worker() {
    while (queue.length) {
      const [url, rel] = queue.shift();
      await downloadOne(url, rel);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
}

await runBatch();

console.log(`\nDownloaded ${done}/${urls.size}`);
if (failed.length) {
  console.log(`Failed: ${failed.length}`);
  writeFileSync(join(repoRoot, 'content', 'image-migration-failures.json'), JSON.stringify(failed, null, 2));
}

// --- Rewrite MDX files to use local paths ---
console.log('\nRewriting MDX to local paths...');
let rewritten = 0;
for (const file of mdxFiles) {
  const original = readFileSync(file, 'utf8');
  const updated = original.replace(
    /https:\/\/noeldcosta\.com\/wp-content\/uploads\/([^\s)"'\]]+?)([.,;)]?)(["'\s)\]]|$)/g,
    (_match, path, trailing, end) => `/images/wp/${path.replace(/[.,;)]+$/, '')}${trailing}${end}`
  );
  if (updated !== original) {
    writeFileSync(file, updated, 'utf8');
    rewritten++;
  }
}
console.log(`Rewrote ${rewritten} MDX files`);
