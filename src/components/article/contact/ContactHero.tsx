import FadeUp from "@/components/article/FadeUp";

/**
 * Minimal hero for the Contact page. One sentence + an ambient warm
 * radial behind the text. Keeps the page quiet — Calendly does the
 * heavy lifting below.
 *
 * The gradient uses existing tokens (papaya + canyon at low opacity)
 * fading into bone. No new colours.
 */
export default function ContactHero() {
  return (
    <FadeUp as="section" className="not-prose my-8 relative">
      {/* Ambient warm radial — sits behind the headline */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(252,152,90,0.10), transparent 55%), radial-gradient(ellipse at 70% 60%, rgba(226,130,107,0.06), transparent 55%)",
        }}
      />

      <p className="font-mono text-[0.72rem] tracking-[2.5px] uppercase text-papaya mb-3">
        Get in touch
      </p>
      <p
        className="font-display font-black text-corbeau tracking-[-0.025em] leading-[1.1] max-w-[640px]"
        style={{ fontSize: "clamp(1.85rem,3.6vw,2.6rem)" }}
      >
        30 minutes.{" "}
        <span className="cc-emphasis-italic">No sales pitch.</span>
      </p>
      <p className="mt-5 text-night text-[1rem] leading-[1.65] max-w-[560px]">
        Pick a slot on my calendar. Tell me what&apos;s going on with your ERP
        or AI programme. I&apos;ll tell you straight if I can help.
      </p>
    </FadeUp>
  );
}
