import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PostPage from "@/components/PostPage";
import MdxPageLayout from "@/components/MdxPageLayout";
import CategoryPage from "@/components/CategoryPage";
import CaseStudyPortfolioPage from "@/components/case-studies/CaseStudyPortfolioPage";
import CaseStudyArticlePage from "@/components/case-studies/CaseStudyArticlePage";
import { CASE_STUDIES } from "@/lib/case-studies";
import {
  CATEGORIES,
  getAllPostSlugs,
  getAllPageSlugs,
  getPost,
  getPage,
  type Category,
} from "@/lib/content";
import {
  SITE_URL,
  buildPostMetadata,
  buildPageMetadata,
  buildLanguageAlternates,
} from "@/lib/seo";

// Reserved single-segment slugs handled by dedicated routes
// (e.g. /about/page.tsx). The catch-all skips these at depth 1 so the
// dedicated handler renders. Nested URLs whose LAST segment matches a
// reserved slug (e.g. WordPress's
// /ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/)
// are still served — the dedicated route only owns the flat URL.
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

// Slugs that match a known category id (e.g. "sap-case-studies"). Hitting
// /sap-case-studies should render the same listing as
// /category/sap-case-studies, not a separate MDX content page. Keeps
// both URLs alive (zero-redirect SEO contract from CLAUDE.md) while
// surfacing the same article grid.
const CATEGORY_SLUGS = new Set<string>(Object.keys(CATEGORIES));

function isCategorySlug(slug: string): slug is Category {
  return CATEGORY_SLUGS.has(slug);
}

// WordPress also publishes /case-studies/ as a flat index URL (separate
// from the /category/sap-case-studies/ archive). Both URLs render the
// bespoke portfolio. The flat slug is NOT a CATEGORIES key — it's a
// shortcut hard-coded here to keep the WordPress URL alive.
const CASE_STUDIES_INDEX_SLUG = "case-studies";

// Parse an `originalUrl` like
// `https://noeldcosta.com/sap-implementation/sap-modules/` into
// `["sap-implementation", "sap-modules"]`. Returns null if the URL is
// missing or unparseable.
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
  const pageSlugs = allPageSlugs.filter((s) => !RESERVED_SLUGS.has(s));

  // Dedup paths across posts/pages/categories. JSON-encode the array so
  // Set dedupes by value, not reference.
  const pathSet = new Set<string>();

  // Posts: flat single-segment slugs.
  for (const slug of postSlugs) pathSet.add(JSON.stringify([slug]));

  // Pages: flat slug for backwards compatibility, plus the nested
  // WordPress URL (when originalUrl is multi-segment) so paths like
  // /sap-implementation/sap-modules/ resolve through the catch-all.
  for (const slug of pageSlugs) {
    if (slug === "https-noeldcosta-com-sap-implementation-expert") continue;
    pathSet.add(JSON.stringify([slug]));
    const page = getPage(slug, "en");
    const segments = pathSegmentsFromOriginalUrl(page?.frontmatter.originalUrl);
    if (segments && segments.length > 1) pathSet.add(JSON.stringify(segments));
  }

  // Reserved-slug pages still need their nested WordPress URL emitted
  // (the dedicated route only serves the flat URL). Example:
  // erp-implementation-cost-calculator has originalUrl
  // /ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/.
  for (const slug of allPageSlugs) {
    if (!RESERVED_SLUGS.has(slug)) continue;
    const page = getPage(slug, "en");
    const segments = pathSegmentsFromOriginalUrl(page?.frontmatter.originalUrl);
    if (segments && segments.length > 1) pathSet.add(JSON.stringify(segments));
  }

  // Category slugs (single-segment).
  for (const cat of CATEGORY_SLUGS) pathSet.add(JSON.stringify([cat]));

  // Flat /case-studies/ index URL — preserved for the WordPress URL contract
  // even though "case-studies" is no longer a CATEGORIES key.
  pathSet.add(JSON.stringify([CASE_STUDIES_INDEX_SLUG]));

  const params: { slug: string[] }[] = [];
  for (const pathJson of pathSet) {
    params.push({ slug: JSON.parse(pathJson) as string[] });
  }
  return params;
}

export const dynamicParams = false;

export async function generateMetadata(
  props: { params: Promise<{ slug: string[] }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const lastSlug = slug[slug.length - 1];

  // Category metadata wins for slugs that match a known category id. The
  // canonical points at the /category/<slug>/ form (the catch-all also
  // serves /<slug>/ as a WordPress-parity shortcut). hreflang covers
  // every translated /<lang>/category/<slug>/ variant.
  if (slug.length === 1 && isCategorySlug(lastSlug)) {
    const meta = CATEGORIES[lastSlug];
    const englishPath = `/category/${meta.slug}/`;
    return {
      title: `${meta.label} | Noel D'Costa`,
      description: meta.description,
      alternates: {
        canonical: `${SITE_URL}${englishPath}`,
        languages: buildLanguageAlternates(englishPath),
      },
    };
  }

  // Flat /case-studies/ index URL — borrows the sap-case-studies category
  // metadata since both URLs render the same portfolio page.
  if (slug.length === 1 && lastSlug === CASE_STUDIES_INDEX_SLUG) {
    const meta = CATEGORIES["sap-case-studies"];
    const englishPath = `/${CASE_STUDIES_INDEX_SLUG}/`;
    return {
      title: `${meta.label} | Noel D'Costa`,
      description: meta.description,
      alternates: {
        canonical: `${SITE_URL}${englishPath}`,
        languages: buildLanguageAlternates(englishPath),
      },
    };
  }

  const post = getPost(lastSlug, "en");
  if (post) return buildPostMetadata(post);
  const page = getPage(lastSlug, "en");
  if (page) return buildPageMetadata(page);
  return {};
}

export default async function LocalizedRoute(
  props: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await props.params;
  const lastSlug = slug[slug.length - 1];

  // Flat URLs whose slug has a dedicated route handler get a 404 from
  // the catch-all so Next.js falls through to the dedicated page. The
  // guard is depth-1 only — nested WordPress URLs whose tail matches
  // a reserved slug (e.g. erp-implementation-cost-calculator under
  // /ai-insights-shiftgearx-noeldcosta/) still resolve here.
  if (slug.length === 1 && RESERVED_SLUGS.has(lastSlug)) notFound();

  // Flat /case-studies/ index URL — WordPress publishes this alongside
  // the /category/sap-case-studies/ archive. Both render the bespoke
  // portfolio layout (hero + filters + anchor/archive grids).
  if (slug.length === 1 && lastSlug === CASE_STUDIES_INDEX_SLUG) {
    return <CaseStudyPortfolioPage />;
  }

  // Category slug shortcut: /<category-slug> renders the same
  // CategoryPage component as /category/<category-slug>. Canonical
  // URL points at the /category/ form (set in generateMetadata).
  // Special case: "sap-case-studies" gets the bespoke portfolio layout
  // instead of the generic category listing.
  if (slug.length === 1 && isCategorySlug(lastSlug)) {
    if (lastSlug === "sap-case-studies") return <CaseStudyPortfolioPage />;
    return <CategoryPage category={lastSlug} />;
  }

  const post = getPost(lastSlug, "en");
  if (post) {
    // Case-study posts get the bespoke article template (full-width
    // hero, meta strip, related-case-studies grid). Other posts use
    // the generic PostPage layout.
    const isCaseStudy = CASE_STUDIES.some((c) => c.slug === lastSlug);
    if (isCaseStudy) return <CaseStudyArticlePage slug={lastSlug} />;
    return <PostPage slug={lastSlug} />;
  }

  const page = getPage(lastSlug, "en");
  if (page) return <MdxPageLayout slug={lastSlug} />;

  notFound();
}
