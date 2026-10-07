import type { Metadata } from "next";
import TagPage, { tagMetadata } from "@/components/TagPage";
import { getAllTagSlugs } from "@/lib/content";
import { WORDPRESS_TAG_SLUGS } from "@/components/tagMeta";

function allTagSlugs(): string[] {
  const set = new Set<string>(WORDPRESS_TAG_SLUGS);
  for (const t of getAllTagSlugs()) set.add(t);
  return Array.from(set);
}

export function generateStaticParams() {
  return allTagSlugs().map((tag) => ({ tag }));
}

export const dynamicParams = false;

// Same title, description and canonical as before; hreflang alternates are
// added only once a translated archive exists (see localized-interface-routes).
export async function generateMetadata(
  props: { params: Promise<{ tag: string }> },
): Promise<Metadata> {
  const { tag } = await props.params;
  return tagMetadata(tag, "en");
}

export default async function Route(
  props: { params: Promise<{ tag: string }> },
) {
  const { tag } = await props.params;
  return <TagPage tag={tag} />;
}
