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
 * Typography direction: editorial, senior consulting audience.
 *   - Body: 17px / 1.78 leading — comfortable for long-form reads
 *   - H2: Epilogue black, editorial orange bar above, generous spacing
 *   - H3: Epilogue bold, clean, well-spaced
 *   - Tables: papaya header, alternating rows, proper cell padding
 *   - Links: corbeau + papaya decoration, hover shifts full papaya
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
                className="text-corbeau font-medium underline underline-offset-[3px] decoration-papaya/50 hover:decoration-papaya hover:text-papaya transition-colors duration-150"
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
              className="text-corbeau font-medium underline underline-offset-[3px] decoration-papaya/50 hover:decoration-papaya hover:text-papaya transition-colors duration-150"
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
            className="rounded-xl my-10 w-full h-auto border border-corbeau/[0.06] shadow-[0_8px_32px_rgba(14,16,32,0.07)]"
          />
        ),

        h1: (p: ComponentProps<"h1">) => (
          <h1
            className="font-display font-black tracking-[-0.04em] text-corbeau text-[2.1rem] md:text-[2.5rem] leading-[1.08] mt-10 mb-5"
            {...p}
          />
        ),

        // H2 — section-level headers. Small papaya bar above creates the
        // editorial section-marker feel without making it look like a link.
        h2: (p: ComponentProps<"h2">) => (
          <FadeUp as="div" className="mt-16 mb-5">
            <span
              aria-hidden
              className="block w-8 h-[3px] bg-papaya rounded-full mb-4"
            />
            <h2
              className="font-display font-black tracking-[-0.03em] text-corbeau text-[1.5rem] md:text-[1.8rem] leading-[1.2] scroll-mt-28"
              {...p}
            />
          </FadeUp>
        ),

        h3: (p: ComponentProps<"h3">) => (
          <FadeUp as="div" className="mt-10 mb-3">
            <h3
              className="font-display font-bold tracking-[-0.02em] text-corbeau text-[1.15rem] md:text-[1.25rem] leading-[1.3] scroll-mt-28"
              {...p}
            />
          </FadeUp>
        ),

        h4: (p: ComponentProps<"h4">) => (
          <h4
            className="font-display font-semibold tracking-[-0.015em] text-corbeau text-[1rem] md:text-[1.06rem] mt-8 mb-2 scroll-mt-28"
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
          <FadeUp as="div" className="my-10">
            <blockquote
              className="border-l-[3px] border-papaya pl-6 py-2 text-corbeau/85 italic text-[1.08rem] md:text-[1.14rem] leading-[1.65] [&>p]:my-2"
              {...p}
            />
          </FadeUp>
        ),

        code: (p: ComponentProps<"code">) => (
          <code
            className="font-mono text-[0.87em] bg-bone text-corbeau px-1.5 py-0.5 rounded border border-corbeau/[0.08]"
            {...p}
          />
        ),

        pre: (p: ComponentProps<"pre">) => (
          <pre
            className="bg-corbeau text-bone font-mono text-[0.85rem] leading-[1.65] p-6 rounded-xl overflow-x-auto my-8 [&>code]:bg-transparent [&>code]:border-0 [&>code]:text-bone [&>code]:p-0"
            {...p}
          />
        ),

        // Markdown-generated tables get an explicit overflow wrapper + full
        // styling. Raw HTML tables in migrated WordPress content are handled
        // via the .prose-noel CSS rules in globals.css.
        table: (p: ComponentProps<"table">) => (
          <FadeUp
            as="figure"
            className="not-prose my-10 -mx-2 md:mx-0 overflow-x-auto rounded-xl border border-corbeau/[0.08] bg-paper shadow-[0_2px_20px_rgba(14,16,32,0.04)]"
          >
            <table
              className="min-w-full text-[0.9rem] border-collapse"
              {...p}
            />
          </FadeUp>
        ),

        thead: (p: ComponentProps<"thead">) => (
          <thead style={{ background: "var(--color-papaya)" }} {...p} />
        ),

        tbody: (p: ComponentProps<"tbody">) => (
          <tbody
            className="[&>tr:nth-child(even)]:bg-bone/40 [&>tr]:transition-colors [&>tr:hover]:bg-papaya/[0.04]"
            {...p}
          />
        ),

        th: (p: ComponentProps<"th">) => (
          <th
            className="text-left font-display font-black tracking-[-0.01em] text-corbeau text-[0.88rem] py-3.5 px-5 first:pl-6 last:pr-6 whitespace-nowrap"
            {...p}
          />
        ),

        td: (p: ComponentProps<"td">) => (
          <td
            className="text-night border-t border-corbeau/[0.06] py-3.5 px-5 first:pl-6 last:pr-6 leading-[1.58] align-top first:font-semibold first:text-corbeau"
            {...p}
          />
        ),

        hr: () => (
          <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-corbeau/12 to-transparent" />
        ),

        // FAQ: <details>/<summary> blocks from WordPress content.
        // The group-open: variants handle open/close state.
        // Answers are in the DOM and crawlable — no JS-only content hiding.
        details: (p: ComponentProps<"details">) => (
          <details
            className="group not-prose border-b border-corbeau/[0.08] py-5 first:border-t first:border-corbeau/[0.08] first:pt-5 last:pb-5 [&_summary::-webkit-details-marker]:hidden [&_summary]:list-none"
            {...p}
          />
        ),

        summary: ({ children, ...rest }: ComponentProps<"summary">) => (
          <summary
            className="flex items-start justify-between gap-4 cursor-pointer font-display font-bold text-corbeau text-[1rem] md:text-[1.06rem] tracking-[-0.02em] leading-[1.35] hover:text-papaya transition-colors duration-150 select-none"
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
