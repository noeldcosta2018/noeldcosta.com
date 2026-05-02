import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import Link from "next/link";
import type { ComponentProps } from "react";
import FadeUp from "@/components/article/FadeUp";

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
      components={{
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
        h1: (p: ComponentProps<"h1">) => (
          <h1
            className="font-display font-black tracking-[-0.035em] text-corbeau text-[2.1rem] md:text-[2.5rem] leading-[1.1] mt-10 mb-4"
            {...p}
          />
        ),
        h2: (p: ComponentProps<"h2">) => (
          <FadeUp as="div" className="mt-16 mb-4">
            <h2
              className="font-display font-black tracking-[-0.03em] text-corbeau text-[1.55rem] md:text-[1.85rem] leading-[1.18] scroll-mt-28 pb-3 border-b border-corbeau/[0.07]"
              {...p}
            />
          </FadeUp>
        ),
        h3: (p: ComponentProps<"h3">) => (
          <FadeUp as="div" className="mt-11 mb-2.5">
            <h3
              className="font-display font-bold tracking-[-0.02em] text-corbeau text-[1.18rem] md:text-[1.3rem] leading-[1.28] scroll-mt-28"
              {...p}
            />
          </FadeUp>
        ),
        h4: (p: ComponentProps<"h4">) => (
          <h4
            className="font-display font-semibold tracking-[-0.01em] text-corbeau text-[1rem] md:text-[1.08rem] mt-8 mb-2 scroll-mt-28"
            {...p}
          />
        ),
        p: (p: ComponentProps<"p">) => (
          <p
            className="text-night leading-[1.78] text-[1.02rem] md:text-[1.06rem] my-5 [&>strong]:text-corbeau [&>strong]:font-semibold"
            {...p}
          />
        ),
        ul: (p: ComponentProps<"ul">) => (
          <ul
            className="text-night my-6 space-y-2.5 leading-[1.72] text-[1.02rem] md:text-[1.06rem] [&>li]:relative [&>li]:pl-6 [&>li]:before:content-[''] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.68em] [&>li]:before:w-[6px] [&>li]:before:h-[6px] [&>li]:before:rounded-full [&>li]:before:bg-papaya"
            {...p}
          />
        ),
        ol: (p: ComponentProps<"ol">) => (
          <ol
            className="list-decimal marker:text-papaya marker:font-semibold pl-6 text-night my-6 space-y-2.5 leading-[1.72] text-[1.02rem] md:text-[1.06rem]"
            {...p}
          />
        ),
        blockquote: (p: ComponentProps<"blockquote">) => (
          <FadeUp as="div" className="my-8">
            <blockquote
              className="border-l-[3px] border-papaya pl-6 py-1 text-corbeau/90 italic text-[1.05rem] md:text-[1.1rem] leading-[1.6] [&>p]:my-2"
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
          <FadeUp as="figure" className="not-prose my-10 -mx-2 md:mx-0 overflow-x-auto rounded-xl border border-corbeau/[0.08] bg-paper shadow-[0_2px_20px_rgba(14,16,32,0.04)]">
            <table
              className="min-w-full text-[0.92rem] border-collapse"
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
            className="text-left font-display font-black tracking-[-0.01em] text-corbeau text-[0.95rem] md:text-[1rem] py-4 px-5 first:pl-6 last:pr-6 whitespace-nowrap"
            {...p}
          />
        ),
        td: (p: ComponentProps<"td">) => (
          <td
            className="text-night border-t border-corbeau/[0.06] py-4 px-5 first:pl-6 last:pr-6 leading-[1.6] align-top first:font-semibold first:text-corbeau"
            {...p}
          />
        ),
        hr: () => (
          <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-corbeau/15 to-transparent" />
        ),
        // FAQ accordion. Articles use <details><summary>Q</summary>A</details>
        // inline HTML (passed through by rehype-raw) for their FAQ sections.
        // Styled here so they read as a single coherent accordion module.
        // The group-open: variant handles the +/× toggle and answer reveal.
        details: (p: ComponentProps<"details">) => (
          <details
            className="group not-prose border-b border-corbeau/[0.08] py-5 first:border-t first:border-corbeau/[0.08] first:pt-5 last:pb-5 [&_summary::-webkit-details-marker]:hidden [&_summary]:list-none"
            {...p}
          />
        ),
        summary: ({ children, ...rest }: ComponentProps<"summary">) => (
          <summary
            className="flex items-start justify-between gap-4 cursor-pointer font-display font-bold text-corbeau text-[1.02rem] md:text-[1.1rem] tracking-[-0.02em] leading-[1.35] hover:text-papaya transition-colors duration-150 select-none"
            role="button"
            {...rest}
          >
            <span className="flex-1 py-0.5">{children}</span>
            <span
              aria-hidden
              className="mt-[3px] flex-shrink-0 w-[22px] h-[22px] rounded-full border border-corbeau/[0.15] flex items-center justify-center text-corbeau/50 text-[0.85rem] leading-none transition-all duration-200 group-open:rotate-45 group-open:border-papaya group-open:text-papaya group-hover:border-papaya/60 group-hover:text-papaya/70"
            >
              +
            </span>
          </summary>
        ),
      }}
    >
      {source}
    </ReactMarkdown>
  );
}
