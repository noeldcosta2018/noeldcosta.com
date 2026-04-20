"use client";

import { useEffect, useRef, useState } from "react";
import type { HeadingEntry } from "@/lib/article-headings";

/**
 * Sticky editorial table of contents. Renders server-side for SEO and shift-free
 * load, then hydrates to highlight the active section via IntersectionObserver.
 *
 * Design choices:
 * - Left-border rail indicating position; no bullets — looks like a magazine side
 *   nav rather than a wiki tree.
 * - Active item uses the papaya accent; inactive items fade slightly.
 * - H3 entries are inset and slightly smaller so the hierarchy is scannable
 *   without getting noisy.
 */
export default function TableOfContents({
  headings,
}: {
  headings: HeadingEntry[];
}) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");
  const lastForcedRef = useRef<number>(0);

  useEffect(() => {
    if (!headings.length) return;
    const ids = headings.map((h) => h.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!elements.length) return;

    // Track which headings are currently intersecting the viewport.
    const visible = new Map<string, number>(); // id -> top offset

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.boundingClientRect.top);
          } else {
            visible.delete(entry.target.id);
          }
        }
        // Pick the highest heading that is currently visible.
        if (visible.size > 0) {
          const topId = [...visible.entries()].sort((a, b) => a[1] - b[1])[0][0];
          // Avoid thrash when the user just clicked — leave the clicked id in
          // place for 600ms.
          if (Date.now() - lastForcedRef.current > 600) setActiveId(topId);
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="font-mono text-[0.68rem] font-medium tracking-[2px] uppercase text-papaya mb-4">
        On this page
      </p>
      <ul className="border-l border-corbeau/10 space-y-1">
        {headings.map((h) => {
          const isActive = h.id === activeId;
          return (
            <li key={h.id} className={h.level === 3 ? "ml-3" : ""}>
              <a
                href={`#${h.id}`}
                onClick={() => {
                  lastForcedRef.current = Date.now();
                  setActiveId(h.id);
                }}
                className={[
                  "group relative block py-1.5 pl-4 pr-2 leading-snug transition-colors",
                  h.level === 3
                    ? "text-[0.82rem] text-night/70"
                    : "text-[0.92rem] text-night/90",
                  isActive
                    ? "text-corbeau font-semibold"
                    : "hover:text-corbeau",
                ].join(" ")}
              >
                <span
                  aria-hidden
                  className={[
                    "absolute left-[-1px] top-0 bottom-0 w-[2px] transition-colors",
                    isActive ? "bg-papaya" : "bg-transparent group-hover:bg-corbeau/30",
                  ].join(" ")}
                />
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
