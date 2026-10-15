// Server-only Cal.com client for the on-site booking flow on the contact page.
//
// Free slots come from GET /v2/slots and bookings are made with
// POST /v2/bookings. Both are public for a public event type, so no API key
// is needed. Cal.com sends the invite (with the Google Meet link), reminders
// and the reschedule/cancel emails, and checks the calendars connected in
// Noel's Cal.com account for conflicts. ERPCV uses the same account.
//
// CAL_USERNAME and CAL_EVENT_SLUG override the defaults below.

const API = "https://api.cal.com/v2";
const USERNAME = process.env.CAL_USERNAME || "noel-benjamin-dcosta-xay9yo";
const EVENT_SLUG = process.env.CAL_EVENT_SLUG || "30min";
const DAY = 24 * 60 * 60 * 1000;

export const CAL_BOOKING_URL = `https://cal.com/${USERNAME}/${EVENT_SLUG}`;

/** Available start times (UTC ISO strings) over the next `days` days. */
export async function availableSlots(days: number): Promise<string[]> {
  const from = new Date(Date.now() + 5 * 60 * 1000);
  const to = new Date(from.getTime() + days * DAY);
  const qs = new URLSearchParams({
    eventTypeSlug: EVENT_SLUG,
    username: USERNAME,
    start: from.toISOString(),
    end: to.toISOString(),
    timeZone: "UTC",
  });
  const res = await fetch(`${API}/slots?${qs}`, { headers: { "cal-api-version": "2024-09-04" }, cache: "no-store" });
  if (!res.ok) throw new Error(`Cal.com slots ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const body = (await res.json()) as { data?: Record<string, { start: string }[]> };
  const slots: string[] = [];
  for (const day of Object.values(body.data ?? {})) {
    for (const s of day) {
      const t = Date.parse(s.start);
      if (!Number.isNaN(t) && t > Date.now()) slots.push(new Date(t).toISOString());
    }
  }
  return Array.from(new Set(slots)).sort();
}

export type BookingResult = { cancelUrl: string | null; rescheduleUrl: string | null };

export class SlotTakenError extends Error {}

/** Books the slot; the visitor's answers go into the event's notes field. */
export async function bookSlot(input: {
  startTime: string;
  name: string;
  email: string;
  timezone: string;
  summary: string;
  language?: string;
}): Promise<BookingResult> {
  const res = await fetch(`${API}/bookings`, {
    method: "POST",
    headers: { "cal-api-version": "2026-02-25", "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      start: new Date(input.startTime).toISOString(),
      eventTypeSlug: EVENT_SLUG,
      username: USERNAME,
      attendee: {
        name: input.name,
        email: input.email,
        timeZone: input.timezone,
        language: input.language || "en",
      },
      bookingFieldsResponses: { notes: input.summary.slice(0, 1000) },
      metadata: { source: "noeldcosta.com contact page" },
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    // Cal.com answers 400/409 when the slot is no longer free.
    if (res.status === 409 || /not available|already|booked|no.available|in the past/i.test(text)) throw new SlotTakenError(text.slice(0, 300));
    throw new Error(`Cal.com booking ${res.status}: ${text.slice(0, 300)}`);
  }
  const uid = (JSON.parse(text) as { data?: { uid?: string } }).data?.uid;
  return uid
    ? { cancelUrl: `https://cal.com/booking/${uid}?cancel=true`, rescheduleUrl: `https://cal.com/reschedule/${uid}` }
    : { cancelUrl: null, rescheduleUrl: null };
}
