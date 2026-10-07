import FadeUp from "@/components/article/FadeUp";

/**
 * Horizontal numbered stepper. Use for ordered phases or stages
 * (SAP Activate phases, project lifecycle, migration sequence).
 *
 * MDX usage (pipe-separated):
 *
 *   <stepper
 *     title="SAP Activate phases"
 *     steps="Prepare|Explore|Realize|Deploy|Run"
 *     bodies="Set up teams and plan|Workshops to fit standard|Configure and test|Train and migrate|Go live and optimise"
 *   ></stepper>
 *
 * Steps and bodies must have the same count. Under 768px the row becomes
 * a vertical rail with the same numbering (one list, styled by CSS).
 */
type StepperProps = {
  title?: string;
  steps?: string;
  bodies?: string;
};

function splitFields(s?: string): string[] {
  if (!s) return [];
  return s
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function Stepper(props: StepperProps) {
  const steps = splitFields(props.steps);
  const bodies = splitFields(props.bodies);
  if (!steps.length) return null;

  return (
    <FadeUp as="figure" className="not-prose nd-block">
      {props.title && (
        <h2 data-heading-source="Stepper" className="nd-block-title">{props.title}</h2>
      )}

      {/* One list: a vertical rail on phones, a horizontal row from 768px. */}
      <ol
        data-heading-source="Stepper"
        className="nd-stepper"
        style={{ ["--steps" as string]: String(steps.length) }}
      >
        {steps.map((s, i) => (
          <li key={i}>
            <span className="dot" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3>{s}</h3>
            {bodies[i] && <p>{bodies[i]}</p>}
          </li>
        ))}
      </ol>
    </FadeUp>
  );
}
