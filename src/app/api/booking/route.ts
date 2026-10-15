export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { EMAIL_RE, allow, clean, clientIp, json } from "@/lib/forms";
import { bookSlot, calendlyConfigured } from "@/lib/calendly";
import { CALENDLY_URL } from "@/data/site-menu";
import { NEED_LABELS, SIZE_LABELS, STAGE_LABELS } from "@/components/article/contact/booking-options";

/**
 * POST /api/booking
 * Body: { need, stage, size, goal?, name, email, company?, startTime, timezone, locale?, website? }
 * The contact page's booking flow. Records the request (nd_meeting_requests,
 * source "contact"), links or creates the contact (nd_contacts, no marketing
 * consent implied), then books the slot through Calendly. If Calendly is not
 * configured or refuses the slot, the request is still saved and the visitor
 * gets the booking link instead.
 */
export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (!allow(`booking:${ip}`, 5, 30 * 60 * 1000)) {
    return json({ ok: false, error: "rate" }, 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid" }, 400);
  }
  if (clean(body.website, 200)) return json({ ok: true, booked: false, bookingUrl: CALENDLY_URL });

  const name = clean(body.name, 120);
  const email = clean(body.email, 254).toLowerCase();
  const company = clean(body.company, 160);
  const need = NEED_LABELS[clean(body.need, 40)] ?? "";
  const stage = STAGE_LABELS[clean(body.stage, 40)] ?? "";
  const size = SIZE_LABELS[clean(body.size, 40)] ?? "";
  const goal = clean(body.goal, 1000);
  const startTime = clean(body.startTime, 40);
  const timezone = clean(body.timezone, 64) || "UTC";
  if (!name) return json({ ok: false, error: "name" }, 400);
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "email" }, 400);
  if (startTime && Number.isNaN(Date.parse(startTime))) return json({ ok: false, error: "slot" }, 400);

  const summary = [
    need && `Needs help with: ${need}`,
    stage && `Where they are: ${stage}`,
    size && `Company size: ${size}`,
    company && `Organisation: ${company}`,
    goal && `What would make the call worth it: ${goal}`,
  ]
    .filter(Boolean)
    .join("\n");

  // Save first, so the request is never lost even if the booking fails.
  let requestId: string | null = null;
  let supabase: ReturnType<typeof getSupabaseAdmin> | null = null;
  try {
    supabase = getSupabaseAdmin();
    let contactId: string | null = null;
    const existing = await supabase.from("nd_contacts").select("id").eq("email", email).maybeSingle();
    if (existing.data?.id) {
      contactId = existing.data.id as string;
    } else {
      const created = await supabase
        .from("nd_contacts")
        .insert({ email, name, source: "contact", consent: false, page: clean(body.page, 300) || null })
        .select("id")
        .single();
      contactId = (created.data?.id as string) ?? null;
    }
    const saved = await supabase
      .from("nd_meeting_requests")
      .insert({
        contact_id: contactId,
        name,
        email,
        company: company || null,
        topic: need || null,
        details: summary || null,
        preferred_time: startTime ? `${startTime} (${timezone})` : null,
        source: "contact",
      })
      .select("id")
      .single();
    requestId = (saved.data?.id as string) ?? null;
  } catch (error) {
    console.error("booking save", error);
  }

  if (!calendlyConfigured() || !startTime) {
    return json({ ok: true, booked: false, bookingUrl: CALENDLY_URL });
  }

  try {
    const result = await bookSlot({ startTime, name, email, timezone, summary: summary || "Intro call" });
    if (supabase && requestId) {
      await supabase.from("nd_meeting_requests").update({ status: "booked" }).eq("id", requestId);
    }
    return json({ ok: true, booked: true, startTime, ...result });
  } catch (error) {
    console.error("booking calendly", error);
    // Usually the slot was taken a moment ago. The page offers fresh slots.
    return json({ ok: false, error: "slot", bookingUrl: CALENDLY_URL }, 409);
  }
}
