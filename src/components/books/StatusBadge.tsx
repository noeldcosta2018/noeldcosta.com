/**
 * Status badge with a shape cue.
 *
 * The badge no longer relies on colour alone to signal availability:
 *   - "Available now" → filled solid 6px dot before the text
 *   - "Coming soon"  → unfilled 6px ring before the text
 *
 * Colour (papaya / silver) stays as a secondary cue but the shape carries
 * the semantic weight. Two surface variants: "light" for paper / bone
 * surfaces (BookCard, FeaturedBook) and "dark" for the corbeau PaidBook
 * panel.
 *
 * Server component. No client JS.
 */

export default function StatusBadge({
  available,
  surface = "light",
}: {
  available: boolean;
  surface?: "light" | "dark";
}) {
  const wrapper =
    surface === "dark"
      ? available
        ? "bg-[rgba(45,138,78,0.18)] text-[#7CC796]"
        : "bg-white/[0.08] text-moon"
      : available
        ? "bg-[rgba(45,138,78,0.12)] text-[#2D8A4E]"
        : "bg-corbeau/[0.06] text-eyebrow";

  return (
    <span
      className={`font-mono text-[0.66rem] tracking-[1.5px] uppercase px-2 py-0.5 rounded inline-flex items-center gap-1.5 ${wrapper}`}
    >
      <span
        aria-hidden
        className={`inline-block w-[6px] h-[6px] rounded-full ${
          available
            ? "bg-current"
            : "border border-current bg-transparent"
        }`}
      />
      {available ? "Available now" : "Coming soon"}
    </span>
  );
}
