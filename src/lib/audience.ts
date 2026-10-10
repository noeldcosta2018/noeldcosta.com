import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * One list of every person who has given an email to noeldcosta.com or ERPCV,
 * for the newsletter. Read-only: rows are merged in memory from the source
 * tables (Supabase project ERPCV3), one contact per email address.
 *
 * Newsletter status per contact:
 *   subscribed    at least one source records explicit newsletter or
 *                 marketing consent, and none records an unsubscribe
 *   unsubscribed  any source records an unsubscribe (always wins)
 *   no-consent    known contact, but no source records marketing consent
 *
 * Only "subscribed" contacts should receive the newsletter. The others are
 * shown so they can be asked to opt in, not emailed.
 */

export type AudienceStatus = "subscribed" | "unsubscribed" | "no-consent";

export type SourceKey =
  | "nd-academy-waitlist"
  | "nd-newsletter"
  | "nd-academy-updates"
  | "nd-chat"
  | "nd-meeting"
  | "nd-book"
  | "erpcv-newsletter"
  | "erpcv-customer"
  | "erpcv-advisory"
  | "erpcv-profile"
  | "erpcv-order";

export const SOURCE_LABELS: Record<SourceKey, string> = {
  "nd-academy-waitlist": "AI Academy waitlist (AI Ready in 30 Days)",
  "nd-newsletter": "noeldcosta.com newsletter",
  "nd-academy-updates": "AI Academy updates",
  "nd-chat": "noeldcosta.com chat or contact form",
  "nd-meeting": "noeldcosta.com meeting request",
  "nd-book": "noeldcosta.com book lead",
  "erpcv-newsletter": "ERPCV newsletter",
  "erpcv-customer": "ERPCV customer",
  "erpcv-advisory": "ERPCV advisory request",
  "erpcv-profile": "ERPCV profile (first version)",
  "erpcv-order": "ERPCV order (first version)",
};

export interface AudienceContact {
  email: string;
  name: string;
  sources: SourceKey[];
  status: AudienceStatus;
  firstSeen: string | null;
  lastSeen: string | null;
}

type Touch = {
  email: string | null | undefined;
  name?: string | null;
  source: SourceKey;
  at?: string | null;
  consent?: boolean;
  unsubscribed?: boolean;
};

type Row = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : null);

/** Which list a noeldcosta.com form belongs to (nd_contacts.source / interests). */
export function signupSource(form: string): SourceKey {
  if (form === "ai-ready-waitlist") return "nd-academy-waitlist";
  if (form === "academy") return "nd-academy-updates";
  if (form === "chatbot" || form === "contact") return "nd-chat";
  return "nd-newsletter"; // newsletter, footer, article
}

/** Reads one table; a missing table or column is reported, not fatal. */
async function read(table: string, columns: string, errors: string[]): Promise<Row[]> {
  const { data, error } = await getSupabaseAdmin().from(table).select(columns).limit(10000);
  if (error) {
    errors.push(`${table}: ${error.message}`);
    return [];
  }
  return (data ?? []) as unknown as Row[];
}

export async function loadAudience(): Promise<{ contacts: AudienceContact[]; errors: string[] }> {
  const errors: string[] = [];
  const [signups, meetings, books, erpcvNews, customers, advisory, profiles, orders] = await Promise.all([
    read("nd_contacts", "email,name,source,interests,consent,created_at,updated_at,unsubscribed_at", errors),
    read("nd_meeting_requests", "email,name,created_at", errors),
    read("book_leads", "email,name,marketing_opt_in,created_at", errors),
    read("erpcv_next_newsletter_subscriptions", "email,status,confirmed_at,consent_at,unsubscribed_at,updated_at", errors),
    read("erpcv_next_customers", "email,name,marketing_consent,created_at", errors),
    read("erpcv_next_advisory_requests", "email,name,created_at", errors),
    read("profiles", "email,full_name,created_at", errors),
    read("orders", "email,status,created_at", errors),
  ]);

  const touches: Touch[] = [
    // One noeldcosta.com row per email; `interests` lists every form used, `source` the latest.
    ...signups.flatMap((r) => {
      const forms = new Set([...(Array.isArray(r.interests) ? (r.interests as unknown[]).map(String) : []), str(r.source) ?? "newsletter"]);
      const keys = new Set([...forms].map(signupSource));
      return [...keys].map((source) => ({
        email: str(r.email),
        name: str(r.name),
        source,
        at: str(r.updated_at) ?? str(r.created_at),
        // Newsletter consent comes only from the newsletter-type forms. The
        // waitlist consent covers AI Ready in 30 Days emails, not the newsletter.
        consent: r.consent === true && (source === "nd-newsletter" || source === "nd-academy-updates"),
        unsubscribed: !!r.unsubscribed_at,
      }));
    }),
    ...meetings.map((r) => ({ email: str(r.email), name: str(r.name), source: "nd-meeting" as const, at: str(r.created_at) })),
    ...books.map((r) => ({
      email: str(r.email),
      name: str(r.name),
      source: "nd-book" as const,
      at: str(r.created_at),
      consent: r.marketing_opt_in === true,
    })),
    ...erpcvNews.map((r) => ({
      email: str(r.email),
      source: "erpcv-newsletter" as const,
      at: str(r.updated_at) ?? str(r.consent_at),
      // Double opt-in: only a confirmed subscription counts as consent.
      consent: !!r.confirmed_at && !r.unsubscribed_at,
      unsubscribed: !!r.unsubscribed_at || r.status === "unsubscribed",
    })),
    ...customers.map((r) => ({
      email: str(r.email),
      name: str(r.name),
      source: "erpcv-customer" as const,
      at: str(r.created_at),
      consent: r.marketing_consent === true,
    })),
    ...advisory.map((r) => ({ email: str(r.email), name: str(r.name), source: "erpcv-advisory" as const, at: str(r.created_at) })),
    ...profiles.map((r) => ({ email: str(r.email), name: str(r.full_name), source: "erpcv-profile" as const, at: str(r.created_at) })),
    // Abandoned checkouts (pending) are not contacts.
    ...orders
      .filter((r) => r.status !== "pending")
      .map((r) => ({ email: str(r.email), source: "erpcv-order" as const, at: str(r.created_at) })),
  ];

  const byEmail = new Map<string, AudienceContact & { consent: boolean; unsubscribed: boolean }>();
  for (const t of touches) {
    const email = t.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) continue;
    let c = byEmail.get(email);
    if (!c) {
      c = { email, name: "", sources: [], status: "no-consent", firstSeen: null, lastSeen: null, consent: false, unsubscribed: false };
      byEmail.set(email, c);
    }
    if (!c.name && t.name?.trim()) c.name = t.name.trim();
    if (!c.sources.includes(t.source)) c.sources.push(t.source);
    if (t.consent) c.consent = true;
    if (t.unsubscribed) c.unsubscribed = true;
    if (t.at) {
      if (!c.firstSeen || t.at < c.firstSeen) c.firstSeen = t.at;
      if (!c.lastSeen || t.at > c.lastSeen) c.lastSeen = t.at;
    }
  }

  const contacts = [...byEmail.values()]
    .map(({ consent, unsubscribed, ...c }) => ({
      ...c,
      status: (unsubscribed ? "unsubscribed" : consent ? "subscribed" : "no-consent") as AudienceStatus,
    }))
    .sort((a, b) => (b.lastSeen ?? "").localeCompare(a.lastSeen ?? ""));

  return { contacts, errors };
}

/** CSV cell, with spreadsheet formula characters neutralised. */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
