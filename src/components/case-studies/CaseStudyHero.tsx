import Link from "next/link";
import {
  INDUSTRY_LABEL,
  REGION_LABEL,
  type CaseStudy,
} from "@/lib/case-studies";

/**
 * Featured case study on the portfolio page: a wide nd-card with the
 * headline and outcome on one side and the signed-off figures on the other.
 * No cover image (Hallmark audit, 7 Nov 2026: the covers were generated stock). The page H1 lives in the banner above, so the headline is an H2.
 * Server component; values render as written so the first HTML carries them.
 */

interface Props {
  c: CaseStudy;
  /** Stats shown under the outcome; one or three. */
  stats: { value: string; label: string }[];
}

export default function CaseStudyHero({ c, stats }: Props) {
  const tags = [INDUSTRY_LABEL[c.industry], REGION_LABEL[c.region]].filter(Boolean);

  return (
    <article className="nda-featured nd-card" aria-labelledby="featured-title">
      <div className="body">
        <div className="lead">
          <div className="nda-tagline">
            <span>Featured case study</span>
            {tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <p className="client">{c.client.label}</p>
          <h2 id="featured-title">
            {c.headline.primary} <span className="nd-hl">{c.headline.italic}</span>
          </h2>
          <p className="outcome">{c.outcome}</p>
          <div>
            <Link href={`/${c.slug}/`} className="nd-btn nd-btn-primary">
              Read the full case study <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <dl className={stats.length > 1 ? "nda-facts" : "nda-facts one"}>
          {stats.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}
