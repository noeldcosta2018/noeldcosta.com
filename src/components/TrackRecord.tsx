const PROJECTS = [
  {
    company: "EDGE Group",
    badge: "$60M saved",
    badgeType: "p",
    title: "25 Defense Entities → One S/4HANA",
    desc: "Consolidated 8 legacy ERPs onto single S/4HANA core. 126-member team. 81% process automation across the entire defence group.",
  },
  {
    company: "Etihad Airways",
    badge: "$400M+ impact",
    badgeType: "g",
    title: "SAP Centre of Excellence — 8 Years",
    desc: "Built route profitability on SAP. Flight-level P&L across 100+ aircraft and 1,000+ weekly flights. $36M in direct benefits.",
  },
  {
    company: "TII",
    badge: "Greenfield",
    badgeType: "c",
    title: "S/4HANA Greenfield — 5 Research Entities",
    desc: "Dual-ledger Finance (cash + accrual, IPSAS). Cloud on Azure and AWS. Full lifecycle from blueprint through hypercare.",
  },
  {
    company: "DXC Technology",
    badge: "$300M pipeline",
    badgeType: "p",
    title: "Managing Partner — 800+ Consultants",
    desc: "SAP, Oracle, Microsoft practices across MEA. PIF entities, banking, public sector.",
  },
  {
    company: "Govt. Enablement",
    badge: "84 entities",
    badgeType: "c",
    title: "Digital Executive Advisor",
    desc: "SAP and Oracle landscape strategy. Oracle EBS to Fusion Cloud migration. Enterprise Architecture (TOGAF).",
  },
];

function badgeStyle(type: string) {
  if (type === "g") return { background: "rgba(34,197,94,0.12)", color: "#22c55e" };
  if (type === "c") return { background: "rgba(226,130,107,0.12)", color: "#e2826b" };
  return { background: "rgba(252,152,90,0.12)", color: "#fc985a" };
}

const PHASES = [
  { label: "DISCOVER", done: true },
  { label: "PREPARE", done: true },
  { label: "EXPLORE", done: true },
  { label: "REALIZE", active: true },
  { label: "DEPLOY", next: true },
];

const ENTITIES = ["EDGE HQ", "NIMR", "HALCON", "SIGN4L", "AL TARIQ", "+20 more"];

export default function TrackRecord() {
  return (
    <section
      id="track"
      className="bg-bone"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.68rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          [ 03 · Track record ]
        </p>
        <h2
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
          style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
        >
          Programmes I&apos;ve led.{" "}
          <em className="not-italic text-canyon font-extrabold">Not advised on. Led.</em>
        </h2>
        <p className="text-night text-[1rem] max-w-[520px] leading-[1.7] mb-12">
          Real companies. Real numbers. I was in the room running these.
        </p>

        <div className="grid grid-cols-2 gap-14 items-start max-lg:grid-cols-1">
          {/* Project list */}
          <div className="flex flex-col">
            {PROJECTS.map((p, i) => (
              <div
                key={i}
                className={`py-5 border-b border-corbeau/[0.06] ${i === 0 ? "pt-0" : ""}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-[0.65rem] uppercase tracking-[2px] text-silver">{p.company}</span>
                  <span className="font-mono text-[0.62rem] px-2 py-0.5 rounded font-semibold" style={badgeStyle(p.badgeType)}>
                    {p.badge}
                  </span>
                </div>
                <h4 className="font-display text-[1.05rem] font-bold tracking-[-0.02em] mb-1">{p.title}</h4>
                <p className="text-night text-[0.85rem] leading-[1.55]">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Dashboard mockup */}
          <div className="bg-paper border border-corbeau/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(14,16,32,0.06),0_20px_60px_rgba(14,16,32,0.04)] max-lg:max-w-[500px] sticky top-[84px]">
            <div className="flex items-center justify-between px-[18px] py-3 bg-corbeau/[0.02] border-b border-corbeau/[0.06]">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <span className="font-mono text-[0.7rem] text-silver ml-2.5">programme.dashboard</span>
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] text-brand-green font-semibold">
                <span className="w-[5px] h-[5px] rounded-full bg-brand-green animate-pulse-dot" />
                LIVE
              </span>
            </div>
            <div className="p-5">
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                {[
                  { lbl: "Cost Reduction", val: "$60M", color: "text-papaya" },
                  { lbl: "Automation", val: "81%", color: "text-brand-green" },
                  { lbl: "Team Size", val: "126", color: "text-corbeau" },
                  { lbl: "Legacy Systems", val: "8 → 1", color: "text-papaya" },
                ].map((m) => (
                  <div key={m.lbl} className="bg-cream border border-corbeau/[0.04] rounded-[10px] p-4">
                    <p className="font-mono text-[0.6rem] text-silver uppercase tracking-[1.5px] mb-1">{m.lbl}</p>
                    <p className={`font-display font-black text-2xl tracking-[-0.03em] ${m.color}`}>{m.val}</p>
                  </div>
                ))}
              </div>
              {/* Phase bar */}
              <div>
                <p className="font-mono text-[0.6rem] text-silver uppercase tracking-[1.5px] mb-2">Programme Phases</p>
                <div className="flex gap-1 h-[30px] rounded-lg overflow-hidden">
                  {PHASES.map((ph) => (
                    <div
                      key={ph.label}
                      className={`flex items-center justify-center font-mono text-[0.58rem] font-semibold rounded-[5px] flex-1 ${
                        ph.active
                          ? "bg-papaya text-corbeau animate-soft-pulse"
                          : ph.next
                          ? "text-silver"
                          : "bg-brand-green text-white"
                      }`}
                      style={ph.next ? { background: "rgba(14,16,32,0.06)" } : {}}
                    >
                      {ph.label}
                    </div>
                  ))}
                </div>
              </div>
              {/* Entity tags */}
              <div className="flex flex-wrap gap-[5px] mt-2.5">
                {ENTITIES.map((e) => (
                  <span
                    key={e}
                    className="font-mono text-[0.6rem] px-2 py-0.5 rounded bg-cream border border-corbeau/[0.06] text-night"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
