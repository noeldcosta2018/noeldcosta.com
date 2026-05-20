import { Suspense } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";
import {
  getAnchorCaseStudies,
  getArchiveCaseStudies,
  getFeaturedCaseStudy,
} from "@/lib/case-studies";
import CaseStudyHero from "./CaseStudyHero";
import FilterChips from "./FilterChips";
import CaseStudyGrid from "./CaseStudyGrid";
import CaseStudyMethodology from "./CaseStudyMethodology";

/**
 * /category/case-studies + /<lang>/case-studies portfolio page.
 *
 * Composition (top → bottom):
 *   1. Hero         — featured case study, large cover, count-up stats
 *   2. FilterChips  — sticky glass strip below the hero (URL-synced)
 *   3. Anchor grid  — 4 hand-picked cards, 2-up large
 *   4. Archive grid — remaining cases, 3-up compact, filterable via the chips
 *   5. Methodology  — "How I write these" trust block
 *   6. CTA          — same orange CTA banner used site-wide
 *
 * Anchor grid is `unfiltered` — the chip filters affect the archive
 * grid only (the anchor row is editorial, not a search result).
 *
 * Featured + anchor + archive all read from the same lib/case-studies
 * data; no duplication of slugs, hero images, or copy.
 *
 * FilterChips / CaseStudyGrid use useSearchParams which must run
 * inside a Suspense boundary in Next.js. Both wrapped here at the
 * page level so neither blocks SSR.
 */
export default function CaseStudyPortfolioPage() {
  const featured = getFeaturedCaseStudy();
  const anchors = getAnchorCaseStudies();
  const archive = getArchiveCaseStudies();

  // Three stats for the hero, all sourced from the featured study's
  // MDX body / frontmatter. 44% custom code is the headline stat; the
  // other two come from the case study's own takeaways.
  const heroStats =
    featured.slug === "sap-ecc-to-s4hana-migration-case-study"
      ? [
          { value: "44%", label: "custom code, cleaned" },
          { value: "1,200+", label: "outlets migrated" },
          { value: "7", label: "countries in scope" },
        ]
      : // Fallback for any future featured swap — use the headline stat
        // three times shouldn't happen; pick a sane default.
        [
          { value: featured.headlineStat.value, label: featured.headlineStat.label },
        ];

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 64 }}>
        <CaseStudyHero c={featured} stats={heroStats} />

        {/* Filter strip — sticky. Wrapped in Suspense because
            useSearchParams suspends during initial SSR. */}
        <Suspense fallback={null}>
          <FilterChips />
        </Suspense>

        {/* Anchor row */}
        <section
          className="bg-bone"
          style={{ padding: "clamp(3rem,5vw,4rem) clamp(1.5rem,5vw,4rem) clamp(2rem,4vw,3rem)" }}
        >
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-baseline justify-between flex-wrap gap-3 mb-8">
              <div>
                <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
                  [ Hand-picked ]
                </p>
                <h2
                  className="font-display font-black tracking-[-0.04em] leading-[1.08] text-corbeau"
                  style={{ fontSize: "clamp(1.65rem,3vw,2.25rem)" }}
                >
                  Programmes that show the range.{" "}
                  <span className="cc-emphasis-italic">Different industries, same playbook.</span>
                </h2>
              </div>
            </div>
            <Suspense fallback={null}>
              <CaseStudyGrid items={anchors} variant="anchor" unfiltered />
            </Suspense>
          </div>
        </section>

        {/* Archive — filterable */}
        <section
          className="bg-bone"
          style={{ padding: "clamp(2rem,4vw,3rem) clamp(1.5rem,5vw,4rem) clamp(4rem,6vw,6rem)" }}
        >
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-baseline justify-between flex-wrap gap-3 mb-8 pt-6 border-t border-corbeau/[0.08]">
              <div>
                <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
                  [ The archive ]
                </p>
                <h2
                  className="font-display font-black tracking-[-0.04em] leading-[1.08] text-corbeau"
                  style={{ fontSize: "clamp(1.5rem,2.6vw,2rem)" }}
                >
                  Everything else.{" "}
                  <span className="cc-emphasis-italic">Filter to your situation.</span>
                </h2>
              </div>
            </div>
            <Suspense fallback={null}>
              <CaseStudyGrid items={archive} variant="compact" />
            </Suspense>
          </div>
        </section>

        <CaseStudyMethodology />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
