"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type Reference = { name: string; title: string; avatarUrl: string; quote: string; full: string[] };

/**
 * Recommendations that drift slowly sideways. The first copy of the list is the
 * real content; a second copy (hidden from assistive technology, out of the tab
 * order) makes the loop seamless. Movement stops on hover, on keyboard focus,
 * with the pause button and while a recommendation is open, and never starts
 * for visitors who prefer reduced motion (they get a plain scrolling row).
 * Clicking a card opens the full recommendation in a dialog.
 */
export default function ReferencesMarquee({
  references,
  title,
  link,
  pauseLabel,
  playLabel,
  readLabel,
  closeLabel,
  quoteLang,
}: {
  references: Reference[];
  title: string;
  link: { label: string; href: string };
  pauseLabel: string;
  playLabel: string;
  readLabel: string;
  closeLabel: string;
  /** "en" on translated pages: the recommendations are quoted verbatim in English. */
  quoteLang?: string;
}) {
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState<Reference | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const show = (r: Reference, from: HTMLElement) => {
    returnFocus.current = from;
    setOpen(r);
  };
  const hide = () => {
    setOpen(null);
    returnFocus.current?.focus({ preventScroll: true });
  };

  const card = (r: Reference, clone: boolean) => (
    <li key={r.name} className="nd-ref">
      {/* On translated pages the whole card is English: lang and direction set once. */}
      <figure lang={quoteLang}>
        <blockquote>
          <p>&ldquo;{r.quote}&rdquo;</p>
        </blockquote>
        <figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={r.avatarUrl} alt="" width={44} height={44} loading="lazy" decoding="async" />
          <span>
            <b>{r.name}</b>
            <span>{r.title}</span>
          </span>
        </figcaption>
        <span className="nd-ref-more" aria-hidden="true">
          {readLabel} <span>→</span>
        </span>
        <button
          type="button"
          className="nd-ref-open"
          tabIndex={clone ? -1 : undefined}
          aria-label={`${readLabel}: ${r.name}`}
          onClick={(e) => show(r, e.currentTarget)}
        />
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
      <div className={`nd-refs-viewport${paused || open ? " is-paused" : ""}`}>
        <div className="nd-refs-track" style={{ ["--refs-duration" as string]: `${references.length * 12}s` }}>
          <ul className="nd-refs-set">{references.map((r) => card(r, false))}</ul>
          <ul className="nd-refs-set nd-refs-clone" aria-hidden="true">
            {references.map((r) => card(r, true))}
          </ul>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="nd-ref-dialog"
        aria-labelledby="ref-dialog-name"
        onClose={() => open && hide()}
        onClick={(e) => e.target === e.currentTarget && hide()}
      >
        {open && (
          <div className="nd-ref-dialog-inner" lang={quoteLang}>
            <button type="button" className="x" aria-label={closeLabel} onClick={hide}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="who">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={open.avatarUrl} alt="" width={72} height={72} />
              <div>
                <b id="ref-dialog-name">{open.name}</b>
                <span>{open.title}</span>
              </div>
            </div>
            <blockquote>
              {open.full.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </blockquote>
            <Link className="nd-textlink" href={link.href} onClick={() => setOpen(null)}>
              {link.label} <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </dialog>
    </section>
  );
}
