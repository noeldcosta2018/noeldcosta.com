/**
 * scripts/lib/openai-shared.mjs
 *
 * Shared OpenAI client + helpers used by both `scripts/translate-content.mjs`
 * and `scripts/translate-ui-strings.mjs`. Centralizes API constants, retry
 * logic, JSON-mode translation calls, rate-limit capture, and cost math so
 * both translation scripts stay in lockstep on pricing, timeouts, and the
 * per-locale tonal hints.
 */

import { readFileSync } from 'node:fs';

// ── Model + pricing ──────────────────────────────────────────────────────────

export const MODEL_NAME = 'gpt-5.4';
// USD per million tokens
export const MODEL_PRICING = { input: 2.50, output: 15.00 };

// ── Auth ────────────────────────────────────────────────────────────────────

export const OPENAI_KEY_PATH = 'C:\\Users\\noel_\\.config\\openai\\key.txt';

// ── Timeouts ────────────────────────────────────────────────────────────────
// Per-call timeouts. The first try uses DEFAULT; if it times out we escalate
// to EXTENDED once and retry. The default-run's only failure was a body call
// that exceeded the SDK's stock 10-min timeout on a 84KB source file.
export const DEFAULT_TIMEOUT_MS = 600_000;   // 10 min — covers the ~5min p99 we saw
export const EXTENDED_TIMEOUT_MS = 1_200_000; // 20 min — for retry after a timeout

// ── Target languages ────────────────────────────────────────────────────────

export const TARGET_LANGUAGES = [
  'ar', 'de', 'el', 'es', 'fr', 'it', 'ja', 'nl', 'pt', 'ru',
];

export const LANG_NAMES = {
  ar: 'Arabic', de: 'German', el: 'Greek', es: 'Spanish',
  fr: 'French', it: 'Italian', ja: 'Japanese', nl: 'Dutch',
  pt: 'Portuguese', ru: 'Russian',
};

export const LANG_REGISTER = {
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

// ── Token-estimation constants (dry-run cost estimator) ─────────────────────
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
export const TOKENS_PER_INPUT_CHAR_EN = 0.30;  // English source → input tokens
export const OUTPUT_TOKENS_PER_INPUT_CHAR_HIGH = 0.34;  // ar/el/ja/ru
export const OUTPUT_TOKENS_PER_INPUT_CHAR_NORMAL = 0.20; // de/es/fr/it/nl/pt
export const HIGH_DENSITY_LANGS = new Set(['ar', 'el', 'ja', 'ru']);
export const SYSTEM_PROMPT_TOKENS_BODY = 700;  // approx tokens for the body system prompt
export const SYSTEM_PROMPT_TOKENS_JSON = 250;  // approx tokens for the JSON system prompt

export function getOutputTokensPerCharForLang(lang) {
  return HIGH_DENSITY_LANGS.has(lang)
    ? OUTPUT_TOKENS_PER_INPUT_CHAR_HIGH
    : OUTPUT_TOKENS_PER_INPUT_CHAR_NORMAL;
}

// ── Auth + client ──────────────────────────────────────────────────────────

export function loadApiKey() {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) {
    return process.env.OPENAI_API_KEY.trim();
  }
  const raw = readFileSync(OPENAI_KEY_PATH, 'utf8');
  const key = raw.trim();
  if (!key) throw new Error(`Key file at ${OPENAI_KEY_PATH} is empty.`);
  return key;
}

export async function loadOpenAiClient() {
  const apiKey = loadApiKey();
  const { default: OpenAI } = await import('openai');
  // Client-level timeout sets the SDK's per-request default; can be
  // overridden per-call via the second arg to .create({...}, { timeout }).
  return new OpenAI({ apiKey, timeout: DEFAULT_TIMEOUT_MS });
}

// ── Rate-limit capture ─────────────────────────────────────────────────────
// Rate-limit headers from the first successful body response. The OpenAI
// API returns x-ratelimit-* on every response; capturing once is enough to
// answer "how much headroom do we have?" without per-call noise.
let rateLimitSnapshot = null;

export function captureRateLimitHeaders(rawResponse) {
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

export function getRateLimitSnapshot() {
  return rateLimitSnapshot;
}

// ── Retry / timeout helper ─────────────────────────────────────────────────

export function isTimeoutError(err) {
  if (!err) return false;
  const name = err?.name || err?.constructor?.name || '';
  if (name === 'APIConnectionTimeoutError') return true;
  const msg = String(err?.message || err || '').toLowerCase();
  return /timed?\s*out|timeout/.test(msg);
}

// JSON-mode count mismatch: callJsonTranslate throws
//   "JSON response had X items; expected Y."
// when the model drops items from a long JSON array (an intermittent
// OpenAI JSON-mode behaviour observed on chunks of ~15+ strings). The
// retry usually succeeds on its own, so withRetry treats this exactly
// like a transient HTTP error. The match is narrow on purpose — we
// don't want to retry an actually-broken response shape.
export function isJsonCountMismatchError(err) {
  if (!err) return false;
  const msg = String(err?.message || err || '');
  return /JSON response had .+ items; expected \d+/.test(msg);
}

// Unified retry: factory takes an optional timeoutMs (undefined → SDK default).
// First attempt uses no override (DEFAULT_TIMEOUT_MS via client config).
// On a TIMEOUT specifically, retry once with EXTENDED_TIMEOUT_MS — logged so we
// can see in the run log which files needed it.
// On transient HTTP errors (429/5xx, ECONN*), exponential backoff up to 3 tries.
export async function withRetry(label, requestFactory) {
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
        /ECONN|ENOTFOUND|EAI_AGAIN|socket hang up/i.test(String(err?.code || err?.message || '')) ||
        isJsonCountMismatchError(err);
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

// ── Generalized JSON-mode translation call ─────────────────────────────────
// Takes the system prompt as a string argument so different scripts can
// supply their own prompt (frontmatter / component-props / messages-ui).
// Returns the parsed translations array plus token usage and elapsed time.
export async function callJsonTranslate(client, model, lang, strings, systemPrompt, timeoutMs) {
  const t0 = Date.now();
  const reqOpts = timeoutMs ? { timeout: timeoutMs } : undefined;
  const res = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(strings) },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  }, reqOpts);
  const elapsedMs = Date.now() - t0;
  const raw = res.choices?.[0]?.message?.content ?? '{}';
  let parsed;
  try { parsed = JSON.parse(raw); } catch {
    throw new Error(`JSON response was not valid JSON: ${raw.slice(0, 200)}`);
  }
  const arr = Array.isArray(parsed.translations) ? parsed.translations
            : Array.isArray(parsed.items) ? parsed.items
            : Array.isArray(parsed) ? parsed
            : null;
  if (!arr || arr.length !== strings.length) {
    throw new Error(`JSON response had ${arr?.length ?? 'no'} items; expected ${strings.length}.`);
  }
  const usage = res.usage || {};
  return {
    translations: arr,
    promptTokens: usage.prompt_tokens || 0,
    completionTokens: usage.completion_tokens || 0,
    elapsedMs,
  };
}

// ── Cost math ──────────────────────────────────────────────────────────────

export function calcCost(promptTokens, completionTokens) {
  return (promptTokens / 1_000_000) * MODEL_PRICING.input +
         (completionTokens / 1_000_000) * MODEL_PRICING.output;
}
