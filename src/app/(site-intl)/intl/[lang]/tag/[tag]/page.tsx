import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TagPage from "@/components/TagPage";
import { getAllTagSlugs } from "@/lib/content";
import { SITE_URL, buildLanguageAlternates } from "@/lib/seo";
import { tagInfo, WORDPRESS_TAG_SLUGS } from "@/components/tagMeta";
import {
  OG_LOCALE_MAP,
  TARGET_LANGUAGES,
  isTargetLanguage,
  localizedPath,
  type TargetLanguage,
} from "@/lib/locales";

// Locale-scoped tag archive. Mirrors (site)/tag/[tag]/page.tsx but
// parameterised by `lang`. The TagPage component reads matching posts in
// the requested locale (falling back to en per resolveWithFallback).
// Canonical points at the locale-prefixed URL; hreflang covers all 11
// variants + x-default.

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
  const locale = lang as TargetLanguage;
  const englishPath = `/tag/${tag}/`;
  const canonical = `${SITE_URL}${localizedPath(locale, englishPath)}`;
  return {
    title: `${info.label} | Noel D'Costa`,
    description,
    alternates: {
      canonical,
      languages: buildLanguageAlternates(englishPath),
    },
    openGraph: {
      title: `${info.label} | Noel D'Costa`,
      description,
      url: canonical,
      siteName: "Noel D'Costa",
      type: "website",
      locale: OG_LOCALE_MAP[locale] ?? "en_US",
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
