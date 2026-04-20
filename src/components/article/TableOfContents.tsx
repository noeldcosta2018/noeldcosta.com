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

  // Numbering only the H2 entries; H3s sit underneath their parent section
  // without a number. Gives a clean editorial "01 / 02 / 03" spine.
  let h2Count = 0;
  const numbered = headings.map((h) => ({
    ...h,
    number: h.level === 2 ? String(++h2Count).padStart(2, "0") : null,
  }));

  return (
    <nav aria-label="Table of contents">
      <p className="font-mono text-[0.62rem] font-medium tracking-[2.4px] uppercase text-corbeau/50 mb-5">
        Contents
      </p>
      <ul className="space-y-0.5">
        {numbered.map((h) => {
          const isActive = h.id === activeId;
          const isH3 = h.level === 3;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={() => {
                  lastForcedRef.current = Date.now();
                  setActiveId(h.id);
                }}
                className={[
                  "group flex items-start gap-3 py-1.5 leading-[1.4] transition-colors",
                  isH3 ? "pl-8" : "",
                ].join(" ")}
              >
                {!isH3 && (
                  <span
                    aria-hidden
                    className={[
                      "font-mono text-[0.68rem] tabular-nums pt-[0.18rem] transition-colors flex-shrink-0 w-5",
                      isActive
                        ? "text-papaya"
                        : "text-corbeau/30 group-hover:text-corbeau/60",
                    ].join(" ")}
                  >
                    {h.number}
                  </span>
                )}
                {isH3 && (
                  <span
                    aria-hidden
                    className={[
                      "mt-[0.65rem] w-1 h-1 rounded-full transition-colors flex-shrink-0",
                      isActive
                        ? "bg-papaya"
                        : "bg-corbeau/20 group-hover:bg-corbeau/50",
                    ].join(" ")}
                  />
                )}
                <span
                  className={[
                    "transition-colors",
                    isH3
                      ? "text-[0.82rem] text-night/60 group-hover:text-corbeau"
                      : "text-[0.9rem] text-night/80 group-hover:text-corbeau",
                    isActive
                      ? isH3
                        ? "text-corbeau font-medium"
                        : "text-corbeau font-semibold"
                      : "",
                  ].join(" ")}
                >
                  {h.text}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
