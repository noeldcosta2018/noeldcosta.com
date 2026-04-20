import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { CATEGORIES, LOCALES, type Locale } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  const params: { lang: string; category: string }[] = [];
  for (const lang of LOCALES) {
    for (const category of Object.keys(CATEGORIES)) params.push({ lang, category });
  }
  return params;
}

export const dynamicParams = false;

export async function generateMetadata(
  props: { params: Promise<{ lang: string; category: string }> }
): Promise<Metadata> {
  const { lang, category } = await props.params;
  if (!LOCALES.includes(lang as Locale)) return {};
  const meta = CATEGORIES[category as keyof typeof CATEGORIES];
  if (!meta) return {};
  return {
    title: `${meta.label} | Noel D'Costa`,
    description: meta.description,
    alternates: { canonical: `${SITE_URL}/${lang}/category/${meta.slug}` },
  };
}

export default async function Route(
  props: { params: Promise<{ lang: string; category: string }> }
) {
  const { lang, category } = await props.params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  return <CategoryPage category={category} locale={lang as Locale} />;
}
