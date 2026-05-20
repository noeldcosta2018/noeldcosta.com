import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import Link from "next/link";
import type { ComponentProps } from "react";
import FadeUp from "@/components/article/FadeUp";
import CompareSplit from "@/components/article/diagrams/CompareSplit";
import Stepper from "@/components/article/diagrams/Stepper";
import DecisionTree from "@/components/article/diagrams/DecisionTree";
import StatBlock from "@/components/article/diagrams/StatBlock";
import TestimonialsGrid from "@/components/article/testimonials/TestimonialsGrid";
import ContactBlock from "@/components/article/contact/ContactBlock";
import CalendlyEmbed from "@/components/article/contact/CalendlyEmbed";
import ContactHero from "@/components/article/contact/ContactHero";
import FeaturedOn from "@/components/article/featured/FeaturedOn";
import AboutHero from "@/components/article/hero/AboutHero";
import CredibilityBand from "@/components/article/credibility/CredibilityBand";
import BeliefsGrid from "@/components/article/beliefs/BeliefsGrid";
import ProgrammesList from "@/components/article/programmes/ProgrammesList";
import CapabilitiesRow from "@/components/article/capabilities/CapabilitiesRow";
import SafeguardBand from "@/components/article/safeguard/SafeguardBand";

/**
 * Renders post/page markdown. Uses react-markdown so we never go through the
 * MDX/JSX parser (content is pure markdown from WordPress; no JSX components).
 *
 * Typography tuned to match the site's global rhythm (16px / 1.65):
 *   - Body is Inter at 16–17px with 1.7 leading for long-form comfort
 *   - Headings are Epilogue bold with the same tracking that Hero/Nav use
 *   - Links follow the site pattern: corbeau text with a papaya-tinted
 *     underline, shifting to full papaya on hover — not the stock blue/orange
 *     we had before.
 */
export default function MdxBody({ source }: { source: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeRaw,
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          { behavior: "wrap", properties: { className: ["heading-anchor"] } },
        ],
      ]}
      // The Components type in react-markdown is strict about known HTML
      // element names, but we register custom tag names (compare-split,
      // stepper, etc.) for our diagram components. The cast lets those
      // through; everything else stays HTML-typed.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      components={({
        a: ({ href = "", children, ...rest }: ComponentProps<"a">) => {
          const internal =
            typeof href === "string" &&
            (href.startsWith("/") || href.startsWith("#"));
          if (internal) {
            return (
              <Link
                href={href}
                className="text-corbeau underline underline-offset-[4px] decoration-papaya/40 hover:decoration-papaya hover:text-papaya transition-colors"
              >
                {children}
              </Link>
            );
          }
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-corbeau underline underline-offset-[4px] decoration-papaya/40 hover:decoration-papaya hover:text-papaya transition-colors"
              {...rest}
            >
              {children}
            </a>
          );
        },
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        img: (p: ComponentProps<"img">) => (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img
            {...p}
            loading="lazy"
            className="rounded-xl my-8 w-full h-auto border-2 border-papaya/60 shadow-[0_12px_40px_rgba(14,16,32,0.14),0_4px_16px_rgba(252,152,90,0.10)]"
          />
        ),
        // Body H1 should almost never appear (ArticleHero owns the page H1).
        // Sized small so an accidental # in MDX doesn't compete with the page title.
        h1: (p: ComponentProps<"h1">) => (
          <h1
            className="font-display font-black tracking-[-0.035em] text-corbeau text-[1.5rem] md:text-[1.7rem] leading-[1.15] mt-10 mb-4"
            {...p}
          />
        ),
        // H2 — top-level section. Smaller than the page H1 (~58px) but the
        // dominant heading inside the reading column.
        h2: (p: ComponentProps<"h2">) => (
          <FadeUp as="div" className="mt-14 mb-4">
            <h2
              className="font-display font-black tracking-[-0.03em] text-corbeau text-[1.4rem] md:text-[1.65rem] leading-[1.18] scroll-mt-28 pb-3 border-b border-corbeau/[0.07]"
              {...p}
            />
          </FadeUp>
        ),
        // H3 — sub-heading inside a section. Visibly smaller than H2.
        h3: (p: ComponentProps<"h3">) => (
          <FadeUp as="div" className="mt-10 mb-2">
            <h3
              className="font-display font-bold tracking-[-0.018em] text-corbeau text-[1.08rem] md:text-[1.18rem] leading-[1.3] scroll-mt-28"
              {...p}
            />
          </FadeUp>
        ),
        // H4 — rarely used; for inline mini-headings inside a section.
        h4: (p: ComponentProps<"h4">) => (
          <h4
            className="font-display font-semibold tracking-[-0.01em] text-corbeau text-[0.95rem] md:text-[1rem] uppercase tracking-[0.02em] mt-7 mb-2 scroll-mt-28"
            {...p}
          />
        ),
        // Body — sized for reading density (~15px / ~16px desktop), not
        // marketing-page comfort (17px). Editorial sites converge on 15-16px
        // for long-form because it allows more text per fold without losing
        // legibility.
        //
        // When a paragraph node wraps only a custom block-level tag
        // (testimonials-grid, beliefs-grid, etc.), react-markdown still
        // emits a <p>. That causes hydration errors because our custom
        // components render <section>/<h3>/<blockquote> inside the <p>.
        // Detect that case via the rehype node and skip the <p> wrapper.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        p: ({ node, children, ...rest }: any) => {
          const CUSTOM_BLOCKS = new Set([
            "compare-split",
            "stepper",
            "decision-tree",
            "stat-block",
            "testimonials-grid",
            "contact-block",
            "featured-on",
            "about-hero",
            "credibility-band",
            "beliefs-grid",
            "programmes-list",
            "capabilities-row",
            "safeguard-band",
            "calendly-embed",
            "contact-hero",
          ]);
          if (
            node?.children?.length === 1 &&
            node.children[0]?.type === "element" &&
            CUSTOM_BLOCKS.has(node.children[0].tagName)
          ) {
            return <>{children}</>;
          }
          return (
            <p
              className="text-night leading-[1.75] text-[0.94rem] md:text-[1rem] my-4 [&>strong]:text-corbeau [&>strong]:font-semibold"
              {...rest}
            >
              {children}
            </p>
          );
        },
        ul: (p: ComponentProps<"ul">) => (
          <ul
            className="text-night my-5 space-y-2 leading-[1.7] text-[0.94rem] md:text-[1rem] [&>li]:relative [&>li]:pl-6 [&>li]:before:content-[''] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.65em] [&>li]:before:w-[6px] [&>li]:before:h-[6px] [&>li]:before:rounded-full [&>li]:before:bg-papaya"
            {...p}
          />
        ),
        ol: (p: ComponentProps<"ol">) => (
          <ol
            className="list-decimal marker:text-corbeau marker:font-display marker:font-black pl-8 text-night my-5 space-y-2.5 leading-[1.7] text-[0.94rem] md:text-[1rem] [&>li]:pl-2"
            {...p}
          />
        ),
        blockquote: (p: ComponentProps<"blockquote">) => (
          <FadeUp as="div" className="my-7">
            <blockquote
              className="border-l-[3px] border-papaya pl-5 py-1 text-corbeau/90 italic text-[0.96rem] md:text-[1.02rem] leading-[1.6] [&>p]:my-2 [&>p]:text-[0.96rem] [&>p]:md:text-[1.02rem]"
              {...p}
            />
          </FadeUp>
        ),
        code: (p: ComponentProps<"code">) => (
          <code
            className="font-mono text-[0.88em] bg-bone/80 text-corbeau px-1.5 py-0.5 rounded border border-corbeau/[0.06]"
            {...p}
          />
        ),
        pre: (p: ComponentProps<"pre">) => (
          <pre
            className="bg-corbeau text-bone font-mono text-[0.86rem] leading-[1.6] p-6 rounded-xl overflow-x-auto my-8 [&>code]:bg-transparent [&>code]:border-0 [&>code]:text-bone [&>code]:p-0"
            {...p}
          />
        ),
        table: (p: ComponentProps<"table">) => (
          <FadeUp as="figure" className="not-prose my-10 overflow-hidden rounded-xl border border-corbeau/[0.08] bg-paper shadow-[0_2px_20px_rgba(14,16,32,0.04)]">
            <table
              className="w-full table-fixed text-[0.78rem] md:text-[0.9rem] border-collapse"
              {...p}
            />
          </FadeUp>
        ),
        thead: (p: ComponentProps<"thead">) => (
          <thead className="bg-papaya" {...p} />
        ),
        tbody: (p: ComponentProps<"tbody">) => (
          <tbody
            className="[&>tr:nth-child(even)]:bg-bone/30 [&>tr]:transition-colors [&>tr:hover]:bg-papaya/[0.04]"
            {...p}
          />
        ),
        th: (p: ComponentProps<"th">) => (
          <th
            className="text-left font-display font-black tracking-[-0.01em] text-corbeau text-[0.78rem] md:text-[0.9rem] py-3 px-2 md:px-4 first:pl-3 md:first:pl-5 last:pr-3 md:last:pr-5 leading-snug break-words"
            {...p}
          />
        ),
        td: (p: ComponentProps<"td">) => (
          <td
            className="text-night border-t border-corbeau/[0.06] py-3 px-2 md:px-4 first:pl-3 md:first:pl-5 last:pr-3 md:last:pr-5 leading-[1.55] align-top break-words first:font-semibold first:text-corbeau"
            {...p}
          />
        ),
        hr: () => (
          <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-corbeau/15 to-transparent" />
        ),
        // Custom diagram tags. Article authors write lowercase HTML-like
        // tags (e.g. <compare-split title="..." left-label="..." />) and
        // react-markdown maps them to these React components. Props arrive
        // as strings (HTML attribute semantics), so each component parses
        // its own pipe-separated fields.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "compare-split": ((props: any) => <CompareSplit {...props} />) as never,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "stepper": ((props: any) => <Stepper {...props} />) as never,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "decision-tree": ((props: any) => <DecisionTree {...props} />) as never,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "stat-block": ((props: any) => <StatBlock {...props} />) as never,
        // Structured testimonials card grid for the About / story page.
        // Data lives in src/components/article/testimonials/data.ts so
        // the MDX side is a single self-closing tag.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "testimonials-grid": ((_props: any) => <TestimonialsGrid />) as never,
        // Structured contact card — fixes WP-import bugs (broken email,
        // mismatched tel href, mailto used for "Website" link).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "contact-block": ((_props: any) => <ContactBlock />) as never,
        // Publication logos for "Featured on" — replaces WP gallery
        // with empty <img src=""> tags and descriptive alt text.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "featured-on": ((_props: any) => <FeaturedOn />) as never,
        // Hero CTAs + headshot for the About / story page.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "about-hero": ((_props: any) => <AboutHero />) as never,
        // Credibility stat strip — figures sourced from BRAND.md only.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "credibility-band": ((_props: any) => <CredibilityBand />) as never,
        // 5 "What I believe" opinions as cards (reuses Credentials
        // shell + AICapabilities icon-tile pattern, no new tokens).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "beliefs-grid": ((_props: any) => <BeliefsGrid />) as never,
        // 6 lived-programme stories as a TrackRecord-style vertical list
        // (sector/region tag + badge + title + body, papaya hairline rows).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "programmes-list": ((_props: any) => <ProgrammesList />) as never,
        // 3-column "What I do" capability cards (reuses ServiceCard hover
        // + Credentials shell, light theme).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "capabilities-row": ((_props: any) => <CapabilitiesRow />) as never,
        // Full-width "I safeguard your investment" divider band, reuses
        // CTABanner.tsx papaya→canyon gradient as a chapter break.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "safeguard-band": ((_props: any) => <SafeguardBand />) as never,
        // Lazy-loaded Calendly inline widget for the Contact page.
        // Loads on first user interaction or after a 2s delay.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "calendly-embed": ((_props: any) => <CalendlyEmbed />) as never,
        // Contact-page hero (one-sentence headline + ambient warm gradient).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "contact-hero": ((_props: any) => <ContactHero />) as never,
        // FAQ accordion. Articles use <details><summary>Q</summary>A</details>
        // inline HTML (passed through by rehype-raw) for their FAQ sections.
        // Styled here so they read as a single coherent accordion module.
        // The group-open: variant handles the +/× toggle and answer reveal.
        details: (p: ComponentProps<"details">) => (
          <details
            className="group not-prose border-b border-corbeau/[0.08] py-2 first:border-t first:border-corbeau/[0.08] [&_summary::-webkit-details-marker]:hidden [&_summary]:list-none"
            {...p}
          />
        ),
        summary: ({ children, ...rest }: ComponentProps<"summary">) => (
          <summary
            className="flex items-start justify-between gap-4 cursor-pointer font-display font-bold text-corbeau text-[1.02rem] md:text-[1.1rem] tracking-[-0.02em] leading-[1.35] select-none -mx-3 px-3 py-3.5 rounded-lg transition-all duration-150 hover:bg-papaya hover:text-corbeau group-open:bg-papaya group-open:text-corbeau"
            role="button"
            {...rest}
          >
            <span className="flex-1 py-0.5">{children}</span>
            <span
              aria-hidden
              className="mt-[3px] flex-shrink-0 w-[22px] h-[22px] rounded-full border border-current flex items-center justify-center opacity-60 text-[0.85rem] leading-none transition-all duration-200 group-open:rotate-45 group-open:opacity-90"
            >
              +
            </span>
          </summary>
        ),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any}
    >
      {source}
    </ReactMarkdown>
  );
}
