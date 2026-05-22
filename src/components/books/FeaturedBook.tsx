/**
 * Larger treatment for the one featured book on /books.
 *
 * Two-column layout: cover on the left (bigger), full pitch on the right
 * with the email capture form. Used for whichever book has `featured: true`
 * in frontmatter — currently the SAP careers book.
 *
 * Content stack order (skim-first):
 *   badge → H3 title → subtitle → "What is inside" list →
 *   1-paragraph summary → meta chips → form.
 *
 * Cover sizing: full "lg" on desktop, "md" once we drop to single-column
 * so body copy has room to breathe next to it on tablet portrait.
 *
 * Server component. EmailCaptureForm is the only client island inside.
 */

import EmailCaptureForm from "./EmailCaptureForm";
import BookCover from "./BookCover";
import StatusBadge from "./StatusBadge";
import type { BookRecord } from "@/types/book";
import { coverExists } from "@/lib/books";

function formatMeta(book: BookRecord): string[] {
  const fm = book.frontmatter;
  const parts: string[] = [];
  if (fm.pages) parts.push(`${fm.pages} pages`);
  if (fm.readingTimeMinutes) {
    const hrs = Math.floor(fm.readingTimeMinutes / 60);
    const mins = fm.readingTimeMinutes % 60;
    if (hrs && mins) parts.push(`${hrs}h ${mins}m read`);
    else if (hrs) parts.push(`${hrs}h read`);
    else parts.push(`${mins} min read`);
  }
  if (fm.formats && fm.formats.length) parts.push(fm.formats.join(" + "));
  return parts;
}

export default function FeaturedBook({ book }: { book: BookRecord }) {
  const fm = book.frontmatter;
  const hasImage = coverExists(fm.coverImage);
  const metaParts = formatMeta(book);
  const isAvailable = fm.status === "available";

  return (
    <article
      id={`book-${fm.slug}`}
      className="grid grid-cols-[320px_1fr] gap-12 max-lg:grid-cols-1 max-lg:gap-8 bg-paper border border-corbeau/[0.08] rounded-2xl p-8 max-md:p-6 shadow-[0_2px_4px_rgba(14,16,32,0.04),0_12px_28px_rgba(252,152,90,0.08)]"
    >
      <div className="max-lg:flex max-lg:justify-start">
        {/* Big cover on desktop, smaller on mobile so body copy can flow
            alongside it on tablet portrait. */}
        <div className="max-md:hidden">
          <BookCover book={fm} hasImage={hasImage} size="lg" />
        </div>
        <div className="hidden max-md:block">
          <BookCover book={fm} hasImage={hasImage} size="sm" />
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <StatusBadge available={isAvailable} surface="light" />
          <span className="font-mono text-[0.66rem] tracking-[1.5px] uppercase text-eyebrow">
            Free download
          </span>
        </div>

        <h3
          className="font-display font-black text-corbeau tracking-[-0.03em] leading-[1.05] mb-3"
          style={{ fontSize: "clamp(1.7rem,3.2vw,2.4rem)" }}
        >
          {fm.title}
        </h3>

        {fm.subtitle && (
          <p
            className="font-display text-corbeau/80 leading-[1.3] mb-5"
            style={{ fontSize: "clamp(1rem,1.6vw,1.2rem)" }}
          >
            {fm.subtitle}
          </p>
        )}

        {fm.whatsInside.length > 0 && (
          <div className="mb-5">
            <p className="font-mono text-[0.68rem] tracking-[1.5px] uppercase text-eyebrow mb-2.5">
              What is inside
            </p>
            <ol className="list-decimal pl-5 marker:text-papaya marker:font-mono marker:text-[0.78rem]">
              {fm.whatsInside.map((item, i) => (
                <li
                  key={i}
                  className="text-night text-[0.92rem] leading-[1.6] mb-1.5"
                >
                  {item}
                </li>
              ))}
            </ol>
          </div>
        )}

        <p className="text-night text-[1rem] leading-[1.7] mb-5 max-w-[580px]">
          {fm.summary}
        </p>

        {/* Meta chip cluster: audience tag + pages + reading time +
            formats all on one row so the right column reads lighter. */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="font-mono text-[0.66rem] tracking-[1.5px] uppercase bg-corbeau/[0.04] text-eyebrow px-2 py-1 rounded">
            For: <span className="text-night normal-case tracking-normal font-sans">{fm.audience}</span>
          </span>
          {metaParts.map((part) => (
            <span
              key={part}
              className="font-mono text-[0.66rem] tracking-[1.5px] uppercase bg-corbeau/[0.04] text-eyebrow px-2 py-1 rounded"
            >
              {part}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-2 border-t border-corbeau/[0.06]">
          <p className="font-mono text-[0.68rem] tracking-[1.5px] uppercase text-eyebrow mt-5 mb-2.5">
            {isAvailable ? "Get the PDF + EPUB" : "Join the waitlist"}
          </p>
          <EmailCaptureForm
            bookSlug={fm.slug}
            bookTitle={fm.title}
            submitLabel={
              isAvailable ? "Send me the PDF" : "Notify me when it ships"
            }
          />
        </div>
      </div>
    </article>
  );
}
