import type { ReactNode } from "react";

type Variant = "note" | "warning" | "insight" | "tip";

const LABELS: Record<Variant, string> = {
  note: "Note",
  warning: "Watch out",
  insight: "Executive view",
  tip: "From the field",
};

/**
 * Editorial callout block. Four variants share one shape (a coloured
 * leading rule on a quiet surface); the rule colour carries the meaning:
 *   - note: secondary accent, supporting context
 *   - warning: accent with a tint, risks and things to avoid
 *   - insight: highlighted tile, the author's take
 *   - tip: data colour, practical how-to from delivery work
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
  return (
    <aside className={`nd-article-callout ${variant}`}>
      <span className="nd-label">{label || LABELS[variant]}</span>
      {title && <h4>{title}</h4>}
      <div className="body">{children}</div>
    </aside>
  );
}
