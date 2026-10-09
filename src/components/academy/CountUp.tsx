"use client";

import { useEffect, useRef } from "react";

/**
 * A number that counts up from zero the first time it is on screen. The server
 * renders the final value, screen readers always read the final value, and
 * with reduced motion nothing moves.
 */
export default function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const targets = (value.match(/\d+/g) ?? []).map(Number);
    if (!el || !targets.some((n) => n > 0)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const frame = (p: number) => {
      let i = 0;
      return value.replace(/\d+/g, () => String(Math.round(targets[i++] * p)));
    };
    el.textContent = frame(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / 1100);
          el.textContent = frame(1 - Math.pow(1 - p, 3));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = value;
    };
  }, [value]);

  return (
    <b>
      <span ref={ref} aria-hidden="true">
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </b>
  );
}
