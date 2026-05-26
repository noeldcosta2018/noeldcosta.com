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
