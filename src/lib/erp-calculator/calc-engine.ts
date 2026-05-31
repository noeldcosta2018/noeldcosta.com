// ─── ERP Calculator — Calculation Engine ─────────────────────────────────────
//
// Pure functions. No UI dependencies. No side effects.
// All inputs typed; all outputs typed.
//
// Usage:
//   import { calculate } from "@/lib/erp-calculator/calc-engine";
//   const result = calculate(inputs);
//
// To adjust the model, edit assumptions.ts and countries.ts.
// Do not change this file unless the calculation logic itself changes.

import type {
  CalculatorInputs,
  CalculationResult,
  CostBand,
  CostBreakdown,
  TimelineEstimate,
  CountryResult,
  WarningFlag,
} from "./types";
import {
  SOFTWARE_COST_PER_USER_PER_YEAR,
  SI_BASE_RATE_PER_USER,
  MODULE_WEIGHT,
  MODULE_SCALE_EXPONENT,
  CUSTOMIZATION_MULTIPLIER,
  INTEGRATION_MULTIPLIER,
  DATA_MIGRATION_MULTIPLIER,
  REPORTING_MULTIPLIER,
  ERP_MATURITY_MULTIPLIER,
  IMPL_TYPE_MULTIPLIER,
  CHANGE_MGMT_PCT,
  TRAINING_MODEL_PCT,
  PMO_PCT,
  TESTING_CUTOVER_PCT,
  INFRASTRUCTURE_PCT,
  INTERNAL_DAY_RATE_USD,
  WORKING_DAYS_PER_MONTH,
  INTERNAL_TO_SI_RATIO,
  BASE_TIMELINE_MONTHS,
  TIMELINE_USER_BAND,
  TIMELINE_MODULE_ADD_MONTHS_PER_MODULE,
  TIMELINE_COUNTRY_ADD_MONTHS_PER_COUNTRY,
  TIMELINE_COMPLEXITY_FACTOR,
  TIMELINE_DEPLOYMENT_FACTOR,
  REVENUE_MIDPOINT,
  PER_LEGAL_ENTITY_COST_USD,
  PER_BUSINESS_UNIT_COST_USD,
  ONGOING_SUPPORT_Y2_PCT,
  ONGOING_SUPPORT_Y3_PCT,
  SOFTWARE_ANNUAL_ESCALATION,
  LOW_SPREAD,
  HIGH_SPREAD,
  COMPLEXITY_SCORE_WEIGHTS,
  COMPLEXITY_LEVEL_SCORE,
  IMPL_TYPE_SCORE,
  ERP_MATURITY_SCORE,
  ONGOING_SUPPORT_Y2_PCT as _unused1,
} from "./assumptions";
import {
  getCountry,
  getCountryName,
  getCountryCurrency,
  getExchangeRate,
  LOCALIZATION_COMPLEXITY_MULTIPLIER,
} from "./countries";
import { type Locale } from "@/lib/locales";
import { getMessages, interpolate, stripMarkers } from "@/lib/i18n/useTranslation";

// ─── Render-time marker stripping ──────────────────────────────────────────
// Strings returned from this module land in JSX rendered by the calculator
// client component. Wrapper tags around proper nouns in MESSAGES survive
// the translation pipeline but must not reach the DOM. Apply at the
// boundary where the engine pulls a value out of MESSAGES.
function s(value: string): string {
  return stripMarkers(value);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Wrap an expected value into a low/high band. */
function band(expected: number): CostBand {
  return {
    low:      Math.round(expected * (1 - LOW_SPREAD)),
    expected: Math.round(expected),
    high:     Math.round(expected * (1 + HIGH_SPREAD)),
  };
}

/** Add two CostBands. */
function addBands(a: CostBand, b: CostBand): CostBand {
  return {
    low:      a.low + b.low,
    expected: a.expected + b.expected,
    high:     a.high + b.high,
  };
}

/** Scale a CostBand by a scalar. */
function scaleBand(b: CostBand, factor: number): CostBand {
  return {
    low:      Math.round(b.low * factor),
    expected: Math.round(b.expected * factor),
    high:     Math.round(b.high * factor),
  };
}

/** Sum an array of CostBands. */
function sumBands(bands: CostBand[]): CostBand {
  return bands.reduce(addBands, { low: 0, expected: 0, high: 0 });
}

/** Clamp a number between min and max. */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// ─── Module weight calculation ─────────────────────────────────────────────

function totalModuleWeight(modules: CalculatorInputs["modules"]): number {
  if (modules.length === 0) return 1;
  const sum = modules.reduce((acc, m) => acc + (MODULE_WEIGHT[m] ?? 0.75), 0);
  // Sub-linear scaling: double the modules doesn't double the cost
  return Math.pow(sum, MODULE_SCALE_EXPONENT);
}

// ─── Software cost ─────────────────────────────────────────────────────────

function calcSoftwareCost(inputs: CalculatorInputs): CostBand {
  const [low, expected, high] =
    SOFTWARE_COST_PER_USER_PER_YEAR[inputs.erpApproach]?.[inputs.deploymentModel] ??
    [400, 700, 1100];

  const users = inputs.userCount;
  // Year 1: full subscription/license fee
  return {
    low:      Math.round(low * users),
    expected: Math.round(expected * users),
    high:     Math.round(high * users),
  };
}

// ─── SI services cost ──────────────────────────────────────────────────────

function calcSIServices(inputs: CalculatorInputs): CostBand {
  const [low, expected, high] =
    SI_BASE_RATE_PER_USER[inputs.siPartnerTier]?.[inputs.deliveryModel] ??
    [2500, 4000, 6000];

  const modWeight = totalModuleWeight(inputs.modules);
  const custMult  = CUSTOMIZATION_MULTIPLIER[inputs.customizationLevel] ?? 1;
  const maturMult = ERP_MATURITY_MULTIPLIER[inputs.erpMaturity] ?? 1;
  const implMult  = IMPL_TYPE_MULTIPLIER[inputs.implementationType] ?? 1;

  // Entity and BU overhead
  const entityBuAdd =
    (inputs.legalEntities - 1) * PER_LEGAL_ENTITY_COST_USD +
    (inputs.businessUnits - 1)  * PER_BUSINESS_UNIT_COST_USD;

  const baseExpected = expected * inputs.userCount * modWeight * custMult * maturMult * implMult + entityBuAdd;
  const baseLow      = low      * inputs.userCount * modWeight * 0.85 * maturMult * implMult + entityBuAdd * 0.8;
  const baseHigh     = high     * inputs.userCount * modWeight * custMult * maturMult * implMult * 1.15 + entityBuAdd * 1.2;

  return {
    low:      Math.round(baseLow),
    expected: Math.round(baseExpected),
    high:     Math.round(baseHigh),
  };
}

// ─── Data migration cost ───────────────────────────────────────────────────

function calcDataMigration(inputs: CalculatorInputs, siServices: CostBand): CostBand {
  const mult = DATA_MIGRATION_MULTIPLIER[inputs.dataMigrationComplexity] ?? 1;
  const base = siServices.expected * 0.12 * mult;
  return band(base);
}

// ─── Integration cost ──────────────────────────────────────────────────────

function calcIntegration(inputs: CalculatorInputs, siServices: CostBand): CostBand {
  const mult = INTEGRATION_MULTIPLIER[inputs.integrationComplexity] ?? 1;
  const base = siServices.expected * 0.14 * mult;
  return band(base);
}

// ─── Change management + training ─────────────────────────────────────────

function calcChangeAndTraining(inputs: CalculatorInputs, siServices: CostBand): CostBand {
  const cmPct   = CHANGE_MGMT_PCT[inputs.changeMgmtIntensity]   ?? 0.10;
  const trainPct = TRAINING_MODEL_PCT[inputs.trainingModel]      ?? 0.055;
  const base = siServices.expected * (cmPct + trainPct);
  return band(base);
}

// ─── Testing + cutover ─────────────────────────────────────────────────────

function calcTestingCutover(siServices: CostBand): CostBand {
  return band(siServices.expected * TESTING_CUTOVER_PCT);
}

// ─── Infrastructure ────────────────────────────────────────────────────────

function calcInfrastructure(inputs: CalculatorInputs, totalBeforeInfra: number): CostBand {
  const pct = INFRASTRUCTURE_PCT[inputs.deploymentModel] ?? 0.05;
  return band(totalBeforeInfra * pct);
}

// ─── Localization (per country) ────────────────────────────────────────────

function calcLocalization(inputs: CalculatorInputs): CostBand {
  let total = 0;
  for (const ce of inputs.countries) {
    const countryData = getCountry(ce.countryCode);
    const base = countryData?.localizationBase ?? 30_000;
    const mult = LOCALIZATION_COMPLEXITY_MULTIPLIER[ce.localizationComplexity] ?? 1;
    const langAdd = Math.max(0, ce.languageCount - 1) * 8_000;
    total += base * mult + langAdd;
  }
  // HQ also needs localization if it has a country entry
  if (inputs.countries.length === 0) {
    const hqData = getCountry(inputs.hqCountryCode);
    total += (hqData?.localizationBase ?? 35_000) * 0.7; // HQ localization is simpler
  }
  return band(total);
}

// ─── PMO + governance ──────────────────────────────────────────────────────

function calcPMO(preContingencyTotal: number): CostBand {
  return band(preContingencyTotal * PMO_PCT);
}

// ─── Internal team cost ────────────────────────────────────────────────────

function calcInternalTeam(inputs: CalculatorInputs): CostBand {
  const teamSize = inputs.internalTeamSize;
  const durationDays = inputs.targetTimelineMonths * WORKING_DAYS_PER_MONTH;
  const base = teamSize * durationDays * INTERNAL_DAY_RATE_USD * INTERNAL_TO_SI_RATIO;
  return band(base);
}

// ─── Reporting / compliance overhead ──────────────────────────────────────

function calcReportingOverhead(inputs: CalculatorInputs, siServices: CostBand): CostBand {
  const mult = REPORTING_MULTIPLIER[inputs.reportingComplexity] ?? 1;
  // Folded into SI services as an uplift — not a separate line item,
  // but applied to integration and testing costs.
  // Returned as an adjustment contribution to integration.
  const base = siServices.expected * 0.04 * mult;
  return band(base);
}

// ─── Contingency ──────────────────────────────────────────────────────────

function calcContingency(preContigTotal: number, pct: number): CostBand {
  return band(preContigTotal * (pct / 100));
}

// ─── Timeline estimate ─────────────────────────────────────────────────────

function calcTimeline(inputs: CalculatorInputs, locale: Locale): TimelineEstimate {
  const phaseMsgs = getMessages(locale).calculator.phases;
  let months = BASE_TIMELINE_MONTHS;

  // User count add
  const userBands = [...TIMELINE_USER_BAND].reverse();
  for (const [threshold, add] of userBands) {
    if (inputs.userCount >= threshold) {
      months += add;
      break;
    }
  }

  // Module count
  months += inputs.modules.length * TIMELINE_MODULE_ADD_MONTHS_PER_MODULE;

  // Country count (rollout countries after HQ)
  const extraCountries = Math.max(0, inputs.countries.length - 1);
  months += extraCountries * TIMELINE_COUNTRY_ADD_MONTHS_PER_COUNTRY;

  // Highest complexity axis drives the main factor
  const complexities = [
    inputs.customizationLevel,
    inputs.integrationComplexity,
    inputs.dataMigrationComplexity,
    inputs.reportingComplexity,
  ];
  const complexityScores = complexities.map(
    (c) => TIMELINE_COMPLEXITY_FACTOR[c] ?? 1
  );
  const avgComplexity = complexityScores.reduce((a, b) => a + b, 0) / complexityScores.length;
  months *= avgComplexity;

  // Deployment model
  months *= TIMELINE_DEPLOYMENT_FACTOR[inputs.deploymentModel] ?? 1;

  // Implementation type
  if (inputs.implementationType === "post-merger") months *= 1.25;
  if (inputs.implementationType === "consolidation") months *= 1.15;
  if (inputs.implementationType === "carve-out") months *= 1.20;
  if (inputs.implementationType === "reimplementation") months *= 0.90;

  // ERP maturity
  if (inputs.erpMaturity === "spreadsheets") months *= 1.15;
  if (inputs.erpMaturity === "modern-cloud-erp") months *= 0.92;

  const expected = Math.max(6, Math.round(months));
  const minimum  = Math.max(4, Math.round(expected * 0.80));
  const maximum  = Math.round(expected * 1.30);

  // Phase breakdown — names looked up from MESSAGES.calculator.phases.
  // Same English keys + ratios as before; only the rendered label is
  // locale-aware. <noTranslate> markers stripped at the boundary.
  const phases = [
    { name: s(phaseMsgs.prepareExplore),    durationMonths: Math.round(expected * 0.12) },
    { name: s(phaseMsgs.designBlueprint),   durationMonths: Math.round(expected * 0.18) },
    { name: s(phaseMsgs.buildConfigure),    durationMonths: Math.round(expected * 0.30) },
    { name: s(phaseMsgs.test),              durationMonths: Math.round(expected * 0.18) },
    { name: s(phaseMsgs.deployCutover),     durationMonths: Math.round(expected * 0.10) },
    { name: s(phaseMsgs.hypercareStabilise), durationMonths: Math.round(expected * 0.12) },
  ];

  return { minimumMonths: minimum, expectedMonths: expected, maximumMonths: maximum, phases };
}

// ─── Per-country breakdown ─────────────────────────────────────────────────

function calcCountryResults(
  inputs: CalculatorInputs,
  totalImplementation: CostBand
): CountryResult[] {
  if (inputs.countries.length === 0) {
    // Single-country: all cost in HQ country
    const hqData = getCountry(inputs.hqCountryCode);
    const fx = hqData?.exchangeRateToUSD ?? 1;
    return [
      {
        countryCode:         inputs.hqCountryCode,
        countryName:         getCountryName(inputs.hqCountryCode),
        users:               inputs.userCount,
        legalEntities:       inputs.legalEntities,
        wave:                1,
        localCostFactor:     hqData?.costIndex ?? 1,
        localizationComplexity: "medium",
        costSharePct:        100,
        expectedCostUSD:     totalImplementation,
        localCurrencyCode:   getCountryCurrency(inputs.hqCountryCode),
        localCurrencyAmount: scaleBand(totalImplementation, fx),
      },
    ];
  }

  // Multi-country: distribute cost by user count × cost index
  const allCountries = [
    {
      id: "hq",
      countryCode: inputs.hqCountryCode,
      users: inputs.userCount - inputs.countries.reduce((a, c) => a + c.users, 0),
      legalEntities: Math.max(1, inputs.legalEntities - inputs.countries.reduce((a, c) => a + c.legalEntities, 0)),
      localizationComplexity: "medium" as const,
      languageCount: 1,
      wave: 1,
    },
    ...inputs.countries,
  ].filter((c) => c.users > 0);

  const totalWeightedUsers = allCountries.reduce((acc, c) => {
    const costIdx = getCountry(c.countryCode)?.costIndex ?? 1;
    return acc + c.users * costIdx;
  }, 0);

  return allCountries.map((ce) => {
    const countryData = getCountry(ce.countryCode);
    const costIdx     = countryData?.costIndex ?? 1;
    const share       = totalWeightedUsers > 0
      ? (ce.users * costIdx) / totalWeightedUsers
      : 1 / allCountries.length;

    const expectedCostUSD: CostBand = {
      low:      Math.round(totalImplementation.low      * share),
      expected: Math.round(totalImplementation.expected * share),
      high:     Math.round(totalImplementation.high     * share),
    };

    const fx = getExchangeRate(ce.countryCode);
    return {
      countryCode:         ce.countryCode,
      countryName:         getCountryName(ce.countryCode),
      users:               ce.users,
      legalEntities:       ce.legalEntities,
      wave:                ce.wave,
      localCostFactor:     costIdx,
      localizationComplexity: ce.localizationComplexity,
      costSharePct:        Math.round(share * 100),
      expectedCostUSD,
      localCurrencyCode:   getCountryCurrency(ce.countryCode),
      localCurrencyAmount: scaleBand(expectedCostUSD, fx),
    };
  });
}

// ─── Complexity score ──────────────────────────────────────────────────────

function calcComplexityScore(inputs: CalculatorInputs): number {
  const w = COMPLEXITY_SCORE_WEIGHTS;

  const modScore   = Math.min(100, (inputs.modules.length / 8) * 100);
  const custScore  = COMPLEXITY_LEVEL_SCORE[inputs.customizationLevel] ?? 50;
  const intgScore  = COMPLEXITY_LEVEL_SCORE[inputs.integrationComplexity] ?? 50;
  const dataScore  = COMPLEXITY_LEVEL_SCORE[inputs.dataMigrationComplexity] ?? 50;
  const ctryScore  = Math.min(100, inputs.countries.length * 15 + 20);
  const implScore  = IMPL_TYPE_SCORE[inputs.implementationType] ?? 50;
  const maturScore = ERP_MATURITY_SCORE[inputs.erpMaturity] ?? 50;

  const raw =
    modScore   * w.modules +
    custScore  * w.customization +
    intgScore  * w.integration +
    dataScore  * w.dataMigration +
    ctryScore  * w.countries +
    implScore  * w.implementationType +
    maturScore * w.erpMaturity;

  return Math.round(clamp(raw, 0, 100));
}

// ─── Multi-country rating ──────────────────────────────────────────────────

function multiCountryRating(
  inputs: CalculatorInputs
): CalculationResult["multiCountryRating"] {
  const count = inputs.countries.length + 1; // +1 for HQ
  if (count <= 1) return "low";
  if (count <= 3) return "moderate";
  if (count <= 7) return "high";
  return "very-high";
}

// ─── TCO calculation ───────────────────────────────────────────────────────

function calcTCO(
  inputs: CalculatorInputs,
  y1Total: CostBand,
  softwareCost: CostBand
): { tco3yr: CostBand; tco5yr: CostBand; yearlySpend: number[] } {
  const implCost = {
    low:      y1Total.low      - softwareCost.low,
    expected: y1Total.expected - softwareCost.expected,
    high:     y1Total.high     - softwareCost.high,
  };

  // Year 1: full implementation + Y1 software
  const yearly: number[] = [y1Total.expected];

  const inflation = inputs.inflationPct / 100;

  for (let yr = 2; yr <= 5; yr++) {
    const softwareEsc = softwareCost.expected * Math.pow(SOFTWARE_ANNUAL_ESCALATION, yr - 1);
    const amsSupport  = implCost.expected * (yr === 2 ? ONGOING_SUPPORT_Y2_PCT : ONGOING_SUPPORT_Y3_PCT);
    const inflFactor  = Math.pow(1 + inflation, yr - 1);
    yearly.push(Math.round((softwareEsc + amsSupport) * inflFactor));
  }

  const y3Cumulative = yearly.slice(0, 3).reduce((a, b) => a + b, 0);
  const y5Cumulative = yearly.reduce((a, b) => a + b, 0);

  return {
    tco3yr:     band(y3Cumulative),
    tco5yr:     band(y5Cumulative),
    yearlySpend: yearly,
  };
}

// ─── Warning flags ─────────────────────────────────────────────────────────

function buildWarnings(inputs: CalculatorInputs, locale: Locale): WarningFlag[] {
  const warnings: WarningFlag[] = [];
  const countries = inputs.countries.length + 1;
  const w = getMessages(locale).calculator.warnings;

  // Too many countries for tight timeline. Message is interpolated with
  // the live counts via the shared interpolate() helper.
  if (countries > 3 && inputs.targetTimelineMonths < 18) {
    const k = w.tooManyCountriesShortTimeline;
    warnings.push({
      severity:   "critical",
      workstream: s(k.workstream),
      message:    interpolate(s(k.message), { countries, months: inputs.targetTimelineMonths }),
      detail:     s(k.detail),
    });
  }

  // High customisation + aggressive deadline
  if (
    inputs.customizationLevel === "high" &&
    inputs.targetTimelineMonths < 15
  ) {
    const k = w.highCustomShortTimeline;
    warnings.push({
      severity:   "critical",
      workstream: s(k.workstream),
      message:    s(k.message),
      detail:     s(k.detail),
    });
  }

  // Too few change resources for user count
  if (
    inputs.changeMgmtIntensity === "light" &&
    inputs.userCount > 500
  ) {
    const k = w.lightChangeManyUsers;
    warnings.push({
      severity:   "warning",
      workstream: s(k.workstream),
      message:    s(k.message),
      detail:     s(k.detail),
    });
  }

  // Multi-country payroll in phase 1
  const hasPayroll = inputs.modules.includes("payroll");
  if (hasPayroll && countries > 2 && inputs.countries.some((c) => c.wave === 1)) {
    const k = w.multiCountryPayrollWave1;
    warnings.push({
      severity:   "warning",
      workstream: s(k.workstream),
      message:    s(k.message),
      detail:     s(k.detail),
    });
  }

  // Spreadsheets + high integration
  if (
    inputs.erpMaturity === "spreadsheets" &&
    inputs.integrationComplexity === "high"
  ) {
    const k = w.spreadsheetsHighIntegration;
    warnings.push({
      severity:   "warning",
      workstream: s(k.workstream),
      message:    s(k.message),
      detail:     s(k.detail),
    });
  }

  // Post-merger + short timeline
  if (
    inputs.implementationType === "post-merger" &&
    inputs.targetTimelineMonths < 24
  ) {
    const k = w.postMergerShortTimeline;
    warnings.push({
      severity:   "warning",
      workstream: s(k.workstream),
      message:    s(k.message),
      detail:     s(k.detail),
    });
  }

  // Offshore SI for high complexity
  if (
    inputs.deliveryModel === "offshore" &&
    (inputs.customizationLevel === "high" || inputs.integrationComplexity === "high")
  ) {
    const k = w.offshoreHighComplexity;
    warnings.push({
      severity:   "info",
      workstream: s(k.workstream),
      message:    s(k.message),
      detail:     s(k.detail),
    });
  }

  return warnings;
}

// ─── Main entry point ──────────────────────────────────────────────────────

// Locale-aware main entry. The default keeps the existing call sites
// (and the CR-3 smoke test) compiling without a locale argument; consumer
// components that thread the active locale (ErpCostClient.tsx) pass it
// explicitly so warnings + phase names render in the user's language.
export function calculate(
  inputs: CalculatorInputs,
  locale: Locale = "en",
): CalculationResult {
  // 1. Software
  const software = calcSoftwareCost(inputs);

  // 2. SI services (core)
  const siServices = calcSIServices(inputs);

  // 3. Sub-workstreams
  const dataMigration    = calcDataMigration(inputs, siServices);
  const integration      = calcIntegration(inputs, siServices);
  const reportingOH      = calcReportingOverhead(inputs, siServices);
  const changeAndTraining = calcChangeAndTraining(inputs, siServices);
  const testingAndCutover = calcTestingCutover(siServices);
  const localization     = calcLocalization(inputs);
  const internalTeam     = calcInternalTeam(inputs);

  // Merge reporting overhead into integration
  const integrationTotal: CostBand = {
    low:      integration.low      + reportingOH.low,
    expected: integration.expected + reportingOH.expected,
    high:     integration.high     + reportingOH.high,
  };

  // 4. Pre-infra, pre-PMO, pre-contingency subtotal
  const prePMOTotal =
    software.expected +
    siServices.expected +
    dataMigration.expected +
    integrationTotal.expected +
    changeAndTraining.expected +
    testingAndCutover.expected +
    localization.expected +
    internalTeam.expected;

  // 5. Infrastructure
  const infrastructure = calcInfrastructure(inputs, prePMOTotal);

  // 6. PMO
  const pmo = calcPMO(prePMOTotal + infrastructure.expected);

  // 7. Pre-contingency total
  const preContigTotal =
    prePMOTotal + infrastructure.expected + pmo.expected;

  // 8. Contingency
  const contingency = calcContingency(preContigTotal, inputs.contingencyPct);

  // 9. Year-1 total
  const totalY1Expected = preContigTotal + contingency.expected;
  const totalY1: CostBand = {
    low:      Math.round(totalY1Expected * (1 - LOW_SPREAD)),
    expected: Math.round(totalY1Expected),
    high:     Math.round(totalY1Expected * (1 + HIGH_SPREAD)),
  };

  // 10. Breakdown
  const breakdown: CostBreakdown = {
    software,
    siServices,
    internalTeam,
    dataMigration,
    integration: integrationTotal,
    changeAndTraining,
    testingAndCutover,
    infrastructure,
    localization,
    pmo,
    contingency,
  };

  // 11. TCO
  const { tco3yr, tco5yr, yearlySpend } = calcTCO(inputs, totalY1, software);

  // 12. Timeline
  const timeline = calcTimeline(inputs, locale);

  // 13. Country results
  const countryResults = calcCountryResults(inputs, totalY1);

  // 14. Complexity score
  const complexityScore = calcComplexityScore(inputs);

  // 15. Revenue percentage
  const revenueMidpoint = REVENUE_MIDPOINT[inputs.revenueRange] ?? 125_000_000;
  const costAsRevenuePct = parseFloat(
    ((totalY1.expected / revenueMidpoint) * 100).toFixed(1)
  );

  // 16. Cost per user
  const costPerUser: CostBand = {
    low:      Math.round(totalY1.low      / Math.max(1, inputs.userCount)),
    expected: Math.round(totalY1.expected / Math.max(1, inputs.userCount)),
    high:     Math.round(totalY1.high     / Math.max(1, inputs.userCount)),
  };

  // 17. Warnings
  const warnings = buildWarnings(inputs, locale);

  return {
    totalY1,
    tco3yr,
    tco5yr,
    costPerUser,
    costAsRevenuePct,
    complexityScore,
    multiCountryRating: multiCountryRating(inputs),
    breakdown,
    timeline,
    countryResults,
    yearlySpend,
    warnings,
    inputs,
    assumptionsSummary: {
      softwareCostPerUserPerYear:
        SOFTWARE_COST_PER_USER_PER_YEAR[inputs.erpApproach]?.[inputs.deploymentModel]?.[1] ?? 700,
      siBlendedDayRate:
        SI_BASE_RATE_PER_USER[inputs.siPartnerTier]?.[inputs.deliveryModel]?.[1] ?? 4000,
      contingencyPct: inputs.contingencyPct,
      totalCountries: inputs.countries.length + 1,
      totalModules:   inputs.modules.length,
    },
    generatedAt: new Date().toISOString(),
  };
}

// ─── Utility: format currency ──────────────────────────────────────────────

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  compact: boolean = false
): string {
  if (compact) {
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000)     return `${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000)         return `${(amount / 1_000).toFixed(0)}K`;
    return amount.toFixed(0);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatBand(band: CostBand, currency: string = "USD"): string {
  return `${formatCurrency(band.low, currency, true)} – ${formatCurrency(band.high, currency, true)}`;
}
