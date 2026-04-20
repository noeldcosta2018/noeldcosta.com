import type { ReactNode } from "react";

type Variant = "note" | "warning" | "insight" | "tip";

const VARIANTS: Record<
  Variant,
  { label: string; tone: string; ring: string; marker: string }
> = {
  note: {
    label: "Note",
    tone: "bg-paper",
    ring: "border border-corbeau/10",
    marker: "bg-corbeau/60",
  },
  warning: {
    label: "Watch out",
    tone: "bg-[#fff6ef]",
    ring: "border border-papaya/30",
    marker: "bg-papaya",
  },
  insight: {
    label: "Executive view",
    tone: "bg-corbeau",
    ring: "border border-corbeau",
    marker: "bg-papaya",
  },
  tip: {
    label: "From the field",
    tone: "bg-cream",
    ring: "border border-corbeau/10",
    marker: "bg-canyon",
  },
};

/**
 * Editorial callout block. Four variants:
 *   - note: neutral, for supporting context
 *   - warning: amber-leaning, for risks / things to avoid
 *   - insight: dark, for the author's take / executive advice
 *   - tip: warm, for practical how-to callouts
 *
 * Keeps a consistent 4px left marker across variants so they read as a family.
 */
export default function ArticleCallout({
  variant = "note",
  label,
  title,
  children,
}: {
  variant?: Variant;
  label?: string;
  title?: string;
  children: ReactNode;
}) {
  const v = VARIANTS[variant];
  const isDark = variant === "insight";
  const bodyColor = isDark ? "text-bone/90" : "text-night";
  const titleColor = isDark ? "text-bone" : "text-corbeau";
  const labelColor = isDark ? "text-papaya" : "text-papaya";

  return (
    <aside
      className={`relative my-8 rounded-[12px] ${v.tone} ${v.ring} overflow-hidden`}
    >
      <span
        aria-hidden
        className={`absolute left-0 top-0 bottom-0 w-1 ${v.marker}`}
      />
      <div className="pl-6 pr-5 py-5 md:pl-7 md:pr-6 md:py-6">
        <p
          className={`font-mono text-[0.62rem] font-semibold tracking-[2.5px] uppercase ${labelColor} mb-2`}
        >
          {label || v.label}
        </p>
        {title && (
          <h4
            className={`font-display font-bold ${titleColor} text-lg md:text-xl leading-snug mb-2`}
          >
            {title}
          </h4>
        )}
        <div
          className={`${bodyColor} text-[0.97rem] leading-[1.65] space-y-3 [&>p]:m-0 [&_a]:text-papaya [&_a]:underline [&_a]:underline-offset-2`}
        >
          {children}
        </div>
      </div>
    </aside>
  );
}
