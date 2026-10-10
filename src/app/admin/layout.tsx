import type { Metadata } from "next";
import { Epilogue, JetBrains_Mono } from "next/font/google";
import "../globals.css";

/**
 * Admin layout. English-only — admin is not localised.
 *
 * Provides its own <html>/<body> because the public site's root layout
 * lives in the (site) route group at src/app/(site)/layout.tsx. The admin
 * tree sits in its own top-level segment, so it needs to define the
 * document shell itself; without this, /admin/* routes 404 in production
 * even though they build cleanly.
 *
 * Per-route guards live in each page (so /admin/login can render publicly
 * while /admin/book-leads requires requireAdmin()).
 */

// Not preloaded: the build hoisted these preloads onto every public page,
// where they competed with the page's own CSS and fonts on slow connections.
// Admin is a handful of screens; a late font swap there costs nothing.
const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Admin · Noel D'Costa",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${epilogue.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-bone text-corbeau antialiased">
        {children}
      </body>
    </html>
  );
}
