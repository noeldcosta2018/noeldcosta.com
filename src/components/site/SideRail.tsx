"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

export type RailItem = { id: string; label: string };

/**
 * Sticky side rail (MDLBeast SideRail): back link, section label, the current
 * page and its numbered steps. The active step is the last one whose top has
 * passed a line under the nav, tracked with a passive, rAF-throttled listener.
 */
export default function SideRail({
  back,
  label,
  current,
  items,
  numbered = true,
  footer,
}: {
  back?: { label: string; href: string };
  label: string;
  current?: string;
  items: RailItem[];
  numbered?: boolean;
  footer?: ReactNode;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!items.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = 0;
      items.forEach((item, i) => {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= 140) current = i;
      });
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <aside className="nd-rail">
      {back && (
        <Link className="back" href={back.href}>
          <span aria-hidden="true">←</span>
          {back.label}
        </Link>
      )}
      <div className="rail-body">
        <div className="rail-label">{label}</div>
        {current && (
          <span className="nd-rail-item active" aria-current="page">
            {current}
          </span>
        )}
        {items.length > 0 && (
          <nav className="nd-rail-steps" aria-label={`${current ?? label}: sections`} style={current ? { marginLeft: 16 } : undefined}>
            {items.map((item, i) => (
              <a
                key={item.id}
                className={`nd-rail-item${i === active ? " active" : ""}`}
                href={`#${item.id}`}
                aria-current={i === active ? "step" : undefined}
              >
                {numbered && <span className="n">{String(i + 1).padStart(2, "0")}</span>}
                {item.label}
              </a>
            ))}
          </nav>
        )}
        {footer}
      </div>
    </aside>
  );
}
