export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getBook } from "@/lib/books";

/**
 * POST /api/books/leads
 *
 * Capture a lead for one of the books on /books. Validates the payload,
 * resolves the book title from the slug (server-side, so the client cannot
 * spoof titles), inserts into `public.book_leads`, then either generates a
 * Supabase Storage signed URL for the PDF (free books) or returns a paid
 * fallback message.
 *
 * Rate limit: simple in-memory token bucket per IP. Production will run on
 * multiple instances; this is best-effort. For real-world abuse swap to
 * Upstash Redis or the Supabase Edge equivalent.
 *
 * Spam dedupe: same (email, bookSlug) within 60s is treated as a no-op
 * success rather than a duplicate row.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BUCKET = "book-files";
const SIGNED_URL_EXPIRY_SECONDS = 600; // 10 minutes
const DEDUPE_WINDOW_MS = 60_000;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 min
const RATE_LIMIT = 10;

interface LeadBody {
  name?: string;
  email?: string;
  bookSlug?: string;
  bookType?: "free" | "paid";
  consentAccepted?: boolean;
}

// ─── in-memory rate limiter (per IP, sliding window) ─────────────────────
const rateMap = new Map<string, number[]>();
function rateLimit(ip: string): boolean {
  const now = Date.now();
  const arr = (rateMap.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  rateMap.set(ip, arr);
  return arr.length <= RATE_LIMIT;
}

// ─── in-memory dedupe (per email+slug, 60s) ──────────────────────────────
const dedupeMap = new Map<string, number>();
function isDuplicate(email: string, slug: string): boolean {
  const key = `${email.toLowerCase()}|${slug}`;
  const last = dedupeMap.get(key) ?? 0;
  const now = Date.now();
  if (now - last < DEDUPE_WINDOW_MS) return true;
  dedupeMap.set(key, now);
  return false;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "0.0.0.0";
}

export async function POST(request: NextRequest) {
  let body: LeadBody;
  try {
    body = (await request.json()) as LeadBody;
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON." },
      { status: 400 },
    );
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const bookSlug = (body.bookSlug ?? "").trim();
  const bookType: "free" | "paid" =
    body.bookType === "paid" ? "paid" : "free";
  const consentAccepted = body.consentAccepted === true;

  // Validation
  if (!name) {
    return Response.json(
      { success: false, error: "Name is required." },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json(
      { success: false, error: "Invalid email." },
      { status: 400 },
    );
  }
  if (!consentAccepted) {
    return Response.json(
      { success: false, error: "Consent is required." },
      { status: 400 },
    );
  }
  if (!bookSlug) {
    return Response.json(
      { success: false, error: "Missing book slug." },
      { status: 400 },
    );
  }

  // Look up the book server-side. Rejects unknown slugs so the client
  // cannot capture leads against books that do not exist.
  const book = getBook(bookSlug);
  if (!book) {
    return Response.json(
      { success: false, error: "Unknown book." },
      { status: 400 },
    );
  }
  const fm = book.frontmatter;
  if (fm.kind !== bookType) {
    return Response.json(
      { success: false, error: "Book type mismatch." },
      { status: 400 },
    );
  }

  // Rate limit (per IP)
  const ip = clientIp(request);
  if (!rateLimit(ip)) {
    return Response.json(
      { success: false, error: "Too many requests. Try again later." },
      { status: 429 },
    );
  }

  // Spam dedupe (per email+slug within 60s)
  if (isDuplicate(email, bookSlug)) {
    return Response.json({ success: true, downloadUrl: null, deduped: true });
  }

  const userAgent = request.headers.get("user-agent") ?? null;

  // Insert into Supabase. Wrapped so a missing env var (env not yet set
  // on the owner side) returns a clear error rather than a 500.
  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (e) {
    return Response.json(
      {
        success: false,
        error:
          e instanceof Error
            ? e.message
            : "Supabase is not configured on the server.",
      },
      { status: 500 },
    );
  }

  const { error: insertError } = await supabase.from("book_leads").insert({
    name,
    email,
    book_title: fm.title,
    book_slug: fm.slug,
    book_type: fm.kind,
    source_page: "/books",
    consent_accepted: true,
    user_agent: userAgent,
    ip_address: ip,
  });

  if (insertError) {
    return Response.json(
      { success: false, error: insertError.message },
      { status: 500 },
    );
  }

  // Free → sign a short URL to the PDF, if a storagePath is set.
  if (fm.kind === "free") {
    const storagePath = fm.storagePath ?? `${fm.slug}.pdf`;
    const { data: signed, error: signError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS);

    if (signError) {
      // The lead row is already saved. Don't fail the request — the owner
      // can email the link manually if the bucket/file isn't there yet.
      return Response.json({
        success: true,
        downloadUrl: null,
        message:
          "We have your details. The download link will arrive by email.",
      });
    }

    return Response.json({
      success: true,
      downloadUrl: signed?.signedUrl ?? null,
    });
  }

  // Paid → graceful fallback until Stripe is wired.
  return Response.json({
    success: true,
    downloadUrl: null,
    checkoutUrl: null,
    message:
      "We have your details. The download link will arrive by email after payment.",
  });
}
