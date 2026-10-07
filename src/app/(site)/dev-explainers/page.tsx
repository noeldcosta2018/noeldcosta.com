import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MdxBody from "@/components/mdx/MdxBody";

/**
 * /dev-explainers/: development preview of every explainer tag.
 *
 * Never ships: production renders the 404. The samples go through MdxBody
 * exactly as article MDX does (single-line tags inside markdown), so this
 * page also proves the tag registration and paragraph unwrapping.
 * Figures and numbers below are sample data for layout review; the ones
 * taken from articles are noted next to each sample.
 */

export const metadata: Metadata = {
  title: "Explainer preview (dev only)",
  robots: { index: false, follow: false },
};

type Sample = { name: string; note: string; tag: string };

const SAMPLES: Sample[] = [
  {
    name: "explainer-flow",
    note: "Procure-to-pay. Transaction codes and postings as in the SAP FICO article.",
    tag: `<explainer-flow title="Procure-to-pay in S/4HANA" caption="Every step posts to the Universal Journal, so the trail from request to payment sits in one table." steps="Purchase requisition|Purchase order|Goods receipt|Invoice receipt|Payment run" notes="ME51N, from MRP or a user|ME21N, approved by release strategy|MIGO posts stock and credits GR/IR|MIRO three-way match clears GR/IR|F110 clears the vendor open item" result="Vendor paid, and every posting traceable in ACDOCA"></explainer-flow>`,
  },
  {
    name: "explainer-timeline",
    note: "ECC support dates from the SAP announcements of February 2020 and February 2025.",
    tag: `<explainer-timeline title="How long ECC stays supported" caption="2027 is the date that matters for planning. The later dates cost more and come with conditions." items="2027 => Mainstream maintenance ends|2030 => Optional extended maintenance ends|2033 => Private edition transition option ends" notes="31 December, for ECC 6.0 EHP 6 to 8|Extra fee, for customers who sign up|Only for customers moving to RISE with SAP" highlight="1" source="SAP maintenance announcements, February 2020 and February 2025"></explainer-timeline>`,
  },
  {
    name: "explainer-cost-build",
    note: "Midpoints of the ranges in the SAP implementation cost and budget breakdown article, rounded to 100.",
    tag: `<explainer-cost-build title="Where a mid-market S/4HANA budget goes" caption="Integration work is the biggest line on the budget. The licence is not." parts="System integration and implementation => 43|Licences or subscription => 15|Customisation and BTP development => 10|Data migration => 8|Training and change management => 8|Infrastructure and cloud => 7|Contingency => 5|Hypercare => 4" suffix="%" total-label="of the programme budget" source="Midpoints of 2026 ranges, SAP implementation cost and budget breakdown"></explainer-cost-build>`,
  },
  {
    name: "explainer-compare",
    note: "Greenfield, brownfield and selective, from the comparison table in the ECC to S/4HANA migration article.",
    tag: `<explainer-compare title="Three ways off ECC" caption="The same five questions boards ask, answered for each path." options="Greenfield|Brownfield|Selective data transition" criteria="Process redesign => [3] Full, against SAP standard ; [1] Largely preserved ; [2] Chosen per unit|Historical data => [1] Open items and balances only ; [3] Fully carried forward ; [2] Selected scope|Technical debt => Removed ; Carried forward ; Reduced for the migrated scope|Change impact => [3] High ; [1] Lower ; [2] Moderate|Best for => Fragmented legacy, major redesign ; Stable, well-kept ECC ; Mergers, carve-outs, phased rollouts" highlight="3"></explainer-compare>`,
  },
  {
    name: "explainer-cycle",
    note: "The AI Automation Practitioner delivery loop.",
    tag: `<explainer-cycle title="The build loop" caption="Each automation goes round this loop until it works. Feedback comes from a practitioner, not a quiz." steps="Learn|Build|Submit|Feedback|Fix" notes="One concept, one short lesson|A working automation|The run log and the output|Reviewed line by line|Ship the corrected version" center="Repeat until all three automations run"></explainer-cycle>`,
  },
  {
    name: "explainer-layers",
    note: "Clean core, using the five dimensions and BTP section of the clean-core article.",
    tag: `<explainer-layers title="A clean-core landscape, layer by layer" caption="The core stays standard. Everything that changes often lives above it." layers="AI and agents => Joule and agents act on governed data, never on raw tables|Data => Datasphere, one semantic layer for reporting and AI|Integration => Integration Suite and released APIs, no point-to-point code in the core|Extensions => BTP side-by-side apps and key-user extensibility|Core ERP => S/4HANA kept to standard, so every upgrade stays routine" tones="ai|data|apps|apps|accent"></explainer-layers>`,
  },
  {
    name: "explainer-funnel",
    note: "Illustrative counts for layout review only. Replace with sourced numbers in an article.",
    tag: `<explainer-funnel title="From AI idea to funded use case" caption="Illustrative portfolio review. Most ideas stop at data readiness, not at the model." stages="Ideas raised by the business => 64|Have usable data today => 27|Pass the risk review => 15|Have a named business owner => 9|Funded for build => 4"></explainer-funnel>`,
  },
  {
    name: "explainer-matrix",
    note: "Risk tiers from the AI risk management framework article (critical, moderate, low).",
    tag: `<explainer-matrix title="Where AI use cases land on a risk heat map" caption="Prioritise by likelihood and business impact. Hiring, credit and access decisions sit in the critical corner." x-label="Likelihood" y-label="Impact" x-levels="Low|Medium|High" y-levels="Low|Medium|High" items="Credit limit approvals => 3,3|CV screening => 3,3|Access provisioning bot => 2,3|Invoice matching agent => 2,2|Demand forecast assistant => 2,1|Internal policy search => 1,2|Meeting summaries => 1,1" zones="Low|Moderate|Critical"></explainer-matrix>`,
  },
  {
    name: "explainer-before-after",
    note: "Business One licence prices from the SAP Business One price guide (indicative, on-premise).",
    tag: `<explainer-before-after title="Right-sizing Business One licences" caption="Twenty users. Most only work in one functional area." metric="One-time licence cost, 20 users" before-label="Professional for all" after-label="Right-sized mix" before-value="64,000" after-value="43,000" prefix="$" before-points="20 Professional users at about $3,200 each|Full access for people who use one module|Paying for menus nobody opens" after-points="6 Professional users for finance and admin|14 Limited users at about $1,700 each|Same coverage for the work people actually do" source="Indicative 2026 prices, SAP Business One price guide"></explainer-before-after>`,
  },
  {
    name: "explainer-org",
    note: "Programme structure with an independent seat reporting to the sponsor.",
    tag: `<explainer-org title="Who owns what on an S/4HANA programme" caption="The advisor sits beside the sponsor, outside the SI's reporting line." chain="Executive sponsor => CFO, chairs the SteerCo|Programme director => Owns the plan, budget and RAID log" side="Independent advisor => Reports to the sponsor, not the SI" roles="Finance lead => FI/CO design and the close|Supply chain lead => MM, SD and PP processes|Data lead => Migration, cleansing, reconciliation|Integration lead => Interfaces, BTP and cutover" highlight="side"></explainer-org>`,
  },
  {
    name: "explainer-flow (seven steps)",
    note: "Edge case: more than six steps falls back to the vertical rail at any width.",
    tag: `<explainer-flow title="Record to report" caption="Seven steps from journal to board pack." steps="Journal entries|Accruals and deferrals|Intercompany matching|Reconciliations|Period close|Consolidation|Reporting"></explainer-flow>`,
  },
  {
    name: "explainer-org (six roles)",
    note: "Edge case: five or more roles use the left spine at any width.",
    tag: `<explainer-org title="Workstream leads on a multi-entity rollout" caption="Six workstreams report into one programme director." chain="Programme director => Owns the integrated plan" roles="Finance => FI/CO and group reporting|Procurement => MM and Ariba|Sales => SD and pricing|Manufacturing => PP and quality|Data => Migration and MDG|Integration => BTP and interfaces" highlight="1"></explainer-org>`,
  },
];

function sourceFor(samples: Sample[]): string {
  return samples
    .map((s) => [`## ${s.name}`, s.note, "```html\n" + s.tag + "\n```", s.tag].join("\n\n"))
    .join("\n\n");
}

export default function DevExplainersPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <>
      <Nav />
      <main id="main-content" className="nd-main">
        <div className="nd-container" style={{ paddingTop: 48, paddingBottom: 96 }}>
          <div className="nd-article-col" style={{ marginInline: "auto" }}>
            <p className="nd-eyebrow">Dev only</p>
            <h1 className="nd-display" style={{ fontSize: "clamp(26px, 3vw, 38px)", lineHeight: 1.1, marginTop: 16 }}>
              Explainer preview
            </h1>
            <p className="nd-lede">
              Every explainer tag rendered through MdxBody, the same path article MDX takes. Each sample shows the
              one-line tag first, then the figure. Syntax for editors lives in
              src/components/article/explainers/README.md. This route returns 404 in production.
            </p>
            <div className="prose-noel" style={{ marginTop: 40 }}>
              <MdxBody source={sourceFor(SAMPLES)} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
