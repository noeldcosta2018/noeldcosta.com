import FadeUp from "@/components/article/FadeUp";
import type { Locale } from "@/lib/locales";
import { translator } from "@/i18n";

/**
 * Intro for the Contact page: one short lede above the booking flow. The
 * eyebrow and the "30 minutes. No sales pitch." display line were removed
 * after the Hallmark audit (7 Nov 2026): the banner H1 already says it.
 */
export default function ContactHero({ locale }: { locale?: Locale }) {
  const tr = translator(locale);
  return (
    <FadeUp as="section" className="not-prose nd-contact-hero">
      <p className="nd-lede">
        {tr("Answer four quick questions, pick a time and you're booked. I'll tell you straight if I can help.")}
      </p>
    </FadeUp>
  );
}
