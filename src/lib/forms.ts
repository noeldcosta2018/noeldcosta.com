import type { NextRequest } from "next/server";

// Shared request helpers for the public forms (sign-up, meeting request, chat).
// Rate limiting is per server instance and best effort; it stops casual abuse,
// not a determined attacker. Data lands in Supabase project ERPCV3, tables
// nd_contacts and nd_meeting_requests (server-only, RLS on, no policies).

export const CONSENT_TEXT =
  "I agree to receive occasional emails from Noel D'Costa about new articles, videos and the AI Academy. I can unsubscribe at any time.";

/** Consent wording shown on the AI Ready in 30 Days waitlist form (/ai-academy/). */
export const WAITLIST_CONSENT_TEXT =
  "I agree to receive emails from Noel D'Costa about AI Ready in 30 Days. I can unsubscribe at any time.";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

const buckets = new Map<string, number[]>();

/** True when the caller is within `limit` requests per `windowMs` for `key`. */
export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
  }
  return hits.length <= limit;
}

export function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
