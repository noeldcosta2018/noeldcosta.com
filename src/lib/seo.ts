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
  description:
    "Senior ERP, data, and AI advisor. 25 years across SAP, Oracle, and Microsoft programmes in aviation, defence, government, finance, retail, and manufacturing. Finance background. Has delivered $700M+ in transformations.",
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
 * Convert a date string of any format into ISO 8601. WordPress exports use
 * `"YYYY-MM-DD HH:mm:ss"` which fails Google's structured-data validator.
 */
export function toIso(input?: string | null): string | undefined {
  if (!input) return undefined;
  const s = String(input).trim();
  if (!s) return undefined;
  const parsed = new Date(s.includes("T") ? s : s.replace(" ", "T"));
  if (isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function countWords(body: string): number {
  return body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`~\[\]\(\)!\\-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

// ─── Page Metadata builders (for Next.js `generateMetadata`) ─────────────

export function buildPostMetadata(post: PostRecord): Metadata {
  const fm = post.frontmatter;
  const title = fm.metaTitle || fm.title;
  const description =
    fm.metaDescription || fm.excerpt || `${fm.title} — by Noel D'Costa.`;
  const canonical =
    fm.canonical || `${SITE_URL}${localePath(post.locale, fm.slug)}`;

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
    alternates: { canonical, languages },
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
    alternates: { canonical, languages },
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

// ─── Topic / mentions defaults — entity disambiguation for Google ────────
//
// Google's understanding of "what a page is about" is increasingly entity-
// based, not keyword-based. Each entity below resolves to a Wikipedia or
// vendor URL via `sameAs`, which lets Google connect the article to its
// knowledge graph. Articles can override per-frontmatter via `mentions: [...]`.

const ENTITY_MAP: Record<string, { name: string; sameAs?: string; type?: string }> = {
  sap: {
    name: "SAP SE",
    sameAs: "https://en.wikipedia.org/wiki/SAP_SE",
    type: "Organization",
  },
  "s/4hana": {
    name: "SAP S/4HANA",
    sameAs: "https://en.wikipedia.org/wiki/SAP_S/4HANA",
    type: "SoftwareApplication",
  },
  s4hana: {
    name: "SAP S/4HANA",
    sameAs: "https://en.wikipedia.org/wiki/SAP_S/4HANA",
    type: "SoftwareApplication",
  },
  ecc: {
    name: "SAP ERP Central Component (ECC)",
    sameAs: "https://en.wikipedia.org/wiki/SAP_ERP",
    type: "SoftwareApplication",
  },
  fiori: {
    name: "SAP Fiori",
    sameAs: "https://en.wikipedia.org/wiki/SAP_Fiori",
    type: "SoftwareApplication",
  },
  btp: {
    name: "SAP Business Technology Platform",
    sameAs: "https://www.sap.com/products/technology-platform.html",
    type: "SoftwareApplication",
  },
  cpi: {
    name: "SAP Cloud Platform Integration",
    sameAs: "https://www.sap.com/products/integration-suite.html",
    type: "SoftwareApplication",
  },
  oracle: {
    name: "Oracle Corporation",
    sameAs: "https://en.wikipedia.org/wiki/Oracle_Corporation",
    type: "Organization",
  },
  "oracle ebs": {
    name: "Oracle E-Business Suite",
    sameAs: "https://en.wikipedia.org/wiki/Oracle_E-Business_Suite",
    type: "SoftwareApplication",
  },
  microsoft: {
    name: "Microsoft Dynamics 365",
    sameAs: "https://en.wikipedia.org/wiki/Microsoft_Dynamics_365",
    type: "SoftwareApplication",
  },
  joule: {
    name: "SAP Joule",
    sameAs: "https://www.sap.com/products/artificial-intelligence/ai-assistant.html",
    type: "SoftwareApplication",
  },
};

function defaultMentionsForCategory(category: string): { name: string; sameAs?: string; type?: string }[] {
  // SAP-heavy categories get the SAP entity stack; others stay minimal.
  const sapEntities = [
    ENTITY_MAP["sap"],
    ENTITY_MAP["s/4hana"],
    ENTITY_MAP["fiori"],
  ];
  switch (category) {
    case "platforms-modules":
    case "erp-implementation":
    case "case-studies":
      return sapEntities;
    case "agentic-ai":
    case "ai-governance":
      return [ENTITY_MAP["sap"], ENTITY_MAP["joule"]];
    default:
      return [ENTITY_MAP["sap"]];
  }
}

function mentionsToSchema(
  mentions: { name: string; sameAs?: string; type?: string }[],
) {
  return mentions.map((m) => ({
    "@type": m.type || "Thing",
    name: m.name,
    ...(m.sameAs ? { sameAs: m.sameAs } : {}),
  }));
}

// ─── JSON-LD builders ────────────────────────────────────────────────────

/**
 * Author Person object (full E-E-A-T entity). Reused as `author` and
 * `publisher` on every article. Includes verifiable credentials, employer,
 * and an expanded `knowsAbout` topic graph.
 */
function authorPerson() {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/#noel-dcosta`,
    name: AUTHOR.name,
    url: AUTHOR.url,
    jobTitle: AUTHOR.jobTitle,
    image: AUTHOR.image,
    description: AUTHOR.description,
    sameAs: AUTHOR.sameAs,
    worksFor: {
      "@type": "Organization",
      name: "Quantinoid LLC",
      url: SITE_URL,
    },
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Professional Certification",
        name: "CIMA",
        description:
          "Chartered Global Management Accountant, Chartered Institute of Management Accountants",
        recognizedBy: {
          "@type": "Organization",
          name: "Chartered Institute of Management Accountants",
          url: "https://www.cimaglobal.com/",
        },
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Professional Certification",
        name: "AICPA",
        description:
          "Member of the American Institute of Certified Public Accountants",
        recognizedBy: {
          "@type": "Organization",
          name: "American Institute of Certified Public Accountants",
          url: "https://www.aicpa-cima.com/",
        },
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "degree",
        educationalLevel: "Master's degree",
        name: "Master's in Accounting",
      },
    ],
    knowsAbout: [
      "SAP S/4HANA",
      "SAP ECC",
      "SAP Fiori",
      "SAP Business Technology Platform",
      "SAP Cloud Platform Integration",
      "SAP Activate",
      "RISE with SAP",
      "GROW with SAP",
      "SAP FI/CO",
      "SAP MM",
      "SAP SD",
      "SAP PP",
      "SAP HCM",
      "SAP Joule",
      "Oracle E-Business Suite",
      "Oracle Fusion Cloud",
      "Microsoft Dynamics 365",
      "ERP Implementation",
      "ERP Migration",
      "ERP Strategy",
      "Programme Recovery",
      "Data Migration",
      "Data Governance",
      "AI Governance",
      "Agentic AI",
      "Generative AI",
      "Finance Transformation",
      "Month-End Close",
      "Vendor Selection",
      "Business Case Development",
    ],
  };
}

/**
 * Article-class JSON-LD. Returns `BlogPosting` for all posts, OR `TechArticle`
 * for posts in `platforms-modules` (most technical category). Both inherit
 * from Article so all article rich-result eligibility carries through.
 */
export function articleJsonLd(post: PostRecord) {
  const fm = post.frontmatter;
  const url = `${SITE_URL}${localePath(post.locale, fm.slug)}`;
  const heroAbsolute = fm.hero
    ? fm.hero.startsWith("http")
      ? fm.hero
      : `${SITE_URL}${fm.hero}`
    : undefined;
  const cat = CATEGORIES[fm.category as keyof typeof CATEGORIES];

  const isTechArticle = fm.category === "platforms-modules";
  const articleType = isTechArticle ? "TechArticle" : "BlogPosting";

  const mentionsList =
    fm.mentions && fm.mentions.length > 0
      ? fm.mentions.map((m) => ({ name: m }))
      : defaultMentionsForCategory(fm.category);

  const aboutList = fm.primaryKeyword
    ? [{ "@type": "Thing", name: fm.primaryKeyword }]
    : cat
      ? [{ "@type": "Thing", name: cat.label }]
      : undefined;

  // author + publisher reference the canonical Person `@id` declared in the
  // root layout. Inlining the full Person on every article duplicates ~2KB
  // per page (credentials + 29-entity knowsAbout + worksFor). The `@id`
  // reference is the canonical pattern Google's parser resolves to one
  // entity in the graph.
  const personRef = { "@id": `${SITE_URL}/#noel-dcosta` };

  return {
    "@context": "https://schema.org",
    "@type": articleType,
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
    author: personRef,
    publisher: personRef,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: {
      "@type": "Blog",
      "@id": `${SITE_URL}/#blog`,
      name: `${SITE_NAME} — ERP & AI`,
      url: SITE_URL,
    },
    articleSection: cat?.label,
    wordCount: countWords(post.body),
    inLanguage: post.locale,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "header p"],
    },
    mentions: mentionsToSchema(mentionsList),
    about: aboutList,
    keywords: fm.tags?.join(", "),
  };
}

/**
 * Top-level Person JSON-LD. Emitted sitewide so the entity graph is present
 * even on tool pages and category indexes.
 */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    ...authorPerson(),
  };
}

/**
 * WebSite schema — sitewide. Establishes brand entity in Google's graph.
 * No SearchAction because there's no /search endpoint.
 */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#noel-dcosta` },
    inLanguage: "en",
  };
}

/**
 * Blog corpus schema — for the site's blog index. Lets Google treat all
 * posts as one blog rather than disconnected articles.
 */
export function blogJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/#blog`,
    name: `${SITE_NAME} — ERP & AI`,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#noel-dcosta` },
    inLanguage: "en",
  };
}

/** AboutPage with mainEntity = the Person. Quality raters check About pages. */
export function aboutPageJsonLd(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url,
    name: `About ${AUTHOR.name}`,
    description: AUTHOR.description,
    mainEntity: { "@id": `${SITE_URL}/#noel-dcosta` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "en",
  };
}

/** ContactPage schema. */
export function contactPageJsonLd(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url,
    name: `Contact ${AUTHOR.name}`,
    description: `Get in touch with ${AUTHOR.name} for ERP advisory engagements.`,
    mainEntity: { "@id": `${SITE_URL}/#noel-dcosta` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "en",
  };
}

/** CollectionPage for category indexes — lists posts in `hasPart`. */
export function collectionPageJsonLd(args: {
  url: string;
  name: string;
  description: string;
  posts: { slug: string; title: string; locale: Locale }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    url: args.url,
    name: args.name,
    description: args.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#noel-dcosta` },
    inLanguage: "en",
    hasPart: args.posts.slice(0, 50).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}${localePath(p.locale, p.slug)}`,
    })),
  };
}

/**
 * VideoObject schema — for embedded YouTube/Vimeo content.
 * Not currently used (no video embeds in posts) but ready when assets exist.
 */
export function videoObjectJsonLd(args: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  embedUrl?: string;
  contentUrl?: string;
  duration?: string; // ISO 8601 duration, e.g. "PT5M30S"
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: args.name,
    description: args.description,
    thumbnailUrl: args.thumbnailUrl,
    uploadDate: toIso(args.uploadDate),
    embedUrl: args.embedUrl,
    contentUrl: args.contentUrl,
    duration: args.duration,
    publisher: { "@id": `${SITE_URL}/#noel-dcosta` },
  };
}

/**
 * ProfessionalService — for service offering pages when they exist.
 * Reserved for future use per PRD task S-10.
 */
export function professionalServiceJsonLd(args: {
  url: string;
  name: string;
  description: string;
  serviceType?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    url: args.url,
    name: args.name,
    description: args.description,
    serviceType: args.serviceType,
    provider: { "@id": `${SITE_URL}/#noel-dcosta` },
    areaServed: ["GCC", "United Kingdom", "Europe", "South Asia"],
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
