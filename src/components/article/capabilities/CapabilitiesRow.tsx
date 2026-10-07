import FadeUp from "@/components/article/FadeUp";
import { CAPABILITIES } from "./data";

/**
 * Three-column capability cards for the "What I do" section: icon tile,
 * title and body. The icon tile fills with the accent on hover; the card
 * border lights from the pointer layer (nd-glow).
 */

export default function CapabilitiesRow() {
  return (
    <FadeUp as="section" className="not-prose nd-block nd-capabilities">
      {CAPABILITIES.map((c) => (
        <div key={c.title} className="nd-card nd-glow">
          <span className="ico" aria-hidden="true">
            {c.icon}
          </span>
          <h3>{c.title}</h3>
          <p className="text">{c.body}</p>
        </div>
      ))}
    </FadeUp>
  );
}
