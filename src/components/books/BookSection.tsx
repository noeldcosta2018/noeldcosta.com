"use client";

import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import BookCard from "./BookCard";
import LeadCaptureModal, { type LeadModalContext } from "./LeadCaptureModal";
import type { BookFrontmatter } from "@/types/book";

/**
 * BookSection — grid of BookCards plus one shared lead-capture modal.
 *
 * Used twice on /books: once for Free, once for Paid.
 *
 * Motion: heading + intro fade-up on scroll-into-view. Cards stagger in
 * at 80ms intervals. `useInView` with once:true so reveal does not
 * re-fire on scroll-back. All motion collapses to a static render when
 * the user prefers reduced motion.
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
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { once: true, margin: "0px 0px -10% 0px" });

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

  // Reveal variants. If reduced motion, we render in-state immediately
  // and skip transforms.
  const headInitial = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 };
  const headAnimate =
    reduceMotion || inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 };
  const cardInitial = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 };

  return (
    <section
      id={sectionId}
      ref={sectionRef}
      className="bg-cream"
      style={{ padding: "clamp(4rem,8vw,6rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <motion.p
          initial={headInitial}
          animate={headAnimate}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2"
        >
          {eyebrow}
        </motion.p>
        <motion.h2
          initial={headInitial}
          animate={headAnimate}
          transition={{ duration: 0.36, ease: "easeOut", delay: 0.04 }}
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-3 text-corbeau"
          style={{ fontSize: "clamp(1.85rem,3.8vw,2.6rem)" }}
        >
          {heading}
        </motion.h2>
        <motion.p
          initial={headInitial}
          animate={headAnimate}
          transition={{ duration: 0.36, ease: "easeOut", delay: 0.08 }}
          className="text-night text-[1rem] max-w-[560px] leading-[1.7] mb-10"
        >
          {intro}
        </motion.p>

        {/* Equal-height grid. items-stretch keeps neighbouring cards visually
            aligned even when one has more FAQ text than the other. */}
        <ul
          className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 list-none p-0 m-0 items-stretch"
          aria-label={`${heading} list`}
        >
          {books.map(({ fm, hasCoverImage }, i) => (
            <motion.li
              key={fm.slug}
              className="flex h-full"
              initial={cardInitial}
              animate={
                reduceMotion || inView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 16 }
              }
              transition={{
                duration: 0.36,
                ease: "easeOut",
                delay: reduceMotion ? 0 : 0.12 + i * 0.08,
              }}
            >
              <BookCard
                book={fm}
                hasCoverImage={hasCoverImage}
                onRequest={onRequest}
              />
            </motion.li>
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
