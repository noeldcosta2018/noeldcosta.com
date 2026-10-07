"use client";

import { SAPOPEDIA_BOOKS } from "@/data/site-menu";

import { useRef } from "react";
import BookThumbnail from "./BookThumbnail";
import BookAccordion, { type AccordionItem } from "./BookAccordion";
import type { BookFrontmatter } from "@/types/book";

/**
 * BookCard: one book in the Free or Paid grid (nd-card, banded in the
 * accent colour, cursor-lit border).
 *
 *   1. Top zone: cover left, text right (badge, title, synopsis, action).
 *      Stacks on narrow screens.
 *   2. FAQ zone: full card width below, pushed to the bottom so neighbouring
 *      cards keep their accordions aligned.
 *
 * Paid editions are coming soon, so the paid action collects an email for
 * the launch instead of promising a checkout.
 */

interface Props {
  book: BookFrontmatter;
  hasCoverImage: boolean;
  onRequest: (book: BookFrontmatter, trigger: HTMLElement | null) => void;
}

export default function BookCard({ book, hasCoverImage, onRequest }: Props) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
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
    <article
      id={`book-card-${book.slug}`}
      className="nda-book nd-card banded nd-glow"
      aria-labelledby={`book-title-${book.slug}`}
    >
      <span className="nd-card-band" style={{ background: "var(--accent)" }} aria-hidden="true" />
      <div className="top">
        <div className="cover">
          <BookThumbnail book={book} hasImage={hasCoverImage} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div className="badges">
            <span className="nd-pill">{isPaid ? "Coming soon" : "Free"}</span>
            {isPaid && typeof price === "number" && <span className="price">${price.toFixed(2)} ebook</span>}
          </div>

          <h3 id={`book-title-${book.slug}`}>{book.title}</h3>

          {book.summary && <p className="sum">{book.summary}</p>}
          {book.summaryAudience && <p className="sum">{book.summaryAudience}</p>}

          {/* Noel's books are sold and delivered on SAPopedia. */}
          <a
            className={isPaid ? "nd-btn nd-btn-secondary" : "nd-btn nd-btn-primary magnetic"}
            href={SAPOPEDIA_BOOKS}
            target="_blank"
            rel="noopener"
          >
            Get it on SAPopedia <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      {items.length > 0 && (
        <div className="nda-acc">
          <BookAccordion idPrefix={`book-${book.slug}`} items={items} />
        </div>
      )}
    </article>
  );
}
