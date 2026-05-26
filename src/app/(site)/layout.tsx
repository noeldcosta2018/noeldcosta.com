import type { Metadata } from "next";
import { headers } from "next/headers";
import { Epilogue, Sora, JetBrains_Mono } from "next/font/google";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { personJsonLd, websiteJsonLd } from "@/lib/seo";
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

export default async function SiteRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Locale is set by src/proxy.ts (Next.js 16's renamed middleware) on the
  // request headers. Reading it here means the SSR'd <html> ships with the
  // correct lang/dir for the active route — search engines and screen
  // readers see the right values on first paint, not after a client-side
  // reconciliation.
  const h = await headers();
  const lang = h.get("x-locale") ?? "en";
  const dir = h.get("x-dir") ?? "ltr";

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${epilogue.variable} ${sora.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        {/* Site-wide WebSite + Person JSON-LD — emitted on every page so
            branded search picks up the entity graph and the about-the-author
            authority signal travels with every URL, not just the post page. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd()),
          }}
        />
        {children}
        {/* Mounted at the layout level so the floating widget appears on
            every page across both the English root and the /[lang]/
            rewrite subtree. The switcher itself is a client component;
            the layout stays server-rendered. */}
        <LanguageSwitcher />
      </body>
    </html>
  );
}
