import PageBanner from "@/components/site/PageBanner";
import {
  INDUSTRY_LABEL,
  REGION_LABEL,
  type CaseStudy,
} from "@/lib/case-studies";
import { CLIENT_WORK } from "@/data/site-menu";

/**
 * Banner for an individual case study: the cover image sits behind the scrim,
 * the split headline is the H1 (same text as before) and a glass fact strip
 * carries the headline stat plus client, industry, region, duration and role.
 * Server-rendered, no client JS.
 */
export default function CaseStudyArticleHero({ c }: { c: CaseStudy }) {
  const facts = [
    { label: "Client", value: c.client.label },
    { label: "Industry", value: INDUSTRY_LABEL[c.industry] },
    { label: "Region", value: REGION_LABEL[c.region] },
    { label: "Duration", value: c.duration },
    { label: "My role", value: c.role },
  ];

  return (
    <PageBanner
      label="Case study"
      crumbs={[
        { label: "Client work", href: CLIENT_WORK },
        { label: "Case study" },
      ]}
      title={c.headline.primary}
      highlight={c.headline.italic}
      long
      lede={c.outcome}
      cover={{ src: c.cover.src }}
    >
      <dl className="nda-cs-meta">
        <div className="stat">
          <dt>{c.headlineStat.label}</dt>
          <dd>{c.headlineStat.value}</dd>
        </div>
        {facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
    </PageBanner>
  );
}
