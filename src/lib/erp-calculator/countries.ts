// ─── ERP Calculator — Country Data ───────────────────────────────────────────
//
// Country reference data for the calculator.
//
// costIndex: relative implementation cost vs. USA (1.0 baseline).
//   Reflects consulting day-rate levels and general market pricing.
//   Source: practitioner benchmarks, not official statistics.
//
// localizationBase: base cost in USD for statutory/tax localization
//   of an ERP system in this country. Scales with localization complexity.
//
// currency: ISO-4217 currency code.
//
// exchangeRateToUSD: approximate fixed rate. Updated periodically.
//   These are mock rates for directional planning — not live FX.
//
// To add a new country: add an entry following the same shape.

export interface CountryData {
  code: string;        // ISO-3166-1 alpha-2
  name: string;
  region: string;
  currency: string;    // ISO-4217
  exchangeRateToUSD: number; // 1 USD = X local currency
  costIndex: number;   // 1.0 = USA baseline
  localizationBase: number; // USD, per-country statutory setup cost
  taxComplexity: "low" | "medium" | "high";
  notes?: string;
}

export const COUNTRIES: CountryData[] = [
  // ─── North America ────────────────────────────────────────────────────────
  {
    code: "US",
    name: "United States",
    region: "North America",
    currency: "USD",
    exchangeRateToUSD: 1.00,
    costIndex: 1.00,
    localizationBase: 35_000,
    taxComplexity: "medium",
  },
  {
    code: "CA",
    name: "Canada",
    region: "North America",
    currency: "CAD",
    exchangeRateToUSD: 1.36,
    costIndex: 0.88,
    localizationBase: 30_000,
    taxComplexity: "medium",
    notes: "GST/HST/PST split adds complexity; Quebec French requirements",
  },
  {
    code: "MX",
    name: "Mexico",
    region: "North America",
    currency: "MXN",
    exchangeRateToUSD: 17.20,
    costIndex: 0.45,
    localizationBase: 40_000,
    taxComplexity: "high",
    notes: "CFDI e-invoicing is mandatory and complex; SAT compliance",
  },

  // ─── Europe ───────────────────────────────────────────────────────────────
  {
    code: "GB",
    name: "United Kingdom",
    region: "Europe",
    currency: "GBP",
    exchangeRateToUSD: 0.79,
    costIndex: 0.95,
    localizationBase: 32_000,
    taxComplexity: "medium",
    notes: "Making Tax Digital (MTD) compliance required",
  },
  {
    code: "DE",
    name: "Germany",
    region: "Europe",
    currency: "EUR",
    exchangeRateToUSD: 0.92,
    costIndex: 1.05,
    localizationBase: 40_000,
    taxComplexity: "high",
    notes: "Steuerrecht complexity; co-determination (Mitbestimmung) for HR; DATEV integration common",
  },
  {
    code: "FR",
    name: "France",
    region: "Europe",
    currency: "EUR",
    exchangeRateToUSD: 0.92,
    costIndex: 1.00,
    localizationBase: 38_000,
    taxComplexity: "high",
    notes: "FEC audit file mandatory; strong labour law affecting HR scope",
  },
  {
    code: "NL",
    name: "Netherlands",
    region: "Europe",
    currency: "EUR",
    exchangeRateToUSD: 0.92,
    costIndex: 0.97,
    localizationBase: 28_000,
    taxComplexity: "medium",
  },
  {
    code: "BE",
    name: "Belgium",
    region: "Europe",
    currency: "EUR",
    exchangeRateToUSD: 0.92,
    costIndex: 0.98,
    localizationBase: 32_000,
    taxComplexity: "medium",
  },
  {
    code: "CH",
    name: "Switzerland",
    region: "Europe",
    currency: "CHF",
    exchangeRateToUSD: 0.90,
    costIndex: 1.25,
    localizationBase: 42_000,
    taxComplexity: "medium",
    notes: "High consultant day rates; multi-lingual requirements",
  },
  {
    code: "ES",
    name: "Spain",
    region: "Europe",
    currency: "EUR",
    exchangeRateToUSD: 0.92,
    costIndex: 0.80,
    localizationBase: 35_000,
    taxComplexity: "medium",
  },
  {
    code: "IT",
    name: "Italy",
    region: "Europe",
    currency: "EUR",
    exchangeRateToUSD: 0.92,
    costIndex: 0.82,
    localizationBase: 38_000,
    taxComplexity: "high",
    notes: "SDI e-invoicing mandatory; complex payroll/labour law",
  },
  {
    code: "PL",
    name: "Poland",
    region: "Europe",
    currency: "PLN",
    exchangeRateToUSD: 4.02,
    costIndex: 0.50,
    localizationBase: 28_000,
    taxComplexity: "high",
    notes: "KSeF e-invoicing in rollout; frequent tax law changes",
  },

  // ─── Middle East ──────────────────────────────────────────────────────────
  {
    code: "AE",
    name: "United Arab Emirates",
    region: "Middle East",
    currency: "AED",
    exchangeRateToUSD: 3.67,
    costIndex: 0.80,
    localizationBase: 35_000,
    taxComplexity: "medium",
    notes: "VAT since 2018; CT from 2023; Arabic language often required",
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    region: "Middle East",
    currency: "SAR",
    exchangeRateToUSD: 3.75,
    costIndex: 0.75,
    localizationBase: 45_000,
    taxComplexity: "high",
    notes: "ZATCA Phase 2 e-invoicing complex; Saudisation reporting; Arabic mandatory",
  },
  {
    code: "QA",
    name: "Qatar",
    region: "Middle East",
    currency: "QAR",
    exchangeRateToUSD: 3.64,
    costIndex: 0.78,
    localizationBase: 28_000,
    taxComplexity: "low",
  },
  {
    code: "KW",
    name: "Kuwait",
    region: "Middle East",
    currency: "KWD",
    exchangeRateToUSD: 0.31,
    costIndex: 0.72,
    localizationBase: 25_000,
    taxComplexity: "low",
  },
  {
    code: "BH",
    name: "Bahrain",
    region: "Middle East",
    currency: "BHD",
    exchangeRateToUSD: 0.38,
    costIndex: 0.68,
    localizationBase: 22_000,
    taxComplexity: "low",
  },
  {
    code: "OM",
    name: "Oman",
    region: "Middle East",
    currency: "OMR",
    exchangeRateToUSD: 0.39,
    costIndex: 0.65,
    localizationBase: 25_000,
    taxComplexity: "medium",
  },
  {
    code: "EG",
    name: "Egypt",
    region: "Middle East & Africa",
    currency: "EGP",
    exchangeRateToUSD: 47.50,
    costIndex: 0.30,
    localizationBase: 35_000,
    taxComplexity: "high",
    notes: "e-Tax and e-invoice mandatory; frequent regulatory changes",
  },

  // ─── Asia-Pacific ─────────────────────────────────────────────────────────
  {
    code: "IN",
    name: "India",
    region: "Asia-Pacific",
    currency: "INR",
    exchangeRateToUSD: 83.50,
    costIndex: 0.28,
    localizationBase: 55_000,
    taxComplexity: "high",
    notes: "GST India complexity; TDS/TCS; e-invoicing IRP mandatory; multiple state requirements",
  },
  {
    code: "SG",
    name: "Singapore",
    region: "Asia-Pacific",
    currency: "SGD",
    exchangeRateToUSD: 1.35,
    costIndex: 0.90,
    localizationBase: 25_000,
    taxComplexity: "low",
    notes: "Business-friendly; GST straightforward; strong SAP talent pool",
  },
  {
    code: "AU",
    name: "Australia",
    region: "Asia-Pacific",
    currency: "AUD",
    exchangeRateToUSD: 1.55,
    costIndex: 0.88,
    localizationBase: 28_000,
    taxComplexity: "medium",
    notes: "GST/BAS reporting; Single Touch Payroll (STP) for HR",
  },
  {
    code: "NZ",
    name: "New Zealand",
    region: "Asia-Pacific",
    currency: "NZD",
    exchangeRateToUSD: 1.65,
    costIndex: 0.82,
    localizationBase: 22_000,
    taxComplexity: "low",
  },
  {
    code: "JP",
    name: "Japan",
    region: "Asia-Pacific",
    currency: "JPY",
    exchangeRateToUSD: 150.00,
    costIndex: 1.10,
    localizationBase: 60_000,
    taxComplexity: "high",
    notes: "Consumption tax (JCT); Japan-specific payroll complexity; Japanese language required",
  },
  {
    code: "CN",
    name: "China",
    region: "Asia-Pacific",
    currency: "CNY",
    exchangeRateToUSD: 7.25,
    costIndex: 0.55,
    localizationBase: 65_000,
    taxComplexity: "high",
    notes: "Golden Tax System; e-Fapiao; significant data localisation requirements",
  },
  {
    code: "MY",
    name: "Malaysia",
    region: "Asia-Pacific",
    currency: "MYR",
    exchangeRateToUSD: 4.72,
    costIndex: 0.38,
    localizationBase: 32_000,
    taxComplexity: "medium",
  },
  {
    code: "TH",
    name: "Thailand",
    region: "Asia-Pacific",
    currency: "THB",
    exchangeRateToUSD: 35.50,
    costIndex: 0.35,
    localizationBase: 30_000,
    taxComplexity: "medium",
  },
  {
    code: "ID",
    name: "Indonesia",
    region: "Asia-Pacific",
    currency: "IDR",
    exchangeRateToUSD: 15_800,
    costIndex: 0.32,
    localizationBase: 40_000,
    taxComplexity: "high",
    notes: "eFaktur VAT mandatory; complex payroll regulations",
  },
  {
    code: "PH",
    name: "Philippines",
    region: "Asia-Pacific",
    currency: "PHP",
    exchangeRateToUSD: 56.50,
    costIndex: 0.30,
    localizationBase: 28_000,
    taxComplexity: "medium",
  },
  {
    code: "VN",
    name: "Vietnam",
    region: "Asia-Pacific",
    currency: "VND",
    exchangeRateToUSD: 24_500,
    costIndex: 0.28,
    localizationBase: 32_000,
    taxComplexity: "high",
  },
  {
    code: "PK",
    name: "Pakistan",
    region: "Asia-Pacific",
    currency: "PKR",
    exchangeRateToUSD: 278.00,
    costIndex: 0.20,
    localizationBase: 25_000,
    taxComplexity: "high",
  },

  // ─── Africa ───────────────────────────────────────────────────────────────
  {
    code: "ZA",
    name: "South Africa",
    region: "Africa",
    currency: "ZAR",
    exchangeRateToUSD: 18.80,
    costIndex: 0.38,
    localizationBase: 30_000,
    taxComplexity: "medium",
    notes: "B-BBEE reporting; SARS e-filing; local talent pool available",
  },
  {
    code: "NG",
    name: "Nigeria",
    region: "Africa",
    currency: "NGN",
    exchangeRateToUSD: 1550,
    costIndex: 0.25,
    localizationBase: 35_000,
    taxComplexity: "high",
  },
  {
    code: "KE",
    name: "Kenya",
    region: "Africa",
    currency: "KES",
    exchangeRateToUSD: 130.00,
    costIndex: 0.25,
    localizationBase: 28_000,
    taxComplexity: "medium",
  },

  // ─── Latin America ────────────────────────────────────────────────────────
  {
    code: "BR",
    name: "Brazil",
    region: "Latin America",
    currency: "BRL",
    exchangeRateToUSD: 5.05,
    costIndex: 0.48,
    localizationBase: 70_000,
    taxComplexity: "high",
    notes: "One of the most complex tax environments globally; NF-e, SPED, eSocial all mandatory",
  },
  {
    code: "AR",
    name: "Argentina",
    region: "Latin America",
    currency: "ARS",
    exchangeRateToUSD: 870,
    costIndex: 0.30,
    localizationBase: 45_000,
    taxComplexity: "high",
    notes: "AFIP compliance; currency controls add complexity",
  },
  {
    code: "CL",
    name: "Chile",
    region: "Latin America",
    currency: "CLP",
    exchangeRateToUSD: 940,
    costIndex: 0.42,
    localizationBase: 32_000,
    taxComplexity: "medium",
  },
  {
    code: "CO",
    name: "Colombia",
    region: "Latin America",
    currency: "COP",
    exchangeRateToUSD: 3_900,
    costIndex: 0.38,
    localizationBase: 35_000,
    taxComplexity: "high",
  },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export const COUNTRY_MAP: Record<string, CountryData> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c])
);

export function getCountry(code: string): CountryData | undefined {
  return COUNTRY_MAP[code];
}

export function getCountryName(code: string): string {
  return COUNTRY_MAP[code]?.name ?? code;
}

export function getCountryCurrency(code: string): string {
  return COUNTRY_MAP[code]?.currency ?? "USD";
}

export function getExchangeRate(code: string): number {
  return COUNTRY_MAP[code]?.exchangeRateToUSD ?? 1;
}

// Regions for grouping in UI
export const REGIONS = [
  "North America",
  "Europe",
  "Middle East",
  "Middle East & Africa",
  "Asia-Pacific",
  "Africa",
  "Latin America",
] as const;

export type Region = typeof REGIONS[number];

export function getCountriesByRegion(region: string): CountryData[] {
  return COUNTRIES.filter((c) => c.region === region);
}

// Localization complexity → cost multiplier (on top of localizationBase)
export const LOCALIZATION_COMPLEXITY_MULTIPLIER: Record<
  "low" | "medium" | "high",
  number
> = {
  low:    0.70,
  medium: 1.00,
  high:   1.65,
};
