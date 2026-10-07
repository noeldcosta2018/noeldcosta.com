import FadeUp from "@/components/article/FadeUp";

/**
 * Oversized stat callout. A single number that deserves its own breath
 * in the article. Use sparingly. One per article maximum.
 *
 * MDX usage:
 *
 *   <stat-block
 *     value="68%"
 *     label="of ERP projects miss their original budget"
 *     source="Panorama Consulting, 2023"
 *   ></stat-block>
 *
 * The value is set large in the display face with tabular numbers so the
 * eye lands on it first. Source is optional but recommended.
 */
type StatBlockProps = {
  value?: string;
  label?: string;
  source?: string;
  /** Translated "Source" label (MdxBody passes it on translated pages). */
  "source-label"?: string;
};

export default function StatBlock(props: StatBlockProps) {
  if (!props.value) return null;

  return (
    <FadeUp as="figure" className="not-prose nd-block">
      <div className="nd-stat-block">
        <div className="v">{props.value}</div>
        <div>
          {props.label && <p className="l">{props.label}</p>}
          {props.source && <p className="s">{props["source-label"] || "Source"}: {props.source}</p>}
        </div>
      </div>
    </FadeUp>
  );
}
