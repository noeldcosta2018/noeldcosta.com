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
    <FadeUp as="figure" className="not-prose nd-block">
      {/* Question */}
      <div data-heading-source="DecisionTree" className="nd-dt-q">
        <span className="nd-label">Decide</span>
        <h3>{props.question}</h3>
      </div>

      {/* Connector */}
      <span aria-hidden="true" className="nd-dt-stem" />

      {/* Branches: one column on phones, up to three from 768px */}
      <div
        className="nd-dt-branches"
        style={{ ["--cols" as string]: String(Math.min(branches.length, 3)) }}
      >
        {branches.map((b, i) => (
          <div key={i} className="nd-dt-col">
            <div className="nd-card nd-glow nd-dt-branch">
              <p className="cond">{b.condition}</p>
              <p className="out">
                <span aria-hidden="true">→</span>
                {b.outcome}
              </p>
            </div>
          </div>
        ))}
      </div>
    </FadeUp>
  );
}
