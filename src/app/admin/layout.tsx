import type { Metadata } from "next";
import { Epilogue, JetBrains_Mono } from "next/font/google";
import "../globals.css";

/**
 * Admin layout. English-only — admin is not localised.
 *
 * Provides its own <html>/<body> because the project's root layout lives at
 * src/app/[lang]/layout.tsx (the i18n tree). The admin tree sits outside the
 * [lang] segment so it needs to define the document shell itself, otherwise
 * /admin/* routes 404 in production even though they build cleanly.
 *
 * Per-route guards live in each page (so /admin/login can render publicly
 * while /admin/book-leads requires requireAdmin()).
 */

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
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
