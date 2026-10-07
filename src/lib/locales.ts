// Standalone locale constants. Kept in a dedicated file so that importers
// (notably src/proxy.ts, which runs as middleware) do not transitively pull
// in src/lib/content.ts — which traces the entire /content/ tree via
// readdirSync and balloons the middleware bundle to ~264 MB on Vercel.

export const CONTENT_LOCALES = [
  "en",
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
  "zh",
  "zh-TW",
] as const;

export type Locale = (typeof CONTENT_LOCALES)[number];

export const LOCALES: readonly Locale[] = CONTENT_LOCALES;

export const TIER_1_LOCALES: Locale[] = ["en", "ja", "es", "fr", "ru", "it", "pt"];
export const RTL_LOCALES: Locale[] = ["ar"];
