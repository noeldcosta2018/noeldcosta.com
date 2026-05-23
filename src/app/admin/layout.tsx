import type { Metadata } from "next";

/**
 * Admin layout. English-only — admin is not localised.
 *
 * Per-route guards live in each page (so /admin/login can render publicly
 * while /admin/book-leads requires requireAdmin()). This layout is the
 * shared shell.
 */

export const metadata: Metadata = {
  title: "Admin · Noel D'Costa",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bone text-corbeau">
      {children}
    </div>
  );
}
