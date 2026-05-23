"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/**
 * BooksHeroIntro — client island for the /books hero with a subtle
 * fade-up on mount. Kept separate so the rest of the page stays a
 * server component.
 *
 * No parallax. Just a quiet entry. Honours prefers-reduced-motion by
 * skipping the y transform.
 */

export default function BooksHeroIntro() {
  const reduce = useReducedMotion();
  const initial = reduce ? { opacity: 0 } : { opacity: 0, y: 12 };
  const animate = { opacity: 1, y: 0 };

  return (
    <div className="max-w-[1200px] mx-auto grid grid-cols-[1.1fr_1fr] gap-12 items-center max-md:grid-cols-1 max-md:gap-10">
      <motion.div
        initial={initial}
        animate={animate}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <p className="font-mono text-[0.72rem] tracking-[2px] uppercase text-eyebrow mb-4">
          [ 01 · Books ]
        </p>
        <h1
          className="font-display font-black tracking-[-0.04em] leading-[1.05] text-corbeau mb-5 max-w-[640px]"
          style={{ fontSize: "clamp(2.2rem,4.5vw,3.4rem)" }}
        >
          Books for teams building, fixing, or surviving ERP and AI programmes.
        </h1>
        <p className="text-night text-[1.02rem] leading-[1.65] max-w-[560px] mb-6">
          I write for SAP consultants, CIOs, CFOs, and programme leaders
          who need clear answers. The stuff I wish more teams knew before
          they spent millions getting it wrong.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <a
            href="#free-books"
            className="inline-flex items-center justify-center bg-papaya text-corbeau font-bold text-[0.95rem] px-6 py-3 min-h-[44px] rounded-[10px] no-underline transition-all hover:bg-[#fb8843] hover:-translate-y-px"
          >
            Browse free books
          </a>
          <a
            href="#paid-books"
            className="inline-flex items-center justify-center bg-transparent text-corbeau font-bold text-[0.95rem] px-6 py-3 min-h-[44px] rounded-[10px] border border-corbeau transition-all hover:bg-corbeau hover:text-bone"
          >
            Browse paid books
          </a>
        </div>
        <p className="font-mono text-[0.72rem] tracking-[2px] uppercase text-eyebrow mt-6">
          25 years in ERP · CIMA &amp; AICPA · $700M+ delivered
        </p>
      </motion.div>
      <motion.div
        className="flex justify-center md:justify-end"
        initial={initial}
        animate={animate}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.08 }}
      >
        <div
          className="relative w-full max-w-[360px] md:max-w-[420px] aspect-[4/5] rounded-[14px] bg-paper p-3 md:p-4"
          style={{
            boxShadow:
              "0 1px 2px rgba(14,16,32,0.06), 0 12px 36px rgba(252,152,90,0.12), 0 36px 64px rgba(14,16,32,0.18)",
            outline: "1px solid rgba(14,16,32,0.12)",
            outlineOffset: "-1px",
          }}
        >
          <div className="relative w-full h-full overflow-hidden rounded-[8px]">
            <Image
              src="/books/noel-with-book.webp"
              alt="Noel D'Costa speaking, holding the SAP Careers in the $200K AI Era book"
              fill
              sizes="(min-width: 768px) 420px, 360px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
