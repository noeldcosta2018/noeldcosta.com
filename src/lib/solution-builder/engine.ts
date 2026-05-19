/**
 * SAP Solution Builder deterministic engine.
 *
 * Takes industry + company size + selected module IDs and produces a
 * roadmap: phased timeline, cost breakdown by category, and team
 * composition. Runs entirely in the browser.
 *
 * This is a directional planning estimate, not a vendor quote. The
 * cost categories and team roles reflect typical SAP programme
 * structure. Numbers scale with selected module effort weights
 * (from sap-modules.ts) and company size multipliers.
 */

import {
  SAP_MODULES,
  getModuleById,
  sumEffortWeight,
  type SapModule,
  type SapModuleCategory,
} from "@/lib/sap-modules";
import {
  INDUSTRIES,
  COMPANY_SIZES,
  PHASES,
  TEAM_ROLES,
  licenseTypeFor,
  type IndustryId,
  type CompanySizeId,
  type PhaseTemplate,
} from "./data";

// ─── Public types ─────────────────────────────────────────────────────

export interface RoadmapInput {
  industryId: IndustryId;
  companySizeId: CompanySizeId;
  selectedModuleIds: string[];
}

export interface ModuleRow {
  id: string;
  label: string;
  code?: string;
  licenseType: string;
  quantity: string;
  category: string;
  description: string;
}

export interface RoadmapPhase {
  id: 1 | 2 | 3;
  label: string;
  description: string;
  focusAreas: string[];
  durationMonths: number;
  moduleIds: string[];
}

export interface CostBreakdownLine {
  category: string;
  description: string;
  amount: number;
  share: number; // 0..1
}

export interface TeamMember {
  role: string;
  function: string;
  count: number;
  dayRateBand: string;
}

export interface Roadmap {
  industryId: IndustryId;
  companySizeId: CompanySizeId;
  totalDurationMonths: number;
  totalInvestment: number;
  teamSize: number;
  phases: RoadmapPhase[];
  costBreakdown: CostBreakdownLine[];
  team: TeamMember[];
}

// ─── Helpers ──────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<SapModuleCategory, string> = {
  finance: "Finance & Compliance",
  procurement: "Procurement & Supply Chain",
  "supply-chain": "Supply Chain & Manufacturing",
  "sales-cx": "Sales & Customer Experience",
  hcm: "HR & Workforce Management",
  projects: "Projects & Expense",
  analytics: "Analytics & Reporting",
  platform: "Platform & Integration",
  industry: "Industry Solution",
};

/**
 * Bucket a module into the phase its category belongs to. Falls back to
 * Phase 1 for unrecognised categories so nothing gets dropped on the floor.
 */
function phaseIdFor(module: SapModule): 1 | 2 | 3 {
  for (const p of PHASES) {
    if (p.acceptCategories.includes(module.category)) return p.id;
  }
  return 1;
}

/** USD quantity bands by company size, for the module table display. */
function quantityFor(
  module: SapModule,
  size: (typeof COMPANY_SIZES)[number]
): string {
  const lic = licenseTypeFor(module.category, module.id);
  if (lic === "Employee-Based") return size.employeeBasedQty;
  if (lic === "Transaction-Based") return size.transactionBasedQty;
  return size.userBasedQty;
}

export function moduleToRow(
  moduleId: string,
  sizeId: CompanySizeId
): ModuleRow | null {
  const m = getModuleById(moduleId);
  if (!m) return null;
  const size = COMPANY_SIZES.find((s) => s.id === sizeId);
  if (!size) return null;
  return {
    id: m.id,
    label: m.code ? `SAP ${m.label}` : m.label,
    code: m.code,
    licenseType: licenseTypeFor(m.category, m.id),
    quantity: quantityFor(m, size),
    category: CATEGORY_LABEL[m.category],
    description: m.description,
  };
}

// ─── Core engine ──────────────────────────────────────────────────────

export function buildRoadmap(input: RoadmapInput): Roadmap | null {
  const industry = INDUSTRIES.find((i) => i.id === input.industryId);
  const size = COMPANY_SIZES.find((s) => s.id === input.companySizeId);
  if (!industry || !size) return null;

  // 1. Resolve modules
  const selected = input.selectedModuleIds
    .map((id) => getModuleById(id))
    .filter((m): m is SapModule => Boolean(m));

  // 2. Bucket modules into phases
  const phases: RoadmapPhase[] = PHASES.map((template) => {
    const phaseModules = selected.filter((m) => phaseIdFor(m) === template.id);
    const duration =
      template.id === 1
        ? size.phase1Months
        : template.id === 2
          ? size.phase2Months
          : size.phase3Months;
    return {
      id: template.id,
      label: template.label,
      description: template.description,
      focusAreas: template.focusAreas,
      durationMonths: duration,
      moduleIds: phaseModules.map((m) => m.id),
    } satisfies RoadmapPhase;
  }).filter((p) => p.moduleIds.length > 0);

  const totalDurationMonths = phases.reduce(
    (sum, p) => sum + p.durationMonths,
    0
  );

  // 3. Cost calculation
  // Baseline: $1.5M for a small / single-LoB programme. Scaled by
  // company size multiplier, total module effort weight, and industry
  // complexity multiplier.
  const baseImplementationUSD = 1_500_000;
  const moduleEffort = Math.max(1, sumEffortWeight(input.selectedModuleIds));
  const moduleEffortFactor = 0.6 + moduleEffort * 0.18; // soft scale
  const totalInvestment = Math.round(
    baseImplementationUSD *
      size.costMultiplier *
      industry.complexityMultiplier *
      moduleEffortFactor
  );

  // Category shares (typical SAP programme structure)
  const costSharesPct = {
    "Software licensing": 0.22,
    "Implementation services": 0.32,
    "Internal team time": 0.14,
    "Data migration": 0.08,
    "Customisation & development": 0.08,
    "Training & change management": 0.06,
    "Infrastructure & hosting": 0.05,
    "Post-go-live support (hypercare)": 0.03,
    "Contingency": 0.02,
  } as const;

  const costBreakdown: CostBreakdownLine[] = Object.entries(costSharesPct).map(
    ([category, share]) => ({
      category,
      description: costDescriptionFor(category),
      amount: Math.round(totalInvestment * share),
      share,
    })
  );

  // 4. Team composition
  // Scale base counts by team multiplier and add specialists for
  // selected modules (1 extra functional consultant per ~4 modules
  // beyond the baseline of 6).
  const moduleCount = input.selectedModuleIds.length;
  const extraConsultants = Math.max(
    0,
    Math.ceil((moduleCount - 6) / 4)
  );

  const team: TeamMember[] = TEAM_ROLES.map((r) => {
    let count = Math.max(
      1,
      Math.round(r.baseCount * size.teamMultiplier)
    );
    if (r.role === "Functional Consultants") count += extraConsultants;
    return {
      role: r.role,
      function: r.function,
      count,
      dayRateBand: r.dayRateBand,
    } satisfies TeamMember;
  });

  const teamSize = team.reduce((s, m) => s + m.count, 0);

  return {
    industryId: input.industryId,
    companySizeId: input.companySizeId,
    totalDurationMonths,
    totalInvestment,
    teamSize,
    phases,
    costBreakdown,
    team,
  };
}

function costDescriptionFor(category: string): string {
  switch (category) {
    case "Software licensing":
      return "Core modules, user licences, and add-ons across the selected scope";
    case "Implementation services":
      return "Consulting, configuration, testing, and project management";
    case "Internal team time":
      return "IT, business SMEs, and process owners (often invisible in vendor quotes)";
    case "Data migration":
      return "Extraction, cleansing, conversion, validation, cutover dress rehearsal";
    case "Customisation & development":
      return "Z-code, Fiori extensions, integrations beyond standard";
    case "Training & change management":
      return "End-user training, change agents, communications, adoption";
    case "Infrastructure & hosting":
      return "Cloud subscriptions, middleware, network readiness";
    case "Post-go-live support (hypercare)":
      return "First 30-90 days post-cutover with elevated support staffing";
    case "Contingency":
      return "Reserve for scope changes, delays, unforeseen requirements";
    default:
      return "";
  }
}

// ─── Suggested defaults ───────────────────────────────────────────────

/**
 * Return the default set of module IDs (mandatory + industry-specific +
 * recommended) for a given industry. Used to pre-populate the module
 * tables when the user picks an industry.
 */
export function defaultModulesFor(industryId: IndustryId): {
  mandatory: string[];
  industry: string[];
  recommended: string[];
} {
  const industry = INDUSTRIES.find((i) => i.id === industryId);
  if (!industry) return { mandatory: [], industry: [], recommended: [] };
  return {
    mandatory: industry.mandatoryModuleIds,
    industry: industry.industryModuleIds,
    recommended: industry.recommendedModuleIds,
  };
}

/**
 * Format a USD amount as a compact display string like "$18.96M" or
 * "$1.2M" or "$650K". Used in roadmap summary cards.
 */
export function formatUsd(amount: number): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `$${m >= 10 ? m.toFixed(1) : m.toFixed(2)}M`.replace(".00", "");
  }
  if (amount >= 1_000) {
    return `$${Math.round(amount / 1_000)}K`;
  }
  return `$${amount.toLocaleString()}`;
}
