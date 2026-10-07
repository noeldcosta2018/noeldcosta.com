import {
  Target,
  Layers,
  Settings,
  RefreshCw,
  AlertCircle,
  Globe,
} from "lucide-react";
import type { ElementType } from "react";

export interface TagInfo {
  label: string;
  description: string;
  icon: ElementType;
}

export const TAG_META: Record<string, TagInfo> = {
  "sap-planning-and-selection": {
    label: "Planning & Selection",
    description: "Choosing an ERP and setting up the programme: vendor shortlisting, readiness checks, business cases and the decisions to settle before you sign.",
    icon: Target,
  },
  "sap-implementation-strategies": {
    label: "Strategy",
    description: "How SAP programmes get delivered: SAP Activate, governance, steering committees, testing, quality gates and go-live planning that holds up.",
    icon: Layers,
  },
  "sap-technical-decisions": {
    label: "Technical",
    description: "The technical calls that shape an SAP programme: architecture, integration, data migration, clean core and the technical risks to settle early.",
    icon: Settings,
  },
  "sap-erp-modernization": {
    label: "Modernization & Industry",
    description:
      "Moving ERP forward: ECC to S/4HANA, RISE and GROW with SAP, clean core, cloud migration and what changes by industry.",
    icon: RefreshCw,
  },
  "sap-industry-topics": {
    label: "Modernization & Industry",
    description:
      "Moving ERP forward: ECC to S/4HANA, RISE and GROW with SAP, clean core, cloud migration and what changes by industry.",
    icon: RefreshCw,
  },
  "sap-crisis-management": {
    label: "Crisis & Recovery",
    description: "When an SAP programme is in trouble: recovery plans, risk mitigation, escalation, scope control and how to get delivery back on track.",
    icon: AlertCircle,
  },
};

export const TAG_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(TAG_META).map(([k, v]) => [k, v.label]),
);

export function tagLabel(tag: string): string {
  return TAG_LABEL[tag] ?? tagDisplayName(tag);
}

export function tagInfo(tag: string): TagInfo {
  return (
    TAG_META[tag] ?? {
      label: tagLabel(tag),
      description: "",
      icon: Globe,
    }
  );
}

// Tags treated as equivalent for filtering. /tag/sap-erp-modernization/
// and /tag/sap-industry-topics/ both surface the same content because no
// posts use the WordPress-exclusive "sap-erp-modernization" tag string —
// they all use "sap-industry-topics" in frontmatter.
const TAG_ALIASES: Record<string, string[]> = {
  "sap-erp-modernization": ["sap-industry-topics"],
  "sap-industry-topics": ["sap-erp-modernization"],
};

export function tagSynonyms(tag: string): string[] {
  return [tag, ...(TAG_ALIASES[tag] ?? [])];
}

// WordPress publishes these six tag archive URLs in its post_tag-sitemap.xml.
// Keep them in sync with the SEO audit and the route's generateStaticParams.
export const WORDPRESS_TAG_SLUGS = [
  "sap-crisis-management",
  "sap-erp-modernization",
  "sap-implementation-strategies",
  "sap-industry-topics",
  "sap-planning-and-selection",
  "sap-technical-decisions",
] as const;

// ─── Display names ───────────────────────────────────────────────────────────
// Visible headings, crumbs and chips use proper product and module names
// ("SAP FICO", "RISE with SAP", "ECC to S/4HANA") instead of auto title-cased
// slugs ("Sap Fico"). tagLabel()/tagInfo() fall back to these too, so tag page
// titles and CollectionPage JSON-LD read "AI in consulting", not "Ai On".
const TAG_NAMES: Record<string, string> = {
  "ai-governance": "AI governance",
  "ai-on-consulting": "AI in consulting",
  "case-study": "Case study",
  "cfo": "CFO",
  "cfo-erp": "ERP for CFOs",
  "change-control": "Change control",
  "change-management": "Change management",
  "clean-core": "Clean core",
  "cloud-foundry": "Cloud Foundry",
  "compliance": "Compliance",
  "consulting-career": "Consulting career",
  "consulting-frameworks": "Consulting frameworks",
  "contract-negotiation": "Contract negotiation",
  "crm-integration": "CRM integration",
  "ecc-to-s4hana": "ECC to S/4HANA",
  "erp-kpis": "ERP KPIs",
  "erp-modernization": "ERP modernisation",
  "erp-selection": "ERP selection",
  "erp-team-structure": "ERP team structure",
  "eu-ai-act": "EU AI Act",
  "fmcg": "FMCG",
  "grow-with-sap": "GROW with SAP",
  "iso-42001": "ISO 42001",
  "issue-trees": "Issue trees",
  "manufacturing": "Manufacturing",
  "manufacturing-erp": "Manufacturing ERP",
  "moscow-prioritisation": "MoSCoW prioritisation",
  "mrp": "MRP",
  "nist-ai-rmf": "NIST AI RMF",
  "oracle-vs-sap": "Oracle vs SAP",
  "order-to-cash": "Order to cash",
  "partner-selection": "Partner selection",
  "performance-testing": "Performance testing",
  "procurement": "Procurement",
  "project-charter": "Project charter",
  "project-recovery": "Project recovery",
  "public-sector": "Public sector",
  "quality-gates": "Quality gates",
  "raci": "RACI",
  "requirements-gathering": "Requirements gathering",
  "resource-planning": "Resource planning",
  "rise-with-sap": "RISE with SAP",
  "risk-management": "Risk management",
  "s-and-op": "S&OP",
  "s4hana-cloud": "SAP S/4HANA Cloud",
  "s4hana-implementation": "S/4HANA implementation",
  "sales-cloud": "SAP Sales Cloud",
  "salesforce-integration": "Salesforce integration",
  "sap-activate": "SAP Activate",
  "sap-ai-foundation": "SAP AI Foundation",
  "sap-analytics-cloud": "SAP Analytics Cloud",
  "sap-ariba": "SAP Ariba",
  "sap-bpc": "SAP BPC",
  "sap-btp": "SAP BTP",
  "sap-business-case": "SAP business case",
  "sap-business-one": "SAP Business One",
  "sap-cap": "SAP CAP",
  "sap-careers": "SAP careers",
  "sap-change-management": "SAP change management",
  "sap-cloud-alm": "SAP Cloud ALM",
  "sap-coe": "SAP centre of excellence",
  "sap-community": "SAP Community",
  "sap-compliance": "SAP compliance",
  "sap-cost": "SAP cost",
  "sap-cpi": "SAP CPI",
  "sap-customer-experience": "SAP Customer Experience",
  "sap-cx": "SAP CX",
  "sap-data-migration": "SAP data migration",
  "sap-datasphere": "SAP Datasphere",
  "sap-documentation": "SAP documentation",
  "sap-ehs": "SAP EHS",
  "sap-ewm": "SAP EWM",
  "sap-fico": "SAP FICO",
  "sap-finance": "SAP Finance",
  "sap-fiori": "SAP Fiori",
  "sap-governance": "SAP governance",
  "sap-group-reporting": "SAP Group Reporting",
  "sap-ibp": "SAP IBP",
  "sap-implementation-cost": "SAP implementation cost",
  "sap-integration": "SAP integration",
  "sap-integration-suite": "SAP Integration Suite",
  "sap-joule": "SAP Joule",
  "sap-licensing": "SAP licensing",
  "sap-manufacturing": "SAP for manufacturing",
  "sap-migration-cockpit": "SAP Migration Cockpit",
  "sap-mm": "SAP MM",
  "sap-pp": "SAP PP",
  "sap-pricing": "SAP pricing",
  "sap-project-management": "SAP project management",
  "sap-rollout": "SAP rollout",
  "sap-sd": "SAP SD",
  "sap-successfactors": "SAP SuccessFactors",
  "sap-support-portal": "SAP Support Portal",
  "sap-system-integrators": "SAP system integrators",
  "sap-team-structure": "SAP team structure",
  "sap-testing": "SAP testing",
  "sap-tooling": "SAP tooling",
  "sap-training": "SAP training",
  "sap-universal-id": "SAP Universal ID",
  "sap-vs-oracle": "SAP vs Oracle",
  "scope-management": "Scope management",
  "servicenow-integration": "ServiceNow integration",
  "small-business-erp": "Small business ERP",
  "smb-erp": "SMB ERP",
  "steering-committee": "Steering committee",
  "structured-thinking": "Structured thinking",
  "supply-chain": "Supply chain",
  "supply-chain-planning": "Supply chain planning",
  "trade-policy": "Trade policy",
  "user-adoption": "User adoption",
  "warehouse-management": "Warehouse management",
};

// Tokens that keep a fixed spelling when a tag is not in the map above.
const TOKEN_CASE: Record<string, string> = {
  sap: "SAP", erp: "ERP", ai: "AI", crm: "CRM", btp: "BTP", s4hana: "S/4HANA",
  ecc: "ECC", hr: "HR", hcm: "HCM", it: "IT", kpi: "KPI", kpis: "KPIs", cfo: "CFO",
  cio: "CIO", api: "API", ml: "ML", rpa: "RPA", sac: "SAC", coe: "CoE", eu: "EU",
  uae: "UAE", gcc: "GCC", uk: "UK", us: "US", smb: "SMB", alm: "ALM", ibp: "IBP",
  bw: "BW", fi: "FI", co: "CO", mm: "MM", sd: "SD", pp: "PP", qm: "QM", pm: "PM",
  ewm: "EWM", tm: "TM", grc: "GRC", mdg: "MDG", oracle: "Oracle", microsoft: "Microsoft",
};

/** Proper display name for a tag slug, for visible UI only. */
export function tagDisplayName(tag: string): string {
  const fixed = TAG_META[tag]?.label ?? TAG_NAMES[tag];
  if (fixed) return fixed;
  const words = tag.split("-").filter(Boolean);
  return words
    .map((w, i) => {
      const known = TOKEN_CASE[w.toLowerCase()];
      if (known) return known;
      return i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w;
    })
    .join(" ");
}
