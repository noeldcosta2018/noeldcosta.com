"use client";

import { useRef, useState } from "react";
import BookCard from "./BookCard";
import LeadCaptureModal, { type LeadModalContext } from "./LeadCaptureModal";
import type { BookFrontmatter } from "@/types/book";

/**
 * BookSection — horizontal scroll-snap row of BookCards plus one shared
 * lead-capture modal.
 *
 * Used twice on /books: once for the Free section, once for the Paid section.
 * The row is built to scale — six cards land without any code changes,
 * just a wider scroll surface. Desktop shows two cards visible; mobile
 * shows one per swipe.
 */

interface BookWithCover {
  fm: BookFrontmatter;
  hasCoverImage: boolean;
}

interface Props {
  books: BookWithCover[];
  eyebrow: string;
  heading: string;
  intro: string;
  sectionId: string;
}

export default function BookSection({
  books,
  eyebrow,
  heading,
  intro,
  sectionId,
}: Props) {
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

  return (
    <section
      id={sectionId}
      className="bg-cream"
      style={{ padding: "clamp(4rem,8vw,6rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          {eyebrow}
        </p>
        <h2
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-3 text-corbeau"
          style={{ fontSize: "clamp(1.85rem,3.8vw,2.6rem)" }}
        >
          {heading}
        </h2>
        <p className="text-night text-[1rem] max-w-[560px] leading-[1.7] mb-10">
          {intro}
        </p>

        {/* Two-up grid on desktop, single column on mobile. Books wrap to
            the next row as the section grows beyond two titles. */}
        <ul
          className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 list-none p-0 m-0"
          aria-label={`${heading} list`}
        >
          {books.map(({ fm, hasCoverImage }) => (
            <li key={fm.slug} className="flex">
              <BookCard
                book={fm}
                hasCoverImage={hasCoverImage}
                onRequest={onRequest}
              />
            </li>
          ))}
        </ul>
      </div>

      <LeadCaptureModal
        open={open}
        context={context}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
      />
    </section>
  );
}
