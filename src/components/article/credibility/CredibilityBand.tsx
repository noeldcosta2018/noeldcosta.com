import FadeUp from "@/components/article/FadeUp";

/**
 * Credibility stat strip for the About / story page. Four tiles with
 * the headline numbers a CFO scans for in the first 30 seconds.
 *
 * Numbers sourced from BRAND.md only. No invented figures. The 50%
 * cost reduction / 40% revenue growth claims that appear on the old
 * WordPress page are deliberately omitted until they're backed by a
 * named programme — per CLAUDE.md no-invention rule.
 *
 * Layout: 4-up grid on md+, 2x2 on mobile. Numbers in JetBrains Mono
 * with tabular-nums for clean alignment.
 */

interface Stat {
  value: string;
  label: string;
}

const STATS: Stat[] = [
  { value: "$700M+", label: "delivered in transformations" },
  { value: "25 yrs", label: "across ERP and AI programmes" },
  { value: "3", label: "credentials: CIMA · AICPA · MAcc" },
  { value: "6", label: "named clients: EDGE · Etihad · ADNOC · PIF · DXC · UAE Gov" },
];

export default function CredibilityBand() {
  return (
    <FadeUp as="section" className="not-prose mt-2 mb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-corbeau/10 bg-paper px-4 py-4 md:px-5 md:py-5 hover:border-papaya/40 transition-colors"
          >
            <p className="font-mono font-bold text-corbeau text-[1.45rem] md:text-[1.7rem] leading-none tabular-nums tracking-tight">
              {s.value}
            </p>
            <p className="mt-2 text-night/70 text-[0.74rem] md:text-[0.78rem] leading-snug">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </FadeUp>
  );
}
