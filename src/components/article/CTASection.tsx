import Link from "next/link";

/**
 * End-of-article CTA. Premium editorial styling — dark corbeau block with
 * papaya label, single primary action, single secondary link. No forms, no
 * modal triggers. Copy stays specific to the consulting offer rather than
 * generic "sign up for our newsletter" filler.
 */
export default function CTASection({
  title = "Working on something similar?",
  body = "I help leadership teams scope, recover, and finish ERP programmes. If this article touched on a problem you are live in right now, a 30-minute conversation usually gets further than another week of internal analysis.",
  primaryCta = "Book a working session",
  primaryHref,
  secondaryCta = "Read more insights",
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
  const primary = primaryHref ?? `${localePrefix}/about`;
  const secondary = secondaryHref ?? `${localePrefix}/`;

  return (
    <section className="mt-14 rounded-[16px] bg-corbeau text-bone p-8 md:p-12 relative overflow-hidden">
      <span
        aria-hidden
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-papaya/10 blur-3xl pointer-events-none"
      />
      <div className="relative">
        <p className="font-mono text-[0.62rem] font-semibold tracking-[2.5px] uppercase text-papaya mb-4">
          Next step
        </p>
        <h3 className="font-display font-bold text-bone text-2xl md:text-[1.85rem] tracking-[-0.015em] leading-[1.2] mb-4 max-w-[32rem]">
          {title}
        </h3>
        <p className="text-bone/80 leading-[1.65] text-[1rem] mb-7 max-w-[38rem]">
          {body}
        </p>
        <div className="flex flex-wrap gap-4 items-center">
          <Link
            href={primary}
            className="inline-flex items-center gap-2 bg-papaya text-corbeau px-6 py-3 rounded-[6px] font-semibold font-display text-[0.95rem] tracking-[-0.01em] hover:bg-bone transition-colors"
          >
            {primaryCta}
            <span aria-hidden>→</span>
          </Link>
          <Link
            href={secondary}
            className="font-mono text-[0.72rem] uppercase tracking-[1.6px] text-bone/80 hover:text-papaya border-b border-bone/30 hover:border-papaya pb-0.5 transition-colors"
          >
            {secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
