/**
 * retry-failed-images.mjs
 *
 * Retries the 6 image downloads that failed during the initial migration.
 * Reads  : content/image-migration-failures.json
 * Writes : content/image-retry-report.json
 *
 * Run from the noeldcosta-web project root:
 *   node scripts/retry-failed-images.mjs
 *
 * Exit 0 — all files succeeded or already existed.
 * Exit 1 — one or more files still failed.
 */

import fs from 'fs/promises';
import path from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const FAILURES_FILE = 'content/image-migration-failures.json';
const REPORT_FILE   = 'content/image-retry-report.json';
const WP_BASE_URL   = 'https://noeldcosta.com/wp-content/uploads/';
const LOCAL_PREFIX  = 'public/images/wp/';

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept':     'image/webp,image/avif,image/*,*/*;q=0.8',
  'Referer':    'https://noeldcosta.com/',
};

const TIMEOUT_MS   = 60_000;           // 60 s per attempt
const MAX_RETRIES  = 3;
const BACKOFF_MS   = [2_000, 4_000, 8_000]; // delay before attempt 2, 3, 4

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive the local file path from a wp-content URL. */
function urlToLocalPath(url) {
  if (!url.startsWith(WP_BASE_URL)) {
    throw new Error(`URL does not start with expected base: ${url}`);
  }
  const relative = url.slice(WP_BASE_URL.length);
  return path.join(LOCAL_PREFIX, relative);
}

/** Return true if `filePath` already exists and has size > 0. */
async function fileExistsWithContent(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.size > 0;
  } catch {
    return false;
  }
}

/** Sleep for `ms` milliseconds. */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch a URL with a timeout.
 * Returns the Response on success, throws on network error or timeout.
 */
async function fetchWithTimeout(url, headers, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Attempt to download `url` up to MAX_RETRIES times with exponential backoff.
 *
 * Returns:
 *   { status: 'succeeded', bytes, httpStatus }
 *   { status: 'failed', error, httpStatus? }
 */
async function downloadWithRetry(url, localPath) {
  let lastError = null;
  let lastHttpStatus = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = BACKOFF_MS[attempt - 1] ?? 8_000;
      console.log(`    attempt ${attempt + 1}/${MAX_RETRIES} (waiting ${delay / 1000}s) ...`);
      await sleep(delay);
    }

    try {
      const response = await fetchWithTimeout(url, FETCH_HEADERS, TIMEOUT_MS);
      lastHttpStatus = response.status;

      if (!response.ok) {
        lastError = `HTTP ${response.status} ${response.statusText}`;
        console.log(`    HTTP ${response.status} — will retry`);
        continue; // retry on non-2xx
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      // Ensure parent directory exists
      await fs.mkdir(path.dirname(localPath), { recursive: true });

      // Write file
      await fs.writeFile(localPath, buffer);

      console.log(`    saved ${buffer.length.toLocaleString()} bytes -> ${localPath}`);
      return { status: 'succeeded', bytes: buffer.length, httpStatus: lastHttpStatus };

    } catch (err) {
      lastError = err.message ?? String(err);
      console.log(`    network error: ${lastError}`);
      // continue to next retry
    }
  }

  return { status: 'failed', error: lastError, httpStatus: lastHttpStatus };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const startedAt = new Date().toISOString();
console.log(`[retry-failed-images] started at ${startedAt}\n`);

// 1. Read failures list
let failures;
try {
  const raw = await fs.readFile(FAILURES_FILE, 'utf8');
  failures = JSON.parse(raw);
} catch (err) {
  console.error(`ERROR: could not read ${FAILURES_FILE}: ${err.message}`);
  process.exit(1);
}

if (!Array.isArray(failures) || failures.length === 0) {
  console.log('No failures to retry. Exiting.');
  process.exit(0);
}

console.log(`Found ${failures.length} URL(s) to process.\n`);

// 2. Process each URL
const results = [];
let countSucceeded     = 0;
let countAlreadyExists = 0;
let countStillFailed   = 0;

for (const entry of failures) {
  const { url } = entry;

  if (!url || typeof url !== 'string') {
    console.warn('Skipping entry with missing or invalid "url" field:', entry);
    continue;
  }

  console.log(`Processing: ${url}`);

  let localPath;
  try {
    localPath = urlToLocalPath(url);
  } catch (err) {
    console.log(`  ERROR deriving local path: ${err.message}`);
    results.push({ url, localPath: null, status: 'failed', bytes: null, httpStatus: null, error: err.message });
    countStillFailed++;
    continue;
  }

  // Check if already downloaded
  if (await fileExistsWithContent(localPath)) {
    console.log(`  already exists (skipping): ${localPath}`);
    results.push({ url, localPath, status: 'already_exists', bytes: null, httpStatus: null, error: null });
    countAlreadyExists++;
    continue;
  }

  // Attempt download
  const result = await downloadWithRetry(url, localPath);

  if (result.status === 'succeeded') {
    countSucceeded++;
    results.push({
      url,
      localPath,
      status: 'succeeded',
      bytes: result.bytes,
      httpStatus: result.httpStatus,
      error: null,
    });
  } else {
    countStillFailed++;
    console.log(`  FAILED after ${MAX_RETRIES} attempts: ${result.error}`);
    results.push({
      url,
      localPath,
      status: 'failed',
      bytes: null,
      httpStatus: result.httpStatus ?? null,
      error: result.error ?? null,
    });
  }

  console.log('');
}

// 3. Write report
const finishedAt = new Date().toISOString();

const report = {
  startedAt,
  finishedAt,
  attempted:      results.length,
  succeeded:      countSucceeded,
  alreadyExisted: countAlreadyExists,
  stillFailed:    countStillFailed,
  results,
};

await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');

// 4. Summary
console.log('--- Summary ---');
console.log(`  Attempted    : ${report.attempted}`);
console.log(`  Succeeded    : ${report.succeeded}`);
console.log(`  Already existed: ${report.alreadyExisted}`);
console.log(`  Still failed : ${report.stillFailed}`);
console.log(`\nReport written to: ${REPORT_FILE}`);

// 5. Exit code
process.exit(countStillFailed > 0 ? 1 : 0);
