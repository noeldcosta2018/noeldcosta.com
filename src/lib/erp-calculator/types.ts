// ─── ERP Calculator — Type Definitions ───────────────────────────────────────
// All types used across the calc engine and UI components.

export type RevenueRange =
  | "under-10m"
  | "10m-50m"
  | "50m-250m"
  | "250m-1b"
  | "1b-5b"
  | "over-5b";

export type EmployeeRange =
  | "under-100"
  | "100-500"
  | "500-2000"
  | "2000-10000"
  | "over-10000";

export type Industry =
  | "manufacturing"
  | "retail"
  | "financial-services"
  | "aviation-transport"
  | "government-public"
  | "utilities-energy"
  | "oil-gas"
  | "healthcare"
  | "telecom"
  | "construction"
  | "professional-services"
  | "other";

export type ErpMaturity =
  | "spreadsheets"
  | "legacy-erp"
  | "mixed-landscape"
  | "modern-cloud-erp";

export type ImplementationType =
  | "first-time"
  | "reimplementation"
  | "consolidation"
  | "carve-out"
  | "post-merger";

export type ErpApproach =
  | "sap"
  | "oracle"
  | "microsoft"
  | "infor"
  | "other"
  | "vendor-agnostic";

export type DeploymentModel =
  | "cloud-saas"
  | "private-cloud"
  | "on-premise"
  | "hybrid";

export type ComplexityLevel = "low" | "medium" | "high";

export type SIPartnerTier = "boutique" | "mid-tier" | "global-si";

export type DeliveryModel = "onshore" | "offshore" | "hybrid";

export type ChangeMgmtIntensity = "light" | "standard" | "heavy";

export type TrainingModel = "train-the-trainer" | "role-based" | "intensive";

export type PlanningHorizon = 1 | 3 | 5;

export type Module =
  | "finance"
  | "procurement"
  | "sales"
  | "manufacturing"
  | "supply-chain"
  | "warehouse"
  | "hr"
  | "payroll"
  | "crm"
  | "analytics"
  | "epm"
  | "quality"
  | "project-systems";

// ─── Country entry (per-country rollout detail) ───────────────────────────────

export interface CountryEntry {
  id: string;
  countryCode: string; // ISO-3166-1 alpha-2
  users: number;
  legalEntities: number;
  localizationComplexity: ComplexityLevel;
  languageCount: number;
  wave: number; // rollout wave number (1 = first go-live)
}

// ─── Main calculator inputs ───────────────────────────────────────────────────

export interface CalculatorInputs {
  // Step 1: Company profile
  companyName: string;
  revenueRange: RevenueRange;
  employeeCount: number;
  userCount: number;
  namedVsConcurrentSplit: number; // % named (0–100)
  legalEntities: number;
  businessUnits: number;
  industry: Industry;
  erpMaturity: ErpMaturity;
  implementationType: ImplementationType;

  // Step 2: Program scope
  erpApproach: ErpApproach;
  deploymentModel: DeploymentModel;
  modules: Module[];
  customizationLevel: ComplexityLevel;
  integrationComplexity: ComplexityLevel;
  dataMigrationComplexity: ComplexityLevel;
  reportingComplexity: ComplexityLevel;
  targetTimelineMonths: number;

  // Step 3: Countries
  countries: CountryEntry[];
  hqCountryCode: string;

  // Step 4: Delivery
  siPartnerTier: SIPartnerTier;
  deliveryModel: DeliveryModel;
  internalTeamSize: number;
  changeMgmtIntensity: ChangeMgmtIntensity;
  trainingModel: TrainingModel;

  // Step 5: Financial assumptions
  planningHorizon: PlanningHorizon;
  contingencyPct: number; // e.g. 15 = 15%
  inflationPct: number;   // e.g. 3 = 3%
  discountRate: number;   // e.g. 8 = 8% (for NPV)
  reportingCurrency: string; // ISO-4217 e.g. "USD"
}

// ─── Cost band (low / expected / high) ───────────────────────────────────────

export interface CostBand {
  low: number;
  expected: number;
  high: number;
}

// ─── Cost breakdown by category ──────────────────────────────────────────────

export interface CostBreakdown {
  software: CostBand;
  siServices: CostBand;
  internalTeam: CostBand;
  dataMigration: CostBand;
  integration: CostBand;
  changeAndTraining: CostBand;
  testingAndCutover: CostBand;
  infrastructure: CostBand;
  localization: CostBand;
  pmo: CostBand;
  contingency: CostBand;
}

// ─── Timeline estimate ────────────────────────────────────────────────────────

export interface TimelinePhase {
  name: string;
  durationMonths: number;
}

export interface TimelineEstimate {
  minimumMonths: number;
  expectedMonths: number;
  maximumMonths: number;
  phases: TimelinePhase[];
}

// ─── Per-country result ───────────────────────────────────────────────────────

export interface CountryResult {
  countryCode: string;
  countryName: string;
  users: number;
  legalEntities: number;
  wave: number;
  localCostFactor: number;
  localizationComplexity: ComplexityLevel;
  costSharePct: number;
  expectedCostUSD: CostBand;
  localCurrencyCode: string;
  localCurrencyAmount: CostBand;
}

// ─── Warning flags ────────────────────────────────────────────────────────────

export interface WarningFlag {
  severity: "info" | "warning" | "critical";
  workstream: string;
  message: string;
  detail: string;
}

// ─── Assumption overrides (advanced mode) ────────────────────────────────────

export interface AssumptionOverrides {
  softwareCostPerUserPerYear?: number;
  siBaseRatePerUser?: number;
  dataMigrationBaseRate?: number;
  integrationBaseRate?: number;
  pmoMultiplier?: number;
  internalDayRate?: number;
}

// ─── Full calculation result ──────────────────────────────────────────────────

export interface CalculationResult {
  // Totals
  totalY1: CostBand;
  tco3yr: CostBand;
  tco5yr: CostBand;
  costPerUser: CostBand;
  costAsRevenuePct: number;
  complexityScore: number; // 0–100
  multiCountryRating: "low" | "moderate" | "high" | "very-high";

  // Breakdown (year 1 implementation + software)
  breakdown: CostBreakdown;

  // Timeline
  timeline: TimelineEstimate;

  // Per-country breakdown
  countryResults: CountryResult[];

  // Cash-flow profile (USD, by year index)
  yearlySpend: number[];

  // Warnings
  warnings: WarningFlag[];

  // Echoed inputs
  inputs: CalculatorInputs;

  // Assumption summary (for display in assumptions panel)
  assumptionsSummary: {
    softwareCostPerUserPerYear: number;
    siBlendedDayRate: number;
    contingencyPct: number;
    totalCountries: number;
    totalModules: number;
  };

  generatedAt: string;
}

// ─── Preset scenario ──────────────────────────────────────────────────────────

export interface PresetScenario {
  id: string;
  name: string;
  description: string;
  badge: string; // short label e.g. "Mid-market"
  inputs: CalculatorInputs;
}

// ─── Saved comparison scenario ────────────────────────────────────────────────

export interface SavedScenario {
  id: string;
  label: string;
  result: CalculationResult;
  savedAt: string;
}
