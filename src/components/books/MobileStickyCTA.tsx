"use client";

import { useEffect, useState } from "react";

/**
 * Mobile-only sticky CTA bar.
 *
 * Appears once the visitor has scrolled past the Featured book's email
 * form without converting. The single button smooth-scrolls back to the
 * Featured book anchor (#book-{slug}). Dismissible via the × button —
 * dismissal is persisted in sessionStorage so the bar does not re-appear
 * for the rest of the session.
 *
 * Visibility logic:
 *   - Hidden on desktop (md:hidden).
 *   - Hidden until the IntersectionObserver fires "no longer visible" on
 *     the Featured form sentinel.
 *   - Hidden permanently for the session once dismissed.
 *
 * Respects prefers-reduced-motion: the scroll uses smooth behaviour
 * unless the user has reduced motion turned on, in which case it jumps.
 */

const DISMISS_KEY = "books:mobile-cta-dismissed";

export default function MobileStickyCTA({
  anchorId,
  observeId,
  label = "Send me the free book →",
}: {
  /** Element ID to scroll to when clicked, e.g. "book-sap-careers-200k-ai-era". */
  anchorId: string;
  /** Element ID to observe for the "scrolled past" trigger. Defaults to anchorId. */
  observeId?: string;
  label?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") {
        setDismissed(true);
        return;
      }
    } catch {
      // sessionStorage can throw in private windows; fall through.
    }

    const targetId = observeId ?? anchorId;
    const target = document.getElementById(targetId);
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Show the bar once the target has scrolled out the top of the
          // viewport (boundingClientRect.bottom < 0). Hide it again if the
          // visitor scrolls back up to the form.
          const out = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
          setVisible(out);
        }
      },
      { threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [anchorId, observeId]);

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const el = document.getElementById(anchorId);
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  function onDismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }

  if (dismissed || !visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-bone border-t border-corbeau/[0.1] py-3 px-4 md:hidden shadow-[0_-4px_16px_rgba(14,16,32,0.06)]"
      role="region"
      aria-label="Quick link back to the featured book"
    >
      <div className="flex items-center gap-3 max-w-[760px] mx-auto">
        <a
          href={`#${anchorId}`}
          onClick={onClick}
          className="flex-1 inline-flex items-center justify-center bg-papaya text-corbeau font-bold text-[0.92rem] px-4 py-3 rounded-[10px] no-underline transition-all hover:bg-[#fb8843]"
        >
          {label}
        </a>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-corbeau/[0.15] text-corbeau hover:bg-corbeau/[0.04] transition-colors"
        >
          <span aria-hidden className="text-[1.1rem] leading-none">
            ×
          </span>
        </button>
      </div>
    </div>
  );
}
