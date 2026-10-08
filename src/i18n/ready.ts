import {
  PUBLISHED_TRANSLATED_LOCALES,
  contentLocaleFromPublicPrefix,
  type PublishedTranslatedLocale,
} from "@/lib/locale-url";
import type { Locale } from "@/lib/locales";
import { hasTranslation } from "./index";

// A translated interface page (homepage, archives, tool shells, author page) is
// only published for a locale once its dictionary covers the interface. Until
// then the English page stays the only version, so English is never served as
// a "translation". The sentinel strings below are present in every table that
// was translated in full.
const SENTINELS = ["Discuss your project", "I help you build systems / and then make them smart.", "All articles", "Expertise"];

export function interfaceReady(locale: string): boolean {
  // Accepts a public prefix (zh-CN) or a content locale (zh).
  const content = contentLocaleFromPublicPrefix(locale) ?? (locale as Locale);
  return SENTINELS.every((s) => hasTranslation(content, s));
}

/** Published translated locales whose interface dictionary is ready. */
export function readyLocales(): PublishedTranslatedLocale[] {
  return PUBLISHED_TRANSLATED_LOCALES.filter((l) => interfaceReady(l));
}
