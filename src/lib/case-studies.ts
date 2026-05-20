/**
 * Structured metadata for the 8 case-study posts. The MDX bodies live
 * in content/posts/<slug>/en.mdx — this file just adds the portfolio
 * presentation layer (industry / service / region tags, headline split,
 * key stat) so cards and filters can render consistently.
 *
 * Every field is derived from copy already in the MDX (excerpt, key
 * takeaways, pull quote). No invented client names, no invented numbers.
 * Slug, hero image, title, excerpt and route URL all match what's
 * already on the site — zero SEO impact.
 */

export type Industry =
  | "aviation"
  | "defence"
  | "government"
  | "fmcg-retail"
  | "manufacturing"
  | "finance-banking";

export type Service =
  | "ecc-to-s4hana"
  | "ai-on-sap"
  | "programme-recovery"
  | "erp-selection"
  | "contract-review"
  | "solution-architecture";

export type Region = "gcc" | "uk" | "europe" | "south-asia";

export const INDUSTRY_LABEL: Record<Industry, string> = {
  aviation: "Aviation",
  defence: "Defence",
  government: "Government / Public Sector",
  "fmcg-retail": "FMCG / Retail",
  manufacturing: "Manufacturing",
  "finance-banking": "Finance / Banking",
};

export const SERVICE_LABEL: Record<Service, string> = {
  "ecc-to-s4hana": "ECC to S/4HANA Migration",
  "ai-on-sap": "AI on SAP",
  "programme-recovery": "Programme Recovery",
  "erp-selection": "ERP Selection",
  "contract-review": "Contract Review",
  "solution-architecture": "Solution Architecture",
};

export const REGION_LABEL: Record<Region, string> = {
  gcc: "GCC",
  uk: "UK",
  europe: "Europe",
  "south-asia": "South Asia",
};

export interface CaseStudy {
  /** Matches the MDX folder name; the route is /<slug> via the [slug] catch-all. */
  slug: string;
  client: {
    /** Always anonymous on this site — none of the 8 are named publicly. */
    label: string; // e.g. "Middle Eastern retailer · 7 countries"
    anonymous: boolean;
  };
  industry: Industry;
  service: Service[];
  region: Region;
  duration: string;
  role: string;
  cover: {
    src: string;
    alt: string;
  };
  /** Display headline split into a primary line + italic emphasis tail. */
  headline: {
    primary: string;
    italic: string;
  };
  /** The single number the card leads with. */
  headlineStat: {
    value: string;
    label: string;
  };
  /** 1-2 sentence outcome summary, pulled from excerpt. */
  outcome: string;
  publishedAt: string;
  /** Estimated read time; rough — based on word count of the MDX. */
  readingMinutes: number;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    // ─── FEATURED (Option A — strongest concrete scale + numbers) ─────────
    slug: "sap-ecc-to-s4hana-migration-case-study",
    client: {
      label: "Middle Eastern retailer · 18,000 employees · 7 countries",
      anonymous: true,
    },
    industry: "fmcg-retail",
    service: ["ecc-to-s4hana", "programme-recovery"],
    region: "gcc",
    duration: "18 months",
    role: "Migration advisor",
    cover: {
      src: "/images/wp/2025/09/6.webp",
      alt: "SAP migration team reviewing S/4HANA cutover plan on whiteboard with ECC system architecture diagrams in background",
    },
    headline: {
      primary: "Decade of custom ECC.",
      italic: "Cleaned in one programme.",
    },
    headlineStat: { value: "44%", label: "custom code, cut to near-zero" },
    outcome:
      "18,000 employees. 1,200+ outlets across 7 countries. A decade of custom ECC code that had become a liability. Brownfield S/4HANA with selective redesign — finance close went from weekends to before lunch.",
    publishedAt: "2025-09-04",
    readingMinutes: 12,
  },
  {
    slug: "case-study-finance-process-modernization",
    client: {
      label: "Family-owned conglomerate · UK, Africa, Asia",
      anonymous: true,
    },
    industry: "finance-banking",
    service: ["solution-architecture", "programme-recovery"],
    region: "uk",
    duration: "10 months",
    role: "Finance transformation lead",
    cover: {
      src: "/images/wp/2025/08/2.webp",
      alt: "Finance process modernization: CFO reviewing consolidated group financials on dashboard after SAP implementation",
    },
    headline: {
      primary: "15 days to close.",
      italic: "Five.",
    },
    headlineStat: { value: "15 → 5", label: "day month-end close" },
    outcome:
      "Multi-entity group running consolidation on spreadsheets across three continents. SAP S/4HANA Group Reporting plus SAC for planning — the CFO could finally act on opportunities weeks earlier.",
    publishedAt: "2025-08-17",
    readingMinutes: 9,
  },
  {
    slug: "citizen-engagement-with-sap-cx-public-sector",
    client: {
      label: "European government agency",
      anonymous: true,
    },
    industry: "government",
    service: ["solution-architecture"],
    region: "europe",
    duration: "14 months",
    role: "CX programme lead",
    cover: {
      src: "/images/wp/2025/08/Untitled-design-4.webp",
      alt: "Citizen engagement with SAP CX: government case worker reviewing unified citizen profile on Service Cloud dashboard",
    },
    headline: {
      primary: "Six weeks for a permit.",
      italic: "Ten days.",
    },
    headlineStat: { value: "6w → 10d", label: "permit processing time" },
    outcome:
      "Service Cloud, Customer Data Cloud, Marketing Cloud and Commerce Cloud, scoped surgically. 65% of requests moved online in year one without forcing digital-only — call volume dropped before features even landed.",
    publishedAt: "2025-08-29",
    readingMinutes: 10,
  },
  {
    slug: "erp-implementation-contract-negotiation-cost-review-cfo",
    client: {
      label: "MENA manufacturing group",
      anonymous: true,
    },
    industry: "manufacturing",
    service: ["contract-review"],
    region: "gcc",
    duration: "3 weeks",
    role: "Independent SOW reviewer",
    cover: {
      src: "/images/wp/2025/08/3-3.webp",
      alt: "ERP implementation contract negotiation. CFO reviewing statement of work with advisor before signing",
    },
    headline: {
      primary: "120-page SOW.",
      italic: "$850K out before signature.",
    },
    headlineStat: { value: "$850K", label: "removed before kick-off" },
    outcome:
      "A 120-page proposal that looked clean and read vague. Three weeks of SOW decomposition surfaced $340K in scope rationalisation, $310K in role reallocation, $200K in contract modifications — all before the CFO signed.",
    publishedAt: "2025-08-28",
    readingMinutes: 11,
  },
  {
    slug: "erp-recovery-fmcg-sap-analytics-cloud",
    client: {
      label: "FMCG group · Singapore HQ, UK subsidiary",
      anonymous: true,
    },
    industry: "fmcg-retail",
    service: ["programme-recovery", "solution-architecture"],
    region: "south-asia",
    duration: "6 months",
    role: "Recovery lead",
    cover: {
      src: "/images/wp/2025/04/1-2.webp",
      alt: "ERP recovery case study. FMCG finance team reviewing unified SAP Analytics Cloud dashboard combining Oracle and SAP data",
    },
    headline: {
      primary: "Two ERPs, two answers.",
      italic: "One source of truth.",
    },
    headlineStat: { value: "6 mo", label: "from stalled to relaunched" },
    outcome:
      "Singapore on Oracle, UK on SAP, numbers that never matched. SAP Analytics Cloud connected live to both — six months from recovery start to a unified reporting model finance and operations actually trusted.",
    publishedAt: "2025-08-18",
    readingMinutes: 10,
  },
  {
    slug: "erp-system-selection-case-study-manufacturing",
    client: {
      label: "Polish manufacturer · ~$400M revenue",
      anonymous: true,
    },
    industry: "manufacturing",
    service: ["erp-selection"],
    region: "europe",
    duration: "12 weeks",
    role: "Selection advisor",
    cover: {
      src: "/images/wp/2025/03/6-2.webp",
      alt: "ERP system selection case study: manufacturing leadership team reviewing vendor scorecard and TCO model",
    },
    headline: {
      primary: "$1.2M nearly spent.",
      italic: "Saved in twelve weeks.",
    },
    headlineStat: { value: "$1.2M", label: "avoided in unnecessary scope" },
    outcome:
      "Leadership was three demos deep with no evaluation framework. Scripted demos on the client's own data, five-year TCO model, structured voting — they made a clean ERP choice in 12 weeks and went into implementation with confidence.",
    publishedAt: "2025-08-17",
    readingMinutes: 9,
  },
  {
    slug: "my-journey-with-customer-information-solutions-defense",
    client: {
      label: "Middle East defence manufacturer",
      anonymous: true,
    },
    industry: "defence",
    service: ["solution-architecture"],
    region: "gcc",
    duration: "6 months",
    role: "Digital Transformation Director",
    cover: {
      src: "/images/wp/2025/03/Your-paragraph-text-3.webp",
      alt: "Defence manufacturer sales team reviewing a unified customer information dashboard across CRM, CPQ, and SAP SD",
    },
    headline: {
      primary: "Three systems.",
      italic: "One customer record.",
    },
    headlineStat: { value: "35%", label: "faster quote turnaround" },
    outcome:
      "Customer data sat in three places, none matching. Microsoft Dynamics + Experlogix CPQ + SAP SD integrated via SAP CPI. Quote turnaround dropped 35% — once trust caught up with the technical change.",
    publishedAt: "2025-04-30",
    readingMinutes: 8,
  },
  {
    slug: "sap-ariba-implementation-uae-public-sector",
    client: {
      label: "UAE federal ministry · multi-billion-dirham spend",
      anonymous: true,
    },
    industry: "government",
    service: ["ecc-to-s4hana", "solution-architecture"],
    region: "gcc",
    duration: "16 months",
    role: "Programme advisor",
    cover: {
      src: "/images/wp/2025/04/3-1.webp",
      alt: "UAE government ministry procurement team reviewing SAP Ariba tender evaluation dashboard and supplier onboarding progress",
    },
    headline: {
      primary: "Paper tenders.",
      italic: "Auditable in months.",
    },
    headlineStat: { value: "30–40%", label: "faster tender cycle times" },
    outcome:
      "Multi-billion-dirham procurement run on paper and spreadsheets. SAP Ariba integrated with S/4HANA under UAE data-residency law. Tender cycles down 30–40%; the quietest win was a structured audit trail that auditors could read.",
    publishedAt: "2025-08-25",
    readingMinutes: 11,
  },
];

/**
 * Featured case study — the showpiece at the top of the portfolio page.
 * Currently the SAP ECC → S/4HANA migration (largest scale + cleanest
 * concrete numbers among the 8).
 */
export const FEATURED_CASE_STUDY_SLUG = "sap-ecc-to-s4hana-migration-case-study";

export function getFeaturedCaseStudy(): CaseStudy {
  const found = CASE_STUDIES.find((c) => c.slug === FEATURED_CASE_STUDY_SLUG);
  if (!found) throw new Error(`Featured case study ${FEATURED_CASE_STUDY_SLUG} not found`);
  return found;
}

export function getAnchorCaseStudies(): CaseStudy[] {
  // The 3-5 strongest non-featured cases, hand-picked for the anchor row.
  // Order matters — first card sits top-left.
  const anchors = [
    "case-study-finance-process-modernization",
    "erp-recovery-fmcg-sap-analytics-cloud",
    "sap-ariba-implementation-uae-public-sector",
    "erp-implementation-contract-negotiation-cost-review-cfo",
  ];
  return anchors
    .map((s) => CASE_STUDIES.find((c) => c.slug === s))
    .filter((c): c is CaseStudy => Boolean(c));
}

export function getArchiveCaseStudies(): CaseStudy[] {
  const anchorSet = new Set([
    FEATURED_CASE_STUDY_SLUG,
    ...getAnchorCaseStudies().map((c) => c.slug),
  ]);
  return CASE_STUDIES.filter((c) => !anchorSet.has(c.slug));
}
