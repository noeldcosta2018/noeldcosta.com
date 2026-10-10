import type { MetadataRoute } from "next";
import {
  CATEGORIES,
  getAllPostSlugs,
  getAllPageSlugs,
  getAllTagSlugs,
  getPost,
  getPage,
} from "../lib/content";
import { SITE_URL, toIso } from "../lib/seo";
import { WORDPRESS_TAG_SLUGS, canonicalTag } from "../components/tagMeta";
import { resolveCanonicalUrl } from "../lib/seo-graph";
import { getLocalizedArticle, getLocalizedArticleParams } from "../lib/localized-article-routing";
import { getLocalizedPage, getLocalizedPageParams } from "../lib/localized-page-routing";
import { readyLocales } from "../i18n/ready";
import { localizedInterfacePaths } from "../lib/localized-interface-routes";
import { LEGACY_REDIRECT_SOURCES } from "../lib/legacy-redirects.mjs";

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

/** A /tag/<slug>/ path whose archive names another tag's as canonical. */
function deferringTag(englishPath: string): boolean {
  const m = englishPath.match(/^\/tag\/([^/]+)\/$/);
  return !!m && canonicalTag(m[1]) !== m[1];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const items: MetadataRoute.Sitemap = [];

  // Homepage remains English-only; published locale content follows below.
  items.push({
    url: `${SITE_URL}/`,
    changeFrequency: "weekly",
    priority: 1,
  });

  // /books — net-new short URL, no WordPress equivalent. Single entry.
  items.push({
    url: `${SITE_URL}/books/`,
    changeFrequency: "weekly",
    priority: 0.7,
  });

  // Translated homepages, archives (category, tag, author) and tools: only
  // locales whose interface dictionary is ready (same rule as the routes).
  for (const l of readyLocales()) {
    items.push({
      url: `${SITE_URL}/${l}/`,
      changeFrequency: "weekly",
      priority: 0.9,
    });
    for (const path of localizedInterfacePaths(l)) {
      if (deferringTag(path.slice(l.length + 1))) continue;
      items.push({
        url: `${SITE_URL}${path}`,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  }

  // /ai-academy/ — new page (2026 revamp), English only.
  items.push({
    url: `${SITE_URL}/ai-academy/`,
    changeFrequency: "monthly",
    priority: 0.7,
  });

  // /author/noeldcosta/ — live WordPress author archive, kept at the same path.
  items.push({
    url: `${SITE_URL}/author/noeldcosta/`,
    changeFrequency: "weekly",
    priority: 0.5,
  });

  // Category indexes.
  for (const c of Object.keys(CATEGORIES)) {
    items.push({
      url: `${SITE_URL}/category/${c}/`,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Tag archives — flat URLs to match the WordPress /tag/{slug}/ contract.
  const tagSet = new Set<string>(WORDPRESS_TAG_SLUGS);
  for (const t of getAllTagSlugs()) tagSet.add(t);
  for (const t of tagSet) {
    if (canonicalTag(t) !== t) continue;
    items.push({
      url: `${SITE_URL}/tag/${t}/`,
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
    items.push({
      url: `${SITE_URL}/${slug}/`,
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

  // Emit canonical pages only. Existing noncanonical aliases remain routable.
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

    items.push({
      url: resolveCanonicalUrl({ kind: "page", slug, locale: "en", frontmatter: page.frontmatter }),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
      images,
    });

  }

  // Publication-aware loaders reject held, missing, raw and fallback sources.
  for (const { locale, slug } of getLocalizedArticleParams()) {
    const post = getLocalizedArticle(locale, slug);
    if (!post || post.isFallback || post.frontmatter.noindex) continue;
    items.push({
      url: resolveCanonicalUrl({ kind: "post", slug, locale: post.locale, frontmatter: post.frontmatter }),
      lastModified: lastModDate(post.frontmatter.lastReviewed || post.frontmatter.updated || post.frontmatter.date),
      changeFrequency: "monthly",
      priority: 0.8,
      images: post.frontmatter.hero ? [absoluteImage(post.frontmatter.hero)] : undefined,
    });
  }
  for (const { locale, slug } of getLocalizedPageParams()) {
    const page = getLocalizedPage(locale, slug);
    if (!page || page.isFallback || page.frontmatter.noindex) continue;
    items.push({
      url: resolveCanonicalUrl({ kind: "page", slug: page.frontmatter.slug, locale: page.locale, frontmatter: page.frontmatter, publicPath: page.publicPath }),
      lastModified: lastModDate(page.frontmatter.updated || page.frontmatter.date),
      changeFrequency: "monthly",
      priority: 0.6,
      images: page.frontmatter.hero ? [absoluteImage(page.frontmatter.hero)] : undefined,
    });
  }

  // Old WordPress paths that now redirect (next.config.ts) never go in the
  // sitemap, in English or under a locale prefix.
  const redirected = (url: string) => {
    const path = url.replace(SITE_URL, "").replace(/^[/](?:[a-z]{2}|zh-CN|zh-TW)(?=[/])/, "");
    return LEGACY_REDIRECT_SOURCES.has(path);
  };

  const unique = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const item of items) {
    if (redirected(item.url)) continue;
    const previous = unique.get(item.url);
    if (previous && JSON.stringify(previous) !== JSON.stringify(item)) {
      throw new Error(`Conflicting sitemap entry: ${item.url}`);
    }
    if (!previous) unique.set(item.url, item);
  }
  return [...unique.values()];
}
