import FadeUp from "@/components/article/FadeUp";
import { PROGRAMMES, type Programme } from "./data";

/**
 * Six lived-programme stories as a ruled vertical list: sector and region
 * tag, a categorisation chip (the dot colour carries the category), then
 * the title and body. An accent bar marks the row under the pointer.
 */

const CHIP_COLOUR: Record<Programme["badgeType"], string> = {
  p: "var(--accent)",
  g: "var(--area-data)",
  c: "var(--accent2)",
};

function Row({ p }: { p: Programme }) {
  return (
    <div className="nd-programme">
      <div className="meta">
        <span className="sector">{p.sectorRegion}</span>
        <span className="nd-chip">
          <i style={{ background: CHIP_COLOUR[p.badgeType] }} aria-hidden="true" />
          {p.badge}
        </span>
      </div>
      <h3>{p.title}</h3>
      {p.body.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
}

export default function ProgrammesList() {
  return (
    <FadeUp as="section" className="not-prose nd-block nd-programmes">
      {PROGRAMMES.map((p) => (
        <Row key={p.title} p={p} />
      ))}
    </FadeUp>
  );
}
