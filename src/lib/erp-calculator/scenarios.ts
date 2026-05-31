// ─── ERP Calculator — Preset Scenarios ───────────────────────────────────────
//
// Three seed scenarios for the "load preset" feature.
// Each is a complete CalculatorInputs object.
//
// Purpose: help users get started quickly and understand what a typical
// programme looks like at different scales.

import type { CalculatorInputs, PresetScenario } from "./types";
import { type Locale } from "@/lib/locales";
import { getMessages, stripMarkers } from "@/lib/i18n/useTranslation";

// ─── Scenario 1: Mid-market, single country ───────────────────────────────────
// A 400-person manufacturing company moving from legacy ERP to the cloud.
// Single-country, moderate complexity, sensible scope.

const SCENARIO_MID_MARKET: CalculatorInputs = {
  companyName: "Orion Manufacturing",
  revenueRange: "50m-250m",
  employeeCount: 400,
  userCount: 150,
  namedVsConcurrentSplit: 75,
  legalEntities: 2,
  businessUnits: 3,
  industry: "manufacturing",
  erpMaturity: "legacy-erp",
  implementationType: "reimplementation",

  erpApproach: "sap",
  deploymentModel: "cloud-saas",
  modules: ["finance", "procurement", "manufacturing", "supply-chain"],
  customizationLevel: "medium",
  integrationComplexity: "medium",
  dataMigrationComplexity: "medium",
  reportingComplexity: "medium",
  targetTimelineMonths: 14,

  countries: [],
  hqCountryCode: "GB",

  siPartnerTier: "mid-tier",
  deliveryModel: "hybrid",
  internalTeamSize: 8,
  changeMgmtIntensity: "standard",
  trainingModel: "role-based",

  planningHorizon: 3,
  contingencyPct: 15,
  inflationPct: 3,
  discountRate: 8,
  reportingCurrency: "GBP",
};

// ─── Scenario 2: Regional 3-country rollout ───────────────────────────────────
// A mid-sized financial services firm rolling out across GCC.
// UAE as HQ, Saudi Arabia and Qatar in a single wave.

const SCENARIO_REGIONAL: CalculatorInputs = {
  companyName: "Meridian Capital Group",
  revenueRange: "250m-1b",
  employeeCount: 1200,
  userCount: 450,
  namedVsConcurrentSplit: 80,
  legalEntities: 6,
  businessUnits: 4,
  industry: "financial-services",
  erpMaturity: "legacy-erp",
  implementationType: "consolidation",

  erpApproach: "oracle",
  deploymentModel: "private-cloud",
  modules: ["finance", "procurement", "hr", "analytics", "epm"],
  customizationLevel: "medium",
  integrationComplexity: "high",
  dataMigrationComplexity: "medium",
  reportingComplexity: "high",
  targetTimelineMonths: 18,

  countries: [
    {
      id: "sa",
      countryCode: "SA",
      users: 150,
      legalEntities: 2,
      localizationComplexity: "high",
      languageCount: 2,
      wave: 2,
    },
    {
      id: "qa",
      countryCode: "QA",
      users: 60,
      legalEntities: 1,
      localizationComplexity: "low",
      languageCount: 1,
      wave: 2,
    },
  ],
  hqCountryCode: "AE",

  siPartnerTier: "mid-tier",
  deliveryModel: "hybrid",
  internalTeamSize: 14,
  changeMgmtIntensity: "standard",
  trainingModel: "role-based",

  planningHorizon: 5,
  contingencyPct: 18,
  inflationPct: 3,
  discountRate: 8,
  reportingCurrency: "USD",
};

// ─── Scenario 3: Global 8-country phased rollout ──────────────────────────────
// A large enterprise with operations across North America, Europe,
// Middle East, and APAC. SAP S/4HANA Private Cloud. Phased over 3 waves.

const SCENARIO_GLOBAL: CalculatorInputs = {
  companyName: "Stratton Global Industries",
  revenueRange: "1b-5b",
  employeeCount: 8500,
  userCount: 2200,
  namedVsConcurrentSplit: 70,
  legalEntities: 18,
  businessUnits: 9,
  industry: "manufacturing",
  erpMaturity: "mixed-landscape",
  implementationType: "consolidation",

  erpApproach: "sap",
  deploymentModel: "private-cloud",
  modules: [
    "finance",
    "procurement",
    "sales",
    "manufacturing",
    "supply-chain",
    "warehouse",
    "hr",
    "analytics",
    "epm",
  ],
  customizationLevel: "medium",
  integrationComplexity: "high",
  dataMigrationComplexity: "high",
  reportingComplexity: "high",
  targetTimelineMonths: 36,

  countries: [
    {
      id: "de",
      countryCode: "DE",
      users: 400,
      legalEntities: 3,
      localizationComplexity: "high",
      languageCount: 2,
      wave: 1,
    },
    {
      id: "gb",
      countryCode: "GB",
      users: 280,
      legalEntities: 2,
      localizationComplexity: "medium",
      languageCount: 1,
      wave: 1,
    },
    {
      id: "ae",
      countryCode: "AE",
      users: 190,
      legalEntities: 2,
      localizationComplexity: "medium",
      languageCount: 2,
      wave: 2,
    },
    {
      id: "sa",
      countryCode: "SA",
      users: 120,
      legalEntities: 1,
      localizationComplexity: "high",
      languageCount: 2,
      wave: 2,
    },
    {
      id: "in",
      countryCode: "IN",
      users: 220,
      legalEntities: 3,
      localizationComplexity: "high",
      languageCount: 3,
      wave: 3,
    },
    {
      id: "sg",
      countryCode: "SG",
      users: 90,
      legalEntities: 1,
      localizationComplexity: "low",
      languageCount: 1,
      wave: 3,
    },
    {
      id: "au",
      countryCode: "AU",
      users: 100,
      legalEntities: 1,
      localizationComplexity: "medium",
      languageCount: 1,
      wave: 3,
    },
  ],
  hqCountryCode: "US",

  siPartnerTier: "global-si",
  deliveryModel: "hybrid",
  internalTeamSize: 30,
  changeMgmtIntensity: "heavy",
  trainingModel: "role-based",

  planningHorizon: 5,
  contingencyPct: 20,
  inflationPct: 3,
  discountRate: 8,
  reportingCurrency: "USD",
};

// ─── Export ───────────────────────────────────────────────────────────────────
//
// The three scenario *inputs* objects above are static numerical data —
// no translation needed. The display labels (name, description, badge)
// come from MESSAGES.calculator.presets.* and are returned by the
// locale-aware getter below. Consumers (ErpCostClient.tsx) call
// getPresetScenarios(locale) instead of importing the array.

export function getPresetScenarios(locale: Locale): PresetScenario[] {
  const p = getMessages(locale).calculator.presets;
  // Strip <noTranslate> markers at the boundary — the wrapper tags
  // survive the translation pipeline but must not reach the DOM.
  return [
    {
      id:          "mid-market",
      name:        stripMarkers(p.midMarketName),
      description: stripMarkers(p.midMarketDescription),
      badge:       stripMarkers(p.midMarketBadge),
      inputs:      SCENARIO_MID_MARKET,
    },
    {
      id:          "regional",
      name:        stripMarkers(p.regionalName),
      description: stripMarkers(p.regionalDescription),
      badge:       stripMarkers(p.regionalBadge),
      inputs:      SCENARIO_REGIONAL,
    },
    {
      id:          "global",
      name:        stripMarkers(p.globalName),
      description: stripMarkers(p.globalDescription),
      badge:       stripMarkers(p.globalBadge),
      inputs:      SCENARIO_GLOBAL,
    },
  ];
}
