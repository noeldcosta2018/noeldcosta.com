import FadeUp from "@/components/article/FadeUp";

/**
 * Credibility stat strip for the About / story page. Four tiles with
 * the headline numbers a CFO scans for in the first 30 seconds.
 *
 * Numbers sourced from BRAND.md only. No invented figures. The 50%
 * cost reduction / 40% revenue growth claims that appear on the old
 * WordPress page are deliberately omitted until they're backed by a
 * named programme, per the CLAUDE.md no-invention rule.
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
    <FadeUp as="section" className="not-prose nd-cred">
      {STATS.map((s) => (
        <div key={s.label} className="nd-card">
          <span className="v">{s.value}</span>
          <span className="k">{s.label}</span>
        </div>
      ))}
    </FadeUp>
  );
}
