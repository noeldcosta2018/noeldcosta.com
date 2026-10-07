// Article bodies are rendered in two ReactMarkdown segments (around the
// mid-article promo). rehype-slug runs once per segment, so its duplicate
// counter restarts in the second segment and a repeated heading there gets
// the same id as one in the first segment ("faq" twice instead of "faq-1").
// The ToC is built over the whole body, so its hrefs and the rendered ids
// disagreed. This plugin stamps the ToC's own ids onto the rendered headings
// so both come from a single slug pass over the full body.

import { slug } from "github-slugger";
import { toString } from "hast-util-to-string";
import type { Element, Root, RootContent } from "hast";
import { extractHeadings, type HeadingEntry } from "./article-headings";

export interface HeadingIdOptions {
  /** ToC entries for the headings in this segment, in document order. */
  headings: readonly HeadingEntry[];
  /** Every ToC id across all segments. Other headings never reuse one. */
  reservedIds: readonly string[];
}

/**
 * Split the full-body ToC into one entry list per rendered segment. Segments
 * are consecutive slices of the body cut at line boundaries outside code
 * fences, so the count of headings in each slice is exact.
 */
export function headingsBySegment(
  headings: readonly HeadingEntry[],
  segments: readonly string[],
): HeadingEntry[][] {
  let offset = 0;
  return segments.map((source, index) => {
    const count = index === segments.length - 1
      ? headings.length - offset
      : extractHeadings(source).length;
    const slice = headings.slice(offset, offset + count);
    offset += count;
    return slice;
  });
}

const HEADING = /^h[1-6]$/;

export function rehypeArticleHeadingIds(options: HeadingIdOptions) {
  return (tree: Root): void => {
    const nodes: Element[] = [];
    const visit = (node: Root | RootContent): void => {
      if (node.type === "element" && HEADING.test(node.tagName)) nodes.push(node);
      if ("children" in node) node.children.forEach(visit);
    };
    visit(tree);

    const expected = options.headings;
    const tocNodes = nodes.filter((n) => n.tagName === "h2" || n.tagName === "h3");
    // Normal case: the renderer and the ToC extractor see the same H2/H3
    // sequence, so ids are assigned by position. Otherwise (e.g. an empty
    // "### " line the extractor skips) match by level and slugged text.
    const positional = tocNodes.length === expected.length &&
      tocNodes.every((n, i) => n.tagName === `h${expected[i].level}`);

    const taken = new Set(options.reservedIds);
    let cursor = 0;
    for (const node of nodes) {
      let match = -1;
      if (node.tagName === "h2" || node.tagName === "h3") {
        if (positional) {
          match = cursor;
        } else {
          const key = slug(toString(node));
          for (let j = cursor; j < expected.length; j++) {
            if (node.tagName === `h${expected[j].level}` && slug(expected[j].text) === key) {
              match = j;
              break;
            }
          }
        }
      }
      if (match >= 0) {
        node.properties.id = expected[match].id;
        cursor = match + 1;
        continue;
      }
      // Not a ToC heading: keep rehype-slug's id unless a ToC heading (or an
      // earlier heading here) already owns it; then take the next free suffix.
      let id = String(node.properties.id ?? "");
      if (taken.has(id)) {
        const base = slug(toString(node));
        id = base;
        for (let n = 1; taken.has(id); n++) id = `${base}-${n}`;
      }
      taken.add(id);
      node.properties.id = id;
    }
  };
}
