/**
 * Hand-drawn marks used across the site. The sprite is copied unchanged from
 * the approved style reference (ai-ready-style-reference.html) and rendered
 * once by the root layouts; every doodle is a <use> of one of its symbols,
 * stroked in currentColor. All decorative. Styles: nd-doodles.css.
 */

const SPRITE = `<defs>
    <symbol id="d-arrow-swoop" viewBox="0 0 140 110"><path pathLength="1" d="M8 10 C 14 58, 52 96, 122 88"/><path pathLength="1" d="M98 70 L124 88 L97 103"/></symbol>
    <symbol id="d-arrow-hook" viewBox="0 0 70 120"><path pathLength="1" d="M46 6 C 16 30, 12 72, 40 106"/><path pathLength="1" d="M20 97 L42 108 L45 83"/></symbol>
    <symbol id="d-arrow-loop" viewBox="0 0 160 90"><path pathLength="1" d="M6 66 C 30 22, 78 12, 80 40 C 82 62, 52 62, 58 42 C 66 16, 118 24, 146 58"/><path pathLength="1" d="M123 53 L148 60 L143 34"/></symbol>
    <symbol id="d-arrow-straight" viewBox="0 0 120 40"><path pathLength="1" d="M4 22 C 34 14, 74 27, 110 18"/><path pathLength="1" d="M92 5 L112 18 L95 33"/></symbol>
    <symbol id="d-arrow-down" viewBox="0 0 70 100"><path pathLength="1" d="M30 4 C 46 30, 22 54, 36 90"/><path pathLength="1" d="M16 72 L37 92 L54 68"/></symbol>
    <symbol id="d-scribble" viewBox="0 0 120 90"><path pathLength="1" d="M10 22 L112 6"/><path pathLength="1" d="M6 38 L116 20"/><path pathLength="1" d="M12 54 L110 37"/><path pathLength="1" d="M8 70 L114 52"/><path pathLength="1" d="M30 84 L112 68"/></symbol>
    <symbol id="d-underline" viewBox="0 0 240 24" preserveAspectRatio="none"><path pathLength="1" d="M4 13 C 50 4, 96 19, 140 10 S 210 6, 236 12"/><path pathLength="1" d="M22 20 C 80 14, 150 22, 220 17"/></symbol>
    <symbol id="d-circle" viewBox="0 0 220 90" preserveAspectRatio="none"><path pathLength="1" d="M118 7 C 44 2, 5 24, 9 48 C 13 76, 82 86, 132 82 C 188 78, 216 60, 210 38 C 204 13, 148 3, 86 11"/></symbol>
    <symbol id="d-tick" viewBox="0 0 48 40"><path pathLength="1" d="M5 22 L18 34 L43 5"/></symbol>
    <symbol id="d-cross" viewBox="0 0 44 44"><path pathLength="1" d="M7 6 L37 38"/><path pathLength="1" d="M38 7 L6 37"/></symbol>
    <symbol id="d-burst" viewBox="0 0 50 44"><path pathLength="1" d="M10 40 L3 21"/><path pathLength="1" d="M25 34 L25 6"/><path pathLength="1" d="M40 40 L47 21"/></symbol>
  </defs>`;

export type DoodleName =
  | "arrow-swoop"
  | "arrow-hook"
  | "arrow-loop"
  | "arrow-straight"
  | "arrow-down"
  | "scribble"
  | "underline"
  | "circle"
  | "tick"
  | "cross"
  | "burst";

/** Rendered once by each root layout, before any doodle. */
export function DoodleSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: SPRITE }} />
  );
}

/**
 * One hand-drawn mark. It draws itself the first time it is on screen
 * (PointerLayer); flip mirrors it. Arrows also mirror on right-to-left pages.
 */
export default function Doodle({ name, className, flip }: { name: DoodleName; className?: string; flip?: boolean }) {
  const cls = ["dd", name.startsWith("arrow") ? "dd-arrow" : "", flip ? "flip" : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <svg className={cls} aria-hidden="true" focusable="false">
      <use href={`#d-${name}`} />
    </svg>
  );
}

/**
 * A few handwritten words (Caveat), usually with an arrow to what they describe.
 * Decorative: hidden from assistive tech, and the page reads the same without it.
 */
export function HandNote({ text, className, children }: { text: string; className: string; children?: React.ReactNode }) {
  return (
    <p className={`nd-hand-note ${className}`} aria-hidden="true">
      <span className="nd-hand">{text}</span>
      {children}
    </p>
  );
}
