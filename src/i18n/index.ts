import type { Locale } from "@/lib/locales";
import ar from "./locales/ar.json";
import de from "./locales/de.json";
import el from "./locales/el.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import hi from "./locales/hi.json";
import hr from "./locales/hr.json";
import it from "./locales/it.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import nl from "./locales/nl.json";
import pt from "./locales/pt.json";
import ru from "./locales/ru.json";
import tr from "./locales/tr.json";
import zh from "./locales/zh.json";
import zhTW from "./locales/zh-TW.json";

// Interface text (menus, footer, homepage, academy, archives, tools, forms).
// Keys are the English strings themselves, so English needs no table and a
// missing translation falls back to English. Article and page bodies are not
// here: they are translated MDX under content/.
//
// Server only: client components receive already-translated strings as props.

type Table = Record<string, string>;

const TABLES: Partial<Record<Locale, Table>> = { ar, de, el, es, fr, hi, hr, it, ja, ko, nl, pt, ru, tr, zh, "zh-TW": zhTW };

// String collection for the translation step: with I18N_COLLECT=<file>, every
// English string that passes through t() during a build is appended (one JSON
// string per line) so the full interface vocabulary can be translated.
const COLLECT = process.env.I18N_COLLECT;
const seen = new Set<string>();
function collect(english: string) {
  if (!COLLECT || seen.has(english)) return;
  seen.add(english);
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("node:fs").appendFileSync(COLLECT, `${JSON.stringify(english)}\n`);
}

export function t(locale: Locale | undefined, english: string): string {
  collect(english);
  if (!locale || locale === "en") return english;
  return TABLES[locale]?.[english] || english;
}

/** Bound translator for one locale. */
export function translator(locale: Locale | undefined) {
  return (english: string) => t(locale, english);
}

/** True when this locale has a translation for the string (used to set lang="en" on fallbacks). */
export function hasTranslation(locale: Locale | undefined, english: string): boolean {
  if (!locale || locale === "en") return true;
  return Boolean(TABLES[locale]?.[english]);
}

/**
 * Count-dependent wording: `one` for a single item, otherwise `other`.
 * Languages with more plural forms (Russian: 2 статьи, 5 статей) add keys
 * "<other>|few" and "<other>|many" to their table; Intl.PluralRules picks one.
 */
export function plural(locale: Locale | undefined, n: number, one: string, other: string): string {
  collect(one);
  collect(other);
  if (!locale || locale === "en") return n === 1 ? one : other;
  const category = new Intl.PluralRules(locale).select(n);
  if (category === "one") return t(locale, one);
  return TABLES[locale]?.[`${other}|${category}`] || t(locale, other);
}
