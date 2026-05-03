"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scroll-triggered reveal wrapper.
 *
 * Motion: 48px fade-up + scale 0.92→1.0 over 900ms cubic-bezier spring.
 * Triggers when ~10% of the element enters the viewport. The motion is
 * deliberately substantial (not subtle) — the brief is "obviously animated,"
 * not "tasteful microinteraction."
 *
 * All transition properties are inlined as JS styles, NOT Tailwind arbitrary
 * value classes. Tailwind v4's parser handles bracket arbitrary values fine
 * but combined with CSS layer ordering it can defer them; inline `style` wins
 * the cascade and renders the same on every browser/build path.
 *
 * Respects `prefers-reduced-motion: reduce` — content visible immediately,
 * no transform. Always present for screen readers and crawlers.
 */
export default function FadeUp({
  children,
  delay = 0,
  duration = 900,
  distance = 48,
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
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const update = () => setReduced(mq.matches);
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
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
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: `${delay}ms`,
        transform: visible
          ? "translateY(0) scale(1)"
          : `translateY(${distance}px) scale(0.92)`,
        opacity: visible ? 1 : 0,
        willChange: "transform, opacity",
      };

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}
