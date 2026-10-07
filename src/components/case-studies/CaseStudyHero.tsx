import Image from "next/image";
import Link from "next/link";
import {
  INDUSTRY_LABEL,
  REGION_LABEL,
  type CaseStudy,
} from "@/lib/case-studies";

/**
 * Featured case study on the portfolio page: a wide nd-card with the cover on
 * one side and the headline, outcome, three stats and the call to action on
 * the other. The page H1 lives in the banner above, so the headline is an H2.
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
      <div className="media">
        <Image
          src={c.cover.src}
          alt={c.cover.alt}
          fill
          priority
          quality={70}
          sizes="(min-width: 1024px) 640px, 100vw"
        />
        <span className="shade" aria-hidden="true" />
        <span className="tag nda-dark-pill">
          <i aria-hidden="true" />
          Featured case study
        </span>
      </div>
      <div className="body">
        <div>
          <div className="nda-tagline">
            {tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <p className="client">{c.client.label}</p>
        </div>
        <h2 id="featured-title">
          {c.headline.primary} <span className="nd-hl">{c.headline.italic}</span>
        </h2>
        <p className="outcome">{c.outcome}</p>
        <div className={stats.length > 1 ? "nda-stats" : "nda-stats one"}>
          {stats.map((s) => (
            <div key={s.label}>
              <span className="v">{s.value}</span>
              <span className="k">{s.label}</span>
            </div>
          ))}
        </div>
        <div>
          <Link href={`/${c.slug}/`} className="nd-btn nd-btn-primary magnetic">
            Read the full case study <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
