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
 */

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

export const SAP_MODULE_CATEGORIES: { id: SapModuleCategory; label: string; blurb: string }[] = [
  {
    id: "finance",
    label: "Finance & Controlling",
    blurb: "FI, CO, Group Reporting, Treasury, FSCM, FP&A",
  },
  {
    id: "procurement",
    label: "Procurement & Sourcing",
    blurb: "MM, Ariba, Inventory, GR/IR",
  },
  {
    id: "supply-chain",
    label: "Supply Chain & Manufacturing",
    blurb: "PP, EWM, TM, IBP, QM, PM, EHS",
  },
  {
    id: "sales-cx",
    label: "Sales & Customer Experience",
    blurb: "SD, BRIM, Sales/Service/Commerce/Marketing Cloud, CPQ",
  },
  {
    id: "hcm",
    label: "Human Capital Management",
    blurb: "SuccessFactors, Payroll, Time, Recruiting, LMS",
  },
  {
    id: "projects",
    label: "Projects & Expense",
    blurb: "PS, PPM, Concur",
  },
  {
    id: "analytics",
    label: "Analytics & Data",
    blurb: "SAC, Datasphere, BW/4HANA, embedded analytics",
  },
  {
    id: "platform",
    label: "Platform & Integration",
    blurb: "BTP, Integration Suite, MDG, Signavio, IAM",
  },
  {
    id: "industry",
    label: "Industry add-ons",
    blurb: "Retail, Oil & Gas, Utilities, Public Sector, Banking, Defense",
  },
];

export const SAP_MODULES: SapModule[] = [
  // ─── Finance & Controlling ───────────────────────────────────────────
  { id: "fi-gl", label: "Financial Accounting", code: "FI-GL", category: "finance", description: "General Ledger, statutory reporting foundation", effortWeight: 1.0, core: true },
  { id: "fi-ap", label: "Accounts Payable", code: "FI-AP", category: "finance", description: "Vendor invoicing, payment processing", effortWeight: 0.6, core: true },
  { id: "fi-ar", label: "Accounts Receivable", code: "FI-AR", category: "finance", description: "Customer invoices, collections, dunning", effortWeight: 0.6, core: true },
  { id: "fi-aa", label: "Asset Accounting", code: "FI-AA", category: "finance", description: "Fixed assets, depreciation, capitalisation", effortWeight: 0.6 },
  { id: "fi-bl", label: "Bank Accounting & Cash Management", code: "FI-BL", category: "finance", description: "Bank reconciliation, daily liquidity", effortWeight: 0.5 },
  { id: "tax-mgmt", label: "Tax Management", category: "finance", description: "Indirect tax, VAT, withholding, jurisdiction logic", effortWeight: 0.7 },
  { id: "co", label: "Controlling", code: "CO", category: "finance", description: "Internal cost accounting and management reporting", effortWeight: 0.8, core: true },
  { id: "co-cca", label: "Cost Center Accounting", code: "CO-CCA", category: "finance", description: "Cost centre design, allocations, settlements", effortWeight: 0.5 },
  { id: "co-pca", label: "Profit Center Accounting", code: "CO-PCA", category: "finance", description: "Profit centre P&L, intra-company transfers", effortWeight: 0.5 },
  { id: "co-pc", label: "Product Costing", code: "CO-PC", category: "finance", description: "Standard cost, actual cost, variance analysis", effortWeight: 0.9 },
  { id: "co-pa", label: "Profitability Analysis", code: "CO-PA", category: "finance", description: "Margin reporting by customer, region, product", effortWeight: 0.9 },
  { id: "internal-orders", label: "Internal Orders", category: "finance", description: "Capex orders, event/campaign cost capture", effortWeight: 0.3 },
  { id: "group-reporting", label: "Group Reporting (S/4HANA)", category: "finance", description: "Native S/4HANA consolidation, replaces BPC for new builds", effortWeight: 1.1 },
  { id: "bpc", label: "Financial Consolidation (BPC / SEM-BCS)", code: "BPC", category: "finance", description: "Legacy consolidation, planning, eliminations", effortWeight: 1.0 },
  { id: "fpa-planning", label: "Financial Planning & Analysis", category: "finance", description: "Planning, budgeting, forecasting on SAC for Planning", effortWeight: 0.9 },
  { id: "treasury", label: "Treasury & Risk Management", code: "TRM", category: "finance", description: "Cash management, in-house cash, FX, hedging, money market", effortWeight: 1.2 },
  { id: "in-house-cash", label: "In-House Cash / Cash Pooling", category: "finance", description: "Intercompany payments, payment factory", effortWeight: 0.7 },
  { id: "fscm-credit", label: "Credit Management", code: "FSCM-CR", category: "finance", description: "Credit scoring, limit management, exposure", effortWeight: 0.5 },
  { id: "fscm-dispute", label: "Dispute Management", code: "FSCM-DM", category: "finance", description: "AR dispute case workflow", effortWeight: 0.4 },
  { id: "fscm-collections", label: "Collections Management", code: "FSCM-COL", category: "finance", description: "Worklist-driven collections, dunning strategy", effortWeight: 0.4 },
  { id: "re-fx", label: "Real Estate Management", code: "RE-FX", category: "finance", description: "Lease contracts, IFRS 16 / ASC 842 compliance", effortWeight: 0.7 },
  { id: "drc", label: "Document & Reporting Compliance", code: "DRC", category: "finance", description: "Global e-invoicing, statutory reporting, ViDA, KSA, UAE, India", effortWeight: 0.6 },

  // ─── Procurement ─────────────────────────────────────────────────────
  { id: "mm", label: "Materials Management", code: "MM", category: "procurement", description: "Purchasing, inventory, vendor management", effortWeight: 0.9, core: true },
  { id: "ariba-sourcing", label: "Ariba Sourcing", category: "procurement", description: "RFx, e-auctions, supplier discovery", effortWeight: 0.7 },
  { id: "ariba-buying", label: "Ariba Buying & Invoicing", category: "procurement", description: "Catalog-driven indirect procurement, invoice automation", effortWeight: 0.8 },
  { id: "ariba-contracts", label: "Ariba Contracts", category: "procurement", description: "Contract lifecycle management", effortWeight: 0.5 },
  { id: "ariba-supplier", label: "Ariba Supplier Management", category: "procurement", description: "Supplier qualification, risk, performance", effortWeight: 0.5 },
  { id: "inventory-mgmt", label: "Inventory Management", category: "procurement", description: "Stock movements, valuation, physical inventory", effortWeight: 0.5 },
  { id: "gr-ir", label: "Goods Receipt / Invoice Verification", code: "GR/IR", category: "procurement", description: "3-way match, GR/IR clearing", effortWeight: 0.4 },

  // ─── Supply Chain & Manufacturing ────────────────────────────────────
  { id: "pp", label: "Production Planning", code: "PP", category: "supply-chain", description: "MRP, production orders, capacity planning", effortWeight: 1.0 },
  { id: "ppds", label: "Production Planning & Detailed Scheduling", code: "PP/DS", category: "supply-chain", description: "Advanced finite scheduling, sequencing", effortWeight: 1.0 },
  { id: "me", label: "Manufacturing Execution", code: "ME", category: "supply-chain", description: "Shop-floor execution, work instructions, traceability", effortWeight: 1.1 },
  { id: "qm", label: "Quality Management", code: "QM", category: "supply-chain", description: "Inspection lots, certificates, batch quality", effortWeight: 0.7 },
  { id: "pm-eam", label: "Plant Maintenance / EAM", code: "PM", category: "supply-chain", description: "Maintenance orders, asset master, preventive maintenance", effortWeight: 0.9 },
  { id: "ehs", label: "Environment, Health & Safety", code: "EHS", category: "supply-chain", description: "Hazardous substances, incident management, SDS", effortWeight: 0.7 },
  { id: "ewm", label: "Extended Warehouse Management", code: "EWM", category: "supply-chain", description: "Multi-bin warehouse, wave management, RF, slotting", effortWeight: 1.3 },
  { id: "tm", label: "Transportation Management", code: "TM", category: "supply-chain", description: "Freight planning, carrier selection, settlement", effortWeight: 1.0 },
  { id: "ibp", label: "Integrated Business Planning", code: "IBP", category: "supply-chain", description: "Demand, supply, S&OP, inventory optimisation", effortWeight: 1.0 },
  { id: "dmc", label: "Digital Manufacturing Cloud", code: "DMC", category: "supply-chain", description: "Cloud MES with IoT and analytics", effortWeight: 1.1 },
  { id: "apm", label: "Asset Performance Management", code: "APM", category: "supply-chain", description: "Predictive maintenance, asset strategy", effortWeight: 0.9 },

  // ─── Sales & CX ──────────────────────────────────────────────────────
  { id: "sd", label: "Sales & Distribution", code: "SD", category: "sales-cx", description: "Order-to-cash, pricing, billing", effortWeight: 0.9, core: true },
  { id: "pricing-conditions", label: "Pricing & Condition Technique", category: "sales-cx", description: "Multi-tier pricing, discounts, rebates", effortWeight: 0.6 },
  { id: "brim", label: "Billing & Revenue Innovation Management", code: "BRIM", category: "sales-cx", description: "Subscription billing, convergent invoicing, IFRS 15", effortWeight: 1.2 },
  { id: "sales-cloud", label: "Sales Cloud", category: "sales-cx", description: "CRM, pipeline, activity tracking", effortWeight: 0.7 },
  { id: "service-cloud", label: "Service Cloud", category: "sales-cx", description: "Case management, omnichannel service, field service", effortWeight: 0.8 },
  { id: "marketing-cloud", label: "Marketing Cloud (Emarsys)", category: "sales-cx", description: "Campaign automation, segmentation, personalisation", effortWeight: 0.7 },
  { id: "commerce-cloud", label: "Commerce Cloud", category: "sales-cx", description: "B2B / B2C storefront, catalog, checkout", effortWeight: 1.1 },
  { id: "cdc", label: "Customer Data Cloud (CDC)", category: "sales-cx", description: "Single sign-on, consent management, identity", effortWeight: 0.6 },
  { id: "cpq", label: "Configure, Price, Quote", code: "CPQ", category: "sales-cx", description: "Guided selling, complex configuration", effortWeight: 0.9 },
  { id: "subscription-billing", label: "Subscription Billing", category: "sales-cx", description: "Recurring revenue, usage-based pricing", effortWeight: 0.9 },

  // ─── HCM (SuccessFactors) ────────────────────────────────────────────
  { id: "sf-ec", label: "Employee Central (core HR)", category: "hcm", description: "Org structure, employee master, self-service", effortWeight: 0.9 },
  { id: "sf-ec-payroll", label: "Employee Central Payroll", category: "hcm", description: "Cloud payroll, multi-country", effortWeight: 1.4 },
  { id: "hcm-payroll-onprem", label: "SAP HCM Payroll (on-prem)", code: "PY", category: "hcm", description: "Legacy SAP HCM payroll, country-specific schemas", effortWeight: 1.5 },
  { id: "sf-time", label: "Time Management", category: "hcm", description: "Time entry, attendance, absence quotas", effortWeight: 0.8 },
  { id: "sf-recruiting", label: "Recruiting", category: "hcm", description: "Requisitions, candidate pipeline, offers", effortWeight: 0.7 },
  { id: "sf-onboarding", label: "Onboarding", category: "hcm", description: "Pre-hire workflows, paperwork, equipment", effortWeight: 0.5 },
  { id: "sf-performance", label: "Performance & Goals", category: "hcm", description: "Goal cascade, performance reviews, calibration", effortWeight: 0.6 },
  { id: "sf-lms", label: "Learning Management", code: "LMS", category: "hcm", description: "Learning catalogue, compliance training, certifications", effortWeight: 0.7 },
  { id: "sf-comp", label: "Compensation", category: "hcm", description: "Comp planning, merit cycles, bonus", effortWeight: 0.7 },
  { id: "sf-variable-pay", label: "Variable Pay", category: "hcm", description: "Bonus plans, sales incentives", effortWeight: 0.5 },
  { id: "sf-succession", label: "Succession & Development", category: "hcm", description: "Talent pools, career paths, 9-box", effortWeight: 0.6 },
  { id: "sf-analytics", label: "People Analytics / Workforce Planning", category: "hcm", description: "Workforce dashboards, headcount planning", effortWeight: 0.6 },

  // ─── Projects ────────────────────────────────────────────────────────
  { id: "ps", label: "Project Systems", code: "PS", category: "projects", description: "WBS, project costing, milestone billing", effortWeight: 0.9 },
  { id: "ppm", label: "Portfolio & Project Management", code: "PPM", category: "projects", description: "Portfolio dashboards, resource planning", effortWeight: 0.7 },
  { id: "concur", label: "Concur (Travel & Expense)", category: "projects", description: "Expense reports, travel booking, T&E policy", effortWeight: 0.5 },

  // ─── Analytics & Data ────────────────────────────────────────────────
  { id: "sac", label: "SAP Analytics Cloud", code: "SAC", category: "analytics", description: "Dashboards, planning, predictive on SAC", effortWeight: 0.8 },
  { id: "datasphere", label: "SAP Datasphere", category: "analytics", description: "Data warehousing, data products, semantic layer", effortWeight: 0.9 },
  { id: "bw4hana", label: "SAP BW/4HANA", category: "analytics", description: "Enterprise data warehouse on HANA", effortWeight: 1.0 },
  { id: "embedded-analytics", label: "Embedded Analytics in S/4HANA", category: "analytics", description: "CDS views, KPI cards in Fiori", effortWeight: 0.4 },

  // ─── Platform & Integration ──────────────────────────────────────────
  { id: "btp", label: "SAP BTP (Business Technology Platform)", code: "BTP", category: "platform", description: "Extension platform, dev runtime, services", effortWeight: 0.7 },
  { id: "integration-suite", label: "SAP Integration Suite (CPI)", code: "CPI", category: "platform", description: "iFlows, API management, event-driven integration", effortWeight: 0.8 },
  { id: "build", label: "SAP Build (Apps + Process Automation)", category: "platform", description: "Low-code app builder, process automation, RPA", effortWeight: 0.5 },
  { id: "mdg", label: "Master Data Governance", code: "MDG", category: "platform", description: "Central data governance, stewardship, workflows", effortWeight: 1.0 },
  { id: "signavio", label: "SAP Signavio", category: "platform", description: "Process intelligence, mining, modelling", effortWeight: 0.6 },
  { id: "ias", label: "Identity & Access Management", category: "platform", description: "SSO, provisioning, identity federation (IAS / IPS)", effortWeight: 0.5 },
  { id: "ilm", label: "Information Lifecycle Management", code: "ILM", category: "platform", description: "Data retention, archiving, GDPR / right-to-erasure", effortWeight: 0.6 },

  // ─── Industry add-ons ────────────────────────────────────────────────
  { id: "is-retail", label: "SAP for Retail", code: "IS-Retail", category: "industry", description: "Article master, assortment, store ops", effortWeight: 1.1 },
  { id: "is-oil", label: "SAP for Oil, Gas & Energy", code: "IS-OIL", category: "industry", description: "Hydrocarbon Management, JVA, exchanges", effortWeight: 1.3 },
  { id: "is-utilities", label: "SAP for Utilities", code: "IS-U", category: "industry", description: "Device Management, billing, customer service", effortWeight: 1.2 },
  { id: "is-public-sector", label: "SAP for Public Sector", code: "IS-PS", category: "industry", description: "Funds Management, Grants Management, Budget Control", effortWeight: 1.1 },
  { id: "is-banking", label: "SAP for Banking", category: "industry", description: "Deposits Management, Loans Management, Account Management", effortWeight: 1.3 },
  { id: "is-defense", label: "SAP for Defence & Security", code: "DFPS", category: "industry", description: "Force Element, Stock Aggregation, military planning", effortWeight: 1.2 },
];

/** Quick lookup by id. */
const MODULE_INDEX = new Map(SAP_MODULES.map((m) => [m.id, m]));

export function getModuleById(id: string): SapModule | undefined {
  return MODULE_INDEX.get(id);
}

export function getModulesByCategory(category: SapModuleCategory): SapModule[] {
  return SAP_MODULES.filter((m) => m.category === category);
}

export function getCoreModules(): SapModule[] {
  return SAP_MODULES.filter((m) => m.core);
}

/** Total effort weight for selected module IDs. Used by cost engines. */
export function sumEffortWeight(ids: string[]): number {
  return ids.reduce((sum, id) => {
    const m = MODULE_INDEX.get(id);
    return sum + (m ? m.effortWeight : 0);
  }, 0);
}
