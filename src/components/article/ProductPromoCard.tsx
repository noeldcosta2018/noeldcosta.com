import Link from "next/link";

type Tone = "dark" | "light";

/**
 * In-article product / service promotion card. Two tones:
 *   - dark  → high-contrast corbeau block, used once mid-article (Command Centre)
 *   - light → warm cream block, used for secondary mentions (ERPCV, services)
 *
 * The card never reads like a banner ad:
 *   - editorial label ("Built by Noel", "Tool", "Advisory")
 *   - no gradients, no exclamation marks, no "try free" language
 *   - copy stays under 220 characters
 *   - CTA is a low-volume underline link, not a shouty button
 */
export default function ProductPromoCard({
  kicker,
  title,
  description,
  href,
  cta = "Learn more",
  external = false,
  tone = "light",
}: {
  kicker: string;
  title: string;
  description: string;
  href: string;
  cta?: string;
  external?: boolean;
  tone?: Tone;
}) {
  const isDark = tone === "dark";

  return (
    <aside
      className={[
        "my-10 rounded-[14px] p-6 md:p-8",
        isDark
          ? "bg-corbeau text-bone border border-corbeau"
          : "bg-paper border border-corbeau/10",
      ].join(" ")}
    >
      <p
        className={[
          "font-mono text-[0.62rem] font-semibold tracking-[2.5px] uppercase mb-3",
          isDark ? "text-papaya" : "text-papaya",
        ].join(" ")}
      >
        {kicker}
      </p>
      <h4
        className={[
          "font-display font-bold tracking-[-0.015em] text-xl md:text-[1.45rem] leading-[1.2] mb-3",
          isDark ? "text-bone" : "text-corbeau",
        ].join(" ")}
      >
        {title}
      </h4>
      <p
        className={[
          "text-[0.97rem] leading-[1.65] mb-5 max-w-[40rem]",
          isDark ? "text-bone/80" : "text-night",
        ].join(" ")}
      >
        {description}
      </p>
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={[
            "inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[1.6px] font-semibold group",
            isDark
              ? "text-papaya hover:text-bone"
              : "text-corbeau hover:text-papaya",
          ].join(" ")}
        >
          <span className="border-b border-current pb-0.5">{cta}</span>
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </a>
      ) : (
        <Link
          href={href}
          className={[
            "inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[1.6px] font-semibold group",
            isDark
              ? "text-papaya hover:text-bone"
              : "text-corbeau hover:text-papaya",
          ].join(" ")}
        >
          <span className="border-b border-current pb-0.5">{cta}</span>
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      )}
    </aside>
  );
}
