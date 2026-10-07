import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

const component = (name) => readFile(new URL(`../components/${name}`, import.meta.url), "utf8");

describe("shared component heading contracts", () => {
  test("footer section labels begin the fixed footer outline at H2", async () => {
    const source = await component("Footer.tsx");
    // 2026 revamp: one H2 per footer column, rendered from the column list.
    expect(source).toMatch(/<h2 className="group">\{(?:tr\()?col\.title\)?\}<\/h2>/u);
    expect(source).not.toMatch(/<h5\b/gu);
  });

  test("video cards are H3 children of the carousel section H2", async () => {
    const source = await component("VideoCarousel.tsx");
    expect(source).toMatch(/<h3\b[^>]*>\s*\{video\.title\}\s*<\/h3>/su);
    expect(source).not.toMatch(/<h4\b/gu);
  });

  test("the complementary product promotion has an independent H2", async () => {
    const source = await component("article/ProductPromoCard.tsx");
    expect(source).toContain('data-heading-region="product-promo"');
    expect(source).toMatch(/<h2\b[^>]*>\{title\}<\/h2>/su);
    expect(source).not.toMatch(/<h4\b/gu);
  });

  test.each([
    ["article/diagrams/CompareSplit.tsx", "CompareSplit"],
    ["article/diagrams/Stepper.tsx", "Stepper"],
  ])("%s exposes stable shared-component heading provenance", async (name, marker) => {
    const source = await component(name);
    expect(source).toContain(`data-heading-source="${marker}"`);
  });

  test.each([
    ["article/diagrams/CompareSplit.tsx", "side.label"],
    ["article/diagrams/Stepper.tsx", "s"],
  ])("%s uses an H2 component title and H3 child headings", async (name, childExpression) => {
    const source = await component(name);
    expect(source).toMatch(/<h2\b[^>]*>\s*\{(?:title|props\.title)\}\s*<\/h2>/su);
    expect(source).toMatch(new RegExp(`<h3\\b[^>]*>\\s*\\{${childExpression.replace(".", "\\.")}\\}\\s*</h3>`, "su"));
    expect(source).not.toMatch(/<h4\b/gu);
  });

  test("DecisionTree exposes shared provenance and uses H3 for its question below the article section", async () => {
    const source = await component("article/diagrams/DecisionTree.tsx");
    expect(source).toContain('data-heading-source="DecisionTree"');
    expect(source).toMatch(/<h3\b[^>]*>\s*\{props\.question\}\s*<\/h3>/su);
    expect(source).not.toMatch(/<h4\b/gu);
  });

  test.each([
    ["AICapabilities.tsx", "f.title"],
    ["TrackRecord.tsx", "p.title"],
    ["Credentials.tsx", "c.label"],
  ])("%s uses H3 for card titles below its section H2", async (name, expression) => {
    const source = await component(name);
    expect(source).toContain(`<h3`);
    expect(source).toContain(`{${expression}}`);
    expect(source).not.toMatch(/<h4\b/gu);
  });
});
