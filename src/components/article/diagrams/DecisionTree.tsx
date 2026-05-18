import FadeUp from "@/components/article/FadeUp";

/**
 * Decision diagram. A single question at the top branches into 2-4
 * conditions, each pointing to an outcome. Use for migration path
 * decisions, technology selection, "which approach fits us".
 *
 * MDX usage:
 *
 *   <decision-tree
 *     question="Which migration path fits?"
 *     options="Legacy is fragmented and we want process redesign => Greenfield|Processes are sound, ECC is stable => Brownfield|Multi-entity, want partial reuse => Bluefield"
 *   ></decision-tree>
 *
 * Each option is `condition => outcome`. Branches render as cards under
 * the question with a small connector visual.
 */
type DecisionTreeProps = {
  question?: string;
  options?: string;
};

type Branch = { condition: string; outcome: string };

function parseOptions(s?: string): Branch[] {
  if (!s) return [];
  return s
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const [condition, outcome] = p.split("=>").map((x) => x.trim());
      return { condition: condition || "", outcome: outcome || "" };
    })
    .filter((b) => b.condition && b.outcome);
}

export default function DecisionTree(props: DecisionTreeProps) {
  const branches = parseOptions(props.options);
  if (!branches.length) return null;

  return (
    <FadeUp as="figure" className="not-prose my-10">
      {/* Question */}
      <div className="mx-auto max-w-[28rem] rounded-xl bg-corbeau text-bone px-6 py-4 mb-6 text-center shadow-[0_4px_18px_rgba(14,16,32,0.15)]">
        <p className="font-mono text-[0.6rem] font-medium tracking-[2.4px] uppercase text-papaya mb-1.5">
          Decide
        </p>
        <h4 className="font-display font-bold text-[1.02rem] md:text-[1.1rem] tracking-[-0.02em] leading-[1.25]">
          {props.question}
        </h4>
      </div>

      {/* Connector */}
      <div className="flex justify-center mb-0">
        <span aria-hidden className="block w-[2px] h-6 bg-corbeau/15" />
      </div>

      {/* Branches */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${Math.min(branches.length, 3)}, minmax(0, 1fr))`,
        }}
      >
        {branches.map((b, i) => (
          <div
            key={i}
            className="rounded-xl bg-paper border border-corbeau/[0.08] p-5 hover:border-papaya/40 transition-colors"
          >
            <p className="text-[0.86rem] text-night/80 leading-[1.55] mb-3">
              {b.condition}
            </p>
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="text-papaya font-mono text-[0.9rem]"
              >
                →
              </span>
              <p className="font-display font-bold text-corbeau text-[1rem] tracking-[-0.015em]">
                {b.outcome}
              </p>
            </div>
          </div>
        ))}
      </div>
    </FadeUp>
  );
}
