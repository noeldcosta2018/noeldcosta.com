import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { personJsonLd, websiteJsonLd } from "@/lib/seo";
import {
  getLocalizedDocumentAttributes,
  getLocalizedLocaleParams,
} from "@/lib/localized-article-routing";
import "../../globals.css";
import "../../nd-theme.css";
import "../../nd-articles.css";
import "../../nd-archives.css";
import "../../nd-pages.css";
import { fontVariables } from "@/components/site/fonts";
import ThemeScript from "@/components/site/ThemeScript";
import PointerLayer from "@/components/site/PointerLayer";
import ChatWidget from "@/components/site/ChatWidget";
import { chatCopy } from "@/components/site/chat-copy";
import CookieConsent from "@/components/site/CookieConsent";
import { consentCopy } from "@/components/site/consent-copy";

// Same title template as the English root layout (src/app/(site)/layout.tsx)
// so translated pages carry the brand suffix too.

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
  openGraph: { siteName: "Noel D'Costa", type: "website", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", images: [OG_IMAGE.url] },
  metadataBase: new URL("https://noeldcosta.com"),
  title: {
    default: "Noel D'Costa | ERP, Data & AI",
    template: "%s | Noel D'Costa",
  },
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
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getLocalizedLocaleParams();
}

export default async function LocalizedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const documentAttributes = getLocalizedDocumentAttributes(locale);
  if (!documentAttributes) notFound();

  return (
    <html
      lang={documentAttributes.lang}
      dir={documentAttributes.dir}
      className={fontVariables}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <PointerLayer />
        {/* Site-wide WebSite + Person JSON-LD, as on English pages. */}
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
        <ChatWidget copy={chatCopy(documentAttributes.contentLocale)} locale={documentAttributes.lang} />
        <CookieConsent copy={consentCopy(documentAttributes.contentLocale)} policyHref="/privacy/" />
      </body>
    </html>
  );
}
