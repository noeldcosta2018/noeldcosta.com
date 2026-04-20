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
  "zh",
  "ko",
  "hi",
  "tr",
  "nl",
];

export const TIER_1_LOCALES: Locale[] = ["en", "ja", "es", "fr", "ru", "it", "pt"];
export const RTL_LOCALES: Locale[] = ["ar"];
