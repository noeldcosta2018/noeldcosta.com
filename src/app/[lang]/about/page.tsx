import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MdxBody from "@/components/mdx/MdxBody";
import { getPage, LOCALES, type Locale } from "@/lib/content";
import {
  AUTHOR,
  SITE_URL,
  aboutPageJsonLd,
  breadcrumbJsonLd,
  buildPageMetadata,
  personJsonLd,
} from "@/lib/seo";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!LOCALES.includes(lang as Locale)) return {};
  const locale = lang as Locale;
  const page = getPage("about", locale);
  if (!page) return {};
  return buildPageMetadata(page);
}

export default async function AboutPage(props: { params: Promise<{ lang: string }> }) {
  const { lang } = await props.params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const locale = lang as Locale;
  const page = getPage("about", locale);
  if (!page) notFound();
  const fm = page.frontmatter;

  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const aboutUrl = `${SITE_URL}${localePrefix}/about`;
  const breadcrumbs = [
    { name: "Home", url: `${SITE_URL}${localePrefix}/` },
    { name: "About", url: aboutUrl },
  ];

  const person = personJsonLd();
  const aboutPage = aboutPageJsonLd(aboutUrl);

  return (
    <>
      <Nav />
      <section className="bg-bone pt-28 pb-16">
        <div className="max-w-[760px] mx-auto px-6">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap gap-1.5 items-center font-mono text-[0.68rem] tracking-[1.5px] uppercase text-night/70">
              <li>
                <Link href="/" className="hover:text-papaya">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-corbeau">About</li>
            </ol>
          </nav>

          <p className="font-mono text-[0.68rem] tracking-[2px] uppercase text-papaya mb-3">
            Author · {AUTHOR.jobTitle}
          </p>
          <h1 className="font-display font-black text-corbeau tracking-[-0.03em] leading-[1.08] text-4xl md:text-6xl mb-4">
            {fm.h1 || fm.title}
          </h1>
          {fm.excerpt && (
            <p className="text-night leading-[1.6] text-lg mb-8 max-w-[640px]">
              {fm.excerpt}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mb-10">
            <a
              href="https://www.linkedin.com/in/noeldcosta/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-corbeau text-bone px-4 py-2 rounded-lg no-underline text-[0.85rem] font-semibold hover:bg-night transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://www.youtube.com/@NoelDCostaERPAI"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-corbeau/20 text-corbeau px-4 py-2 rounded-lg no-underline text-[0.85rem] font-semibold hover:border-corbeau/50 transition-colors"
            >
              YouTube
            </a>
            <Link
              href="/contact"
              className="bg-papaya text-corbeau px-4 py-2 rounded-lg no-underline text-[0.85rem] font-semibold hover:bg-[#fdaa78] transition-colors"
            >
              Work with me
            </Link>
          </div>

          <div className="prose-noel">
            <MdxBody source={page.body} />
          </div>
        </div>
      </section>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
    </>
  );
}
