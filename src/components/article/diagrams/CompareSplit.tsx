import FadeUp from "@/components/article/FadeUp";

/**
 * Side-by-side comparison card. Two columns, papaya rules between, hover
 * tints. Use when an article weighs two named approaches against each
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

  return (
    <FadeUp as="figure" className="not-prose my-10">
      {title && (
        <p className="font-mono text-[0.62rem] font-medium tracking-[2.4px] uppercase text-papaya mb-3">
          {title}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: leftLabel, points: leftPoints, accent: "border-l-papaya" },
          { label: rightLabel, points: rightPoints, accent: "border-l-corbeau/60" },
        ].map((side, i) => (
          <div
            key={i}
            className={[
              "group rounded-xl bg-paper border border-corbeau/[0.08]",
              "border-l-[3px]",
              side.accent,
              "p-6 transition-colors hover:bg-bone/40",
            ].join(" ")}
          >
            <h4 className="font-display font-black text-corbeau text-[1.05rem] md:text-[1.15rem] tracking-[-0.02em] mb-4">
              {side.label}
            </h4>
            <ul className="space-y-2.5 text-[0.92rem] md:text-[0.96rem] text-night leading-[1.55]">
              {side.points.map((p, idx) => (
                <li key={idx} className="relative pl-5">
                  <span
                    aria-hidden
                    className="absolute left-0 top-[0.6em] w-[6px] h-[6px] rounded-full bg-papaya/70"
                  />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </FadeUp>
  );
}
