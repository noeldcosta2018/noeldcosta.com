"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HeadingEntry } from "@/lib/article-headings";

/**
 * Progressive-disclosure table of contents. Only the top-level H2 spine is
 * visible by default. As the reader scrolls into a section, that H2's H3s
 * expand inline beneath it; when scroll crosses into the next section, the
 * previous H3s fold away. One section's children are open at a time —
 * never a full tree of every H3 across the article.
 *
 * Design choices:
 *   - Zero-padded numeric spine (01, 02, 03…) in faded mono that lights up
 *     papaya when active.
 *   - H3 expansion uses the `grid-rows-[0fr]` ↔ `grid-rows-[1fr]` trick for
 *     a smooth height transition without measuring the DOM. Honours
 *     `prefers-reduced-motion` by dropping the transition timing.
 *   - Click on any entry pins the activeId for ~600ms so the IntersectionObserver
 *     can't override the user's explicit click.
 */
export default function TableOfContents({
  headings,
}: {
  headings: HeadingEntry[];
}) {
  // Group into sections keyed by the H2 heading. H3s that appear before any
  // H2 go into an "orphan" prelude group that's always expanded.
  const groups = useMemo(() => {
    const out: { h2: HeadingEntry | null; children: HeadingEntry[]; idx: number }[] = [];
    let current: { h2: HeadingEntry | null; children: HeadingEntry[]; idx: number } | null = null;
    let h2Count = 0;
    for (const h of headings) {
      if (h.level === 2) {
        current = { h2: h, children: [], idx: ++h2Count };
        out.push(current);
      } else if (h.level === 3) {
        if (!current) {
          current = { h2: null, children: [], idx: 0 };
          out.push(current);
        }
        current.children.push(h);
      }
    }
    return out;
  }, [headings]);

  const firstId = headings[0]?.id ?? "";
  const [activeId, setActiveId] = useState(firstId);
  const lastForcedRef = useRef<number>(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const update = () => setReduced(mq.matches);
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (!headings.length) return;
    const ids = headings.map((h) => h.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!elements.length) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.boundingClientRect.top);
          } else {
            visible.delete(entry.target.id);
          }
        }
        if (visible.size > 0) {
          const topId = [...visible.entries()].sort((a, b) => a[1] - b[1])[0][0];
          if (Date.now() - lastForcedRef.current > 600) setActiveId(topId);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  // Which group is active? If active heading is H2, its index; if H3, its parent.
  const activeGroupIdx = useMemo(() => {
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      if (g.h2?.id === activeId) return i;
      if (g.children.some((c) => c.id === activeId)) return i;
    }
    return 0;
  }, [activeId, groups]);

  if (!headings.length) return null;

  const onClickEntry = (id: string) => {
    lastForcedRef.current = Date.now();
    setActiveId(id);
  };

  const motionCls = reduced
    ? ""
    : "transition-[grid-template-rows,opacity] duration-[400ms] ease-out";

  return (
    <nav
      aria-label="Table of contents"
      className="rounded-xl bg-corbeau overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-bone/[0.08]">
        <p className="font-display font-black text-bone text-[1.05rem] leading-[1.2]">
          Table of{" "}
          <span className="cc-emphasis-italic">contents</span>
        </p>
      </div>

      <div className="px-5 py-4">
      <ol className="space-y-[1px]">
        {groups.map((g, gi) => {
          const isActive = gi === activeGroupIdx;
          const h2 = g.h2;
          const hasChildren = g.children.length > 0;
          const h2IsActive = h2?.id === activeId;

          return (
            <li key={h2?.id ?? `prelude-${gi}`}>
              {h2 && (
                <a
                  href={`#${h2.id}`}
                  onClick={() => onClickEntry(h2.id)}
                  className={[
                    "group flex items-start gap-3 py-1.5 px-2 -mx-2 rounded-md leading-[1.35] transition-colors",
                    h2IsActive
                      ? "bg-papaya"
                      : isActive
                        ? "bg-papaya/10 hover:bg-papaya"
                        : "hover:bg-papaya",
                  ].join(" ")}
                >
                  <span
                    aria-hidden
                    className={[
                      "font-mono text-[0.62rem] tabular-nums pt-[0.22rem] flex-shrink-0 w-4 transition-colors",
                      h2IsActive
                        ? "text-corbeau"
                        : isActive
                          ? "text-papaya group-hover:text-corbeau"
                          : "text-papaya/60 group-hover:text-corbeau",
                    ].join(" ")}
                  >
                    {String(g.idx).padStart(2, "0")}
                  </span>
                  <span
                    className={[
                      "text-[0.78rem] transition-colors",
                      h2IsActive
                        ? "text-corbeau font-semibold"
                        : isActive
                          ? "text-bone font-medium group-hover:text-corbeau"
                          : "text-bone/75 group-hover:text-corbeau",
                    ].join(" ")}
                  >
                    {h2.text}
                  </span>
                </a>
              )}

              {hasChildren && (
                <div
                  aria-hidden={!isActive}
                  className={[
                    "grid pl-8",
                    isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    motionCls,
                  ].join(" ")}
                >
                  <div className="overflow-hidden">
                    <ul className="border-l border-bone/[0.12] ml-0 pt-1 pb-2 space-y-[1px]">
                      {g.children.map((c) => {
                        const cActive = c.id === activeId;
                        return (
                          <li key={c.id}>
                            <a
                              href={`#${c.id}`}
                              onClick={() => onClickEntry(c.id)}
                              className={[
                                "group flex items-start gap-3 py-1 pl-4 pr-2 -mr-2 rounded-md relative transition-colors",
                                cActive ? "bg-papaya/80" : "hover:bg-papaya/70",
                              ].join(" ")}
                            >
                              <span
                                aria-hidden
                                className={[
                                  "absolute left-[-1px] top-0 bottom-0 w-[2px] transition-colors",
                                  cActive ? "bg-papaya" : "bg-transparent group-hover:bg-corbeau/30",
                                ].join(" ")}
                              />
                              <span
                                className={[
                                  "text-[0.73rem] leading-[1.4] transition-colors",
                                  cActive
                                    ? "text-corbeau font-medium"
                                    : "text-bone/65 group-hover:text-corbeau",
                                ].join(" ")}
                              >
                                {c.text}
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      </div>
    </nav>
  );
}
