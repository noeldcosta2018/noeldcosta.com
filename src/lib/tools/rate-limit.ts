// TODO: swap to Redis-backed rate-limit before production scale

interface BucketEntry {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 10;

// In-memory store — does NOT survive across serverless invocations.
// Acceptable for MVP; swap for Redis/Upstash before production scale.
const store = new Map<string, BucketEntry>();

export function checkRate(ip: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const existing = store.get(ip);

  if (!existing || now - existing.windowStart >= WINDOW_MS) {
    // Fresh window
    store.set(ip, { count: 1, windowStart: now });
    return { ok: true };
  }

  if (existing.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - existing.windowStart)) / 1000);
    return { ok: false, retryAfter };
  }

  existing.count += 1;
  return { ok: true };
}
