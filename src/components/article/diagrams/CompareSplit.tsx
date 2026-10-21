import FadeUp from "@/components/article/FadeUp";

/**
 * Side-by-side comparison: two editorial columns, one per option. Use when an article weighs two named approaches against each
 * other (Big Bang vs Phased, Greenfield vs Brownfield, Fit-to-standard
 * vs Customisation).
 *
 * MDX usage (note: pipe-separated points, dash-cased attributes):
 *
 *   <compare-split
 *     title="Big Bang vs Phased"
 *     left-label="Big Bang"
 *     left-points="Faster alignment|Lower upfront cost|Higher day-one risk"
 *     right-label="Phased"
 *     right-points="More room to course-correct|Easier to isolate risk|Longer total support window"
 *   ></compare-split>
 *
 * Pipe-separated string fields are forced by the markdown pipeline: HTML
 * attributes only carry strings, so the component parses them. Keep
 * points short (under ~12 words each) so both columns balance visually.
 */
type CompareSplitProps = {
  title?: string;
  "left-label"?: string;
  "left-points"?: string;
  "right-label"?: string;
  "right-points"?: string;
};

function splitPoints(s?: string): string[] {
  if (!s) return [];
  return s
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function CompareSplit(props: CompareSplitProps) {
  const title = props.title;
  const leftLabel = props["left-label"] || "A";
  const rightLabel = props["right-label"] || "B";
  const leftPoints = splitPoints(props["left-points"]);
  const rightPoints = splitPoints(props["right-points"]);

  const sides = [
    { label: leftLabel, points: leftPoints, tone: "a" },
    { label: rightLabel, points: rightPoints, tone: "b" },
  ];

  // Editorial layout: two columns on hairlines, each headed by its option
  // name over a fine tone rule, points numbered. No cards, no bullets.
  return (
    <FadeUp as="figure" className="not-prose nd-block">
      {title && (
        <h2 data-heading-source="CompareSplit" className="nd-block-title">{title}</h2>
      )}
      <div data-heading-source="CompareSplit" className="nd-vs">
        {sides.map((side, i) => (
          <div key={i} className={`nd-vs-col tone-${side.tone}`}>
            <h3 className="nd-vs-label">{side.label}</h3>
            <ol className="nd-vs-points">
              {side.points.map((p, idx) => (
                <li key={idx}>
                  <span className="n" aria-hidden="true">{String(idx + 1).padStart(2, "0")}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </FadeUp>
  );
}
