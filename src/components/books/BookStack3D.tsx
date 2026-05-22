/**
 * BookStack3D — fanned stack of 4 typographic book covers for the hero.
 *
 * Pure CSS transforms (rotate + translate) on 4 BookCover placeholders.
 * Server component. No motion library, no 3D engine, no stock art.
 *
 * Each cover reads at a slight angle so the four titles are still legible.
 * Hidden under md per the hero layout in /books/page.tsx.
 */

import type { BookFrontmatter } from "@/types/book";
import BookCover from "./BookCover";

export default function BookStack3D({ books }: { books: BookFrontmatter[] }) {
  // Stack expects 4 books in display order. Anything beyond 4 is trimmed.
  const stack = books.slice(0, 4);

  // Per-card transforms: small rotation + small offset so the fan reads
  // without obscuring any single title. The active "front" book sits
  // centred and upright (no rotation) so the reader's eye lands there.
  const transforms = [
    "rotate(-9deg) translate(-46px,18px)",
    "rotate(-3deg) translate(-14px,4px)",
    "rotate(3deg) translate(18px,2px)",
    "rotate(9deg) translate(50px,16px)",
  ];
  const zIndices = [10, 30, 40, 20];

  return (
    <div
      className="relative mx-auto"
      style={{ width: 360, height: 380 }}
      aria-hidden
    >
      {stack.map((b, i) => (
        <div
          key={b.slug}
          className="absolute left-1/2 top-0 -translate-x-1/2 origin-bottom transition-transform duration-300"
          style={{
            transform: transforms[i] ?? "none",
            zIndex: zIndices[i] ?? 10,
          }}
        >
          <BookCover book={b} hasImage={false} size="sm" />
        </div>
      ))}
    </div>
  );
}
