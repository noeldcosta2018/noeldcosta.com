"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import BookThumbnail from "./BookThumbnail";
import BookAccordion, { type AccordionItem } from "./BookAccordion";
import { BOOK_ACCORDION_QUESTIONS } from "./accordion-questions";
import type { BookFrontmatter } from "@/types/book";
import { isTargetLanguage, type Locale } from "@/lib/locales";
import { useTranslation } from "@/lib/i18n/useTranslation";

function detectLocale(pathname: string | null): Locale {
  if (!pathname) return "en";
  const path = pathname.startsWith("/intl/") ? pathname.slice(5) : pathname;
  const first = path.split("/").filter(Boolean)[0];
  if (first && isTargetLanguage(first)) return first;
  return "en";
}

/**
 * BookCard — single book card for the Free / Paid grid.
 *
 * Two stacked zones inside the card:
 *
 *   1. Top zone  — image left, text right (badge, title, synopsis x 2, CTA).
 *                  Stacks to single column on mobile.
 *
 *   2. FAQ zone  — full card width, sitting BELOW the top zone. The first
 *                  accordion line aligns with the left edge of the
 *                  thumbnail because both share the card's outer padding.
 *
 * The FAQ does not nest inside the text column. That earlier layout caused
 * the accordion to start beside the thumbnail and left visible dead space
 * under the CTA when the thumbnail was the taller of the two columns.
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
  const pathname = usePathname();
  const { messages: m } = useTranslation(detectLocale(pathname));
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const reduceMotion = useReducedMotion();
  const isPaid = book.kind === "paid";
  const price = book.price;

  // Pair the three canonical questions with this book's answers. Both
  // BookCard (visible accordion) and the books page (FAQPage JSON-LD)
  // consume BOOK_ACCORDION_QUESTIONS — order and wording stay in lockstep.
  const items: AccordionItem[] = book.details
    ? [
        { q: BOOK_ACCORDION_QUESTIONS[0], a: book.details.whoFor },
        { q: BOOK_ACCORDION_QUESTIONS[1], a: book.details.whatYouGet },
        { q: BOOK_ACCORDION_QUESTIONS[2], a: book.details.howToAccess },
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
      {/* TOP ZONE — image + text. Stacks single-column on mobile. */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 md:gap-6 items-start">
        {/* Thumbnail. No extra left padding — aligns to the card edge so
            the FAQ below sits on the same left axis. */}
        <div className="self-center md:self-start md:pt-1">
          <BookThumbnail book={book} hasImage={hasCoverImage} />
        </div>

        {/* Text column */}
        <div className="min-w-0 w-full">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={`font-mono text-[0.65rem] tracking-[1.5px] uppercase px-2 py-1 rounded font-semibold ${
                isPaid
                  ? "bg-corbeau text-papaya"
                  : "bg-papaya text-corbeau"
              }`}
            >
              {isPaid ? m.bookCard.paidBadge : m.bookCard.freeBadge}
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

          {book.summaryAudience && (
            <p className="text-night text-[0.92rem] leading-[1.55] mt-2">
              {book.summaryAudience}
            </p>
          )}

          <button
            ref={triggerRef}
            type="button"
            onClick={() => onRequest(book, triggerRef.current)}
            className="mt-4 w-full md:w-auto inline-flex items-center justify-center bg-papaya text-corbeau font-bold text-[0.92rem] px-5 py-3 min-h-[44px] rounded-[10px] transition-all hover:bg-[#fb8843] hover:-translate-y-px"
          >
            {m.bookCard.getTheBookCta}
          </button>
        </div>
      </div>

      {/* FAQ ZONE — full card width below the top zone. Left edge aligns
          with the thumbnail because both share the card's outer padding.
          mt-auto pushes the FAQ to the bottom of the card so neighbouring
          cards in the 2-up grid keep their FAQs vertically aligned even
          when one has more synopsis text than the other. */}
      {items.length > 0 && (
        <div className="mt-auto pt-6">
          <BookAccordion idPrefix={`book-${book.slug}`} items={items} />
        </div>
      )}
    </motion.article>
  );
}
