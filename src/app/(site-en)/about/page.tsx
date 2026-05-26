import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MdxBody from "@/components/mdx/MdxBody";
import { getPage } from "@/lib/content";
import {
  SITE_URL,
  aboutPageJsonLd,
  breadcrumbJsonLd,
  buildPageMetadata,
  personJsonLd,
} from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page = getPage("about", "en");
  if (!page) return {};
  return buildPageMetadata(page);
}

export default async function AboutPage() {
  const page = getPage("about", "en");
  if (!page) notFound();
  const fm = page.frontmatter;

  const aboutUrl = `${SITE_URL}/about`;
  const breadcrumbs = [
    { name: "Home", url: `${SITE_URL}/` },
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

          <h1 className="font-display font-black text-corbeau tracking-[-0.03em] leading-[1.08] text-3xl md:text-5xl mb-4">
            {fm.h1 || fm.title}
          </h1>
          {fm.excerpt && (
            <p className="text-night leading-[1.6] text-lg mb-8 max-w-[640px]">
              {fm.excerpt}
            </p>
          )}

          {/* No social buttons here — the MDX body's <about-hero> provides
              the Calendly + email CTAs and headshot. Keeping them above
              the body too would duplicate the call-to-action chrome. */}

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
