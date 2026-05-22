/**
 * Compact card for a free book in the index grid.
 *
 * Used for books that are not the featured book and not the paid playbook.
 * If status is "coming-soon", the email capture form acts as a waitlist
 * sign-up. If "available", same form is the download trigger.
 *
 * Server component. The email form inside is the only client island.
 */

import EmailCaptureForm from "./EmailCaptureForm";
import BookCover from "./BookCover";
import StatusBadge from "./StatusBadge";
import type { BookRecord } from "@/types/book";
import { coverExists } from "@/lib/books";

export default function BookCard({ book }: { book: BookRecord }) {
  const fm = book.frontmatter;
  const hasImage = coverExists(fm.coverImage);
  const isAvailable = fm.status === "available";

  return (
    <article
      className="grid grid-cols-[220px_1fr] gap-8 max-md:grid-cols-1 max-md:gap-6 bg-paper border border-corbeau/[0.08] rounded-2xl p-6 max-md:p-5 transition-all hover:border-corbeau/[0.14] hover:shadow-[0_1px_2px_rgba(14,16,32,0.04),0_8px_24px_rgba(14,16,32,0.04)]"
      id={`book-${fm.slug}`}
    >
      <div className="max-md:flex max-md:justify-start">
        <BookCover book={fm} hasImage={hasImage} size="md" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <StatusBadge available={isAvailable} surface="light" />
          <span className="font-mono text-[0.66rem] tracking-[1.5px] uppercase text-eyebrow">
            Free
          </span>
        </div>

        <h3
          className="font-display font-black text-corbeau tracking-[-0.02em] leading-[1.15] mb-2"
          style={{ fontSize: "clamp(1.25rem,2.2vw,1.55rem)" }}
        >
          {fm.title}
        </h3>

        <p className="text-night text-[0.95rem] leading-[1.65] mb-3 max-w-[560px]">
          {fm.summary}
        </p>

        <p className="font-mono text-[0.7rem] tracking-[1px] uppercase text-eyebrow mb-4">
          For: <span className="text-night normal-case tracking-normal font-sans">{fm.audience}</span>
        </p>

        {fm.whatsInside.length > 0 ? (
          <ol className="list-decimal pl-5 mb-5 marker:text-papaya marker:font-mono marker:text-[0.78rem]">
            {fm.whatsInside.slice(0, 4).map((item, i) => (
              <li
                key={i}
                className="text-night text-[0.88rem] leading-[1.55] mb-1.5"
              >
                {item}
              </li>
            ))}
          </ol>
        ) : fm.topics ? (
          <p className="text-night text-[0.9rem] leading-[1.6] mb-5">
            <span className="font-mono text-[0.68rem] tracking-[1.5px] uppercase text-eyebrow mr-1">
              Topics in this book:
            </span>
            {fm.topics}
          </p>
        ) : null}

        {/* TODO(waitlist-count): when a real waitlist backend is wired,
            render the live signup count here for coming-soon books, e.g.
            <p className="font-mono text-[0.7rem] tracking-[1.5px] uppercase
            text-eyebrow mb-3">187 on the waitlist</p>. Do not invent counts. */}

        <div className="mt-auto">
          <p className="font-mono text-[0.68rem] tracking-[1.5px] uppercase text-eyebrow mb-2.5">
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
