import Link from "next/link";
import {
  INDUSTRY_LABEL,
  REGION_LABEL,
  SERVICE_LABEL,
  type CaseStudy,
} from "@/lib/case-studies";

/**
 * Case-study card (nd-card). Two sizes:
 *  - "anchor": the hand-picked row and "other programmes", with the outcome line.
 *  - "compact": the filterable archive.
 * Typographic on purpose (Hallmark audit, 7 Nov 2026): the old covers were
 * generated stock with invented charts, which undercut the real figures. The
 * industry leads the tagline and the signed-off figure carries the card.
 * Values render as written (no count-up) so the first HTML already carries them.
 * Link target: /<slug>/, the same URL the portfolio has always pointed to.
 */

interface Props {
  c: CaseStudy;
  variant: "anchor" | "compact";
  /** Kept for callers; there is no image to prioritise any more. */
  priority?: boolean;
}

export default function CaseStudyCard({ c, variant }: Props) {
  const isAnchor = variant === "anchor";
  const meta = [INDUSTRY_LABEL[c.industry], REGION_LABEL[c.region], c.service[0] ? SERVICE_LABEL[c.service[0]] : null].filter(
    Boolean,
  ) as string[];

  return (
    <Link href={`/${c.slug}/`} className={`nda-cs ${variant} nd-card`}>
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
