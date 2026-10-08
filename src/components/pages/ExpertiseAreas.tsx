import Link from "next/link";

// Anchored expertise sections on /erp-ai-services/ (English). Each anchor is a
// destination in the Expertise menu. Copy comes from the approved revamp plan
// (section 4.3), plus ServiceNow (added by Noel, 8 October 2026); no claims
// beyond them.

type Item = { id: string; title: string; text: string; link?: { label: string; href: string } };
type Area = { id: string; num: string; name: string; color: string; claim: string; items: Item[] };

const AREAS: Area[] = [
  {
    id: "enterprise-applications",
    num: "01",
    name: "Enterprise applications",
    color: "var(--area-apps)",
    claim: "Choose the right system. Make the implementation work.",
    items: [
      {
        id: "sap",
        title: "SAP",
        text: "Selection and business case, the S/4HANA route (greenfield, brownfield or selective), and oversight of an SI-led programme from blueprint to post-go-live.",
        link: { label: "SAP implementation", href: "/sap-implementation/" },
      },
      {
        id: "oracle",
        title: "Oracle",
        text: "Oracle Fusion decisions and programme oversight. I advised on a move from Oracle E-Business Suite to Oracle Fusion across 84 government entities.",
        link: { label: "Oracle ERP vs SAP", href: "/oracle-erp-vs-sap/" },
      },
      {
        id: "microsoft",
        title: "Microsoft",
        text: "Microsoft Dynamics 365 and Microsoft reporting, chosen and delivered against the business processes they have to support.",
      },
      {
        id: "servicenow",
        title: "ServiceNow",
        text: "ServiceNow for the workflows around your ERP. SAP runs the structured transactions, ServiceNow runs the service and approval work around them, and the value comes from connecting the two.",
        link: { label: "ERP modernization with SAP and ServiceNow", href: "/erp-modernization-sap-servicenow/" },
      },
    ],
  },
  {
    id: "data-and-analytics",
    num: "02",
    name: "Data & analytics",
    color: "var(--area-data)",
    claim: "Bring your data into the decisions that matter.",
    items: [
      {
        id: "databricks",
        title: "Databricks",
        text: "A data foundation for SAP and non-SAP data, including Databricks. The starting point is what people need to know, not how many dashboards to build.",
        link: { label: "Why data migration fails", href: "/why-sap-data-migration-fails-and-how-to-fix-it/" },
      },
      {
        id: "sap-analytics-cloud",
        title: "SAP Analytics Cloud",
        text: "Planning and reporting on SAP data with SAP Analytics Cloud, and finance reporting that holds up at month-end close.",
        link: { label: "SAP Analytics Cloud", href: "/sap-analytics-cloud/" },
      },
    ],
  },
  {
    id: "ai",
    num: "03",
    name: "AI",
    color: "var(--area-ai)",
    claim: "Decide where AI is useful. Then make it work.",
    items: [
      {
        id: "enterprise-ai",
        title: "Enterprise AI",
        text: "Choosing the few use cases worth funding, and dropping the rest. Most of my AI work has been for public sector, aviation, defence and retail organisations.",
        link: { label: "AI governance and risk", href: "/ai-governance-services/" },
      },
      {
        id: "private-ai",
        title: "Private AI",
        text: "Private AI, where company information must stay under your control.",
        link: { label: "AI governance framework", href: "/ai-governance-framework-guide-building-a-responsible-ai-plan/" },
      },
      {
        id: "sap-joule",
        title: "SAP Joule",
        text: "What your licence includes and what Joule needs to be useful in your processes.",
        link: { label: "SAP Joule articles", href: "/tag/sap-joule/" },
      },
      {
        id: "ai-for-small-businesses",
        title: "AI for small businesses",
        text: "Practical automation without an enterprise budget.",
        link: { label: "AI for small businesses", href: "/erp-for-small-business-ai-automation/" },
      },
    ],
  },
];

export default function ExpertiseAreas() {
  return (
    <div className="nd-areas">
      {AREAS.map((area) => (
        <section key={area.id} id={area.id} className="nd-area" aria-labelledby={`${area.id}-title`}>
          <div className="nd-area-top">
            <span className="nd-card-band" style={{ background: area.color }} aria-hidden="true" />
            <span className="num">{area.num}</span>
            <h2 id={`${area.id}-title`} className="nd-display">
              {area.name}
            </h2>
            <p className="claim">{area.claim}</p>
          </div>
          <ul className="nd-area-items">
            {area.items.map((item) => (
              <li key={item.id} id={item.id} className="nd-card nd-glow">
                <h3>{item.title}</h3>
                <p className="text">{item.text}</p>
                {item.link && (
                  <Link className="nd-textlink" href={item.link.href}>
                    {item.link.label} <span aria-hidden="true">→</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
