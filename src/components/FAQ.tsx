/**
 * Homepage FAQ.
 *
 * Uses the same native <details>/<summary> accordion pattern as the blog
 * (see src/components/mdx/MdxBody.tsx details + summary renderers). No
 * React state, no client-side JS — the browser handles the open/close.
 * Same border-divider style, same papaya hover/open background, same
 * plus-to-x icon rotation.
 *
 * Emits FAQPage JSON-LD so the questions are eligible for Google's FAQ
 * rich result. Mirrors PostPage.tsx's structured-data treatment for blog
 * FAQ blocks.
 */

import { type Locale } from "@/lib/locales";
import { getMessages } from "@/lib/i18n/useTranslation";

export default function FAQ({ locale = "en" }: { locale?: Locale }) {
  const m = getMessages(locale);
  const FAQS = m.faq.items;
  return (
    <section
      id="faq"
      className="bg-cream"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[760px] mx-auto">
        <div className="text-center mb-12">
          <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-3">
            {m.faq.eyebrow}
          </p>
          <h2
            className="font-display font-black tracking-[-0.04em] leading-[1.08] text-corbeau"
            style={{ fontSize: "clamp(1.75rem,3.5vw,2.25rem)" }}
          >
            {m.faq.h2}
          </h2>
        </div>

        {/* Native <details> accordion. Same Tailwind classes as the blog FAQ
            renderer in MdxBody.tsx so the visual treatment matches exactly. */}
        <div className="not-prose">
          {FAQS.map((faq, i) => (
            <details
              key={i}
              className={`group border-b border-corbeau/[0.08] py-2 ${
                i === 0 ? "border-t border-corbeau/[0.08]" : ""
              } [&_summary::-webkit-details-marker]:hidden [&_summary]:list-none`}
            >
              <summary
                role="button"
                className="flex items-start justify-between gap-4 cursor-pointer font-display font-bold text-corbeau text-[1.02rem] md:text-[1.1rem] tracking-[-0.02em] leading-[1.35] select-none -mx-3 px-3 py-3.5 rounded-lg transition-all duration-150 hover:bg-papaya hover:text-corbeau group-open:bg-papaya group-open:text-corbeau"
              >
                <span className="flex-1 py-0.5">{faq.q}</span>
                <span
                  aria-hidden
                  className="mt-[3px] flex-shrink-0 w-[22px] h-[22px] rounded-full border border-current flex items-center justify-center opacity-60 text-[0.85rem] leading-none transition-all duration-200 group-open:rotate-45 group-open:opacity-90"
                >
                  +
                </span>
              </summary>
              <p className="text-night text-[0.92rem] leading-[1.7] mt-2 mb-4 px-3">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* FAQPage JSON-LD so Google can show these as a rich result.
          Mirrors the treatment in src/components/PostPage.tsx for blog
          FAQ blocks. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: f.a,
              },
            })),
          }),
        }}
      />
    </section>
  );
}
