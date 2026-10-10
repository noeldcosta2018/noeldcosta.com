import Link from "next/link";
import type { ReactNode } from "react";
import { getSupabasePublicConfig } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";

const NAV = [
  { key: "overview", label: "Overview", href: "/admin/" },
  { key: "people", label: "People", href: "/admin/contacts/" },
  { key: "meetings", label: "Meetings", href: "/admin/meetings/" },
  { key: "books", label: "Book leads", href: "/admin/book-leads/" },
] as const;

export type AdminSection = (typeof NAV)[number]["key"];

/** Frame for every signed-in admin page: top bar, section nav, page heading. */
export default function AdminShell({
  active,
  title,
  intro,
  email,
  actions,
  children,
}: {
  active: AdminSection;
  title: string;
  intro?: ReactNode;
  email?: string | null;
  actions?: ReactNode;
  children: ReactNode;
}) {
  let config: { url: string | null; anonKey: string | null } = { url: null, anonKey: null };
  try {
    config = getSupabasePublicConfig();
  } catch {
    // Sign-out then only returns to the sign-in page.
  }
  return (
    <>
      <header className="adm-top">
        <div className="adm-top-in">
          <Link href="/admin/" className="adm-brand" aria-label="Admin overview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/nd-monogram-on-dark.svg" alt="" width={28} height={28} />
            <span>Admin</span>
          </Link>
          <nav className="adm-nav" aria-label="Admin sections">
            {NAV.map((n) =>
              n.key === active ? (
                <span key={n.key} aria-current="page">
                  {n.label}
                </span>
              ) : (
                <Link key={n.key} href={n.href}>
                  {n.label}
                </Link>
              ),
            )}
          </nav>
          <div className="adm-user">
            {email && <span className="adm-email">{email}</span>}
            <SignOutButton url={config.url} anonKey={config.anonKey} />
          </div>
        </div>
      </header>
      <main id="main-content" className="adm-wrap">
        <div className="adm-head">
          <div>
            <h1 className="nd-display adm-h1">{title}</h1>
            {intro && <p className="adm-muted">{intro}</p>}
          </div>
          {actions && <div className="adm-actions">{actions}</div>}
        </div>
        {children}
      </main>
    </>
  );
}

/** A problem box listing sources the page could not read. */
export function AdminErrors({ title, errors }: { title: string; errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="adm-alert" role="status">
      <b>{title}</b>
      <ul>
        {errors.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  );
}
