import type { Metadata } from "next";
import CategoryPage, { categoryMetadata } from "@/components/CategoryPage";
import CaseStudyPortfolioPage from "@/components/case-studies/CaseStudyPortfolioPage";
import { CATEGORIES } from "@/lib/content";

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({ category }));
}

export const dynamicParams = false;

// Same title, description and canonical as before; hreflang alternates are
// added only once a translated archive exists (see localized-interface-routes).
export async function generateMetadata(
  props: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category } = await props.params;
  return categoryMetadata(category, "en");
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
