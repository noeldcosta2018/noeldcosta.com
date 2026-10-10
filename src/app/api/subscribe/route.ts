export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { CONSENT_TEXT, EMAIL_RE, WAITLIST_CONSENT_TEXT, allow, clean, clientIp, json } from "@/lib/forms";

/**
 * POST /api/subscribe
 * Body: { name, email, consent, page?, locale?, source?, website? }
 * Saves or refreshes a contact in nd_contacts (upsert on lower-cased email).
 * One row per email, so a person can sign up from several forms: `source` is
 * the latest form, `interests` keeps every form they have used (the AI
 * Academy waitlist and the newsletter stay separate lists), and consent_text
 * keeps each distinct wording they agreed to.
 * `website` is a honeypot: real visitors never fill it.
 */

const SOURCES = new Set(["newsletter", "footer", "article", "academy", "ai-ready-waitlist", "chatbot", "contact"]);

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (!allow(`subscribe:${ip}`, 8, 10 * 60 * 1000)) {
    return json({ ok: false, error: "Too many attempts. Please try again in a few minutes." }, 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  if (clean(body.website, 200)) return json({ ok: true });

  const name = clean(body.name, 120);
  const email = clean(body.email, 254).toLowerCase();
  const source = SOURCES.has(String(body.source)) ? String(body.source) : "newsletter";

  if (!name) return json({ ok: false, error: "Please add your name." }, 400);
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "Please check your email address." }, 400);
  if (body.consent !== true) return json({ ok: false, error: "Please tick the consent box." }, 400);

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return json({ ok: false, error: "Sign-ups are being set up. Please try again shortly." }, 503);
  }

  // Keep what an earlier sign-up recorded: the forms used and the wording agreed to.
  const consentText = source === "ai-ready-waitlist" ? WAITLIST_CONSENT_TEXT : CONSENT_TEXT;
  const { data: existing } = await supabase.from("nd_contacts").select("source, interests, consent_text").eq("email", email).maybeSingle();
  const earlierForms = [...((existing?.interests as string[] | null) ?? []), ...(existing?.source ? [existing.source as string] : [])];
  const interests = Array.from(new Set([...earlierForms, source]));
  const earlierTexts = ((existing?.consent_text as string | null) ?? "").split(" || ").filter(Boolean);
  const consentTexts = Array.from(new Set([...earlierTexts, consentText])).join(" || ");

  const { error } = await supabase.from("nd_contacts").upsert(
    {
      email,
      name,
      source,
      interests,
      page: clean(body.page, 300) || null,
      locale: clean(body.locale, 12) || null,
      consent: true,
      consent_text: consentTexts,
      user_agent: clean(request.headers.get("user-agent"), 300) || null,
      unsubscribed_at: null,
    },
    { onConflict: "email" },
  );

  if (error) return json({ ok: false, error: "Something went wrong. Please try again." }, 500);
  return json({ ok: true });
}
