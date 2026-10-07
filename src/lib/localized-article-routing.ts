import localeContentManifest from "../data/locale-content-manifest.json";
import { getPost, type PostRecord } from "./content";
import {
  PUBLIC_LOCALE_PREFIXES,
  PUBLISHED_TRANSLATED_LOCALES,
  contentLocaleFromPublicPrefix,
  publicPrefixFromContentLocale,
  type PublicLocalePrefix,
} from "./locale-url";
import {
  isTranslatableManifestItem,
  type LocaleContentManifestItem,
} from "./locale-publication";
import { RTL_LOCALES, type Locale } from "./locales";

export interface LocalizedPostRecord extends PostRecord {
  localizedCategoryLabel?: string;
}

interface LocalizedDocumentAttributes {
  contentLocale: Exclude<Locale, "en">;
  lang: PublicLocalePrefix;
  dir: "ltr" | "rtl";
}

interface LocalizedArticleParam {
  locale: PublicLocalePrefix;
  slug: string;
}

const MIGRATED_ARTICLE_CHROME =
  /^\s*(?:### ([^\r\n]+)\r?\n+)?\s*# [^\r\n]+\r?\n+\s*### [^\r\n]+\r?\n+\s*\*[^\r\n]+\r?\n+/;

function isTextMdxBody(body: string): boolean {
  return (
    body.trim().length > 0 &&
    !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(body)
  );
}

// Locales written in a non-Latin script. Some migrated files are the English
// text under translated metadata; a translation must actually use its script
// (at least 5% of the letters), or the English would be served as a
// translation.
const LOCALE_SCRIPT: Partial<Record<Locale, RegExp>> = {
  ar: /\p{Script=Arabic}/u,
  el: /\p{Script=Greek}/u,
  hi: /\p{Script=Devanagari}/u,
  ja: /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u,
  ko: /\p{Script=Hangul}/u,
  ru: /\p{Script=Cyrillic}/u,
  zh: /\p{Script=Han}/u,
  "zh-TW": /\p{Script=Han}/u,
};

export function hasExpectedLocaleScript(body: string, locale: Locale): boolean {
  const script = LOCALE_SCRIPT[locale];
  if (!script) return true;

  const letters = [...body].filter((character) => /\p{L}/u.test(character));
  if (letters.length === 0) return false;
  const inScript = letters.filter((character) => script.test(character));

  return inScript.length / letters.length >= 0.05;
}

function removeMigratedArticleChrome(
  post: PostRecord,
): LocalizedPostRecord {
  const chrome = post.body.match(MIGRATED_ARTICLE_CHROME);
  const bodyWithoutChrome = chrome
    ? post.body.slice(chrome[0].length)
    : post.body;

  return {
    ...post,
    body: bodyWithoutChrome.replace(/^#\s+/gm, "## "),
    ...(chrome?.[1] ? { localizedCategoryLabel: chrome[1].trim() } : {}),
  };
}

export function getLocalizedLocaleParams(): { locale: PublicLocalePrefix }[] {
  return PUBLIC_LOCALE_PREFIXES.map((locale) => ({ locale }));
}

export function getLocalizedDocumentAttributes(
  publicLocale: string,
): LocalizedDocumentAttributes | null {
  const contentLocale = contentLocaleFromPublicPrefix(publicLocale);
  if (!contentLocale || contentLocale === "en") return null;

  return {
    contentLocale,
    lang: publicPrefixFromContentLocale(contentLocale) as PublicLocalePrefix,
    dir: RTL_LOCALES.includes(contentLocale) ? "rtl" : "ltr",
  };
}

export function getLocalizedArticle(
  publicLocale: string,
  slug: string,
): LocalizedPostRecord | null {
  const documentAttributes = getLocalizedDocumentAttributes(publicLocale);
  if (!documentAttributes) return null;

  const post = getPost(slug, documentAttributes.contentLocale);
  if (
    !post ||
    post.isFallback ||
    post.locale !== documentAttributes.contentLocale ||
    !isTextMdxBody(post.body) ||
    !hasExpectedLocaleScript(post.body, post.locale)
  ) {
    return null;
  }

  return removeMigratedArticleChrome(post);
}

export function getLocalizedArticleParams(
  manifestItems: readonly LocaleContentManifestItem[] =
    localeContentManifest.items,
): LocalizedArticleParam[] {
  const params: LocalizedArticleParam[] = [];

  for (const locale of PUBLISHED_TRANSLATED_LOCALES) {
    const contentLocale = contentLocaleFromPublicPrefix(locale);
    for (const item of manifestItems) {
      if (
        item.kind !== "post" ||
        !isTranslatableManifestItem(item) ||
        !contentLocale ||
        !item.available_locales.includes(contentLocale)
      ) {
        continue;
      }

      const slug = item.slug.trim();
      if (!slug) continue;
      if (getLocalizedArticle(locale, slug)) params.push({ locale, slug });
    }
  }

  return params;
}
