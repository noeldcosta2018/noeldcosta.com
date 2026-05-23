export const runtime = "nodejs";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";

/**
 * GET /api/admin/leads/export
 *
 * Admin-only CSV download of every row in public.book_leads.
 * Streams a Content-Type: text/csv with Content-Disposition: attachment.
 */

const COLUMNS = [
  "id",
  "name",
  "email",
  "book_title",
  "book_slug",
  "book_type",
  "source_page",
  "consent_accepted",
  "created_at",
  "ip_address",
  "user_agent",
] as const;

type LeadRow = Record<(typeof COLUMNS)[number], unknown>;

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes("\n") || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return new Response(guard.reason ?? "forbidden", { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("book_leads")
    .select(COLUMNS.join(","))
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  const rows = (data ?? []) as unknown as LeadRow[];
  const header = COLUMNS.join(",");
  const lines = rows.map((row) =>
    COLUMNS.map((c) => escapeCsv(row[c])).join(","),
  );
  const csv = [header, ...lines].join("\n");

  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="book-leads-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
