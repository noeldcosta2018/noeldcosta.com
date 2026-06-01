import Image from "next/image";
import Link from "next/link";
import { type Locale } from "@/lib/locales";
import { getMessages } from "@/lib/i18n/useTranslation";

/**
 * Combined end-of-article author + advisory CTA card.
 *
 * Layout: two columns on md+, stacked on mobile.
 *   Left  → headshot, "Written by" eyebrow, name, bio, secondary links
 *   Right → CTA headline, body, primary + secondary buttons
 *
 * Visual: white/paper background, 2px papaya border, papaya top-stripe
 * so it reads as a brand card without being as heavy as a full orange fill.
 *
 * locale prop drives Block 6c i18n. ctaTitle / ctaBody props remain
 * available for callers that want to override the per-article CTA; when
 * omitted, the defaults come from MESSAGES so they translate.
 */
export default function AuthorBox({
  locale = "en",
  ctaTitle,
  ctaBody,
}: {
  locale?: Locale;
  ctaTitle?: string;
  ctaBody?: string;
}) {
  const m = getMessages(locale);
  const resolvedCtaTitle = ctaTitle ?? m.article.ctaWorkingOnSomething;
  const resolvedCtaBody = ctaBody ?? m.article.ctaWorkingBody;
  return (
    <section
      className="mt-16 rounded-[20px] overflow-hidden border-2 border-papaya shadow-[0_12px_48px_rgba(252,152,90,0.18)] transition-shadow duration-500 hover:shadow-[0_20px_60px_rgba(252,152,90,0.28)]"
      style={{ background: "#fffdf9" }}
    >
      {/* Papaya top accent stripe */}
      <div className="h-1 w-full bg-papaya" />

      <div className="flex flex-col md:flex-row">
        {/* ── Left: author identity ── */}
        <div className="flex-1 p-8 md:p-10 md:border-e border-papaya/20">
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
              <p className="font-mono text-[0.72rem] font-medium tracking-[2.2px] uppercase text-papaya mb-1">
                {m.article.writtenByLabel}
              </p>
              {/* "Noel D'Costa" is a personal name — proper noun, stays inline. */}
              <h3 className="font-display font-black text-corbeau text-[1.25rem] tracking-[-0.03em] leading-[1.1]">
                Noel D&apos;Costa
              </h3>
            </div>
          </div>

          <p className="text-night leading-[1.72] text-[0.95rem] mb-6 max-w-[34rem]">
            {m.article.authorBio}
          </p>

          {/* Secondary mono links */}
          <div className="flex flex-wrap items-center gap-x-1 gap-y-1 font-mono text-[0.72rem] uppercase tracking-[1.6px]">
            <Link
              href="/about"
              className="px-2 py-1 text-corbeau/60 hover:text-papaya transition-colors rounded-md"
            >
              {m.article.aboutNoelLink}
            </Link>
            <span aria-hidden className="text-corbeau/25">·</span>
            <a
              href="https://www.linkedin.com/in/noeldcosta/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 text-corbeau/60 hover:text-papaya transition-colors rounded-md"
            >
              {m.article.linkedinLink}
            </a>
            <span aria-hidden className="text-corbeau/25">·</span>
            <a
              href="https://www.youtube.com/@NoelDCostaERPAI"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 text-corbeau/60 hover:text-papaya transition-colors rounded-md"
            >
              {m.article.youtubeLink}
            </a>
          </div>
        </div>

        {/* ── Right: advisory CTA — white with orange left border ── */}
        <div
          className="flex-1 p-8 md:p-10 flex flex-col justify-center md:border-s-4 md:border-s-papaya"
          style={{ background: "#ffffff" }}
        >
          <h3 className="font-display font-black text-corbeau text-[1.35rem] md:text-[1.55rem] tracking-[-0.03em] leading-[1.15] mb-4">
            {resolvedCtaTitle}
          </h3>
          <p className="text-night leading-[1.72] text-[0.97rem] mb-7 max-w-[30rem]">
            {resolvedCtaBody}
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <a
              href="https://calendly.com/noeldcosta/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-papaya hover:bg-[#fda66e] text-corbeau px-7 py-3.5 rounded-[10px] font-display font-bold text-[0.92rem] transition-all hover:-translate-y-px shadow-[0_4px_18px_rgba(252,152,90,0.30)] hover:shadow-[0_8px_28px_rgba(252,152,90,0.45)]"
            >
              {m.article.primaryCtaBookCall}
              <span aria-hidden className="text-[1.1em] leading-none inline-block rtl:rotate-180">→</span>
            </a>

            <Link
              href="/case-studies"
              className="inline-flex items-center gap-2 bg-transparent text-corbeau px-7 py-3.5 rounded-[10px] font-semibold text-[0.92rem] border-2 border-papaya/40 hover:border-papaya hover:bg-papaya/5 transition-all hover:-translate-y-px"
            >
              {m.article.secondaryCtaCaseStudies}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
