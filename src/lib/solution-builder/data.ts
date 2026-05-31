/**
 * SAP Solution Builder data layer.
 *
 * Industry presets, company size bands, phase templates, and team
 * templates that the deterministic roadmap engine consumes.
 *
 * Module IDs reference the catalogue in `src/lib/sap-modules.ts` so
 * the picker, cost calculator, and solution builder all share one
 * source of truth for module names, codes, and effort weights.
 *
 * ── i18n architecture (Pass 2b-2d) ────────────────────────────────────
 *
 * Translatable fields (industry label / bestPractices / phasingNarrative,
 * company size label, phase label / description / focusAreas, team role /
 * function, license-type label) moved to MESSAGES.solutionBuilder.* in
 * src/lib/i18n/messages.ts.
 *
 * The structural arrays / records below keep ID + numeric / enum fields
 * only (multipliers, durations, day-rate bands, module ID lists, accept-
 * category enums). The locale-aware getters below merge the static
 * structure with translated copy, strip <noTranslate> markers, and
 * return the same shape consumers used before — buildRoadmap / engine
 * code paths unchanged apart from threading `locale` through.
 *
 * Day-rate bands ($2,000-$3,500 etc.) stay inline as numeric currency
 * strings. Locale-aware thousand-separator formatting on those is a
 * post-launch concern (the calculator decision was "currency stays in
 * USD across all locales" — same applies here).
 */

import type { Locale } from "@/lib/locales";
import { getMessages, stripMarkers } from "@/lib/i18n/useTranslation";
import type { SapModuleCategory } from "@/lib/sap-modules";

// ─── Industry presets ─────────────────────────────────────────────────

export type IndustryId =
  | "manufacturing"
  | "retail"
  | "healthcare"
  | "financial-services"
  | "public-sector"
  | "utilities"
  | "consumer-goods"
  | "professional-services"
  | "telecommunications"
  | "oil-gas"
  | "education"
  | "hospitality"
  | "logistics-transport"
  | "construction-real-estate";

export interface IndustryPreset {
  id: IndustryId;
  label: string;
  /** Yellow callout shown after the user selects industry + size. */
  bestPractices: string;
  /** Phasing narrative shown under best practices. */
  phasingNarrative: string;
  /** Modules every implementation in this industry needs. */
  mandatoryModuleIds: string[];
  /** Modules specific to this industry's processes. */
  industryModuleIds: string[];
  /** Modules commonly added for full value but not strictly required. */
  recommendedModuleIds: string[];
  /** Industry complexity multiplier on cost and duration. 1.0 baseline. */
  complexityMultiplier: number;
}

interface IndustryStatic {
  id: IndustryId;
  mandatoryModuleIds: string[];
  industryModuleIds: string[];
  recommendedModuleIds: string[];
  complexityMultiplier: number;
}

/**
 * Core modules every SAP implementation includes regardless of industry.
 * Layered on top of industry-specific lists. Listed here once to avoid
 * repetition across every IndustryPreset.
 */
const CORE_MANDATORY = [
  "fi-gl",
  "fi-ap",
  "fi-ar",
  "co",
  "co-cca",
  "mm",
  "sd",
  "sf-ec",
];

const INDUSTRIES_STATIC: IndustryStatic[] = [
  {
    id: "manufacturing",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt"],
    industryModuleIds: ["pp", "qm", "pm-eam", "ehs", "ewm"],
    recommendedModuleIds: ["ppds", "me", "apm", "dmc", "ibp", "sac"],
    complexityMultiplier: 1.15,
  },
  {
    id: "retail",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt", "ewm"],
    industryModuleIds: ["is-retail", "commerce-cloud", "marketing-cloud", "cdc"],
    recommendedModuleIds: ["sales-cloud", "service-cloud", "ibp", "sac", "datasphere"],
    complexityMultiplier: 1.1,
  },
  {
    id: "healthcare",
    mandatoryModuleIds: [...CORE_MANDATORY, "tax-mgmt", "ilm", "ias"],
    industryModuleIds: ["qm", "sf-time", "sf-recruiting", "sf-lms"],
    recommendedModuleIds: ["sac", "datasphere", "sf-analytics", "service-cloud"],
    complexityMultiplier: 1.1,
  },
  {
    id: "financial-services",
    mandatoryModuleIds: [
      ...CORE_MANDATORY,
      "fi-aa",
      "fi-bl",
      "tax-mgmt",
      "group-reporting",
      "drc",
    ],
    industryModuleIds: [
      "treasury",
      "in-house-cash",
      "fscm-credit",
      "fscm-dispute",
      "fscm-collections",
      "is-banking",
    ],
    recommendedModuleIds: ["bpc", "fpa-planning", "sac", "mdg", "signavio"],
    complexityMultiplier: 1.25,
  },
  {
    id: "public-sector",
    mandatoryModuleIds: [
      ...CORE_MANDATORY,
      "fi-aa",
      "tax-mgmt",
      "drc",
      "is-public-sector",
    ],
    industryModuleIds: ["ariba-sourcing", "ariba-contracts", "hcm-payroll-onprem", "re-fx"],
    recommendedModuleIds: ["service-cloud", "cdc", "sac", "signavio", "mdg"],
    complexityMultiplier: 1.2,
  },
  {
    id: "utilities",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt", "is-utilities"],
    industryModuleIds: ["pm-eam", "apm", "ehs"],
    recommendedModuleIds: ["service-cloud", "ibp", "sac", "datasphere"],
    complexityMultiplier: 1.2,
  },
  {
    id: "consumer-goods",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt", "ewm", "tm"],
    industryModuleIds: ["ibp", "pp", "qm", "brim"],
    recommendedModuleIds: ["commerce-cloud", "marketing-cloud", "cdc", "sac"],
    complexityMultiplier: 1.1,
  },
  {
    id: "professional-services",
    mandatoryModuleIds: [...CORE_MANDATORY, "ps", "concur", "tax-mgmt"],
    industryModuleIds: ["ppm", "sf-recruiting", "sf-performance"],
    recommendedModuleIds: ["sac", "sf-analytics", "fpa-planning"],
    complexityMultiplier: 0.95,
  },
  {
    id: "telecommunications",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt", "brim"],
    industryModuleIds: ["service-cloud", "commerce-cloud", "cdc", "pm-eam"],
    recommendedModuleIds: ["apm", "sac", "marketing-cloud", "datasphere"],
    complexityMultiplier: 1.2,
  },
  {
    id: "oil-gas",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt", "is-oil", "ehs"],
    industryModuleIds: ["pm-eam", "apm", "ewm"],
    recommendedModuleIds: ["ibp", "sac", "datasphere", "signavio"],
    complexityMultiplier: 1.3,
  },
  {
    id: "education",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt"],
    industryModuleIds: ["hcm-payroll-onprem", "sf-recruiting", "sf-lms", "re-fx"],
    recommendedModuleIds: ["service-cloud", "cdc", "sac"],
    complexityMultiplier: 1.0,
  },
  {
    id: "hospitality",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt"],
    industryModuleIds: ["sf-time", "service-cloud", "marketing-cloud"],
    recommendedModuleIds: ["commerce-cloud", "cdc", "sac"],
    complexityMultiplier: 1.0,
  },
  {
    id: "logistics-transport",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt", "tm", "ewm"],
    industryModuleIds: ["pm-eam", "ehs", "apm"],
    recommendedModuleIds: ["ibp", "sac", "datasphere"],
    complexityMultiplier: 1.15,
  },
  {
    id: "construction-real-estate",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt", "ps", "re-fx"],
    industryModuleIds: ["pm-eam", "ehs", "ariba-contracts"],
    recommendedModuleIds: ["sac", "ppm", "concur"],
    complexityMultiplier: 1.1,
  },
];

function buildIndustry(s: IndustryStatic, locale: Locale): IndustryPreset {
  const t = getMessages(locale).solutionBuilder.industries[s.id];
  return {
    id: s.id,
    label: stripMarkers(t.label),
    bestPractices: stripMarkers(t.bestPractices),
    phasingNarrative: stripMarkers(t.phasingNarrative),
    mandatoryModuleIds: s.mandatoryModuleIds,
    industryModuleIds: s.industryModuleIds,
    recommendedModuleIds: s.recommendedModuleIds,
    complexityMultiplier: s.complexityMultiplier,
  };
}

export function getIndustries(locale: Locale = "en"): IndustryPreset[] {
  return INDUSTRIES_STATIC.map((s) => buildIndustry(s, locale));
}

/** Back-compat: English-rendered array for non-UI consumers. */
export const INDUSTRIES: IndustryPreset[] = getIndustries("en");

// ─── Company size bands ───────────────────────────────────────────────

export type CompanySizeId = "small" | "mid" | "large" | "enterprise";

export interface CompanySizePreset {
  id: CompanySizeId;
  label: string;
  userCountRange: string;
  /** Quantity band for user-based licences (display in tables). */
  userBasedQty: string;
  /** Quantity band for transaction-based licences. */
  transactionBasedQty: string;
  /** Quantity band for employee-based licences. */
  employeeBasedQty: string;
  /** Cost multiplier vs baseline ($1M small). */
  costMultiplier: number;
  /** Team size multiplier. */
  teamMultiplier: number;
  /** Phase 1 duration in months. */
  phase1Months: number;
  phase2Months: number;
  phase3Months: number;
}

interface CompanySizeStatic {
  id: CompanySizeId;
  userCountRange: string;
  userBasedQty: string;
  transactionBasedQty: string;
  employeeBasedQty: string;
  costMultiplier: number;
  teamMultiplier: number;
  phase1Months: number;
  phase2Months: number;
  phase3Months: number;
}

const COMPANY_SIZES_STATIC: CompanySizeStatic[] = [
  {
    id: "small",
    userCountRange: "25-50",
    userBasedQty: "25-50",
    transactionBasedQty: "1,000-5,000",
    employeeBasedQty: "25-100",
    costMultiplier: 1.0,
    teamMultiplier: 1.0,
    phase1Months: 6,
    phase2Months: 4,
    phase3Months: 3,
  },
  {
    id: "mid",
    userCountRange: "50-200",
    userBasedQty: "50-200",
    transactionBasedQty: "5,000-25,000",
    employeeBasedQty: "100-500",
    costMultiplier: 2.4,
    teamMultiplier: 1.5,
    phase1Months: 9,
    phase2Months: 6,
    phase3Months: 4,
  },
  {
    id: "large",
    userCountRange: "200-800",
    userBasedQty: "200-800",
    transactionBasedQty: "25,000-100,000",
    employeeBasedQty: "500-2,000",
    costMultiplier: 5.0,
    teamMultiplier: 2.2,
    phase1Months: 12,
    phase2Months: 8,
    phase3Months: 6,
  },
  {
    id: "enterprise",
    userCountRange: "800+",
    userBasedQty: "800+",
    transactionBasedQty: "100,000+",
    employeeBasedQty: "2,000+",
    costMultiplier: 10.0,
    teamMultiplier: 3.0,
    phase1Months: 15,
    phase2Months: 12,
    phase3Months: 9,
  },
];

function buildCompanySize(s: CompanySizeStatic, locale: Locale): CompanySizePreset {
  const t = getMessages(locale).solutionBuilder.companySizes[s.id];
  return {
    id: s.id,
    label: stripMarkers(t.label),
    userCountRange: s.userCountRange,
    userBasedQty: s.userBasedQty,
    transactionBasedQty: s.transactionBasedQty,
    employeeBasedQty: s.employeeBasedQty,
    costMultiplier: s.costMultiplier,
    teamMultiplier: s.teamMultiplier,
    phase1Months: s.phase1Months,
    phase2Months: s.phase2Months,
    phase3Months: s.phase3Months,
  };
}

export function getCompanySizes(locale: Locale = "en"): CompanySizePreset[] {
  return COMPANY_SIZES_STATIC.map((s) => buildCompanySize(s, locale));
}

export const COMPANY_SIZES: CompanySizePreset[] = getCompanySizes("en");

// ─── Phase templates ──────────────────────────────────────────────────

export interface PhaseTemplate {
  id: 1 | 2 | 3;
  label: string;
  description: string;
  focusAreas: string[];
  /** Module categories that belong in this phase. */
  acceptCategories: SapModuleCategory[];
}

interface PhaseStatic {
  id: 1 | 2 | 3;
  messageKey: "phase1" | "phase2" | "phase3";
  acceptCategories: SapModuleCategory[];
}

const PHASES_STATIC: PhaseStatic[] = [
  {
    id: 1,
    messageKey: "phase1",
    acceptCategories: ["finance", "procurement", "hcm"],
  },
  {
    id: 2,
    messageKey: "phase2",
    acceptCategories: ["industry", "supply-chain", "sales-cx", "projects"],
  },
  {
    id: 3,
    messageKey: "phase3",
    acceptCategories: ["analytics", "platform"],
  },
];

function buildPhase(s: PhaseStatic, locale: Locale): PhaseTemplate {
  const t = getMessages(locale).solutionBuilder.phases[s.messageKey];
  return {
    id: s.id,
    label: stripMarkers(t.label),
    description: stripMarkers(t.description),
    focusAreas: t.focusAreas.map(stripMarkers),
    acceptCategories: s.acceptCategories,
  };
}

export function getPhases(locale: Locale = "en"): PhaseTemplate[] {
  return PHASES_STATIC.map((s) => buildPhase(s, locale));
}

export const PHASES: PhaseTemplate[] = getPhases("en");

// ─── Team role templates ──────────────────────────────────────────────

export interface TeamRole {
  role: string;
  function: string;
  /** Headcount baseline before sizing multiplier. */
  baseCount: number;
  /** Day rate band (USD). Used to multiply against effort weight. */
  dayRateBand: string;
}

// Same shape as the public TeamRole; the id ties this to MESSAGES.
type TeamRoleId =
  | "programme-director"
  | "programme-manager"
  | "solution-architect"
  | "functional-lead-finance"
  | "functional-lead-supply-chain"
  | "functional-lead-hr"
  | "functional-consultants"
  | "technical-abap-developer"
  | "basis-btp-admin"
  | "integration-cpi-consultant"
  | "data-migration-lead"
  | "change-manager"
  | "test-lead";

interface TeamRoleStatic {
  id: TeamRoleId;
  baseCount: number;
  dayRateBand: string;
}

/**
 * Standard SAP programme team. Each module added to scope increases
 * specialist functional consultant count via the engine. Tech, ABAP,
 * Basis, PMO, and Change scale with company size.
 */
const TEAM_ROLES_STATIC: TeamRoleStatic[] = [
  { id: "programme-director",        baseCount: 1, dayRateBand: "$2,000-$3,500" },
  { id: "programme-manager",         baseCount: 1, dayRateBand: "$1,400-$2,200" },
  { id: "solution-architect",        baseCount: 1, dayRateBand: "$1,600-$2,400" },
  { id: "functional-lead-finance",   baseCount: 1, dayRateBand: "$1,200-$1,800" },
  { id: "functional-lead-supply-chain", baseCount: 1, dayRateBand: "$1,200-$1,800" },
  { id: "functional-lead-hr",        baseCount: 1, dayRateBand: "$1,100-$1,700" },
  { id: "functional-consultants",    baseCount: 3, dayRateBand: "$800-$1,300" },
  { id: "technical-abap-developer",  baseCount: 2, dayRateBand: "$700-$1,200" },
  { id: "basis-btp-admin",           baseCount: 1, dayRateBand: "$800-$1,200" },
  { id: "integration-cpi-consultant", baseCount: 1, dayRateBand: "$1,000-$1,500" },
  { id: "data-migration-lead",       baseCount: 1, dayRateBand: "$1,000-$1,500" },
  { id: "change-manager",            baseCount: 1, dayRateBand: "$900-$1,400" },
  { id: "test-lead",                 baseCount: 1, dayRateBand: "$800-$1,200" },
];

function buildTeamRole(s: TeamRoleStatic, locale: Locale): TeamRole {
  const t = getMessages(locale).solutionBuilder.teamRoles[s.id];
  return {
    role: stripMarkers(t.role),
    function: stripMarkers(t.function),
    baseCount: s.baseCount,
    dayRateBand: s.dayRateBand,
  };
}

export function getTeamRoles(locale: Locale = "en"): TeamRole[] {
  return TEAM_ROLES_STATIC.map((s) => buildTeamRole(s, locale));
}

export const TEAM_ROLES: TeamRole[] = getTeamRoles("en");

// ─── License type heuristic ───────────────────────────────────────────

/** Mapping table for licenseTypeFor: returns the messages-key (not the
 *  display label). Engine calls the public licenseTypeFor below to get
 *  the display label in the user's locale. */
function licenseTypeKey(
  category: SapModuleCategory,
  moduleId?: string,
): "userBased" | "employeeBased" | "transactionBased" {
  if (category === "hcm") return "employeeBased";
  if (
    moduleId === "ariba-sourcing" ||
    moduleId === "ariba-buying" ||
    moduleId === "ariba-contracts" ||
    moduleId === "ariba-supplier"
  ) {
    return "transactionBased";
  }
  if (
    moduleId === "mm" ||
    moduleId === "inventory-mgmt" ||
    moduleId === "gr-ir"
  ) {
    return "transactionBased";
  }
  return "userBased";
}

export function licenseTypeFor(
  category: SapModuleCategory,
  moduleId?: string,
  locale: Locale = "en",
): string {
  const key = licenseTypeKey(category, moduleId);
  return stripMarkers(getMessages(locale).solutionBuilder.licenseTypes[key]);
}
