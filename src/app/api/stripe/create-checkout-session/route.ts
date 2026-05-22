export const runtime = "nodejs";

import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * Stripe create-checkout-session — STUB.
 *
 * Accepts the full payload from the /books BookModal (paid book branch).
 * Validates the email, generates a request_id, writes a structured
 * `[BOOK-CHECKOUT]` log line, and returns success=false with a graceful
 * message until the real Stripe wiring lands.
 *
 *   TODO(owner): wire Stripe when price IDs are ready.
 *     1. Add `stripe` to dependencies. Confirm version.
 *     2. Store STRIPE_SECRET_KEY in process.env (Vercel env vars).
 *     3. Map each book's pricing tier to a Stripe Price ID. Store in
 *        the book MDX frontmatter `pricing.{tier}.stripeId`.
 *     4. Replace the stub return with:
 *          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 *          const session = await stripe.checkout.sessions.create({
 *            mode: "payment",
 *            line_items: [{ price: priceId, quantity: 1 }],
 *            success_url: `${origin}/books/thanks?session_id={CHECKOUT_SESSION_ID}`,
 *            cancel_url:  `${origin}/books`,
 *            customer_email: email,
 *            metadata: { request_id, book_slug, book_title, ... },
 *          });
 *          return Response.json({ success: true, url: session.url });
 *     5. Add /api/stripe/webhook for fulfilment + receipt email.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CheckoutBody {
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
  // Legacy fields kept for backwards compatibility.
  priceId?: string;
  tier?: string;
}

export async function POST(request: NextRequest) {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
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

  if (email && !EMAIL_RE.test(email)) {
    return Response.json(
      { success: false, error: "invalid email" },
      { status: 400 },
    );
  }

  const requestId = randomUUID();
  const createdAt = body.timestamp || new Date().toISOString();

  const logPayload = {
    request_id: requestId,
    first_name: firstName,
    email,
    book_title: bookTitle,
    book_slug: bookSlug,
    book_type: "paid" as const,
    price: typeof body.price === "number" ? body.price : 0,
    request_status: "received" as const,
    payment_status: "pending" as const,
    created_at: createdAt,
    source_page: body.sourcePage ?? "/books",
    utm_source: body.utmSource ?? "",
    utm_medium: body.utmMedium ?? "",
    utm_campaign: body.utmCampaign ?? "",
    tier: body.tier ?? "",
    price_id: body.priceId ?? "",
  };
  console.log(`[BOOK-CHECKOUT] ${JSON.stringify(logPayload)}`);

  return Response.json({
    success: false,
    request_id: requestId,
    message:
      "Stripe is not yet wired. Your details are saved and we will email you when checkout opens.",
  });
}
