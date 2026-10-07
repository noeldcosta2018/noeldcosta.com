import { CONTENT_LOCALES, type Locale } from "./locales";

export { CONTENT_LOCALES };

export const PUBLIC_LOCALE_PREFIXES = [
  "ar",
  "de",
  "el",
  "es",
  "fr",
  "hi",
  "hr",
  "it",
  "ja",
  "ko",
  "nl",
  "pt",
  "ru",
  "tr",
  "zh-CN",
  "zh-TW",
] as const;

export type PublicLocalePrefix = (typeof PUBLIC_LOCALE_PREFIXES)[number];

/**
 * Public prefixes of the translated locales whose routes, sitemap entries and
 * hreflang alternates are published (all of them since Noel's decision of
 * 7 October 2026). These are URL prefixes: Simplified Chinese content lives
 * in zh.mdx and is published as zh-CN, so map with
 * contentLocaleFromPublicPrefix() before reading content or dictionaries.
 * This is the single source for that decision; do not copy the list.
 */
export const PUBLISHED_TRANSLATED_LOCALES = [
  "ar",
  "de",
  "el",
  "es",
  "fr",
  "hi",
  "hr",
  "it",
  "ja",
  "ko",
  "nl",
  "pt",
  "ru",
  "tr",
  "zh-CN",
  "zh-TW",
] as const satisfies readonly PublicLocalePrefix[];

export type PublishedTranslatedLocale =
  (typeof PUBLISHED_TRANSLATED_LOCALES)[number];

/** English plus every published translation (public codes), in hreflang order. */
export const PUBLISHED_LOCALES = [
  "en",
  ...PUBLISHED_TRANSLATED_LOCALES,
] as const;

export function isPublishedTranslatedLocale(
  value: string,
): value is PublishedTranslatedLocale {
  return (PUBLISHED_TRANSLATED_LOCALES as readonly string[]).includes(value);
}

const CONTENT_LOCALE_BY_PUBLIC_PREFIX = {
  ar: "ar",
  de: "de",
  el: "el",
  es: "es",
  fr: "fr",
  hi: "hi",
  hr: "hr",
  it: "it",
  ja: "ja",
  ko: "ko",
  nl: "nl",
  pt: "pt",
  ru: "ru",
  tr: "tr",
  "zh-CN": "zh",
  "zh-TW": "zh-TW",
} as const satisfies Record<PublicLocalePrefix, Locale>;

const PUBLIC_PREFIX_BY_CONTENT_LOCALE = {
  en: null,
  ar: "ar",
  de: "de",
  el: "el",
  es: "es",
  fr: "fr",
  hi: "hi",
  hr: "hr",
  it: "it",
  ja: "ja",
  ko: "ko",
  nl: "nl",
  pt: "pt",
  ru: "ru",
  tr: "tr",
  zh: "zh-CN",
  "zh-TW": "zh-TW",
} as const satisfies Record<Locale, PublicLocalePrefix | null>;

/** English plus the content locale of every published translation ("zh" for zh-CN). */
export const PUBLISHED_CONTENT_LOCALES: readonly Locale[] = [
  "en",
  ...PUBLISHED_TRANSLATED_LOCALES.map((prefix) => CONTENT_LOCALE_BY_PUBLIC_PREFIX[prefix]),
];

export function contentLocaleFromPublicPrefix(prefix: string | null): Locale | null {
  if (prefix === null) return "en";
  if (!Object.hasOwn(CONTENT_LOCALE_BY_PUBLIC_PREFIX, prefix)) return null;
  return CONTENT_LOCALE_BY_PUBLIC_PREFIX[prefix as PublicLocalePrefix];
}

export function publicPrefixFromContentLocale(locale: Locale): PublicLocalePrefix | null {
  return PUBLIC_PREFIX_BY_CONTENT_LOCALE[locale];
}

export function normalizePublicPath(path: string): string {
  const input = /^[a-z][a-z\d+.-]*:\/\//i.test(path)
    ? path
    : `/${path.replace(/^\/+/, "")}`;
  const parsed = new URL(input, "https://path.invalid");
  const pathname = parsed.pathname.replace(/\/{2,}/g, "/");
  const segments = pathname.split("/").filter(Boolean);
  return segments.length === 0 ? "/" : `/${segments.join("/")}/`;
}

export function publicPathFromOriginalUrl(
  originalUrl: string | undefined,
  fallbackSlug: string,
): string {
  if (originalUrl) {
    try {
      const parsed = new URL(originalUrl);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return normalizePublicPath(parsed.pathname);
      }
    } catch {
      // Invalid migration metadata falls back to the stable repository slug.
    }
  }

  return normalizePublicPath(fallbackSlug);
}

export function buildLocalizedPath(locale: Locale, publicPath: string): string {
  const normalizedPath = normalizePublicPath(publicPath);
  const prefix = publicPrefixFromContentLocale(locale);
  if (!prefix) return normalizedPath;
  if (normalizedPath === "/") return `/${prefix}/`;
  return `/${prefix}${normalizedPath}`;
}
