"use client";

import { useMemo, useState } from "react";
import type { AudienceContact, AudienceStatus, SourceKey } from "@/lib/audience";

/**
 * Filterable view of the merged contact list. The whole list (a few hundred
 * rows) arrives from the server page, so search and filters run in the
 * browser. Exports go through /api/admin/audience/export.
 */

const STATUS_LABEL: Record<AudienceStatus, string> = {
  subscribed: "Subscribed",
  unsubscribed: "Unsubscribed",
  "no-consent": "No newsletter consent",
};

const STATUS_CLASS: Record<AudienceStatus, string> = {
  subscribed: "bg-[#e6f4ea] text-[#1e6b34]",
  unsubscribed: "bg-[#fdecea] text-[#9b2c2c]",
  "no-consent": "bg-cream text-night",
};

const label = "font-mono text-[0.65rem] tracking-[1.5px] uppercase text-eyebrow";
const field = "bg-paper border border-corbeau/[0.15] rounded-md px-3 py-2 text-[0.9rem] text-corbeau";
const th = "px-3 py-2.5 font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow";

function day(iso: string | null) {
  return iso ? iso.slice(0, 10) : "";
}

export default function ContactsTable({
  contacts,
  sourceLabels,
}: {
  contacts: AudienceContact[];
  sourceLabels: Record<SourceKey, string>;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<AudienceStatus | "">("");
  const [source, setSource] = useState<SourceKey | "">("");

  const counts = useMemo(() => {
    const byStatus: Record<AudienceStatus, number> = { subscribed: 0, unsubscribed: 0, "no-consent": 0 };
    const bySource = {} as Record<SourceKey, number>;
    for (const c of contacts) {
      byStatus[c.status]++;
      for (const s of c.sources) bySource[s] = (bySource[s] ?? 0) + 1;
    }
    return { byStatus, bySource };
  }, [contacts]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return contacts.filter(
      (c) =>
        (!status || c.status === status) &&
        (!source || c.sources.includes(source)) &&
        (!needle || c.email.includes(needle) || c.name.toLowerCase().includes(needle)),
    );
  }, [contacts, q, status, source]);

  const sourceKeys = Object.keys(sourceLabels) as SourceKey[];

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-3 sm:grid-cols-4">
        <div className="bg-paper border border-corbeau/[0.08] rounded-xl p-4">
          <p className={label}>All contacts</p>
          <p className="font-display font-black text-corbeau text-[1.8rem]">{contacts.length}</p>
        </div>
        {(Object.keys(STATUS_LABEL) as AudienceStatus[]).map((s) => (
          <div key={s} className="bg-paper border border-corbeau/[0.08] rounded-xl p-4">
            <p className={label}>{STATUS_LABEL[s]}</p>
            <p className="font-display font-black text-corbeau text-[1.8rem]">{counts.byStatus[s]}</p>
          </div>
        ))}
      </section>

      <p className="text-night text-[0.88rem] leading-[1.6] max-w-[80ch]">
        Send the newsletter only to <b>Subscribed</b> contacts: they ticked a newsletter or marketing box, or confirmed an
        ERPCV newsletter sign-up. &ldquo;No newsletter consent&rdquo; means they gave their email for something else (an
        order, a profile, a meeting); ask them to opt in before adding them. The <b>AI Academy waitlist</b> agreed to
        emails about AI Ready in 30 Days only: use the waitlist export for those, not the newsletter. Unsubscribes always
        win across both sites.
      </p>

      <div className="flex flex-wrap items-end gap-3 justify-between">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className={label}>Search</span>
            <input className={`${field} w-[220px]`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or email" />
          </label>
          <label className="flex flex-col gap-1">
            <span className={label}>Newsletter status</span>
            <select className={field} value={status} onChange={(e) => setStatus(e.target.value as AudienceStatus | "")}>
              <option value="">All</option>
              {(Object.keys(STATUS_LABEL) as AudienceStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]} ({counts.byStatus[s]})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className={label}>Source</span>
            <select className={`${field} min-w-[240px]`} value={source} onChange={(e) => setSource(e.target.value as SourceKey | "")}>
              <option value="">All sources</option>
              {sourceKeys.map((s) => (
                <option key={s} value={s}>
                  {sourceLabels[s]} ({counts.bySource[s] ?? 0})
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* File downloads need a full request, not client-side navigation. */}
          <a
            href="/api/admin/audience/export/?status=subscribed"
            download
            className="inline-flex items-center justify-center bg-papaya text-corbeau font-bold text-[0.85rem] px-4 py-2.5 min-h-[44px] rounded-[8px] no-underline"
          >
            Export subscribers (CSV)
          </a>
          <a
            href="/api/admin/audience/export/?source=nd-academy-waitlist"
            download
            className="inline-flex items-center justify-center text-corbeau font-bold text-[0.85rem] px-4 py-2.5 min-h-[44px] rounded-[8px] border border-corbeau/30 no-underline"
          >
            Export AI Academy waitlist (CSV)
          </a>
          <a
            href="/api/admin/audience/export/?status=all"
            download
            className="inline-flex items-center justify-center text-corbeau font-bold text-[0.85rem] px-4 py-2.5 min-h-[44px] rounded-[8px] border border-corbeau/30 no-underline"
          >
            Export all contacts (CSV)
          </a>
        </div>
      </div>

      <p className="font-mono text-[0.75rem] text-night">
        Showing {rows.length} of {contacts.length}
      </p>

      <div className="overflow-x-auto rounded-xl border border-corbeau/[0.08] bg-paper">
        <table className="w-full text-left text-[0.88rem]">
          <thead className="bg-cream">
            <tr>
              <th className={th}>Email</th>
              <th className={th}>Name</th>
              <th className={th}>Newsletter</th>
              <th className={th}>Sources</th>
              <th className={th}>First seen</th>
              <th className={th}>Last seen</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-night text-center">
                  No contacts match.
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c.email} className="border-t border-corbeau/[0.06] align-top">
                  <td className="px-3 py-2.5 text-night font-mono text-[0.82rem]">{c.email}</td>
                  <td className="px-3 py-2.5 text-corbeau">{c.name}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[0.75rem] font-semibold ${STATUS_CLASS[c.status]}`}>
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-night text-[0.82rem]">{c.sources.map((s) => sourceLabels[s]).join(", ")}</td>
                  <td className="px-3 py-2.5 text-night font-mono text-[0.78rem] whitespace-nowrap">{day(c.firstSeen)}</td>
                  <td className="px-3 py-2.5 text-night font-mono text-[0.78rem] whitespace-nowrap">{day(c.lastSeen)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
