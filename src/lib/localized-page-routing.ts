import localeContentManifest from "../data/locale-content-manifest.json";
import { getPage, type PageRecord } from "./content";
import { getLocalizedArticleParams, hasExpectedLocaleScript } from "./localized-article-routing";
import {
  PUBLISHED_TRANSLATED_LOCALES,
  contentLocaleFromPublicPrefix,
  isPublishedTranslatedLocale,
  normalizePublicPath,
  type PublicLocalePrefix,
} from "./locale-url";
import {
  isTranslatableManifestItem,
  type LocaleContentManifestItem,
} from "./locale-publication";

export type { LocaleContentManifestItem };

interface LocalizedPageParam {
  locale: PublicLocalePrefix;
  slug: string[];
}

export interface LocalizedPageRecord extends PageRecord {
  publicPath: string;
}

export function isEligibleManifestPage(item: LocaleContentManifestItem): boolean {
  return item.kind === "page" && isTranslatableManifestItem(item);
}

function pathSegments(publicPath: string): string[] {
  return normalizePublicPath(publicPath).split("/").filter(Boolean);
}

function isTextMdxBody(body: string): boolean {
  return (
    body.trim().length > 0 &&
    !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(body)
  );
}

export function getLocalizedPageParams(
  manifestItems: readonly LocaleContentManifestItem[] =
    localeContentManifest.items,
): LocalizedPageParam[] {
  const params: LocalizedPageParam[] = [];

  for (const locale of PUBLISHED_TRANSLATED_LOCALES) {
    const contentLocale = contentLocaleFromPublicPrefix(locale);
    for (const item of manifestItems) {
      if (
        !isEligibleManifestPage(item) ||
        !contentLocale ||
        !item.available_locales.includes(contentLocale)
      ) {
        continue;
      }

      // Route only variants the loader will actually serve, so params, the
      // sitemap and hreflang (which all use the loader) agree.
      const slug = pathSegments(item.public_path);
      if (slug.length > 0 && getLocalizedPage(locale, slug, manifestItems)) {
        params.push({ locale, slug });
      }
    }
  }

  return params;
}

export function getLocalizedPage(
  publicLocale: string,
  slug: readonly string[],
  manifestItems: readonly LocaleContentManifestItem[] =
    localeContentManifest.items,
): LocalizedPageRecord | null {
  if (!isPublishedTranslatedLocale(publicLocale) || slug.length === 0) {
    return null;
  }

  const contentLocale = contentLocaleFromPublicPrefix(publicLocale);
  if (!contentLocale) return null;

  const requestedPath = normalizePublicPath(slug.join("/"));
  const item = manifestItems.find(
    (candidate) =>
      isEligibleManifestPage(candidate) &&
      candidate.available_locales.includes(contentLocale) &&
      normalizePublicPath(candidate.public_path) === requestedPath,
  );
  if (!item) return null;

  const page = getPage(item.slug, contentLocale);
  if (
    !page ||
    page.isFallback ||
    page.locale !== contentLocale ||
    !isTextMdxBody(page.body) ||
    !hasExpectedLocaleScript(page.body, contentLocale)
  ) {
    return null;
  }

  return {
    ...page,
    body: page.body.replace(/^#\s+/gm, "## "),
    publicPath: requestedPath,
  };
}

export function getLocalizedContentParams(): LocalizedPageParam[] {
  return [
    ...getLocalizedArticleParams().map(({ locale, slug }) => ({
      locale,
      slug: [slug],
    })),
    ...getLocalizedPageParams(),
  ];
}
