import Image from "next/image";
import Link from "next/link";

interface ArticleHeroProps {
  category?: { label: string; slug: string };
  title: string;
  deck?: string;
  author?: string;
  date: string;
  updated?: string;
  readingMinutes: number;
  heroImage?: string;
  heroAlt?: string;
  localePrefix: string;
}

/**
 * Editorial article hero. Scale and weight tuned to match the site's Hero
 * component (Epilogue font-black, tracking-[-0.04em], clamp-scaled H1) so an
 * article page doesn't look like a different site from the homepage.
 *
 * Byline uses the real headshot from /public/headshot.png — never a letter
 * placeholder.
 */
// Single-author publication. Raw WordPress author slugs (e.g. "noeldcosta")
// leaked in via frontmatter — normalise to the display name unconditionally
// rather than asking the migration to clean 1,700 files.
const DISPLAY_AUTHOR = "Noel D'Costa";

export default function ArticleHero({
  category,
  title,
  deck,
  // Kept for prop compatibility but intentionally ignored — see above.
  author: _author,
  date,
  updated,
  readingMinutes,
  heroImage,
  heroAlt,
  localePrefix,
}: ArticleHeroProps) {
  const author = DISPLAY_AUTHOR;
  void _author;
  const displayDate = new Date(updated || date);
  const dateLabel = displayDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="mb-12">
      {category && (
        <Link
          href={`${localePrefix}/category/${category.slug}`}
          className="inline-flex items-center gap-2 font-mono text-[0.68rem] font-medium tracking-[2px] uppercase text-papaya mb-5 hover:text-canyon transition-colors"
        >
          <span className="w-[7px] h-[7px] rounded-full bg-papaya" />
          {category.label}
        </Link>
      )}

      <h1
        className="font-display font-black text-corbeau tracking-[-0.04em] leading-[1.1] mb-6"
        style={{ fontSize: "clamp(1.6rem, 2.4vw, 1.95rem)" }}
      >
        {title}
      </h1>

      {deck && (
        <p className="text-night leading-[1.7] text-[1.1rem] md:text-[1.2rem] max-w-[42rem] mb-8 font-normal">
          {deck}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pb-7 border-b border-corbeau/[0.08]">
        <span className="flex items-center gap-3">
          <span className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-papaya/20 flex-shrink-0">
            <Image
              src="/headshot.png"
              alt={author}
              fill
              sizes="40px"
              className="object-cover object-top"
            />
          </span>
          <span className="flex flex-col leading-tight gap-0.5">
            <span className="text-corbeau font-display font-bold text-[0.94rem] tracking-[-0.01em]">
              {author}
            </span>
            <span className="font-mono text-[0.63rem] uppercase tracking-[1.5px] text-silver">
              {updated ? "Updated " : ""}{dateLabel}
            </span>
          </span>
        </span>
        <span className="h-4 w-px bg-corbeau/[0.12] hidden sm:block" aria-hidden />
        <span className="font-mono text-[0.63rem] uppercase tracking-[1.5px] text-silver">
          {readingMinutes} min read
        </span>
      </div>

      {heroImage && (
        <figure className="mt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={heroAlt || title}
            className="w-full h-auto rounded-xl border border-corbeau/[0.06] shadow-[0_8px_32px_rgba(14,16,32,0.08)]"
          />
        </figure>
      )}
    </header>
  );
}
