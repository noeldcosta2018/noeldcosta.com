import type { Metadata } from "next";
import TagPage from "@/components/TagPage";
import { getAllTagSlugs } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";
import { tagInfo, WORDPRESS_TAG_SLUGS } from "@/components/tagMeta";

function allTagSlugs(): string[] {
  const set = new Set<string>(WORDPRESS_TAG_SLUGS);
  for (const t of getAllTagSlugs()) set.add(t);
  return Array.from(set);
}

export function generateStaticParams() {
  return allTagSlugs().map((tag) => ({ tag }));
}

export const dynamicParams = false;

export async function generateMetadata(
  props: { params: Promise<{ tag: string }> },
): Promise<Metadata> {
  const { tag } = await props.params;
  const info = tagInfo(tag);
  const description =
    info.description ||
    `Articles tagged ${info.label} from Noel D'Costa — field-tested ERP and AI advisory.`;
  return {
    title: `${info.label} | Noel D'Costa`,
    description,
    alternates: {
      canonical: `${SITE_URL}/tag/${tag}`,
    },
  };
}

export default async function Route(
  props: { params: Promise<{ tag: string }> },
) {
  const { tag } = await props.params;
  return <TagPage tag={tag} />;
}
