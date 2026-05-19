/**
 * SAP Solution Builder data layer.
 *
 * Industry presets, company size bands, phase templates, and team
 * templates that the deterministic roadmap engine consumes.
 *
 * Module IDs reference the catalogue in `src/lib/sap-modules.ts` so
 * the picker, cost calculator, and solution builder all share one
 * source of truth for module names, codes, and effort weights.
 */

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

export const INDUSTRIES: IndustryPreset[] = [
  {
    id: "manufacturing",
    label: "Manufacturing",
    bestPractices:
      "Focus on integrating production planning with materials management. Quality management and manufacturing execution are non-negotiable. Plant maintenance and EHS protect uptime.",
    phasingNarrative:
      "Start with core ERP and manufacturing modules in Phase 1. Add quality management and execution systems in Phase 2. Deploy IoT, predictive maintenance, and analytics in Phase 3.",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt"],
    industryModuleIds: ["pp", "qm", "pm-eam", "ehs", "ewm"],
    recommendedModuleIds: ["ppds", "me", "apm", "dmc", "ibp", "sac"],
    complexityMultiplier: 1.15,
  },
  {
    id: "retail",
    label: "Retail",
    bestPractices:
      "Article master and assortment depth determine the size of the build. Omnichannel commerce, customer data, and store operations require tight integration. Inventory accuracy across stores and DCs is the value driver.",
    phasingNarrative:
      "Phase 1 covers core ERP, finance, and merchandise management. Phase 2 layers in commerce, marketing cloud, and store operations. Phase 3 brings analytics, customer data, and personalisation.",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt", "ewm"],
    industryModuleIds: ["is-retail", "commerce-cloud", "marketing-cloud", "cdc"],
    recommendedModuleIds: ["sales-cloud", "service-cloud", "ibp", "sac", "datasphere"],
    complexityMultiplier: 1.1,
  },
  {
    id: "healthcare",
    label: "Healthcare",
    bestPractices:
      "Patient data privacy and audit trails dominate the design. Procurement and inventory of medical supplies need strict batch and expiry control. Workforce planning is mission-critical for clinical staffing.",
    phasingNarrative:
      "Phase 1 covers finance, procurement, and core HR with full audit trail. Phase 2 adds workforce planning, learning, and analytics. Phase 3 layers AI for forecasting and patient operations.",
    mandatoryModuleIds: [...CORE_MANDATORY, "tax-mgmt", "ilm", "ias"],
    industryModuleIds: ["qm", "sf-time", "sf-recruiting", "sf-lms"],
    recommendedModuleIds: ["sac", "datasphere", "sf-analytics", "service-cloud"],
    complexityMultiplier: 1.1,
  },
  {
    id: "financial-services",
    label: "Financial Services",
    bestPractices:
      "Regulatory reporting, Group consolidation, and FSCM (credit, dispute, collections) are the spine. Treasury, in-house cash, and risk management carry the heaviest configuration burden.",
    phasingNarrative:
      "Phase 1: core finance, controlling, Group Reporting, and statutory compliance. Phase 2: treasury, FSCM, and regulatory reporting (DRC). Phase 3: analytics, planning, and risk dashboards.",
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
    label: "Public Sector",
    bestPractices:
      "Funds management, grants, and budget control are the heart of the system. Procurement transparency and audit are non-negotiable. Citizen-facing services need a separate engagement layer.",
    phasingNarrative:
      "Phase 1: core finance with Funds Management and grants. Phase 2: procurement transparency, HR/payroll, and audit reporting. Phase 3: citizen engagement, analytics, and DRC reporting.",
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
    label: "Utilities",
    bestPractices:
      "Device management, metering, and customer billing dominate. Plant maintenance and asset performance management protect grid reliability. Regulatory reporting and unbundling are baseline.",
    phasingNarrative:
      "Phase 1: core ERP plus IS-U device management and billing. Phase 2: PM, EAM, and APM for asset operations. Phase 3: customer engagement, IBP, and analytics.",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt", "is-utilities"],
    industryModuleIds: ["pm-eam", "apm", "ehs"],
    recommendedModuleIds: ["service-cloud", "ibp", "sac", "datasphere"],
    complexityMultiplier: 1.2,
  },
  {
    id: "consumer-goods",
    label: "Consumer Goods",
    bestPractices:
      "Trade promotion management and demand planning drive margin. Warehouse and transportation management determine service levels. Subscription and direct-to-consumer add channel complexity.",
    phasingNarrative:
      "Phase 1: core ERP, finance, and supply chain. Phase 2: IBP, warehouse and transportation. Phase 3: commerce, customer data, and advanced analytics.",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt", "ewm", "tm"],
    industryModuleIds: ["ibp", "pp", "qm", "brim"],
    recommendedModuleIds: ["commerce-cloud", "marketing-cloud", "cdc", "sac"],
    complexityMultiplier: 1.1,
  },
  {
    id: "professional-services",
    label: "Professional Services",
    bestPractices:
      "Project accounting, time and expense, and resource planning are the engine. Revenue recognition under IFRS 15 carries hidden complexity. Talent management drives utilisation.",
    phasingNarrative:
      "Phase 1: core finance, project systems, and Concur. Phase 2: HR, recruiting, performance. Phase 3: analytics, planning, and workforce optimisation.",
    mandatoryModuleIds: [...CORE_MANDATORY, "ps", "concur", "tax-mgmt"],
    industryModuleIds: ["ppm", "sf-recruiting", "sf-performance"],
    recommendedModuleIds: ["sac", "sf-analytics", "fpa-planning"],
    complexityMultiplier: 0.95,
  },
  {
    id: "telecommunications",
    label: "Telecommunications",
    bestPractices:
      "Subscription and convergent billing (BRIM) carry the heaviest load. Customer experience and service cloud are baseline. Network asset management on PM/APM is the operations spine.",
    phasingNarrative:
      "Phase 1: core ERP, finance, BRIM. Phase 2: service cloud, commerce, customer data. Phase 3: PM, APM, and analytics.",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt", "brim"],
    industryModuleIds: ["service-cloud", "commerce-cloud", "cdc", "pm-eam"],
    recommendedModuleIds: ["apm", "sac", "marketing-cloud", "datasphere"],
    complexityMultiplier: 1.2,
  },
  {
    id: "oil-gas",
    label: "Oil, Gas & Energy",
    bestPractices:
      "Hydrocarbon management, exchanges, and joint venture accounting are non-negotiable. PM and EHS protect both safety and uptime. EWM handles complex bulk and packaged inventory.",
    phasingNarrative:
      "Phase 1: core ERP plus IS-OIL and EHS. Phase 2: PM, EAM, EWM. Phase 3: APM, IBP, and analytics.",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt", "is-oil", "ehs"],
    industryModuleIds: ["pm-eam", "apm", "ewm"],
    recommendedModuleIds: ["ibp", "sac", "datasphere", "signavio"],
    complexityMultiplier: 1.3,
  },
  {
    id: "education",
    label: "Education",
    bestPractices:
      "Student finance, grants, and donor management are unique to the sector. HR and payroll for academic and admin staff need separate schemas. Compliance and reporting are heavy.",
    phasingNarrative:
      "Phase 1: core finance, procurement, and HR. Phase 2: payroll, recruiting, learning. Phase 3: analytics and student engagement.",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt"],
    industryModuleIds: ["hcm-payroll-onprem", "sf-recruiting", "sf-lms", "re-fx"],
    recommendedModuleIds: ["service-cloud", "cdc", "sac"],
    complexityMultiplier: 1.0,
  },
  {
    id: "hospitality",
    label: "Hospitality",
    bestPractices:
      "Procurement, inventory, and F&B costing carry the operational load. Customer experience and loyalty drive revenue. Workforce time and scheduling are the daily friction.",
    phasingNarrative:
      "Phase 1: core ERP, finance, procurement. Phase 2: HR, time, learning. Phase 3: customer experience, commerce, analytics.",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt"],
    industryModuleIds: ["sf-time", "service-cloud", "marketing-cloud"],
    recommendedModuleIds: ["commerce-cloud", "cdc", "sac"],
    complexityMultiplier: 1.0,
  },
  {
    id: "logistics-transport",
    label: "Logistics & Transportation",
    bestPractices:
      "Transportation management is the spine. Warehouse management at scale across distribution centres is the second pillar. Fleet, asset, and driver management round out the operations.",
    phasingNarrative:
      "Phase 1: core ERP, finance, MM. Phase 2: TM and EWM. Phase 3: APM, IBP, analytics.",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt", "tm", "ewm"],
    industryModuleIds: ["pm-eam", "ehs", "apm"],
    recommendedModuleIds: ["ibp", "sac", "datasphere"],
    complexityMultiplier: 1.15,
  },
  {
    id: "construction-real-estate",
    label: "Construction & Real Estate",
    bestPractices:
      "Project systems, lease accounting (IFRS 16 / ASC 842), and progress billing dominate. Procurement of materials and subcontractors needs strong contract control. EHS is regulated.",
    phasingNarrative:
      "Phase 1: core finance, PS, RE-FX. Phase 2: procurement, contracts, EHS. Phase 3: analytics and asset operations.",
    mandatoryModuleIds: [...CORE_MANDATORY, "fi-aa", "tax-mgmt", "ps", "re-fx"],
    industryModuleIds: ["pm-eam", "ehs", "ariba-contracts"],
    recommendedModuleIds: ["sac", "ppm", "concur"],
    complexityMultiplier: 1.1,
  },
];

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

export const COMPANY_SIZES: CompanySizePreset[] = [
  {
    id: "small",
    label: "Small (< 100 employees)",
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
    label: "Mid-size (100-500 employees)",
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
    label: "Large (500-2,000 employees)",
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
    label: "Enterprise (2,000+ employees)",
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

// ─── Phase templates ──────────────────────────────────────────────────

export interface PhaseTemplate {
  id: 1 | 2 | 3;
  label: string;
  description: string;
  focusAreas: string[];
  /** Module categories that belong in this phase. */
  acceptCategories: SapModuleCategory[];
}

export const PHASES: PhaseTemplate[] = [
  {
    id: 1,
    label: "Phase 1: Core ERP, Finance & Compliance",
    description: "Establish the core ERP foundation with finance, procurement, and HR.",
    focusAreas: [
      "Core ERP configuration",
      "Financial accounting",
      "Procurement setup",
      "HR and payroll",
      "Statutory compliance",
    ],
    acceptCategories: ["finance", "procurement", "hcm"],
  },
  {
    id: 2,
    label: "Phase 2: Industry-Specific Solutions",
    description: "Layer in the modules that make the system fit your industry.",
    focusAreas: [
      "Industry-specific processes",
      "Specialised modules",
      "Industry compliance",
      "Extended features",
    ],
    acceptCategories: ["industry", "supply-chain", "sales-cx", "projects"],
  },
  {
    id: 3,
    label: "Phase 3: Advanced, Analytics & Platform",
    description: "Add analytics, integration, and the platform capabilities for scale.",
    focusAreas: [
      "Analytics and reporting",
      "Integration and extension",
      "Master data governance",
      "Process intelligence",
    ],
    acceptCategories: ["analytics", "platform"],
  },
];

// ─── Team role templates ──────────────────────────────────────────────

export interface TeamRole {
  role: string;
  function: string;
  /** Headcount baseline before sizing multiplier. */
  baseCount: number;
  /** Day rate band (USD). Used to multiply against effort weight. */
  dayRateBand: string;
}

/**
 * Standard SAP programme team. Each module added to scope increases
 * specialist functional consultant count via the engine. Tech, ABAP,
 * Basis, PMO, and Change scale with company size.
 */
export const TEAM_ROLES: TeamRole[] = [
  { role: "Programme Director", function: "Programme leadership and stakeholder management", baseCount: 1, dayRateBand: "$2,000-$3,500" },
  { role: "Programme Manager", function: "Day-to-day delivery, plan, RAID log", baseCount: 1, dayRateBand: "$1,400-$2,200" },
  { role: "Solution Architect", function: "End-to-end design, integration patterns", baseCount: 1, dayRateBand: "$1,600-$2,400" },
  { role: "Functional Lead — Finance", function: "FI/CO/Treasury design, GL chart, controlling model", baseCount: 1, dayRateBand: "$1,200-$1,800" },
  { role: "Functional Lead — Supply Chain", function: "MM/PP/EWM/TM design and config", baseCount: 1, dayRateBand: "$1,200-$1,800" },
  { role: "Functional Lead — HR", function: "SuccessFactors / HCM design", baseCount: 1, dayRateBand: "$1,100-$1,700" },
  { role: "Functional Consultants", function: "Module-level configuration and testing", baseCount: 3, dayRateBand: "$800-$1,300" },
  { role: "Technical / ABAP Developer", function: "Custom dev, RICEFW, performance", baseCount: 2, dayRateBand: "$700-$1,200" },
  { role: "Basis / BTP Admin", function: "Landscape, transports, performance, security", baseCount: 1, dayRateBand: "$800-$1,200" },
  { role: "Integration / CPI Consultant", function: "Interfaces, iFlows, API management", baseCount: 1, dayRateBand: "$1,000-$1,500" },
  { role: "Data Migration Lead", function: "Data mapping, cleansing, cutover", baseCount: 1, dayRateBand: "$1,000-$1,500" },
  { role: "Change Manager", function: "Communications, training plan, adoption", baseCount: 1, dayRateBand: "$900-$1,400" },
  { role: "Test Lead", function: "Test strategy, UAT, regression, defect triage", baseCount: 1, dayRateBand: "$800-$1,200" },
];

// ─── License type heuristic ───────────────────────────────────────────

export function licenseTypeFor(category: SapModuleCategory, moduleId?: string): string {
  // HR modules typically employee-based; Ariba and similar transactional;
  // most else user-based.
  if (category === "hcm") return "Employee-Based";
  if (moduleId === "ariba-sourcing" || moduleId === "ariba-buying" || moduleId === "ariba-contracts" || moduleId === "ariba-supplier") return "Transaction-Based";
  if (moduleId === "mm" || moduleId === "inventory-mgmt" || moduleId === "gr-ir") return "Transaction-Based";
  return "User-Based";
}
