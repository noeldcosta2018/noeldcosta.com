import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { CATEGORIES } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";
import {
  TARGET_LANGUAGES,
  isTargetLanguage,
} from "@/lib/locales";

// Locale-scoped category index. Mirrors (site)/category/[category]/page.tsx
// but parameterised by `lang`. The CategoryPage component reads posts in
// the requested locale (falling back to en per resolveWithFallback).
//
// Block 3 scope: routing only. canonical still points at the flat English
// /category/<slug>/ URL via the existing CATEGORIES metadata. Per-locale
// canonical + hreflang land in Block 4.

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
  return {
    title: `${meta.label} | Noel D'Costa`,
    description: meta.description,
    alternates: { canonical: `${SITE_URL}/category/${meta.slug}/` },
  };
}

export default async function LocaleCategoryRoute(
  props: { params: Promise<{ lang: string; category: string }> },
) {
  const { lang, category } = await props.params;
  if (!isTargetLanguage(lang)) notFound();
  return <CategoryPage category={category} locale={lang} />;
}
