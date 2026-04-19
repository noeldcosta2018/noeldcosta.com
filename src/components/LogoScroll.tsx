const LOGOS = [
  "EDGE Group",
  "Etihad Airways",
  "DXC Technology",
  "Dept. of Gov. Enablement",
  "Technology Innovation Institute",
  "Protiviti",
  "ADNOC",
  "PIF Entities",
  "Pepsi",
  "P&G",
  "United Arab Bank",
  "Etoile Group",
];

export default function LogoScroll() {
  const doubled = [...LOGOS, ...LOGOS];
  return (
    <div
      className="bg-cream border-t border-b border-corbeau/[0.04]"
      style={{ padding: "2.5rem clamp(1.5rem,5vw,4rem)" }}
    >
      <p className="text-center font-mono text-[0.68rem] text-silver tracking-[2.5px] uppercase mb-5">
        Delivered for companies including
      </p>
      <div className="overflow-hidden">
        <div className="flex w-max gap-14 animate-logo-scroll items-center">
          {doubled.map((name, i) => (
            <span
              key={i}
              className="font-display font-bold text-[0.95rem] text-night whitespace-nowrap opacity-35 hover:opacity-70 transition-opacity tracking-[-0.01em]"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
