import Link from "next/link";
import { notFound } from "next/navigation";
import MdxBody from "@/components/mdx/MdxBody";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getPage, type Locale } from "@/lib/content";
import {
  PAGE_ARTICLE_WORDCOUNT_THRESHOLD,
  SITE_URL,
  breadcrumbJsonLd,
  contactPageJsonLd,
  countWords,
  extractFaqItems,
  faqPageJsonLd,
  pageArticleJsonLd,
  pageWebPageJsonLd,
} from "@/lib/seo";
import { localePathPrefix } from "@/lib/locales";

export default function MdxPageLayout({
  slug,
  locale = "en",
}: {
  slug: string;
  locale?: Locale;
}) {
  const page = getPage(slug, locale);
  if (!page) notFound();
  const fm = page.frontmatter;

  // pageWebPageJsonLd already produces the locale-prefixed canonical (using
  // originalUrl when nested). Reuse that here for breadcrumb parity so the
  // crumb URL agrees with the canonical/@id. Schema for ContactPage etc.
  // also wants the locale-prefixed URL.
  const langPrefix = localePathPrefix(locale);
  const pageUrl = `${SITE_URL}${langPrefix}/${fm.slug}/`;
  const breadcrumbs = [
    { name: "Home", url: `${SITE_URL}${langPrefix}/` },
    { name: fm.title, url: pageUrl },
  ];

  // Heuristic: if the page slug starts with `contact`, emit ContactPage
  // schema in addition to breadcrumbs. Covers contact-noel-erp-support
  // and any future contact variants without hard-coding the slug.
  const isContact = /^contact[-_]/i.test(fm.slug) || fm.slug === "contact";

  const webPageLd = pageWebPageJsonLd(page);
  const isSubstantive = countWords(page.body) > PAGE_ARTICLE_WORDCOUNT_THRESHOLD;
  const articleLd = isSubstantive ? pageArticleJsonLd(page) : null;
  const faqItems = extractFaqItems(page.body);

  return (
    <>
      <Nav />
      <section className="bg-bone pt-28 pb-16">
        <div className="max-w-[760px] mx-auto px-6">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap gap-1.5 items-center font-mono text-[0.68rem] tracking-[1.5px] uppercase text-night/70">
              <li>
                <Link href="/" className="hover:text-papaya">Home</Link>
              </li>
            </ol>
          </nav>
          <h1 className="font-display font-black text-corbeau tracking-[-0.03em] leading-[1.08] text-3xl md:text-5xl mb-4">
            {fm.h1 || fm.title}
          </h1>
          {fm.excerpt && (
            <p className="text-night leading-[1.6] text-lg mb-8">{fm.excerpt}</p>
          )}
          {fm.hero && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fm.hero} alt={fm.title} className="w-full h-auto rounded-2xl mb-10" />
          )}
          <div className="prose-noel">
            <MdxBody source={page.body} />
          </div>
        </div>
      </section>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />
      {articleLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />
      {faqItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(faqItems)) }}
        />
      )}
      {isContact && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(contactPageJsonLd(pageUrl)),
          }}
        />
      )}
    </>
  );
}
