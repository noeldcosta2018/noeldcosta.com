import type { Metadata } from "next";
import { Epilogue, Sora, JetBrains_Mono } from "next/font/google";
import RootLayoutShell from "@/components/RootLayoutShell";
import "../globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://noeldcosta.com"),
  title: {
    default: "Noel D'Costa | ERP, Data & AI",
    template: "%s | Noel D'Costa",
  },
  description:
    "25+ years helping companies migrate ERP, build AI, and get real value from SAP and Oracle systems.",
  // Explicit indexing directives — silences SEO auditors that flag the
  // absence of an explicit robots meta. Per-post `noindex` (set in
  // frontmatter) overrides this via buildPostMetadata.
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

// Root layout for the (site-en) route group — the English public site at
// flat WordPress URLs. Companion to (site-intl)/intl/[lang]/layout.tsx,
// which is the root layout for the /<lang>/ rewrite subtree and emits
// the lang/dir attributes from its [lang] param. Splitting the public
// site into two route-group root layouts lets the SSR'd <html> ship with
// the correct locale attributes without proxy- or middleware-induced
// dynamic rendering — see Block 6a's reverted commit for the regression
// the multi-root-layout pattern avoids.
//
// Body chrome (fonts, JSON-LD, LanguageSwitcher) is shared with the intl
// layout via RootLayoutShell. Only the <html> element differs.
export default function SiteRootLayoutEn({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${epilogue.variable} ${sora.variable} ${jetbrainsMono.variable}`}
    >
      <RootLayoutShell>{children}</RootLayoutShell>
    </html>
  );
}
