import type { HeadingEntry } from "@/lib/article-headings";

/**
 * Inline contents for screens under 1024px, where the side rail hides its
 * list. A native <details> disclosure: no JavaScript, crawlable, and the ids
 * are the same ToC ids the body renders (from extractHeadings).
 */
export default function MobileContents({
  headings,
  label,
}: {
  headings: readonly HeadingEntry[];
  label: string;
}) {
  if (!headings.length) return null;
  let h2 = 0;
  return (
    <details className="nd-mtoc">
      <summary>
        <span>{label}</span>
        <svg className="chev" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M1.5 3.5 5 7l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <ol>
        {headings.map((h) => {
          const sub = h.level === 3;
          const n = sub ? null : String(++h2).padStart(2, "0");
          return (
            <li key={h.id} className={sub ? "sub" : undefined}>
              <a href={`#${h.id}`}>
                {n && (
                  <span className="n" aria-hidden="true">
                    {n}
                  </span>
                )}
                <span>{h.text}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </details>
  );
}
