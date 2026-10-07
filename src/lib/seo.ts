import type { Metadata } from "next";
import type { Locale, PostRecord, PageRecord } from "./content";
import { LOCALES, CATEGORIES } from "./content";
import { PUBLISHED_TRANSLATED_LOCALES, buildLocalizedPath } from "./locale-url";
import {
  buildLanguageAlternates,
  hreflangCode,
  resolveCanonicalUrl,
  SEO_SITE_URL,
} from "./seo-graph";

export const SITE_URL = SEO_SITE_URL;
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

// Public article/page path with the repository's required trailing slash.
// English remains unprefixed; translated content uses the approved public
// locale prefix contract (`zh` content maps to public `zh-CN`).
function flatPath(locale: Locale, slug: string): string {
  return buildLocalizedPath(locale, slug);
}

/** Branded fallback for pages without their own hero image (public/og-image.png). */
export const DEFAULT_OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Noel D'Costa: enterprise applications, data and AI",
};

function openGraphLocale(locale: Locale): string {
  const locales = {
    en: "en",
    ar: "ar_AE",
    de: "de_DE",
    es: "es_ES",
    fr: "fr_FR",
    hi: "hi_IN",
    it: "it_IT",
    ja: "ja_JP",
    ko: "ko_KR",
    nl: "nl_NL",
    pt: "pt_PT",
    ru: "ru_RU",
    tr: "tr_TR",
    zh: "zh_CN",
    el: "el_GR",
    hr: "hr_HR",
    "zh-TW": "zh_TW",
  } as const satisfies Record<Locale, string>;

  return locales[locale];
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

export function countWords(body: string): number {
  return body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`~\[\]\(\)!\\-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * Extract question/answer pairs from inline `<details>/<summary>` blocks. Used
 * by both blog posts and tool pages to emit FAQPage JSON-LD when the MDX body
 * contains FAQ content. Inner HTML is stripped so schema.org receives plain
 * text answers; answers are capped at 600 chars to stay under Google's
 * structured-data limits.
 */
export function extractFaqItems(body: string): { question: string; answer: string }[] {
  const items: { question: string; answer: string }[] = [];
  const re = /<details[^>]*>[\s\S]*?<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const q = m[1].trim().replace(/<[^>]+>/g, "").trim();
    const a = m[2].trim().replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (q) items.push({ question: q, answer: a.slice(0, 600) });
  }
  return items;
}

/**
 * Meta description that fits the search result snippet (about 160 characters).
 * Translations often run 20 to 40% longer than English: cut at the last full
 * sentence that fits, otherwise at the last word boundary with an ellipsis.
 */
export function clampDescription(text: string | undefined, max = 160): string | undefined {
  if (!text) return text;
  const clean = text.replace(/\s+/g, " ").trim();
  if ([...clean].length <= max) return clean;
  const chars = [...clean];
  const head = chars.slice(0, max).join("");
  const sentence = head.match(/^[\s\S]*[.!?。！？।](?=\s|$)/u)?.[0];
  if (sentence && [...sentence].length >= max * 0.6) return sentence.trim();
  const cut = chars.slice(0, max - 1).join("");
  const space = cut.lastIndexOf(" ");
  const base = space > max * 0.6 ? cut.slice(0, space) : cut;
  return `${base.replace(/[\s,;:.]+$/u, "")}…`;
}

// Brand tails the translated WordPress titles carry ("- Noel DCosta",
// "- 노엘 디코스타", "— Ноэль ДКоста"), sometimes twice and with zero-width spaces.
const BRAND_TAIL =
  /\s*[-\u{2013}\u{2014}|]\s*[\u{200b}\s]*(?:noel\s*d['\u{2019}]?\s*costa(?:\.com)?|noeldcosta(?:\.com)?|नोएल\s*डी'?कोस्टा|노엘\s*디코스타|Ноэль\s*Д'?Коста|ノエル・ディコスタ|نويل\s*دي\s*كوستا|نويل\s*ديكوستا)[\u{200b}\s]*$/iu;

/**
 * Translated title without its trailing brand, so documentTitle adds the one
 * brand suffix when it fits. English titles are not passed through this.
 */
export function stripBrandSuffix(title: string): string {
  let out = title.trim();
  for (let next = out.replace(BRAND_TAIL, ""); next !== out && next; next = out.replace(BRAND_TAIL, "")) out = next;
  return out;
}

/**
 * Document title for content pages. The " | Noel D'Costa" suffix is added only
 * when the whole title still fits in about 65 characters, so search results
 * show the real title instead of a truncated brand.
 */
export function documentTitle(title: string): { absolute: string } {
  const brand = " | Noel D'Costa";
  const clean = title.trim();
  if (/noel d.?costa/i.test(clean)) return { absolute: clean };
  return { absolute: clean.length + brand.length <= 65 ? `${clean}${brand}` : clean };
}

// ─── Page Metadata builders (for Next.js `generateMetadata`) ─────────────

export function buildPostMetadata(post: PostRecord): Metadata {
  const fm = post.frontmatter;
  const translated = post.locale !== "en";
  // Translated titles and descriptions keep their words; only the brand tail
  // and the length past the snippet limit go. English is unchanged.
  const title = translated ? stripBrandSuffix(fm.metaTitle || fm.title) : fm.metaTitle || fm.title;
  const rawDescription =
    fm.metaDescription || fm.excerpt || `${fm.title}, by Noel D'Costa.`;
  const description = translated ? clampDescription(rawDescription) ?? rawDescription : rawDescription;
  const canonical = resolveCanonicalUrl({
    kind: "post",
    slug: fm.slug,
    locale: post.locale,
    frontmatter: fm,
  });
  const languages = buildLanguageAlternates("post", post);

  return {
    title: documentTitle(title),
    description,
    alternates: { canonical, ...(languages ? { languages } : {}) },
    // Only override the layout's default robots config when the post is
    // explicitly noindex; otherwise let the parent indexing directives flow
    // through (omitting the field — passing `undefined` would shadow it).
    ...(fm.noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "article",
      locale: openGraphLocale(post.locale),
      publishedTime: toIso(fm.date),
      modifiedTime: toIso(fm.updated),
      authors: [AUTHOR.name],
      images: fm.hero
        ? [{ url: fm.hero, alt: fm.heroAlt || fm.title }]
        : [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: fm.hero ? [fm.hero] : [DEFAULT_OG_IMAGE.url],
    },
  };
}

export function buildPageMetadata(
  page: PageRecord,
  publicPath?: string,
): Metadata {
  const fm = page.frontmatter;
  const translated = page.locale !== "en";
  const title = translated ? stripBrandSuffix(fm.metaTitle || fm.title) : fm.metaTitle || fm.title;
  const rawDescription =
    fm.metaDescription || fm.excerpt || `${fm.title}. Noel D'Costa.`;
  const description = translated ? clampDescription(rawDescription) ?? rawDescription : rawDescription;
  const canonical = resolveCanonicalUrl({
    kind: "page",
    slug: fm.slug,
    locale: page.locale,
    frontmatter: fm,
    publicPath,
  });
  const languages = buildLanguageAlternates("page", page);

  return {
    title: documentTitle(title),
    description,
    alternates: { canonical, ...(languages ? { languages } : {}) },
    // Only override the layout's default robots config when the post is
    // explicitly noindex; otherwise let the parent indexing directives flow
    // through (omitting the field — passing `undefined` would shadow it).
    ...(fm.noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      locale: openGraphLocale(page.locale),
      images: fm.hero ? [{ url: fm.hero }] : [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: fm.hero ? [fm.hero] : [DEFAULT_OG_IMAGE.url],
    },
  };
}

interface ArchiveMetadataInput {
  title: string;
  description: string;
  canonical: string;
  /** hreflang alternates, only for surfaces that are language-graph members. */
  languages?: Record<string, string>;
}

interface StaticPageMetadataInput extends ArchiveMetadataInput {
  robots?: Metadata["robots"];
}

/** Metadata for an English static surface with complete route-level socials. */
export function buildStaticPageMetadata({
  title,
  description,
  canonical,
  languages,
  robots,
}: StaticPageMetadataInput): Metadata {
  description = clampDescription(description) ?? description;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical, ...(languages ? { languages } : {}) },
    ...(robots ? { robots } : {}),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      locale: "en",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

/**
 * Metadata for non-content archive surfaces. Archives retain their existing
 * canonical but never participate in the reciprocal content language graph.
 */
export function buildArchiveMetadata({
  title,
  description,
  canonical,
  languages,
}: ArchiveMetadataInput): Metadata {
  // Archive callers already supply the approved branded title. The shared
  // static-page boundary marks it absolute so the root title template cannot
  // add the brand a second time.
  return buildStaticPageMetadata({ title, description, canonical, languages });
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
    case "sap-modules":
    case "erp-consulting-guide":
    case "sap-case-studies":
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
 * for posts in `sap-modules` (most technical category). Both inherit
 * from Article so all article rich-result eligibility carries through.
 */
export function articleJsonLd(post: PostRecord) {
  const fm = post.frontmatter;
  const url = resolveCanonicalUrl({
    kind: "post",
    slug: fm.slug,
    locale: post.locale,
    frontmatter: fm,
  });
  const heroAbsolute = fm.hero
    ? fm.hero.startsWith("http")
      ? fm.hero
      : `${SITE_URL}${fm.hero}`
    : undefined;
  const cat = CATEGORIES[fm.category as keyof typeof CATEGORIES];

  const isTechArticle = fm.category === "sap-modules";
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
      name: `${SITE_NAME} | ERP & AI`,
      url: SITE_URL,
    },
    articleSection: cat?.label,
    wordCount: countWords(post.body),
    inLanguage: hreflangCode(post.locale),
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
    // English plus every language the site publishes translated pages in.
    inLanguage: ["en", ...PUBLISHED_TRANSLATED_LOCALES],
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
    name: `${SITE_NAME} | ERP & AI`,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#noel-dcosta` },
    inLanguage: "en",
  };
}

/**
 * WebPage JSON-LD for MDX content pages. Mirrors Yoast's per-page WebPage
 * emission so the entity graph on hub pages like /sap-implementation/ stays
 * in parity with the WordPress origin. References the sitewide WebSite and
 * Person nodes via `@id` rather than duplicating them.
 */
export function pageWebPageJsonLd(page: PageRecord, publicPath?: string) {
  const fm = page.frontmatter;
  const url = resolveCanonicalUrl({
    kind: "page",
    slug: fm.slug,
    locale: page.locale,
    frontmatter: fm,
    publicPath,
  });
  const description =
    fm.metaDescription || fm.excerpt || `${fm.title}. Noel D'Costa.`;
  const heroAbsolute = fm.hero
    ? fm.hero.startsWith("http")
      ? fm.hero
      : `${SITE_URL}${fm.hero}`
    : undefined;
  const published = toIso(fm.date);
  const modified = toIso(fm.updated || fm.date);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: fm.title,
    description,
    inLanguage: hreflangCode(page.locale),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    author: { "@id": `${SITE_URL}/#noel-dcosta` },
    ...(heroAbsolute
      ? { primaryImageOfPage: { "@type": "ImageObject", url: heroAbsolute } }
      : {}),
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
  };
}

/**
 * Article JSON-LD for MDX content pages with substantive bodies. Reuses the
 * same author/publisher Person `@id` pattern as posts; gated on word count so
 * thin pages (FAQs, redirect shells) don't carry an Article claim they can't
 * defend.
 */
export function pageArticleJsonLd(page: PageRecord, publicPath?: string) {
  const fm = page.frontmatter;
  const url = resolveCanonicalUrl({
    kind: "page",
    slug: fm.slug,
    locale: page.locale,
    frontmatter: fm,
    publicPath,
  });
  const description =
    fm.metaDescription || fm.excerpt || `${fm.title}. Noel D'Costa.`;
  const heroAbsolute = fm.hero
    ? fm.hero.startsWith("http")
      ? fm.hero
      : `${SITE_URL}${fm.hero}`
    : undefined;
  const personRef = { "@id": `${SITE_URL}/#noel-dcosta` };
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: fm.title,
    description,
    ...(heroAbsolute
      ? { image: [{ "@type": "ImageObject", url: heroAbsolute, caption: fm.title }] }
      : {}),
    datePublished: toIso(fm.date),
    dateModified: toIso(fm.updated || fm.date),
    author: personRef,
    publisher: personRef,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${url}#webpage` },
    wordCount: countWords(page.body),
    inLanguage: hreflangCode(page.locale),
  };
}

/** Wraps an array of {question, answer} pairs into a FAQPage JSON-LD object. */
export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Threshold for emitting Article schema on MDX content pages. */
export const PAGE_ARTICLE_WORDCOUNT_THRESHOLD = 500;

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
export function contactPageJsonLd(
  url: string,
  locale: Locale = "en",
  name = `Contact ${AUTHOR.name}`,
  description = `Get in touch with ${AUTHOR.name} for ERP advisory engagements.`,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url,
    name,
    description,
    mainEntity: { "@id": `${SITE_URL}/#noel-dcosta` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: hreflangCode(locale),
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
      url: `${SITE_URL}${flatPath(p.locale, p.slug)}`,
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
