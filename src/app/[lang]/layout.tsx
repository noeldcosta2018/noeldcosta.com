import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Epilogue, Sora, JetBrains_Mono } from "next/font/google";
import { LOCALES, type Locale } from "@/lib/content";
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
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// RTL locales — the only one in scope today is Arabic.
const RTL_LOCALES = new Set<Locale>(["ar"]);

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

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export default async function LocaleRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const locale = lang as Locale;
  const dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
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
      </body>
    </html>
  );
}
