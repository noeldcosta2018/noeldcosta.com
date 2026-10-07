"use client";

import { useRef, useState } from "react";
import BookCard from "./BookCard";
import LeadCaptureModal, { type LeadModalContext } from "./LeadCaptureModal";
import type { BookFrontmatter } from "@/types/book";

/**
 * BookSection: section header, a grid of BookCards and one shared
 * lead-capture modal. Used twice on /books: once for Free, once for Paid.
 * Cards appear with the page; the only motion is the cursor-lit border.
 */

interface BookWithCover {
  fm: BookFrontmatter;
  hasCoverImage: boolean;
}

interface Props {
  books: BookWithCover[];
  eyebrow: string;
  heading: string;
  highlight?: string;
  intro: string;
  sectionId: string;
}

export default function BookSection({ books, eyebrow, heading, highlight, intro, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<LeadModalContext | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  function onRequest(book: BookFrontmatter, trigger: HTMLElement | null) {
    triggerRef.current = trigger;
    setContext({
      bookSlug: book.slug,
      bookTitle: book.title,
      bookType: book.kind,
      price: book.price,
    });
    setOpen(true);
  }

  const titleId = `${sectionId}-title`;

  return (
    <section id={sectionId} className="nda-section" aria-labelledby={titleId} style={{ scrollMarginTop: "var(--nav)" }}>
      <div className="nda-wrap">
        <div className="nda-head">
          <div>
            <div className="nd-eyebrow">{eyebrow}</div>
            <h2 id={titleId} className="nd-display nd-h2">
              {heading}
              {highlight && (
                <>
                  {" "}
                  <span className="nd-hl">{highlight}</span>
                </>
              )}
            </h2>
            <p className="nd-lede">{intro}</p>
          </div>
        </div>

        <ul className={`nda-books n${Math.min(books.length, 3)}`} aria-label={`${heading} ${highlight ?? ""}`.trim()}>
          {books.map(({ fm, hasCoverImage }) => (
            <li key={fm.slug} style={{ display: "flex" }}>
              <BookCard book={fm} hasCoverImage={hasCoverImage} onRequest={onRequest} />
            </li>
          ))}
        </ul>
      </div>

      <LeadCaptureModal open={open} context={context} onClose={() => setOpen(false)} triggerRef={triggerRef} />
    </section>
  );
}
