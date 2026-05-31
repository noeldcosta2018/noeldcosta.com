/**
 * SAP module catalogue for cost-estimation tools.
 *
 * Curated for the CFO / CIO assessing the cost of an SAP implementation.
 * Modules are the granularity vendors actually quote at, not the marketing
 * LoB rollups. Group consolidation is a different line item from core
 * Finance. Treasury is a different line item from FSCM. Etc.
 *
 * Effort weight is a relative implementation-effort multiplier. 1.0 is a
 * baseline core module (think Financial Accounting). Heavier modules
 * (Payroll, EWM, Group Reporting) carry higher weights because they need
 * specialist resources and longer test cycles. Lighter modules
 * (embedded analytics, lightweight CX add-ons) carry lower weights.
 *
 * Weights are deliberately conservative and based on patterns across
 * the programmes I've delivered. They are NOT a vendor quote.
 *
 * ── i18n architecture (Pass 2b-2c) ────────────────────────────────────
 *
 * Translatable fields (`label` and `description`) moved to
 * MESSAGES.sapModules in src/lib/i18n/messages.ts. The static
 * SAP_MODULES_STATIC array below keeps only the structural fields that
 * never translate: id, optional code (proper-noun acronym), category,
 * effortWeight, and the optional `core` flag.
 *
 * Consumers use the locale-aware getters (getSapModules, getModuleById,
 * etc.) which merge the static structure with translated label +
 * description, stripping <noTranslate> markers at the boundary so
 * downstream JSX receives clean strings. Each getter accepts an
 * optional locale; the default of "en" preserves the original synchronous
 * API for non-UI consumers (e.g. the LLM-bound API payload in ToolForm)
 * and for backward compatibility while the engine.ts / SolutionClient
 * refactor catches up in Pass 2b-2d.
 *
 * `sumEffortWeight` doesn't need translation — kept as a pure
 * structural-only helper that operates on the static map.
 */

import { type Locale } from "@/lib/locales";
import { getMessages, stripMarkers } from "@/lib/i18n/useTranslation";

export type SapModuleCategory =
  | "finance"
  | "procurement"
  | "supply-chain"
  | "sales-cx"
  | "hcm"
  | "projects"
  | "analytics"
  | "platform"
  | "industry";

export interface SapModule {
  id: string;
  label: string;
  code?: string;
  category: SapModuleCategory;
  description: string;
  effortWeight: number;
  /** Core modules surfaced as a quick-add at the top of the picker. */
  core?: boolean;
}

// ─── Static structural data ──────────────────────────────────────────
//
// Order here is the canonical render order. The label / description /
// blurb live in MESSAGES.sapModules — the merge happens in the getters
// below. Keys MUST match the corresponding MESSAGES.sapModules.modules.<id>
// entry; mismatches cause the getter to fall back to the ID literal.

interface SapModuleStatic {
  id: string;
  code?: string;
  category: SapModuleCategory;
  effortWeight: number;
  core?: boolean;
}

const SAP_MODULES_STATIC: SapModuleStatic[] = [
  // ─── Finance & Controlling ───────────────────────────────────────────
  { id: "fi-gl", code: "FI-GL", category: "finance", effortWeight: 1.0, core: true },
  { id: "fi-ap", code: "FI-AP", category: "finance", effortWeight: 0.6, core: true },
  { id: "fi-ar", code: "FI-AR", category: "finance", effortWeight: 0.6, core: true },
  { id: "fi-aa", code: "FI-AA", category: "finance", effortWeight: 0.6 },
  { id: "fi-bl", code: "FI-BL", category: "finance", effortWeight: 0.5 },
  { id: "tax-mgmt", category: "finance", effortWeight: 0.7 },
  { id: "co", code: "CO", category: "finance", effortWeight: 0.8, core: true },
  { id: "co-cca", code: "CO-CCA", category: "finance", effortWeight: 0.5 },
  { id: "co-pca", code: "CO-PCA", category: "finance", effortWeight: 0.5 },
  { id: "co-pc", code: "CO-PC", category: "finance", effortWeight: 0.9 },
  { id: "co-pa", code: "CO-PA", category: "finance", effortWeight: 0.9 },
  { id: "internal-orders", category: "finance", effortWeight: 0.3 },
  { id: "group-reporting", category: "finance", effortWeight: 1.1 },
  { id: "bpc", code: "BPC", category: "finance", effortWeight: 1.0 },
  { id: "fpa-planning", category: "finance", effortWeight: 0.9 },
  { id: "treasury", code: "TRM", category: "finance", effortWeight: 1.2 },
  { id: "in-house-cash", category: "finance", effortWeight: 0.7 },
  { id: "fscm-credit", code: "FSCM-CR", category: "finance", effortWeight: 0.5 },
  { id: "fscm-dispute", code: "FSCM-DM", category: "finance", effortWeight: 0.4 },
  { id: "fscm-collections", code: "FSCM-COL", category: "finance", effortWeight: 0.4 },
  { id: "re-fx", code: "RE-FX", category: "finance", effortWeight: 0.7 },
  { id: "drc", code: "DRC", category: "finance", effortWeight: 0.6 },

  // ─── Procurement ─────────────────────────────────────────────────────
  { id: "mm", code: "MM", category: "procurement", effortWeight: 0.9, core: true },
  { id: "ariba-sourcing", category: "procurement", effortWeight: 0.7 },
  { id: "ariba-buying", category: "procurement", effortWeight: 0.8 },
  { id: "ariba-contracts", category: "procurement", effortWeight: 0.5 },
  { id: "ariba-supplier", category: "procurement", effortWeight: 0.5 },
  { id: "inventory-mgmt", category: "procurement", effortWeight: 0.5 },
  { id: "gr-ir", code: "GR/IR", category: "procurement", effortWeight: 0.4 },

  // ─── Supply Chain & Manufacturing ────────────────────────────────────
  { id: "pp", code: "PP", category: "supply-chain", effortWeight: 1.0 },
  { id: "ppds", code: "PP/DS", category: "supply-chain", effortWeight: 1.0 },
  { id: "me", code: "ME", category: "supply-chain", effortWeight: 1.1 },
  { id: "qm", code: "QM", category: "supply-chain", effortWeight: 0.7 },
  { id: "pm-eam", code: "PM", category: "supply-chain", effortWeight: 0.9 },
  { id: "ehs", code: "EHS", category: "supply-chain", effortWeight: 0.7 },
  { id: "ewm", code: "EWM", category: "supply-chain", effortWeight: 1.3 },
  { id: "tm", code: "TM", category: "supply-chain", effortWeight: 1.0 },
  { id: "ibp", code: "IBP", category: "supply-chain", effortWeight: 1.0 },
  { id: "dmc", code: "DMC", category: "supply-chain", effortWeight: 1.1 },
  { id: "apm", code: "APM", category: "supply-chain", effortWeight: 0.9 },

  // ─── Sales & CX ──────────────────────────────────────────────────────
  { id: "sd", code: "SD", category: "sales-cx", effortWeight: 0.9, core: true },
  { id: "pricing-conditions", category: "sales-cx", effortWeight: 0.6 },
  { id: "brim", code: "BRIM", category: "sales-cx", effortWeight: 1.2 },
  { id: "sales-cloud", category: "sales-cx", effortWeight: 0.7 },
  { id: "service-cloud", category: "sales-cx", effortWeight: 0.8 },
  { id: "marketing-cloud", category: "sales-cx", effortWeight: 0.7 },
  { id: "commerce-cloud", category: "sales-cx", effortWeight: 1.1 },
  { id: "cdc", category: "sales-cx", effortWeight: 0.6 },
  { id: "cpq", code: "CPQ", category: "sales-cx", effortWeight: 0.9 },
  { id: "subscription-billing", category: "sales-cx", effortWeight: 0.9 },

  // ─── HCM (SuccessFactors) ────────────────────────────────────────────
  { id: "sf-ec", category: "hcm", effortWeight: 0.9 },
  { id: "sf-ec-payroll", category: "hcm", effortWeight: 1.4 },
  { id: "hcm-payroll-onprem", code: "PY", category: "hcm", effortWeight: 1.5 },
  { id: "sf-time", category: "hcm", effortWeight: 0.8 },
  { id: "sf-recruiting", category: "hcm", effortWeight: 0.7 },
  { id: "sf-onboarding", category: "hcm", effortWeight: 0.5 },
  { id: "sf-performance", category: "hcm", effortWeight: 0.6 },
  { id: "sf-lms", code: "LMS", category: "hcm", effortWeight: 0.7 },
  { id: "sf-comp", category: "hcm", effortWeight: 0.7 },
  { id: "sf-variable-pay", category: "hcm", effortWeight: 0.5 },
  { id: "sf-succession", category: "hcm", effortWeight: 0.6 },
  { id: "sf-analytics", category: "hcm", effortWeight: 0.6 },

  // ─── Projects ────────────────────────────────────────────────────────
  { id: "ps", code: "PS", category: "projects", effortWeight: 0.9 },
  { id: "ppm", code: "PPM", category: "projects", effortWeight: 0.7 },
  { id: "concur", category: "projects", effortWeight: 0.5 },

  // ─── Analytics & Data ────────────────────────────────────────────────
  { id: "sac", code: "SAC", category: "analytics", effortWeight: 0.8 },
  { id: "datasphere", category: "analytics", effortWeight: 0.9 },
  { id: "bw4hana", category: "analytics", effortWeight: 1.0 },
  { id: "embedded-analytics", category: "analytics", effortWeight: 0.4 },

  // ─── Platform & Integration ──────────────────────────────────────────
  { id: "btp", code: "BTP", category: "platform", effortWeight: 0.7 },
  { id: "integration-suite", code: "CPI", category: "platform", effortWeight: 0.8 },
  { id: "build", category: "platform", effortWeight: 0.5 },
  { id: "mdg", code: "MDG", category: "platform", effortWeight: 1.0 },
  { id: "signavio", category: "platform", effortWeight: 0.6 },
  { id: "ias", category: "platform", effortWeight: 0.5 },
  { id: "ilm", code: "ILM", category: "platform", effortWeight: 0.6 },

  // ─── Industry add-ons ────────────────────────────────────────────────
  { id: "is-retail", code: "IS-Retail", category: "industry", effortWeight: 1.1 },
  { id: "is-oil", code: "IS-OIL", category: "industry", effortWeight: 1.3 },
  { id: "is-utilities", code: "IS-U", category: "industry", effortWeight: 1.2 },
  { id: "is-public-sector", code: "IS-PS", category: "industry", effortWeight: 1.1 },
  { id: "is-banking", category: "industry", effortWeight: 1.3 },
  { id: "is-defense", code: "DFPS", category: "industry", effortWeight: 1.2 },
];

const STATIC_BY_ID = new Map(SAP_MODULES_STATIC.map((m) => [m.id, m]));

// Categories in canonical render order. Same shape as before — the
// translated label / blurb come from MESSAGES.sapModules.categories.
const CATEGORY_ORDER: SapModuleCategory[] = [
  "finance",
  "procurement",
  "supply-chain",
  "sales-cx",
  "hcm",
  "projects",
  "analytics",
  "platform",
  "industry",
];

// ─── Locale-aware getters ────────────────────────────────────────────

function buildModule(s: SapModuleStatic, locale: Locale): SapModule {
  const m = getMessages(locale).sapModules.modules[s.id];
  return {
    id: s.id,
    // Fall back to the ID literal when a MESSAGES entry is missing —
    // same fail-visible convention used elsewhere in the i18n layer.
    label: m ? stripMarkers(m.label) : s.id,
    code: s.code,
    category: s.category,
    description: m ? stripMarkers(m.description) : "",
    effortWeight: s.effortWeight,
    core: s.core,
  };
}

/** Full module catalogue in canonical order, with translated labels +
 *  descriptions. Locale defaults to English so older synchronous
 *  callers (cost engines, API serialisers) keep working.
 */
export function getSapModules(locale: Locale = "en"): SapModule[] {
  return SAP_MODULES_STATIC.map((s) => buildModule(s, locale));
}

/** Quick lookup by id. */
export function getModuleById(
  id: string,
  locale: Locale = "en",
): SapModule | undefined {
  const s = STATIC_BY_ID.get(id);
  return s ? buildModule(s, locale) : undefined;
}

export function getModulesByCategory(
  category: SapModuleCategory,
  locale: Locale = "en",
): SapModule[] {
  return SAP_MODULES_STATIC.filter((m) => m.category === category).map((s) =>
    buildModule(s, locale),
  );
}

export function getCoreModules(locale: Locale = "en"): SapModule[] {
  return SAP_MODULES_STATIC.filter((m) => m.core).map((s) =>
    buildModule(s, locale),
  );
}

/** Total effort weight for selected module IDs. Used by cost engines —
 *  no translation needed because this only touches structural data.
 */
export function sumEffortWeight(ids: string[]): number {
  return ids.reduce((sum, id) => {
    const s = STATIC_BY_ID.get(id);
    return sum + (s ? s.effortWeight : 0);
  }, 0);
}

// ─── Category catalogue ──────────────────────────────────────────────

export interface SapModuleCategoryEntry {
  id: SapModuleCategory;
  label: string;
  blurb: string;
}

export function getSapModuleCategories(
  locale: Locale = "en",
): SapModuleCategoryEntry[] {
  const cats = getMessages(locale).sapModules.categories;
  return CATEGORY_ORDER.map((id) => ({
    id,
    label: stripMarkers(cats[id].label),
    blurb: stripMarkers(cats[id].blurb),
  }));
}

// ─── English fallback constants ──────────────────────────────────────
//
// Module-level constants pre-rendered in English. Kept as exports so
// non-UI consumers (engine.ts, the LLM-bound API payload in ToolForm)
// can keep using a synchronous array reference without threading a
// locale through. UI consumers should call getSapModules(locale)
// directly to render in the user's language.

export const SAP_MODULES: SapModule[] = getSapModules("en");
export const SAP_MODULE_CATEGORIES: SapModuleCategoryEntry[] =
  getSapModuleCategories("en");
