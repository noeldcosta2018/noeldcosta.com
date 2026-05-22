export const runtime = "nodejs";

import type { NextRequest } from "next/server";

/**
 * Stripe create-checkout-session — STUB.
 *
 * Accepts { priceId, tier, bookSlug }. Returns a placeholder URL the
 * client can redirect to. No Stripe SDK is installed yet — adding it
 * needs explicit owner sign-off per CLAUDE.md "no new deps without
 * asking".
 *
 * TODO(owner): wire this up when Stripe price IDs land.
 *   1. Add `stripe` to dependencies (`npm i stripe`). Confirm version.
 *   2. Store STRIPE_SECRET_KEY in process.env (use Vercel env vars).
 *   3. Replace the stub return with:
 *        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 *        const session = await stripe.checkout.sessions.create({ ... });
 *        return Response.json({ url: session.url });
 *   4. Add a /api/stripe/webhook route for fulfilment + receipt email.
 *   5. Decide on success/cancel routes (likely /books/thanks and /books).
 */

interface CheckoutBody {
  priceId?: string;
  tier?: string;
  bookSlug?: string;
}

export async function POST(request: NextRequest) {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const priceId = body.priceId ?? "";
  const tier = body.tier ?? "";
  const bookSlug = body.bookSlug ?? "";

  console.log(
    `[STUB STRIPE] checkout requested for book=${bookSlug} tier=${tier} priceId=${priceId || "—"}`,
  );

  // Returns a non-Stripe placeholder. The client redirects here, and the
  // owner gets a visible "this is not wired yet" page rather than an
  // opaque 500. Replace with the real Stripe session URL when ready.
  return Response.json({ url: "/books/checkout-stub-not-wired" });
}
