import FadeUp from "@/components/article/FadeUp";

/**
 * Executive summary near the top of an article: the frontmatter
 * keyTakeaways as a numbered list on a highlighted tile. One restrained
 * reveal for the whole block, not per item.
 */
export default function KeyTakeaways({
  title = "Key takeaways",
  items,
}: {
  title?: string;
  items: string[];
}) {
  if (!items.length) return null;
  return (
    <FadeUp>
      <aside className="nd-takeaways" aria-label={title}>
        <p className="nd-takeaways-label">{title}</p>
        <ol className="nd-takeaways-list">
          {items.map((item, i) => (
            <li key={i}>
              <span className="n" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </aside>
    </FadeUp>
  );
}
