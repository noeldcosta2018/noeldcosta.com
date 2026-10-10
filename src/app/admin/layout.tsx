import type { Metadata } from "next";
import "../globals.css";
import "../nd-theme.css";
import "./admin.css";
import { fontVariables } from "@/components/site/fonts";

/**
 * Admin layout. English-only — admin is not localised.
 *
 * Provides its own <html>/<body> because the public site's root layout
 * lives in the (site) route group at src/app/(site)/layout.tsx. The admin
 * tree sits in its own top-level segment, so it needs to define the
 * document shell itself; without this, /admin/* routes 404 in production
 * even though they build cleanly.
 *
 * Same fonts and dark theme tokens as the public site (nd-theme.css); the
 * older Tailwind colour names in the table components follow those tokens.
 * Per-route guards live in each page (src/components/admin/guard.tsx).
 */

export const metadata: Metadata = {
  title: "Admin · Noel D'Costa",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} data-theme="dark">
      <body className="nd-admin">{children}</body>
    </html>
  );
}
