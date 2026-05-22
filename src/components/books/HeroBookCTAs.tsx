"use client";

import { useRef, useState } from "react";
import BookModal, { type BookModalContext } from "./BookModal";
import type { BookFrontmatter } from "@/types/book";

/**
 * Hero CTAs for /books.
 *
 * Two buttons inline:
 *   - "Browse the books" → scrolls to #books (the carousel section)
 *   - "Get the free book" → opens BookModal pre-selected to the
 *     featured / first free book
 *
 * Owns its own modal instance separate from BookCarousel so the hero
 * CTA works even before the user scrolls to the carousel.
 */

export default function HeroBookCTAs({
  freeBook,
}: {
  freeBook: BookFrontmatter;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const context: BookModalContext = {
    bookSlug: freeBook.slug,
    bookTitle: freeBook.title,
    bookType: freeBook.kind,
    price: 0,
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mt-2">
        <a
          href="#books"
          className="inline-flex items-center justify-center bg-papaya text-corbeau font-bold text-[0.95rem] px-6 py-3 min-h-[44px] rounded-[10px] no-underline transition-all hover:bg-[#fb8843] hover:-translate-y-px"
        >
          Browse the books
        </a>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center bg-transparent text-corbeau font-bold text-[0.95rem] px-6 py-3 min-h-[44px] rounded-[10px] border border-corbeau transition-all hover:bg-corbeau hover:text-bone"
        >
          Get the free book
        </button>
      </div>
      <BookModal
        open={open}
        context={context}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
      />
    </>
  );
}
