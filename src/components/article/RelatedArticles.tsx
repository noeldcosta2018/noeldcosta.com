import Link from "next/link";
import { CATEGORIES, type PostRecord } from "@/lib/content";

export interface RelatedCandidate {
  slug: string;
  title: string;
  category: string;
  excerpt?: string;
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
    <section className="my-16">
      <p className="font-mono text-[0.68rem] font-medium tracking-[2px] uppercase text-papaya mb-5">
        {label}
      </p>
      <div className={`grid grid-cols-1 ${colsClass} gap-5`}>
        {items.map((r) => {
          const catMeta = CATEGORIES[r.category as keyof typeof CATEGORIES];
          const href = `${localePrefix}/${r.slug}`;
          return (
            <Link
              key={r.slug}
              href={href}
              className="group block bg-paper border border-corbeau/[0.06] rounded-xl p-5 hover:border-corbeau/20 hover:-translate-y-px hover:shadow-[0_8px_32px_rgba(14,16,32,0.08)] transition-all"
            >
              {catMeta && (
                <p className="font-mono text-[0.62rem] font-medium tracking-[2px] uppercase text-papaya mb-2">
                  {catMeta.label}
                </p>
              )}
              <h3 className="font-display font-bold text-corbeau text-[1.02rem] tracking-[-0.02em] leading-[1.25] mb-2 group-hover:text-papaya transition-colors">
                {r.title}
              </h3>
              {r.excerpt && (
                <p className="text-night/80 text-[0.86rem] leading-[1.55] line-clamp-3">
                  {r.excerpt}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
