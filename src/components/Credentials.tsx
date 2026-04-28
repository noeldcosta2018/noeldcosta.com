const CREDS = [
  {
    title: "CIMA & AICPA",
    sub: "Management Accounting",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10M18 20V4M6 20v-4"/>
      </svg>
    ),
  },
  {
    title: "Masters in Accounting",
    sub: "Finance depth, not surface",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c0 1 4 3 6 3s6-2 6-3v-5"/>
      </svg>
    ),
  },
  {
    title: "SAP Certified PM",
    sub: "Activate · SAFe · ITIL",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/>
      </svg>
    ),
  },
  {
    title: "Solution Architect",
    sub: "End-to-end system design",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <path d="M12 12h.01M17 12h.01M7 12h.01"/>
      </svg>
    ),
  },
];

export default function Credentials() {
  return (
    <section
      className="bg-bone"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.68rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          [ 06 · Why this works ]
        </p>
        <h2
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
          style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
        >
          Not just a tech guy.{" "}
          <span className="cc-emphasis-italic">I understand the numbers.</span>
        </h2>
        <p className="text-night text-[1rem] max-w-[520px] leading-[1.7] mb-10">
          Most SAP consultants understand the system. Few understand the
          business. I have both.
        </p>

        <div className="grid grid-cols-4 gap-3.5 max-lg:grid-cols-2 max-sm:grid-cols-2">
          {CREDS.map((c) => (
            <div
              key={c.title}
              className="bg-paper border border-corbeau/[0.06] rounded-xl px-5 py-6 text-center transition-all hover:border-corbeau/[0.12] hover:shadow-[0_4px_20px_rgba(14,16,32,0.04)]"
            >
              <div
                className="w-11 h-11 rounded-[10px] flex items-center justify-center mx-auto mb-2.5 text-papaya"
                style={{ background: "rgba(252,152,90,0.08)" }}
              >
                {c.icon}
              </div>
              <h4 className="font-display text-[0.92rem] font-bold mb-0.5">{c.title}</h4>
              <p className="font-mono text-[0.68rem] text-silver">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
