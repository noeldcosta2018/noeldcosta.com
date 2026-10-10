import type { Metadata } from "next";
import { CATEGORIES, getPost, type Category, type Locale } from "./content";
import {
  getLocalizedArticle,
  getLocalizedArticleParams,
  type LocalizedPostRecord,
} from "./localized-article-routing";
import { buildArchiveMetadata } from "./seo";
import {
  isPublishedTranslatedLocale,
  publicPrefixFromContentLocale,
  type PublishedTranslatedLocale,
} from "./locale-url";
import { readyLocales } from "@/i18n/ready";
import { WORDPRESS_TAG_SLUGS, tagSynonyms } from "@/components/tagMeta";

// Translated interface pages that are not MDX content: category and tag
// archives, the author archive and the free tools. Single source for the
// route params, link repair (localizeHref), hreflang alternates and the
// sitemap, so a translated interface URL is either in all of them or in none.
//
// A locale gets these pages only once its interface dictionary is ready
// (readyLocales()). Archives list only articles with a published translation
// in that locale; an archive with none is not generated.
//
// English paths are the keys; a translated page lives at /<locale><path>.

const SITE = "https://noeldcosta.com";

export const AUTHOR_PATH = "/author/noeldcosta/";

/** The free tools with a dedicated route. Path is the English canonical path. */
export const TOOL_ROUTES = [
  { slug: "sap-implementation-cost-calculator", path: "/sap-implementation-cost-calculator/" },
  { slug: "free-data-migration-estimator-sap-oracle-microsoft", path: "/free-data-migration-estimator-sap-oracle-microsoft/" },
  { slug: "sap-job-description-generator", path: "/sap-job-description-generator/" },
  { slug: "sap-solution-builder", path: "/sap-solution-builder/" },
  {
    slug: "erp-implementation-cost-calculator",
    path: "/ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/",
  },
] as const;

export type ToolSlug = (typeof TOOL_ROUTES)[number]["slug"];

/** English canonical path of a tool (the ERP calculator lives under /ai-insights-shiftgearx-noeldcosta/). */
export function toolPath(slug: string): string {
  return TOOL_ROUTES.find((t) => t.slug === slug)?.path ?? `/${slug}/`;
}

export const categoryPath = (category: string) => `/category/${category}/`;
export const tagPath = (tag: string) => `/tag/${tag}/`;

export type InterfaceRouteKind = "category" | "tag" | "author" | "tool";

export interface InterfaceRoute {
  kind: InterfaceRouteKind;
  /** Category slug, tag slug, tool slug or "noeldcosta". */
  key: string;
  /** English path (with trailing slash); the translation is /<locale><path>. */
  path: string;
}

function isReady(locale: string): locale is PublishedTranslatedLocale {
  return isPublishedTranslatedLocale(locale) && readyLocales().includes(locale);
}

// ─── Translated articles ──────────────────────────────────────────────────

let publishedSlugs: Map<string, string[]> | null = null;
const archiveCache = new Map<string, LocalizedPostRecord[]>();

/**
 * Articles with a published translation in this locale (the same set the
 * translated catch-all serves), newest first. Title, excerpt and body are the
 * translation; category, tags and date come from the English article so the
 * archives group and order articles exactly as the English ones do.
 */
export function localizedArchivePosts(locale: string): LocalizedPostRecord[] {
  if (!isPublishedTranslatedLocale(locale)) return [];
  const cached = archiveCache.get(locale);
  if (cached) return cached;

  if (!publishedSlugs) {
    publishedSlugs = new Map();
    for (const p of getLocalizedArticleParams()) {
      const list = publishedSlugs.get(p.locale) ?? [];
      list.push(p.slug);
      publishedSlugs.set(p.locale, list);
    }
  }

  const posts: LocalizedPostRecord[] = [];
  for (const slug of publishedSlugs.get(locale) ?? []) {
    const translated = getLocalizedArticle(locale, slug);
    const english = getPost(slug, "en");
    if (!translated || !english) continue;
    posts.push({
      ...translated,
      frontmatter: {
        ...translated.frontmatter,
        category: english.frontmatter.category,
        tags: english.frontmatter.tags,
        date: english.frontmatter.date,
        hero: translated.frontmatter.hero || english.frontmatter.hero,
      },
    });
  }
  posts.sort(
    (a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime(),
  );
  archiveCache.set(locale, posts);
  return posts;
}

export function localizedCategoryPosts(locale: string, category: string): LocalizedPostRecord[] {
  return localizedArchivePosts(locale).filter((p) => p.frontmatter.category === category);
}

export function localizedTagPosts(locale: string, tag: string): LocalizedPostRecord[] {
  const set = new Set(tagSynonyms(tag));
  return localizedArchivePosts(locale).filter((p) =>
    (p.frontmatter.tags ?? []).some((t) => set.has(t)),
  );
}

// ─── Routes ───────────────────────────────────────────────────────────────

const routeCache = new Map<string, InterfaceRoute[]>();

/** Every translated interface page generated for this locale (empty until it is ready). */
export function localizedInterfaceRoutes(locale: string): InterfaceRoute[] {
  if (!isReady(locale)) return [];
  const cached = routeCache.get(locale);
  if (cached) return cached;

  const routes: InterfaceRoute[] = [];
  for (const category of Object.keys(CATEGORIES) as Category[]) {
    if (localizedCategoryPosts(locale, category).length > 0) {
      routes.push({ kind: "category", key: category, path: categoryPath(category) });
    }
  }
  // Only the six WordPress topic archives are translated, not every tag.
  for (const tag of WORDPRESS_TAG_SLUGS) {
    if (localizedTagPosts(locale, tag).length > 0) {
      routes.push({ kind: "tag", key: tag, path: tagPath(tag) });
    }
  }
  if (localizedArchivePosts(locale).length > 0) {
    routes.push({ kind: "author", key: "noeldcosta", path: AUTHOR_PATH });
  }
  for (const tool of TOOL_ROUTES) {
    routes.push({ kind: "tool", key: tool.slug, path: tool.path });
  }

  routeCache.set(locale, routes);
  return routes;
}

/** Translated interface paths for one locale, e.g. /de/category/erp-strategy/. */
export function localizedInterfacePaths(locale: string): string[] {
  return localizedInterfaceRoutes(locale).map((r) => `/${locale}${r.path}`);
}

/** Translated interface paths for every ready locale. */
export function allLocalizedInterfacePaths(): string[] {
  return readyLocales().flatMap((l) => localizedInterfacePaths(l));
}

export function hasLocalizedInterfacePage(locale: string, englishPath: string): boolean {
  return localizedInterfaceRoutes(locale).some((r) => r.path === englishPath);
}

/** Ready locales that have a translation of this English interface page. */
export function interfaceRouteLocales(englishPath: string): PublishedTranslatedLocale[] {
  return readyLocales().filter((l) => hasLocalizedInterfacePage(l, englishPath));
}

/** Static params for a route of one kind: { locale, [param]: key }. */
export function localizedInterfaceParams<K extends string>(
  kind: InterfaceRouteKind,
  param?: K,
): ({ locale: string } & Partial<Record<K, string>>)[] {
  return readyLocales().flatMap((locale) =>
    localizedInterfaceRoutes(locale)
      .filter((r) => r.kind === kind)
      .map((r) => (param ? { locale, [param]: r.key } : { locale }) as { locale: string } & Partial<Record<K, string>>),
  );
}

/**
 * hreflang map for an interface page: English, every ready locale that has
 * it, and x-default (English). Undefined while no translation exists, so
 * English pages keep their metadata unchanged until a locale is ready.
 */
export function interfaceAlternates(englishPath: string): Record<string, string> | undefined {
  const locales = interfaceRouteLocales(englishPath);
  if (locales.length === 0) return undefined;
  const languages: Record<string, string> = { en: `${SITE}${englishPath}` };
  for (const l of locales) languages[l] = `${SITE}/${l}${englishPath}`;
  languages["x-default"] = `${SITE}${englishPath}`;
  return languages;
}

// ─── Metadata ─────────────────────────────────────────────────────────────

const OG_LOCALE: Record<PublishedTranslatedLocale, string> = {
  ar: "ar_AE",
  el: "el_GR",
  hr: "hr_HR",
  "zh-CN": "zh_CN",
  "zh-TW": "zh_TW",
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
};

/** Public URL of an interface page in a locale (English unprefixed). */
export function interfaceUrl(locale: Locale, englishPath: string): string {
  const prefix = publicPrefixFromContentLocale(locale);
  return prefix ? `${SITE}/${prefix}${englishPath}` : `${SITE}${englishPath}`;
}

/**
 * Metadata for an interface page in any locale: the caller's (translated)
 * title and description, canonical = its own URL, hreflang = English plus the
 * ready locales that have the page plus x-default. Same shape as
 * buildArchiveMetadata, which English pages already used.
 */
export function interfaceMetadata({
  locale,
  englishPath,
  canonicalPath = englishPath,
  title,
  description,
}: {
  locale: Locale;
  englishPath: string;
  /** English path of the page this one defers to, when it duplicates another
   *  (same locale). A deferring page carries no hreflang of its own. */
  canonicalPath?: string;
  /** Final document title (absolute, brand included where wanted). */
  title: string;
  description: string;
}): Metadata {
  const defers = canonicalPath !== englishPath;
  const base = buildArchiveMetadata({
    title,
    description,
    canonical: interfaceUrl(locale, canonicalPath),
    languages: defers ? undefined : interfaceAlternates(englishPath),
  });
  const prefix = publicPrefixFromContentLocale(locale);
  if (!prefix || !isPublishedTranslatedLocale(prefix)) return base;
  return { ...base, openGraph: { ...base.openGraph, locale: OG_LOCALE[prefix] } };
}
