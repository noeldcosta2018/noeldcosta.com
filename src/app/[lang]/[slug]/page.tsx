import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PostPage from "@/components/PostPage";
import MdxPageLayout from "@/components/MdxPageLayout";
import CategoryPage from "@/components/CategoryPage";
import CaseStudyPortfolioPage from "@/components/case-studies/CaseStudyPortfolioPage";
import {
  CATEGORIES,
  getAllPostSlugs,
  getAllPageSlugs,
  getPost,
  getPage,
  LOCALES,
  type Category,
  type Locale,
} from "@/lib/content";
import {
  SITE_URL,
  buildPostMetadata,
  buildPageMetadata,
} from "@/lib/seo";

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

// Slugs that match a known category id (e.g. "case-studies"). Hitting
// /en/case-studies should render the same listing as
// /en/category/case-studies, not a separate MDX content page. Keeps
// both URLs alive (zero-redirect SEO contract from CLAUDE.md) while
// surfacing the same article grid.
const CATEGORY_SLUGS = new Set<string>(Object.keys(CATEGORIES));

function isCategorySlug(slug: string): slug is Category {
  return CATEGORY_SLUGS.has(slug);
}

export function generateStaticParams() {
  const postSlugs = getAllPostSlugs();
  const pageSlugs = getAllPageSlugs().filter((s) => !RESERVED_SLUGS.has(s));
  const slugs = [...postSlugs, ...pageSlugs, ...CATEGORY_SLUGS].filter(
    (s) => s !== "https-noeldcosta-com-sap-implementation-expert"
  );
  // Dedupe — a slug may exist as both an MDX page AND a category id
  // (e.g. "case-studies"); category render wins below.
  const uniqueSlugs = Array.from(new Set(slugs));
  const params: { lang: string; slug: string }[] = [];
  for (const lang of LOCALES) {
    for (const slug of uniqueSlugs) params.push({ lang, slug });
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

  // Category metadata wins for slugs that match a known category id.
  if (isCategorySlug(slug)) {
    const meta = CATEGORIES[slug];
    return {
      title: `${meta.label} | Noel D'Costa`,
      description: meta.description,
      alternates: { canonical: `${SITE_URL}/${locale}/category/${meta.slug}` },
    };
  }

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

  // Category slug shortcut: /en/<category-slug> renders the same
  // CategoryPage component as /en/category/<category-slug>. Canonical
  // URL points at the /category/ form (set in generateMetadata).
  // Special case: "case-studies" gets the bespoke portfolio layout
  // (hero + filters + anchor/archive grids) instead of the generic
  // category listing.
  if (isCategorySlug(slug)) {
    if (slug === "case-studies") return <CaseStudyPortfolioPage />;
    return <CategoryPage category={slug} locale={locale} />;
  }

  const post = getPost(slug, locale);
  if (post) return <PostPage slug={slug} locale={locale} />;

  const page = getPage(slug, locale);
  if (page) return <MdxPageLayout slug={slug} locale={locale} />;

  notFound();
}
