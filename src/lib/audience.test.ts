import { describe, expect, it, vi } from "vitest";

// Fake source tables for the merged newsletter list.
const TABLES: Record<string, Record<string, unknown>[]> = {
  nd_contacts: [
    { email: "Ana@Example.com ", name: "Ana", consent: true, created_at: "2026-10-01T00:00:00Z", unsubscribed_at: null },
    { email: "gone@example.com", name: "Gone", consent: true, created_at: "2026-09-01T00:00:00Z", unsubscribed_at: "2026-09-20T00:00:00Z" },
  ],
  nd_meeting_requests: [{ email: "meet@example.com", name: "Meet", created_at: "2026-10-02T00:00:00Z" }],
  book_leads: [
    { email: "ana@example.com", name: "Ana B", marketing_opt_in: false, created_at: "2026-10-05T00:00:00Z" },
    { email: "reader@example.com", name: "Reader", marketing_opt_in: true, created_at: "2026-10-03T00:00:00Z" },
  ],
  erpcv_next_newsletter_subscriptions: [
    { email: "pending@example.com", status: "pending", confirmed_at: null, unsubscribed_at: null },
    { email: "gone@example.com", status: "confirmed", confirmed_at: "2026-08-01T00:00:00Z", unsubscribed_at: null },
  ],
  erpcv_next_customers: [{ email: "buyer@example.com", name: "Buyer", marketing_consent: false, created_at: "2026-07-01T00:00:00Z" }],
  erpcv_next_advisory_requests: [],
  profiles: [{ email: "meet@example.com", full_name: "Meet Profile", created_at: "2025-01-01T00:00:00Z" }],
  orders: [
    { email: "abandoned@example.com", status: "pending", created_at: "2025-02-01T00:00:00Z" },
    { email: "buyer@example.com", status: "paid", created_at: "2025-03-01T00:00:00Z" },
  ],
};

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: () => ({
    from: (table: string) => ({
      select: () => ({ limit: async () => ({ data: TABLES[table] ?? [], error: null }) }),
    }),
  }),
}));

const { loadAudience, csvCell } = await import("./audience");

describe("merged newsletter audience", () => {
  it("merges one row per email across both sites, with the right newsletter status", async () => {
    const { contacts, errors } = await loadAudience();
    expect(errors).toEqual([]);
    const by = Object.fromEntries(contacts.map((c) => [c.email, c]));

    // Case and spaces folded; any explicit consent makes a subscriber; first name kept.
    expect(by["ana@example.com"]).toMatchObject({ name: "Ana", status: "subscribed", sources: ["nd-signup", "nd-book"] });
    expect(by["ana@example.com"].firstSeen).toBe("2026-10-01T00:00:00Z");
    expect(by["ana@example.com"].lastSeen).toBe("2026-10-05T00:00:00Z");
    expect(by["reader@example.com"].status).toBe("subscribed");

    // An unsubscribe on one site wins over consent on the other.
    expect(by["gone@example.com"].status).toBe("unsubscribed");

    // Unconfirmed double opt-in, orders, profiles and meetings are not consent.
    expect(by["pending@example.com"].status).toBe("no-consent");
    expect(by["buyer@example.com"]).toMatchObject({ status: "no-consent", sources: ["erpcv-customer", "erpcv-order"] });
    expect(by["meet@example.com"]).toMatchObject({ status: "no-consent", sources: ["nd-meeting", "erpcv-profile"] });

    // Abandoned checkouts are left out.
    expect(by["abandoned@example.com"]).toBeUndefined();
  });

  it("neutralises spreadsheet formulas and quotes CSV cells", () => {
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell("D'Costa, Noel")).toBe('"D\'Costa, Noel"');
    expect(csvCell(null)).toBe("");
  });
});
