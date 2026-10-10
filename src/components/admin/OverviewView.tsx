import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import AdminShell, { AdminErrors } from "./AdminShell";
import type { Metric, Overview } from "@/lib/admin-metrics";

/** Admin overview layout: one section per site, then the latest activity. */

function Tiles({ items }: { items: Metric[] }) {
  // Even rows on desktop: six tiles as 3 + 3, everything else in fours.
  const cols = items.length > 4 && items.length % 3 === 0 ? 3 : 4;
  return (
    <div className="adm-kpis" style={{ "--cols": cols } as CSSProperties}>
      {items.map((m) => (
        <div key={m.label} className="adm-kpi">
          <span className="k">{m.label}</span>
          <span className="v">{m.value}</span>
          {m.note && <span className="n">{m.note}</span>}
        </div>
      ))}
    </div>
  );
}

function Section({
  name,
  detail,
  band,
  links,
  children,
}: {
  name: string;
  detail: string;
  band: string;
  links?: { label: string; href: string }[];
  children: ReactNode;
}) {
  return (
    <section className="adm-product" style={{ "--band": band } as CSSProperties} aria-label={name}>
      <div className="adm-product-head">
        <h2>
          {name} <span>{detail}</span>
        </h2>
        {links && (
          <div className="adm-links">
            {links.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label} <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai" });

export default function OverviewView({ data: o, email }: { data: Overview; email?: string | null }) {
  return (
    <AdminShell
      active="overview"
      title="Overview"
      email={email}
      intro="noeldcosta.com, ERPCV and SAPopedia in one place. ERPCV money counts live payments only, never Stripe test orders. Times are UAE time."
    >
      <AdminErrors title="Some sources could not be read" errors={o.errors} />

      <Section name="Everyone" detail="all sites, one row per email" band="var(--ink)" links={[{ label: "People and exports", href: "/admin/contacts/" }]}>
        <Tiles items={o.people} />
      </Section>

      <Section
        name="noeldcosta.com"
        detail="sign-ups, meetings, books"
        band="var(--accent)"
        links={[
          { label: "Meetings", href: "/admin/meetings/" },
          { label: "Book leads", href: "/admin/book-leads/" },
        ]}
      >
        <Tiles items={o.noeldcosta} />
      </Section>

      <Section name="ERPCV" detail="career packs, assessments, advisory" band="var(--area-apps)">
        <Tiles items={o.erpcv} />
        <p className="adm-sub">Earlier version of ERPCV (until September 2026)</p>
        <Tiles items={o.erpcvEarlier} />
      </Section>

      <Section name="SAPopedia" detail="sapopedia.com" band="var(--area-data)">
        <div className="adm-empty">
          <b>Not connected yet.</b> SAPopedia is moving to Netlify. Once its sign-ups and sales are saved to this database, its
          numbers appear here and its people join the People list.
        </div>
      </Section>

      <Section name="Latest activity" detail="newest first" band="var(--mut2)">
        {o.activity.length === 0 ? (
          <div className="adm-empty">Nothing yet.</div>
        ) : (
          <div className="adm-table">
            <table>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Site</th>
                  <th>What</th>
                  <th>Who</th>
                </tr>
              </thead>
              <tbody>
                {o.activity.map((a, i) => (
                  <tr key={`${a.at}-${i}`}>
                    <td className="mono">{when(a.at)}</td>
                    <td>{a.product}</td>
                    <td>{a.what}</td>
                    <td>{a.who}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </AdminShell>
  );
}
