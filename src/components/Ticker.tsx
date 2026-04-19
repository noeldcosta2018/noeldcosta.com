const ITEMS = [
  { mod: "SAP S/4HANA", txt: "ECC Migration", badge: "LIVE", type: "g" },
  { mod: "EDGE Group", txt: "25 Entities → 1 ERP", badge: "$60M SAVED", type: "p" },
  { mod: "Agentic AI", txt: "SAP BTP + Business AI", badge: "ACTIVE", type: "g" },
  { mod: "Etihad Airways", txt: "Route Profitability", badge: "$400M+", type: "p" },
  { mod: "Command Central", txt: "ERP Tracking Tool", badge: "BUILT", type: "g" },
  { mod: "ERPCV", txt: "1,200+ Career Packs", badge: "89% MORE INTERVIEWS", type: "p" },
  { mod: "DXC Technology", txt: "800+ Consultants", badge: "$300M", type: "p" },
];

function TickerItem({ mod, txt, badge, type }: (typeof ITEMS)[0]) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap font-mono text-[0.7rem] font-medium tracking-[0.5px]">
      <span className="text-papaya uppercase">{mod}</span>
      <span className="w-[3px] h-[3px] rounded-full bg-silver" />
      <span className="text-moon">{txt}</span>
      <span
        className={`text-[0.62rem] px-[7px] py-[2px] rounded-[3px] font-semibold tracking-[0.5px] ${
          type === "g"
            ? "text-brand-green"
            : "text-papaya"
        }`}
        style={{
          background:
            type === "g" ? "rgba(34,197,94,0.12)" : "rgba(252,152,90,0.15)",
        }}
      >
        {badge}
      </span>
    </div>
  );
}

export default function Ticker() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div
      className="bg-corbeau border-b border-white/[0.06] py-[10px] overflow-hidden"
    >
      <div
        className="flex w-max gap-10 animate-tick-scroll"
      >
        {doubled.map((item, i) => (
          <TickerItem key={i} {...item} />
        ))}
      </div>
    </div>
  );
}
