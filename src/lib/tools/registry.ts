import type { z } from "zod";
import {
  erpCostInputSchema,
  sapCostInputSchema,
  migrationInputSchema,
  jdInputSchema,
  solutionInputSchema,
  type ErpCostInput,
  type SapCostInput,
  type MigrationInput,
  type JdInput,
  type SolutionInput,
} from "./schema";
import {
  ERP_COST_SYSTEM,
  SAP_COST_SYSTEM,
  MIGRATION_SYSTEM,
  JD_SYSTEM,
  SOLUTION_SYSTEM,
} from "./prompts";

// Tool slug union — matches the URL paths preserved from WordPress.
export type ToolSlug =
  | "erp-implementation-cost-calculator"
  | "sap-implementation-cost-calculator"
  | "free-data-migration-estimator-sap-oracle-microsoft"
  | "sap-job-description-generator"
  | "sap-solution-builder";

export const TOOL_SLUGS: ToolSlug[] = [
  "erp-implementation-cost-calculator",
  "sap-implementation-cost-calculator",
  "free-data-migration-estimator-sap-oracle-microsoft",
  "sap-job-description-generator",
  "sap-solution-builder",
];

interface ToolDef<T> {
  slug: ToolSlug;
  label: string;
  description: string;
  schema: z.ZodType<T>;
  system: string;
  formatUser: (input: T) => string;
  maxTokens: number;
}

// User-message formatters — structured so the model gets cleanly labeled input.
function formatErpCost(i: ErpCostInput): string {
  return [
    "Estimate this ERP implementation:",
    "",
    `Sector: ${i.sector}`,
    `Company size: ${i.companySize}`,
    `Current system: ${i.currentSystem}`,
    `Target system: ${i.targetSystem}`,
    `Modules in scope: ${i.modules.join(", ")}`,
    `User count: ${i.userCount}`,
    `Regions: ${i.regions.join(", ")}`,
    `User-stated timeline: ${i.timelineMonths} months`,
    i.notes ? `Additional notes: ${i.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatSapCost(i: SapCostInput): string {
  return [
    "Estimate this SAP implementation:",
    "",
    `Sector: ${i.sector}`,
    `Company size: ${i.companySize}`,
    `SAP edition: ${i.edition}`,
    `Current system: ${i.currentSystem}`,
    `Modules in scope: ${i.modules.join(", ")}`,
    `Fiori scope: ${i.fioriScope}`,
    `Clean-core discipline: ${i.cleanCore ? "yes" : "no"}`,
    i.industrySolution ? `Industry solution: ${i.industrySolution}` : "",
    `User count: ${i.userCount}`,
    `Regions: ${i.regions.join(", ")}`,
    `User-stated timeline: ${i.timelineMonths} months`,
    i.notes ? `Additional notes: ${i.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatMigration(i: MigrationInput): string {
  return [
    "Estimate this data migration:",
    "",
    `Source system: ${i.source}${i.sourceVersion ? ` (${i.sourceVersion})` : ""}`,
    `Target system: ${i.target}`,
    `Approximate master data records: ${i.approximateMasterDataRecords.toLocaleString()}`,
    `Approximate transactional records: ${i.approximateTransactionalRecords.toLocaleString()}`,
    `Custom objects count: ${i.customObjectsCount}`,
    `Historical years to carry: ${i.historicalYears}`,
    `Self-assessed data quality: ${i.dataQuality}`,
    `Languages in scope: ${i.languagesInScope.join(", ")}`,
    i.notes ? `Additional notes: ${i.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatJd(i: JdInput): string {
  return [
    "Write a job description for this SAP role:",
    "",
    `Role title: ${i.roleTitle}`,
    `Role family: ${i.roleFamily}`,
    `Seniority: ${i.seniority}`,
    `Sector: ${i.sector}`,
    `Region: ${i.region}`,
    `Work arrangement: ${i.remote}`,
    `Security clearance required: ${i.clearanceRequired ? "yes" : "no"}`,
    i.certifications.length
      ? `Certifications expected: ${i.certifications.join(", ")}`
      : "",
    i.keyProjects ? `Key projects / context:\n${i.keyProjects}` : "",
    i.notes ? `Additional notes: ${i.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatSolution(i: SolutionInput): string {
  return [
    "Design an SAP solution for this business problem:",
    "",
    `Business problem:\n${i.businessProblem}`,
    "",
    i.currentLandscape ? `Current landscape:\n${i.currentLandscape}` : "",
    i.constraints ? `Constraints:\n${i.constraints}` : "",
    i.regulatoryContext ? `Regulatory context:\n${i.regulatoryContext}` : "",
    `Timeline preference: ${i.timelinePreference}`,
    `Budget band: ${i.budgetBand}`,
    i.notes ? `Additional notes: ${i.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

// Registry — single source of truth for the dynamic API route.
// Type-erased to ToolDef<unknown> so the registry is indexable by slug;
// the handler re-validates with the correct schema before use.
export const TOOLS: Record<ToolSlug, ToolDef<unknown>> = {
  "erp-implementation-cost-calculator": {
    slug: "erp-implementation-cost-calculator",
    label: "ERP Implementation Cost Calculator",
    description:
      "Vendor-agnostic cost and timeline estimate for an ERP implementation.",
    schema: erpCostInputSchema as unknown as z.ZodType<unknown>,
    system: ERP_COST_SYSTEM,
    formatUser: (i) => formatErpCost(i as ErpCostInput),
    maxTokens: 2048,
  },
  "sap-implementation-cost-calculator": {
    slug: "sap-implementation-cost-calculator",
    label: "SAP Implementation Cost Calculator",
    description:
      "SAP-specific cost, licence model, and timeline estimate.",
    schema: sapCostInputSchema as unknown as z.ZodType<unknown>,
    system: SAP_COST_SYSTEM,
    formatUser: (i) => formatSapCost(i as SapCostInput),
    maxTokens: 2048,
  },
  "free-data-migration-estimator-sap-oracle-microsoft": {
    slug: "free-data-migration-estimator-sap-oracle-microsoft",
    label: "Data Migration Estimator",
    description:
      "Effort, tooling, and risk estimate for ERP data migration programmes.",
    schema: migrationInputSchema as unknown as z.ZodType<unknown>,
    system: MIGRATION_SYSTEM,
    formatUser: (i) => formatMigration(i as MigrationInput),
    maxTokens: 2048,
  },
  "sap-job-description-generator": {
    slug: "sap-job-description-generator",
    label: "SAP Job Description Generator",
    description:
      "Role-accurate SAP job descriptions with comp bands and interview focus.",
    schema: jdInputSchema as unknown as z.ZodType<unknown>,
    system: JD_SYSTEM,
    formatUser: (i) => formatJd(i as JdInput),
    maxTokens: 2048,
  },
  "sap-solution-builder": {
    slug: "sap-solution-builder",
    label: "SAP Solution Builder",
    description:
      "Translate a business problem into a phased SAP solution outline.",
    schema: solutionInputSchema as unknown as z.ZodType<unknown>,
    system: SOLUTION_SYSTEM,
    formatUser: (i) => formatSolution(i as SolutionInput),
    maxTokens: 2048,
  },
};

export function getTool(slug: string): ToolDef<unknown> | undefined {
  return TOOLS[slug as ToolSlug];
}
