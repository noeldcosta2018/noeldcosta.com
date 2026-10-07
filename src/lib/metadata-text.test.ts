import { describe, expect, it } from "vitest";
import { clampDescription, documentTitle, stripBrandSuffix } from "./seo";
import { normalizeHeadingLevels } from "./md-repair";
import { readingTime } from "./content";

describe("translated title brand tails", () => {
  it.each([
    ["SAP 구현 비용 계산기 - 노엘 디코스타", "SAP 구현 비용 계산기"],
    ["Услуги по внедрению SAP — Ноэль ДКоста", "Услуги по внедрению SAP"],
    ["ERP | नोएल डीकोस्टा - नोएल डीकोस्टा", "ERP"],
    ["RISE mit SAP – ​​Noel DCosta", "RISE mit SAP"],
    ["خدمات تطبيق SAP - نويل دي كوستا", "خدمات تطبيق SAP"],
    ["Pagina senza marchio", "Pagina senza marchio"],
  ])("%s", (input, expected) => {
    expect(stripBrandSuffix(input)).toBe(expected);
  });

  it("adds a single brand suffix afterwards when it fits", () => {
    expect(documentTitle(stripBrandSuffix("SAP 구현 비용 계산기 - 노엘 디코스타")).absolute).toBe(
      "SAP 구현 비용 계산기 | Noel D'Costa",
    );
  });
});

describe("clampDescription", () => {
  it("keeps short descriptions", () => {
    expect(clampDescription("Kurz und gut.")).toBe("Kurz und gut.");
  });

  it("cuts at the last full sentence that fits", () => {
    const text = `${"a".repeat(120)}. ${"b".repeat(80)}.`;
    expect(clampDescription(text)).toBe(`${"a".repeat(120)}.`);
  });

  it("otherwise cuts at a word with an ellipsis", () => {
    const out = clampDescription(Array.from({ length: 40 }, () => "palabra").join(" "))!;
    expect([...out].length).toBeLessThanOrEqual(160);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("readingTime", () => {
  it("counts Japanese by characters, not by spaces", () => {
    expect(readingTime("あ".repeat(2500))).toBe(5);
  });

  it("keeps the English word count", () => {
    expect(readingTime(Array.from({ length: 450 }, () => "word").join(" "))).toBe(2);
  });
});

describe("normalizeHeadingLevels", () => {
  it("keeps sibling headings at one level after a skipped level", () => {
    expect(normalizeHeadingLevels("## A\n#### b\n#### c\n## D")).toBe("## A\n### b\n### c\n## D");
  });

  it("normalizes indented headings inside list items", () => {
    expect(normalizeHeadingLevels("    ## A\n\n    #### b")).toBe("    ## A\n\n    ### b");
  });

  it("leaves fenced code alone", () => {
    expect(normalizeHeadingLevels("```\n# comment\n```")).toBe("```\n# comment\n```");
  });
});
