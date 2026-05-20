"use client";

import { useEffect, useState } from "react";

/**
 * Calendly inline-widget loader, deliberately lazy.
 *
 * Triggers whichever fires first:
 *   - The user moves their mouse / taps / scrolls inside the page
 *   - 2 seconds elapse
 *
 * Implementation note: Calendly's widget.js auto-discovers any DOM
 * element with class "calendly-inline-widget" and a data-url
 * attribute when the script first runs. This is more reliable than
 * the manual initInlineWidget API (which we tried first — it had
 * timing issues where the script loaded before our container was
 * mounted, or React re-rendered after init and wiped the iframe).
 *
 * Sequence:
 *   1. Mount with the skeleton + fallback CTA (shouldLoad = false)
 *   2. After 2s or first interaction, set shouldLoad = true
 *   3. React renders the .calendly-inline-widget div
 *   4. Inject Calendly's stylesheet (once per session)
 *   5. Inject Calendly's script (once per session) — its onload
 *      auto-discovers our widget div and mounts the iframe
 *
 * Respects prefers-reduced-motion via global CSS guard.
 */

const CALENDLY_URL = "https://calendly.com/noeldcosta/30min";
const SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";
const STYLE_HREF = "https://assets.calendly.com/assets/external/widget.css";

export default function CalendlyEmbed() {
  const [shouldLoad, setShouldLoad] = useState(false);

  // Decide when to load.
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

  // Inject script + stylesheet once shouldLoad flips true. The script
  // auto-discovers any .calendly-inline-widget[data-url] in the DOM.
  useEffect(() => {
    if (!shouldLoad) return;

    if (!document.querySelector(`link[href="${STYLE_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = STYLE_HREF;
      document.head.appendChild(link);
    }

    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    } else {
      // Script already loaded (e.g. on soft nav back to this page).
      // Manually re-trigger auto-discovery by dispatching a no-op event,
      // or just rely on Calendly's own observation. The simplest path:
      // remove and re-add the script so its IIFE re-runs and finds our
      // freshly mounted .calendly-inline-widget.
      const old = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
      old?.remove();
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  }, [shouldLoad]);

  return (
    <div className="not-prose my-8">
      <div className="relative rounded-2xl border border-corbeau/10 bg-paper overflow-hidden min-h-[680px]">
        {!shouldLoad ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="font-mono text-[0.72rem] tracking-[2px] uppercase text-eyebrow">
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
        ) : (
          // Calendly's auto-discovery picks up this element via the
          // data-url attribute when the script first runs.
          <div
            className="calendly-inline-widget"
            data-url={CALENDLY_URL}
            style={{ minWidth: "320px", height: "680px" }}
          />
        )}
      </div>
    </div>
  );
}
