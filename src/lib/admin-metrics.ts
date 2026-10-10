import { getSupabaseAdmin } from "@/lib/supabase/server";
import { loadAudience, signupSource, type SourceKey } from "@/lib/audience";
import { contactSites } from "@/lib/audience-sites";

/**
 * Key numbers for the admin overview: noeldcosta.com, ERPCV and SAPopedia in
 * one place, all read from the one Supabase project (ERPCV3) with the service
 * role. Read-only. A table that cannot be read is reported in `errors` and
 * counts as empty, so one missing source never blanks the whole page.
 *
 * ERPCV money excludes Stripe test-mode orders. Amounts are stored in the
 * smallest currency unit (fils for AED).
 */

const DAY = 24 * 60 * 60 * 1000;

type Row = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : null);
const num = (v: unknown) => (typeof v === "number" ? v : 0);
const within = (iso: string | null, days: number, now: number) => !!iso && now - Date.parse(iso) <= days * DAY;

export interface Metric {
  label: string;
  value: string;
  /** Short context line: last 7 or 30 days, or what the number covers. */
  note?: string;
}

export interface ActivityItem {
  at: string;
  product: "noeldcosta.com" | "ERPCV" | "SAPopedia";
  what: string;
  who: string;
}

export interface Overview {
  people: Metric[];
  noeldcosta: Metric[];
  erpcv: Metric[];
  erpcvEarlier: Metric[];
  sapopedia: Metric[];
  activity: ActivityItem[];
  errors: string[];
}

async function read(table: string, columns: string, errors: string[], limit = 10000): Promise<Row[]> {
  const { data, error } = await getSupabaseAdmin().from(table).select(columns).limit(limit);
  if (error) {
    errors.push(`${table}: ${error.message}`);
    return [];
  }
  return (data ?? []) as unknown as Row[];
}

function money(minor: number, currency: string): string {
  const major = minor / 100;
  return `${currency.toUpperCase()} ${major.toLocaleString("en-GB", { maximumFractionDigits: major % 1 ? 2 : 0 })}`;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString("en-GB")} ${n === 1 ? one : many}`;

export async function loadOverview(): Promise<Overview> {
  const now = Date.now();
  const errors: string[] = [];

  const [audience, ndContacts, ndMeetings, bookLeads, orders, customers, assessments, advisory, erpcvNews, incidents, legacyOrders] =
    await Promise.all([
      loadAudience(),
      read("nd_contacts", "email,name,source,interests,consent,created_at,unsubscribed_at", errors),
      read("nd_meeting_requests", "name,email,topic,status,created_at", errors),
      read("book_leads", "name,email,book_title,book_type,marketing_opt_in,source_page,created_at", errors),
      read("erpcv_next_orders", "customer_id,product,amount,currency,payment_status,refunded_amount,test_mode,created_at,paid_at,ready_at", errors),
      read("erpcv_next_customers", "id,name,email,created_at", errors),
      read("erpcv_next_assessments", "status,created_at", errors),
      read("erpcv_next_advisory_requests", "name,email,topic,status,created_at", errors),
      read("erpcv_next_newsletter_subscriptions", "confirmed_at,unsubscribed_at", errors),
      read("erpcv_next_payment_incidents", "kind,test,created_at", errors),
      read("orders", "status,created_at", errors),
    ]);
  // loadAudience reads the same tables; keep its messages without repeating them.
  for (const e of audience.errors) if (!errors.includes(e)) errors.push(e);

  // ---------- People across all sites ----------
  const contacts = audience.contacts;
  const people: Metric[] = [
    { label: "People", value: contacts.length.toLocaleString("en-GB"), note: "unique emails across all sites" },
    {
      label: "New in 7 days",
      value: contacts.filter((c) => within(c.firstSeen, 7, now)).length.toLocaleString("en-GB"),
      note: `${contacts.filter((c) => within(c.firstSeen, 30, now)).length} in 30 days`,
    },
    {
      label: "Newsletter subscribers",
      value: contacts.filter((c) => c.status === "subscribed").length.toLocaleString("en-GB"),
      note: "gave marketing consent, not unsubscribed",
    },
    {
      label: "On more than one site",
      value: contacts.filter((c) => contactSites(c.sources).length > 1).length.toLocaleString("en-GB"),
      note: "noeldcosta.com, ERPCV, SAPopedia",
    },
  ];

  // ---------- noeldcosta.com ----------
  const lists: Record<string, { total: number; week: number }> = {};
  for (const r of ndContacts) {
    const forms = new Set([...(Array.isArray(r.interests) ? (r.interests as unknown[]).map(String) : []), str(r.source) ?? "newsletter"]);
    for (const key of new Set([...forms].map(signupSource))) {
      lists[key] ??= { total: 0, week: 0 };
      lists[key].total++;
      if (within(str(r.created_at), 7, now)) lists[key].week++;
    }
  }
  const list = (key: SourceKey, label: string): Metric => ({
    label,
    value: (lists[key]?.total ?? 0).toLocaleString("en-GB"),
    note: `${lists[key]?.week ?? 0} new in 7 days`,
  });
  // Book requests from SAPopedia share book_leads; their page is on sapopedia.com.
  const isSapopedia = (r: Row) => /sapopedia/i.test(str(r.source_page) ?? "");
  const ndBooks = bookLeads.filter((r) => !isSapopedia(r));
  const sapoBooks = bookLeads.filter(isSapopedia);
  const openMeetings = ndMeetings.filter((r) => (str(r.status) ?? "new") === "new").length;
  const noeldcosta: Metric[] = [
    list("nd-newsletter", "Newsletter sign-ups"),
    list("nd-academy-waitlist", "AI Academy waitlist"),
    list("nd-academy-updates", "AI Academy updates"),
    list("nd-chat", "Chat and contact form"),
    {
      label: "Meeting requests",
      value: ndMeetings.length.toLocaleString("en-GB"),
      note: `${ndMeetings.filter((r) => within(str(r.created_at), 7, now)).length} new in 7 days, ${openMeetings} not yet handled`,
    },
    {
      label: "Book leads",
      value: ndBooks.length.toLocaleString("en-GB"),
      note: `${ndBooks.filter((r) => within(str(r.created_at), 7, now)).length} new in 7 days, ${ndBooks.filter((r) => r.marketing_opt_in === true).length} opted in to emails`,
    },
  ];

  // ---------- ERPCV (current shop, live payments only) ----------
  const live = orders.filter((r) => r.test_mode !== true);
  const sold = live.filter((r) => r.payment_status === "paid" || r.payment_status === "refunded");
  const currency = str(sold[0]?.currency) ?? str(live[0]?.currency) ?? "aed";
  const gross = (rows: Row[]) => rows.reduce((n, r) => n + num(r.amount), 0);
  const refunded = (rows: Row[]) => rows.reduce((n, r) => n + num(r.refunded_amount), 0);
  const sold30 = sold.filter((r) => within(str(r.paid_at) ?? str(r.created_at), 30, now));
  const abandoned30 = live.filter((r) => r.payment_status === "expired" && within(str(r.created_at), 30, now)).length;
  const readyAssessments = assessments.filter((r) => r.status === "ready").length;
  const failedAssessments = assessments.filter((r) => r.status === "failed").length;
  const openAdvisory = advisory.filter((r) => (str(r.status) ?? "requested") === "requested").length;
  const liveIncidents30 = incidents.filter((r) => r.test !== true && within(str(r.created_at), 30, now)).length;
  const erpcv: Metric[] = [
    {
      label: "Revenue, net of refunds",
      value: money(gross(sold) - refunded(sold), currency),
      note: `${money(gross(sold30) - refunded(sold30), currency)} in 30 days`,
    },
    {
      label: "Paid orders",
      value: sold.filter((r) => r.payment_status === "paid").length.toLocaleString("en-GB"),
      note: `${plural(sold.filter((r) => r.payment_status === "refunded").length, "refund")}, ${plural(abandoned30, "abandoned checkout")} in 30 days`,
    },
    {
      label: "Career packs delivered",
      value: live.filter((r) => !!r.ready_at && r.payment_status === "paid").length.toLocaleString("en-GB"),
      note: "paid orders with documents ready",
    },
    {
      label: "Customers",
      value: customers.length.toLocaleString("en-GB"),
      note: `${customers.filter((r) => within(str(r.created_at), 30, now)).length} new in 30 days`,
    },
    {
      label: "CV assessments",
      value: readyAssessments.toLocaleString("en-GB"),
      note: `completed; ${failedAssessments} failed`,
    },
    {
      label: "Advisory requests",
      value: advisory.length.toLocaleString("en-GB"),
      note: `${openAdvisory} awaiting a reply`,
    },
    {
      label: "ERPCV newsletter",
      value: erpcvNews.filter((r) => !!r.confirmed_at && !r.unsubscribed_at).length.toLocaleString("en-GB"),
      note: "confirmed subscribers",
    },
    {
      label: "Payment issues",
      value: liveIncidents30.toLocaleString("en-GB"),
      note: "live payment incidents in 30 days",
    },
  ];

  // ---------- SAPopedia (ai.sapopedia.com) ----------
  const freeBooks = sapoBooks.filter((r) => r.book_type !== "paid");
  const playbook = sapoBooks.filter((r) => r.book_type === "paid");
  const byTitle = new Map<string, number>();
  for (const r of freeBooks) byTitle.set(str(r.book_title) ?? "", (byTitle.get(str(r.book_title) ?? "") ?? 0) + 1);
  const top = [...byTitle].sort((a, b) => b[1] - a[1])[0];
  const week = (rows: Row[]) => rows.filter((r) => within(str(r.created_at), 7, now)).length;
  const sapopedia: Metric[] = [
    {
      label: "Free book downloads",
      value: freeBooks.length.toLocaleString("en-GB"),
      note: `${week(freeBooks)} in 7 days${top ? `; most requested: ${top[0]} (${top[1]})` : ""}`,
    },
    { label: "Playbook checkouts started", value: playbook.length.toLocaleString("en-GB"), note: `${week(playbook)} in 7 days; payment completes in Stripe` },
    list("sapopedia-newsletter", "New-book list"),
    {
      label: "Earlier sign-ups (Tally)",
      value: (lists["sapopedia-tally"]?.total ?? 0).toLocaleString("en-GB"),
      note: "28 May to 9 Oct 2026; book not recorded",
    },
  ];

  const legacyPaid = legacyOrders.filter((r) => r.status === "paid" || r.status === "delivered").length;
  const erpcvEarlier: Metric[] = [
    { label: "Paid orders", value: legacyPaid.toLocaleString("en-GB"), note: "first version of ERPCV" },
    { label: "Refunded", value: legacyOrders.filter((r) => r.status === "refunded").length.toLocaleString("en-GB") },
  ];

  // ---------- Latest activity ----------
  const customerById = new Map(customers.map((c) => [str(c.id), c]));
  const who = (name: unknown, email: unknown) => [str(name), str(email)].filter(Boolean).join(" · ") || "Unknown";
  const activity: ActivityItem[] = [
    ...ndContacts.map((r) => {
      const form = str(r.source) ?? "newsletter";
      const sapo = form.startsWith("sapopedia");
      return {
        at: str(r.created_at) ?? "",
        product: sapo ? ("SAPopedia" as const) : ("noeldcosta.com" as const),
        what: form === "sapopedia-tally-import" ? "Book form (imported from Tally)" : sapo ? "Joined the new-book list" : `Signed up (${form})`,
        who: who(r.name, r.email),
      };
    }),
    ...ndMeetings.map((r) => ({ at: str(r.created_at) ?? "", product: "noeldcosta.com" as const, what: `Meeting request${str(r.topic) ? `: ${str(r.topic)}` : ""}`, who: who(r.name, r.email) })),
    ...bookLeads.map((r) => ({
      at: str(r.created_at) ?? "",
      product: isSapopedia(r) ? ("SAPopedia" as const) : ("noeldcosta.com" as const),
      what: `${r.book_type === "paid" ? "Playbook checkout" : "Book"}: ${str(r.book_title) ?? "book"}`,
      who: who(r.name, r.email),
    })),
    ...sold.map((r) => {
      const c = customerById.get(str(r.customer_id));
      return {
        at: str(r.paid_at) ?? str(r.created_at) ?? "",
        product: "ERPCV" as const,
        what: `${r.payment_status === "refunded" ? "Refunded" : "Paid"}: ${(str(r.product) ?? "order").replace(/_/g, " ")}, ${money(num(r.amount), str(r.currency) ?? currency)}`,
        who: who(c?.name, c?.email),
      };
    }),
    ...advisory.map((r) => ({ at: str(r.created_at) ?? "", product: "ERPCV" as const, what: `Advisory request${str(r.topic) ? `: ${str(r.topic)}` : ""}`, who: who(r.name, r.email) })),
  ]
    .filter((a) => a.at)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 15);

  return { people, noeldcosta, erpcv, erpcvEarlier, sapopedia, activity, errors };
}
