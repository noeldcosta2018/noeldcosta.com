import type { ReactNode } from "react";

/**
 * Editorial pull quote: one sentence from the article, set in the display
 * face with an accent rule. Used once per long post at most.
 */
export default function PullQuote({
  children,
  attribution,
}: {
  children: ReactNode;
  attribution?: string;
}) {
  return (
    <figure className="nd-pullquote">
      <blockquote>
        <p>{children}</p>
      </blockquote>
      {attribution && <figcaption>{attribution}</figcaption>}
    </figure>
  );
}
