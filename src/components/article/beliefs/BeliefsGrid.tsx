import FadeUp from "@/components/article/FadeUp";
import { BELIEFS, type Belief } from "./data";

/**
 * Renders the five "What I believe" opinions as numbered cards instead of
 * five identical stacked H3 + paragraph blocks. The fifth card spans both
 * columns on wide screens so it closes the set rather than standing alone.
 */

function Card({ b }: { b: Belief }) {
  return (
    <div className="nd-card nd-glow">
      <div className="top">
        <span className="num">{b.num}</span>
        <span className="nd-label">I believe</span>
      </div>
      <h3>{b.title}</h3>
      <p className="text">{b.body}</p>
    </div>
  );
}

export default function BeliefsGrid() {
  return (
    <FadeUp as="section" className="not-prose nd-block nd-beliefs">
      {BELIEFS.map((b, i) => (
        <div key={b.num} className={i === BELIEFS.length - 1 ? "wide" : undefined}>
          <Card b={b} />
        </div>
      ))}
    </FadeUp>
  );
}
