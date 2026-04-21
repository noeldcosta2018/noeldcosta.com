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
            className="rounded-xl my-8 w-full h-auto border border-corbeau/[0.06] shadow-[0_8px_32px_rgba(14,16,32,0.06)]"
          />
        ),
        h1: (p: ComponentProps<"h1">) => (
          <h1
            className="font-display font-black tracking-[-0.035em] text-corbeau text-[2.1rem] md:text-[2.5rem] leading-[1.1] mt-10 mb-4"
            {...p}
          />
        ),
        h2: (p: ComponentProps<"h2">) => (
          <FadeUp as="div" className="mt-14 mb-3">
            <h2
              className="font-display font-black tracking-[-0.025em] text-corbeau text-[1.5rem] md:text-[1.75rem] leading-[1.2] scroll-mt-28"
              {...p}
            />
          </FadeUp>
        ),
        h3: (p: ComponentProps<"h3">) => (
          <FadeUp as="div" className="mt-10 mb-2">
            <h3
              className="font-display font-bold tracking-[-0.015em] text-corbeau text-[1.15rem] md:text-[1.25rem] leading-[1.3] scroll-mt-28"
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
            className="text-night leading-[1.7] text-[1rem] md:text-[1.02rem] my-4 [&>strong]:text-corbeau [&>strong]:font-semibold"
            {...p}
          />
        ),
        ul: (p: ComponentProps<"ul">) => (
          <ul
            className="text-night my-5 space-y-2 leading-[1.65] text-[1rem] md:text-[1.02rem] [&>li]:relative [&>li]:pl-6 [&>li]:before:content-[''] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.65em] [&>li]:before:w-[6px] [&>li]:before:h-[6px] [&>li]:before:rounded-full [&>li]:before:bg-papaya"
            {...p}
          />
        ),
        ol: (p: ComponentProps<"ol">) => (
          <ol
            className="list-decimal marker:text-papaya marker:font-semibold pl-6 text-night my-5 space-y-2 leading-[1.65] text-[1rem] md:text-[1.02rem]"
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
        details: (p: ComponentProps<"details">) => (
          <details
            className="group not-prose border-b border-corbeau/10 py-5 first:border-t first:pt-6 last:pb-6 [&_summary::-webkit-details-marker]:hidden [&_summary]:list-none"
            {...p}
          />
        ),
        summary: ({ children, ...rest }: ComponentProps<"summary">) => (
          <summary
            className="flex items-start justify-between gap-4 cursor-pointer font-display font-bold text-corbeau text-[1.02rem] md:text-[1.08rem] tracking-[-0.015em] leading-[1.35] hover:text-papaya transition-colors"
            {...rest}
          >
            <span className="flex-1">{children}</span>
            <span
              aria-hidden
              className="mt-1 flex-shrink-0 w-5 h-5 rounded-full border border-corbeau/20 flex items-center justify-center text-corbeau/60 text-[0.9rem] leading-none transition-transform group-open:rotate-45 group-hover:border-papaya group-hover:text-papaya"
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
