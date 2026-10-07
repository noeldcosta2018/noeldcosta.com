import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { describe, expect, it } from "vitest";
import MdxBody from "../components/mdx/MdxBody";
import { extractHeadings } from "./article-headings";
import { headingsBySegment } from "./article-heading-ids";
import { splitAtMidH2 } from "./article-split";
import { getPost } from "./content";
import { getLocalizedArticle } from "./localized-article-routing";

// Mirrors PostPage: ToC over the full body, body rendered in two segments.
function renderArticle(body: string) {
  const headings = extractHeadings(body);
  const [top, bottom] = splitAtMidH2(body);
  const [headingsTop, headingsBottom] = headingsBySegment(headings, [top, bottom]);
  const reservedHeadingIds = headings.map((h) => h.id);
  const segment = (source: string, segmentHeadings: typeof headings) =>
    renderToStaticMarkup(
      createElement(MdxBody, { source, headings: segmentHeadings, reservedHeadingIds }),
    );
  const html = segment(top, headingsTop) + (bottom ? segment(bottom, headingsBottom) : "");
  const $ = load(html);
  const rendered = $("h1,h2,h3,h4,h5,h6")
    .map((_, el) => $(el).attr("id"))
    .get() as string[];
  const tocTargets = $("h2,h3").map((_, el) => $(el).attr("id")).get() as string[];
  // Self-link wrapped around each heading (absent when the heading already
  // contains its own link): [heading id, href] pairs.
  const anchors = $("h2 > a.heading-anchor, h3 > a.heading-anchor")
    .map((_, el) => [[$(el).parent().attr("id"), $(el).attr("href")]])
    .get() as [string, string][];
  return { headings, top, bottom, rendered, tocTargets, anchors };
}

function expectTocResolves(body: string) {
  const result = renderArticle(body);
  const tocIds = result.headings.map((h) => h.id);
  // Every ToC href lands on a rendered heading, in order, and is unique.
  expect(result.tocTargets).toEqual(tocIds);
  expect(new Set(tocIds).size).toBe(tocIds.length);
  // Each heading's self-link points at its own id.
  expect(result.anchors.length).toBeGreaterThan(0);
  for (const [id, href] of result.anchors) expect(href).toBe(`#${id}`);
  return result;
}

describe("article heading ids across rendered segments", () => {
  // Five H2s so splitAtMidH2 actually splits; "Overview" and "FAQ" repeat
  // on both sides of the split, which used to reset rehype-slug's counter.
  const body = [
    "## Overview", "", "a", "", "### FAQ", "", "b", "", "## Planning", "", "c", "", "c", "",
    "## Delivery", "", "d", "", "d", "",
    "## Overview", "", "e", "", "### FAQ", "", "f", "", "## FAQ", "", "g", "", "## Wrap up", "", "h",
  ].join("\n");

  it("continues duplicate numbering into the second segment", () => {
    const { bottom, tocTargets } = expectTocResolves(body);
    expect(bottom).not.toBe("");
    expect(tocTargets).toEqual([
      "overview", "faq", "planning", "delivery", "overview-1", "faq-1", "faq-2", "wrap-up",
    ]);
  });

  it("matches by text when the renderer sees a heading the ToC skips", () => {
    // An empty "### " line renders as an empty <h3> but is not a ToC entry.
    const withEmpty = body.replace("## Planning", "### \n\n## Planning");
    const { tocTargets, headings } = expectTocResolvesLoose(withEmpty);
    expect(headings.map((h) => h.id)).toEqual([
      "overview", "faq", "planning", "delivery", "overview-1", "faq-1", "faq-2", "wrap-up",
    ]);
    expect(tocTargets.filter((id) => id !== "")).toEqual(headings.map((h) => h.id));
  });

  it("keeps non-ToC headings off ToC ids", () => {
    const { rendered } = renderArticle(
      body.replace("## Wrap up", "#### Overview\n\n## Wrap up"),
    );
    expect(rendered.filter((id) => id === "overview")).toHaveLength(1);
    expect(rendered).toContain("overview-2");
  });
});

function expectTocResolvesLoose(body: string) {
  const result = renderArticle(body);
  const ids = new Set(result.tocTargets);
  for (const h of result.headings) expect(ids.has(h.id)).toBe(true);
  return result;
}

describe("real articles", () => {
  it("English /sap-fico/ ToC hrefs match rendered heading ids", () => {
    const post = getPost("sap-fico", "en");
    expect(post?.isFallback).toBe(false);
    const { headings, bottom } = expectTocResolves(post!.body);
    expect(headings.length).toBeGreaterThanOrEqual(3);
    expect(bottom).not.toBe("");
  });

  it("German /de/sap-fico/ ToC hrefs match rendered heading ids", () => {
    const post = getLocalizedArticle("de", "sap-fico");
    expect(post).not.toBeNull();
    expectTocResolves(post!.body);
  });
  // Headings repeated across the split are covered by the fixture suite above
  // ("article heading ids across rendered segments").
});
