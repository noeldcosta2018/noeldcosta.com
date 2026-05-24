import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TagPage from "@/components/TagPage";
import {
  getAllTagSlugs,
  LOCALES,
  type Locale,
} from "@/lib/content";
import { SITE_URL } from "@/lib/seo";
import { tagInfo, WORDPRESS_TAG_SLUGS } from "@/components/tagMeta";

function allTagSlugs(): string[] {
  const set = new Set<string>(WORDPRESS_TAG_SLUGS);
  for (const t of getAllTagSlugs()) set.add(t);
  return Array.from(set);
}

export function generateStaticParams() {
  const tags = allTagSlugs();
  const params: { lang: string; tag: string }[] = [];
  for (const lang of LOCALES) {
    for (const tag of tags) params.push({ lang, tag });
  }
  return params;
}

export const dynamicParams = false;

export async function generateMetadata(
  props: { params: Promise<{ lang: string; tag: string }> },
): Promise<Metadata> {
  const { lang, tag } = await props.params;
  if (!LOCALES.includes(lang as Locale)) return {};
  const info = tagInfo(tag);
  const description =
    info.description ||
    `Articles tagged ${info.label} from Noel D'Costa — field-tested ERP and AI advisory.`;
  return {
    title: `${info.label} | Noel D'Costa`,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/tag/${tag}`,
    },
  };
}

export default async function Route(
  props: { params: Promise<{ lang: string; tag: string }> },
) {
  const { lang, tag } = await props.params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  return <TagPage tag={tag} locale={lang as Locale} />;
}
