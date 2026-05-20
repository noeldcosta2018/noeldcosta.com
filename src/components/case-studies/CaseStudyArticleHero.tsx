import Image from "next/image";
import Link from "next/link";
import {
  INDUSTRY_LABEL,
  REGION_LABEL,
  type CaseStudy,
} from "@/lib/case-studies";

/**
 * Article hero for an individual case-study page.
 *
 * Replaces the generic ArticleHero (which centres the title above the
 * hero image) with the case-study format from the brief:
 *
 *  - Full-width cover image (16:9 on desktop, 4:3 on mobile)
 *  - Mono client tag overlaid above the headline
 *  - Headline overlaid on bottom-left in display font
 *  - Headline stat as a floating glass card in the bottom-right corner
 *  - Meta strip below the hero (Client / Industry / Region / Duration / Role)
 *
 * View Transitions: the cover image carries a unique view-transition-name
 * matching the case-study card on the index page, so the navigation
 * from /category/case-studies into this article feels like the card
 * grew into the hero (Chrome 126+; gracefully no-ops elsewhere).
 *
 * No client JS needed — pure server-rendered DOM with one Next/Image.
 */
export default function CaseStudyArticleHero({ c }: { c: CaseStudy }) {
  const tag = [c.client.label, INDUSTRY_LABEL[c.industry], REGION_LABEL[c.region]]
    .filter(Boolean)
    .join(" · ")
    .toUpperCase();

  return (
    <>
      {/* Cover image band */}
      <section className="relative w-full bg-corbeau overflow-hidden">
        <div
          className="relative w-full aspect-[4/3] md:aspect-[21/9]"
          style={{
            // Shared element name for the View Transitions API.
            // Matches the corresponding card on the portfolio page.
            viewTransitionName: `case-${c.slug}`,
          } as React.CSSProperties}
        >
          <Image
            src={c.cover.src}
            alt={c.cover.alt}
            fill
            priority
            quality={75}
            sizes="100vw"
            className="object-cover"
          />
          {/* Bottom-up dark scrim so the overlay text always passes contrast.
              The gradient stops are tuned so the top 40 % of the image stays
              clean (the bottom is where the headline lives). */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(14,16,32,0.78) 0%, rgba(14,16,32,0.55) 30%, rgba(14,16,32,0.10) 60%, rgba(14,16,32,0) 100%)",
            }}
          />

          {/* Overlay content — anchored bottom-left + bottom-right */}
          <div className="absolute inset-x-0 bottom-0">
            <div className="max-w-[1200px] mx-auto px-[clamp(1.5rem,5vw,4rem)] pb-[clamp(2rem,4vw,3.5rem)]">
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-6 items-end">
                {/* Headline + tag */}
                <div className="max-w-[760px]">
                  <p className="font-mono text-[0.7rem] tracking-[2.2px] uppercase text-papaya mb-3">
                    {tag}
                  </p>
                  <h1
                    className="font-display font-black tracking-[-0.025em] leading-[1.05] text-bone"
                    style={{ fontSize: "clamp(1.85rem,4.5vw,3.2rem)" }}
                  >
                    {c.headline.primary}{" "}
                    <span className="cc-emphasis-italic">{c.headline.italic}</span>
                  </h1>
                </div>

                {/* Floating glass stat card */}
                <div
                  className="shrink-0 self-end rounded-2xl px-5 py-4 md:min-w-[180px] border border-white/15"
                  style={{
                    background: "rgba(244, 237, 228, 0.10)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                  }}
                >
                  <p className="font-display font-black text-papaya tabular-nums leading-none tracking-[-0.02em] text-[2rem] md:text-[2.4rem]">
                    {c.headlineStat.value}
                  </p>
                  <p className="font-mono text-[0.66rem] uppercase tracking-[1.6px] text-bone/80 mt-2 leading-tight max-w-[180px]">
                    {c.headlineStat.label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meta strip — sits under the hero on light background */}
      <section className="bg-bone border-b border-corbeau/[0.06]">
        <div className="max-w-[1200px] mx-auto px-[clamp(1.5rem,5vw,4rem)] py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-4">
            <MetaItem label="Client" value={c.client.label} />
            <MetaItem label="Industry" value={INDUSTRY_LABEL[c.industry]} />
            <MetaItem label="Region" value={REGION_LABEL[c.region]} />
            <MetaItem label="Duration" value={c.duration} />
            <MetaItem label="My role" value={c.role} />
          </div>
        </div>
      </section>

      {/* Breadcrumb-as-back-link, sits inside the article container in the
          parent component; left here so consumers don't have to wire it. */}
      <nav aria-label="Breadcrumb" className="bg-bone">
        <div className="max-w-[1200px] mx-auto px-[clamp(1.5rem,5vw,4rem)] pt-4">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.7rem] tracking-[2px] uppercase">
            <li>
              <Link
                href="/category/case-studies"
                className="inline-flex items-center min-h-[44px] -ml-2 px-2 text-eyebrow hover:text-papaya transition-colors"
              >
                ← All case studies
              </Link>
            </li>
          </ol>
        </div>
      </nav>
    </>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[0.65rem] tracking-[1.8px] uppercase text-eyebrow mb-1">
        {label}
      </p>
      <p className="text-corbeau text-[0.94rem] font-semibold leading-snug">{value}</p>
    </div>
  );
}
