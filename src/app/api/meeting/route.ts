export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { EMAIL_RE, allow, clean, clientIp, json } from "@/lib/forms";
import { CALENDLY_URL } from "@/data/site-menu";

/**
 * POST /api/meeting
 * Body: { name, email, company?, role?, topic?, details?, preferredTime?, source?, website? }
 * Records an introductory meeting request (nd_meeting_requests), links or
 * creates the contact (nd_contacts, no marketing consent implied) and returns
 * the booking link so the visitor can pick a slot straight away.
 */

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (!allow(`meeting:${ip}`, 5, 30 * 60 * 1000)) {
    return json({ ok: false, error: "Too many requests. Please try again later." }, 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }
  if (clean(body.website, 200)) return json({ ok: true, bookingUrl: CALENDLY_URL });

  const name = clean(body.name, 120);
  const email = clean(body.email, 254).toLowerCase();
  if (!name) return json({ ok: false, error: "Please add your name." }, 400);
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "Please check your email address." }, 400);

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return json({ ok: true, bookingUrl: CALENDLY_URL, saved: false });
  }

  // Find or create the contact without touching an existing consent choice.
  let contactId: string | null = null;
  const existing = await supabase.from("nd_contacts").select("id").eq("email", email).maybeSingle();
  if (existing.data?.id) {
    contactId = existing.data.id as string;
  } else {
    const created = await supabase
      .from("nd_contacts")
      .insert({ email, name, source: "chatbot", consent: false, page: clean(body.page, 300) || null })
      .select("id")
      .single();
    contactId = (created.data?.id as string) ?? null;
  }

  const { error } = await supabase.from("nd_meeting_requests").insert({
    contact_id: contactId,
    name,
    email,
    company: clean(body.company, 160) || null,
    role: clean(body.role, 120) || null,
    topic: clean(body.topic, 160) || null,
    details: clean(body.details, 1500) || null,
    preferred_time: clean(body.preferredTime, 160) || null,
    source: body.source === "contact" ? "contact" : "chatbot",
  });

  if (error) return json({ ok: false, error: "Something went wrong. Please use the booking link instead.", bookingUrl: CALENDLY_URL }, 500);
  return json({ ok: true, bookingUrl: CALENDLY_URL, saved: true });
}
