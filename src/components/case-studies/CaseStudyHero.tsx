import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  INDUSTRY_LABEL,
  REGION_LABEL,
  type CaseStudy,
} from "@/lib/case-studies";
import NumberTicker from "./NumberTicker";

/**
 * Featured case-study hero. Sits at the top of the portfolio page.
 *
 * Entrance choreography uses the existing .cc-enter-up /
 * .cc-enter-up-word / .cc-enter-scale keyframes from globals.css
 * (same primitives the homepage hero uses). Stagger expressed via
 * inline animation-delay so the server-rendered initial state matches
 * the client hydration exactly — no flash, no hydration warning.
 *
 *   0 ms   eyebrow + mono tag fade up
 *   100 ms headline reveals word-by-word, 60 ms stagger
 *   ~700  ms italic emphasis lands as the final word
 *   900 ms outcome paragraph
 *   1100 ms stat row reveals stat-by-stat (80 ms stagger)
 *           — NumberTicker on each stat counts up on viewport enter
 *   1350 ms CTA button
 *   400 ms cover image fades in with scale 1.02 → 1.0 + Ken-Burns
 *           plays once over 10 s (.cc-ken-burns)
 *
 * Total: ~1.6 s. prefers-reduced-motion collapses every animation
 * via the global @media guard.
 *
 * Server component — no JS needed for the entrance. NumberTicker is
 * the only client-side piece (its own "use client").
 */

interface Props {
  c: CaseStudy;
  /** 3 stats to show below the headline. Each renders through
   *  NumberTicker so values like "$1.2M" / "44%" count up. */
  stats: { value: string; label: string }[];
}

export default function CaseStudyHero({ c, stats }: Props) {
  // Headline already splits into primary + italic; for the word-by-word
  // entrance we tokenise the primary part on whitespace and treat the
  // italic phrase as one "word" that lands at the end.
  const words = c.headline.primary.trim().split(/\s+/);
  const headlineDelayBase = 100;
  const wordStaggerMs = 60;

  const tag = [
    c.client.label,
    INDUSTRY_LABEL[c.industry],
    REGION_LABEL[c.region],
  ]
    .filter(Boolean)
    .join(" · ")
    .toUpperCase();

  return (
    <section className="bg-bone" style={{ position: "relative", overflow: "hidden" }}>
      {/* warm radial behind the hero, same treatment as homepage */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 35%, rgba(252,152,90,0.10), transparent 55%), radial-gradient(ellipse at 75% 65%, rgba(226,130,107,0.06), transparent 55%)",
        }}
      />

      <div
        className="max-w-[1200px] mx-auto relative"
        style={{ padding: "clamp(2.5rem,5vw,4rem) clamp(1.5rem,5vw,4rem) clamp(3rem,6vw,5rem)" }}
      >
        <div className="grid lg:grid-cols-12 items-center gap-10 lg:gap-12">
          {/* Left column — copy */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            {/* Eyebrow */}
            <div className="cc-enter-up flex items-center gap-2 mb-3" style={{ animationDelay: "0ms" }}>
              <span
                aria-hidden
                className="w-1.5 h-1.5 rounded-full bg-papaya cc-pulse-dot"
              />
              <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya">
                [ Featured case study ]
              </p>
            </div>

            {/* Mono client tag */}
            <p
              className="cc-enter-up font-mono text-[0.72rem] tracking-[2px] uppercase text-eyebrow mb-5 leading-relaxed"
              style={{ animationDelay: "40ms" }}
            >
              {tag}
            </p>

            {/* Headline — word-by-word reveal, italic emphasis lands last */}
            <h1
              className="font-display font-black text-corbeau tracking-[-0.02em] leading-[1.05] mb-5"
              style={{
                fontSize: "clamp(2rem,4.5vw,3.4rem)",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.22em",
              }}
            >
              {words.map((w, i) => (
                <span
                  key={`${w}-${i}`}
                  className="cc-enter-up-word"
                  style={{
                    animationDelay: `${headlineDelayBase + i * wordStaggerMs}ms`,
                  }}
                >
                  {w}
                </span>
              ))}
              <span
                className="cc-enter-up-word cc-emphasis-italic"
                style={{
                  animationDelay: `${headlineDelayBase + words.length * wordStaggerMs}ms`,
                }}
              >
                {c.headline.italic}
              </span>
            </h1>

            {/* Outcome paragraph */}
            <p
              className="cc-enter-up text-night text-[1rem] md:text-[1.05rem] leading-[1.7] mb-7 max-w-[560px]"
              style={{ animationDelay: "900ms" }}
            >
              {c.outcome}
            </p>

            {/* Stat row — three numbers with count-up + mono labels */}
            <div className="mb-7 flex flex-wrap gap-x-0 border-t border-corbeau/[0.08] pt-6 max-md:flex-col max-md:divide-y max-md:divide-corbeau/[0.08]">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`cc-enter-up pr-6 mr-6 max-md:pr-0 max-md:mr-0 max-md:py-3 max-md:first:pt-0 ${
                    i < stats.length - 1 ? "border-r border-corbeau/[0.10] max-md:border-r-0" : ""
                  }`}
                  style={{ animationDelay: `${1100 + i * 80}ms` }}
                >
                  <div
                    className="font-display font-black tracking-[-0.03em] leading-none text-papaya tabular-nums"
                    style={{ fontSize: "clamp(1.5rem,3vw,2rem)" }}
                  >
                    <NumberTicker to={s.value} />
                  </div>
                  <div className="font-mono text-[0.72rem] uppercase tracking-[1.5px] text-eyebrow mt-2 leading-tight">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="cc-enter-up" style={{ animationDelay: "1350ms" }}>
              <Link
                href={`/${c.slug}`}
                className="inline-flex items-center gap-2 bg-corbeau text-bone hover:bg-night text-[0.92rem] font-semibold px-6 py-3.5 rounded-full no-underline transition-colors"
              >
                Read the full case study
                <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          </div>

          {/* Right column — cover image with Ken-Burns + entrance scale */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div
              className="cc-enter-scale relative"
              style={{ animationDelay: "400ms" }}
            >
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{
                  border: "6px solid #ffffff",
                  boxShadow:
                    "0 24px 56px rgba(252,152,90,0.10), 0 8px 24px rgba(14,16,32,0.10), 0 0 0 1px rgba(14,16,32,0.06)",
                  aspectRatio: "4/5",
                  maxWidth: 560,
                  marginLeft: "auto",
                }}
              >
                <Image
                  src={c.cover.src}
                  alt={c.cover.alt}
                  fill
                  priority
                  quality={70}
                  sizes="(min-width: 1024px) 560px, 90vw"
                  className="object-cover cc-ken-burns"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
