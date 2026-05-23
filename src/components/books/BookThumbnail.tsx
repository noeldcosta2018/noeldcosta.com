/**
 * BookThumbnail — 3D book mockup using pure CSS transforms.
 *
 * Renders the cover face (next/image of the JPG, or typographic placeholder
 * when no cover yet), a darker spine slab to the left, and a thin page stack
 * to the right. Sits on a soft papaya-tinted warm shadow so it reads as a
 * physical book just above the surface.
 *
 * Hover (desktop) opens the rotation a few more degrees. Respects
 * prefers-reduced-motion via a CSS @media query in the transition rule.
 *
 * Server component. No client JS.
 */

import Image from "next/image";
import type { BookFrontmatter } from "@/types/book";

interface Props {
  book: BookFrontmatter;
  hasImage: boolean;
}

// 2:3 book proportions. Cover face dimensions per breakpoint.
const COVER_W_DESKTOP = 220;
const COVER_H_DESKTOP = 330;
const COVER_W_MOBILE = 160;
const COVER_H_MOBILE = 240;
const SPINE_W = 10;
const PAGES_W = 6;

export default function BookThumbnail({ book, hasImage }: Props) {
  // Derive a slightly darker spine color from coverColor. Falls back to
  // corbeau if parsing fails.
  const spineColor = darken(book.coverColor, 0.25);

  return (
    <div
      className="bt-perspective relative inline-block"
      aria-hidden={false}
      aria-label={`Cover of ${book.title}`}
    >
      <div className="bt-book relative">
        {/* Spine slab — left edge */}
        <div
          className="bt-spine absolute top-0 bottom-0"
          style={{
            width: SPINE_W,
            left: -SPINE_W,
            background: `linear-gradient(to right, ${spineColor} 0%, ${book.coverColor} 100%)`,
            borderTopLeftRadius: 2,
            borderBottomLeftRadius: 2,
          }}
        />

        {/* Cover face */}
        <div className="bt-face relative overflow-hidden">
          {hasImage && book.coverImage ? (
            <Image
              src={book.coverImage}
              alt={`Cover of ${book.title}`}
              fill
              sizes="(min-width: 768px) 220px, 160px"
              className="object-cover"
            />
          ) : (
            <div
              className="absolute inset-0 flex flex-col justify-between p-4"
              style={{
                background: book.coverColor,
                color: book.accentColor,
              }}
            >
              <div
                className="font-mono text-[0.6rem] tracking-[2px] uppercase"
                style={{ color: book.accentColor, opacity: 0.8 }}
              >
                Noel D&apos;Costa
              </div>
              <div
                className="font-display font-black leading-[1.05] tracking-[-0.02em]"
                style={{
                  color: book.accentColor,
                  fontSize: "1.05rem",
                }}
              >
                {book.title}
              </div>
              <div
                className="h-[3px] w-10 rounded-full"
                style={{ background: book.accentColor, opacity: 0.9 }}
              />
            </div>
          )}
        </div>

        {/* Page stack — right edge */}
        <div
          className="bt-pages absolute top-[3px] bottom-[3px]"
          style={{
            width: PAGES_W,
            right: -PAGES_W,
            background:
              "linear-gradient(to right, #faf6f0 0%, #fffdf9 40%, #f4ede4 60%, #fffdf9 80%, #faf6f0 100%)",
            borderTopRightRadius: 2,
            borderBottomRightRadius: 2,
          }}
        />
      </div>

      <style>{`
        .bt-perspective {
          perspective: 900px;
          width: ${COVER_W_MOBILE}px;
          height: ${COVER_H_MOBILE}px;
        }
        @media (min-width: 768px) {
          .bt-perspective {
            width: ${COVER_W_DESKTOP}px;
            height: ${COVER_H_DESKTOP}px;
          }
        }
        .bt-book {
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transform: rotateY(-14deg) rotateX(2deg);
          transition: transform 220ms ease-out;
          filter: drop-shadow(0 12px 24px rgba(252,152,90,0.18))
                  drop-shadow(0 24px 40px rgba(14,16,32,0.22));
        }
        @media (min-width: 768px) {
          .bt-book {
            transform: rotateY(-18deg) rotateX(2deg);
          }
          .bt-perspective:hover .bt-book {
            transform: rotateY(-22deg) rotateX(2deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bt-book {
            transition: none;
          }
        }
        .bt-face {
          width: 100%;
          height: 100%;
          border-radius: 2px 5px 5px 2px;
          background: ${book.coverColor};
        }
      `}</style>
    </div>
  );
}

// Hex darken — naive but adequate for spine shading. Accepts #rrggbb.
function darken(hex: string, amount: number): string {
  const m = /^#?([a-f0-9]{6})$/i.exec(hex);
  if (!m) return "#000000";
  const num = parseInt(m[1], 16);
  const r = Math.max(0, Math.round(((num >> 16) & 255) * (1 - amount)));
  const g = Math.max(0, Math.round(((num >> 8) & 255) * (1 - amount)));
  const b = Math.max(0, Math.round((num & 255) * (1 - amount)));
  return `#${[r, g, b]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
}
