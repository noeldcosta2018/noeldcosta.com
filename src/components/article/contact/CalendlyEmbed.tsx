"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Calendly inline-widget loader, deliberately lazy.
 *
 * Triggers whichever fires first:
 *   - The user moves their mouse / taps / scrolls inside the page
 *     (signal of intent — they're engaging with content)
 *   - 2 seconds elapse (gives them a moment of quiet first)
 *
 * Before then, renders a static skeleton with a button fallback that
 * deep-links to Calendly directly. That covers the user who's on a
 * slow connection or who blocks third-party scripts.
 *
 * The widget itself is heavy (~80 KB script + iframe). Lazy-loading
 * keeps it out of the initial JS budget so the Contact page can hold
 * an LCP under 1.5 s.
 *
 * Respects prefers-reduced-motion via the global CSS guard — but the
 * Calendly iframe itself is not animated by us; reduced-motion is
 * Calendly's responsibility once it loads.
 */

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget(opts: {
        url: string;
        parentElement: HTMLElement;
        prefill?: Record<string, unknown>;
        utm?: Record<string, unknown>;
      }): void;
    };
  }
}

const CALENDLY_URL = "https://calendly.com/noeldcosta/30min";
const SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";
const STYLE_HREF = "https://assets.calendly.com/assets/external/widget.css";

export default function CalendlyEmbed() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Step 1: decide when to start the load.
  useEffect(() => {
    if (shouldLoad) return;

    const triggers: Array<keyof WindowEventMap> = [
      "mousemove",
      "scroll",
      "touchstart",
      "keydown",
    ];
    const onActivity = () => setShouldLoad(true);
    triggers.forEach((t) =>
      window.addEventListener(t, onActivity, { passive: true, once: true })
    );
    const timer = window.setTimeout(() => setShouldLoad(true), 2000);

    return () => {
      triggers.forEach((t) => window.removeEventListener(t, onActivity));
      window.clearTimeout(timer);
    };
  }, [shouldLoad]);

  // Step 2: once shouldLoad flips true, inject Calendly's script + stylesheet
  // and call initInlineWidget on our container. Idempotent — re-uses an
  // existing <script> tag if one is already on the page (e.g. soft nav).
  useEffect(() => {
    if (!shouldLoad || !containerRef.current) return;

    const tryInit = () => {
      if (window.Calendly && containerRef.current) {
        // Calendly mutates the container; clear any prior children first
        // so a re-init doesn't stack widgets.
        containerRef.current.innerHTML = "";
        window.Calendly.initInlineWidget({
          url: CALENDLY_URL,
          parentElement: containerRef.current,
        });
        return true;
      }
      return false;
    };

    if (tryInit()) return;

    // Append style once
    if (!document.querySelector(`link[href="${STYLE_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = STYLE_HREF;
      document.head.appendChild(link);
    }

    // Append script once, init on load
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", tryInit, { once: true });
      // If it already loaded, poll once
      window.setTimeout(tryInit, 50);
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", tryInit, { once: true });
    document.body.appendChild(script);
  }, [shouldLoad]);

  return (
    <div className="not-prose my-8">
      {/* Skeleton sits behind the widget. Once Calendly mounts, its iframe
          covers everything. If JS fails / user blocks the script, the
          fallback CTA stays visible. */}
      <div className="relative rounded-2xl border border-corbeau/10 bg-paper overflow-hidden min-h-[640px]">
        {!shouldLoad && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="font-mono text-[0.7rem] tracking-[2px] uppercase text-eyebrow">
              Loading scheduler…
            </p>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-papaya hover:bg-[#fdaa78] text-corbeau font-bold text-[0.92rem] px-5 py-3 rounded-lg no-underline transition-colors shadow-[0_2px_12px_rgba(252,152,90,0.25)]"
            >
              Book on Calendly →
            </a>
          </div>
        )}
        <div
          ref={containerRef}
          className="calendly-inline-widget"
          style={{ minWidth: "320px", height: "640px" }}
        />
      </div>
    </div>
  );
}
