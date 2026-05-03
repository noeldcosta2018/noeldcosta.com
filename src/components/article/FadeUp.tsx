"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scroll-triggered reveal wrapper. Motion: 28px fade-up + slight scale
 * (0.97 → 1.0) over 700ms spring-eased cubic. Triggers once when ~12%
 * of the element enters the viewport.
 *
 * Respects `prefers-reduced-motion: reduce` — users with that preference
 * get content visible immediately with no transform. Always present for
 * screen readers and crawlers; the transition is purely presentational.
 */
export default function FadeUp({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
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
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const style = reduced
    ? undefined
    : {
        transitionDelay: `${delay}ms`,
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(28px) scale(0.97)",
        opacity: visible ? 1 : 0,
      };

  const baseMotion = reduced
    ? ""
    : "transition-[transform,opacity] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform";

  return (
    <Tag
      ref={ref as never}
      className={`${baseMotion} ${className}`.trim()}
      style={style}
    >
      {children}
    </Tag>
  );
}
