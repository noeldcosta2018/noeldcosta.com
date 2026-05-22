export const runtime = "nodejs";

import type { NextRequest } from "next/server";

/**
 * Email subscribe — STUB.
 *
 * Accepts { email, firstName?, experience?, bookSlug }. Returns
 * { success: true } after a short delay so the UI's loading state has
 * something to render against. No real ESP wired yet.
 *
 * TODO(owner): swap this stub for the real ESP. Likely candidates are
 * ConvertKit, MailerLite, or Beehiiv. Each needs:
 *   1. API key in process.env (do NOT commit).
 *   2. A list / form ID per book so subscribers land tagged with which
 *      title they downloaded.
 *   3. A double opt-in confirmation step if required by the ESP, with
 *      the actual download link delivered in the confirmation email.
 * Until that lands the page advertises "I'll email you the PDF" and
 * this endpoint pretends it worked.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubscribeBody {
  email?: string;
  firstName?: string;
  experience?: string;
  bookSlug?: string;
}

export async function POST(request: NextRequest) {
  let body: SubscribeBody;
  try {
    body = (await request.json()) as SubscribeBody;
  } catch {
    return Response.json({ success: false, error: "invalid JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  const firstName = (body.firstName ?? "").trim();
  const experience = (body.experience ?? "").trim();
  const bookSlug = (body.bookSlug ?? "").trim();

  if (!EMAIL_RE.test(email)) {
    return Response.json(
      { success: false, error: "invalid email" },
      { status: 400 },
    );
  }

  // Latency so the client's loading state has time to show.
  await new Promise((r) => setTimeout(r, 800));

  // Stub log — replace with real ESP API call when wiring.
  console.log(
    `[STUB EMAIL] ${email} subscribed to ${bookSlug} (firstName: ${firstName || "—"}, experience: ${experience || "—"})`,
  );

  return Response.json({ success: true });
}
