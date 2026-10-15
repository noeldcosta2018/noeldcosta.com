export const runtime = "nodejs";

import { CAL_BOOKING_URL, availableSlots } from "@/lib/cal";

/**
 * GET /api/booking/slots
 * Free start times for the intro call over the next three weeks, as UTC ISO
 * strings, from Cal.com. `configured: false` tells the contact page to fall
 * back to a link to the Cal.com booking page.
 */
export async function GET() {
  try {
    const slots = await availableSlots(21);
    return Response.json(
      { configured: true, slots },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } },
    );
  } catch (error) {
    console.error("booking slots", error);
    return Response.json({ configured: false, bookingUrl: CAL_BOOKING_URL }, { headers: { "Cache-Control": "no-store" } });
  }
}
