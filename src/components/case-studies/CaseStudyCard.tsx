import Image from "next/image";
import Link from "next/link";
import {
  INDUSTRY_LABEL,
  REGION_LABEL,
  SERVICE_LABEL,
  type CaseStudy,
} from "@/lib/case-studies";

/**
 * Case-study card (nd-card + nd-glow). Two sizes:
 *  - "anchor": the hand-picked row and "other programmes", with the outcome line.
 *  - "compact": the filterable archive.
 * The cursor-lit border comes from the global pointer layer, so no client JS here.
 * Values render as written (no count-up) so the first HTML already carries them.
 * Link target: /<slug>/, the same URL the portfolio has always pointed to.
 */

interface Props {
  c: CaseStudy;
  variant: "anchor" | "compact";
  /** Eager-load the cover (first visible card only). */
  priority?: boolean;
}

export default function CaseStudyCard({ c, variant, priority }: Props) {
  const isAnchor = variant === "anchor";
  const meta = [REGION_LABEL[c.region], c.service[0] ? SERVICE_LABEL[c.service[0]] : null].filter(
    Boolean,
  ) as string[];

  return (
    <Link href={`/${c.slug}/`} className={`nda-cs ${variant} nd-card nd-glow`}>
      <div className="thumb">
        <Image
          src={c.cover.src}
          alt={c.cover.alt}
          fill
          sizes={
            isAnchor
              ? "(min-width: 1024px) 600px, (min-width: 768px) 50vw, 100vw"
              : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          }
          quality={70}
          priority={priority}
        />
        <span className="tag nda-dark-pill">
          <i aria-hidden="true" />
          {INDUSTRY_LABEL[c.industry]}
        </span>
      </div>
      <div className="inner">
        <div className="nda-tagline">
          {meta.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        <h3>
          {c.headline.primary} <em>{c.headline.italic}</em>
        </h3>
        {isAnchor && <p className="text">{c.outcome}</p>}
        <div className="stat">
          <span className="v">{c.headlineStat.value}</span>
          <span className="k">{c.headlineStat.label}</span>
        </div>
        {isAnchor && (
          <span className="more" aria-hidden="true">
            Read the case study <span>→</span>
          </span>
        )}
      </div>
    </Link>
  );
}
