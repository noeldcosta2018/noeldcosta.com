import type { Metadata } from "next";
import { personJsonLd, websiteJsonLd } from "@/lib/seo";
import "../globals.css";
import "../nd-theme.css";
import "../nd-articles.css";
import "../nd-archives.css";
import "../nd-pages.css";
import { fontVariables } from "@/components/site/fonts";
import ThemeScript from "@/components/site/ThemeScript";
import PointerLayer from "@/components/site/PointerLayer";
import ChatWidget from "@/components/site/ChatWidget";
import { chatCopy } from "@/components/site/chat-copy";
import CookieConsent from "@/components/site/CookieConsent";
import { consentCopy } from "@/components/site/consent-copy";


// Search console ownership tags, set per environment in Vercel:
// GOOGLE_SITE_VERIFICATION (Google Search Console HTML tag content) and
// BING_SITE_VERIFICATION (Bing Webmaster Tools msvalidate.01 content).
const verification: Metadata["verification"] = {
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
  ...(process.env.BING_SITE_VERIFICATION
    ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
    : {}),
};
const OG_IMAGE = { url: "/og-image.png", width: 1200, height: 630, alt: "Noel D'Costa: enterprise applications, data and AI" };

export const metadata: Metadata = {
  verification,
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
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE.url],
    title: "Noel D'Costa | ERP, Data & AI",
    description:
      "25+ years delivering SAP, Oracle, and AI programmes across aviation, government, finance, retail, and manufacturing.",
  },
};

export default function SiteRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={fontVariables}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <PointerLayer />
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
        <ChatWidget copy={chatCopy("en")} />
        <CookieConsent copy={consentCopy("en")} policyHref="/privacy/" />
      </body>
    </html>
  );
}
