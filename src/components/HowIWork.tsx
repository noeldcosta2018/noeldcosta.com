/**
 * Homepage H-06 — How I work.
 *
 * Answers the CEO question that fires after they see proof and before
 * they book: "what does month one actually look like?" Per BUYER-CEO.md,
 * an opaque engagement model is one of the bounce reasons. Four steps,
 * each one a real artefact, each one with a time-box.
 *
 * Engagement model anchored in PRD Phase 3 (S-09 contact flow):
 *   - 30-min Calendly discovery
 *   - Paid scoping engagement (1-2 weeks)
 *   - Longer engagement (3-12 months)
 *
 * The four steps below expand that into something a CIO can map onto
 * their procurement workflow. Steps 2 and 3 are paid; step 1 is free;
 * step 4 is the optional retainer for ongoing oversight. Flag this for
 * Noel's review if the time-boxes need adjusting.
 *
 * Server component. No interactivity needed.
 */

import { type Locale } from "@/lib/locales";
import { getMessages } from "@/lib/i18n/useTranslation";

export default function HowIWork({ locale = "en" }: { locale?: Locale }) {
  const m = getMessages(locale);
  const STEPS = m.howIWork.steps;
  return (
    <section
      id="how-i-work"
      className="bg-cream"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          {m.howIWork.eyebrow}
        </p>
        <h2
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
          style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
        >
          {m.howIWork.h2Lead}{" "}
          <em className="not-italic text-papaya font-extrabold">
            {m.howIWork.h2Emphasis}
          </em>
        </h2>
        <p className="text-night text-[1rem] max-w-[560px] leading-[1.7] mb-12">
          {m.howIWork.intro}
        </p>

        <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
          {STEPS.map((s) => (
            <article
              key={s.num}
              className="bg-bone border border-corbeau/[0.08] rounded-2xl p-8 transition-all duration-300 hover:border-papaya/30 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(14,16,32,0.08)]"
            >
              <div className="flex items-baseline gap-3 mb-3">
                <span className="font-display font-black text-[2rem] text-papaya leading-none tracking-[-0.04em]">
                  {s.num}
                </span>
                <span className="font-mono text-[0.72rem] tracking-[1.5px] uppercase text-eyebrow">
                  {s.duration}
                </span>
              </div>
              <h3 className="font-display text-[1.35rem] font-extrabold text-corbeau tracking-[-0.03em] mb-1.5">
                {s.title}
              </h3>
              <p className="font-mono text-canyon text-[0.72rem] font-medium uppercase tracking-[1.5px] mb-4">
                {s.who}
              </p>
              <p className="text-night text-[0.95rem] leading-[1.7] mb-4">
                {s.body}
              </p>
              <p className="text-corbeau text-[0.85rem] leading-[1.55] font-semibold border-t border-corbeau/[0.08] pt-3.5">
                {s.output}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
