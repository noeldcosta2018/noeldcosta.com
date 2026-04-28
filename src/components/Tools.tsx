// TODO: update Tools.tsx hrefs — this component currently showcases commercial products (Command Central, ERPCV),
// not the 5 LLM tool slugs. When this section is repurposed to list the free tools, replace with:
//   { name: "ERP Cost Calculator", href: "/erp-implementation-cost-calculator", ... }
//   { name: "SAP Cost Calculator", href: "/sap-implementation-cost-calculator", ... }
//   { name: "Migration Estimator", href: "/free-data-migration-estimator-sap-oracle-microsoft", ... }
//   { name: "JD Generator", href: "/sap-job-description-generator", ... }
//   { name: "Solution Builder", href: "/sap-solution-builder", ... }
const TOOLS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 21V9"/>
      </svg>
    ),
    name: "Command Central",
    type: "Implementation",
    title: "Track your ERP implementation in one place.",
    body: "Progress, risks, milestones, team performance. Built because every project I walked into had tracking spread across 15 different spreadsheets. Real-time dashboards. Not another status deck.",
    cta: "Explore Command Central →",
    href: "#",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    name: "ERPCV",
    type: "Career",
    title: "Stop losing interviews you should be winning.",
    body: "6-document career pack. Executive CV, project portfolio, cover letter, interview prep, LinkedIn messages, reference sheet. 1,200+ packs delivered. 89% more interviews. $19.99 one-time.",
    cta: "Try ERPCV free →",
    href: "https://erpcv3.vercel.app/",
  },
];

export default function Tools() {
  return (
    <section
      id="tools"
      className="bg-corbeau text-bone"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.68rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          [ 04 · Built by me ]
        </p>
        <h2
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-bone"
          style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
        >
          Tools I build{" "}
          <span className="cc-emphasis-italic">for the ERP world.</span>
        </h2>
        <p className="text-moon text-[1rem] max-w-[520px] leading-[1.7] mb-12">
          I don&apos;t just advise. I build products. Used by consultants and companies
          across 130+ regions.
        </p>

        <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
          {TOOLS.map((t) => (
            <div
              key={t.name}
              className="bg-haiti border border-white/[0.06] rounded-[14px] overflow-hidden transition-all duration-300 hover:border-papaya/20 hover:-translate-y-[3px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
            >
              <div className="px-[18px] py-3 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-papaya">{t.icon}</span>
                  <span className="font-mono text-[0.75rem] font-semibold text-bone">{t.name}</span>
                </div>
                <span
                  className="font-mono text-[0.6rem] px-2 py-0.5 rounded font-semibold uppercase tracking-[1px] text-papaya"
                  style={{ background: "rgba(252,152,90,0.1)" }}
                >
                  {t.type}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-[1.3rem] font-extrabold tracking-[-0.02em] mb-2 text-bone">{t.title}</h3>
                <p className="text-moon text-[0.92rem] leading-[1.65] mb-3">{t.body}</p>
                <a
                  href={t.href}
                  className="font-mono text-papaya no-underline text-[0.82rem] font-semibold transition-colors hover:text-[#fdaa78]"
                  target={t.href.startsWith("http") ? "_blank" : undefined}
                  rel={t.href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {t.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
