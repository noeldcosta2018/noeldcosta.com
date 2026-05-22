"use client";

import { useState } from "react";

/**
 * BookAccordion — single-open accordion for one book's six detail sections.
 *
 * Mirrors the visual treatment of FAQ.tsx exactly (border dividers,
 * papaya hover/open background, +/× rotation marker). Uses React state
 * so only one section can be open at a time per the brief.
 *
 * Server-rendered shell would be a chain of <details>, but the brief
 * specifies single-open behaviour — that needs React state. The cost is
 * a small client island, scoped to the accordion section.
 */

export interface AccordionItem {
  q: string;
  a: string;
}

export default function BookAccordion({
  items,
  idPrefix,
}: {
  items: AccordionItem[];
  /** Used to scope the open state when multiple accordions render on the page. */
  idPrefix?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="not-prose">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const id = `${idPrefix ?? "acc"}-${i}`;
        return (
          <div
            key={i}
            className={`border-b border-corbeau/[0.08] py-2 ${
              i === 0 ? "border-t border-corbeau/[0.08]" : ""
            }`}
          >
            <button
              type="button"
              id={`${id}-trigger`}
              aria-expanded={isOpen}
              aria-controls={`${id}-panel`}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className={`w-full flex items-start justify-between gap-4 cursor-pointer font-display font-bold text-corbeau text-[1.02rem] md:text-[1.1rem] tracking-[-0.02em] leading-[1.35] select-none -mx-3 px-3 py-3.5 rounded-lg transition-all duration-150 text-left ${
                isOpen ? "bg-papaya" : "hover:bg-papaya"
              }`}
            >
              <span className="flex-1 py-0.5">{item.q}</span>
              <span
                aria-hidden
                className={`mt-1 min-w-[22px] flex-shrink-0 w-[22px] h-[22px] rounded-full border border-current flex items-center justify-center opacity-60 text-[0.85rem] leading-none transition-all duration-200 ${
                  isOpen ? "rotate-45 opacity-90" : ""
                }`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <p
                id={`${id}-panel`}
                role="region"
                aria-labelledby={`${id}-trigger`}
                className="text-night text-[0.92rem] leading-[1.7] mt-2 mb-4 px-3"
              >
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
