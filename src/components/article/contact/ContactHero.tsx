import FadeUp from "@/components/article/FadeUp";
import type { Locale } from "@/lib/locales";
import { translator } from "@/i18n";

/**
 * Hero for the Contact page: eyebrow, one display line, a short lede.
 * The booking flow does the heavy lifting below.
 */
export default function ContactHero({ locale }: { locale?: Locale }) {
  const tr = translator(locale);
  return (
    <FadeUp as="section" className="not-prose nd-contact-hero">
      <p className="nd-eyebrow">{tr("Get in touch")}</p>
      <p className="nd-display line">
        {tr("30 minutes.")} <span className="nd-hl">{tr("No sales pitch.")}</span>
      </p>
      <p className="nd-lede">
        {tr("Answer four quick questions, pick a time and you're booked. I'll tell you straight if I can help.")}
      </p>
    </FadeUp>
  );
}
