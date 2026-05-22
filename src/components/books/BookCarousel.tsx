"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BookCover from "./BookCover";
import BookAccordion, { type AccordionItem } from "./BookAccordion";
import BookModal, { type BookModalContext } from "./BookModal";
import type { BookFrontmatter } from "@/types/book";

/**
 * BookCarousel — primary catalogue for /books.
 *
 * Pattern cloned from VideoCarousel.tsx: CSS scroll-snap on a horizontal
 * flex row, arrows for desktop, native swipe for mobile, edge-mask via
 * overflow + padding.
 *
 * Owns:
 *   - the per-card "View details" toggle (opens the accordion section
 *     below the carousel for that book)
 *   - the modal open/close state (one shared modal for all 4 books)
 *
 * Server-side counterpart in /books/page.tsx renders the section shell,
 * the FAQ JSON-LD, and the Book schema. This component owns the
 * interactivity only.
 */

interface Props {
  books: BookFrontmatter[];
}

const CARD_WIDTH = 320;
const CARD_GAP = 16;

function cheapestPrice(b: BookFrontmatter): number {
  if (b.kind !== "paid" || !b.pricing) return 0;
  const candidates = [
    b.pricing.ebook?.amount,
    b.pricing.paperback?.amount,
    b.pricing.hardcoverBundle?.amount,
  ].filter((n): n is number => typeof n === "number" && n > 0);
  if (candidates.length === 0) return 0;
  return Math.min(...candidates);
}

function bookToContext(b: BookFrontmatter): BookModalContext {
  return {
    bookSlug: b.slug,
    bookTitle: b.title,
    bookType: b.kind,
    price: cheapestPrice(b),
  };
}

function accordionItemsFor(b: BookFrontmatter): AccordionItem[] {
  const d = b.details;
  if (!d) return [];
  return [
    { q: "Who is this for?", a: d.whoFor },
    { q: "What will you get from this book?", a: d.whatYouGet },
    { q: "What problem does it solve?", a: d.problemSolved },
    { q: "What is inside?", a: d.whatIsInside },
    { q: "Is it free or paid?", a: d.freeOrPaid },
    { q: "How will I receive it?", a: d.howReceived },
  ];
}

export default function BookCarousel({ books }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<BookModalContext | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Which book's accordion is visible. Defaults to the featured book or
  // the first in the list.
  const initialDetailIndex = Math.max(
    0,
    books.findIndex((b) => b.featured),
  );
  const [detailIndex, setDetailIndex] = useState<number>(
    initialDetailIndex >= 0 ? initialDetailIndex : 0,
  );

  // Scroll-position → arrow enable/disable + active page dot.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanPrev(scrollLeft > 8);
      setCanNext(scrollLeft + clientWidth < scrollWidth - 8);
      const step = CARD_WIDTH + CARD_GAP;
      const idx = Math.round(scrollLeft / step);
      setActiveIndex(Math.min(books.length - 1, Math.max(0, idx)));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [books.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (CARD_WIDTH + CARD_GAP), behavior: "smooth" });
  };

  const jumpTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * (CARD_WIDTH + CARD_GAP), behavior: "smooth" });
  };

  function openModalFor(b: BookFrontmatter, trigger: HTMLElement | null) {
    triggerRef.current = trigger;
    setModalContext(bookToContext(b));
    setModalOpen(true);
  }

  function showDetails(i: number) {
    setDetailIndex(i);
    // Scroll the accordion into view on small screens where the carousel
    // and accordion can sit far apart.
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        document
          .getElementById("book-details")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  return (
    <div>
      {/* Carousel header row — prev/next live here on desktop. */}
      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex overflow-x-auto snap-x snap-mandatory pb-4 pr-4 -mr-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ gap: CARD_GAP, scrollPaddingLeft: 0 }}
          aria-label="Books carousel"
        >
          {books.map((b, i) => {
            const isPaid = b.kind === "paid";
            const price = cheapestPrice(b);
            return (
              <article
                key={b.slug}
                className="bg-paper border border-corbeau/[0.06] rounded-[14px] overflow-hidden shrink-0 snap-start transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(14,16,32,0.08)]"
                style={{ width: CARD_WIDTH }}
                aria-labelledby={`book-card-title-${b.slug}`}
              >
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex justify-center">
                    <BookCover book={b} hasImage={false} size="md" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`font-mono text-[0.65rem] tracking-[1.5px] uppercase px-2 py-1 rounded ${
                          isPaid
                            ? "bg-papaya/[0.15] text-canyon font-semibold"
                            : "bg-corbeau/[0.06] text-night"
                        }`}
                      >
                        {isPaid ? "Paid" : "Free"}
                      </span>
                      {isPaid && price > 0 && (
                        <span className="font-mono text-[0.72rem] text-eyebrow">
                          from ${price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <h3
                      id={`book-card-title-${b.slug}`}
                      className="font-display font-black tracking-[-0.02em] text-corbeau leading-[1.2]"
                      style={{ fontSize: "1.2rem" }}
                    >
                      {b.title}
                    </h3>
                    {b.subtitle && (
                      <p className="text-night text-[0.9rem] leading-[1.5] mt-1.5 line-clamp-3">
                        {b.subtitle}
                      </p>
                    )}
                  </div>

                  {b.bullets && b.bullets.length > 0 && (
                    <ul className="list-none p-0 m-0 flex flex-col gap-1.5">
                      {b.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-2 text-night text-[0.88rem] leading-[1.5]"
                        >
                          <span
                            aria-hidden
                            className="inline-block w-1.5 h-1.5 bg-papaya mt-[7px] shrink-0"
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex flex-col gap-2 mt-1">
                    <button
                      type="button"
                      onClick={(e) => openModalFor(b, e.currentTarget)}
                      className="w-full inline-flex items-center justify-center bg-papaya text-corbeau font-bold text-[0.9rem] px-5 py-3 min-h-[44px] rounded-[10px] transition-all hover:bg-[#fb8843] hover:-translate-y-px"
                    >
                      {isPaid ? "Buy the book" : "Get the free book"}
                    </button>
                    <button
                      type="button"
                      onClick={() => showDetails(i)}
                      className="text-papaya font-semibold text-[0.85rem] hover:underline self-center"
                    >
                      View details →
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Arrow controls — desktop only. Mobile uses swipe. */}
        <div className="hidden md:flex absolute -top-14 right-0 gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={!canPrev}
            aria-label="Previous book"
            className="w-10 h-10 rounded-full border border-corbeau/15 bg-paper flex items-center justify-center transition-all duration-200 hover:bg-cream hover:border-corbeau/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} className="text-corbeau" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={!canNext}
            aria-label="Next book"
            className="w-10 h-10 rounded-full border border-corbeau/15 bg-paper flex items-center justify-center transition-all duration-200 hover:bg-cream hover:border-corbeau/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} className="text-corbeau" aria-hidden />
          </button>
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {books.map((b, i) => (
          <button
            key={b.slug}
            type="button"
            onClick={() => jumpTo(i)}
            aria-label={`Go to book ${i + 1}`}
            aria-current={activeIndex === i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              activeIndex === i ? "bg-papaya" : "bg-corbeau/30"
            }`}
            style={{ width: 6, height: 6 }}
          />
        ))}
      </div>

      {/* Accordion section — shows the details of whichever book the user
          last hit "View details" on. Defaults to the featured book. */}
      <div id="book-details" className="mt-16">
        {books[detailIndex] && (
          <>
            <div className="mb-6">
              <p className="font-mono text-[0.7rem] tracking-[2px] uppercase text-eyebrow mb-1.5">
                Book details
              </p>
              <h3
                className="font-display font-black tracking-[-0.02em] text-corbeau"
                style={{ fontSize: "clamp(1.4rem,2.5vw,1.75rem)" }}
              >
                {books[detailIndex].title}
              </h3>
            </div>
            <BookAccordion
              key={books[detailIndex].slug}
              idPrefix={`book-${books[detailIndex].slug}`}
              items={accordionItemsFor(books[detailIndex])}
            />
          </>
        )}
      </div>

      <BookModal
        open={modalOpen}
        context={modalContext}
        onClose={() => setModalOpen(false)}
        triggerRef={triggerRef}
      />
    </div>
  );
}
