"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/**
 * Scroll-triggered reveal wrapper.
 *
 * Motion: a restrained 16px rise with an opacity fade over 600ms, triggered
 * when ~10% of the element enters the viewport. One reveal per block (a
 * diagram, a card grid), never per heading or per paragraph.
 *
 * All transition properties are inlined as JS styles, NOT Tailwind arbitrary
 * value classes, so they win the cascade on every build path.
 *
 * Respects `prefers-reduced-motion: reduce`: content visible immediately,
 * no transform. Always present for screen readers and crawlers.
 *
 * The preference is read after hydration (server and first client render
 * are identical), so the server HTML always carries the hidden start state.
 * The `data-motion-reveal` attribute lets globals.css force that state
 * visible for reduced-motion and no-script visitors before React runs.
 */
export default function FadeUp({
  children,
  delay = 0,
  duration = 600,
  distance = 16,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  as?: "div" | "section" | "figure";
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    // Safety net: even if IntersectionObserver mis-fires, force-show after
    // 1.5s. This guarantees the element is never stuck invisible.
    const safety = window.setTimeout(() => setVisible(true), 1500);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            window.clearTimeout(safety);
            break;
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -4% 0px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, [reduced]);

  // Pure inline styles — no Tailwind arbitrary value classes, no surprises.
  const style: React.CSSProperties = reduced
    ? {}
    : {
        transitionProperty: "transform, opacity",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        transitionDelay: `${delay}ms`,
        transform: visible ? "none" : `translateY(${distance}px)`,
        opacity: visible ? 1 : 0,
        willChange: "transform, opacity",
      };

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={style}
      data-motion-reveal=""
    >
      {children}
    </Tag>
  );
}
