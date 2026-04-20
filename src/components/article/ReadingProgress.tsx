"use client";

import { useEffect, useRef } from "react";

/**
 * Thin, unobtrusive reading-progress indicator anchored below the main nav.
 * Uses a raw DOM ref + rAF rather than React state to avoid re-rendering on
 * every scroll pixel — this component is intentionally cheap.
 */
export default function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    function update() {
      const bar = barRef.current;
      if (!bar) return;
      const scrolled = window.scrollY;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, scrolled / max)) : 0;
      bar.style.transform = `scaleX(${pct})`;
    }
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed top-16 left-0 right-0 h-[2px] z-40 pointer-events-none"
    >
      <div
        ref={barRef}
        className="h-full bg-papaya origin-left"
        style={{ transform: "scaleX(0)", transition: "transform 60ms linear" }}
      />
    </div>
  );
}
