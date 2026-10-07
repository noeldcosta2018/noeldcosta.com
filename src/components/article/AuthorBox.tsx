import Link from "next/link";
import type { Locale } from "@/lib/content";
import { translator } from "@/i18n";
import { localizeHref } from "@/lib/link-repair";
import { publicPrefixFromContentLocale } from "@/lib/locale-url";
import { ABOUT, LINKEDIN, YOUTUBE } from "@/data/site-menu";

/**
 * End-of-article author card: portrait, name, short bio and profile links.
 * The advisory call to action lives in CTASection, after related reading.
 * Server component: on translated pages the text goes through the i18n
 * dictionary and the About link points at the translated page when published.
 */
export default function AuthorBox({ locale = "en" }: { locale?: Locale }) {
  const tr = translator(locale);
  const prefix = publicPrefixFromContentLocale(locale);
  return (
    <section className="nd-author nd-card" data-heading-region="author">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="nd-author-photo"
        src="/media/noel-headshot.webp"
        alt="Noel D'Costa"
        width={96}
        height={96}
        loading="lazy"
      />
      <div>
        <p className="nd-label">{tr("Written by")}</p>
        <h3 className="nd-author-name">Noel D&apos;Costa</h3>
        <p className="nd-author-bio">
          {tr(
            "25 years across SAP and Oracle ERP programmes in aviation, government, finance, retail, and manufacturing. Finance background. I help leadership teams scope transformations honestly, recover programmes in trouble, and build systems that survive their first year in production.",
          )}
        </p>
        <div className="nd-author-links">
          <Link href={localizeHref(prefix, ABOUT)}>{tr("About Noel")}</Link>
          <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={YOUTUBE} target="_blank" rel="noopener noreferrer">
            YouTube
          </a>
        </div>
      </div>
    </section>
  );
}
