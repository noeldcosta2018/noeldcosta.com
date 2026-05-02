import Image from "next/image";
import Link from "next/link";

/**
 * Combined end-of-article author + advisory CTA card.
 *
 * Layout: two columns on md+, stacked on mobile.
 *   Left  → headshot, "Written by" eyebrow, name, bio, secondary links
 *   Right → CTA headline, body, primary + secondary buttons
 *
 * Visual: white/paper background, 2px papaya border, papaya top-stripe
 * so it reads as a brand card without being as heavy as a full orange fill.
 */
export default function AuthorBox({
  localePrefix,
  ctaTitle = "Running an ERP programme right now?",
  ctaBody = "If this article touched on a programme you are live in right now, a 30-minute conversation usually gets further than another week of internal analysis.",
}: {
  localePrefix: string;
  ctaTitle?: string;
  ctaBody?: string;
}) {
  return (
    <section
      className="mt-16 rounded-[20px] overflow-hidden border-2 border-papaya shadow-[0_12px_48px_rgba(252,152,90,0.18)]"
      style={{ background: "#fffdf9" }}
    >
      {/* Papaya top accent stripe */}
      <div className="h-1 w-full bg-papaya" />

      <div className="flex flex-col md:flex-row">
        {/* ── Left: author identity ── */}
        <div className="flex-1 p-8 md:p-10 md:border-r border-papaya/20">
          <div className="flex items-center gap-4 mb-5">
            <div className="relative w-[72px] h-[72px] rounded-xl overflow-hidden border-2 border-papaya/40 flex-shrink-0">
              <Image
                src="/images/headshot.png"
                alt="Noel D'Costa"
                fill
                sizes="72px"
                className="object-cover object-top"
              />
            </div>
            <div>
              <p className="font-mono text-[0.65rem] font-medium tracking-[2.2px] uppercase text-papaya mb-1">
                Written by
              </p>
              <h3 className="font-display font-black text-corbeau text-[1.25rem] tracking-[-0.03em] leading-[1.1]">
                Noel D&apos;Costa
              </h3>
            </div>
          </div>

          <p className="text-night leading-[1.72] text-[0.95rem] mb-6 max-w-[34rem]">
            25 years across SAP and Oracle ERP programmes in aviation,
            government, finance, retail, and manufacturing. Finance background.
            I help leadership teams scope transformations honestly, recover
            programmes in trouble, and build systems that survive their first
            year in production.
          </p>

          {/* Secondary mono links */}
          <div className="flex flex-wrap items-center gap-x-1 gap-y-1 font-mono text-[0.68rem] uppercase tracking-[1.6px]">
            <Link
              href={`${localePrefix}/about`}
              className="px-2 py-1 text-corbeau/60 hover:text-papaya transition-colors rounded-md"
            >
              About Noel
            </Link>
            <span aria-hidden className="text-corbeau/25">·</span>
            <a
              href="https://www.linkedin.com/in/noeldcosta/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 text-corbeau/60 hover:text-papaya transition-colors rounded-md"
            >
              LinkedIn
            </a>
            <span aria-hidden className="text-corbeau/25">·</span>
            <a
              href="https://www.youtube.com/@NoelDCostaERPAI"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 text-corbeau/60 hover:text-papaya transition-colors rounded-md"
            >
              YouTube
            </a>
          </div>
        </div>

        {/* ── Right: advisory CTA — white with orange left border ── */}
        <div
          className="flex-1 p-8 md:p-10 flex flex-col justify-center md:border-l-4 md:border-l-papaya"
          style={{ background: "#ffffff" }}
        >
          <h3 className="font-display font-black text-corbeau text-[1.35rem] md:text-[1.55rem] tracking-[-0.03em] leading-[1.15] mb-4">
            {ctaTitle}
          </h3>
          <p className="text-night leading-[1.72] text-[0.97rem] mb-7 max-w-[30rem]">
            {ctaBody}
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <a
              href="https://calendly.com/noeldcosta/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-papaya hover:bg-[#fda66e] text-corbeau px-7 py-3.5 rounded-[10px] font-display font-bold text-[0.92rem] transition-all hover:-translate-y-px shadow-[0_4px_18px_rgba(252,152,90,0.30)] hover:shadow-[0_8px_28px_rgba(252,152,90,0.45)]"
            >
              Book a 30-min call
              <span aria-hidden className="text-[1.1em] leading-none">→</span>
            </a>

            <Link
              href={`${localePrefix}/category/case-studies`}
              className="inline-flex items-center gap-2 bg-transparent text-corbeau px-7 py-3.5 rounded-[10px] font-semibold text-[0.92rem] border-2 border-papaya/40 hover:border-papaya hover:bg-papaya/5 transition-all hover:-translate-y-px"
            >
              See case studies
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
