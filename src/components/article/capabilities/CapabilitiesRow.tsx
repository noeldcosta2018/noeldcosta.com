import FadeUp from "@/components/article/FadeUp";
import { CAPABILITIES, type Capability } from "./data";

/**
 * Three-column capability-card row for the "What I do" section.
 * Reuses the home-page ServiceCard hover pattern (top gradient line,
 * card lift, papaya border tint, shadow grow) but on the page's light
 * cream background — paper card on bone page, matching the Credentials
 * grid pattern used elsewhere on the home page.
 *
 * Hover (same language as ProgrammesList for consistency on this page):
 *   - card lifts -translate-y-1, shadow grows
 *   - border tints to papaya/30
 *   - papaya→canyon accent line fades in along the top
 *   - icon tile flips to solid papaya with paper-color icon
 *   - title shifts to papaya
 *
 * No new tokens. Every value already exists in globals.css.
 */

/**
 * Map an iconMotion enum to the Tailwind hover-transform class. Kept
 * as an explicit map so Tailwind's JIT can statically detect every
 * class string at build time (dynamic class strings get purged).
 */
function iconMotionClass(motion: Capability["iconMotion"]): string {
  switch (motion) {
    case "rotate-180":
      return "group-hover:rotate-180";
    case "translate-x-1":
      return "group-hover:translate-x-1";
    case "rotate-45":
      return "group-hover:rotate-45";
  }
}

function Card({ c, index }: { c: Capability; index: number }) {
  return (
    <FadeUp
      as="section"
      delay={index * 90}
      className="group relative bg-paper border border-corbeau/[0.06] rounded-xl p-6 md:p-7 overflow-hidden flex flex-col h-full transition-all duration-300 hover:bg-corbeau hover:border-papaya/60 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(14,16,32,0.25)]"
    >
      {/* Papaya→canyon accent line at the top, fades in and slides
          across on hover. Mirrors ServiceCard's top-accent treatment. */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-papaya to-canyon scale-x-0 origin-left opacity-0 group-hover:scale-x-100 group-hover:opacity-100 transition-all duration-500 ease-out"
      />

      {/* Soft papaya halo behind the icon tile — bloomier when the card
          flips to dark, so the icon reads as a glowing accent. */}
      <div className="relative mb-4">
        <div
          aria-hidden
          className="absolute inset-0 bg-papaya/40 rounded-[14px] scale-75 opacity-0 blur-xl group-hover:scale-150 group-hover:opacity-100 transition-all duration-500 ease-out"
        />
        <div
          className="relative w-11 h-11 rounded-[10px] flex items-center justify-center text-papaya bg-papaya/10 transition-all duration-300 group-hover:bg-papaya group-hover:text-corbeau group-hover:scale-110 group-hover:shadow-[0_6px_24px_rgba(252,152,90,0.55)]"
        >
          <span
            className={`inline-flex transition-transform duration-500 ease-out ${iconMotionClass(c.iconMotion)}`}
          >
            {c.icon}
          </span>
        </div>
      </div>

      <h3 className="font-display font-bold text-corbeau text-[1.02rem] md:text-[1.08rem] tracking-[-0.02em] leading-snug mb-2 transition-all duration-300 group-hover:text-bone group-hover:translate-x-0.5">
        {c.title}
      </h3>

      <p className="text-night text-[0.9rem] leading-[1.65] transition-colors duration-300 group-hover:text-moon">
        {c.body}
      </p>
    </FadeUp>
  );
}

export default function CapabilitiesRow() {
  return (
    <div className="not-prose my-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {CAPABILITIES.map((c, i) => (
          <Card key={c.title} c={c} index={i} />
        ))}
      </div>
    </div>
  );
}
