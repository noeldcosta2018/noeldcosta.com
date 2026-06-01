import { type Locale } from "@/lib/locales";
import { getMessages } from "@/lib/i18n/useTranslation";

export default function ProblemStats({ locale = "en" }: { locale?: Locale }) {
  const m = getMessages(locale);
  // Numeric values stay inline — locale-agnostic numerals + units.
  // Body text + citation come from MESSAGES; the citation strings are
  // research-house names (proper nouns) but stay in MESSAGES because the
  // year suffix ("2024", "2023") is the only locale-variable part.
  const STATS = [
    {
      num: "70",
      unit: "%",
      color: "text-papaya",
      text: m.problemStats.stat1Body,
      src: m.problemStats.stat1Source,
    },
    {
      num: "$4.5",
      unit: "M",
      color: "text-corbeau",
      text: m.problemStats.stat2Body,
      src: m.problemStats.stat2Source,
    },
    {
      num: "53",
      unit: "%",
      color: "text-canyon",
      text: m.problemStats.stat3Body,
      src: m.problemStats.stat3Source,
    },
  ];

  return (
    <section
      className="bg-bone"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          {m.problemStats.eyebrow}
        </p>
        <h2
          aria-label={`${m.problemStats.h2Lead} ${m.problemStats.h2Emphasis}`}
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
          style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
        >
          <span aria-hidden>
            {`${m.problemStats.h2Lead} `}
            <span className="cc-emphasis-italic">
              {m.problemStats.h2Emphasis}
            </span>
          </span>
        </h2>
        <p className="text-night text-[1rem] max-w-[520px] leading-[1.7]">
          {m.problemStats.intro}
        </p>

        <div className="grid grid-cols-3 mt-14 max-md:grid-cols-1 max-md:gap-8">
          {STATS.map((s, i) => (
            <div
              key={i}
              className={`max-md:border-s-0 max-md:ps-0 max-md:border-b max-md:border-corbeau/[0.08] max-md:pb-8 last:border-b-0 last:pb-0 ${
                i === 0
                  ? "ps-0"
                  : "ps-[clamp(1rem,3vw,2.5rem)] border-s border-corbeau/[0.1]"
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
              <p className="font-mono text-[0.72rem] text-eyebrow mt-2">{s.src}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
