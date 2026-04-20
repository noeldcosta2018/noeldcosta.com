import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * Renders post/page markdown as editorial long-form. Uses react-markdown so we
 * never go through the MDX/JSX parser (content is pure markdown from WordPress;
 * no JSX components).
 *
 * Typography notes:
 *   - Body copy sits at ~18px with 1.8 leading for comfortable desktop reading;
 *     the article column is capped at ~760px by the PostPage shell, so this
 *     stays inside the 65–75 character sweet spot.
 *   - Headings drop to Epilogue (display) with tight tracking; the generous
 *     top margin on H2 gives each section room to breathe.
 *   - Blockquotes and unordered lists lean on the papaya accent so they feel
 *     like part of one visual system with the ToC and callouts rather than
 *     stock-markdown defaults.
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
                className="text-canyon underline underline-offset-[3px] decoration-canyon/40 hover:decoration-papaya hover:text-papaya transition-colors"
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
              className="text-canyon underline underline-offset-[3px] decoration-canyon/40 hover:decoration-papaya hover:text-papaya transition-colors"
              {...rest}
            >
              {children}
            </a>
          );
        },
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        img: (p: ComponentProps<"img">) => (
          // Wrap in a figure-like block so inline images get the same rounded
          // framing as the hero image — visual continuity matters on long
          // scrolls. `-mx-*` lets the image breathe slightly wider than the
          // text column on desktop.
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img
            {...p}
            loading="lazy"
            className="rounded-[10px] my-8 w-full h-auto shadow-[0_2px_0_rgba(14,16,32,0.04),0_30px_60px_-40px_rgba(14,16,32,0.25)]"
          />
        ),
        h1: (p: ComponentProps<"h1">) => (
          <h1
            className="font-display font-black tracking-[-0.03em] text-corbeau text-[2.4rem] md:text-[2.9rem] leading-[1.1] mt-10 mb-5"
            {...p}
          />
        ),
        h2: (p: ComponentProps<"h2">) => (
          <h2
            className="font-display font-bold tracking-[-0.022em] text-corbeau text-[1.65rem] md:text-[1.95rem] leading-[1.2] mt-14 mb-4 scroll-mt-28"
            {...p}
          />
        ),
        h3: (p: ComponentProps<"h3">) => (
          <h3
            className="font-display font-bold tracking-[-0.015em] text-corbeau text-[1.25rem] md:text-[1.4rem] leading-[1.3] mt-10 mb-3 scroll-mt-28"
            {...p}
          />
        ),
        h4: (p: ComponentProps<"h4">) => (
          <h4
            className="font-display font-semibold tracking-[-0.01em] text-corbeau text-[1.08rem] md:text-[1.15rem] mt-8 mb-2 scroll-mt-28"
            {...p}
          />
        ),
        p: (p: ComponentProps<"p">) => (
          <p
            className="text-night/95 leading-[1.8] text-[1.075rem] md:text-[1.1rem] my-5 [&>strong]:text-corbeau [&>strong]:font-semibold"
            {...p}
          />
        ),
        ul: (p: ComponentProps<"ul">) => (
          <ul
            className="text-night/95 my-6 space-y-2.5 leading-[1.7] text-[1.05rem] md:text-[1.08rem] [&>li]:relative [&>li]:pl-6 [&>li]:before:content-[''] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.72em] [&>li]:before:w-2 [&>li]:before:h-2 [&>li]:before:rounded-full [&>li]:before:bg-papaya"
            {...p}
          />
        ),
        ol: (p: ComponentProps<"ol">) => (
          <ol
            className="list-decimal marker:text-papaya marker:font-semibold pl-6 text-night/95 my-6 space-y-2.5 leading-[1.7] text-[1.05rem] md:text-[1.08rem]"
            {...p}
          />
        ),
        blockquote: (p: ComponentProps<"blockquote">) => (
          <blockquote
            className="my-8 border-l-[3px] border-papaya pl-6 py-1 text-corbeau/90 italic text-[1.1rem] md:text-[1.18rem] leading-[1.6] [&>p]:my-2"
            {...p}
          />
        ),
        code: (p: ComponentProps<"code">) => (
          <code
            className="font-mono text-[0.88em] bg-bone/90 text-corbeau px-1.5 py-0.5 rounded border border-corbeau/[0.06]"
            {...p}
          />
        ),
        pre: (p: ComponentProps<"pre">) => (
          <pre
            className="bg-corbeau text-bone font-mono text-[0.86rem] leading-[1.6] p-6 rounded-[10px] overflow-x-auto my-8 [&>code]:bg-transparent [&>code]:border-0 [&>code]:text-bone [&>code]:p-0"
            {...p}
          />
        ),
        table: (p: ComponentProps<"table">) => (
          <div className="overflow-x-auto my-8 rounded-[8px] border border-corbeau/10">
            <table
              className="min-w-full text-[0.95rem] border-collapse"
              {...p}
            />
          </div>
        ),
        thead: (p: ComponentProps<"thead">) => (
          <thead className="bg-bone/60" {...p} />
        ),
        th: (p: ComponentProps<"th">) => (
          <th
            className="text-left font-display font-semibold text-corbeau text-[0.92rem] border-b border-corbeau/15 py-3 px-4"
            {...p}
          />
        ),
        td: (p: ComponentProps<"td">) => (
          <td
            className="text-night/90 border-b border-corbeau/[0.08] py-3 px-4 leading-[1.6]"
            {...p}
          />
        ),
        hr: () => (
          <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-corbeau/15 to-transparent" />
        ),
      }}
    >
      {source}
    </ReactMarkdown>
  );
}
