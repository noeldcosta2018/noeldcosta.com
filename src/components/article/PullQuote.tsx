/**
 * Editorial pull quote — used sparingly to surface a single sentence insight.
 * Oversized Epilogue display face, papaya quote mark, no cite attribution
 * (these are the author's own words pulled from the article).
 */
export default function PullQuote({
  children,
  attribution,
}: {
  children: React.ReactNode;
  attribution?: string;
}) {
  return (
    <figure className="my-12 ps-8 md:ps-10 border-s-[3px] border-papaya relative">
      <span
        aria-hidden
        className="absolute -top-2 -start-2 font-display text-[4rem] leading-none text-papaya/20 select-none"
      >
        “
      </span>
      <blockquote className="font-display font-normal italic text-corbeau text-[1.35rem] md:text-[1.55rem] leading-[1.4] tracking-[-0.01em]">
        {children}
      </blockquote>
      {attribution && (
        <figcaption className="mt-4 font-mono text-[0.72rem] uppercase tracking-[1.6px] text-eyebrow">
          — {attribution}
        </figcaption>
      )}
    </figure>
  );
}
