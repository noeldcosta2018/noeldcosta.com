export const runtime = "nodejs";

import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * Email subscribe — STUB.
 *
 * Accepts the full payload from the /books BookModal. Validates the
 * email, generates a request_id (crypto.randomUUID), and writes a
 * structured JSON line to the server log so production logs can be
 * grepped for `[BOOK-REQUEST]`.
 *
 * No database is wired yet. The owner has to pick one. Realistic options:
 *
 *   TODO(owner): pick a persistence layer and wire it here. Options:
 *
 *     1. Vercel Postgres (Neon serverless). Best when you already have
 *        a Vercel project. Add `@vercel/postgres`. Schema below maps
 *        directly to a `book_requests` table.
 *
 *     2. Supabase. Best when you want auth + row-level security alongside
 *        the table. Add `@supabase/supabase-js`. Same schema.
 *
 *     3. Upstash Redis. Best for high-volume queueing without a relational
 *        store. Add `@upstash/redis`. Push each request to a list and
 *        process from a worker.
 *
 *   Suggested schema (Postgres / Supabase):
 *     create table book_requests (
 *       request_id        uuid primary key,
 *       first_name        text not null,
 *       email             citext not null,
 *       book_title        text not null,
 *       book_slug         text not null,
 *       book_type         text not null check (book_type in ('free','paid')),
 *       price             numeric(10,2),
 *       request_status    text not null default 'received',
 *       payment_status    text,
 *       created_at        timestamptz not null default now(),
 *       source_page       text,
 *       utm_source        text,
 *       utm_medium        text,
 *       utm_campaign      text
 *     );
 *     create index on book_requests (email);
 *     create index on book_requests (book_slug, created_at desc);
 *
 *   Also outstanding:
 *     - ESP (ConvertKit / MailerLite / Beehiiv) for the actual delivery
 *       email with the PDF link.
 *     - Double opt-in if the ESP requires it.
 *     - Rate-limiting on this endpoint once a real persistence layer
 *       lands (e.g. Upstash rate-limit by IP + email).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubscribeBody {
  firstName?: string;
  email?: string;
  bookTitle?: string;
  bookSlug?: string;
  bookType?: "free" | "paid";
  price?: number;
  sourcePage?: string;
  timestamp?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  // Backwards compatibility with the old EmailCaptureForm payload.
  experience?: string;
}

export async function POST(request: NextRequest) {
  let body: SubscribeBody;
  try {
    body = (await request.json()) as SubscribeBody;
  } catch {
    return Response.json(
      { success: false, error: "invalid JSON" },
      { status: 400 },
    );
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const firstName = (body.firstName ?? "").trim();
  const bookTitle = (body.bookTitle ?? "").trim();
  const bookSlug = (body.bookSlug ?? "").trim();
  const bookType: "free" | "paid" =
    body.bookType === "paid" ? "paid" : "free";

  if (!EMAIL_RE.test(email)) {
    return Response.json(
      { success: false, error: "invalid email" },
      { status: 400 },
    );
  }

  const requestId = randomUUID();
  const createdAt = body.timestamp || new Date().toISOString();

  // Structured log. Grep production logs for `[BOOK-REQUEST]`.
  const logPayload = {
    request_id: requestId,
    first_name: firstName,
    email,
    book_title: bookTitle,
    book_slug: bookSlug,
    book_type: bookType,
    price: typeof body.price === "number" ? body.price : 0,
    request_status: "received" as const,
    payment_status: bookType === "paid" ? "pending" : null,
    created_at: createdAt,
    source_page: body.sourcePage ?? "/books",
    utm_source: body.utmSource ?? "",
    utm_medium: body.utmMedium ?? "",
    utm_campaign: body.utmCampaign ?? "",
  };
  console.log(`[BOOK-REQUEST] ${JSON.stringify(logPayload)}`);

  // Latency so the client's loading state has time to show.
  await new Promise((r) => setTimeout(r, 400));

  return Response.json({ success: true, request_id: requestId });
}
