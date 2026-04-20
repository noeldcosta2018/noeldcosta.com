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
        className="font-display font-black text-corbeau tracking-[-0.035em] leading-[1.08] mb-5"
        style={{ fontSize: "clamp(2rem, 4.2vw, 2.9rem)" }}
      >
        {title}
      </h1>

      {deck && (
        <p className="text-night leading-[1.6] text-[1.1rem] md:text-[1.18rem] max-w-[40rem] mb-8 font-normal">
          {deck}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 pb-6 border-b border-corbeau/[0.08]">
        <span className="flex items-center gap-3">
          <span className="relative w-9 h-9 rounded-full overflow-hidden border border-corbeau/[0.08] flex-shrink-0">
            <Image
              src="/headshot.png"
              alt={author}
              fill
              sizes="36px"
              className="object-cover object-top"
            />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-corbeau font-display font-bold text-[0.92rem] tracking-[-0.01em]">
              {author}
            </span>
            <span className="font-mono text-[0.65rem] uppercase tracking-[1.4px] text-silver mt-0.5">
              {updated ? "Updated " : ""}
              {dateLabel} · {readingMinutes} min read
            </span>
          </span>
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
