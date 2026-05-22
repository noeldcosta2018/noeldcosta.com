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

const FAQS: { q: string; a: string }[] = [
  {
    q: "What does an engagement actually look like?",
    a: "Depends on what you need. If you're pre-implementation, I run a 4 to 6 week diagnostic. Current state, vendor selection, business case, programme structure. If you're mid-implementation and things are off, I step in for 90 days as Programme Director or Senior Advisor to the CIO. If you're post-go-live and AI is the next wave, I scope and lead 8 to 16 week AI builds on SAP BTP. Always direct involvement. I don't disappear after the kickoff.",
  },
  {
    q: "Are you available right now?",
    a: "Usually 4 to 8 weeks out. I take on two or three programmes at a time, max. If you have a hard deadline I can't meet, I'll tell you on the first call and either point you to someone else or we plan for the next window.",
  },
  {
    q: "How do you charge?",
    a: "Day rate or fixed-fee programme. Day rate for advisory and diagnostics. Fixed-fee for delivery work where the scope is clear. Numbers depend on the engagement. We discuss it on the first call. No surprises in writing later.",
  },
  {
    q: "Do you replace my SI partner or work alongside them?",
    a: "Either. Most often I sit on the client side as Programme Director and hold the SI accountable. Sometimes I replace a struggling SI mid-stream. Sometimes I'm there to make sure the SI doesn't oversell what they can deliver. Depends on what's already in place.",
  },
  {
    q: "Will you sign an NDA?",
    a: "Yes. Standard practice on day one. I work with regulated entities and government clients regularly. Confidentiality isn't a line item, it's the default.",
  },
  {
    q: "How is this different from McKinsey, BCG, or the Big 4?",
    a: "I'm one person, not a pyramid. The senior partner you meet is the senior partner who runs your programme. I have CIMA and AICPA, so I read your finances the same way your CFO does. And I've actually delivered the systems, not just produced slide decks about them. Big firms have their place. For ERP and AI delivery, you usually want the human who's done it before.",
  },
  {
    q: "Why personal brand and not a firm?",
    a: "I run Quantinoid LLC as the trading entity. The personal brand is intentional. My value is judgement and direct involvement, not a logo on a deck. If you hire a firm, you get whoever they assign. If you hire me, you get me.",
  },
];

export default function FAQ() {
  return (
    <section
      id="faq"
      className="bg-cream"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[760px] mx-auto">
        <div className="text-center mb-12">
          <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-3">
            [ Frequently asked questions ]
          </p>
          <h2
            className="font-display font-black tracking-[-0.04em] leading-[1.08] text-corbeau"
            style={{ fontSize: "clamp(1.75rem,3.5vw,2.25rem)" }}
          >
            What CFOs ask me first.
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
