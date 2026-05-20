import { CASE_STUDIES, type CaseStudy } from "@/lib/case-studies";
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
    <section
      className="bg-bone border-t border-corbeau/[0.06]"
      style={{ padding: "clamp(3.5rem,6vw,5rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          [ Other programmes ]
        </p>
        <h2
          aria-label="Different industries. Same playbook."
          className="font-display font-black tracking-[-0.04em] leading-[1.08] text-corbeau mb-10"
          style={{ fontSize: "clamp(1.65rem,3vw,2.25rem)" }}
        >
          <span aria-hidden>
            {"Different industries. "}
            <span className="cc-emphasis-italic">Same playbook.</span>
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {related.map((c) => (
            <CaseStudyCard key={c.slug} c={c} variant="anchor" />
          ))}
        </div>
      </div>
    </section>
  );
}
