import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PostPage from "@/components/PostPage";
import MdxPageLayout from "@/components/MdxPageLayout";
import {
  getAllPostSlugs,
  getAllPageSlugs,
  getPost,
  getPage,
} from "@/lib/content";
import {
  TARGET_LANGUAGES,
  isTargetLanguage,
  type TargetLanguage,
} from "@/lib/locales";
import { buildPostMetadata, buildPageMetadata } from "@/lib/seo";

// Locale-scoped catch-all for translated MDX content. Mirrors
// (site)/[...slug]/page.tsx but parameterised by `lang`. Both routes share
// the same content getters (getPost / getPage) and the same renderer
// components (PostPage, MdxPageLayout) — the only difference is the locale
// passed in. The English route stays at /, this serves /ja/, /ar/, etc.
//
// Block 3 scope: routing only. canonical URLs in buildPostMetadata /
// buildPageMetadata still emit the English flat-URL canonical for now;
// Block 4 wires per-locale canonical + hreflang.

function pathSegmentsFromOriginalUrl(url: string | undefined): string[] | null {
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

export function generateStaticParams() {
  const postSlugs = getAllPostSlugs();
  const allPageSlugs = getAllPageSlugs();

  // Build the slug-path universe once (without lang). Dedupe via JSON.
  const pathSet = new Set<string>();

  for (const slug of postSlugs) {
    if (slug === "https-noeldcosta-com-sap-implementation-expert") continue;
    pathSet.add(JSON.stringify([slug]));
  }

  for (const slug of allPageSlugs) {
    if (slug === "https-noeldcosta-com-sap-implementation-expert") continue;
    // Flat slug. Unlike the English route, the [lang] catch-all does NOT
    // skip RESERVED_SLUGS — there are no dedicated /[lang]/about/ routes,
    // so the catch-all is the only thing that can serve /ja/about/.
    pathSet.add(JSON.stringify([slug]));
    // Nested WordPress URL (e.g. /sap-implementation/sap-modules/) when
    // originalUrl reveals one. The English locale is the source of truth
    // for the URL shape; translated versions live at the same shape under
    // the lang prefix.
    const page = getPage(slug, "en");
    const segments = pathSegmentsFromOriginalUrl(page?.frontmatter.originalUrl);
    if (segments && segments.length > 1) pathSet.add(JSON.stringify(segments));
  }

  // Cross-product TARGET_LANGUAGES × pathSet.
  const params: { lang: string; slug: string[] }[] = [];
  for (const lang of TARGET_LANGUAGES) {
    for (const pathJson of pathSet) {
      params.push({ lang, slug: JSON.parse(pathJson) as string[] });
    }
  }
  return params;
}

export const dynamicParams = false;

export async function generateMetadata(
  props: { params: Promise<{ lang: string; slug: string[] }> },
): Promise<Metadata> {
  const { lang, slug } = await props.params;
  if (!isTargetLanguage(lang)) return {};
  const lastSlug = slug[slug.length - 1];

  const post = getPost(lastSlug, lang as TargetLanguage);
  if (post) return buildPostMetadata(post);
  const page = getPage(lastSlug, lang as TargetLanguage);
  if (page) return buildPageMetadata(page);
  return {};
}

export default async function LocaleCatchAllRoute(
  props: { params: Promise<{ lang: string; slug: string[] }> },
) {
  const { lang, slug } = await props.params;
  if (!isTargetLanguage(lang)) notFound();
  const lastSlug = slug[slug.length - 1];

  const post = getPost(lastSlug, lang);
  if (post) return <PostPage slug={lastSlug} locale={lang} />;

  const page = getPage(lastSlug, lang);
  if (page) return <MdxPageLayout slug={lastSlug} locale={lang} />;

  notFound();
}
