/**
 * Homepage H-07 — What I believe.
 *
 * The section that converts the 90-second CEO scan into a booked call.
 * Per BUYER-CEO.md: "One opinion in 'What I believe' matched something
 * they've thought themselves but couldn't say out loud" → books the call.
 *
 * Five opinions transcribed verbatim from BRAND.md ("What I believe"
 * section). The headline of each opinion is the position; the body is
 * Noel's own framing of why it matters. Do not soften these — the
 * directness is what differentiates this section from the equivalent
 * page on every Big 4 site.
 *
 * Server component. No interactivity needed.
 */

const BELIEFS: {
  num: string;
  title: string;
  body: string;
}[] = [
  {
    num: "01",
    title: "Start with processes, not systems.",
    body: "Most ERP failures begin in the wrong order. Buy the system, then try to fit your business into it. The conversation should run the other way. Map your processes first. Decide what is broken, what is worth keeping, what needs to change. Then talk about systems. Every greenfield-vs-brownfield debate I have watched go sideways started without this step.",
  },
  {
    num: "02",
    title: "Your SI should not be the one writing your business case.",
    body: "You need an expert who is not selling the implementation to write the case for it. That is how $40M programmes become $90M without anyone noticing. The SI incentive is to start. Yours is to finish. Different jobs.",
  },
  {
    num: "03",
    title: "AI on ERP is real now, and it is moving fast.",
    body: "Joule is growing by the day. The agentic use cases on BTP are no longer slideware. If your last look at AI-on-SAP was 12 months ago, look again. The board-deck version is over. The shipping version is here. Ignore it and you are on the wrong side of the next two years.",
  },
  {
    num: "04",
    title: "The cheapest consultant is the most expensive one.",
    body: "Day rate is the smallest variable in total programme cost. A senior advisor at $2,500 per day who saves you a six-month overrun is cheaper than a $900 per day team that does not. Most CFOs work this out only after the second post-mortem.",
  },
  {
    num: "05",
    title: "Walk if a vendor proposes a 3-year roadmap before understanding your finance close.",
    body: "The close is where the real complexity lives. Vendors who skip it are selling a roadmap, not solving a problem. Anyone serious wants to see your close cycle, your reconciliations, and your manual workarounds before they propose anything.",
  },
];

export default function WhatIBelieve() {
  return (
    <section
      id="what-i-believe"
      className="bg-bone"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          [ 05 · What I believe ]
        </p>
        <h2
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
          style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
        >
          Five positions.{" "}
          <em className="not-italic text-papaya font-extrabold">
            All defensible in print.
          </em>
        </h2>
        <p className="text-night text-[1rem] max-w-[640px] leading-[1.7] mb-12">
          These are the opinions I will hold in a SteerCo. If one of them
          matches something you have already thought but could not say out
          loud, we should talk.
        </p>

        <ol className="flex flex-col gap-5 list-none p-0 m-0">
          {BELIEFS.map((b) => (
            <li
              key={b.num}
              className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 max-md:grid-cols-1 max-md:gap-y-3 border-l-4 border-papaya/70 pl-6 py-2 transition-colors hover:border-papaya"
            >
              <span
                className="font-display font-black text-papaya leading-none tracking-[-0.04em] row-span-2 max-md:row-span-1"
                style={{ fontSize: "clamp(2rem,3vw,2.6rem)" }}
              >
                {b.num}
              </span>
              <h3 className="font-display font-extrabold text-corbeau tracking-[-0.02em] leading-[1.2] self-end max-md:self-auto"
                style={{ fontSize: "clamp(1.15rem,1.8vw,1.5rem)" }}
              >
                {b.title}
              </h3>
              <p className="text-night text-[0.98rem] leading-[1.7] max-w-[760px] col-start-2 max-md:col-start-1">
                {b.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex flex-wrap items-center gap-4">
          <a
            href="https://calendly.com/noeldcosta/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-papaya text-corbeau font-semibold text-[0.95rem] no-underline px-6 py-3 rounded-lg transition-colors hover:bg-[#fdaa78] min-h-[44px]"
          >
            Book a 30-min call
            <span aria-hidden>→</span>
          </a>
          <span className="font-mono text-[0.78rem] text-eyebrow tracking-[1px]">
            Direct with me. No SDR layer.
          </span>
        </div>
      </div>
    </section>
  );
}
