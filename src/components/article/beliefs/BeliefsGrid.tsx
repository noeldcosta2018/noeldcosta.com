import FadeUp from "@/components/article/FadeUp";
import { BELIEFS, type Belief } from "./data";

/**
 * Renders the five "What I believe" opinions as cards instead of
 * five identical stacked H3 + paragraph blocks. Reuses the home-page
 * Credentials.tsx card shell (paper bg, corbeau/[0.06] border,
 * rounded-xl, hover-lift) and the AICapabilities.tsx icon-tile
 * pattern, swapping the SVG icon for a numeral so no new tokens are
 * introduced.
 *
 * Grid: 2-col on lg+, 1-col on mobile. The fifth card spans both
 * columns so it acts as the closer rather than stranding alone.
 */

function Card({ b }: { b: Belief }) {
  return (
    <FadeUp
      as="section"
      className="rounded-xl bg-paper border border-corbeau/[0.06] p-6 md:p-7 transition-all hover:border-papaya/40 hover:shadow-[0_4px_20px_rgba(14,16,32,0.04)] h-full flex flex-col"
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-[10px] flex items-center justify-center text-papaya font-display font-black text-[1.05rem] shrink-0"
          style={{ background: "rgba(252,152,90,0.08)" }}
        >
          {b.num}
        </div>
        <p className="font-mono text-[0.65rem] font-medium tracking-[2px] uppercase text-silver">
          I believe
        </p>
      </div>
      <h3 className="font-display font-bold text-corbeau text-[1.02rem] md:text-[1.1rem] tracking-[-0.02em] leading-tight mb-3">
        {b.title}
      </h3>
      <p className="text-night text-[0.9rem] md:text-[0.94rem] leading-[1.65]">
        {b.body}
      </p>
    </FadeUp>
  );
}

export default function BeliefsGrid() {
  return (
    <div className="not-prose my-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {BELIEFS.map((b, i) => (
          <div
            key={b.num}
            className={i === BELIEFS.length - 1 ? "lg:col-span-2" : ""}
          >
            <Card b={b} />
          </div>
        ))}
      </div>
    </div>
  );
}
