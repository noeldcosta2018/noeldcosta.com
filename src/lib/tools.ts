// Single source of truth for the free tools listed in the Nav dropdown
// and Footer column. Consumers:
//   - src/components/Nav.tsx — desktop dropdown + mobile drawer
//   - src/components/Footer.tsx — Free Tools column
// Tool pages themselves live at /<slug>/ (English-only routes under
// (site-en)/), so the `slug` here is the URL segment without a leading
// slash. Block 6c will translate `label` and `blurb` against this list.
export interface ToolMeta {
  label: string;
  slug: string;
  blurb: string;
}

export const TOOLS: ToolMeta[] = [
  {
    label: "ERP Cost Calculator",
    slug: "erp-implementation-cost-calculator",
    blurb: "LLM-estimated cost band for any ERP programme.",
  },
  {
    label: "SAP Cost Calculator",
    slug: "sap-implementation-cost-calculator",
    blurb: "SAP-specific cost, licence, and resourcing estimate.",
  },
  {
    label: "Migration Estimator",
    slug: "free-data-migration-estimator-sap-oracle-microsoft",
    blurb: "Data migration effort across SAP, Oracle, and Microsoft.",
  },
  {
    label: "JD Generator",
    slug: "sap-job-description-generator",
    blurb: "Role-accurate SAP job descriptions in seconds.",
  },
  {
    label: "Solution Builder",
    slug: "sap-solution-builder",
    blurb: "Sketch a solution architecture from a plain-English brief.",
  },
];
