// The "Book a call" intake (Noel, 16 and 17 November 2026): one booking system, Cal.com.
// Career calls are paid and booked on erpcv.com; consulting calls are free on the hidden
// "Business consulting call" event, and every visitor writes the intent of the meeting first.
// Cal.com titles each booking "PAID career call: name" or "FREE consulting call: name" and puts
// the answers in the booking and in Noel's email.

/** The intake page every "Book a call" button opens. */
export const BOOK_CALL_PATH = "/book-a-call/";
/** Paid career advice, at ERPCV's advisory rates. */
export const CAREER_CALL_URL = "https://erpcv.com/advisory/request?topic=general";
/** The free consulting call: a hidden Cal.com event, shown only after the intake. */
export const CONSULTING_CAL_URL =
  process.env.NEXT_PUBLIC_CONSULTING_CAL_URL || "https://cal.com/noel-benjamin-dcosta-xay9yo/business-consulting-call";
export const MIN_INTENT = 20;

/** The consulting booking page with the visitor's name, email and answers filled in. */
export function consultingBookingUrl(
  base: string,
  { name, email, intent, answers }: { name: string; email: string; intent: string; answers: string[][] },
  embed = true,
): string {
  const url = new URL(base);
  url.searchParams.set("name", name);
  url.searchParams.set("email", email);
  const notes = [`Intent: ${intent.trim()}`, ...answers.map(([q, a]) => `${q}: ${a}`)].join("\n");
  url.searchParams.set("notes", notes.slice(0, 1000));
  if (embed) url.searchParams.set("embed", "true");
  return url.toString();
}
