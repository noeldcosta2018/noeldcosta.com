import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TagPage from "@/components/TagPage";
import { getAllTagSlugs } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";
import { tagInfo, WORDPRESS_TAG_SLUGS } from "@/components/tagMeta";
import {
  TARGET_LANGUAGES,
  isTargetLanguage,
} from "@/lib/locales";

// Locale-scoped tag archive. Mirrors (site)/tag/[tag]/page.tsx but
// parameterised by `lang`. The TagPage component reads matching posts in
// the requested locale (falling back to en per resolveWithFallback).
//
// Block 3 scope: routing only. canonical still points at the flat English
// /tag/<slug>/ URL; per-locale canonical + hreflang land in Block 4.

function allTagSlugs(): string[] {
  const set = new Set<string>(WORDPRESS_TAG_SLUGS);
  for (const t of getAllTagSlugs()) set.add(t);
  return Array.from(set);
}

export function generateStaticParams() {
  const tags = allTagSlugs();
  const params: { lang: string; tag: string }[] = [];
  for (const lang of TARGET_LANGUAGES) {
    for (const tag of tags) {
      params.push({ lang, tag });
    }
  }
  return params;
}

export const dynamicParams = false;

export async function generateMetadata(
  props: { params: Promise<{ lang: string; tag: string }> },
): Promise<Metadata> {
  const { lang, tag } = await props.params;
  if (!isTargetLanguage(lang)) return {};
  const info = tagInfo(tag);
  const description =
    info.description ||
    `Articles tagged ${info.label} from Noel D'Costa — field-tested ERP and AI advisory.`;
  return {
    title: `${info.label} | Noel D'Costa`,
    description,
    alternates: {
      canonical: `${SITE_URL}/tag/${tag}/`,
    },
  };
}

export default async function LocaleTagRoute(
  props: { params: Promise<{ lang: string; tag: string }> },
) {
  const { lang, tag } = await props.params;
  if (!isTargetLanguage(lang)) notFound();
  return <TagPage tag={tag} locale={lang} />;
}
