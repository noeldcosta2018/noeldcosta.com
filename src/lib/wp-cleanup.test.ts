import { describe, expect, it } from "vitest";
import { cleanWordPressArtifacts, replaceTestimonialSliders } from "./wp-cleanup";

describe("WordPress export cleanup", () => {
  it("drops lines that would print stray bold markers", () => {
    const body = ["Intro.", "", "[](https://noeldcosta.com/x/)[**", "", "## Next", "", "**", "", "Text with **bold**."].join("\n");
    const cleaned = cleanWordPressArtifacts(body);
    expect(cleaned).not.toMatch(/^\s*\[?\*\*\s*$/m);
    expect(cleaned).toContain("Text with **bold**.");
    expect(cleaned).toContain("## Next");
  });

  it("puts the testimonials grid in place of a slider, with the given link line", () => {
    const slider = "![Ann Lee](/a.webp) Ann Lee quote ![Bo Kim](/b.webp) Bo Kim quote";
    const body = `Intro.\n\n${slider}\n\nOutro.`;
    expect(replaceTestimonialSliders(body, ["Ann Lee", "Bo Kim"])).toContain("[See the case studies](/case-studies/)");
    const localized = replaceTestimonialSliders(body, ["Ann Lee", "Bo Kim"], "[Fallstudien](/de/case-studies/)");
    expect(localized).toContain("<testimonials-grid></testimonials-grid>\n\n[Fallstudien](/de/case-studies/)");
    expect(localized).not.toContain("Ann Lee quote");
  });
});
