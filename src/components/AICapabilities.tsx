const FEATURES = [
  {
    title: "Agentic AI on SAP BTP",
    body: "Autonomous AI agents that work inside your SAP landscape. Handle approvals, flag anomalies, route decisions. Not chatbots. Agents that take action.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
        <path d="M16 12h2a2 2 0 0 1 2 2v2a6 6 0 0 1-12 0v-2a2 2 0 0 1 2-2h2"/>
      </svg>
    ),
  },
  {
    title: "Predictive Analytics",
    body: "Forecast demand, cash flow, maintenance schedules from your ERP data. Built on SAP Datasphere and Analytics Cloud. Real models, not dashboards.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10M18 20V4M6 20v-4"/>
      </svg>
    ),
  },
  {
    title: "Intelligent Automation",
    body: "Invoice matching, PO creation, journal entries. AI handles the repetitive work. Your team handles exceptions. 81% automation at EDGE Group.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    title: "AI Governance & Risk",
    body: "Policies, oversight frameworks, compliance processes. Deploy AI without the legal risk. Satisfy regulators and stakeholders.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
];

const TERMINAL_LINES = [
  { warn: false, content: <><strong style={{color:"#0e1020"}}>Anomaly detected:</strong> PO-4891 exceeds budget threshold by <span style={{color:"#e2826b"}}>23%</span></> },
  { warn: false, content: <>Agent action: <span style={{color:"#22c55e"}}>Routed to CFO for approval</span></> },
  { warn: false, content: <><strong style={{color:"#0e1020"}}>Cash flow forecast:</strong> Q3 shortfall predicted. <span style={{color:"#e2826b"}}>Adjusting accruals.</span></> },
  { warn: false, content: <>Invoice matching: <span style={{color:"#22c55e"}}>847 of 852 auto-matched</span> (99.4%)</> },
  { warn: false, content: <>Maintenance prediction: Asset MX-220 flagged. <span style={{color:"#e2826b"}}>Schedule by Aug 15.</span></> },
];

const STACK_TAGS = [
  { label: "SAP Business AI", type: "p" },
  { label: "Joule", type: "c" },
  { label: "SAP BTP", type: "g" },
  { label: "Datasphere", type: "p" },
  { label: "Analytics Cloud", type: "c" },
  { label: "Custom Agents", type: "g" },
];

function tagStyle(type: string) {
  if (type === "g") return { background: "rgba(34,197,94,0.12)", color: "#22c55e" };
  if (type === "c") return { background: "rgba(226,130,107,0.12)", color: "#e2826b" };
  return { background: "rgba(252,152,90,0.1)", color: "#fc985a" };
}

export default function AICapabilities() {
  return (
    <section
      id="ai"
      className="bg-cream"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.68rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          [ 02 · AI capabilities ]
        </p>
        <h2
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
          style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
        >
          AI on top of your ERP.{" "}
          <span className="cc-emphasis-italic">
            Not buzzwords. Real systems.
          </span>
        </h2>
        <p className="text-night text-[1rem] max-w-[520px] leading-[1.7] mb-12">
          I build practical AI that works with your SAP data. Agentic AI,
          predictive models, intelligent automation. Things that actually move
          the needle.
        </p>

        <div className="grid grid-cols-2 gap-14 items-start max-lg:grid-cols-1">
          {/* Features */}
          <div className="flex flex-col gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 items-start">
                <div
                  className="w-11 h-11 min-w-[44px] rounded-[10px] flex items-center justify-center text-papaya border border-papaya/[0.12]"
                  style={{ background: "rgba(252,152,90,0.08)" }}
                >
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-display text-[1rem] font-bold mb-0.5 tracking-[-0.02em]">{f.title}</h4>
                  <p className="text-[0.88rem] text-night leading-[1.55]">{f.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Terminal mockup */}
          <div className="cc-card relative rounded-2xl overflow-hidden max-lg:max-w-[500px] sticky top-[84px]" style={{ boxShadow: '0 24px 48px -12px rgba(14,16,32,0.15)' }}>
            <div className="cc-scan-line" />
            <div className="flex items-center justify-between px-[18px] py-3 bg-corbeau/[0.02] border-b border-corbeau/[0.06]">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <span className="font-mono text-[0.7rem] text-silver ml-2.5">agent.erp — agentic pipeline</span>
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] text-brand-green font-semibold">
                <span className="w-[5px] h-[5px] rounded-full bg-brand-green animate-pulse-dot" />
                LIVE
              </span>
            </div>
            <div className="p-5 font-mono text-[0.78rem] leading-[1.7]">
              {TERMINAL_LINES.map((line, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <span className="text-papaya font-semibold shrink-0">▶</span>
                  <span className="text-night">{line.content}</span>
                </div>
              ))}
              <hr className="border-t border-corbeau/[0.06] my-3" />
              <p className="font-mono text-[0.6rem] text-silver uppercase tracking-[1.5px] mb-2 cc-cursor">AI Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {STACK_TAGS.map((t) => (
                  <span
                    key={t.label}
                    className="font-mono text-[0.65rem] px-2.5 py-1 rounded font-medium"
                    style={tagStyle(t.type)}
                  >
                    {t.label}
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
