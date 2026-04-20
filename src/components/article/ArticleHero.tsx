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
 * Editorial-style article hero. Keeps the writing width narrow so headlines
 * land cleanly; reserves generous breathing room between category → H1 → deck
 * → byline row; the hero image sits below the metadata to avoid shoving
 * content below the fold.
 */
export default function ArticleHero({
  category,
  title,
  deck,
  author = "Noel D'Costa",
  date,
  updated,
  readingMinutes,
  heroImage,
  heroAlt,
  localePrefix,
}: ArticleHeroProps) {
  const displayDate = new Date(updated || date);
  const dateLabel = displayDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="mb-10">
      {category && (
        <Link
          href={`${localePrefix}/category/${category.slug}`}
          className="inline-block font-mono text-[0.68rem] font-semibold tracking-[2.5px] uppercase text-papaya mb-4 hover:text-canyon transition-colors"
        >
          {category.label}
        </Link>
      )}

      <h1 className="font-display font-black text-corbeau tracking-[-0.03em] leading-[1.05] text-[2.25rem] md:text-[3.25rem] mb-5">
        {title}
      </h1>

      {deck && (
        <p className="text-night leading-[1.55] text-[1.15rem] md:text-[1.25rem] max-w-[44rem] mb-7 font-light">
          {deck}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.72rem] uppercase tracking-[1.4px] text-night/70 pb-6 border-b border-corbeau/10">
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block w-6 h-6 rounded-full bg-corbeau text-bone font-display text-[0.65rem] font-bold uppercase leading-6 text-center"
          >
            {author.charAt(0)}
          </span>
          <span className="text-corbeau not-italic font-semibold tracking-[1.4px]">
            {author}
          </span>
        </span>
        <span aria-hidden className="text-corbeau/20">·</span>
        <time dateTime={updated || date}>
          {updated ? "Updated " : ""}
          {dateLabel}
        </time>
        <span aria-hidden className="text-corbeau/20">·</span>
        <span>{readingMinutes} min read</span>
      </div>

      {heroImage && (
        <figure className="mt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={heroAlt || title}
            className="w-full h-auto rounded-[14px] shadow-[0_1px_0_rgba(14,16,32,0.05),0_20px_40px_-20px_rgba(14,16,32,0.15)]"
          />
        </figure>
      )}
    </header>
  );
}
