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
  getModuleById,
  sumEffortWeight,
  type SapModule,
  type SapModuleCategory,
} from "@/lib/sap-modules";
import {
  getIndustries,
  getCompanySizes,
  getPhases,
  getTeamRoles,
  licenseTypeFor,
  type IndustryId,
  type CompanySizeId,
} from "./data";
import { type Locale } from "@/lib/locales";
import { getMessages, stripMarkers } from "@/lib/i18n/useTranslation";

// Locale → BCP-47 tag. Same helper duplicated across ArticleHero and
// ErpCostClient; flagged for consolidation in _docs/post-launch-backlog.md.
function bcp47(locale: Locale): string {
  switch (locale) {
    case "en": return "en-US";
    case "ja": return "ja-JP";
    case "ar": return "ar-AE";
    case "de": return "de-DE";
    case "es": return "es-ES";
    case "fr": return "fr-FR";
    case "it": return "it-IT";
    case "pt": return "pt-BR";
    case "nl": return "nl-NL";
    case "ru": return "ru-RU";
    case "el": return "el-GR";
    case "zh": return "zh-CN";
    case "ko": return "ko-KR";
    case "hi": return "hi-IN";
    case "tr": return "tr-TR";
    default: return "en-US";
  }
}

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

// Cost-roadmap CATEGORY_LABEL — locale-aware lookup. Separate copy from
// sapModules.categories (the picker uses "Finance & Controlling" while
// the cost roadmap uses "Finance & Compliance"). Strips <noTranslate>
// markers at the boundary.
function categoryLabel(category: SapModuleCategory, locale: Locale): string {
  return stripMarkers(
    getMessages(locale).solutionBuilder.costRoadmapCategories[category],
  );
}

/**
 * Bucket a module into the phase its category belongs to. Falls back to
 * Phase 1 for unrecognised categories so nothing gets dropped on the floor.
 * Phase order is locale-independent — read from English to avoid the
 * extra messages lookup.
 */
function phaseIdFor(module: SapModule): 1 | 2 | 3 {
  for (const p of getPhases("en")) {
    if (p.acceptCategories.includes(module.category)) return p.id;
  }
  return 1;
}

/** USD quantity bands by company size, for the module table display.
 *  Locale needed to determine the license type key. */
function quantityFor(
  module: SapModule,
  size: ReturnType<typeof getCompanySizes>[number],
  locale: Locale,
): string {
  // Use the locale-resolved license type label to drive the band lookup.
  // Compare against the English values from MESSAGES so the mapping
  // doesn't depend on the user's locale.
  const enLicense = licenseTypeFor(module.category, module.id, "en");
  if (enLicense === "Employee-Based") return size.employeeBasedQty;
  if (enLicense === "Transaction-Based") return size.transactionBasedQty;
  // Silence the lint warning while keeping the locale param available for
  // future formatting work (numeric thousand separators per locale).
  void locale;
  return size.userBasedQty;
}

export function moduleToRow(
  moduleId: string,
  sizeId: CompanySizeId,
  locale: Locale = "en",
): ModuleRow | null {
  const m = getModuleById(moduleId, locale);
  if (!m) return null;
  const size = getCompanySizes(locale).find((s) => s.id === sizeId);
  if (!size) return null;
  return {
    id: m.id,
    label: m.code ? `SAP ${m.label}` : m.label,
    code: m.code,
    licenseType: licenseTypeFor(m.category, m.id, locale),
    quantity: quantityFor(m, size, locale),
    category: categoryLabel(m.category, locale),
    description: m.description,
  };
}

// ─── Core engine ──────────────────────────────────────────────────────

export function buildRoadmap(
  input: RoadmapInput,
  locale: Locale = "en",
): Roadmap | null {
  const industry = getIndustries(locale).find((i) => i.id === input.industryId);
  const size = getCompanySizes(locale).find((s) => s.id === input.companySizeId);
  if (!industry || !size) return null;

  // 1. Resolve modules — locale flows through so module labels +
  // descriptions in the roadmap output match the user's language.
  const selected = input.selectedModuleIds
    .map((id) => getModuleById(id, locale))
    .filter((m): m is SapModule => Boolean(m));

  // 2. Bucket modules into phases
  const phases: RoadmapPhase[] = getPhases(locale).map((template) => {
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

  // Cost-share categories — keyed by the messages-side identifier so
  // both the label and the description come from MESSAGES in the user's
  // locale. Pass 2b-2d. Shares match the original costSharesPct.
  type CostCategoryKey = keyof ReturnType<typeof getMessages>["solutionBuilder"]["costCategories"];
  const costShares: Record<CostCategoryKey, number> = {
    softwareLicensing: 0.22,
    implementationServices: 0.32,
    internalTeamTime: 0.14,
    dataMigration: 0.08,
    customisationDevelopment: 0.08,
    trainingChangeManagement: 0.06,
    infrastructureHosting: 0.05,
    postGoliveSupport: 0.03,
    contingency: 0.02,
  };
  const costCategoryMsgs = getMessages(locale).solutionBuilder.costCategories;

  const costBreakdown: CostBreakdownLine[] = (
    Object.entries(costShares) as [CostCategoryKey, number][]
  ).map(([key, share]) => ({
    category: stripMarkers(costCategoryMsgs[key].label),
    description: stripMarkers(costCategoryMsgs[key].description),
    amount: Math.round(totalInvestment * share),
    share,
  }));

  // 4. Team composition
  // Scale base counts by team multiplier and add specialists for
  // selected modules (1 extra functional consultant per ~4 modules
  // beyond the baseline of 6).
  const moduleCount = input.selectedModuleIds.length;
  const extraConsultants = Math.max(
    0,
    Math.ceil((moduleCount - 6) / 4)
  );

  // Team composition uses the English role labels for the "extra
  // consultants" comparison so the bump rule is locale-independent.
  const enTeamRoles = getTeamRoles("en");
  const team: TeamMember[] = getTeamRoles(locale).map((r, i) => {
    let count = Math.max(
      1,
      Math.round(r.baseCount * size.teamMultiplier)
    );
    if (enTeamRoles[i].role === "Functional Consultants") count += extraConsultants;
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

// costDescriptionFor removed in Pass 2b-2d — cost line descriptions
// now come from MESSAGES.solutionBuilder.costCategories directly via
// the buildRoadmap loop above.

// ─── Suggested defaults ───────────────────────────────────────────────

/**
 * Return the default set of module IDs (mandatory + industry-specific +
 * recommended) for a given industry. Used to pre-populate the module
 * tables when the user picks an industry. Module ID lists are locale-
 * independent (structural data), so this function stays locale-free.
 */
export function defaultModulesFor(industryId: IndustryId): {
  mandatory: string[];
  industry: string[];
  recommended: string[];
} {
  const industry = getIndustries("en").find((i) => i.id === industryId);
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
 *
 * Currency stays in USD across all locales (per the Block 6c calculator
 * decisions). The "M"/"K" suffixes are kept as Latin letters — locale-
 * agnostic compact-notation alternatives would require Intl.NumberFormat
 * with the "compact" style, which we don't need for this surface. The
 * locale param is preserved so the small-amount branch can apply
 * locale-appropriate thousand separators via toLocaleString.
 */
export function formatUsd(amount: number, locale: Locale = "en"): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `$${m >= 10 ? m.toFixed(1) : m.toFixed(2)}M`.replace(".00", "");
  }
  if (amount >= 1_000) {
    return `$${Math.round(amount / 1_000)}K`;
  }
  return `$${amount.toLocaleString(bcp47(locale))}`;
}
