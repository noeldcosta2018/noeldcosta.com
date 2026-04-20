"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Subtle reveal-on-scroll wrapper used to give long-form articles a bit of
 * editorial motion without becoming a scroll-jacking show-reel.
 *
 * Motion: 12px fade-up over 600ms, ease-out. Triggers once when ~15% of the
 * element enters the viewport.
 *
 * Respects `prefers-reduced-motion: reduce` — users with that preference get
 * the content visible immediately with no transform at all. That means the
 * element is always present for screen readers and crawlers; the transition
 * is purely presentational.
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
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const style = reduced
    ? undefined
    : {
        transitionDelay: `${delay}ms`,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        opacity: visible ? 1 : 0,
      };

  const baseMotion = reduced
    ? ""
    : "transition-[transform,opacity] duration-[600ms] ease-out will-change-transform";

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
