import FadeUp from "@/components/article/FadeUp";

/**
 * Hero block for the About / story page. Sits below the H1 and excerpt
 * that MdxPageLayout already renders. Adds two CTAs (primary papaya
 * Calendly, secondary corbeau-outline for the credentials pack) and
 * the headshot on the right.
 *
 * Designed to read as a CFO-grade introduction: a real picture, real
 * book-a-call affordance, no marketing fluff. Uses existing tokens
 * only.
 */
export default function AboutHero() {
  return (
    <FadeUp as="section" className="not-prose mb-10">
      <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
        {/* CTAs */}
        <div className="flex flex-col gap-3 flex-1 order-2 md:order-1">
          <a
            href="https://calendly.com/noeldcosta/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-papaya hover:bg-[#fdaa78] text-corbeau font-bold text-[0.92rem] px-5 py-3 rounded-lg no-underline transition-colors shadow-[0_2px_12px_rgba(252,152,90,0.25)]"
          >
            Book a 30-min call
            <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href="mailto:solutions@noeldcosta.com"
            className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-cream text-corbeau border border-corbeau/25 hover:border-corbeau/50 font-semibold text-[0.92rem] px-5 py-3 rounded-lg no-underline transition-colors"
          >
            Email me directly
          </a>
        </div>

        {/* Headshot */}
        <div className="shrink-0 order-1 md:order-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/headshot.png"
            alt="Portrait of Noel D'Costa"
            className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] rounded-2xl object-cover border-2 border-papaya/60 shadow-[0_8px_28px_rgba(14,16,32,0.12)]"
          />
        </div>
      </div>
    </FadeUp>
  );
}
