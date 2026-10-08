"use client";

import Link from "next/link";
import { useState } from "react";

export type Reference = { name: string; title: string; avatarUrl: string; quote: string };

/**
 * Recommendations that drift slowly sideways. The first copy of the list is the
 * real content; a second, hidden copy makes the loop seamless. Movement stops
 * on hover, on keyboard focus and with the pause button, and never starts for
 * visitors who prefer reduced motion (they get a plain scrolling row).
 */
export default function ReferencesMarquee({
  references,
  title,
  link,
  pauseLabel,
  playLabel,
  quoteLang,
}: {
  references: Reference[];
  title: string;
  link: { label: string; href: string };
  pauseLabel: string;
  playLabel: string;
  /** "en" on translated pages: the recommendations are quoted verbatim in English. */
  quoteLang?: string;
}) {
  const [paused, setPaused] = useState(false);
  const card = (r: Reference) => (
    <li key={r.name} className="nd-ref">
      <figure>
        <blockquote lang={quoteLang}>
          <p>&ldquo;{r.quote}&rdquo;</p>
        </blockquote>
        <figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={r.avatarUrl} alt="" width={44} height={44} loading="lazy" decoding="async" />
          <span>
            <b>{r.name}</b>
            <span lang={quoteLang}>{r.title}</span>
          </span>
        </figcaption>
      </figure>
    </li>
  );

  return (
    <section className="nd-refs" aria-labelledby="refs-title">
      <div className="nd-refs-head">
        <h3 id="refs-title" className="nd-display nd-ai-projects-title">
          {title}
        </h3>
        <div className="nd-refs-tools">
          <button type="button" className="nd-refs-toggle" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
            {paused ? (
              <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor" />
              </svg>
            )}
            {paused ? playLabel : pauseLabel}
          </button>
          <Link className="nd-textlink" href={link.href}>
            {link.label} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      <div className={`nd-refs-viewport${paused ? " is-paused" : ""}`}>
        <div className="nd-refs-track" style={{ ["--refs-duration" as string]: `${references.length * 12}s` }}>
          <ul className="nd-refs-set">{references.map(card)}</ul>
          <ul className="nd-refs-set nd-refs-clone" aria-hidden="true" inert>
            {references.map(card)}
          </ul>
        </div>
      </div>
    </section>
  );
}
