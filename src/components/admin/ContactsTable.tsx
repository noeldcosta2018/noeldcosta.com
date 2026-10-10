"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { AudienceContact, AudienceStatus, SourceKey } from "@/lib/audience";
import { SITES, contactSites, type Site } from "@/lib/audience-sites";

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
  const [site, setSite] = useState<Site | "">("");

  const counts = useMemo(() => {
    const byStatus: Record<AudienceStatus, number> = { subscribed: 0, unsubscribed: 0, "no-consent": 0 };
    const bySource = {} as Record<SourceKey, number>;
    const bySite = {} as Record<Site, number>;
    for (const c of contacts) {
      byStatus[c.status]++;
      for (const s of c.sources) bySource[s] = (bySource[s] ?? 0) + 1;
      for (const s of contactSites(c.sources)) bySite[s] = (bySite[s] ?? 0) + 1;
    }
    return { byStatus, bySource, bySite };
  }, [contacts]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return contacts.filter(
      (c) =>
        (!status || c.status === status) &&
        (!source || c.sources.includes(source)) &&
        (!site || contactSites(c.sources).includes(site)) &&
        (!needle || c.email.includes(needle) || c.name.toLowerCase().includes(needle)),
    );
  }, [contacts, q, status, source, site]);

  const sourceKeys = Object.keys(sourceLabels) as SourceKey[];

  return (
    <div className="adm-stack">
      <div className="adm-kpis" style={{ "--cols": 4 } as CSSProperties}>
        <div className="adm-kpi">
          <span className="k">All contacts</span>
          <span className="v">{contacts.length.toLocaleString("en-GB")}</span>
        </div>
        {(Object.keys(STATUS_LABEL) as AudienceStatus[]).map((s) => (
          <div key={s} className="adm-kpi">
            <span className="k">{STATUS_LABEL[s]}</span>
            <span className="v">{counts.byStatus[s].toLocaleString("en-GB")}</span>
          </div>
        ))}
      </div>

      <p className="adm-muted">
        Send the newsletter only to <b>Subscribed</b>{" "}contacts: they ticked a newsletter or marketing box, or confirmed an
        ERPCV newsletter sign-up. &ldquo;No newsletter consent&rdquo; means they gave their email for something else (an
        order, a profile, a meeting); ask them to opt in before adding them. The <b>AI Academy waitlist</b> agreed to
        emails about AI Ready in 30 Days only: use the waitlist export for those, not the newsletter. Unsubscribes always
        win across both sites.
      </p>

      <div className="adm-toolbar">
        <div className="adm-filters">
          <label className="adm-field">
            <span>Search</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or email" />
          </label>
          <label className="adm-field">
            <span>Site</span>
            <select value={site} onChange={(e) => setSite(e.target.value as Site | "")}>
              <option value="">All sites</option>
              {SITES.map((s) => (
                <option key={s} value={s}>
                  {s} ({counts.bySite[s] ?? 0})
                </option>
              ))}
            </select>
          </label>
          <label className="adm-field">
            <span>Newsletter status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as AudienceStatus | "")}>
              <option value="">All</option>
              {(Object.keys(STATUS_LABEL) as AudienceStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]} ({counts.byStatus[s]})
                </option>
              ))}
            </select>
          </label>
          <label className="adm-field">
            <span>Source</span>
            <select value={source} onChange={(e) => setSource(e.target.value as SourceKey | "")}>
              <option value="">All sources</option>
              {sourceKeys.map((s) => (
                <option key={s} value={s}>
                  {sourceLabels[s]} ({counts.bySource[s] ?? 0})
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="adm-actions">
          {/* File downloads need a full request, not client-side navigation. */}
          <a href="/api/admin/audience/export/?status=subscribed" download className="nd-btn nd-btn-primary adm-btn-sm">
            Export subscribers (CSV)
          </a>
          <a href="/api/admin/audience/export/?source=nd-academy-waitlist" download className="nd-btn nd-btn-secondary adm-btn-sm">
            Export AI Academy waitlist (CSV)
          </a>
          <a href="/api/admin/audience/export/?status=all" download className="nd-btn nd-btn-secondary adm-btn-sm">
            Export all contacts (CSV)
          </a>
        </div>
      </div>

      <p className="adm-count">
        Showing {rows.length} of {contacts.length}
      </p>

      <div className="adm-table">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Site</th>
              <th>Newsletter</th>
              <th>Sources</th>
              <th>First seen</th>
              <th>Last seen</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="adm-none">
                  No contacts match.
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c.email}>
                  <td className="mono">{c.email}</td>
                  <td>{c.name}</td>
                  <td>{contactSites(c.sources).join(", ")}</td>
                  <td>
                    <span className={`adm-badge ${c.status}`}>{STATUS_LABEL[c.status]}</span>
                  </td>
                  <td>{c.sources.map((s) => sourceLabels[s]).join(", ")}</td>
                  <td className="mono">{day(c.firstSeen)}</td>
                  <td className="mono">{day(c.lastSeen)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
