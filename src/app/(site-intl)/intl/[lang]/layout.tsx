import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Epilogue, Sora, JetBrains_Mono } from "next/font/google";
import RootLayoutShell from "@/components/RootLayoutShell";
import {
  RTL_LOCALES,
  TARGET_LANGUAGES,
  isTargetLanguage,
} from "@/lib/locales";
import "../../../globals.css";

// Root layout for the (site-intl) route group — the translated public
// site under the /<lang>/ rewrite subtree (`/ja/...`, `/ar/...`, etc., all
// rewritten in next.config.ts to /intl/<lang>/...). Because no
// layout.tsx exists between this file and app/, this layout IS a root
// layout per the Next.js 16 multi-root-layout pattern (see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md
// lines 140-146). It receives the [lang] param synchronously enough at
// build time for `dynamicParams: false` to keep the prerendered HTML
// statically cached on Vercel — no proxy, no headers(), no dynamic SSR.
// That's the whole point of the split; the proxy approach attempted in
// Block 6a v1 forced dynamic rendering on catch-all routes, which broke
// MDX content reads against outputFileTracingExcludes.
//
// Body chrome (fonts, JSON-LD, LanguageSwitcher) is shared with the
// English root layout via RootLayoutShell. Only the <html> element
// differs — lang and dir derive from the served locale.

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  // Epilogue is the primary display face; Sora is a CSS fallback only.
  // Skip the auto-preload so the 4 .woff2 preloads above the fold drop
  // to those genuinely used in the LCP frame (Epilogue + JetBrains Mono).
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Sitewide indexing + brand metadata. Mirrors the English (site-en)
// layout so every locale ships with the same robots directives and OG
// defaults; per-page metadata (locale homepage, MDX pages) overrides
// title and description on the actual page.
export const metadata: Metadata = {
  metadataBase: new URL("https://noeldcosta.com"),
  title: {
    default: "Noel D'Costa | ERP, Data & AI",
    template: "%s | Noel D'Costa",
  },
  description:
    "25+ years helping companies migrate ERP, build AI, and get real value from SAP and Oracle systems.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Noel D'Costa | ERP, Data & AI",
    description:
      "ECC to S/4HANA migrations. AI on top of ERP. Real results.",
    url: "https://noeldcosta.com",
    siteName: "Noel D'Costa",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Noel D'Costa | ERP, Data & AI",
    description:
      "25+ years delivering SAP, Oracle, and AI programmes across aviation, government, finance, retail, and manufacturing.",
  },
};

// Enumerate the 10 routed locales at build time so this layout, like the
// pages beneath it, is statically prerendered for each locale.
export function generateStaticParams() {
  return TARGET_LANGUAGES.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export default async function SiteRootLayoutIntl({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isTargetLanguage(lang)) notFound();
  const dir = (RTL_LOCALES as readonly string[]).includes(lang) ? "rtl" : "ltr";

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${epilogue.variable} ${sora.variable} ${jetbrainsMono.variable}`}
    >
      <RootLayoutShell>{children}</RootLayoutShell>
    </html>
  );
}
