import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { load } from "cheerio";
import { afterEach, describe, expect, it, vi } from "vitest";
import FadeUp from "../components/article/FadeUp";
import TerminalFeed from "../components/TerminalFeed";

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal("window", {
    matchMedia: () => ({ matches, addEventListener() {}, removeEventListener() {} }),
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("reveal components render identically on server and at hydration", () => {
  it.each([true, false])("FadeUp server HTML ignores the visitor preference (reduce=%s)", (reduce) => {
    stubReducedMotion(reduce);
    const $ = load(renderToString(createElement(FadeUp, null, createElement("h2", { id: "x" }, "X"))));
    const wrapper = $("div[data-motion-reveal]");
    expect(wrapper).toHaveLength(1);
    // Same start state either way, so hydration never mismatches; the CSS
    // guard below makes it visible for reduced-motion and no-JS visitors.
    expect(wrapper.attr("style")).toContain("opacity:0");
    expect($("h2#x").text()).toBe("X");
  });

  it("TerminalFeed marks every line for the CSS reveal guard", () => {
    const $ = load(renderToString(createElement(TerminalFeed, { lines: ["a", "b", "c"] })));
    expect($("[data-motion-reveal]")).toHaveLength(3);
  });

  it("globals.css forces revealed content visible for reduced motion and no-script", () => {
    const css = readFileSync("src/app/globals.css", "utf8").replace(/\s+/g, " ");
    const rule = "[data-motion-reveal] { opacity: 1 !important; transform: none !important; }";
    expect(css).toContain(`@media (prefers-reduced-motion: reduce) { ${rule}`);
    expect(css).toContain(`@media (scripting: none) { ${rule}`);
  });

  it("the article reveal components no longer read framer-motion's hook during render", () => {
    for (const file of [
      "src/components/article/FadeUp.tsx",
      "src/components/TerminalFeed.tsx",
      "src/components/article/TableOfContents.tsx",
    ]) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toContain("useReducedMotion");
      expect(source).toContain("usePrefersReducedMotion");
    }
  });
});
