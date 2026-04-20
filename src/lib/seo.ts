import type { Metadata } from "next";
import type { Locale, PostRecord, PageRecord } from "./content";
import { LOCALES, getAvailableLocales } from "./content";

export const SITE_URL = "https://noeldcosta.com";
export const SITE_NAME = "Noel D'Costa";
export const AUTHOR = {
  name: "Noel D'Costa",
  url: "https://noeldcosta.com/about",
  jobTitle: "ERP, Data & AI Consultant",
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
      publishedTime: fm.date,
      modifiedTime: fm.updated,
      authors: [AUTHOR.name],
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

// JSON-LD builders
export function articleJsonLd(post: PostRecord) {
  const fm = post.frontmatter;
  const url = `${SITE_URL}${localePath(post.locale, fm.slug)}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: fm.title,
    description: fm.metaDescription || fm.excerpt,
    image: fm.hero ? [fm.hero] : undefined,
    datePublished: fm.date,
    dateModified: fm.updated || fm.date,
    author: {
      "@type": "Person",
      name: AUTHOR.name,
      url: AUTHOR.url,
      jobTitle: AUTHOR.jobTitle,
      sameAs: AUTHOR.sameAs,
    },
    publisher: {
      "@type": "Person",
      name: AUTHOR.name,
      url: AUTHOR.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
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
