import Link from "next/link";
import Image from "next/image";
import { CATEGORIES, type PostRecord } from "@/lib/content";
import FadeUp from "@/components/article/FadeUp";

export interface RelatedCandidate {
  slug: string;
  title: string;
  category: string;
  excerpt?: string;
  hero?: string;
  readingMinutes?: number;
}

/**
 * Picks related articles using a two-stage rank:
 *   1. Tag overlap with the current post (highest signal for topic fit).
 *   2. Same category (broader fallback).
 *   3. Finally, anything else from the locale pool.
 *
 * Returns at most `limit` candidates, deduplicated and excluding the current
 * post. Intended to be called from server components / page files.
 */
export function pickRelated(
  current: PostRecord,
  pool: PostRecord[],
  limit = 4
): RelatedCandidate[] {
  const currentSlug = current.frontmatter.slug;
  const currentTags = new Set((current.frontmatter.tags || []).map((t) => t.toLowerCase()));

  type Scored = { post: PostRecord; score: number };
  const scored: Scored[] = [];

  for (const p of pool) {
    if (p.frontmatter.slug === currentSlug) continue;
    let score = 0;
    const tagOverlap = (p.frontmatter.tags || []).filter((t) =>
      currentTags.has(t.toLowerCase())
    ).length;
    score += tagOverlap * 3;
    if (p.frontmatter.category === current.frontmatter.category) score += 2;
    scored.push({ post: p, score });
  }

  scored.sort((a, b) => b.score - a.score);

  // If every candidate scored 0 we still want deterministic output rather than
  // "first N by scan order" — fall back to most-recent by date.
  const hasAnyScore = scored.some((s) => s.score > 0);
  if (!hasAnyScore) {
    scored.sort(
      (a, b) =>
        new Date(b.post.frontmatter.date).getTime() -
        new Date(a.post.frontmatter.date).getTime()
    );
  }

  return scored.slice(0, limit).map(({ post }) => ({
    slug: post.frontmatter.slug,
    title: post.frontmatter.title,
    category: post.frontmatter.category,
    excerpt: post.frontmatter.excerpt,
    hero: post.frontmatter.hero,
  }));
}

/**
 * Block of 3–4 related article cards. Caller supplies the label slot
 * ("Related reading", "Continue reading", "Recommended for IT leaders", …)
 * so the same component can appear mid- and end-article without repeating.
 */
export default function RelatedArticles({
  label = "Related reading",
  items,
  localePrefix,
  columns = 3,
}: {
  label?: string;
  items: RelatedCandidate[];
  localePrefix: string;
  columns?: 2 | 3 | 4;
}) {
  if (!items.length) return null;
  const colsClass =
    columns === 4
      ? "md:grid-cols-4"
      : columns === 2
        ? "md:grid-cols-2"
        : "md:grid-cols-3";

  return (
    <section className="mt-16 mb-4 rounded-[20px] bg-gradient-to-br from-cream to-paper border border-corbeau/[0.08] p-8 md:p-10 shadow-[0_2px_20px_rgba(14,16,32,0.04)]">
      <header className="flex items-baseline justify-between mb-7 pb-5 border-b border-corbeau/[0.08]">
        <div>
          <p className="font-mono text-[0.68rem] font-medium tracking-[2px] uppercase text-papaya mb-1.5">
            {label}
          </p>
          <h2 className="font-display font-black text-corbeau text-[1.35rem] md:text-[1.5rem] tracking-[-0.025em] leading-[1.1]">
            More from the archive
          </h2>
        </div>
        <Link
          href={`${localePrefix}/`}
          className="hidden md:inline-flex items-center gap-1.5 font-mono text-[0.68rem] font-medium tracking-[2px] uppercase text-corbeau/60 hover:text-papaya transition-colors"
        >
          Browse all
          <span aria-hidden>→</span>
        </Link>
      </header>
      <div className={`grid grid-cols-1 ${colsClass} gap-4`}>
        {items.map((r, idx) => {
          const catMeta = CATEGORIES[r.category as keyof typeof CATEGORIES];
          const href = `${localePrefix}/${r.slug}`;
          return (
            <FadeUp key={r.slug} delay={idx * 80}>
              <Link
                href={href}
                className="group relative flex gap-4 rounded-xl bg-paper border border-corbeau/[0.08] p-4 hover:border-papaya/60 hover:-translate-y-[5px] hover:shadow-[0_16px_40px_rgba(14,16,32,0.13)] transition-all duration-300"
              >
                <div className="relative flex-shrink-0 w-[92px] h-[92px] md:w-[108px] md:h-[108px] rounded-lg overflow-hidden bg-bone/60 border-2 border-transparent group-hover:border-papaya/40 transition-colors">
                  {r.hero ? (
                    <Image
                      src={r.hero}
                      alt=""
                      fill
                      sizes="108px"
                      className="object-cover group-hover:scale-[1.07] transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="absolute inset-0 flex items-center justify-center font-display font-black text-[1.8rem] text-corbeau/20 tracking-[-0.04em]"
                      style={{
                        background:
                          "linear-gradient(135deg,#faf6f0,#fffdf9)",
                      }}
                    >
                      {r.title.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                  {catMeta && (
                    <p className="font-mono text-[0.58rem] font-medium tracking-[2px] uppercase text-papaya mb-1.5">
                      {catMeta.label}
                    </p>
                  )}
                  <h3 className="font-display font-bold text-corbeau text-[0.98rem] tracking-[-0.02em] leading-[1.25] mb-1.5 group-hover:text-papaya transition-colors line-clamp-3">
                    {r.title}
                  </h3>
                  {r.excerpt && (
                    <p className="text-night/70 text-[0.8rem] leading-[1.5] line-clamp-2">
                      {r.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </FadeUp>
          );
        })}
      </div>
    </section>
  );
}
