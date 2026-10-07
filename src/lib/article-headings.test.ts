import { describe, expect, it } from "vitest";
import { extractHeadings } from "./article-headings";
import { getLocalizedArticle } from "./localized-article-routing";

describe("article heading underscore delimiters", () => {
  it.each(["de", "es", "fr", "hi", "it", "ja", "ko", "nl", "pt", "ru", "tr"])(
    "strips underscore emphasis from every %s heading of the scope template article",
    (locale) => {
      const post = getLocalizedArticle(
        locale,
        "sap-project-scope-template-management-and-control",
      );
      expect(post).not.toBeNull();
      expect(post?.isFallback).toBe(false);
      const headings = extractHeadings(post!.body);
      expect(headings.length).toBeGreaterThan(3);
      for (const heading of headings) {
        expect(heading.text).not.toMatch(/(^|\s)_|_(\s|$)/u);
        expect(heading.id).not.toMatch(/^_|_$/u);
      }
    },
  );

  it.each([
    ["single emphasis", "_alpha_", "alpha", "alpha"],
    ["double emphasis", "__alpha__", "alpha", "alpha"],
    ["triple nested emphasis", "___alpha___", "alpha", "alpha"],
    ["strong inside emphasis", "_alpha __beta__ gamma_", "alpha beta gamma", "alpha-beta-gamma"],
    ["emphasis inside strong", "__alpha _beta_ gamma__", "alpha beta gamma", "alpha-beta-gamma"],
    ["mixed delimiters", "_alpha **beta** gamma_", "alpha beta gamma", "alpha-beta-gamma"],
    ["escaped underscores", String.raw`\_alpha\_`, "_alpha_", "_alpha_"],
    ["intraword underscores", "alpha_beta_gamma", "alpha_beta_gamma", "alpha_beta_gamma"],
    ["unmatched underscores", "_alpha", "_alpha", "_alpha"],
    ["spaced literal underscores", "_ alpha _", "_ alpha _", "_-alpha-_"],
    ["code spans", "`_alpha_`", "_alpha_", "_alpha_"],
    ["code inside emphasis", "_alpha `beta_gamma`_", "alpha beta_gamma", "alpha-beta_gamma"],
    ["link destinations", "[_alpha_](/_destination_)", "alpha", "alpha"],
    ["asterisk emphasis", "**alpha** *beta*", "alpha beta", "alpha-beta"],
  ])("handles %s", (_name, source, text, id) => {
    expect(extractHeadings(`## ${source}`)).toEqual([{ level: 2, text, id }]);
  });

  it("resolves reference definitions across the full input without editing their identifiers", () => {
    expect(extractHeadings("## [_alpha_][_ref_]\n\n[_ref_]: /_destination_")).toEqual([
      { level: 2, text: "[alpha][_ref_]", id: "alpha_ref_" },
    ]);
  });

  it("recognizes emphasis inside resolved shortcut reference text", () => {
    expect(extractHeadings("## [_ref_]\n\n[_ref_]: /target")).toEqual([
      { level: 2, text: "[ref]", id: "ref" },
    ]);
  });

  it("preserves existing fence exclusion and H2/H3 inclusion and order", () => {
    expect(extractHeadings("# _ignored_\n## _first_\n```md\n## _code_\n```\n### __second__\n#### _ignored_\n")).toEqual([
      { level: 2, text: "first", id: "first" },
      { level: 3, text: "second", id: "second" },
    ]);
  });

  it("retains existing regex limitations rather than adopting all parser headings", () => {
    expect(extractHeadings("Setext _heading_\n---\n\n> ## _quoted_\n\n    ## _indented_\n\n## visible\n")).toEqual([
      { level: 2, text: "visible", id: "visible" },
    ]);
  });

  it("retains whole-input slugger numbering across a simulated renderer split", () => {
    const first = "## _repeat_\n";
    const second = "### repeat\n## __repeat__\n";
    expect(extractHeadings(first + second).map(({ id }) => id)).toEqual([
      "repeat", "repeat-1", "repeat-2",
    ]);
    // The separately invoked helper still resets, as existing split consumers do.
    expect(extractHeadings(second).map(({ id }) => id)).toEqual(["repeat", "repeat-1"]);
  });

  it("uses UTF-16 source positions without disturbing non-BMP text", () => {
    expect(extractHeadings("😀 body\n\n## 😀 _alpha_ beta_gamma")).toEqual([
      { level: 2, text: "😀 alpha beta_gamma", id: "-alpha-beta_gamma" },
    ]);
  });
});
