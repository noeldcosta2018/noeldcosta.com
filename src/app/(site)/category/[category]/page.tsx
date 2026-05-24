import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import CaseStudyPortfolioPage from "@/components/case-studies/CaseStudyPortfolioPage";
import { CATEGORIES } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({ category }));
}

export const dynamicParams = false;

export async function generateMetadata(
  props: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category } = await props.params;
  const meta = CATEGORIES[category as keyof typeof CATEGORIES];
  if (!meta) return {};
  return {
    title: `${meta.label} | Noel D'Costa`,
    description: meta.description,
    alternates: { canonical: `${SITE_URL}/category/${meta.slug}/` },
  };
}

export default async function Route(
  props: { params: Promise<{ category: string }> }
) {
  const { category } = await props.params;
  // Case studies get the bespoke portfolio layout (hero + filters +
  // anchor/archive grids). Other categories use the generic listing.
  if (category === "sap-case-studies") return <CaseStudyPortfolioPage />;
  return <CategoryPage category={category} />;
}
