export const runtime = "nodejs";

import { json } from "@/lib/forms";
import { BOOK_CALL_URL } from "@/data/site-menu";

/**
 * POST /api/booking: retired 17 November 2026. The contact page's old flow booked Cal.com's
 * "30min" event through the API. That event is ERPCV's paid career call, so the bookings
 * arrived as "Pending payment" and were never paid. Every call now goes through /book-a-call/.
 */
export async function POST() {
  return json({ ok: false, error: "retired", bookingUrl: BOOK_CALL_URL }, 410);
}
