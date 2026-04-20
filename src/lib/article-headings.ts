// Server-safe heading extractor. Runs at build time so the Table of Contents
// is baked into the static HTML — no layout shift, no client-only hydration
// before the nav appears.
//
// Matches rehype-slug's behaviour (github-slugger algorithm) so the generated
// hashes line up with what rehype-slug stamps onto the rendered headings.

import GithubSlugger from "github-slugger";

export interface HeadingEntry {
  level: 2 | 3;
  text: string;
  id: string;
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

  const lines = body.split("\n");
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
