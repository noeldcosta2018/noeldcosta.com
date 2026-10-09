import type { Metadata } from "next";
import "./globals.css";
import "./nd-theme.css";
import "./nd-pages.css";
import { fontVariables } from "@/components/site/fonts";
import ThemeScript from "@/components/site/ThemeScript";
import PointerLayer from "@/components/site/PointerLayer";
import NotFoundView from "@/components/site/NotFoundView";

// Unmatched URLs across both root layouts (English and localized) land here.
// Next adds noindex automatically for 404 responses.
export const metadata: Metadata = {
  title: "Page not found | Noel D'Costa",
  description: "The page has moved or is being refreshed. Browse the library or go back to the homepage.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr" className={fontVariables} data-theme="hybrid" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <PointerLayer />
        <NotFoundView />
      </body>
    </html>
  );
}
