/**
 * Trust block between the archive grid and the closing band. Three rules that
 * tell a sceptical CFO why anonymous case studies are still credible:
 *
 *   1. Named where I can: public references, client-approved.
 *   2. Anonymous where I must: NDA-bound, sector preserved.
 *   3. Real numbers, no padding: what was signed off, no vanity metrics.
 */

const CELLS = [
  {
    num: "01",
    title: "Named where I can.",
    body:
      "Public references, client-approved stories, projects signed off as public. Where I can put a name on the work, I do, and the case study points to a citable source.",
  },
  {
    num: "02",
    title: "Anonymous where I must.",
    body:
      "NDA-bound engagements stay anonymous. Industry, region, scale and timeline are preserved so a reader can judge fit. Identifying details are removed.",
  },
  {
    num: "03",
    title: "Real numbers, no padding.",
    body:
      "What I report is what was signed off. No vanity metrics, no rounding up to the next pretty figure. If the close went from 15 days to 5, that's what the case study says.",
  },
];

export default function CaseStudyMethodology() {
  return (
    <section className="nda-section" aria-labelledby="method-title">
      <div className="nda-wrap">
        <h2 id="method-title" className="nd-display nd-h2">
          Full numbers. <span className="nd-hl">Anonymous where it matters.</span>
        </h2>
        <p className="nd-lede">
          Most case studies either name everyone or anonymise everything and tell you nothing. Here is the rule I
          follow.
        </p>
        <ol className="nd-grid-3">
          {CELLS.map((cell) => (
            <li key={cell.num}>
              <div className="nd-card banded nd-glow">
                <span className="nd-card-band" style={{ background: "var(--accent)" }} aria-hidden="true" />
                <span className="num">Rule {cell.num}</span>
                <h3 style={{ marginTop: 10 }}>{cell.title}</h3>
                <p className="text">{cell.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
