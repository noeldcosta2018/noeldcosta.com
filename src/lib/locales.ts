// Standalone locale constants. Kept in a dedicated file so that importers
// (notably src/proxy.ts, which runs as middleware) do not transitively pull
// in src/lib/content.ts — which traces the entire /content/ tree via
// readdirSync and balloons the middleware bundle to ~264 MB on Vercel.

export type Locale =
  | "en"
  | "ja"
  | "es"
  | "fr"
  | "ru"
  | "it"
  | "pt"
  | "de"
  | "ar"
  | "el"
  | "zh"
  | "ko"
  | "hi"
  | "tr"
  | "nl";

export const LOCALES: Locale[] = [
  "en",
  "ja",
  "es",
  "fr",
  "ru",
  "it",
  "pt",
  "de",
  "ar",
  "el",
  "zh",
  "ko",
  "hi",
  "tr",
  "nl",
];

export const TIER_1_LOCALES: Locale[] = ["en", "ja", "es", "fr", "ru", "it", "pt"];
export const RTL_LOCALES: Locale[] = ["ar"];

// The 10 non-English locales that get a routed [lang] segment and translated
// MDX content. Mirrors the TARGET_LANGUAGES list in scripts/translate-content.mjs
// — the script writes ${slug}/${lang}.mdx for every entry here. The [lang]
// route's generateStaticParams enumerates exactly these codes; any other
// /xx/ path 404s.
export const TARGET_LANGUAGES = [
  "ar",
  "de",
  "el",
  "es",
  "fr",
  "it",
  "ja",
  "nl",
  "pt",
  "ru",
] as const satisfies readonly Locale[];

export type TargetLanguage = (typeof TARGET_LANGUAGES)[number];

export function isTargetLanguage(value: string): value is TargetLanguage {
  return (TARGET_LANGUAGES as readonly string[]).includes(value);
}

// Locales that get hreflang annotations on every page. English plus the 10
// routed TARGET_LANGUAGES — keep in sync with rewrites in next.config.ts.
export const HREFLANG_LOCALES: readonly Locale[] = [
  "en",
  ...TARGET_LANGUAGES,
];

// Native-language self-labels for any UI that lists locales by their own
// name. Each value is written in its own script so a Japanese reader sees
// "日本語" and an Arabic reader sees "العربية". Keep in sync with the
// `Locale` union above if locales are added.
export const LOCALE_NATIVE_NAMES: Record<Locale, string> = {
  en: "English",
  ja: "日本語",
  es: "Español",
  fr: "Français",
  ru: "Русский",
  it: "Italiano",
  pt: "Português",
  de: "Deutsch",
  ar: "العربية",
  el: "Ελληνικά",
  zh: "中文",
  ko: "한국어",
  hi: "हिन्दी",
  tr: "Türkçe",
  nl: "Nederlands",
};

// og:locale values per ISO 639-1 + ISO 3166-1 alpha-2 region. Choices:
//   - ar_AE: Noel works primarily in the GCC; the UAE locale is the most
//     representative Arabic market for this site's content.
//   - pt_BR: the bulk of Portuguese-language SAP demand is from Brazil,
//     so we signal Brazilian Portuguese over Portuguese-Portugal.
// Other locales pick the canonical region for their language.
export const OG_LOCALE_MAP: Record<Locale, string> = {
  en: "en_US",
  ja: "ja_JP",
  es: "es_ES",
  fr: "fr_FR",
  ru: "ru_RU",
  it: "it_IT",
  pt: "pt_BR",
  de: "de_DE",
  ar: "ar_AE",
  el: "el_GR",
  zh: "zh_CN",
  ko: "ko_KR",
  hi: "hi_IN",
  tr: "tr_TR",
  nl: "nl_NL",
};

/** URL path prefix for a locale: "" for "en", "/<locale>" for others. */
export function localePathPrefix(locale: Locale): string {
  return locale === "en" ? "" : `/${locale}`;
}

/**
 * Localize a URL path. `path` must be the English/canonical path that
 * starts and ends with `/` (e.g. "/sap-implementation/" or "/"). The
 * English locale returns the path unchanged; other locales get a `/<locale>`
 * prefix. So `localizedPath("ja", "/sap-implementation/sap-modules/")`
 * returns `/ja/sap-implementation/sap-modules/`.
 */
export function localizedPath(locale: Locale, path: string): string {
  if (locale === "en") return path;
  return `/${locale}${path}`;
}
