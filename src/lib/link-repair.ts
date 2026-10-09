import { getLocalizedContentParams } from "./localized-page-routing";
import { readyLocales } from "@/i18n/ready";
import { allLocalizedInterfacePaths } from "./localized-interface-routes";
import { LEGACY_REDIRECTS } from "./legacy-redirects.mjs";

// Render-time repair of internal links in MDX bodies (all locales). Server only:
// it reads the list of published translated pages. Browser-safe markdown
// repairs (card links, heading levels) live in md-repair.ts.
// Source files stay untouched.
//
// Links:
// - noeldcosta.com absolute links become site-relative (they stay in the same tab).
// - Internal paths get the trailing slash the site uses (no 308 hop).
// - Old WordPress slugs that the live site redirects point straight at the target.
// - A translated link (/de/...) whose translated page does not exist falls back to
//   the English page instead of a 404.
// Headings: levels never skip (the page H1 is in the banner, so the body starts at H2).

const LEGACY: Record<string, string> = Object.fromEntries(
  LEGACY_REDIRECTS.map((r) => [`/${r.from}/`, `/${r.to}/`]),
);

const LOCALE_PREFIX = /^\/(de|es|fr|hi|it|ja|ko|nl|pt|ru|tr|ar|zh-CN|zh-TW|el|hr)(\/.*)$/;

let localized: Set<string> | null = null;
function localizedPaths(): Set<string> {
  if (!localized) {
    localized = new Set(getLocalizedContentParams().map((p) => `/${p.locale}/${p.slug.join("/")}/`));
    // Translated interface pages (homepage) exist once the locale's dictionary is ready.
    for (const l of readyLocales()) localized.add(`/${l}/`);
    // Translated archives (category, tag, author) and tools, same readiness rule.
    for (const p of allLocalizedInterfacePaths()) localized.add(p);
  }
  return localized;
}

export function repairPath(raw: string): string {
  const m = raw.match(/^(?:https?:\/\/(?:www\.)?noeldcosta\.com)?(\/[^\s#?]*)?([?#][^\s]*)?$/i);
  if (!m) return raw;
  let path = m[1] || "/";
  const tail = m[2] ?? "";
  if (/\.[a-z0-9]{2,5}$/i.test(path)) return raw.replace(/^https?:\/\/(?:www\.)?noeldcosta\.com/i, "");
  if (!path.endsWith("/")) path += "/";

  const loc = path.match(LOCALE_PREFIX);
  if (loc) {
    const [, locale, rest] = loc;
    const english = LEGACY[rest] ?? rest;
    const candidate = `/${locale}${english}`;
    path = english === "/" || !localizedPaths().has(candidate) ? english : candidate;
  } else {
    path = LEGACY[path] ?? path;
  }
  return path + tail;
}

const MD_LINK = /\]\(((?:https?:\/\/(?:www\.)?noeldcosta\.com)?\/[^)\s]*)\)/gi;
const HTML_HREF = /href="((?:https?:\/\/(?:www\.)?noeldcosta\.com)?\/[^"\s]*)"/gi;

/**
 * prefix: the public locale prefix of a translated page (de, zh-CN ...). Its
 * internal links that carry no locale (including absolute noeldcosta.com links
 * kept from the English source) then point at the same-language page when
 * that page is published, and stay English otherwise.
 */
export function repairLinks(body: string, prefix?: string | null): string {
  const fix = (url: string) => {
    const path = repairPath(url);
    return prefix && path.startsWith("/") && !LOCALE_PREFIX.test(path) ? localizeHref(prefix, path) : path;
  };
  return body
    .replace(MD_LINK, (_m, url: string) => `](${fix(url)})`)
    .replace(HTML_HREF, (_m, url: string) => `href="${fix(url)}"`);
}


/**
 * Menu and template links on translated pages: the translated page when it is
 * published (e.g. /de/sap-fico/), otherwise the English page. External links,
 * anchors-only and English pages pass through unchanged.
 */
export function localizeHref(prefix: string | null | undefined, href: string): string {
  if (!prefix || !href.startsWith("/")) return href;
  const [pathPart, hash = ""] = href.split("#");
  const path = pathPart.endsWith("/") ? pathPart : `${pathPart}/`;
  const candidate = path === "/" ? `/${prefix}/` : `/${prefix}${path}`;
  return localizedPaths().has(candidate) ? `${candidate}${hash ? `#${hash}` : ""}` : href;
}

/** Register extra translated routes that are not MDX content (homepage, archives, tools). */
export function registerLocalizedPaths(paths: Iterable<string>): void {
  const set = localizedPaths();
  for (const p of paths) set.add(p);
}
