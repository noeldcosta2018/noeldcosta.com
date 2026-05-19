import type { ReactNode } from "react";

/**
 * Three capability cards for the "What I do" section on the story
 * page. Title + body lifted verbatim from the original numbered list
 * (voice unchanged).
 *
 * Icons are simple stroke SVGs at viewBox 24×24, matching the home
 * page's AICapabilities/Credentials icon style — no new icon library.
 */

export interface Capability {
  title: string;
  body: string;
  icon: ReactNode;
  /**
   * Hover motion hint for the SVG icon. Each value maps to a Tailwind
   * transform class applied on group-hover, so the icon's visual
   * matches its meaning (rotate-cw spins, arrow translates, spark rotates).
   */
  iconMotion: "rotate-180" | "translate-x-1" | "rotate-45";
}

const iconCommon = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const CAPABILITIES: Capability[] = [
  {
    title: "Programme recovery",
    body:
      "Late, over budget, or technically broken implementations. I come in, separate what's real from what's political, and rebuild the plan.",
    // rotate-cw (refresh): signals "we get this back on track" — rotates on hover
    icon: (
      <svg {...iconCommon}>
        <path d="M23 4v6h-6" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
    iconMotion: "rotate-180",
  },
  {
    title: "ECC to S/4HANA and cloud ERP",
    body:
      "Migration design, cutover, Finance and Supply Chain transformation, data quality.",
    // arrow-right inside circle: signals migration — nudges forward on hover
    icon: (
      <svg {...iconCommon}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 16 16 12 12 8" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    iconMotion: "translate-x-1",
  },
  {
    title: "AI on ERP data",
    body:
      "Governance, agentic workflows on BTP, models that sit on SAP, Oracle, or Microsoft foundations without hallucinating the ledger.",
    // spark / brain dots: signals AI — sparkles tilt on hover
    icon: (
      <svg {...iconCommon}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v3M21 12h-3M12 21v-3M3 12h3M5.6 5.6l2.1 2.1M16.3 7.7l2.1-2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1" />
      </svg>
    ),
    iconMotion: "rotate-45",
  },
];
