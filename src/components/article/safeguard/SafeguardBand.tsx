import FadeUp from "@/components/article/FadeUp";

/**
 * Full-width divider band for the "I safeguard your investment" quote.
 * Reuses the home page CTABanner.tsx treatment verbatim — same papaya
 * (#fc985a) to canyon (#e2826b) 135° gradient, same faint grid overlay,
 * same mono eyebrow + dot pattern, same display font for the headline.
 *
 * Acts as a visual chapter break between "Programmes that taught me"
 * and "What clients say" so the page stops feeling like one long
 * column of text. No CTA buttons (this is a quote, not a CTA), and
 * no hover effects (the band is a divider, not interactive).
 */
export default function SafeguardBand() {
  return (
    <FadeUp as="section" className="not-prose my-14">
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#fc985a 0%,#e2826b 100%)",
          padding: "clamp(2.5rem,5vw,3.5rem) clamp(1.75rem,4vw,3rem)",
        }}
      >
        {/* Faint grid overlay — identical pattern + opacity to CTABanner. */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.1,
            backgroundImage:
              "linear-gradient(rgba(14,16,32,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(14,16,32,0.5) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative">
          <p className="font-mono text-[0.68rem] font-semibold tracking-[2.5px] uppercase text-corbeau mb-4 flex items-center gap-2">
            <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-corbeau" />
            My commitment
          </p>
          <p
            className="font-display font-black text-corbeau tracking-[-0.025em] leading-[1.18] max-w-[640px]"
            style={{ fontSize: "clamp(1.35rem,2.6vw,1.85rem)" }}
          >
            &ldquo;I safeguard your investment from the predictable
            mistakes that turn ERP programmes into business disasters.&rdquo;
          </p>
        </div>
      </div>
    </FadeUp>
  );
}
