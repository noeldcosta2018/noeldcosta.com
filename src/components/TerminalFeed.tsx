"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Sequential-reveal feed for the terminal card on the homepage AI section.
 *
 * Cycle (12 seconds total):
 *   0 s     0 lines visible
 *   1-5 s   one line per second appears (5 total)
 *   6-10 s  all 5 lines hold visible
 *   11 s    all lines fade
 *   12 s    cycle restarts at 0 lines
 *
 * Each line is in DOM order (not animated by reordering) so screen
 * readers see the full block from the start. Visual animation is
 * opacity only — transform-free, no layout shift.
 *
 * Pauses when the card is off-screen via IntersectionObserver so the
 * setInterval doesn't burn cycles on a hidden element.
 *
 * Respects prefers-reduced-motion: all lines render at opacity 1
 * immediately, no cycling.
 */

const CYCLE_SECONDS = 12;
const HOLD_SECONDS = 5;

function tickToVisibleCount(tick: number, lineCount: number): number {
  const phase = tick % CYCLE_SECONDS;
  if (phase <= lineCount) return phase;
  if (phase < lineCount + HOLD_SECONDS) return lineCount;
  return 0;
}

export default function TerminalFeed({ lines }: { lines: ReactNode[] }) {
  const [tick, setTick] = useState(0);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Honour OS-level reduced-motion. With it on, every line stays at
  // opacity 1 from first paint.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const update = () => setReduced(mq.matches);
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Pause cycling while card is off-screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting)
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || reduced) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [visible, reduced]);

  const visibleCount = reduced ? lines.length : tickToVisibleCount(tick, lines.length);

  return (
    <div ref={ref}>
      {lines.map((node, i) => {
        const isShown = i < visibleCount;
        // Slide-up + opacity for each line. The translate-y collapses to 0
        // under reduced-motion via the global guard in globals.css.
        return (
          <div
            key={i}
            className="flex gap-2 mb-2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              opacity: isShown ? 1 : 0,
              transform: isShown ? "translateY(0)" : "translateY(6px)",
            }}
            aria-hidden={!reduced && !isShown}
          >
            <span className="text-papaya font-semibold shrink-0">▶</span>
            <span className="text-night">{node}</span>
          </div>
        );
      })}
    </div>
  );
}
