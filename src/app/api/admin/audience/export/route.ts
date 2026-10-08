export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { SOURCE_LABELS, csvCell, loadAudience } from "@/lib/audience";

/**
 * GET /api/admin/audience/export?status=subscribed|all
 *
 * Admin-only CSV of the merged contact list (see src/lib/audience.ts).
 * Default is "subscribed": only people with recorded newsletter consent and
 * no unsubscribe, ready to import into a newsletter tool. "all" includes
 * every contact with its status, for review or an opt-in campaign.
 */
export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return new Response(guard.reason ?? "forbidden", { status: 403 });

  const all = new URL(request.url).searchParams.get("status") === "all";
  const { contacts, errors } = await loadAudience();
  if (errors.length && !contacts.length) return new Response(errors.join("\n"), { status: 500 });

  const rows = all ? contacts : contacts.filter((c) => c.status === "subscribed");
  const header = ["email", "name", "newsletter_status", "sources", "first_seen", "last_seen"];
  const lines = rows.map((c) =>
    [c.email, c.name, c.status, c.sources.map((s) => SOURCE_LABELS[s]).join("; "), c.firstSeen, c.lastSeen]
      .map(csvCell)
      .join(","),
  );
  const date = new Date().toISOString().slice(0, 10);
  return new Response([header.join(","), ...lines].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contacts-${all ? "all" : "subscribed"}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
