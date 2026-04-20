import { z } from "zod";

// Shared enums used by multiple tools.
export const sectorEnum = z.enum([
  "manufacturing",
  "retail",
  "finance-banking",
  "aviation-transport",
  "government-public",
  "utilities-energy",
  "telecom",
  "healthcare",
  "oil-gas",
  "construction-real-estate",
  "professional-services",
  "other",
]);

export const companySizeEnum = z.enum([
  "small-50-250",
  "mid-250-1000",
  "large-1000-5000",
  "enterprise-5000-plus",
]);

export const regionEnum = z.enum([
  "uae",
  "saudi-arabia",
  "gcc-other",
  "united-kingdom",
  "europe-other",
  "north-america",
  "apac",
  "africa",
  "latam",
]);

// ───────────────────────── Tool 1: ERP Cost Calculator ─────────────────────────
export const erpCostInputSchema = z.object({
  sector: sectorEnum,
  companySize: companySizeEnum,
  currentSystem: z.string().min(2).max(120),
  targetSystem: z.string().min(2).max(120),
  modules: z.array(z.string().min(1).max(80)).min(1).max(20),
  userCount: z.coerce.number().int().min(1).max(500_000),
  regions: z.array(regionEnum).min(1).max(9),
  timelineMonths: z.coerce.number().int().min(3).max(120),
  notes: z.string().max(2000).optional().default(""),
});
export type ErpCostInput = z.infer<typeof erpCostInputSchema>;

// ───────────────────────── Tool 2: SAP Cost Calculator ─────────────────────────
export const sapEditionEnum = z.enum([
  "s4hana-cloud-public-grow",
  "s4hana-cloud-private-rise",
  "s4hana-on-premise",
  "ecc-brownfield-to-s4hana",
  "unsure",
]);

export const sapCostInputSchema = z.object({
  sector: sectorEnum,
  companySize: companySizeEnum,
  edition: sapEditionEnum,
  currentSystem: z.string().min(2).max(120),
  modules: z.array(z.string().min(1).max(80)).min(1).max(20),
  fioriScope: z.enum(["minimal", "selected-personas", "full-coverage"]),
  cleanCore: z.boolean().default(false),
  industrySolution: z.string().max(120).optional().default(""),
  userCount: z.coerce.number().int().min(1).max(500_000),
  regions: z.array(regionEnum).min(1).max(9),
  timelineMonths: z.coerce.number().int().min(3).max(120),
  notes: z.string().max(2000).optional().default(""),
});
export type SapCostInput = z.infer<typeof sapCostInputSchema>;

// ───────────────────── Tool 3: Data Migration Estimator ────────────────────────
export const migrationSourceEnum = z.enum([
  "sap-ecc",
  "sap-s4hana",
  "oracle-ebs",
  "oracle-fusion",
  "microsoft-dynamics-ax",
  "microsoft-dynamics-365",
  "jd-edwards",
  "peoplesoft",
  "ifs",
  "infor",
  "custom-legacy",
  "other",
]);

export const migrationTargetEnum = z.enum([
  "sap-s4hana-cloud",
  "sap-s4hana-on-prem",
  "oracle-fusion-cloud",
  "microsoft-dynamics-365",
  "other",
]);

export const dataQualityEnum = z.enum([
  "excellent-clean-documented",
  "good-minor-issues",
  "fair-known-gaps",
  "poor-major-cleanup-needed",
  "unknown",
]);

export const migrationInputSchema = z.object({
  source: migrationSourceEnum,
  sourceVersion: z.string().max(60).optional().default(""),
  target: migrationTargetEnum,
  approximateMasterDataRecords: z.coerce.number().int().min(0).max(1_000_000_000),
  approximateTransactionalRecords: z.coerce.number().int().min(0).max(1_000_000_000_000),
  customObjectsCount: z.coerce.number().int().min(0).max(100_000),
  historicalYears: z.coerce.number().int().min(0).max(50),
  dataQuality: dataQualityEnum,
  languagesInScope: z.array(z.string().min(2).max(6)).min(1).max(20),
  notes: z.string().max(2000).optional().default(""),
});
export type MigrationInput = z.infer<typeof migrationInputSchema>;

// ─────────────────────── Tool 4: SAP JD Generator ──────────────────────────────
export const sapRoleFamilyEnum = z.enum([
  "functional-fi-co",
  "functional-mm-sd",
  "functional-pp-qm",
  "functional-hcm-successfactors",
  "functional-ewm-tm",
  "technical-abap",
  "technical-basis",
  "technical-fiori-ui5",
  "technical-integration-cpi",
  "technical-btp-developer",
  "architect-solution",
  "architect-enterprise",
  "programme-manager",
  "data-migration-lead",
  "security-grc",
  "other",
]);

export const seniorityEnum = z.enum([
  "junior",
  "mid",
  "senior",
  "principal-architect",
  "manager",
  "director",
]);

export const jdInputSchema = z.object({
  roleFamily: sapRoleFamilyEnum,
  roleTitle: z.string().min(3).max(160),
  seniority: seniorityEnum,
  sector: sectorEnum,
  region: regionEnum,
  keyProjects: z.string().max(1500).optional().default(""),
  certifications: z.array(z.string().min(1).max(80)).max(10).default([]),
  clearanceRequired: z.boolean().default(false),
  remote: z.enum(["onsite", "hybrid", "remote"]),
  notes: z.string().max(2000).optional().default(""),
});
export type JdInput = z.infer<typeof jdInputSchema>;

// ─────────────────────── Tool 5: SAP Solution Builder ──────────────────────────
export const solutionInputSchema = z.object({
  businessProblem: z.string().min(30).max(4000),
  currentLandscape: z.string().max(2000).optional().default(""),
  constraints: z.string().max(1500).optional().default(""),
  regulatoryContext: z.string().max(1000).optional().default(""),
  timelinePreference: z.enum(["fast-6m", "standard-12-18m", "strategic-24m-plus"]),
  budgetBand: z.enum(["under-500k", "500k-2m", "2m-10m", "10m-plus", "unspecified"]),
  notes: z.string().max(2000).optional().default(""),
});
export type SolutionInput = z.infer<typeof solutionInputSchema>;
