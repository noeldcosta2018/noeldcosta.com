import localeContentManifest from "../data/locale-content-manifest.json";
import {
  getPage,
  getPost,
  type Locale,
  type PageRecord,
  type PostRecord,
} from "./content";
import { getLocalizedArticle } from "./localized-article-routing";
import { getLocalizedPage } from "./localized-page-routing";
import {
  isTranslatableManifestItem,
  type LocaleContentManifestItem,
} from "./locale-publication";
import {
  PUBLISHED_CONTENT_LOCALES,
  buildLocalizedPath,
  normalizePublicPath,
  publicPrefixFromContentLocale,
} from "./locale-url";

export const SEO_SITE_URL = "https://noeldcosta.com";
const ABOUT_CANONICAL_URL =
  "https://noeldcosta.com/sap-erp-consultant-my-story-noel-dcosta/";

export const PUBLISHED_SEO_LOCALES = PUBLISHED_CONTENT_LOCALES;

type SeoContentKind = "post" | "page";
type SeoRecord = PostRecord | PageRecord;

interface CanonicalFrontmatter {
  canonical?: string;
  canonicalUrl?: string;
}

interface CanonicalPolicyInput {
  kind: SeoContentKind;
  slug: string;
  locale: Locale;
  frontmatter: CanonicalFrontmatter;
  publicPath?: string;
}

function getManifestItem(
  kind: SeoContentKind,
  slug: string,
): LocaleContentManifestItem | undefined {
  return localeContentManifest.items.find(
    (item) => item.kind === kind && item.slug === slug,
  );
}

// Same rule as localized route params and the sitemap (locale-publication).
function isEligibleGraphItem(
  kind: SeoContentKind,
  item: LocaleContentManifestItem,
): boolean {
  return item.kind === kind && isTranslatableManifestItem(item);
}

/** hreflang / inLanguage code: the public locale code (zh content is zh-CN). */
export function hreflangCode(locale: Locale): string {
  return publicPrefixFromContentLocale(locale) ?? "en";
}

function isEligibleRecord(record: SeoRecord | null, locale: Locale): boolean {
  return Boolean(
    record &&
      !record.isFallback &&
      record.locale === locale &&
      record.requestedLocale === locale &&
      record.frontmatter.noindex !== true,
  );
}

function loadPublishedRecord(
  kind: SeoContentKind,
  item: LocaleContentManifestItem,
  locale: Locale,
): SeoRecord | null {
  if (!item.available_locales.includes(locale)) return null;

  if (locale === "en") {
    return kind === "post"
      ? getPost(item.slug, locale)
      : getPage(item.slug, locale);
  }

  const prefix = publicPrefixFromContentLocale(locale);
  if (!prefix) return null;

  if (kind === "post") return getLocalizedArticle(prefix, item.slug);

  const pathSegments = normalizePublicPath(item.public_path)
    .split("/")
    .filter(Boolean);
  return getLocalizedPage(prefix, pathSegments);
}

function matchesPublishedRouteRecord(
  record: SeoRecord,
  publishedRecord: SeoRecord | null,
): boolean {
  return Boolean(
    publishedRecord &&
      isEligibleRecord(publishedRecord, record.locale) &&
      publishedRecord.frontmatter.slug === record.frontmatter.slug &&
      publishedRecord.body === record.body,
  );
}

function normalizeFirstPartyCanonical(value: string | undefined): string | null {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      url.hostname !== "noeldcosta.com" ||
      url.port ||
      url.username ||
      url.password
    ) {
      return null;
    }
    return `${SEO_SITE_URL}${normalizePublicPath(url.pathname)}`;
  } catch {
    return null;
  }
}

/**
 * Frontmatter normalization is intentionally narrow: `canonical` precedes
 * `canonicalUrl`, and only absolute HTTPS URLs on the production host survive.
 * Route resolution applies that same ordered candidate list, skipping any
 * earlier candidate that does not satisfy the applicable route policy.
 */
export function normalizeCanonicalFrontmatter(
  frontmatter: CanonicalFrontmatter,
): string | null {
  return normalizedCanonicalCandidates(frontmatter)[0] ?? null;
}

function normalizedCanonicalCandidates(
  frontmatter: CanonicalFrontmatter,
): string[] {
  return [frontmatter.canonical, frontmatter.canonicalUrl]
    .map(normalizeFirstPartyCanonical)
    .filter((candidate): candidate is string => candidate !== null);
}

// The manifest public path is the canonical URL shape for every item that
// has one, whether or not its translations are published. This keeps the
// protected nested WordPress URL canonical for the ERP calculator even
// though its flat tool route also serves.
function approvedPublicPath(
  kind: SeoContentKind,
  slug: string,
  publicPath?: string,
): string {
  const item = getManifestItem(kind, slug);
  if (item && item.public_path.trim().length > 0) {
    return normalizePublicPath(item.public_path);
  }
  return normalizePublicPath(publicPath || slug);
}

/**
 * Resolve the canonical through the approved route contract. Imported
 * frontmatter cannot move a graph member to another locale, host or alias.
 * `/about/` is the sole preserved exception: its deliberate first-party
 * canonical relationship predates the multilingual graph and is not a graph
 * member.
 */
export function resolveCanonicalUrl(input: CanonicalPolicyInput): string {
  const path = approvedPublicPath(input.kind, input.slug, input.publicPath);
  const approved = `${SEO_SITE_URL}${buildLocalizedPath(input.locale, path)}`;
  const normalizedCandidates = normalizedCanonicalCandidates(input.frontmatter);

  if (
    input.kind === "page" &&
    input.slug === "about"
  ) {
    return (
      normalizedCandidates.find(
        (candidate) => candidate === ABOUT_CANONICAL_URL,
      ) ?? approved
    );
  }

  return (
    normalizedCandidates.find((candidate) => candidate === approved) ?? approved
  );
}

/**
 * Build a reciprocal language family from publication policy, not merely from
 * files on disk. A source record only receives the graph when it is itself an
 * eligible, published, non-fallback, indexable canonical member.
 */
export function buildLanguageAlternates(
  kind: SeoContentKind,
  record: SeoRecord,
): Record<string, string> | undefined {
  if (
    !PUBLISHED_SEO_LOCALES.includes(record.locale) ||
    !isEligibleRecord(record, record.locale)
  ) {
    return undefined;
  }

  const item = getManifestItem(kind, record.frontmatter.slug);
  if (!item || !isEligibleGraphItem(kind, item)) return undefined;
  if (
    !matchesPublishedRouteRecord(
      record,
      loadPublishedRecord(kind, item, record.locale),
    )
  ) {
    return undefined;
  }

  const languages: Record<string, string> = {};
  const publicPath = normalizePublicPath(item.public_path);

  for (const locale of PUBLISHED_SEO_LOCALES) {
    const candidate = loadPublishedRecord(kind, item, locale);
    if (!isEligibleRecord(candidate, locale)) continue;
    languages[hreflangCode(locale)] =
      `${SEO_SITE_URL}${buildLocalizedPath(locale, publicPath)}`;
  }

  if (!languages.en || !languages[hreflangCode(record.locale)]) return undefined;
  languages["x-default"] = languages.en;
  return languages;
}
