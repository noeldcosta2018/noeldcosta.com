import Link from "next/link";

type Tone = "dark" | "light";

/**
 * In-article product reference. Editorial tone, clear sales intent:
 *   - dark  → corbeau block with bright papaya solid button (Command Centre)
 *   - light → paper surface + papaya side-rule, papaya outlined button (ERPCV)
 *
 * The CTA is deliberately obvious — these appear inside a long read and
 * need to hold attention without looking like an ad unit. The papaya button
 * matches the Hero's primary CTA pattern so it reads as "a real product the
 * author built" rather than a display ad.
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
    ? "my-12 rounded-[20px] bg-corbeau text-bone p-7 md:p-9 border border-corbeau shadow-[0_12px_40px_rgba(14,16,32,0.15)] overflow-hidden relative"
    : "my-12 rounded-[20px] bg-paper border border-corbeau/[0.08] p-7 md:p-9 border-l-[4px] border-l-papaya shadow-[0_2px_20px_rgba(14,16,32,0.04)]";

  const kickerClass =
    "font-mono text-[0.65rem] font-medium tracking-[2.4px] uppercase text-papaya";

  const titleClass = isDark
    ? "font-display font-black text-bone text-[1.5rem] md:text-[1.8rem] leading-[1.1] tracking-[-0.025em]"
    : "font-display font-black text-corbeau text-[1.5rem] md:text-[1.8rem] leading-[1.1] tracking-[-0.025em]";

  const descClass = isDark
    ? "text-bone/75 text-[1rem] leading-[1.65] max-w-[48ch]"
    : "text-night text-[1rem] leading-[1.65] max-w-[48ch]";

  // Primary sales CTA — solid papaya, matches the Hero's primary-CTA pattern.
  const primaryBtn =
    "inline-flex items-center gap-2 bg-papaya text-corbeau font-display font-bold px-6 py-3 rounded-[10px] text-[0.95rem] tracking-[-0.01em] shadow-[0_4px_18px_rgba(252,152,90,0.25)] hover:-translate-y-px hover:shadow-[0_8px_30px_rgba(252,152,90,0.35)] hover:bg-[#fda66e] transition-all";

  // Secondary "visit domain" hint underneath the button — visual context so
  // the user knows where the button will take them before they click.
  const domainHint = (() => {
    try {
      return new URL(href).host.replace(/^www\./, "");
    } catch {
      return href;
    }
  })();

  const domainClass = isDark
    ? "font-mono text-[0.7rem] uppercase tracking-[1.6px] text-bone/50"
    : "font-mono text-[0.7rem] uppercase tracking-[1.6px] text-corbeau/50";

  const CtaInner = (
    <>
      {cta}
      <span aria-hidden className="text-[1.1em] leading-none">→</span>
    </>
  );

  const CtaNode = external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={primaryBtn}
    >
      {CtaInner}
    </a>
  ) : (
    <Link href={href} className={primaryBtn}>
      {CtaInner}
    </Link>
  );

  return (
    <aside className={outerClass}>
      {isDark && (
        <span
          aria-hidden
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-papaya/10 blur-2xl"
        />
      )}
      <div className="relative flex flex-col gap-3">
        <p className={kickerClass}>{kicker}</p>
        <h4 className={titleClass}>{title}</h4>
        <p className={descClass}>{description}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3">
          {CtaNode}
          <span className={domainClass}>{domainHint}</span>
        </div>
      </div>
    </aside>
  );
}
