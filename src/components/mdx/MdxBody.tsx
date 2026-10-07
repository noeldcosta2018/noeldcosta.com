import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import Link from "next/link";
import { MDX_BODY_LINK_CLASS } from "@/lib/article-layout";
import type { ComponentProps, JSX } from "react";
import type { PluggableList } from "unified";
import type { HeadingEntry } from "@/lib/article-headings";
import { rehypeArticleHeadingIds } from "@/lib/article-heading-ids";
import { getImageDimensions } from "@/lib/image-dimensions";
import { cleanWordPressArtifacts } from "@/lib/wp-cleanup";
import CompareSplit from "@/components/article/diagrams/CompareSplit";
import Stepper from "@/components/article/diagrams/Stepper";
import DecisionTree from "@/components/article/diagrams/DecisionTree";
import StatBlock from "@/components/article/diagrams/StatBlock";
import {
  EXPLAINER_TAGS,
  ExplainerBeforeAfter,
  ExplainerCompare,
  ExplainerCostBuild,
  ExplainerCycle,
  ExplainerFlow,
  ExplainerFunnel,
  ExplainerLayers,
  ExplainerMatrix,
  ExplainerOrg,
  ExplainerTimeline,
  explainerProps,
} from "@/components/article/explainers";
import { explainerLabels, tableLabel } from "@/components/article/explainers/labels";
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

type MdProps<T extends keyof JSX.IntrinsicElements> = ComponentProps<T> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node?: any;
};

function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

// Cells in the first row of a hast <table> node (thead or tbody).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tableColumnCount(node: any): number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const elements = (n: any) => (n?.children ?? []).filter((c: any) => c?.type === "element");
  for (const section of elements(node)) {
    const row = section.tagName === "tr" ? section : elements(section).find((r: { tagName?: string }) => r.tagName === "tr");
    if (row) return elements(row).filter((c: { tagName?: string }) => c.tagName === "th" || c.tagName === "td").length;
  }
  return 0;
}

// Upright images up to this width are WordPress testimonial portraits.
const AVATAR_MAX_WIDTH = 200;

/**
 * Renders post/page markdown. Uses react-markdown so we never go through the
 * MDX/JSX parser (content is pure markdown from WordPress; no JSX components).
 *
 * Every element gets an nd-md-* class; the styling lives in nd-articles.css
 * and follows the active theme through the nd-theme.css tokens. Body copy is
 * sized for reading density (16 to 16.5px, 1.78 leading). Headings use the
 * display family in sentence case; numbered H2 markers mirror the side rail.
 */
export default function MdxBody({
  source,
  headings,
  reservedHeadingIds,
  headingNumbers,
  isImageAvailable,
  locale,
}: {
  source: string;
  /** Page language; translated pages get translated explainer chrome ("Source", "Replay"). */
  locale?: string;
  /**
   * ToC entries (computed over the full article body) for the headings in
   * this source. When given, rendered H2/H3 ids are taken from these entries
   * so ToC links resolve even when an article is rendered in segments.
   */
  headings?: readonly HeadingEntry[];
  /** Every ToC id in the article; other headings never reuse one. */
  reservedHeadingIds?: readonly string[];
  /** Rail number ("01", "02"...) per H2 id, shown as a marker above the H2. */
  headingNumbers?: Readonly<Record<string, string>>;
  /**
   * Server-side check that an image file exists. Images it rejects are not
   * rendered (some migrated translations reference files that were never
   * imported), so readers never see a broken-image box.
   */
  isImageAvailable?: (src: string) => boolean;
}) {
  const unavailable = (src: unknown): boolean =>
    !!isImageAvailable && typeof src === "string" && src !== "" && !isImageAvailable(src);
  // Heading ids must be final before rehype-autolink-headings copies them
  // into the self-link href, so the ToC plugin runs between the two.
  const rehypePlugins: PluggableList = [rehypeRaw, rehypeSlug];
  if (headings) {
    rehypePlugins.push([
      rehypeArticleHeadingIds,
      {
        headings,
        reservedIds: reservedHeadingIds ?? headings.map((h) => h.id),
      },
    ]);
  }
  rehypePlugins.push([
    rehypeAutolinkHeadings,
    { behavior: "wrap", properties: { className: ["heading-anchor"] } },
  ]);
  return (
    <ReactMarkdown
      // singleTilde off: ranges like "18~24" (common in Japanese and Korean)
      // must not become strikethrough; only "~~text~~" strikes through.
      remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
      rehypePlugins={rehypePlugins}
      // The Components type in react-markdown is strict about known HTML
      // element names, but we register custom tag names (compare-split,
      // stepper, etc.) for our diagram components. The cast lets those
      // through; everything else stays HTML-typed.
      components={({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        a: ({ href = "", children, className, node, ...rest }: ComponentProps<"a"> & { node?: any }) => {
          // rehype-autolink-headings (behavior: "wrap") emits an <a class="heading-anchor" href="#slug">
          // around the heading content. When the heading itself contains a markdown link
          // (## [Text](url)), routing that wrapper through Next <Link> produces
          // <Link><a>...</a></Link> (Next 13+ rejects) AND nests an <a> inside an <a>
          // (HTML5 invalid → hydration warning). Strip the wrapper when its children
          // already include an anchor; otherwise render it as a plain in-page <a>.
          const isHeadingAnchor =
            typeof className === "string" &&
            className.split(/\s+/).includes("heading-anchor");
          if (isHeadingAnchor) {
            const wrapsAnchor =
              Array.isArray(node?.children) &&
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              node.children.some((c: any) => c?.type === "element" && c.tagName === "a");
            if (wrapsAnchor) return <>{children}</>;
            return (
              <a href={href} className={className} {...rest}>
                {children}
              </a>
            );
          }
          const internal =
            typeof href === "string" &&
            (href.startsWith("/") || href.startsWith("#"));
          if (internal) {
            return (
              <Link
                href={href}
                className={MDX_BODY_LINK_CLASS}
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
              className={MDX_BODY_LINK_CLASS}
              {...rest}
            >
              {children}
            </a>
          );
        },
        // Images are never upscaled: they render at their natural size up to
        // the column width. Known local images get their intrinsic
        // width/height so the browser reserves space (no layout shift).
        // WordPress testimonial portraits (small, upright) become inline
        // avatars; WordPress emoji SVGs stay emoji-sized.
        img: ({ node, className, ...p }: MdProps<"img">) => {
          void node;
          const src = typeof p.src === "string" ? p.src : "";
          if (unavailable(src)) return null;
          const dimensions = getImageDimensions(src);
          const isEmoji = /s\.w\.org\/images\/core\/emoji\//.test(src);
          const ratio = dimensions ? dimensions.height / dimensions.width : 0;
          const isAvatar =
            !!dimensions &&
            dimensions.width <= AVATAR_MAX_WIDTH &&
            ratio >= 1.05 &&
            ratio <= 1.6;
          const variant = isEmoji ? "nd-md-emoji" : isAvatar ? "nd-md-avatar" : "nd-md-img";
          return (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img
              {...p}
              {...(dimensions && !p.width && !p.height
                ? { width: dimensions.width, height: dimensions.height }
                : {})}
              {...(isEmoji || isAvatar ? { "data-bare": "" } : {})}
              loading="lazy"
              decoding="async"
              className={cx(variant, className)}
            />
          );
        },
        // Body H1 should almost never appear (the banner owns the page H1).
        // Sized like an H2 so an accidental # in MDX doesn't compete.
        h1: ({ node, className, ...p }: MdProps<"h1">) => {
          void node;
          return <h1 {...p} className={cx("nd-md-h1", className)} />;
        },
        // H2: top-level section, with the rail number above it when known.
        h2: ({ node, className, ...p }: MdProps<"h2">) => {
          void node;
          const n = typeof p.id === "string" ? headingNumbers?.[p.id] : undefined;
          return (
            <div className="nd-md-h2-wrap">
              {n && (
                <span className="nd-md-h2-n" aria-hidden="true">
                  {n}
                </span>
              )}
              <h2 {...p} className={cx("nd-md-h2", className)} />
            </div>
          );
        },
        h3: ({ node, className, ...p }: MdProps<"h3">) => {
          void node;
          return <h3 {...p} className={cx("nd-md-h3", className)} />;
        },
        h4: ({ node, className, ...p }: MdProps<"h4">) => {
          void node;
          return <h4 {...p} className={cx("nd-md-h4", className)} />;
        },
        // When a paragraph node wraps only a custom block-level tag
        // (testimonials-grid, beliefs-grid, etc.), react-markdown still
        // emits a <p>. That causes hydration errors because our custom
        // components render <section>/<h3>/<blockquote> inside the <p>.
        // Detect that case via the rehype node and skip the <p> wrapper.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        p: ({ node, children, className, ...rest }: any) => {
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
            ...EXPLAINER_TAGS,
          ]);
          if (
            node?.children?.length === 1 &&
            node.children[0]?.type === "element" &&
            CUSTOM_BLOCKS.has(node.children[0].tagName)
          ) {
            return <>{children}</>;
          }
          // A paragraph holding only a missing image would leave an empty gap.
          if (
            node?.children?.length === 1 &&
            node.children[0]?.tagName === "img" &&
            unavailable(node.children[0].properties?.src)
          ) {
            return null;
          }
          return (
            <p {...rest} className={cx("nd-md-p", className)}>
              {children}
            </p>
          );
        },
        ul: ({ node, className, ...p }: MdProps<"ul">) => {
          void node;
          return <ul {...p} className={cx("nd-md-ul", className)} />;
        },
        // CSS counters draw the numbers; honour <ol start> so lists split
        // by a paragraph keep counting.
        ol: ({ node, className, style, ...p }: MdProps<"ol">) => {
          void node;
          const start = typeof p.start === "number" ? p.start : Number(p.start ?? 1);
          const counter =
            Number.isFinite(start) && start !== 1
              ? { counterReset: `nd-ol ${start - 1}` }
              : undefined;
          return (
            <ol
              {...p}
              className={cx("nd-md-ol", className)}
              style={counter ? { ...style, ...counter } : style}
            />
          );
        },
        blockquote: ({ node, className, ...p }: MdProps<"blockquote">) => {
          void node;
          return <blockquote {...p} className={cx("nd-md-quote", className)} />;
        },
        code: ({ node, className, ...p }: MdProps<"code">) => {
          void node;
          return <code {...p} className={cx("nd-md-code", className)} />;
        },
        pre: ({ node, className, ...p }: MdProps<"pre">) => {
          void node;
          return <pre {...p} className={cx("nd-md-pre", className)} />;
        },
        // Wide tables scroll inside their frame on small screens. The
        // minimum width scales with the column count so two-column tables
        // fit a phone without scrolling. A frame that can scroll takes
        // keyboard focus so it can be scrolled without a mouse.
        table: ({ node, style, ...p }: MdProps<"table">) => {
          const columns = tableColumnCount(node);
          const minWidth = columns > 2 ? Math.min(columns * 160, 720) : undefined;
          const scrollable = minWidth ? { tabIndex: 0, role: "region", "aria-label": tableLabel(locale) } : {};
          return (
            <figure className="not-prose nd-md-table" {...scrollable}>
              <table {...p} style={minWidth ? { ...style, minWidth } : style} />
            </figure>
          );
        },
        hr: () => <hr className="nd-md-hr" />,
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
        "stat-block": ((props: any) => <StatBlock {...explainerLabels(locale)} {...props} />) as never,
        // Animated explainer figures (src/components/article/explainers,
        // syntax in its README.md). These are client components, so
        // explainerProps keeps only the string attributes and drops the
        // hast node before the props cross the server/client boundary.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "explainer-flow": ((props: any) => <ExplainerFlow {...explainerLabels(locale)} {...explainerProps(props)} />) as never,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "explainer-timeline": ((props: any) => <ExplainerTimeline {...explainerLabels(locale)} {...explainerProps(props)} />) as never,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "explainer-cost-build": ((props: any) => <ExplainerCostBuild {...explainerLabels(locale)} {...explainerProps(props)} />) as never,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "explainer-compare": ((props: any) => <ExplainerCompare {...explainerLabels(locale)} {...explainerProps(props)} />) as never,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "explainer-cycle": ((props: any) => <ExplainerCycle {...explainerLabels(locale)} {...explainerProps(props)} />) as never,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "explainer-layers": ((props: any) => <ExplainerLayers {...explainerLabels(locale)} {...explainerProps(props)} />) as never,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "explainer-funnel": ((props: any) => <ExplainerFunnel {...explainerLabels(locale)} {...explainerProps(props)} />) as never,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "explainer-matrix": ((props: any) => <ExplainerMatrix {...explainerLabels(locale)} {...explainerProps(props)} />) as never,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "explainer-before-after": ((props: any) => <ExplainerBeforeAfter {...explainerLabels(locale)} {...explainerProps(props)} />) as never,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "explainer-org": ((props: any) => <ExplainerOrg {...explainerLabels(locale)} {...explainerProps(props)} />) as never,
        // Structured testimonials card grid for the About / story page.
        // Data lives in src/components/article/testimonials/data.ts so
        // the MDX side is a single self-closing tag.
        "testimonials-grid": (() => <TestimonialsGrid />) as never,
        // Structured contact card — fixes WP-import bugs (broken email,
        // mismatched tel href, mailto used for "Website" link).
        "contact-block": (() => <ContactBlock />) as never,
        // Publication logos for "Featured on" — replaces WP gallery
        // with empty <img src=""> tags and descriptive alt text.
        "featured-on": (() => <FeaturedOn />) as never,
        // Hero CTAs + headshot for the About / story page.
        "about-hero": (() => <AboutHero />) as never,
        // Credibility stat strip — figures sourced from BRAND.md only.
        "credibility-band": (() => <CredibilityBand />) as never,
        // 5 "What I believe" opinions as numbered cards.
        "beliefs-grid": (() => <BeliefsGrid />) as never,
        // 6 lived-programme stories as a ruled vertical list
        // (sector/region tag + badge chip + title + body).
        "programmes-list": (() => <ProgrammesList />) as never,
        // 3-column "What I do" capability cards.
        "capabilities-row": (() => <CapabilitiesRow />) as never,
        // "I safeguard your investment" statement band (nd-band) as a
        // chapter break.
        "safeguard-band": (() => <SafeguardBand />) as never,
        // Lazy-loaded Calendly inline widget for the Contact page.
        // Loads on first user interaction or after a 2s delay.
        "calendly-embed": (() => <CalendlyEmbed />) as never,
        // Contact-page hero (eyebrow, one-line display headline, lede).
        "contact-hero": (() => <ContactHero />) as never,
        // FAQ accordion. Articles use <details><summary>Q</summary>A</details>
        // inline HTML (passed through by rehype-raw) for their FAQ sections.
        // PostPage reads the same markup for FAQPage JSON-LD.
        details: ({ node, className, ...p }: MdProps<"details">) => {
          void node;
          return <details {...p} className={cx("not-prose nd-md-faq", className)} />;
        },
        summary: ({ node, children, className, ...rest }: MdProps<"summary">) => {
          void node;
          return (
            <summary {...rest} className={className} role="button">
              <span className="q">{children}</span>
              <span aria-hidden="true" className="ico">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
            </summary>
          );
        },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any}
    >
      {cleanWordPressArtifacts(source)}
    </ReactMarkdown>
  );
}
