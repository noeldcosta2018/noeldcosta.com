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
 * The value uses tabular-nums and Epilogue font-black at oversized scale
 * so the eye lands on it first. Source is optional but recommended.
 */
type StatBlockProps = {
  value?: string;
  label?: string;
  source?: string;
};

export default function StatBlock(props: StatBlockProps) {
  if (!props.value) return null;

  return (
    <FadeUp as="figure" className="not-prose my-10">
      <div className="rounded-[20px] bg-paper border border-corbeau/[0.08] p-8 md:p-10 shadow-[0_4px_24px_rgba(14,16,32,0.04)] flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
        <div
          className="font-display font-black text-papaya leading-[0.9] tracking-[-0.04em] tabular-nums flex-shrink-0"
          style={{ fontSize: "clamp(3rem, 9vw, 5.5rem)" }}
        >
          {props.value}
        </div>
        <div className="flex-1 min-w-0">
          {props.label && (
            <p className="font-display font-bold text-corbeau text-[1.05rem] md:text-[1.2rem] tracking-[-0.02em] leading-[1.3] mb-2">
              {props.label}
            </p>
          )}
          {props.source && (
            <p className="font-mono text-[0.62rem] tracking-[1.6px] uppercase text-corbeau/50">
              Source · {props.source}
            </p>
          )}
        </div>
      </div>
    </FadeUp>
  );
}
