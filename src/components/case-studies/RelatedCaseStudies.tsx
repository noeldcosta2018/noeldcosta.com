import Link from "next/link";
import { CASE_STUDIES, type CaseStudy } from "@/lib/case-studies";
import { CLIENT_WORK } from "@/data/site-menu";
import CaseStudyCard from "./CaseStudyCard";

/**
 * "Other programmes" — 2 sibling case-study cards at the bottom of an
 * individual case-study page. Picks the two most related from the
 * remaining 7 by shared industry + service overlap.
 *
 * Falls back to the next 2 in publishedAt order if nothing matches
 * (won't happen with the current data set, but the fallback keeps the
 * block from rendering empty for any future swap).
 */

function pickRelated(current: CaseStudy, n = 2): CaseStudy[] {
  const others = CASE_STUDIES.filter((c) => c.slug !== current.slug);

  // Score by shared industry (3 pts) + shared service tags (1 pt each).
  const scored = others.map((c) => {
    let score = 0;
    if (c.industry === current.industry) score += 3;
    for (const s of c.service) if (current.service.includes(s)) score += 1;
    return { c, score };
  });

  // Sort highest score first; tie-break by newest publishedAt.
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.c.publishedAt < b.c.publishedAt ? 1 : -1;
  });

  // Always return n — score==0 still counts as a valid candidate.
  return scored.slice(0, n).map((x) => x.c);
}

export default function RelatedCaseStudies({ current }: { current: CaseStudy }) {
  const related = pickRelated(current, 2);
  if (related.length === 0) return null;

  return (
    <section className="nda-section" aria-labelledby="related-cs-title">
      <div className="nda-wrap">
        <div className="nda-head">
          <div>
            <div className="nd-eyebrow">Other programmes</div>
            <h2 id="related-cs-title" className="nd-display nd-h2">
              Different industries. <span className="nd-hl">Same playbook.</span>
            </h2>
          </div>
          <Link className="nd-textlink" href={CLIENT_WORK}>
            All case studies <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="nda-cs-grid anchor">
          {related.map((c) => (
            <CaseStudyCard key={c.slug} c={c} variant="anchor" />
          ))}
        </div>
      </div>
    </section>
  );
}
