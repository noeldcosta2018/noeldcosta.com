// Render-time cleanup for WordPress export artefacts left in MDX bodies.
// The source files stay untouched; only what reaches the page is tidied.
//
// - Icon-font glyphs (Unicode private use area, e.g. U+E934 rating stars)
//   exported from a testimonial slider, usually wrapped in underscores:
//   "Name_<glyph>__<glyph>_Role". They render as empty boxes.
// - Shortcodes such as [vispr:catalog] that only meant something to a plugin.
// - Slider clones: carousels export each slide twice, so long paragraphs
//   repeat word for word. Only the first copy is kept.

import { repairCardLinks } from "./md-repair";

// Private use area U+E000 to U+F8FF, built from code points so the source stays readable.
const PRIVATE_USE = `[${String.fromCharCode(0xe000)}-${String.fromCharCode(0xf8ff)}]`;
const ICON_RUN = new RegExp(`_*(?:${PRIVATE_USE}_*)+`, "g");
const SHORTCODE_LINE = /^\s*\\?\[vispr:[^\]\\]*\\?\]\s*$/gm;
const MIN_DUPLICATE_LENGTH = 120;

function dropRepeatedParagraphs(body: string): string {
  const seen = new Set<string>();
  let inFence = false;
  return body
    .split(/(\n\s*\n)/)
    .filter((chunk) => {
      if (/^\n\s*\n$/.test(chunk)) return true;
      const fences = (chunk.match(/^```/gm) ?? []).length;
      const wasInFence = inFence;
      if (fences % 2 === 1) inFence = !inFence;
      if (wasInFence || fences > 0) return true;
      const key = chunk.trim();
      if (key.length < MIN_DUPLICATE_LENGTH || /^(#|\||<)/.test(key)) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join("");
}

// WordPress carousels were exported twice (desktop and mobile slides): the
// same sub-heading with the same text appears again further down. Drop a
// sub-section (H3 and below, up to the next heading) when an identical one
// was already rendered. Only exact repeats go; same heading with different
// text stays.
function dropRepeatedHeadingBlocks(body: string): string {
  const seen = new Set<string>();
  let inFence = false;
  const blocks: string[][] = [[]];
  for (const line of body.split("\n")) {
    if (/^```/.test(line)) inFence = !inFence;
    if (!inFence && /^#{1,6}\s/.test(line)) blocks.push([]);
    blocks[blocks.length - 1].push(line);
  }
  return blocks
    .filter((block) => {
      if (!/^#{3,6}\s/.test(block[0] ?? "")) return true;
      const key = block.join("\n").replace(/\s+/g, " ").trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((block) => block.join("\n"))
    .join("\n");
}

// Builder attributes that leaked into text, e.g. class=”\_fadeIn\_m1hgl\_8″>
const LEAKED_CLASS_ATTR = /\s*class=[“”″"][^“”″"]{0,80}[“”″"]>/g;
// Orphan link fragments from accordions: lines made only of "**](url)**" and "[](url)".
const ORPHAN_LINK_LINE = /^\s*(?:\*\*\]\([^)\s]+\)\*\*|\[\]\([^)\s]+\))+\s*$/gm;
const EMPTY_LINK = /\[\]\([^)\s]+\)/g;
// The same accordion fragment at the start of a line that carries more content.
const LEADING_LINK_FRAGMENT = /^(\s*)\*\*\]\([^)\s]+\)\*\*/gm;
// A line holding only "**" or "[**" can never open or close bold (the marker
// touches whitespace), so it would print as literal asterisks.
const STRAY_BOLD_LINE = /^[ \t]*\[?\*\*[ \t]*$/gm;

export function cleanWordPressArtifacts(body: string): string {
  const cleaned = repairCardLinks(body)
    .replace(SHORTCODE_LINE, "")
    .replace(LEAKED_CLASS_ATTR, "")
    .replace(ORPHAN_LINK_LINE, "")
    .replace(LEADING_LINK_FRAGMENT, "$1")
    .replace(EMPTY_LINK, "")
    .replace(STRAY_BOLD_LINE, "")
    .replace(ICON_RUN, " · ")
    .replace(/ · (\s*\n)/g, "$1");
  return dropRepeatedParagraphs(dropRepeatedHeadingBlocks(cleaned)).replace(/\n{3,}/g, "\n\n");
}

/**
 * WordPress testimonial sliders were exported as one run-on paragraph of
 * quotes, avatars, names and roles. On English pages, replace each such
 * paragraph with the structured testimonials grid (verbatim quotes from
 * src/components/article/testimonials/data.ts), once per page. Translated
 * pages keep the quotes in English as well, so they get the same grid with
 * their own link line under it.
 */
export const TESTIMONIAL_LINKS =
  "[See the case studies](/case-studies/) · [All recommendations on LinkedIn](https://www.linkedin.com/in/noeldcosta/)";

export function replaceTestimonialSliders(
  body: string,
  names: readonly string[],
  links: string = TESTIMONIAL_LINKS,
): string {
  let inserted = false;
  return body
    .split(/(\n\s*\n)/)
    .map((chunk) => {
      const avatars = names.filter((name) => chunk.includes(`![${name}](`)).length;
      if (avatars < 2) return chunk;
      if (inserted) return "";
      inserted = true;
      return [
        "<testimonials-grid></testimonials-grid>",
        "",
        links,
      ].join("\n");
    })
    .join("")
    .replace(/\n{3,}/g, "\n\n");
}
