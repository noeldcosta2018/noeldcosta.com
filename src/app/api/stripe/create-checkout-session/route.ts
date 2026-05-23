export const runtime = "nodejs";

/**
 * Stripe create-checkout-session — STUB.
 *
 * Kept as a placeholder for the eventual paid-book wiring. The /books page
 * itself now posts to /api/books/leads, which captures the paid-book lead
 * and returns a graceful fallback message until Stripe is integrated.
 *
 * When Stripe is wired:
 *   1. Add `stripe` to dependencies.
 *   2. Store STRIPE_SECRET_KEY in env.
 *   3. Map each paid book's frontmatter.stripeId to a real Stripe price ID.
 *   4. Replace the body of POST() below with a real session create call.
 *   5. Update /api/books/leads to optionally return a checkoutUrl that the
 *      LeadCaptureModal already follows via window.location.href.
 */

export async function POST() {
  return Response.json({
    success: false,
    message:
      "Stripe checkout is not yet wired. Paid-book leads are captured via /api/books/leads.",
  });
}
