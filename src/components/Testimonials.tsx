import Image from "next/image";

/**
 * Homepage H-10 — Testimonials.
 *
 * Real, attributed quotes only — per BRAND.md, made-up testimonials are
 * an instant fail. Each card carries a portrait photo from /public/people/
 * for CEO buyers who scan for real faces before reading words.
 */
const TESTIMONIALS = [
  {
    quote:
      "His functional expertise combined with his financial and accounting knowledge are invaluable tools that Noel uses to drive business change and deliver amazing results.",
    name: "Mike Papamichael",
    role: "Ex-CIO, Etihad Aviation Group",
    image: "/people/mike-papamichael.webp",
  },
  {
    quote:
      "The programme delivered on time, on budget, and with no major issues. A very substantial undertaking and it is huge credit to Noel.",
    name: "Andrew MacFarlane",
    role: "Ex-CIO, Etihad / Managing Partner, Cumbrae",
    image: "/people/andrew-macfarlane.webp",
  },
  {
    quote:
      "A very talented negotiator with laser focus on cost and value. Continually challenges his organisation to deliver quicker and more cost effectively.",
    name: "Takhliq Hanif",
    role: "Head of Architecture, Volkswagen Financial Services",
    image: "/people/takhliq-hanif.webp",
  },
];

export default function Testimonials() {
  return (
    <section
      className="bg-cream"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          [ 09 · From people I&apos;ve worked with ]
        </p>
        <h2
          aria-label="Don't take my word for it. Read theirs."
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-10 text-corbeau"
          style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
        >
          <span aria-hidden>
            {"Don't take my word for it. "}
            <span className="cc-emphasis-italic">Read theirs.</span>
          </span>
        </h2>

        <div className="grid grid-cols-3 gap-3.5 max-md:grid-cols-2 max-sm:grid-cols-1">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-paper border border-corbeau/[0.06] rounded-[14px] p-7 flex flex-col"
            >
              <div className="flex gap-0.5 mb-3.5 text-papaya text-[0.8rem]">
                {"★★★★★"}
              </div>
              <p className="text-night text-[0.9rem] leading-[1.7] mb-[18px] italic flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-corbeau/[0.06]">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-cream border border-corbeau/[0.08] shrink-0">
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="font-display font-bold text-[0.9rem] block leading-tight">
                    {t.name}
                  </span>
                  <span className="text-[0.72rem] text-eyebrow leading-tight">
                    {t.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
