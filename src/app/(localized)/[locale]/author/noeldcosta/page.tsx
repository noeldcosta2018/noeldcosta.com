import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AuthorArchive, { authorMetadata } from "@/app/(site)/author/noeldcosta/AuthorArchive";
import { contentLocaleFromPublicPrefix } from "@/lib/locale-url";
import {
  AUTHOR_PATH,
  hasLocalizedInterfacePage,
  localizedInterfaceParams,
} from "@/lib/localized-interface-routes";

// Translated author archive (/de/author/noeldcosta/ ...), only for locales
// whose interface dictionary is ready.

export const dynamicParams = false;

export function generateStaticParams() {
  return localizedInterfaceParams("author");
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const content = contentLocaleFromPublicPrefix(locale);
  if (!content || !hasLocalizedInterfacePage(locale, AUTHOR_PATH)) return {};
  return authorMetadata(content);
}

export default async function LocalizedAuthor({ params }: Props) {
  const { locale } = await params;
  const content = contentLocaleFromPublicPrefix(locale);
  if (!content || !hasLocalizedInterfacePage(locale, AUTHOR_PATH)) notFound();
  return <AuthorArchive locale={content} />;
}
