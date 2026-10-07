import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TagPage, { tagMetadata } from "@/components/TagPage";
import { contentLocaleFromPublicPrefix } from "@/lib/locale-url";
import {
  hasLocalizedInterfacePage,
  localizedInterfaceParams,
  tagPath,
} from "@/lib/localized-interface-routes";

// Translated topic archives for the six WordPress tags only
// (/de/tag/sap-crisis-management/ ...). Generated only for ready locales and
// only when the topic has a published translated article in that locale.
// dynamicParams = false comes from [locale]/layout.tsx (see the category
// route for why it is not repeated on this segment).

export function generateStaticParams() {
  return localizedInterfaceParams("tag", "tag");
}

type Props = { params: Promise<{ locale: string; tag: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, tag } = await params;
  const content = contentLocaleFromPublicPrefix(locale);
  if (!content || !hasLocalizedInterfacePage(locale, tagPath(tag))) return {};
  return tagMetadata(tag, content);
}

export default async function LocalizedTag({ params }: Props) {
  const { locale, tag } = await params;
  const content = contentLocaleFromPublicPrefix(locale);
  if (!content || !hasLocalizedInterfacePage(locale, tagPath(tag))) notFound();
  return <TagPage tag={tag} locale={content} />;
}
