"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Number count-up that fires the first time the element enters the
 * viewport. Once only — doesn't replay on every scroll-back.
 *
 * For values that aren't pure numbers (e.g. "$60M", "15 → 5", "44%"),
 * pass them as `to` and the component parses the leading integer-ish
 * portion to count. The prefix/suffix and any non-numeric tail render
 * exactly as you'd write them.
 *
 * Screen readers always see the final value via aria-label so the
 * animation never hides information.
 *
 * Respects prefers-reduced-motion via global CSS guard + a JS check
 * (the global rule collapses transition-duration but not setInterval).
 */

interface Props {
  /** Final value as a string. The first numeric token in the string is
   *  the one that animates; everything else renders as-is. */
  to: string;
  /** Duration of the count-up in ms. Default 1400. */
  duration?: number;
  className?: string;
  /** Skip the count-up if the parent has already started a different
   *  reveal animation that would clash. */
  disabled?: boolean;
}

/** Split "$1.2M" into { prefix: "$", number: 1.2, suffix: "M" }. */
function splitValue(s: string): { prefix: string; number: number | null; suffix: string } {
  // Matches the first numeric token (integer or decimal). Captures the
  // surrounding non-numeric pieces so we can keep $ / % / "M" etc. in place.
  const m = s.match(/^(\D*)([\d.,]+)(.*)$/);
  if (!m) return { prefix: s, number: null, suffix: "" };
  const numStr = m[2].replace(/,/g, "");
  const n = parseFloat(numStr);
  if (Number.isNaN(n)) return { prefix: s, number: null, suffix: "" };
  return { prefix: m[1], number: n, suffix: m[3] };
}

/** Format n the same way the source value was written
 *  (preserve decimal places). */
function formatLikeSource(n: number, source: number): string {
  const sourceStr = String(source);
  const dot = sourceStr.indexOf(".");
  if (dot === -1) return String(Math.round(n));
  const decimals = sourceStr.length - dot - 1;
  return n.toFixed(decimals);
}

export default function NumberTicker({
  to,
  duration = 1400,
  className,
  disabled = false,
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [played, setPlayed] = useState(false);
  const [current, setCurrent] = useState<number | null>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (disabled || played) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setPlayed(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [disabled, played]);

  const parsed = splitValue(to);

  useEffect(() => {
    if (!played || parsed.number === null) return;
    if (reducedMotion.current) {
      setCurrent(parsed.number);
      return;
    }
    const target = parsed.number;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      // ease-out-quart — matches the project's motion token
      const eased = 1 - Math.pow(1 - t, 4);
      setCurrent(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [played, parsed.number, duration]);

  // Pure non-numeric value (e.g. "Greenfield"): just render it.
  if (parsed.number === null) {
    return (
      <span ref={ref} className={className} aria-label={to}>
        {to}
      </span>
    );
  }

  const display =
    current === null
      ? `${parsed.prefix}0${parsed.suffix}`
      : `${parsed.prefix}${formatLikeSource(current, parsed.number)}${parsed.suffix}`;

  return (
    // aria-label exposes the final value to screen readers so the
    // animation never hides information. The visible <span> updates
    // every frame; the SR reads the static label.
    <span ref={ref} className={className} aria-label={to}>
      <span aria-hidden>{display}</span>
    </span>
  );
}
