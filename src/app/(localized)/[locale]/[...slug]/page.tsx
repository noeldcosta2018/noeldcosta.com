import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MdxPageLayout from "@/components/MdxPageLayout";
import PostPage from "@/components/PostPage";
import { getLocalizedArticle } from "@/lib/localized-article-routing";
import {
  getLocalizedContentParams,
  getLocalizedPage,
} from "@/lib/localized-page-routing";
import { buildPageMetadata, buildPostMetadata } from "@/lib/seo";
import HomePage from "@/components/home/HomePage";
import { homeMetadata, LOCALIZED_HOME_SLUG } from "@/lib/home-meta";
import { readyLocales } from "@/i18n/ready";
import { contentLocaleFromPublicPrefix } from "@/lib/locale-url";

interface LocalizedContentPageProps {
  params: Promise<{ locale: string; slug: string[] }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...getLocalizedContentParams(),
    // Translated homepages: /de/ is rewritten to /de/__home/ in next.config.ts,
    // so no route has to claim single-segment paths (which would shadow English pages).
    ...readyLocales().map((locale) => ({ locale, slug: [LOCALIZED_HOME_SLUG] })),
  ];
}

function isHome(locale: string, slug: string[]) {
  return slug.length === 1 && slug[0] === LOCALIZED_HOME_SLUG && readyLocales().includes(locale as never);
}

export async function generateMetadata({
  params,
}: LocalizedContentPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (isHome(locale, slug)) {
    const content = contentLocaleFromPublicPrefix(locale);
    return content ? homeMetadata(content) : {};
  }
  const article =
    slug.length === 1 ? getLocalizedArticle(locale, slug[0]) : null;
  if (article) return buildPostMetadata(article);

  const page = getLocalizedPage(locale, slug);
  if (page) return buildPageMetadata(page, page.publicPath);

  notFound();
}

export default async function LocalizedContent({
  params,
}: LocalizedContentPageProps) {
  const { locale, slug } = await params;
  if (isHome(locale, slug)) {
    const content = contentLocaleFromPublicPrefix(locale);
    if (!content) notFound();
    return <HomePage locale={content} />;
  }
  const article =
    slug.length === 1 ? getLocalizedArticle(locale, slug[0]) : null;
  if (article) {
    return <PostPage slug={slug[0]} locale={article.locale} post={article} />;
  }

  const page = getLocalizedPage(locale, slug);
  if (!page) notFound();

  return (
    <MdxPageLayout
      slug={page.frontmatter.slug}
      page={page}
      publicPath={page.publicPath}
    />
  );
}
