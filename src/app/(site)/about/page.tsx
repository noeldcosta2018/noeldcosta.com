import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MdxBody from "@/components/mdx/MdxBody";
import PageBanner from "@/components/site/PageBanner";
import SideRail from "@/components/site/SideRail";
import { CloseBand } from "@/components/home/HomeSections";
import { getPage } from "@/lib/content";
import { extractHeadings } from "@/lib/article-headings";
import { ABOUT, CONTACT } from "@/data/site-menu";
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

/**
 * /about: banner with the portrait cutout, a numbered side rail built from
 * the MDX H2s, and the MDX body (its own hero, capability and proof blocks)
 * in the reading column. JSON-LD unchanged: Breadcrumb, AboutPage, Person.
 */
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

  const headings = extractHeadings(page.body);
  const railItems = headings.filter((h) => h.level === 2).map((h) => ({ id: h.id, label: h.text }));
  const title = fm.h1 || fm.title;

  return (
    <>
      <Nav />
      <main id="main-content" className="nd-main">
        <PageBanner
          label="About"
          crumbs={[{ label: "About", href: ABOUT }, { label: "Profile" }]}
          title={title}
          long={title.length > 40}
          lede={fm.excerpt}
          portrait={{ src: "/media/noel-hero.webp", width: 1122, height: 1402 }}
        >
          <div className="nda-banner-actions">
            <Link className="nd-btn nd-btn-secondary" href={ABOUT}>
              Read my full story <span aria-hidden="true">→</span>
            </Link>
          </div>
        </PageBanner>

        <div className="nd-frame">
          {railItems.length > 1 && (
            <SideRail
              back={{ label: "Home", href: "/" }}
              label="About Noel"
              items={railItems}
              footer={
                <div className="nd-rail-cta">
                  <p>Working on a programme, a data platform or an AI decision?</p>
                  <Link className="nd-btn nd-btn-primary" href={CONTACT} style={{ padding: "9px 14px", fontSize: 13 }}>
                    Discuss your project <span aria-hidden="true">→</span>
                  </Link>
                </div>
              }
            />
          )}
          <div className="nd-article-body">
            {/* The MDX body's <about-hero> carries the call and email actions
                plus the headshot, so the banner keeps its actions light. */}
            <div className="prose-noel">
              <MdxBody source={page.body} headings={headings} reservedHeadingIds={headings.map((h) => h.id)} />
            </div>
          </div>
        </div>
        <CloseBand />
      </main>
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
