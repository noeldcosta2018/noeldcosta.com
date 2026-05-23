"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

/**
 * BookLeadsTable — search/filter/sort over the leads list.
 *
 * Fetches /api/admin/leads with debounced search. Calls the server-side
 * Supabase Auth signOut by clearing cookies through the browser client.
 *
 * No virtualisation. The table caps at 500 rows per page; pagination
 * controls under the table jump by `limit`.
 */

interface Lead {
  id: string;
  name: string;
  email: string;
  book_title: string;
  book_slug: string;
  book_type: "free" | "paid";
  source_page: string;
  created_at: string;
  consent_accepted: boolean;
}

interface Props {
  initialLeads: Lead[];
  initialTotal: number;
  bookOptions: { slug: string; title: string }[];
  initialLimit: number;
}

export default function BookLeadsTable({
  initialLeads,
  initialTotal,
  bookOptions,
  initialLimit,
}: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [total, setTotal] = useState<number>(initialTotal);
  const [q, setQ] = useState("");
  const [book, setBook] = useState("");
  const [sort, setSort] = useState("created_at");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = initialLimit;

  // Debounced refetch on filter change.
  useEffect(() => {
    const handle = setTimeout(() => {
      void refetch();
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, book, sort, dir, offset]);

  async function refetch() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (book) params.set("book", book);
    params.set("sort", sort);
    params.set("dir", dir);
    params.set("limit", String(limit));
    params.set("offset", String(offset));

    try {
      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { leads: Lead[]; total: number };
      setLeads(data.leads ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      window.location.href = "/admin/login";
      return;
    }
    try {
      const supabase = createBrowserClient(url, key);
      await supabase.auth.signOut();
    } finally {
      window.location.href = "/admin/login";
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-3 justify-between">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[0.65rem] tracking-[1.5px] uppercase text-eyebrow">
              Search
            </span>
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setOffset(0);
                setQ(e.target.value);
              }}
              placeholder="Name or email"
              className="bg-paper border border-corbeau/[0.15] rounded-md px-3 py-2 text-[0.9rem] text-corbeau w-[220px] focus:outline-none focus:border-papaya focus:shadow-[0_0_0_3px_rgba(252,152,90,0.10)]"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-mono text-[0.65rem] tracking-[1.5px] uppercase text-eyebrow">
              Book
            </span>
            <select
              value={book}
              onChange={(e) => {
                setOffset(0);
                setBook(e.target.value);
              }}
              className="bg-paper border border-corbeau/[0.15] rounded-md px-3 py-2 text-[0.9rem] text-corbeau min-w-[200px]"
            >
              <option value="">All books</option>
              {bookOptions.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.title}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-mono text-[0.65rem] tracking-[1.5px] uppercase text-eyebrow">
              Sort
            </span>
            <select
              value={`${sort}|${dir}`}
              onChange={(e) => {
                const [s, d] = e.target.value.split("|");
                setSort(s ?? "created_at");
                setDir((d as "asc" | "desc") ?? "desc");
                setOffset(0);
              }}
              className="bg-paper border border-corbeau/[0.15] rounded-md px-3 py-2 text-[0.9rem] text-corbeau"
            >
              <option value="created_at|desc">Newest first</option>
              <option value="created_at|asc">Oldest first</option>
              <option value="name|asc">Name A→Z</option>
              <option value="email|asc">Email A→Z</option>
              <option value="book_title|asc">Book A→Z</option>
            </select>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/admin/leads/export"
            className="inline-flex items-center justify-center bg-papaya text-corbeau font-bold text-[0.85rem] px-4 py-2.5 min-h-[44px] rounded-[8px] no-underline transition-all hover:bg-[#fb8843]"
          >
            Export CSV
          </a>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center justify-center bg-transparent text-corbeau font-bold text-[0.85rem] px-4 py-2.5 min-h-[44px] rounded-[8px] border border-corbeau/30 transition-all hover:bg-cream"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Stats */}
      <p className="font-mono text-[0.75rem] text-night">
        {loading ? "Loading…" : `${total} lead${total === 1 ? "" : "s"} total`}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-corbeau/[0.08] bg-paper">
        <table className="w-full text-left text-[0.88rem]">
          <thead className="bg-cream">
            <tr>
              <th className="px-3 py-2.5 font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow">
                Name
              </th>
              <th className="px-3 py-2.5 font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow">
                Email
              </th>
              <th className="px-3 py-2.5 font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow">
                Book
              </th>
              <th className="px-3 py-2.5 font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow">
                Type
              </th>
              <th className="px-3 py-2.5 font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow">
                Submitted
              </th>
              <th className="px-3 py-2.5 font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow">
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-night text-center text-[0.9rem]"
                >
                  No leads match the current filter.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-corbeau/[0.06]">
                <td className="px-3 py-2.5 text-corbeau">{lead.name}</td>
                <td className="px-3 py-2.5 text-night font-mono text-[0.82rem]">
                  {lead.email}
                </td>
                <td className="px-3 py-2.5 text-corbeau">{lead.book_title}</td>
                <td className="px-3 py-2.5">
                  <span
                    className={`font-mono text-[0.7rem] tracking-[1px] uppercase px-2 py-0.5 rounded font-semibold ${
                      lead.book_type === "paid"
                        ? "bg-corbeau text-papaya"
                        : "bg-papaya text-corbeau"
                    }`}
                  >
                    {lead.book_type}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-night font-mono text-[0.78rem]">
                  {new Date(lead.created_at).toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-night font-mono text-[0.78rem]">
                  {lead.source_page}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[0.75rem] text-night">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
              className="inline-flex items-center justify-center bg-transparent text-corbeau font-bold text-[0.85rem] px-3 py-2 min-h-[44px] rounded-[8px] border border-corbeau/30 transition-all hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
              className="inline-flex items-center justify-center bg-transparent text-corbeau font-bold text-[0.85rem] px-3 py-2 min-h-[44px] rounded-[8px] border border-corbeau/30 transition-all hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
