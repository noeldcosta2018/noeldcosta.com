import FadeUp from "@/components/article/FadeUp";
import { PROGRAMMES, type Programme } from "./data";

/**
 * Six lived-programme stories rendered as a TrackRecord-style
 * vertical list: per-story mono SECTOR · REGION tag on the left,
 * categorisation badge on the right (papaya / green / canyon —
 * same three colours TrackRecord.tsx uses on the home page), then
 * Epilogue title and body paragraph(s). Thin papaya rule between
 * rows so the section reads as discrete cards instead of a wall
 * of identical H3 + paragraph blocks.
 *
 * No new tokens introduced. Reuses badgeStyle palette and row
 * scaffolding from TrackRecord.tsx verbatim, only swapping the
 * row separator from corbeau/[0.06] to papaya/25 per request.
 */

function badgeStyle(type: Programme["badgeType"]) {
  if (type === "g")
    return { background: "rgba(34,197,94,0.12)", color: "#22c55e" };
  if (type === "c")
    return { background: "rgba(226,130,107,0.12)", color: "#e2826b" };
  return { background: "rgba(252,152,90,0.12)", color: "#fc985a" };
}

function Row({ p, first }: { p: Programme; first: boolean }) {
  // Hover language matches the home page: short transitions on colour
  // tokens already in the palette (cream tint background, papaya
  // accent shift on the title and the mono tag, papaya hairline
  // brightens). No movement on the badge or body — those stay stable
  // so the row never feels like it's drifting. Adds a small left
  // papaya accent bar that animates in from 0 to full height.
  return (
    <FadeUp
      as="section"
      className={`group relative cursor-default px-4 py-6 -mx-4 rounded-lg transition-all duration-200 ease-out hover:bg-cream/70 ${
        first ? "pt-0" : "border-t border-papaya/25 hover:border-papaya/60"
      }`}
    >
      {/* Animated left accent bar — hidden by default, slides up to full
          height on hover. Mirrors the home page's papaya-as-pointer pattern. */}
      <span
        aria-hidden
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 bg-papaya rounded-full transition-all duration-300 ease-out group-hover:h-[60%]"
      />

      <div className="flex justify-between items-center gap-3 mb-1.5">
        <span className="font-mono text-[0.65rem] uppercase tracking-[2px] text-eyebrow transition-colors duration-200 group-hover:text-papaya">
          {p.sectorRegion}
        </span>
        <span
          className="font-mono text-[0.62rem] px-2 py-0.5 rounded font-semibold uppercase tracking-[1.5px] shrink-0 transition-transform duration-200 group-hover:scale-105"
          style={badgeStyle(p.badgeType)}
        >
          {p.badge}
        </span>
      </div>
      <h3 className="font-display text-[1.1rem] md:text-[1.18rem] font-bold tracking-[-0.02em] text-corbeau mb-2 transition-all duration-200 group-hover:text-papaya group-hover:translate-x-1">
        {p.title}
      </h3>
      {p.body.map((para, i) => (
        <p
          key={i}
          className="text-night text-[0.92rem] leading-[1.65] mt-2 first:mt-0"
        >
          {para}
        </p>
      ))}
    </FadeUp>
  );
}

export default function ProgrammesList() {
  return (
    <div className="not-prose my-8">
      <div className="flex flex-col">
        {PROGRAMMES.map((p, i) => (
          <Row key={p.title} p={p} first={i === 0} />
        ))}
      </div>
    </div>
  );
}
