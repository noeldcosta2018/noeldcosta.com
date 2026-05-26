import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { CATEGORIES } from "@/lib/content";
import { SITE_URL, buildLanguageAlternates } from "@/lib/seo";
import {
  OG_LOCALE_MAP,
  TARGET_LANGUAGES,
  isTargetLanguage,
  localizedPath,
  type TargetLanguage,
} from "@/lib/locales";

// Locale-scoped category index. Mirrors (site)/category/[category]/page.tsx
// but parameterised by `lang`. The CategoryPage component reads posts in
// the requested locale (falling back to en per resolveWithFallback).
// Canonical points at the locale-prefixed URL; hreflang covers all 11
// variants + x-default.

export function generateStaticParams() {
  const params: { lang: string; category: string }[] = [];
  for (const lang of TARGET_LANGUAGES) {
    for (const category of Object.keys(CATEGORIES)) {
      params.push({ lang, category });
    }
  }
  return params;
}

export const dynamicParams = false;

export async function generateMetadata(
  props: { params: Promise<{ lang: string; category: string }> },
): Promise<Metadata> {
  const { lang, category } = await props.params;
  if (!isTargetLanguage(lang)) return {};
  const meta = CATEGORIES[category as keyof typeof CATEGORIES];
  if (!meta) return {};
  const locale = lang as TargetLanguage;
  const englishPath = `/category/${meta.slug}/`;
  const canonical = `${SITE_URL}${localizedPath(locale, englishPath)}`;
  return {
    title: `${meta.label} | Noel D'Costa`,
    description: meta.description,
    alternates: {
      canonical,
      languages: buildLanguageAlternates(englishPath),
    },
    openGraph: {
      title: `${meta.label} | Noel D'Costa`,
      description: meta.description,
      url: canonical,
      siteName: "Noel D'Costa",
      type: "website",
      locale: OG_LOCALE_MAP[locale] ?? "en_US",
    },
  };
}

export default async function LocaleCategoryRoute(
  props: { params: Promise<{ lang: string; category: string }> },
) {
  const { lang, category } = await props.params;
  if (!isTargetLanguage(lang)) notFound();
  return <CategoryPage category={category} locale={lang} />;
}
