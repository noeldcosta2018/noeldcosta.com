import FadeUp from "@/components/article/FadeUp";

/**
 * Hero for the Contact page: eyebrow, one display line, a short lede.
 * Calendly does the heavy lifting below.
 */
export default function ContactHero() {
  return (
    <FadeUp as="section" className="not-prose nd-contact-hero">
      <p className="nd-eyebrow">Get in touch</p>
      <p className="nd-display line">
        30 minutes. <span className="nd-hl">No sales pitch.</span>
      </p>
      <p className="nd-lede">
        Pick a slot on my calendar. Tell me what&apos;s going on with your ERP
        or AI programme. I&apos;ll tell you straight if I can help.
      </p>
    </FadeUp>
  );
}
