import Image from "next/image";
import Link from "next/link";

/**
 * End-of-article CTA. Deliberately understated: warm cream card (same tonal
 * family as the Hero float-cards), real headshot, two links. The tone is "if
 * this is your problem, we can talk" — not a high-contrast "BOOK NOW" slab.
 */
export default function CTASection({
  title = "Working on something similar?",
  body = "If this article touched on a programme you are live in right now, a 30-minute conversation usually gets further than another week of internal analysis.",
  primaryCta = "Talk about your project",
  primaryHref,
  secondaryCta = "See how I help",
  secondaryHref,
  localePrefix,
}: {
  title?: string;
  body?: string;
  primaryCta?: string;
  primaryHref?: string;
  secondaryCta?: string;
  secondaryHref?: string;
  localePrefix: string;
}) {
  const primary = primaryHref ?? `${localePrefix}/contact`;
  const secondary = secondaryHref ?? `${localePrefix}/about`;

  return (
    <section
      className="mt-16 rounded-[20px] border border-corbeau/[0.08] p-8 md:p-10 shadow-[0_8px_32px_rgba(14,16,32,0.06)]"
      style={{ background: "linear-gradient(135deg,#faf6f0,#fffdf9)" }}
    >
      <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
        <div className="flex-shrink-0">
          <div
            className="relative w-20 h-20 md:w-[104px] md:h-[104px] rounded-xl overflow-hidden border border-corbeau/[0.08]"
            style={{ background: "#fff" }}
          >
            <Image
              src="/headshot.png"
              alt="Noel D'Costa"
              fill
              sizes="104px"
              className="object-cover object-top"
            />
          </div>
        </div>
        <div className="flex-1">
          <p className="font-mono text-[0.68rem] font-medium tracking-[2px] uppercase text-papaya mb-3">
            Next step
          </p>
          <h3 className="font-display font-black text-corbeau text-[1.6rem] md:text-[1.9rem] tracking-[-0.03em] leading-[1.15] mb-4 max-w-[30rem]">
            {title}
          </h3>
          <p className="text-night leading-[1.7] text-[1rem] mb-7 max-w-[36rem]">
            {body}
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <Link
              href={primary}
              className="inline-flex items-center gap-1.5 bg-papaya text-corbeau px-7 py-3.5 rounded-[10px] font-bold text-[0.92rem] transition-all hover:bg-[#fdaa78] hover:-translate-y-px hover:shadow-[0_8px_30px_rgba(252,152,90,0.3)]"
            >
              {primaryCta} →
            </Link>
            <Link
              href={secondary}
              className="inline-flex items-center gap-1.5 bg-transparent text-corbeau px-7 py-3.5 rounded-[10px] font-semibold text-[0.92rem] border border-corbeau/[0.15] transition-all hover:border-corbeau/35 hover:-translate-y-px"
            >
              {secondaryCta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
