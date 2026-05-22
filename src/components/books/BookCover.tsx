/**
 * Renders a book cover. When the cover image exists on disk, shows it.
 * Otherwise renders a typographic placeholder using the book's
 * coverColor + accentColor frontmatter.
 *
 * Server component. No motion, no client JS.
 */

import Image from "next/image";
import type { BookFrontmatter } from "@/types/book";

export default function BookCover({
  book,
  hasImage,
  size = "md",
}: {
  book: BookFrontmatter;
  hasImage: boolean;
  size?: "sm" | "md" | "lg";
}) {
  // Book proportions ~ 2:3. Tailwind doesn't have an aspect-[2/3] in
  // every version of the build pipeline, so we use an inline style.
  const widths: Record<string, number> = { sm: 160, md: 220, lg: 320 };
  const width = widths[size] ?? 220;
  const height = Math.round((width * 3) / 2);

  if (hasImage && book.coverImage) {
    return (
      <div
        className="relative overflow-hidden rounded-lg shadow-[0_12px_28px_rgba(14,16,32,0.18)]"
        style={{ width, height }}
      >
        <Image
          src={book.coverImage}
          alt={`Cover of ${book.title}`}
          fill
          sizes={`${width}px`}
          className="object-cover"
        />
      </div>
    );
  }

  // Typographic placeholder. Uses book.coverColor as bg, accentColor as
  // foreground. Title displayed in sentence-case wrap.
  return (
    <div
      className="relative overflow-hidden rounded-lg shadow-[0_12px_28px_rgba(14,16,32,0.18)] flex flex-col justify-between p-5"
      style={{
        width,
        height,
        background: book.coverColor,
        color: book.accentColor,
      }}
      aria-label={`Cover of ${book.title}`}
    >
      <div
        className="font-mono text-[0.62rem] tracking-[2px] uppercase"
        style={{ color: book.accentColor, opacity: 0.8 }}
      >
        Noel D&apos;Costa
      </div>

      <div
        className="font-display font-black leading-[1.05] tracking-[-0.02em]"
        style={{
          color: book.accentColor,
          fontSize:
            size === "lg"
              ? "clamp(1.3rem,2.6vw,1.85rem)"
              : size === "md"
                ? "1.15rem"
                : "0.95rem",
        }}
      >
        {book.title}
      </div>

      <div
        className="h-[3px] w-12 rounded-full"
        style={{ background: book.accentColor, opacity: 0.9 }}
        aria-hidden
      />
    </div>
  );
}
