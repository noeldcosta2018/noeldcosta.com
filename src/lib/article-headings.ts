// Server-safe heading extractor. Runs at build time so the Table of Contents
// is baked into the static HTML — no layout shift, no client-only hydration
// before the nav appears.
//
// Uses the same slugging algorithm as rehype-slug, run once over the full
// body. PostPage renders the body in two segments; article-heading-ids.ts
// stamps these ids onto the rendered headings so ToC hrefs always resolve.

import GithubSlugger from "github-slugger";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

export interface HeadingEntry {
  level: 2 | 3;
  text: string;
  id: string;
}

interface MarkdownNode {
  type: string;
  depth?: number;
  position?: { start: { offset?: number }; end: { offset?: number } };
  children?: MarkdownNode[];
}

const headingParser = unified().use(remarkParse).use(remarkGfm);

// Only remove delimiter characters proven by the full-document parser.
// Literal/escaped underscores, code and reference identifiers stay intact.
// The original body is never changed or passed to the renderer differently.
function removeHeadingUnderscoreDelimiters(body: string): string {
  if (!body.includes("_")) return body;
  const offsets = new Set<number>();
  const visit = (node: MarkdownNode, inHeading: boolean) => {
    const selected = inHeading ||
      (node.type === "heading" && (node.depth === 2 || node.depth === 3));
    if (selected && (node.type === "emphasis" || node.type === "strong")) {
      const width = node.type === "strong" ? 2 : 1;
      const start = node.position?.start.offset;
      const end = node.position?.end.offset;
      if (start !== undefined && end !== undefined &&
          body.slice(start, start + width) === "_".repeat(width) &&
          body.slice(end - width, end) === "_".repeat(width)) {
        for (let i = 0; i < width; i++) {
          offsets.add(start + i);
          offsets.add(end - width + i);
        }
      }
    }
    for (const child of node.children ?? []) visit(child, selected);
  };
  visit(headingParser.parse(body), false);
  if (!offsets.size) return body;
  // Parser offsets count UTF-16 code units, not Unicode code points.
  return body.split("").filter((_, offset) => !offsets.has(offset)).join("");
}

// Strip inline markdown so the ToC label reads cleanly.
//
// Also unescapes backslash-escaped ASCII punctuation (\., \*, \[, etc.) —
// WordPress exports love to over-escape list-marker dots in headings like
// "## 1\. Big Bang" which would otherwise leak `\` into the ToC even though
// the rendered heading body shows a clean `1.`.
function stripInline(md: string): string {
  return md
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links
    .replace(/<[^>]+>/g, "") // stray html tags
    .replace(/&[a-z]+;/gi, "") // html entities
    .replace(/\\([!-/:-@[-`{-~])/g, "$1") // unescape ASCII punct
    .trim();
}

export function extractHeadings(body: string): HeadingEntry[] {
  const slugger = new GithubSlugger();
  const headings: HeadingEntry[] = [];
  let inFence = false;
  const originalLineCount = body.split("\n").length;
  const lines = removeHeadingUnderscoreDelimiters(body).split("\n");
  if (lines.length !== originalLineCount) {
    throw new Error("ToC preprocessing changed source lines");
  }
  for (const raw of lines) {
    // Skip content inside fenced code blocks; those # lines are code, not headings.
    if (/^```/.test(raw)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(raw);
    if (!match) continue;
    const level = match[1].length as 2 | 3;
    const text = stripInline(match[2]);
    if (!text) continue;
    headings.push({ level, text, id: slugger.slug(text) });
  }
  return headings;
}
