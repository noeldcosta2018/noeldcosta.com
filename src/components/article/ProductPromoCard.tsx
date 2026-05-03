import Link from "next/link";
import FadeUp from "@/components/article/FadeUp";

type Tone = "dark" | "light";

/**
 * In-article product reference. Editorial tone, clear sales intent:
 *   - dark  → corbeau block with bright papaya solid button (Command Centre)
 *   - light → paper surface + papaya side-rule, papaya outlined button (ERPCV)
 *
 * Pass `image` (a /public-relative path) to render a screenshot panel flush
 * against the right edge of the dark card. Content shifts left to make room.
 */
export default function ProductPromoCard({
  kicker,
  title,
  description,
  href,
  cta = "Learn more",
  external = false,
  tone = "light",
  image,
}: {
  kicker: string;
  title: string;
  description: string;
  href: string;
  cta?: string;
  external?: boolean;
  tone?: Tone;
  image?: string;
}) {
  const isDark = tone === "dark";
  const hasImage = isDark && !!image;

  const outerClass = isDark
    ? "my-12 rounded-[20px] bg-corbeau text-bone border border-corbeau shadow-[0_12px_40px_rgba(14,16,32,0.15)] overflow-hidden relative transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:shadow-[0_28px_72px_rgba(14,16,32,0.32)]"
    : "my-12 rounded-[20px] bg-paper border border-corbeau/[0.08] p-7 md:p-9 border-l-[4px] border-l-papaya shadow-[0_2px_20px_rgba(14,16,32,0.04)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:shadow-[0_20px_48px_rgba(252,152,90,0.22)]";

  // Dark card padding applied inline so we can skip it on the image-panel side
  const innerPad = isDark ? "p-7 md:p-9" : "";

  const kickerClass =
    "font-mono text-[0.65rem] font-medium tracking-[2.4px] uppercase text-papaya";

  const titleClass = isDark
    ? "font-display font-black text-bone text-[1.5rem] md:text-[1.8rem] leading-[1.1] tracking-[-0.025em]"
    : "font-display font-black text-corbeau text-[1.5rem] md:text-[1.8rem] leading-[1.1] tracking-[-0.025em]";

  const descClass = isDark
    ? "text-bone/75 text-[1rem] leading-[1.65] max-w-[48ch]"
    : "text-night text-[1rem] leading-[1.65] max-w-[48ch]";

  const primaryBtn =
    "inline-flex items-center gap-2 bg-papaya text-corbeau font-display font-bold px-6 py-3 rounded-[10px] text-[0.95rem] tracking-[-0.01em] shadow-[0_4px_18px_rgba(252,152,90,0.25)] hover:-translate-y-px hover:shadow-[0_8px_30px_rgba(252,152,90,0.35)] hover:bg-[#fda66e] transition-all";

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
    <FadeUp>
    <aside className={outerClass} style={hasImage ? { minHeight: "240px" } : undefined}>
      {isDark && (
        <span
          aria-hidden
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-papaya/10 blur-2xl pointer-events-none"
        />
      )}

      {/* Dashboard / product screenshot panel — absolute right edge */}
      {hasImage && (
        <div
          aria-hidden
          className="hidden md:block absolute right-0 top-0 bottom-0 w-[240px]"
          style={{
            backgroundImage: `url('${image}')`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        >
          {/* left-edge fade so content text doesn't collide with the image */}
          <div
            className="absolute inset-y-0 left-0 w-16"
            style={{
              background:
                "linear-gradient(to right, #0e1020 0%, transparent 100%)",
            }}
          />
        </div>
      )}

      <div
        className={[
          "relative flex flex-col gap-3",
          innerPad,
          hasImage ? "md:mr-[240px]" : "",
        ].join(" ")}
      >
        <p className={kickerClass}>{kicker}</p>
        <h4 className={titleClass}>{title}</h4>
        <p className={descClass}>{description}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3">
          {CtaNode}
          <span className={domainClass}>{domainHint}</span>
        </div>
      </div>
    </aside>
    </FadeUp>
  );
}
