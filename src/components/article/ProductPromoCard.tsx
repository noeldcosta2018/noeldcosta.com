import Link from "next/link";

type Tone = "dark" | "light";

/**
 * In-article product / service reference. Intentionally small and editorial,
 * not banner-shaped. Two tones:
 *   - dark  → thin corbeau block, used once mid-article (Command Centre)
 *   - light → paper surface with a papaya side-rule, used for secondary
 *             references (ERPCV)
 *
 * Compared to a traditional "promo card": no large padding, no glow, no
 * gradient, no oversized CTA button. The entire block reads as a sidebar
 * mention the author chose to include, not as an inserted ad.
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

  const outerClass = isDark
    ? "my-10 rounded-xl bg-corbeau text-bone p-6 md:p-7 border border-corbeau"
    : "my-10 rounded-xl bg-paper border border-corbeau/[0.08] p-6 md:p-7 border-l-[3px] border-l-papaya";

  const kickerClass = isDark
    ? "font-mono text-[0.65rem] font-medium tracking-[2px] uppercase text-papaya"
    : "font-mono text-[0.65rem] font-medium tracking-[2px] uppercase text-papaya";

  const titleClass = isDark
    ? "font-display font-black text-bone text-[1.2rem] md:text-[1.35rem] leading-[1.2] tracking-[-0.02em]"
    : "font-display font-black text-corbeau text-[1.2rem] md:text-[1.35rem] leading-[1.2] tracking-[-0.02em]";

  const descClass = isDark
    ? "text-bone/80 text-[0.95rem] leading-[1.65]"
    : "text-night text-[0.95rem] leading-[1.65]";

  const ctaClass = isDark
    ? "inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[1.6px] font-semibold text-papaya hover:text-bone transition-colors"
    : "inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[1.6px] font-semibold text-corbeau hover:text-papaya transition-colors";

  const body = (
    <div className="flex flex-col gap-3">
      <p className={kickerClass}>{kicker}</p>
      <h4 className={titleClass}>{title}</h4>
      <p className={descClass}>{description}</p>
      <div className="pt-1">
        {external ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={ctaClass}
          >
            {cta} <span aria-hidden>→</span>
          </a>
        ) : (
          <Link href={href} className={ctaClass}>
            {cta} <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </div>
  );

  return <aside className={outerClass}>{body}</aside>;
}
