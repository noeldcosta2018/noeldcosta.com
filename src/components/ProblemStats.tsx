const STATS = [
  {
    num: "70",
    unit: "%",
    color: "text-papaya",
    text: "of ERP projects go over budget or miss their deadline.",
    src: "Panorama Consulting, 2024",
  },
  {
    num: "$4.5",
    unit: "M",
    color: "text-corbeau",
    text: "average cost overrun on mid-market S/4HANA migrations.",
    src: "Resulting IT, 2024",
  },
  {
    num: "53",
    unit: "%",
    color: "text-canyon",
    text: "of companies say ERP failed to deliver expected business value.",
    src: "Gartner Research, 2023",
  },
];

export default function ProblemStats() {
  return (
    <section
      className="bg-bone"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.68rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          [ The problem ]
        </p>
        <h2
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
          style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
        >
          Most ERP projects fail.{" "}
          <span className="cc-emphasis-italic">
            Yours doesn&apos;t have to.
          </span>
        </h2>
        <p className="text-night text-[1rem] max-w-[520px] leading-[1.7]">
          You already know this. The numbers just confirm it.
        </p>

        <div className="grid grid-cols-3 mt-14 max-md:grid-cols-1 max-md:gap-8">
          {STATS.map((s, i) => (
            <div
              key={i}
              className={`max-md:border-l-0 max-md:pl-0 max-md:border-b max-md:border-corbeau/[0.08] max-md:pb-8 last:border-b-0 last:pb-0 ${
                i === 0
                  ? "pl-0"
                  : "pl-[clamp(1rem,3vw,2.5rem)] border-l border-corbeau/[0.1]"
              }`}
            >
              <div
                className={`font-display font-black leading-none tracking-[-0.04em] ${s.color}`}
                style={{ fontSize: "clamp(3rem,6vw,4.5rem)" }}
              >
                {s.num}
                <span style={{ fontSize: "0.55em", fontWeight: 700 }}>{s.unit}</span>
              </div>
              <p className="text-night text-[0.92rem] mt-2.5 max-w-[280px] leading-[1.55]">
                {s.text}
              </p>
              <p className="font-mono text-[0.65rem] text-silver mt-2">{s.src}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
