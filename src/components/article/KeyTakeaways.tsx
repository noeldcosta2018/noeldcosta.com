"use client";

import FadeUp from "@/components/article/FadeUp";

/**
 * Executive summary card with staggered scroll-reveal per bullet.
 * Each item fades up 60ms after the previous, giving the list a
 * reading-speed cascade feel rather than everything popping at once.
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
      <aside
        className="my-10 p-6 md:p-8 rounded-xl bg-cream border border-corbeau/[0.06]"
        aria-label={title}
      >
        <p className="font-mono text-[0.68rem] font-medium tracking-[2px] uppercase text-papaya mb-4">
          {title}
        </p>
        <ul className="space-y-3">
          {items.map((item, i) => (
            <FadeUp key={i} delay={i * 60}>
              <li className="flex gap-3 text-corbeau leading-[1.6] text-[0.98rem]">
                <span
                  aria-hidden
                  className="mt-[0.55rem] flex-shrink-0 w-1.5 h-1.5 rounded-full bg-papaya"
                />
                <span>{item}</span>
              </li>
            </FadeUp>
          ))}
        </ul>
      </aside>
    </FadeUp>
  );
}
