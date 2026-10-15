export const runtime = "nodejs";

import { availableSlots, calendlyConfigured } from "@/lib/calendly";
import { CALENDLY_URL } from "@/data/site-menu";

/**
 * GET /api/booking/slots
 * Free start times for the intro call over the next three weeks, as UTC ISO
 * strings. `configured: false` tells the contact page to fall back to the
 * embedded Calendly widget.
 */
export async function GET() {
  if (!calendlyConfigured()) {
    return Response.json({ configured: false, bookingUrl: CALENDLY_URL }, { headers: { "Cache-Control": "no-store" } });
  }
  try {
    const slots = await availableSlots(21);
    return Response.json(
      { configured: true, slots },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } },
    );
  } catch (error) {
    console.error("booking slots", error);
    return Response.json({ configured: false, bookingUrl: CALENDLY_URL }, { headers: { "Cache-Control": "no-store" } });
  }
}
