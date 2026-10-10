export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { EMAIL_RE, allow, clean, clientIp } from "@/lib/forms";

/**
 * POST /api/sapopedia/signup/
 *
 * SAPopedia (ai.sapopedia.com, a static page on Netlify) keeps its own sign-up
 * form: a Tally form shown before every free book, the Playbook checkout and
 * the "Get on the list" button. When that form is submitted the page also
 * sends { name, email, book, page } here, so every SAPopedia sign-up lands in
 * the one database (ERPCV3) next to noeldcosta.com and ERPCV:
 *   - a book (free PDF or the Playbook checkout) → book_leads, source_page on
 *     sapopedia, with the book it was for
 *   - "newsletter" (the new-book list) → nd_contacts, source "sapopedia-newsletter"
 *
 * The page sends with navigator.sendBeacon (text/plain, no preflight) because
 * it navigates straight to the PDF or Stripe. Only SAPopedia origins are
 * accepted. Consent wording is what the SAPopedia form shows at that step.
 */

const ORIGIN_RE = /^https:\/\/((ai|www)\.)?sapopedia\.com$|^https:\/\/([a-z0-9-]+--)?sapopediaaiproject\.netlify\.app$/;

const BOOKS: Record<string, { title: string; type: "free" | "paid" }> = {
  "burn-costs": { title: "10 Areas That Burn Costs in Enterprise AI with SAP", type: "free" },
  "sap-careers": { title: "5 SAP Careers Worth $200K+ in the AI Era", type: "free" },
  "autonomous-agents": { title: "Autonomous Agents in the SAP Enterprise", type: "free" },
  "agent-manager": { title: "From SAP Project Manager to Agent Manager", type: "free" },
  playbook: { title: "The SAP Consultant's Playbook for the AI Era", type: "paid" },
};

// The words shown in the SAPopedia form at each step (ai.sapopedia.com, October 2026).
const SHOWN = {
  free: "SAPopedia: The book downloads as soon as you submit. I'll only email again when the next book ships.",
  paid: "SAPopedia: Name and email, then we send you to Stripe. Same email I'll use to notify you when the next book ships.",
  newsletter: "SAPopedia: One email when a new book drops. No drip, no funnel. Unsubscribe in a click.",
};

function cors(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
}

const reply = (body: unknown, status: number, origin: string) =>
  Response.json(body, { status, headers: ORIGIN_RE.test(origin) ? cors(origin) : { "Cache-Control": "no-store" } });

export function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";
  if (!ORIGIN_RE.test(origin)) return new Response(null, { status: 403 });
  return new Response(null, { status: 204, headers: cors(origin) });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";
  if (!ORIGIN_RE.test(origin)) return reply({ ok: false, error: "Not allowed." }, 403, origin);

  const ip = clientIp(request);
  if (!allow(`sapopedia:${ip}`, 10, 10 * 60 * 1000)) return reply({ ok: false, error: "Too many requests." }, 429, origin);

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return reply({ ok: false, error: "Invalid request." }, 400, origin);
  }

  const email = clean(body.email, 254).toLowerCase();
  const name = clean(body.name, 120);
  const book = clean(body.book, 40);
  const page = clean(body.page, 300) || `${origin}/`;
  const userAgent = clean(request.headers.get("user-agent"), 300) || null;
  if (!EMAIL_RE.test(email)) return reply({ ok: false, error: "Invalid email." }, 400, origin);

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return reply({ ok: false, error: "Not available." }, 503, origin);
  }

  if (book === "newsletter") {
    // One row per email across the sites: keep earlier forms and wording.
    const { data: existing } = await supabase.from("nd_contacts").select("name, source, interests, consent_text").eq("email", email).maybeSingle();
    const forms = Array.from(new Set([...((existing?.interests as string[] | null) ?? []), ...(existing?.source ? [existing.source as string] : []), "sapopedia-newsletter"]));
    const texts = Array.from(new Set([...((existing?.consent_text as string | null) ?? "").split(" || ").filter(Boolean), SHOWN.newsletter])).join(" || ");
    const { error } = await supabase.from("nd_contacts").upsert(
      {
        email,
        name: name || (existing?.name as string | null) || "",
        source: "sapopedia-newsletter",
        interests: forms,
        page,
        consent: true,
        consent_text: texts,
        user_agent: userAgent,
        unsubscribed_at: null,
      },
      { onConflict: "email" },
    );
    if (error) return reply({ ok: false, error: "Could not save." }, 500, origin);
    return reply({ ok: true }, 200, origin);
  }

  const info = BOOKS[book];
  if (!info) return reply({ ok: false, error: "Unknown book." }, 400, origin);
  const { error } = await supabase.from("book_leads").insert({
    name,
    email,
    book_title: info.title,
    book_slug: `sapopedia-${book}`,
    book_type: info.type,
    source_page: page,
    // Submitting the form is the consent to store the details; it is not a
    // general marketing opt-in (the form only promises a note when the next book ships).
    consent_accepted: true,
    terms_accepted: false,
    marketing_opt_in: false,
    consent_text_version: info.type === "paid" ? SHOWN.paid : SHOWN.free,
    user_agent: userAgent,
    ip_address: ip,
  });
  if (error) return reply({ ok: false, error: "Could not save." }, 500, origin);
  return reply({ ok: true }, 200, origin);
}
