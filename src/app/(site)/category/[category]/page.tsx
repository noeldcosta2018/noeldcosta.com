import type { Metadata } from "next";
import CategoryPage, { categoryMetadata } from "@/components/CategoryPage";
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
  // Every category, case studies included, lists its articles. The case-study
  // portfolio lives at /case-studies/; rendering it here too made this URL a
  // duplicate Google left unindexed, and the articles were barely linked.
  return <CategoryPage category={category} />;
}
