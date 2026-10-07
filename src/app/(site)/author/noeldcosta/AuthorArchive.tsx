import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageBanner from "@/components/site/PageBanner";
import SideRail from "@/components/site/SideRail";
import ArticlesLibrary, { getLibrary } from "@/components/pages/ArticlesLibrary";
import { CloseBand } from "@/components/home/HomeSections";
import { archiveTools } from "@/components/CategoryPage";
import type { Locale } from "@/lib/content";
import { SITE_URL, breadcrumbJsonLd, personJsonLd } from "@/lib/seo";
import {
  AUTHOR_PATH,
  interfaceAlternates,
  interfaceMetadata,
  interfaceUrl,
} from "@/lib/localized-interface-routes";
import { ABOUT, CONTACT, LINKEDIN, YOUTUBE } from "@/data/site-menu";

// Live WordPress author archive, kept at the same URL (/author/noeldcosta/),
// plus its translations (/de/author/noeldcosta/ ...) once a locale is ready.
// It lists every article by Noel, grouped by the same areas as the library.

export const AUTHOR_TITLE = "Noel D'Costa: articles and guides";
export const AUTHOR_DESCRIPTION =
  "Every article by Noel D'Costa on enterprise applications, data, AI and running programmes: SAP, Oracle, Microsoft, Databricks, SAP Analytics Cloud and enterprise AI.";

export function authorMetadata(locale: Locale = "en"): Metadata {
  const { tr } = archiveTools(locale);
  return interfaceMetadata({
    locale,
    englishPath: AUTHOR_PATH,
    title: `${tr(AUTHOR_TITLE)} | Noel D'Costa`,
    description: tr(AUTHOR_DESCRIPTION),
  });
}

export default function AuthorArchive({ locale = "en" }: { locale?: Locale }) {
  const { tr, prefix, href, count } = archiveTools(locale);
  const pageUrl = interfaceUrl(locale, AUTHOR_PATH);
  const groups = getLibrary(locale);
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const profile = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: pageUrl,
    ...(prefix ? { inLanguage: prefix } : {}),
    mainEntity: personJsonLd(),
  };
  const crumbs = breadcrumbJsonLd([
    { name: tr("Home"), url: `${SITE_URL}${href("/")}` },
    { name: "Noel D'Costa", url: pageUrl },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profile) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <Nav locale={locale} languages={interfaceAlternates(AUTHOR_PATH)} />
      <main id="main-content" className="nd-main">
        <PageBanner
          label="Noel D'Costa"
          crumbs={[{ label: tr("About"), href: href(ABOUT) }, { label: tr("Author") }]}
          title="Noel"
          highlight="D'Costa."
          lede={tr(
            "Enterprise applications, data and AI. I work with leadership teams to choose the right platforms, deliver programmes and put AI to work where it earns its place. Everything I have written is below.",
          )}
          portrait={{ src: "/media/noel-hero.webp", width: 1122, height: 1402 }}
        >
          <div className="nd-meta">
            <span className="nd-pill">{count(total, "article", "articles")}</span>
            <Link className="nd-textlink" href={href(ABOUT)}>
              {tr("My story")} <span aria-hidden="true">→</span>
            </Link>
            <a className="nd-textlink" href={LINKEDIN} target="_blank" rel="me noopener noreferrer">
              LinkedIn <span aria-hidden="true">↗</span>
            </a>
            <a className="nd-textlink" href={YOUTUBE} target="_blank" rel="me noopener noreferrer">
              YouTube <span aria-hidden="true">↗</span>
            </a>
          </div>
        </PageBanner>
        <div className="nd-frame">
          <SideRail
            back={{ label: tr("About"), href: href(ABOUT) }}
            label={tr("Articles by area")}
            items={groups.map((g) => ({ id: g.id, label: tr(g.title) }))}
            numbered={false}
            footer={
              <div className="nd-rail-cta">
                <p>{tr("Working on a programme, a data platform or an AI decision?")}</p>
                <Link className="nd-btn nd-btn-primary magnetic" href={href(CONTACT)} style={{ padding: "9px 14px", fontSize: 13 }}>
                  {tr("Discuss your project")} <span aria-hidden="true">→</span>
                </Link>
              </div>
            }
          />
          <div className="nd-article-body">
            <ArticlesLibrary locale={locale} />
          </div>
        </div>
        <CloseBand locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
