// ─── ERP Calculator — Assumptions & Multipliers ──────────────────────────────
//
// ALL pricing assumptions live here. Edit this file to update the model.
// Values are directional estimates for early-stage business case planning.
// They are NOT vendor quotes or contractual commitments.
//
// Calibration basis: aggregated publicly available benchmarks, analyst
// reports (Gartner, IDC), and practitioner experience across SAP, Oracle,
// and Microsoft programmes in GCC, Europe, UK, and North America.
// Last reviewed: 2025.

import type {
  ErpApproach,
  DeploymentModel,
  SIPartnerTier,
  DeliveryModel,
  ComplexityLevel,
  ChangeMgmtIntensity,
  TrainingModel,
  ErpMaturity,
  ImplementationType,
  RevenueRange,
  Module,
} from "./types";

// ─── Software / licensing ────────────────────────────────────────────────────
//
// Annual cost per named user, in USD.
// On-premise figures reflect annualised licence + maintenance (22%/yr).
// Cloud figures reflect SaaS subscription.
// Range: [low, expected, high]

export const SOFTWARE_COST_PER_USER_PER_YEAR: Record<
  ErpApproach,
  Record<DeploymentModel, [number, number, number]>
> = {
  sap: {
    "cloud-saas":     [900,  1200, 1600],
    "private-cloud":  [900,  1200, 1550],
    "on-premise":     [700,  950,  1300],
    hybrid:           [800,  1050, 1400],
  },
  oracle: {
    "cloud-saas":     [650,  900,  1300],
    "private-cloud":  [600,  850,  1200],
    "on-premise":     [500,  750,  1050],
    hybrid:           [550,  800,  1100],
  },
  microsoft: {
    "cloud-saas":     [250,  420,  650],
    "private-cloud":  [300,  480,  700],
    "on-premise":     [200,  350,  550],
    hybrid:           [250,  400,  600],
  },
  infor: {
    "cloud-saas":     [400,  600,  900],
    "private-cloud":  [380,  580,  850],
    "on-premise":     [300,  480,  720],
    hybrid:           [350,  520,  780],
  },
  other: {
    "cloud-saas":     [300,  500,  800],
    "private-cloud":  [280,  480,  750],
    "on-premise":     [200,  380,  600],
    hybrid:           [240,  420,  670],
  },
  "vendor-agnostic": {
    "cloud-saas":     [400,  700,  1100],
    "private-cloud":  [380,  650,  1000],
    "on-premise":     [300,  550,  880],
    hybrid:           [340,  600,  950],
  },
};

// ─── SI partner fees — base rate per user ────────────────────────────────────
//
// Base SI implementation fee per named user, in USD.
// This is the headline number BEFORE complexity, module count, and
// country multipliers are applied.
// Calibrated to total SI project fees (not day rate × days).

export const SI_BASE_RATE_PER_USER: Record<
  SIPartnerTier,
  Record<DeliveryModel, [number, number, number]>
> = {
  boutique: {
    onshore:  [2500, 3500, 5000],
    offshore: [1200, 1800, 2800],
    hybrid:   [1800, 2600, 3800],
  },
  "mid-tier": {
    onshore:  [3500, 5000, 7500],
    offshore: [1600, 2400, 3600],
    hybrid:   [2500, 3800, 5500],
  },
  "global-si": {
    onshore:  [5000, 8000, 12000],
    offshore: [2500, 4000, 6000],
    hybrid:   [3500, 5500, 8500],
  },
};

// ─── Module complexity weight ─────────────────────────────────────────────────
//
// Relative effort weight of each module. Finance = 1.0 (baseline).
// Used to scale SI fees and timeline when multiple modules are in scope.

export const MODULE_WEIGHT: Record<Module, number> = {
  finance:          1.00,
  procurement:      0.75,
  sales:            0.65,
  manufacturing:    1.10,
  "supply-chain":   0.90,
  warehouse:        0.80,
  hr:               0.70,
  payroll:          0.85,
  crm:              0.60,
  analytics:        0.55,
  epm:              0.90,
  quality:          0.50,
  "project-systems": 0.75,
};

// ─── Module count scaling factor ─────────────────────────────────────────────
//
// As more modules are added, marginal cost per additional module falls
// (shared project management, testing infrastructure, etc.).
// Applied as: totalModuleWeight^0.72 (sub-linear scaling)

export const MODULE_SCALE_EXPONENT = 0.72;

// ─── Complexity multipliers ───────────────────────────────────────────────────
//
// Applied to SI services and project sub-costs.

export const COMPLEXITY_MULTIPLIER: Record<ComplexityLevel, number> = {
  low:    0.80,
  medium: 1.00,
  high:   1.40,
};

// Separate axis multipliers (customisation / integration / data / reporting)
export const CUSTOMIZATION_MULTIPLIER: Record<ComplexityLevel, number> = {
  low:    0.85,
  medium: 1.00,
  high:   1.45,
};

export const INTEGRATION_MULTIPLIER: Record<ComplexityLevel, number> = {
  low:    0.80,
  medium: 1.00,
  high:   1.50,
};

export const DATA_MIGRATION_MULTIPLIER: Record<ComplexityLevel, number> = {
  low:    0.75,
  medium: 1.00,
  high:   1.55,
};

export const REPORTING_MULTIPLIER: Record<ComplexityLevel, number> = {
  low:    0.80,
  medium: 1.00,
  high:   1.35,
};

// ─── ERP maturity adjustment ──────────────────────────────────────────────────
//
// Starting from spreadsheets or a mixed landscape adds data migration
// and process definition work. Already on modern cloud ERP = lower cost.

export const ERP_MATURITY_MULTIPLIER: Record<ErpMaturity, number> = {
  spreadsheets:        1.25,
  "legacy-erp":        1.10,
  "mixed-landscape":   1.20,
  "modern-cloud-erp":  0.90,
};

// ─── Implementation type adjustment ──────────────────────────────────────────
//
// First-time ERP is the baseline. Post-merger harmonisation adds
// significant complexity. Reimplementation benefits from existing knowledge.

export const IMPL_TYPE_MULTIPLIER: Record<ImplementationType, number> = {
  "first-time":        1.00,
  reimplementation:    0.90,
  consolidation:       1.20,
  "carve-out":         1.25,
  "post-merger":       1.35,
};

// ─── Change management / training ────────────────────────────────────────────
//
// As % of SI services cost

export const CHANGE_MGMT_PCT: Record<ChangeMgmtIntensity, number> = {
  light:    0.06,
  standard: 0.10,
  heavy:    0.16,
};

export const TRAINING_MODEL_PCT: Record<TrainingModel, number> = {
  "train-the-trainer": 0.03,
  "role-based":        0.055,
  intensive:           0.09,
};

// ─── PMO / governance ─────────────────────────────────────────────────────────
//
// As % of total project cost (excluding contingency)

export const PMO_PCT = 0.07; // 7% — typical for managed programmes

// ─── Testing and cutover ──────────────────────────────────────────────────────
//
// As % of SI services

export const TESTING_CUTOVER_PCT = 0.09;

// ─── Infrastructure ───────────────────────────────────────────────────────────
//
// Cloud SaaS: minimal (networking, integrations). On-prem: significant.
// As % of year 1 total (before contingency).

export const INFRASTRUCTURE_PCT: Record<DeploymentModel, number> = {
  "cloud-saas":    0.04,
  "private-cloud": 0.06,
  "on-premise":    0.09,
  hybrid:          0.065,
};

// ─── Internal team cost ───────────────────────────────────────────────────────
//
// Assumed internal team members work at $600/day fully loaded cost
// (inclusive of salary, benefits, overhead). This is a directional proxy
// for the opportunity cost of internal resources.

export const INTERNAL_DAY_RATE_USD = 600;

// Timeline → working days per month
export const WORKING_DAYS_PER_MONTH = 22;

// Internal team = % of SI team size. Typically 60–80% for a well-resourced programme.
export const INTERNAL_TO_SI_RATIO = 0.65;

// ─── Timeline calculation ─────────────────────────────────────────────────────
//
// Base timeline in months for a single-country, single-module implementation.
// Scaled by module count, users, countries, complexity.

export const BASE_TIMELINE_MONTHS = 6;

export const TIMELINE_USER_BAND: Array<[number, number]> = [
  // [user count threshold, additional months]
  [100,  0],
  [300,  2],
  [1000, 4],
  [3000, 6],
  [10000, 9],
];

export const TIMELINE_MODULE_ADD_MONTHS_PER_MODULE = 1.2;

export const TIMELINE_COUNTRY_ADD_MONTHS_PER_COUNTRY = 1.5;

export const TIMELINE_COMPLEXITY_FACTOR: Record<ComplexityLevel, number> = {
  low:    0.85,
  medium: 1.00,
  high:   1.30,
};

export const TIMELINE_DEPLOYMENT_FACTOR: Record<DeploymentModel, number> = {
  "cloud-saas":    0.90,
  "private-cloud": 1.00,
  "on-premise":    1.15,
  hybrid:          1.05,
};

// ─── Revenue range midpoints (USD) ────────────────────────────────────────────
//
// Used to calculate cost as % of revenue.

export const REVENUE_MIDPOINT: Record<RevenueRange, number> = {
  "under-10m":  5_000_000,
  "10m-50m":    25_000_000,
  "50m-250m":   125_000_000,
  "250m-1b":    500_000_000,
  "1b-5b":      2_500_000_000,
  "over-5b":    7_500_000_000,
};

// ─── Ongoing support / maintenance (years 2+) ─────────────────────────────────
//
// As % of year 1 implementation cost (SI + customisation portion only)

export const ONGOING_SUPPORT_Y2_PCT = 0.15; // 15% AMS support year 2
export const ONGOING_SUPPORT_Y3_PCT = 0.12; // 12% year 3+
export const SOFTWARE_ANNUAL_ESCALATION = 1.04; // 4% annual escalation

// ─── Legal entity and business unit adjustment ────────────────────────────────
//
// Per legal entity above 1: adds flat cost to cover chart of accounts,
// statutory reporting, intercompany. Per BU: smaller add for segment setup.

export const PER_LEGAL_ENTITY_COST_USD = 25_000;
export const PER_BUSINESS_UNIT_COST_USD = 12_000;

// ─── Band spread ──────────────────────────────────────────────────────────────
//
// How wide to make the low/high band around the expected value.
// Low = expected × (1 - LOW_SPREAD), High = expected × (1 + HIGH_SPREAD)

export const LOW_SPREAD  = 0.25; // −25%
export const HIGH_SPREAD = 0.35; // +35%

// ─── Complexity score thresholds ─────────────────────────────────────────────
//
// Used to produce a 0–100 complexity score from weighted inputs.

export const COMPLEXITY_SCORE_WEIGHTS = {
  modules:               0.20,
  customization:         0.20,
  integration:           0.15,
  dataMigration:         0.15,
  countries:             0.15,
  implementationType:    0.10,
  erpMaturity:           0.05,
};

export const COMPLEXITY_LEVEL_SCORE: Record<ComplexityLevel, number> = {
  low:    25,
  medium: 60,
  high:   90,
};

export const IMPL_TYPE_SCORE: Record<ImplementationType, number> = {
  "first-time":     40,
  reimplementation: 35,
  consolidation:    65,
  "carve-out":      70,
  "post-merger":    85,
};

export const ERP_MATURITY_SCORE: Record<ErpMaturity, number> = {
  spreadsheets:       80,
  "legacy-erp":       60,
  "mixed-landscape":  70,
  "modern-cloud-erp": 30,
};
