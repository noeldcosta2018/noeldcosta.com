import { Suspense } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageBanner from "@/components/site/PageBanner";
import Doodle from "@/components/doodles/Doodle";
import { CloseBand } from "@/components/home/HomeSections";
import {
  type CaseStudy,
  CASE_STUDIES,
  INDUSTRY_LABEL,
  getAnchorCaseStudies,
  getArchiveCaseStudies,
  getFeaturedCaseStudy,
} from "@/lib/case-studies";
import { getPage } from "@/lib/content";
import { buildLanguageAlternates } from "@/lib/seo-graph";
import CaseStudyHero from "./CaseStudyHero";
import CaseStudyCard from "./CaseStudyCard";
import FilterChips from "./FilterChips";
import CaseStudyGrid from "./CaseStudyGrid";
import CaseStudyMethodology from "./CaseStudyMethodology";

/**
 * The cards as plain server HTML, newest first (the filter grid's default
 * order). The filter grid reads the URL, so it only renders in the browser;
 * without this its Suspense fallback was empty and the page's HTML carried no
 * links to the case studies at all.
 */
function StaticCaseStudyGrid({ items, variant }: { items: CaseStudy[]; variant: "anchor" | "compact" }) {
  return (
    <div className={`nda-cs-grid ${variant}`}>
      {items.map((c) => (
        <div key={c.slug} style={{ display: "flex", minWidth: 0 }}>
          <CaseStudyCard c={c} variant={variant} />
        </div>
      ))}
    </div>
  );
}

const newestFirst = (items: CaseStudy[]) =>
  [...items].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0));

/**
 * /case-studies/ portfolio page (/category/sap-case-studies/ lists the articles).
 *
 * Composition (top to bottom):
 *   1. Banner       Client work / Case studies, page H1
 *   2. Featured     the showpiece programme, cover + stats
 *   3. Anchor grid  4 hand-picked cards, 2-up
 *   4. Archive      sticky filter strip + the remaining cases, 3-up, URL-synced filters
 *   5. Methodology  "How I write these" trust block
 *   6. Close band   shared closing call to action
 *
 * The anchor row is editorial, so the filters only apply to the archive.
 * FilterChips / CaseStudyGrid use useSearchParams, which must sit inside a
 * Suspense boundary; both are wrapped here so neither blocks the server render.
 */
export default function CaseStudyPortfolioPage() {
  const featured = getFeaturedCaseStudy();
  const anchors = getAnchorCaseStudies();
  const archive = getArchiveCaseStudies();

  // The flat /case-studies/ URL has translated versions (/de/case-studies/ ...),
  // so the nav offers the language menu.
  const casePage = getPage("case-studies", "en");
  const languages = casePage ? buildLanguageAlternates("page", casePage) : undefined;

  // Three stats for the featured study, all sourced from its MDX body and
  // frontmatter. 44% custom code is the headline stat.
  const heroStats =
    featured.slug === "sap-ecc-to-s4hana-migration-case-study"
      ? [
          { value: "44%", label: "custom code, cleaned" },
          { value: "1,200+", label: "outlets migrated" },
          { value: "7", label: "countries in scope" },
        ]
      : [{ value: featured.headlineStat.value, label: featured.headlineStat.label }];

  const industries = Array.from(new Set(CASE_STUDIES.map((c) => INDUSTRY_LABEL[c.industry])));

  return (
    <>
      <Nav languages={languages} />
      <main id="main-content" className="nd-main">
        <PageBanner
          label="Case studies"
          crumbs={[{ label: "Client work" }, { label: "Case studies" }]}
          title="Programmes"
          highlight="I've worked on."
          lede={
            <>
              What each programme needed, what I did and what changed. Named where I can, anonymous where an NDA applies, and{" "}
              <span className="nd-mark">the numbers are the ones that were signed off.</span>
            </>
          }
          video={{ src: "/media/video/hero-loop.mp4", poster: "/media/video/hero-loop-poster.jpg" }}
        >
          <div className="nda-banner-meta">
            <span className="nd-pill">{CASE_STUDIES.length} case studies</span>
            <span>{industries.join(" · ")}</span>
          </div>
        </PageBanner>

        <section className="nda-section tight flush" aria-label="Featured case study">
          <div className="nda-wrap">
            <CaseStudyHero c={featured} stats={heroStats} />
          </div>
        </section>

        <section className="nda-section" aria-labelledby="anchor-title">
          <div className="nda-wrap">
            <div className="nda-head">
              <div>
                <div className="nd-eyebrow">Hand-picked</div>
                <h2 id="anchor-title" className="nd-display nd-h2">
                  Programmes that show{" "}
                  <span className="nd-hl nd-u">
                    the range.
                    <Doodle name="underline" />
                  </span>
                </h2>
                <p className="nd-lede">Different industries, same playbook.</p>
              </div>
            </div>
            {/* Hand-picked and never filtered, so it needs no client grid. */}
            <StaticCaseStudyGrid items={anchors} variant="anchor" />
          </div>
        </section>

        <div className="nda-archive">
          <Suspense fallback={null}>
            <FilterChips />
          </Suspense>
          <section className="nda-section tight flush" aria-labelledby="archive-title">
            <div className="nda-wrap">
              <div className="nda-head">
                <div>
                  <div className="nd-eyebrow">The archive</div>
                  <h2 id="archive-title" className="nd-display nd-h2">
                    Everything else. <span className="nd-hl">Filter to your situation.</span>
                  </h2>
                </div>
              </div>
              <Suspense fallback={<StaticCaseStudyGrid items={newestFirst(archive)} variant="compact" />}>
                <CaseStudyGrid items={archive} variant="compact" />
              </Suspense>
            </div>
          </section>
        </div>

        <CaseStudyMethodology />
        <CloseBand />
      </main>
      <Footer />
    </>
  );
}
