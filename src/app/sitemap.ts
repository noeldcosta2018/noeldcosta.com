import type { MetadataRoute } from "next";
import {
  CATEGORIES,
  getAllPostSlugs,
  getAllPageSlugs,
  getAllTagSlugs,
  getPost,
  getPage,
} from "@/lib/content";
import { SITE_URL, toIso } from "@/lib/seo";
import { HREFLANG_LOCALES, localizedPath } from "@/lib/locales";
import { WORDPRESS_TAG_SLUGS } from "@/components/tagMeta";

/**
 * Coerce frontmatter date strings (often `"YYYY-MM-DD HH:mm:ss"` from
 * WordPress exports) into a `Date` so Next.js emits a valid `<lastmod>`.
 * Without this, sitemap entries lose `<lastmod>` and Google can't see when
 * each post was updated — which hurts crawl prioritisation.
 */
function lastModDate(input?: string): Date | undefined {
  const iso = toIso(input);
  return iso ? new Date(iso) : undefined;
}

/**
 * Resolve a hero path to an absolute URL for `<image:loc>` entries.
 * Frontmatter heroes are mostly site-relative (`/images/wp/foo.webp`); pass
 * through already-absolute URLs unchanged so external hosts (Pexels, etc.)
 * still emit a valid image entry.
 */
function absoluteImage(hero: string): string {
  return hero.startsWith("http") ? hero : `${SITE_URL}${hero}`;
}

// Short URLs that have a dedicated route but NO WordPress equivalent — the
// canonical for /about points at the WP /sap-erp-consultant-my-story-noel-dcosta/
// (set in MDX frontmatter), so emitting /about would duplicate canonical
// signal. /books has no WordPress page; /privacy and /contact short URLs are
// net-new and the WP equivalents (privacy-policy-noeldcosta, contact-noel-
// erp-support) come through the pages loop already.
const SHORT_URL_SLUGS = new Set<string>([
  "about",
  "contact",
  "privacy",
  "category",
]);

/**
 * Parse an `originalUrl` like
 * `https://noeldcosta.com/sap-implementation/sap-modules/` into
 * `["sap-implementation", "sap-modules"]`. Mirrors the static-params logic
 * in src/app/(site-en)/[...slug]/page.tsx so the sitemap stays in lockstep
 * with the routes the catch-all actually serves.
 */
function pathSegmentsFromOriginalUrl(
  url: string | undefined,
): string[] | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/^\/+|\/+$/g, "");
    if (!path) return null;
    return path.split("/");
  } catch {
    return null;
  }
}

/**
 * Reciprocal hreflang map for a given English path. Every entry in the
 * sitemap declares all 11 sibling URLs (en + 10 translated) plus x-default,
 * which is what Google's sitemap-based hreflang resolution requires —
 * partial maps get silently ignored.
 */
function languageAlternatesForPath(
  englishPath: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const loc of HREFLANG_LOCALES) {
    out[loc] = `${SITE_URL}${localizedPath(loc, englishPath)}`;
  }
  out["x-default"] = `${SITE_URL}${englishPath}`;
  return out;
}

/**
 * Emit one sitemap entry per supported locale for a given English path.
 * The English path is the canonical/source-of-truth shape (starts and
 * ends with `/`). Each entry carries the same lastModified, changeFreq,
 * priority, and image set, plus the reciprocal hreflang map so any one
 * URL is enough for Google to discover all translated variants.
 */
function emitWithLocales(
  items: MetadataRoute.Sitemap,
  entry: {
    englishPath: string;
    lastModified?: Date;
    changeFrequency?:
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never";
    priority?: number;
    images?: string[];
  },
) {
  const languages = languageAlternatesForPath(entry.englishPath);
  for (const loc of HREFLANG_LOCALES) {
    items.push({
      url: `${SITE_URL}${localizedPath(loc, entry.englishPath)}`,
      lastModified: entry.lastModified,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: { languages },
      images: entry.images,
    });
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const items: MetadataRoute.Sitemap = [];

  // Homepage. The English origin is /, with 10 translated variants at
  // /<lang>/. Each entry declares the full reciprocal hreflang map per
  // Google's sitemap-based hreflang spec.
  emitWithLocales(items, {
    englishPath: "/",
    changeFrequency: "weekly",
    priority: 1,
  });

  // /books — net-new short URL, no WordPress equivalent.
  emitWithLocales(items, {
    englishPath: "/books/",
    changeFrequency: "weekly",
    priority: 0.7,
  });

  // Category indexes.
  for (const c of Object.keys(CATEGORIES)) {
    emitWithLocales(items, {
      englishPath: `/category/${c}/`,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Tag archives — flat URLs to match the WordPress /tag/{slug}/ contract.
  const tagSet = new Set<string>(WORDPRESS_TAG_SLUGS);
  for (const t of getAllTagSlugs()) tagSet.add(t);
  for (const t of tagSet) {
    emitWithLocales(items, {
      englishPath: `/tag/${t}/`,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  // Posts. Image entry per post when a hero is present (Yoast parity —
  // Google's image sitemap helps Discover and Image Search picks rich
  // results that link back to the post).
  for (const slug of getAllPostSlugs()) {
    if (slug === "https-noeldcosta-com-sap-implementation-expert") continue;
    const post = getPost(slug, "en");
    if (!post) continue;
    if (post.frontmatter.noindex) continue;
    emitWithLocales(items, {
      englishPath: `/${slug}/`,
      lastModified: lastModDate(
        post.frontmatter.lastReviewed ||
          post.frontmatter.updated ||
          post.frontmatter.date,
      ),
      changeFrequency: "monthly",
      priority: 0.8,
      images: post.frontmatter.hero
        ? [absoluteImage(post.frontmatter.hero)]
        : undefined,
    });
  }

  // Pages. Emit at the flat slug AND at the multi-segment WordPress URL
  // when `originalUrl` reveals one — the catch-all in
  // src/app/(site-en)/[...slug]/page.tsx serves both, and Google sees them as
  // distinct URLs unless they're listed here.
  for (const slug of getAllPageSlugs()) {
    if (SHORT_URL_SLUGS.has(slug)) continue;
    if (slug === "https-noeldcosta-com-sap-implementation-expert") continue;
    const page = getPage(slug, "en");
    if (!page) continue;
    if (page.frontmatter.noindex) continue;

    const lastModified = lastModDate(
      page.frontmatter.updated || page.frontmatter.date,
    );
    const images = page.frontmatter.hero
      ? [absoluteImage(page.frontmatter.hero)]
      : undefined;

    emitWithLocales(items, {
      englishPath: `/${slug}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
      images,
    });

    const segments = pathSegmentsFromOriginalUrl(
      page.frontmatter.originalUrl,
    );
    if (segments && segments.length > 1) {
      emitWithLocales(items, {
        englishPath: `/${segments.join("/")}/`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
        images,
      });
    }
  }

  return items;
}
