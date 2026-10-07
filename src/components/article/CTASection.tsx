import Link from "next/link";
import type { Locale } from "@/lib/content";
import { translator } from "@/i18n";
import { localizeHref } from "@/lib/link-repair";
import { publicPrefixFromContentLocale } from "@/lib/locale-url";
import { CONTACT } from "@/data/site-menu";

const CALENDLY = "https://calendly.com/noeldcosta/30min";

/**
 * Closing call to action for articles: the primary site action (a 30-minute
 * call) and a route to the contact page. A highlighted statement tile, not a
 * full-width slab. With a locale, the text goes through the i18n dictionary
 * and internal links point at the translated page when published.
 */
export default function CTASection({
  eyebrow = "Next step",
  title = "Running an ERP programme right now?",
  body = "If this article touched on a programme you are live in right now, a 30-minute conversation usually gets further than another week of internal analysis.",
  primaryCta = "Book a 30-min call",
  primaryHref = CALENDLY,
  secondaryCta = "Discuss your project",
  secondaryHref = CONTACT,
  locale = "en",
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  primaryCta?: string;
  primaryHref?: string;
  secondaryCta?: string;
  secondaryHref?: string;
  locale?: Locale;
}) {
  const tr = translator(locale);
  const prefix = publicPrefixFromContentLocale(locale);
  const primaryExternal = /^https?:\/\//.test(primaryHref);
  return (
    <section
      className="nd-article-cta"
      data-heading-region="article-cta"
      aria-labelledby="nd-article-cta-title"
    >
      <p className="nd-eyebrow">{tr(eyebrow)}</p>
      <h2 id="nd-article-cta-title" className="nd-display nd-article-cta-title">
        {tr(title)}
      </h2>
      <p className="nd-lede">{tr(body)}</p>
      <div className="nd-actions">
        {primaryExternal ? (
          <a
            href={primaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="nd-btn nd-btn-primary magnetic"
          >
            {tr(primaryCta)} <span aria-hidden="true">→</span>
          </a>
        ) : (
          <Link href={localizeHref(prefix, primaryHref)} className="nd-btn nd-btn-primary magnetic">
            {tr(primaryCta)} <span aria-hidden="true">→</span>
          </Link>
        )}
        <Link href={localizeHref(prefix, secondaryHref)} className="nd-btn nd-btn-secondary">
          {tr(secondaryCta)}
        </Link>
      </div>
    </section>
  );
}
