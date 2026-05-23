"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * BookAccordion — single-open accordion for one book card.
 *
 * Three items per book:
 *   1. Who is this for?
 *   2. What will you get from this book?
 *   3. How do I access this?
 *
 * Visual treatment matches FAQ.tsx (border dividers, papaya hover/open
 * background, plus-to-x rotation). Compact spacing because this lives
 * inside a card.
 *
 * Motion: panel slides open via height auto + fade. AnimatePresence
 * handles exit. Collapsed instantly when prefers-reduced-motion is on.
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
  idPrefix?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <div className="not-prose">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const id = `${idPrefix ?? "acc"}-${i}`;
        return (
          <div
            key={i}
            className={`border-b border-corbeau/[0.08] ${
              i === 0 ? "border-t border-corbeau/[0.08]" : ""
            }`}
          >
            <button
              type="button"
              id={`${id}-trigger`}
              aria-expanded={isOpen}
              aria-controls={`${id}-panel`}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className={`w-full min-h-[44px] flex items-start justify-between gap-3 cursor-pointer font-display font-bold text-corbeau text-[0.95rem] tracking-[-0.02em] leading-[1.35] select-none -mx-2 px-2 py-3 rounded-md transition-all duration-150 text-left ${
                isOpen ? "bg-papaya" : "hover:bg-papaya"
              }`}
            >
              <span className="flex-1 py-0.5">{item.q}</span>
              <span
                aria-hidden
                className={`mt-1 min-w-[20px] flex-shrink-0 w-[20px] h-[20px] rounded-full border border-current flex items-center justify-center opacity-60 text-[0.8rem] leading-none transition-all duration-200 ${
                  isOpen ? "rotate-45 opacity-90" : ""
                }`}
              >
                +
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${id}-panel`}
                  role="region"
                  aria-labelledby={`${id}-trigger`}
                  initial={
                    reduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }
                  }
                  animate={
                    reduceMotion
                      ? { opacity: 1 }
                      : { height: "auto", opacity: 1 }
                  }
                  exit={
                    reduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <p className="text-night text-[0.88rem] leading-[1.6] mt-1 mb-3 px-2">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
