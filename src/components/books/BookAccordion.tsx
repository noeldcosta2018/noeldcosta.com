"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * BookAccordion: single-open accordion inside one book card.
 *
 * Three items per book:
 *   1. Who is this for?
 *   2. What will you get from this book?
 *   3. How do I access this?
 *
 * Hairline dividers, accent on the open item, plus sign that turns into a
 * cross. The panel opens with a short height + fade, instant under reduced
 * motion.
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
    <div>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const id = `${idPrefix ?? "acc"}-${i}`;
        return (
          <div key={i} className="item">
            <h4 style={{ margin: 0 }}>
              <button
                type="button"
                id={`${id}-trigger`}
                aria-expanded={isOpen}
                aria-controls={`${id}-panel`}
                onClick={() => setOpenIndex(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <span className="pm" aria-hidden="true" />
              </button>
            </h4>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${id}-panel`}
                  role="region"
                  aria-labelledby={`${id}-trigger`}
                  className="panel"
                  initial={reduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                  animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                  exit={reduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <p>{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
