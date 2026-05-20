import FadeUp from "@/components/article/FadeUp";

/**
 * Trust block between the archive grid and the CTA. Three cells that
 * tell a skeptical CFO why anonymous case studies are still credible:
 *
 *   1. Named where I can       — public references, client-approved.
 *   2. Anonymous where I must  — NDA-bound, sector preserved.
 *   3. Real numbers, no padding — what was signed off, no vanity metrics.
 *
 * Copy is short by design (4-5 lines per cell). The cells reuse the
 * existing card shell: bg-paper, corbeau/[0.06] border, rounded-xl,
 * subtle hover lift via FadeUp scroll-reveal.
 */

const CELLS = [
  {
    num: "01",
    title: "Named where I can.",
    body:
      "Public references, client-approved stories, projects signed off as public. Where I can put a name on the work, I do — and the case study points to a citable source.",
  },
  {
    num: "02",
    title: "Anonymous where I must.",
    body:
      "NDA-bound engagements stay anonymous. Industry, region, scale and timeline are preserved so a reader can judge fit. Identifying details are removed.",
  },
  {
    num: "03",
    title: "Real numbers, no padding.",
    body:
      "What I report is what was signed off. No vanity metrics, no rounding up to the next pretty figure. If the close went from 15 days to 5, that's what the case study says.",
  },
];

export default function CaseStudyMethodology() {
  return (
    <section className="bg-cream" style={{ padding: "clamp(4rem,7vw,6rem) clamp(1.5rem,5vw,4rem)" }}>
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          [ How I write these ]
        </p>
        <h2
          aria-label="Full numbers. Anonymous where it matters."
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
          style={{ fontSize: "clamp(2rem,4vw,2.75rem)" }}
        >
          <span aria-hidden>
            {"Full numbers. "}
            <span className="cc-emphasis-italic">Anonymous where it matters.</span>
          </span>
        </h2>
        <p className="text-night text-[1rem] max-w-[560px] leading-[1.7] mb-12">
          Most case studies on the internet either name everyone (and get sued)
          or anonymise everything (and tell you nothing). Here&apos;s the rule
          I follow.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {CELLS.map((cell, i) => (
            <FadeUp
              key={cell.num}
              as="section"
              delay={i * 90}
              className="rounded-xl bg-paper border border-corbeau/[0.06] p-6 md:p-7 transition-all duration-300 hover:border-papaya/40 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(14,16,32,0.06)] h-full flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-[10px] flex items-center justify-center text-papaya font-display font-black text-[1.05rem] shrink-0"
                  style={{ background: "rgba(252,152,90,0.10)" }}
                >
                  {cell.num}
                </div>
                <p className="font-mono text-[0.65rem] font-medium tracking-[2px] uppercase text-eyebrow">
                  Rule
                </p>
              </div>
              <h3 className="font-display font-bold text-corbeau text-[1.05rem] tracking-[-0.02em] leading-tight mb-3">
                {cell.title}
              </h3>
              <p className="text-night text-[0.9rem] leading-[1.65]">{cell.body}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
