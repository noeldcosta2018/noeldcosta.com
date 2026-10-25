import type { ReactNode } from "react";
import Link from "next/link";
import FadeUp from "@/components/article/FadeUp";

type Tone = "dark" | "light";

/**
 * In-article product reference.
 *   - dark: a dark island in both themes (ProjectCAPEX), with an optional
 *     product screenshot panel on the trailing edge and an optional logo mark
 *     set before the title, which then reads as the product's wordmark
 *   - light: a standard card that follows the active theme (ERPCV)
 *
 * The title is an independent H2 inside a named heading region so the
 * heading audit treats it as complementary content, not article outline.
 */
export default function ProductPromoCard({
  kicker,
  title,
  description,
  href,
  cta = "Learn more",
  external = false,
  tone = "light",
  image,
  logo,
}: {
  kicker: string;
  title: string;
  description: string;
  href: string;
  cta?: string;
  external?: boolean;
  tone?: Tone;
  image?: string;
  /** Decorative mark shown before the title (the title stays the accessible name). */
  logo?: ReactNode;
}) {
  const isDark = tone === "dark";
  const hasImage = isDark && !!image;

  const domainHint = (() => {
    try {
      return new URL(href).host.replace(/^www\./, "");
    } catch {
      return href;
    }
  })();

  const ctaInner = (
    <>
      {cta}
      <span aria-hidden="true">→</span>
    </>
  );

  return (
    <FadeUp>
      <aside
        data-heading-region="product-promo"
        className={[
          "nd-promo",
          isDark ? "nd-promo-dark" : "nd-glow",
          hasImage ? "has-image" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {!isDark && <span className="nd-card-band" aria-hidden="true" />}
        <div className="nd-promo-copy">
          <p className="nd-promo-kicker">{kicker}</p>
          {logo ? (
            <h2 className="nd-promo-title nd-promo-lockup">
              <span className="nd-promo-logo">{logo}</span>
              {title}
            </h2>
          ) : (
            <h2 className="nd-promo-title">{title}</h2>
          )}
          <p className="nd-promo-text">{description}</p>
          <div className="nd-promo-actions">
            {external ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="nd-btn nd-btn-primary magnetic"
              >
                {ctaInner}
              </a>
            ) : (
              <Link href={href} className="nd-btn nd-btn-primary magnetic">
                {ctaInner}
              </Link>
            )}
            <span className="nd-promo-domain">{domainHint}</span>
          </div>
        </div>
        {hasImage && (
          <div
            className="nd-promo-media"
            aria-hidden="true"
            style={{ backgroundImage: `url('${image}')` }}
          />
        )}
      </aside>
    </FadeUp>
  );
}
