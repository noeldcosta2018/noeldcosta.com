"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  INDUSTRY_LABEL,
  REGION_LABEL,
  SERVICE_LABEL,
  type CaseStudy,
} from "@/lib/case-studies";
import NumberTicker from "./NumberTicker";

/**
 * Case-study card. Two size variants:
 *
 *  - "anchor" — large, image-led, used for the curated 4-card anchor row
 *    under the hero. 5:6 aspect-ish, image top 60% / content 40%.
 *
 *  - "compact" — smaller, denser, used in the archive grid.
 *    4:3 aspect image, tighter content.
 *
 * Both share the same DOM shape so the spotlight cursor effect and
 * hover-lift behave identically.
 *
 * Spotlight: cursor-tracking radial papaya gradient via the existing
 * .cc-spotlight utility in globals.css. Mouse-move handler sets CSS
 * vars on the host. Disabled on touch via the @media rule on the
 * utility.
 *
 * Link target: /<slug>. Same URL the existing /category/case-studies
 * page already points to — zero SEO impact.
 */

interface Props {
  c: CaseStudy;
  variant: "anchor" | "compact";
  /** Lazy-load the cover image. Always true except for the very first
   *  visible card on initial paint (the hero handles its own image). */
  priority?: boolean;
}

function setSpotlight(e: React.MouseEvent<HTMLDivElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--spotlight-x", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--spotlight-y", `${e.clientY - r.top}px`);
}

export default function CaseStudyCard({ c, variant, priority }: Props) {
  const isAnchor = variant === "anchor";
  const tags = [
    INDUSTRY_LABEL[c.industry],
    REGION_LABEL[c.region],
    // Pick the first service tag for the badge row; the rest live on
    // the article page. Three tags max keeps the row scannable.
    c.service[0] ? SERVICE_LABEL[c.service[0]] : null,
  ].filter(Boolean) as string[];

  return (
    <Link
      href={`/${c.slug}`}
      // No underline on the wrapper link — children style themselves.
      // group lets the image scale on card hover from a single hover state.
      className="group block no-underline text-corbeau"
    >
      <article
        onMouseMove={setSpotlight}
        className={[
          "cc-spotlight relative bg-paper border border-corbeau/[0.06] rounded-2xl overflow-hidden",
          "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "hover:border-papaya/30 hover:-translate-y-1",
          isAnchor
            ? "hover:shadow-[0_18px_44px_rgba(14,16,32,0.10)]"
            : "hover:shadow-[0_12px_32px_rgba(14,16,32,0.08)]",
          "h-full flex flex-col",
        ].join(" ")}
      >
        {/* Cover image — view-transition-name matches the article hero
            so navigating into the case study morphs the card image into
            the full-width hero (Chrome 126+; no-op elsewhere). */}
        <div
          className={`relative w-full overflow-hidden bg-cream ${
            isAnchor ? "aspect-[5/4]" : "aspect-[4/3]"
          }`}
          style={{ viewTransitionName: `case-${c.slug}` } as React.CSSProperties}
        >
          <Image
            src={c.cover.src}
            alt={c.cover.alt}
            fill
            sizes={
              isAnchor
                ? "(min-width: 1024px) 580px, (min-width: 640px) 50vw, 100vw"
                : "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            }
            quality={70}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
          {/* Subtle bottom-gradient overlay on hover so the bottom-pinned
              key stat reads against any cover image. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-corbeau/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        </div>

        {/* Content */}
        <div
          className={`flex flex-col flex-1 ${
            isAnchor ? "p-6 md:p-7 gap-3" : "p-5 gap-2"
          }`}
        >
          {/* Mono tag row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {tags.map((t, i) => (
              <span key={t} className="flex items-center gap-2">
                <span className="font-mono text-[0.65rem] uppercase tracking-[2px] text-eyebrow">
                  {t}
                </span>
                {i < tags.length - 1 && (
                  <span
                    aria-hidden
                    className="font-mono text-[0.65rem] text-eyebrow/40"
                  >
                    ·
                  </span>
                )}
              </span>
            ))}
          </div>

          {/* Headline (italic-split signature pattern). aria-label carries
              the full sentence because the React text-node split between
              primary and the italic <span> collapses the inter-sentence
              space in some screen-reader trees ("close.Five." instead of
              "close. Five."). */}
          <h3
            aria-label={`${c.headline.primary} ${c.headline.italic}`}
            className={[
              "font-display font-bold text-corbeau tracking-[-0.02em] leading-tight",
              isAnchor ? "text-[1.15rem] md:text-[1.3rem]" : "text-[1.02rem]",
              "transition-colors duration-300 group-hover:text-corbeau",
            ].join(" ")}
          >
            <span aria-hidden>
              {c.headline.primary}{" "}
              <span className="cc-emphasis-italic">{c.headline.italic}</span>
            </span>
          </h3>

          {/* Outcome (single sentence, anchor only — keeps compact cards tight) */}
          {isAnchor && (
            <p className="text-night text-[0.9rem] leading-[1.6] line-clamp-3">
              {c.outcome}
            </p>
          )}

          {/* Key stat — sits at the bottom of the card body */}
          <div
            className={`mt-auto flex items-baseline gap-3 ${
              isAnchor ? "pt-3" : "pt-2"
            }`}
          >
            <span
              className={[
                "font-display font-black tabular-nums text-papaya leading-none tracking-[-0.02em]",
                isAnchor ? "text-[1.85rem] md:text-[2rem]" : "text-[1.4rem]",
              ].join(" ")}
            >
              <NumberTicker to={c.headlineStat.value} />
            </span>
            <span className="font-mono text-[0.66rem] uppercase tracking-[1.6px] text-eyebrow leading-tight">
              {c.headlineStat.label}
            </span>
          </div>

          {/* Read-the-case affordance — only on anchor cards (compact
              uses the whole card as the link, no need to repeat). */}
          {isAnchor && (
            <div className="flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[1.5px] text-papaya pt-1 transition-transform duration-200 group-hover:translate-x-1">
              Read the case
              <ArrowRight size={13} aria-hidden />
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
