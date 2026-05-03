import type { MetadataRoute } from "next";
import {
  CATEGORIES,
  getAllPostSlugs,
  getAllPageSlugs,
  getAvailableLocales,
  getPost,
  getPage,
  LOCALES,
  type Locale,
} from "@/lib/content";
import { SITE_URL, toIso } from "@/lib/seo";

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

const RESERVED_SLUGS = new Set<string>([
  "about",
  "contact",
  "privacy",
  "category",
  "erp-implementation-cost-calculator",
  "sap-implementation-cost-calculator",
  "free-data-migration-estimator-sap-oracle-microsoft",
  "sap-job-description-generator",
  "sap-solution-builder",
]);

function urlFor(locale: Locale, path: string) {
  if (path.startsWith("/")) path = path.slice(1);
  return locale === "en" ? `${SITE_URL}/${path}` : `${SITE_URL}/${locale}/${path}`;
}

function alternates(kind: "posts" | "pages", slug: string) {
  const locales = getAvailableLocales(kind, slug);
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = urlFor(l, slug);
  if (locales.includes("en")) languages["x-default"] = urlFor("en", slug);
  return { languages };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const items: MetadataRoute.Sitemap = [];

  // Homepage per locale
  for (const l of LOCALES) {
    items.push({
      url: l === "en" ? SITE_URL : `${SITE_URL}/${l}`,
      changeFrequency: "weekly",
      priority: 1,
    });
  }

  // Category indexes per locale
  for (const c of Object.keys(CATEGORIES)) {
    for (const l of LOCALES) {
      items.push({
        url: urlFor(l, `category/${c}`),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  // Posts — only emit URLs for locales that actually have content
  for (const slug of getAllPostSlugs()) {
    if (slug === "https-noeldcosta-com-sap-implementation-expert") continue;
    const available = getAvailableLocales("posts", slug);
    for (const l of available) {
      const post = getPost(slug, l);
      if (!post) continue;
      if (post.frontmatter.noindex) continue;
      items.push({
        url: urlFor(l, slug),
        lastModified: lastModDate(
          post.frontmatter.lastReviewed ||
            post.frontmatter.updated ||
            post.frontmatter.date,
        ),
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: alternates("posts", slug),
      });
    }
  }

  // Pages — skip reserved + junk slugs
  for (const slug of getAllPageSlugs()) {
    if (RESERVED_SLUGS.has(slug)) continue;
    if (slug === "https-noeldcosta-com-sap-implementation-expert") continue;
    const available = getAvailableLocales("pages", slug);
    for (const l of available) {
      const page = getPage(slug, l);
      if (!page) continue;
      if (page.frontmatter.noindex) continue;
      items.push({
        url: urlFor(l, slug),
        lastModified: lastModDate(
          page.frontmatter.updated || page.frontmatter.date,
        ),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: alternates("pages", slug),
      });
    }
  }

  return items;
}
