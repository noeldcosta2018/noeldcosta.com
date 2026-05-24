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
 * in src/app/(site)/[...slug]/page.tsx so the sitemap stays in lockstep
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

export default function sitemap(): MetadataRoute.Sitemap {
  const items: MetadataRoute.Sitemap = [];

  // Homepage. Single flat URL with trailing slash — matches the WordPress
  // URL contract and the `trailingSlash: true` Next.js config. GTranslate
  // proxies translated variants externally; we do NOT emit /{locale}
  // entries from the origin (see CLAUDE.md, "DO NOT generate sitemap
  // entries with language prefixes").
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

  // Pages. Emit at the flat slug AND at the multi-segment WordPress URL
  // when `originalUrl` reveals one — the catch-all in
  // src/app/(site)/[...slug]/page.tsx serves both, and Google sees them as
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

    items.push({
      url: `${SITE_URL}/${slug}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
      images,
    });

    const segments = pathSegmentsFromOriginalUrl(
      page.frontmatter.originalUrl,
    );
    if (segments && segments.length > 1) {
      items.push({
        url: `${SITE_URL}/${segments.join("/")}/`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
        images,
      });
    }
  }

  return items;
}
