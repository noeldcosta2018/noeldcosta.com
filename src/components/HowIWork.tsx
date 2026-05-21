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

const STEPS: {
  num: string;
  title: string;
  duration: string;
  who: string;
  body: string;
  output: string;
}[] = [
  {
    num: "01",
    title: "Discovery call",
    duration: "30 minutes · free",
    who: "Direct with me",
    body: "We talk about your programme. The state it is in, the decisions on your desk, the things keeping you up. I tell you whether I can actually help and where I would start. No deck, no pre-read, no follow-up sales loop.",
    output: "Output: clear yes or no on whether to scope a paid engagement.",
  },
  {
    num: "02",
    title: "Scoping engagement",
    duration: "1 to 2 weeks · day rate or fixed",
    who: "Direct with me plus your nominated lead",
    body: "I review your current state. Existing artefacts, recent SteerCo reports, the SI's plan, your finance close cycle, the risk log. I run targeted conversations with the people who actually do the work. The output is a written diagnostic and a recommended engagement shape.",
    output: "Output: diagnostic report and engagement proposal. You can take both elsewhere.",
  },
  {
    num: "03",
    title: "Delivery engagement",
    duration: "3 to 12 months · fee structure varies",
    who: "Direct involvement throughout",
    body: "I work alongside your team and the SI on the agreed scope. Programme recovery, S/4HANA migration oversight, AI on SAP design, vendor governance, business case validation. No junior team learning on your budget. I limit client load on purpose, so the senior in the pitch is the senior in the room.",
    output: "Output: programme that lands. Weekly written updates. Honest escalation when something is off.",
  },
  {
    num: "04",
    title: "Hypercare or advisory retainer",
    duration: "Optional · monthly",
    who: "Lighter touch, named contact",
    body: "Post-go-live stabilisation, or ongoing board-level advisory for the next phase. Most clients take this for the first three months after a major go-live. Some keep it as standing capacity for the next big decision.",
    output: "Output: documented stabilisation actions or quarterly advisory notes to the SteerCo.",
  },
];

export default function HowIWork() {
  return (
    <section
      id="how-i-work"
      className="bg-cream"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          [ 04 · How I work ]
        </p>
        <h2
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
          style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
        >
          Four steps.{" "}
          <em className="not-italic text-papaya font-extrabold">
            No opaque engagement model.
          </em>
        </h2>
        <p className="text-night text-[1rem] max-w-[560px] leading-[1.7] mb-12">
          Each step has a clear output. You can stop after any of them. The
          first one is free.
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
