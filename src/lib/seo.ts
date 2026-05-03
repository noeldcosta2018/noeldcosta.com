import type { Metadata } from "next";
import type { Locale, PostRecord, PageRecord } from "./content";
import { LOCALES, getAvailableLocales, CATEGORIES } from "./content";

export const SITE_URL = "https://noeldcosta.com";
export const SITE_NAME = "Noel D'Costa";
export const AUTHOR = {
  name: "Noel D'Costa",
  url: "https://noeldcosta.com/about",
  jobTitle: "ERP, Data & AI Consultant",
  image: "https://noeldcosta.com/headshot.png",
  sameAs: [
    "https://www.linkedin.com/in/noeldcosta/",
    "https://www.youtube.com/@NoelDCostaERPAI",
  ],
};

const LOCALE_HREFLANG: Record<Locale, string> = {
  en: "en",
  ja: "ja",
  es: "es",
  fr: "fr",
  ru: "ru",
  it: "it",
  pt: "pt",
  de: "de",
  ar: "ar",
  zh: "zh",
  ko: "ko",
  hi: "hi",
  tr: "tr",
  nl: "nl",
};

function localePath(locale: Locale, slug: string): string {
  return locale === "en" ? `/${slug}` : `/${locale}/${slug}`;
}

/**
 * Convert a date string of any format into ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`).
 * Required by Google for `<meta property="article:published_time">` and
 * Article JSON-LD `datePublished` / `dateModified`. WordPress exports often
 * use `"2025-07-12 19:43:57"` which is NOT ISO 8601 — that string fails the
 * structured-data validator. This helper normalises everything safely.
 */
export function toIso(input?: string | null): string | undefined {
  if (!input) return undefined;
  const s = String(input).trim();
  if (!s) return undefined;
  // Already ISO-ish? Just normalise via Date roundtrip.
  const parsed = new Date(s.includes("T") ? s : s.replace(" ", "T"));
  if (isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

/** Rough word count for Article schema. Strips markdown syntax characters. */
function countWords(body: string): number {
  return body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`~\[\]\(\)!\\-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function buildPostMetadata(post: PostRecord): Metadata {
  const fm = post.frontmatter;
  const title = fm.metaTitle || fm.title;
  const description =
    fm.metaDescription || fm.excerpt || `${fm.title} — by Noel D'Costa.`;
  const canonical =
    fm.canonical || `${SITE_URL}${localePath(post.locale, fm.slug)}`;

  // Only emit hreflang for locales that actually have MDX
  const available = getAvailableLocales("posts", fm.slug);
  const languages: Record<string, string> = {};
  for (const loc of available) {
    languages[LOCALE_HREFLANG[loc]] = `${SITE_URL}${localePath(loc, fm.slug)}`;
  }
  if (available.includes("en")) {
    languages["x-default"] = `${SITE_URL}${localePath("en", fm.slug)}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    robots: fm.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "article",
      locale: post.locale,
      publishedTime: toIso(fm.date),
      modifiedTime: toIso(fm.updated),
      authors: [AUTHOR.name],
      images: fm.hero
        ? [{ url: fm.hero, alt: fm.heroAlt || fm.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: fm.hero ? [fm.hero] : undefined,
    },
  };
}

export function buildPageMetadata(page: PageRecord): Metadata {
  const fm = page.frontmatter;
  const title = fm.metaTitle || fm.title;
  const description =
    fm.metaDescription || fm.excerpt || `${fm.title} — Noel D'Costa.`;
  const canonical =
    fm.canonical || `${SITE_URL}${localePath(page.locale, fm.slug)}`;

  const available = getAvailableLocales("pages", fm.slug);
  const languages: Record<string, string> = {};
  for (const loc of available) {
    languages[LOCALE_HREFLANG[loc]] = `${SITE_URL}${localePath(loc, fm.slug)}`;
  }
  if (available.includes("en")) {
    languages["x-default"] = `${SITE_URL}${localePath("en", fm.slug)}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    robots: fm.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      locale: page.locale,
      images: fm.hero ? [{ url: fm.hero }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: fm.hero ? [fm.hero] : undefined,
    },
  };
}

// ─── JSON-LD builders ────────────────────────────────────────────────────

export function articleJsonLd(post: PostRecord) {
  const fm = post.frontmatter;
  const url = `${SITE_URL}${localePath(post.locale, fm.slug)}`;
  const heroAbsolute = fm.hero
    ? fm.hero.startsWith("http")
      ? fm.hero
      : `${SITE_URL}${fm.hero}`
    : undefined;
  const cat = CATEGORIES[fm.category as keyof typeof CATEGORIES];

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: fm.title,
    description: fm.metaDescription || fm.excerpt,
    image: heroAbsolute
      ? [
          {
            "@type": "ImageObject",
            url: heroAbsolute,
            caption: fm.heroAlt || fm.title,
          },
        ]
      : undefined,
    datePublished: toIso(fm.date),
    dateModified: toIso(fm.updated || fm.date),
    author: {
      "@type": "Person",
      name: AUTHOR.name,
      url: AUTHOR.url,
      jobTitle: AUTHOR.jobTitle,
      image: AUTHOR.image,
      sameAs: AUTHOR.sameAs,
    },
    publisher: {
      "@type": "Person",
      name: AUTHOR.name,
      url: AUTHOR.url,
      logo: {
        "@type": "ImageObject",
        url: AUTHOR.image,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    articleSection: cat?.label,
    wordCount: countWords(post.body),
    inLanguage: post.locale,
  };
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: AUTHOR.name,
    url: AUTHOR.url,
    jobTitle: AUTHOR.jobTitle,
    image: AUTHOR.image,
    sameAs: AUTHOR.sameAs,
    knowsAbout: [
      "SAP S/4HANA",
      "Oracle ERP",
      "ERP Implementation",
      "Data Migration",
      "AI Governance",
      "Agentic AI",
      "Programme Recovery",
    ],
  };
}

/**
 * WebSite schema — emitted once per page in the root layout. Powers branded
 * search recognition. We deliberately do NOT include `potentialAction`/
 * `SearchAction` because the site has no `/search` endpoint; advertising one
 * that doesn't work invites a manual action.
 */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    publisher: {
      "@type": "Person",
      name: AUTHOR.name,
      url: AUTHOR.url,
    },
    inLanguage: "en",
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export { LOCALES };
