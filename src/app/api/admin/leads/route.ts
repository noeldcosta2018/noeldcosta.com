export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";

/**
 * GET /api/admin/leads
 *
 * Admin-only. Returns rows from public.book_leads with optional filters:
 *   ?q=text           search name + email (ilike)
 *   ?book=slug        filter by book_slug
 *   ?sort=created_at  (default) or 'name', 'email', 'book_title'
 *   ?dir=desc|asc     (default desc)
 *   ?limit=50         default 50, max 500
 *   ?offset=0         pagination offset
 */

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return Response.json(
      { error: guard.reason ?? "forbidden" },
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const book = url.searchParams.get("book")?.trim() ?? "";
  const sort = url.searchParams.get("sort") ?? "created_at";
  const dir = url.searchParams.get("dir") === "asc" ? "asc" : "desc";
  const limit = Math.min(
    500,
    Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10) || 50),
  );
  const offset = Math.max(
    0,
    parseInt(url.searchParams.get("offset") ?? "0", 10) || 0,
  );

  const SORT_WHITELIST = new Set([
    "created_at",
    "name",
    "email",
    "book_title",
    "book_type",
  ]);
  const sortColumn = SORT_WHITELIST.has(sort) ? sort : "created_at";

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("book_leads")
    .select("*", { count: "exact" })
    .order(sortColumn, { ascending: dir === "asc" })
    .range(offset, offset + limit - 1);

  if (book) query = query.eq("book_slug", book);
  if (q) {
    // ilike works against name OR email
    const like = `%${q.replace(/[%_]/g, "")}%`;
    query = query.or(`name.ilike.${like},email.ilike.${like}`);
  }

  const { data, error, count } = await query;
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ leads: data ?? [], total: count ?? 0 });
}
