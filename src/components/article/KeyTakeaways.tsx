/**
 * Executive summary card. Sits after the lead paragraph so a skimming reader
 * walks away with the thesis even if they never scroll.
 *
 * Deliberately uses the warmer `cream` tone rather than the page `bone` so it
 * reads as a distinct content block without needing a heavy border.
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
    <aside
      className="my-10 p-6 md:p-8 rounded-[14px] bg-cream border border-corbeau/[0.06]"
      aria-label={title}
    >
      <p className="font-mono text-[0.62rem] font-semibold tracking-[2.5px] uppercase text-papaya mb-4">
        {title}
      </p>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-corbeau leading-[1.6]">
            <span
              aria-hidden
              className="mt-[0.55rem] flex-shrink-0 w-1.5 h-1.5 rounded-full bg-papaya"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
