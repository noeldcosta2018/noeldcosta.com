import Link from "next/link";
import type { ReactNode } from "react";
import Doodle, { HandNote } from "@/components/doodles/Doodle";
import LoopVideo from "./LoopVideo";

export type Crumb = { label: string; href?: string };

/**
 * Section banner (MDLBeast PageFrame header): eyebrow breadcrumb, uppercase
 * display title, lede, optional media. Media options:
 * - portrait: transparent cutout that drifts with the cursor
 * - video: a muted B-roll loop behind the scrim
 * - cover: a full-bleed image (article hero) behind the scrim
 */
export default function PageBanner({
  crumbs,
  title,
  highlight,
  lede,
  portrait,
  video,
  cover,
  long,
  compact,
  children,
  label,
  crumbLang,
  portraitNote,
}: {
  crumbs: Crumb[];
  title: ReactNode;
  highlight?: ReactNode;
  lede?: ReactNode;
  portrait?: { src: string; width: number; height: number };
  video?: { src: string; poster: string };
  cover?: { src: string; alt?: string };
  long?: boolean;
  compact?: boolean;
  children?: ReactNode;
  label?: string;
  /** Set to "en" when the crumb labels are English on a translated page. */
  crumbLang?: string;
  /** A few handwritten words with an arrow to the portrait (desktop, where the portrait shows). */
  portraitNote?: string;
}) {
  return (
    <section className={`nd-banner${compact ? " compact" : ""}`} aria-label={label}>
      <div className="bg" aria-hidden="true" />
      {video && <LoopVideo className="media loop" src={video.src} poster={video.poster} />}
      {cover && (
        // The page's largest image (article heroes): high priority, so on slow phones
        // it no longer waits behind the scripts.
        // eslint-disable-next-line @next/next/no-img-element
        <img className="media cover" src={cover.src} alt={cover.alt || label || ""} aria-hidden="true" fetchPriority="high" />
      )}
      <div className="scrim" aria-hidden="true" />
      <div className="nd-spotlight" aria-hidden="true" />
      {portrait && (
        // Desktop only: phones get a 1px placeholder, so the portrait is not downloaded there.
        <picture>
          <source media="(max-width: 1023px)" srcSet="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
          <img
            className="media parallax"
            data-depth="10"
            src={portrait.src}
            width={portrait.width}
            height={portrait.height}
            alt="Noel D'Costa"
            aria-hidden="true"
          />
        </picture>
      )}
      {portrait && portraitNote && (
        <HandNote text={portraitNote} className="nd-banner-note">
          <Doodle name="arrow-swoop" />
        </HandNote>
      )}
      <div className="wash nd-grid-wash" aria-hidden="true" />
      <div className="nd-banner-inner nd-reveal">
        <nav aria-label="Breadcrumb" className="nd-crumb" lang={crumbLang}>
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`} style={{ display: "contents" }}>
              {i > 0 && (
                <span className="sep" aria-hidden="true">
                  /
                </span>
              )}
              {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            </span>
          ))}
        </nav>
        <h1 className={`nd-display${long ? " long" : ""}`}>
          {title}
          {highlight && (
            <>
              {" "}
              <span className="nd-hl">{highlight}</span>
            </>
          )}
        </h1>
        {lede && <p className="nd-lede">{lede}</p>}
        {children}
      </div>
    </section>
  );
}
