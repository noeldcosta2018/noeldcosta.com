import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PostPage from "@/components/PostPage";
import MdxPageLayout from "@/components/MdxPageLayout";
import {
  getAllPostSlugs,
  getAllPageSlugs,
  getPost,
  getPage,
  LOCALES,
  type Locale,
} from "@/lib/content";
import { buildPostMetadata, buildPageMetadata } from "@/lib/seo";

// Keep in sync with /app/[slug]/page.tsx reserved slugs
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

export function generateStaticParams() {
  const postSlugs = getAllPostSlugs();
  const pageSlugs = getAllPageSlugs().filter((s) => !RESERVED_SLUGS.has(s));
  const slugs = [...postSlugs, ...pageSlugs].filter(
    (s) => s !== "https-noeldcosta-com-sap-implementation-expert"
  );
  const params: { lang: string; slug: string }[] = [];
  for (const lang of LOCALES) {
    for (const slug of slugs) params.push({ lang, slug });
  }
  return params;
}

export const dynamicParams = false;

export async function generateMetadata(
  props: { params: Promise<{ lang: string; slug: string }> }
): Promise<Metadata> {
  const { lang, slug } = await props.params;
  if (!LOCALES.includes(lang as Locale)) return {};
  const locale = lang as Locale;
  const post = getPost(slug, locale);
  if (post) return buildPostMetadata(post);
  const page = getPage(slug, locale);
  if (page) return buildPageMetadata(page);
  return {};
}

export default async function LocalizedRoute(
  props: { params: Promise<{ lang: string; slug: string }> }
) {
  const { lang, slug } = await props.params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const locale = lang as Locale;
  if (RESERVED_SLUGS.has(slug)) notFound();

  const post = getPost(slug, locale);
  if (post) return <PostPage slug={slug} locale={locale} />;

  const page = getPage(slug, locale);
  if (page) return <MdxPageLayout slug={slug} locale={locale} />;

  notFound();
}
