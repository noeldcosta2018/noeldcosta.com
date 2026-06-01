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
 * Steps and bodies must have the same count. On mobile the row collapses
 * to a vertical list with the same numbering.
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
    <FadeUp as="figure" className="not-prose my-10">
      {props.title && (
        <p className="font-mono text-[0.62rem] font-medium tracking-[2.4px] uppercase text-papaya mb-4">
          {props.title}
        </p>
      )}

      {/* Desktop: horizontal row with connector line */}
      <ol className="hidden md:grid gap-4 relative" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {/* connector */}
        <span
          aria-hidden
          className="absolute top-[18px] inset-x-0 h-[2px] bg-corbeau/10"
        />
        {steps.map((s, i) => (
          <li key={i} className="relative">
            <span
              aria-hidden
              className="relative z-10 flex items-center justify-center w-9 h-9 rounded-full bg-papaya text-corbeau font-display font-black text-[0.85rem] mx-auto mb-3 shadow-[0_2px_8px_rgba(252,152,90,0.3)]"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h4 className="font-display font-bold text-corbeau text-[0.95rem] tracking-[-0.015em] leading-[1.25] text-center mb-1">
              {s}
            </h4>
            {bodies[i] && (
              <p className="text-night/80 text-[0.82rem] leading-[1.5] text-center">
                {bodies[i]}
              </p>
            )}
          </li>
        ))}
      </ol>

      {/* Mobile: vertical stack, left rail */}
      <ol className="md:hidden relative ps-10">
        <span
          aria-hidden
          className="absolute start-[18px] top-2 bottom-2 w-[2px] bg-corbeau/10"
        />
        {steps.map((s, i) => (
          <li key={i} className="relative mb-5 last:mb-0">
            <span
              aria-hidden
              className="absolute start-[-30px] top-0 flex items-center justify-center w-9 h-9 rounded-full bg-papaya text-corbeau font-display font-black text-[0.85rem] shadow-[0_2px_8px_rgba(252,152,90,0.3)]"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h4 className="font-display font-bold text-corbeau text-[1rem] tracking-[-0.015em] leading-[1.25] mb-1">
              {s}
            </h4>
            {bodies[i] && (
              <p className="text-night/80 text-[0.88rem] leading-[1.55]">
                {bodies[i]}
              </p>
            )}
          </li>
        ))}
      </ol>
    </FadeUp>
  );
}
