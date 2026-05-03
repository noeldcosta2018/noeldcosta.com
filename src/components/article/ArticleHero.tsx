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

const DISPLAY_AUTHOR = "Noel D'Costa";

/**
 * Article hero with staggered CSS entrance animations.
 * Uses pure CSS keyframes (not IntersectionObserver) because the hero is
 * above the fold — it should animate in on page load, not on scroll.
 * `animation-fill-mode: both` keeps elements hidden until their delay fires,
 * preventing a flash of unstyled content.
 */
export default function ArticleHero({
  category,
  title,
  deck,
  author: _author,
  date,
  updated,
  readingMinutes,
  heroImage,
  heroAlt,
  localePrefix,
}: ArticleHeroProps) {
  void _author;
  const author = DISPLAY_AUTHOR;

  const displayDate = new Date(updated || date);
  const dateLabel = displayDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Shared animation base: fade-up-in keyframe defined in globals.css
  const anim = (delay: string) => ({
    animation: `fade-up-in 0.9s cubic-bezier(0.22,1,0.36,1) ${delay} both`,
  });

  return (
    <header className="mb-12">
      {category && (
        <Link
          href={`${localePrefix}/category/${category.slug}`}
          style={anim("100ms")}
          className="inline-flex items-center gap-2 font-mono text-[0.68rem] font-medium tracking-[2px] uppercase text-papaya mb-5 hover:text-canyon transition-colors"
        >
          <span className="w-[7px] h-[7px] rounded-full bg-papaya" />
          {category.label}
        </Link>
      )}

      <h1
        className="font-display font-black text-corbeau tracking-[-0.04em] leading-[1.1] mb-6"
        style={{ fontSize: "clamp(1.6rem, 2.4vw, 1.95rem)", ...anim("220ms") }}
      >
        {title}
      </h1>

      {deck && (
        <p
          className="text-night leading-[1.7] text-[1.1rem] md:text-[1.2rem] max-w-[42rem] mb-8 font-normal"
          style={anim("340ms")}
        >
          {deck}
        </p>
      )}

      <div
        className="flex flex-wrap items-center gap-x-5 gap-y-3 pb-7 border-b border-corbeau/[0.08]"
        style={anim("460ms")}
      >
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
        <figure className="mt-10" style={anim("580ms")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={heroAlt || title}
            className="w-full h-auto rounded-xl border-2 border-papaya/60 shadow-[0_12px_40px_rgba(14,16,32,0.14),0_4px_16px_rgba(252,152,90,0.10)]"
          />
        </figure>
      )}
    </header>
  );
}
