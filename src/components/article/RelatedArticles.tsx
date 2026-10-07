import Link from "next/link";
import Image from "next/image";
import { CATEGORIES, type Locale, type PostRecord } from "@/lib/content";
import { imageAvailable } from "@/components/article/image-available";
import { translator } from "@/i18n";
import { localizeHref } from "@/lib/link-repair";
import { publicPrefixFromContentLocale } from "@/lib/locale-url";

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
    hero: imageAvailable(post.frontmatter.hero) ? post.frontmatter.hero : undefined,
  }));
}

const ARTICLES_INDEX = "/best-sap-articles-for-implementation-noel-dcosta/";

/**
 * Related reading as a grid of post cards (the same nd-post-card used by the
 * archives). The caller supplies the eyebrow label so the block can be reused.
 * With a locale, the interface text goes through the i18n dictionary and the
 * cards link to the translated article when it is published.
 */
export default function RelatedArticles({
  label = "Related reading",
  title = "More from the archive",
  items,
  locale = "en",
}: {
  label?: string;
  title?: string;
  items: RelatedCandidate[];
  locale?: Locale;
}) {
  if (!items.length) return null;
  const tr = translator(locale);
  const prefix = publicPrefixFromContentLocale(locale);
  const href = (h: string) => localizeHref(prefix, h);

  return (
    <section
      className="nd-related"
      data-heading-region="related-articles"
      aria-labelledby="nd-related-title"
    >
      <div className="nd-related-head">
        <div>
          <p className="nd-eyebrow">{tr(label)}</p>
          <h2 id="nd-related-title" className="nd-display nd-related-title">
            {tr(title)}
          </h2>
        </div>
        <Link href={href(ARTICLES_INDEX)} className="nd-textlink">
          {tr("Browse all articles")} <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="nd-related-grid">
        {items.map((r) => {
          const catMeta = CATEGORIES[r.category as keyof typeof CATEGORIES];
          return (
            <Link
              key={r.slug}
              href={href(`/${r.slug}/`)}
              className="nd-card nd-glow nd-post-card"
            >
              <div className="thumb">
                {r.hero ? (
                  <Image
                    src={r.hero}
                    alt={r.title}
                    fill
                    sizes="(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw"
                    quality={70}
                  />
                ) : (
                  <span className="ph" aria-hidden="true">
                    {r.title.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="inner">
                {catMeta && <span className="nd-label">{tr(catMeta.label)}</span>}
                <h3>{r.title}</h3>
                {r.excerpt && <p className="text">{r.excerpt}</p>}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
