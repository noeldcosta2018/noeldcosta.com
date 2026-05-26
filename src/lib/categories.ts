// Standalone categories module. Kept separate from src/lib/content.ts
// (which uses node:fs at module top for the MDX content tree) so that
// client components like src/components/Nav.tsx and src/components/
// LanguageSwitcher.tsx can import the data without dragging a Node-only
// readdirSync call into the browser bundle. The same architectural
// constraint is enforced for src/lib/locales.ts — see that file's
// comment for context.
//
// Single source of truth for the 6 content pillars. Consumers:
//   - src/components/Nav.tsx (dropdown — uses `label` + `navBlurb`)
//   - src/components/Footer.tsx (link list — uses `label`)
//   - src/components/CategoryPage.tsx (hero — uses `label` +
//     `description` + `tagline`)
//   - src/app/sitemap.ts (sitemap entries — uses `slug`)
// Block 6c (UI string translation) will translate the `label`,
// `description`, `navBlurb`, and `tagline` fields against this single
// source rather than three drifting copies.

export type Category =
  | "erp-consulting-guide"
  | "sap-modules"
  | "erp-strategy"
  | "ai-governance"
  | "agentic-ai"
  | "sap-case-studies";

export interface CategoryMeta {
  label: string;        // canonical display name; same in Nav, Footer, and category hero
  slug: string;         // URL slug; matches the WordPress category slug
  description: string;  // long descriptive line for the category index hero + meta
  navBlurb: string;     // short one-line tagline shown in the Nav dropdown
  tagline: string;      // italic emphasis line for the category hero H1 ("Label. <em>tagline</em>")
}

export const CATEGORIES: Record<Category, CategoryMeta> = {
  "erp-consulting-guide": {
    label: "ERP Consulting Guide",
    slug: "erp-consulting-guide",
    description: "Planning, cost, risk, and delivery of ERP implementations, plus career frameworks and thinking tools for ERP consultants.",
    navBlurb: "Delivery playbooks, programme recovery, go-live readiness.",
    tagline: "From the field, not the slides.",
  },
  "sap-modules": {
    label: "SAP Modules",
    slug: "sap-modules",
    description: "Deep technical coverage of SAP and ERP modules.",
    navBlurb: "SAP S/4HANA, Oracle, Dynamics. Module-level deep dives.",
    tagline: "Deep technical. Real projects.",
  },
  "erp-strategy": {
    label: "ERP Strategy & Cost",
    slug: "erp-strategy",
    description: "Vendor selection, licensing, modernization, and ERP economics.",
    navBlurb: "Roadmaps, TCO, vendor selection, transformation design.",
    tagline: "Real numbers. Not estimates.",
  },
  "ai-governance": {
    label: "AI Governance",
    slug: "ai-governance",
    description: "Responsible AI frameworks, risk management, and compliance.",
    navBlurb: "Policy, risk, controls, model oversight on ERP data.",
    tagline: "Grounded. Not hype.",
  },
  "agentic-ai": {
    label: "Agentic AI",
    slug: "agentic-ai",
    description: "Generative and agentic AI in enterprise ERP contexts.",
    navBlurb: "Autonomous agents in the ERP stack. What actually works.",
    tagline: "What works now.",
  },
  "sap-case-studies": {
    label: "SAP Case Studies",
    slug: "sap-case-studies",
    description: "Real programmes, outcomes, and lessons.",
    navBlurb: "Real programme outcomes from aviation, government, and retail.",
    tagline: "Named clients. Real outcomes.",
  },
};
