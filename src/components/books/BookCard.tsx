"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import BookThumbnail from "./BookThumbnail";
import BookAccordion, { type AccordionItem } from "./BookAccordion";
import type { BookFrontmatter } from "@/types/book";

/**
 * BookCard — single book card for the Free / Paid grid.
 *
 * Client component because it owns the trigger ref for the modal and the
 * BookAccordion (which is itself a client island for the single-open state).
 *
 * Layout:
 *   - Desktop two-column: thumbnail on the left, content on the right.
 *   - The FAQ accordion now lives INSIDE the right content column so it
 *     flows immediately under the CTA, killing the dead space that
 *     appeared when the thumbnail was taller than the content stack.
 *
 * Motion: subtle whileHover lift (y: -2). Disabled under
 * prefers-reduced-motion.
 */

interface Props {
  book: BookFrontmatter;
  hasCoverImage: boolean;
  onRequest: (book: BookFrontmatter, trigger: HTMLElement | null) => void;
}

export default function BookCard({ book, hasCoverImage, onRequest }: Props) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const reduceMotion = useReducedMotion();
  const isPaid = book.kind === "paid";
  const price = book.price;

  const items: AccordionItem[] = book.details
    ? [
        { q: "Who is this for?", a: book.details.whoFor },
        { q: "What will you get from this book?", a: book.details.whatYouGet },
        { q: "How do I access this?", a: book.details.howToAccess },
      ]
    : [];

  return (
    <motion.article
      id={`book-card-${book.slug}`}
      className="bg-paper border border-corbeau/[0.08] rounded-2xl p-5 md:p-6 w-full flex flex-col h-full"
      aria-labelledby={`book-title-${book.slug}`}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -2,
              boxShadow: "0 8px 24px rgba(14,16,32,0.08)",
            }
      }
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-start">
        {/* Thumbnail column. Mobile: top. Desktop: left. */}
        <div className="flex-shrink-0 self-center md:self-start md:pt-1 pl-3 md:pl-4">
          <BookThumbnail book={book} hasImage={hasCoverImage} />
        </div>

        {/* Content column — also owns the accordion so the card has no
            dead space between CTA and FAQ on desktop. */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={`font-mono text-[0.65rem] tracking-[1.5px] uppercase px-2 py-1 rounded font-semibold ${
                isPaid
                  ? "bg-corbeau text-papaya"
                  : "bg-papaya text-corbeau"
              }`}
            >
              {isPaid ? "Paid" : "Free"}
            </span>
            {isPaid && typeof price === "number" && (
              <span className="font-mono text-[0.78rem] text-night font-semibold">
                ${price.toFixed(2)}
              </span>
            )}
          </div>

          <h3
            id={`book-title-${book.slug}`}
            className="font-display font-black tracking-[-0.02em] text-corbeau leading-[1.2]"
            style={{ fontSize: "1.3rem" }}
          >
            {book.title}
          </h3>

          {book.summary && (
            <p className="text-night text-[0.92rem] leading-[1.55] mt-2">
              {book.summary}
            </p>
          )}

          <button
            ref={triggerRef}
            type="button"
            onClick={() => onRequest(book, triggerRef.current)}
            className="mt-4 w-full md:w-auto inline-flex items-center justify-center bg-papaya text-corbeau font-bold text-[0.92rem] px-5 py-3 min-h-[44px] rounded-[10px] transition-all hover:bg-[#fb8843] hover:-translate-y-px"
          >
            Get the book
          </button>

          {items.length > 0 && (
            <div className="mt-5">
              <BookAccordion idPrefix={`book-${book.slug}`} items={items} />
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
