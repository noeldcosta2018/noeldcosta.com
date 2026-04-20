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
    <figure className="my-12 pl-8 md:pl-10 border-l-[3px] border-papaya relative">
      <span
        aria-hidden
        className="absolute -top-2 -left-2 font-display text-[4rem] leading-none text-papaya/20 select-none"
      >
        “
      </span>
      <blockquote className="font-display font-black text-corbeau text-[1.35rem] md:text-[1.55rem] leading-[1.3] tracking-[-0.02em]">
        {children}
      </blockquote>
      {attribution && (
        <figcaption className="mt-4 font-mono text-[0.68rem] uppercase tracking-[1.6px] text-silver">
          — {attribution}
        </figcaption>
      )}
    </figure>
  );
}
