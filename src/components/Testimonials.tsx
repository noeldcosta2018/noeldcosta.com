const TESTIMONIALS = [
  {
    quote:
      "His functional expertise combined with his financial and accounting knowledge are invaluable tools that Noel uses to drive business change and deliver amazing results.",
    name: "Mike Papamichael",
    role: "Ex-CIO, Etihad Aviation Group",
  },
  {
    quote:
      "The programme delivered on time, on budget, and with no major issues. A very substantial undertaking and it is huge credit to Noel.",
    name: "Andrew MacFarlane",
    role: "Ex-CIO, Etihad / Managing Partner, Cumbrae",
  },
  {
    quote:
      "A very talented negotiator with laser focus on cost and value. Continually challenges his organisation to deliver quicker and more cost effectively.",
    name: "Takhliq Hanif",
    role: "Head of Architecture, Volkswagen Financial Services",
  },
];

export default function Testimonials() {
  return (
    <section
      className="bg-cream"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.68rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          [ 07 · From people I&apos;ve worked with ]
        </p>
        <h2
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-10 text-corbeau"
          style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
        >
          They&apos;ll tell you{" "}
          <em className="not-italic text-canyon font-extrabold">what it&apos;s like.</em>
        </h2>

        <div className="grid grid-cols-3 gap-3.5 max-md:grid-cols-2 max-sm:grid-cols-1">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-paper border border-corbeau/[0.06] rounded-[14px] p-7"
            >
              <div className="flex gap-0.5 mb-3.5 text-papaya text-[0.8rem]">
                {"★★★★★"}
              </div>
              <p className="text-night text-[0.9rem] leading-[1.7] mb-[18px] italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <span className="font-display font-bold text-[0.9rem] block">{t.name}</span>
                <span className="text-[0.75rem] text-silver">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
