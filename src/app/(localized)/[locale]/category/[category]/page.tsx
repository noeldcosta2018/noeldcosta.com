import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryPage, { categoryMetadata } from "@/components/CategoryPage";
import { contentLocaleFromPublicPrefix } from "@/lib/locale-url";
import {
  categoryPath,
  hasLocalizedInterfacePage,
  localizedInterfaceParams,
} from "@/lib/localized-interface-routes";

// Translated category archives (/de/category/erp-strategy/ ...). Generated
// only for locales whose interface dictionary is ready, and only for
// categories with at least one published translated article in that locale.
//
// Unknown params 404: dynamicParams = false is set on [locale]/layout.tsx and
// covers this route. It is deliberately not repeated here: while no locale is
// ready this list is empty, Next then passes the parent { locale } params
// through without `category`, and a `dynamicParams = false` on this segment
// fails the build with E280 ("param category is missing").

export function generateStaticParams() {
  return localizedInterfaceParams("category", "category");
}

type Props = { params: Promise<{ locale: string; category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  const content = contentLocaleFromPublicPrefix(locale);
  if (!content || !hasLocalizedInterfacePage(locale, categoryPath(category))) return {};
  return categoryMetadata(category, content);
}

export default async function LocalizedCategory({ params }: Props) {
  const { locale, category } = await params;
  const content = contentLocaleFromPublicPrefix(locale);
  if (!content || !hasLocalizedInterfacePage(locale, categoryPath(category))) notFound();
  return <CategoryPage category={category} locale={content} />;
}
