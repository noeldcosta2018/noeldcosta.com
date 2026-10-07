import { describe, expect, test } from "vitest";
import {
  auditHeadingStructure,
  assertHeadingInventory,
  classifyHeadingFindingOrigins,
  extractHeadingInventory,
  normalizeMdxHeadingText,
  mdxBodyLineOffset,
  createOccurrenceAwareSourceMatcher,
  frontmatterHeadingCandidates,
  assertHeadingShardManifest,
  normalizeHeadingText,
  protectedSourceFingerprint,
  combineEvidenceFingerprints,
} from "./heading-structure-audit.mjs";

describe("heading structure extraction", () => {
  test("normalizes entities, Unicode, and whitespace", () => {
    expect(normalizeHeadingText("  Caf\u0065\u0301 &amp;   ERP  ")).toBe("Café & ERP");
  });

  test("normalizes MDX heading markup and escaped punctuation for exact source attribution", () => {
    expect(normalizeMdxHeadingText("1\\. **SAP FI** ([Financial Accounting](/fi/))"))
      .toBe("1. SAP FI (Financial Accounting)");
  });

  test("returns the source-line offset after frontmatter for exact evidence", () => {
    expect(mdxBodyLineOffset("---\ntitle: Example\n---\nBody\n## Heading\n")).toBe(3);
    expect(mdxBodyLineOffset("## Heading\n")).toBe(0);
  });

  test("records native and ARIA headings in document order with selectors and ranks", () => {
    const result = extractHeadingInventory(`
      <main><h1>Page</h1><div role="heading" aria-level="2">Overview</div><h2>Details</h2></main>
    `);
    expect(result.map(({ kind, rank, normalizedText, order }) => ({ kind, rank, normalizedText, order }))).toEqual([
      { kind: "native", rank: 1, normalizedText: "Page", order: 0 },
      { kind: "aria", rank: 2, normalizedText: "Overview", order: 1 },
      { kind: "native", rank: 2, normalizedText: "Details", order: 2 },
    ]);
    expect(result.every((heading) => heading.selector.length > 0)).toBe(true);
  });

  test("inventories role=heading even when aria-level is missing or invalid", () => {
    const result = extractHeadingInventory(`
      <main><h1>Page</h1><div role="heading">Missing</div><div role="heading" aria-level="nope">Invalid</div></main>
    `);
    expect(result.map(({ kind, rank, normalizedText }) => ({ kind, rank, normalizedText }))).toEqual([
      { kind: "native", rank: 1, normalizedText: "Page" },
      { kind: "aria", rank: null, normalizedText: "Missing" },
      { kind: "aria", rank: null, normalizedText: "Invalid" },
    ]);
  });

  test("accepts only complete positive-integer aria-level strings", () => {
    const result = extractHeadingInventory(`
      <div role="heading" aria-level="2">Valid</div>
      <div role="heading" aria-level="2foo">Suffix</div>
      <div role="heading" aria-level="2.5">Decimal</div>
      <div role="heading" aria-level="+2">Sign</div>
      <div role="heading" aria-level="0">Zero</div>
      <div role="heading" aria-level="">Empty</div>
      <div role="heading" aria-level="9007199254740992">Unsafe</div>
    `);
    expect(result.map(({ rank, ariaLevelStatus }) => ({ rank, ariaLevelStatus }))).toEqual([
      { rank: 2, ariaLevelStatus: "valid" },
      { rank: null, ariaLevelStatus: "invalid" },
      { rank: null, ariaLevelStatus: "invalid" },
      { rank: null, ariaLevelStatus: "invalid" },
      { rank: null, ariaLevelStatus: "invalid" },
      { rank: null, ariaLevelStatus: "invalid" },
      { rank: null, ariaLevelStatus: "invalid" },
    ]);
  });

  test("distinguishes visual and accessible exposure for hidden, aria-hidden, inert, and sr-only headings", () => {
    const result = extractHeadingInventory(`
      <main>
        <div hidden><h2>Hidden ancestor</h2></div>
        <h2 aria-hidden="true">Visual only</h2>
        <div inert><h2>Inert visual</h2></div>
        <h2 class="sr-only">Screen reader only</h2>
      </main>
    `);
    expect(result.map(({ normalizedText, visibility, exposure }) => ({ normalizedText, visibility, exposure }))).toEqual([
      { normalizedText: "Hidden ancestor", visibility: "hidden", exposure: { visual: false, accessible: false } },
      { normalizedText: "Visual only", visibility: "visible", exposure: { visual: true, accessible: false } },
      { normalizedText: "Inert visual", visibility: "visible", exposure: { visual: true, accessible: false } },
      { normalizedText: "Screen reader only", visibility: "hidden", exposure: { visual: false, accessible: true } },
    ]);
  });

  test("classifies inline hiding, clipping, responsive state, and animation reveal state conservatively", () => {
    const result = extractHeadingInventory(`
      <main>
        <h2 style="display:none">Display</h2>
        <h2 style="visibility:hidden">Visibility</h2>
        <h2 style="opacity:0">Opacity</h2>
        <h2 style="position:absolute;width:1px;height:1px;clip:rect(0,0,0,0);overflow:hidden">Clip</h2>
        <h2 class="hidden md:block">Responsive</h2>
        <h2 style="opacity:0;transform:translateY(16px)" data-framer-motion="true">Reveal</h2>
      </main>
    `);
    expect(result.map(({ visibility, visibilityReason }) => ({ visibility, visibilityReason }))).toEqual([
      { visibility: "hidden", visibilityReason: "inline-display-none" },
      { visibility: "hidden", visibilityReason: "inline-visibility-hidden" },
      { visibility: "hidden", visibilityReason: "inline-opacity-zero" },
      { visibility: "hidden", visibilityReason: "inline-clipped" },
      { visibility: "indeterminate", visibilityReason: "responsive-visibility" },
      { visibility: "indeterminate", visibilityReason: "animation-reveal-state" },
    ]);
  });

  test("classifies unconditional and breakpoint-prefixed Tailwind visibility utilities without guessing computed CSS", () => {
    const result = extractHeadingInventory(`
      <main>
        <h2 class="invisible">Invisible</h2>
        <h2 class="opacity-0">Opacity</h2>
        <h2 class="absolute w-px h-px overflow-hidden clip">Clipped</h2>
        <h2 class="md:hidden">Responsive hidden</h2>
        <h2 class="sr-only md:not-sr-only">Responsive sr-only</h2>
        <h2 class="not-sr-only md:sr-only">Responsive not-sr-only</h2>
        <div hidden><h2 class="md:block">Strong ancestor</h2></div>
      </main>
    `);
    expect(result.map(({ visibility, visibilityReason }) => ({ visibility, visibilityReason }))).toEqual([
      { visibility: "hidden", visibilityReason: "class-invisible" },
      { visibility: "hidden", visibilityReason: "class-opacity-zero" },
      { visibility: "hidden", visibilityReason: "class-clipped" },
      { visibility: "indeterminate", visibilityReason: "responsive-visibility" },
      { visibility: "indeterminate", visibilityReason: "responsive-visibility" },
      { visibility: "indeterminate", visibilityReason: "responsive-visibility" },
      { visibility: "hidden", visibilityReason: "hidden-attribute" },
    ]);
  });

  test("excludes hidden descendant text when deciding whether a visually exposed heading is nonempty", () => {
    const [heading] = extractHeadingInventory(`
      <main><h1><span hidden>Hidden title</span><span aria-hidden="true">Icon</span></h1></main>
    `);
    expect(heading.normalizedText).toBe("Hidden title Icon");
    expect(heading.visibleText).toBe("Icon");
    expect(heading.accessibleName).toBe("");
  });

  test("records main, fixed chrome, dialog, template, and details regions and states", () => {
    const result = extractHeadingInventory(`
      <main><article><h1>Main</h1></article></main>
      <nav aria-label="Primary"><h2>Nav</h2></nav>
      <footer><h2>Footer</h2></footer>
      <aside class="sidebar"><h2>Side</h2></aside>
      <dialog><h2>Closed dialog</h2></dialog>
      <dialog open><h2>Open dialog</h2></dialog>
      <template><h2>Template</h2></template>
      <details><summary>Question</summary><h2>Closed details</h2></details>
      <details open><summary>Question</summary><h2>Open details</h2></details>
    `);
    expect(result.map(({ region, state }) => ({ region, state }))).toEqual([
      { region: "main/editorial", state: "default" },
      { region: "nav", state: "default" },
      { region: "footer", state: "default" },
      { region: "other", state: "default" },
      { region: "dialog", state: "closed" },
      { region: "dialog", state: "open" },
      { region: "template", state: "template" },
      { region: "details", state: "closed" },
      { region: "details", state: "expanded" },
    ]);
  });

  test("keeps a closed details summary subtree visible while retaining the body as conditional inventory", () => {
    const result = extractHeadingInventory(`
      <main><h1>Page</h1><details><summary><h2>Question</h2></summary><h3>Answer</h3></details></main>
    `);
    expect(result.slice(1).map(({ normalizedText, visibility, state }) => ({ normalizedText, visibility, state }))).toEqual([
      { normalizedText: "Question", visibility: "visible", state: "summary" },
      { normalizedText: "Answer", visibility: "hidden", state: "closed" },
    ]);
  });

  test("assesses a closed details summary heading in its containing editorial outline", () => {
    const skipped = auditHeadingStructure({
      html: '<main><h1>Page</h1><details><summary><h3>Question</h3></summary><h2>Answer</h2></details></main>',
    });
    expect(skipped.implementationDefects).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "native-heading-rank-skip", fromRank: 1, toRank: 3 }),
      expect.objectContaining({ code: "accessible-heading-rank-skip", fromRank: 1, toRank: 3 }),
    ]));

    const valid = auditHeadingStructure({
      html: '<main><h1>Page</h1><details><summary><h2>Question</h2></summary><h3>Answer</h3></details></main>',
    });
    expect(valid.implementationDefects.filter(({ code }) => code.endsWith("heading-rank-skip"))).toHaveLength(0);
  });

  test("does not treat role=dialog on a non-dialog element as closed merely because open is absent", () => {
    const [heading] = extractHeadingInventory('<div role="dialog" aria-label="Panel"><h2>Panel title</h2></div>');
    expect(heading).toEqual(expect.objectContaining({ region: "dialog", state: "default", visibility: "visible" }));
  });
});

describe("heading structure policy", () => {
  test("reports missing, empty, and multiple page H1 candidates", () => {
    expect(auditHeadingStructure({ html: "<main><h2>Start</h2></main>" }).implementationDefects)
      .toEqual(expect.arrayContaining([expect.objectContaining({ code: "missing-page-h1" })]));
    expect(auditHeadingStructure({ html: "<main><h1><span hidden>Empty</span></h1></main>" }).implementationDefects)
      .toEqual(expect.arrayContaining([expect.objectContaining({ code: "empty-page-h1" })]));
    expect(auditHeadingStructure({ html: "<main><h1>One</h1><h1>Two</h1></main>" }).implementationDefects)
      .toEqual(expect.arrayContaining([expect.objectContaining({ code: "multiple-page-h1" })]));
  });

  test("defers responsive duplicate H1 candidates to browser proof", () => {
    const result = auditHeadingStructure({
      html: '<header><h1 class="hidden md:block">Desktop</h1><h1 class="md:hidden">Mobile</h1></header>',
    });
    expect(result.implementationDefects).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "multiple-page-h1" }),
      expect.objectContaining({ code: "missing-visible-page-h1" }),
    ]));
    expect(result.unresolvedFindings).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "page-h1-count-browser-proof-required" }),
    ]));
  });

  test("records visual heading emptiness independently from an accessible aria-label", () => {
    const result = auditHeadingStructure({ html: '<main><h1>Page</h1><h2 aria-label="Section"></h2></main>' });
    expect(result.implementationDefects).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "empty-visual-heading" }),
    ]));
    expect(result.headings[1]).toEqual(expect.objectContaining({ visibleText: "", accessibleName: "Section" }));
  });

  test.each([
    '<h2 class="md:block" aria-label="Section"></h2>',
    '<h2 style="opacity:0;transform:translateY(16px)" data-framer-motion="true" aria-label="Section"></h2>',
  ])("reports an empty non-hidden visual heading in an indeterminate state: %s", (heading) => {
    const result = auditHeadingStructure({ html: `<main><h1>Page</h1>${heading}</main>` });
    expect(result.headings[1]).toEqual(expect.objectContaining({
      visibility: "indeterminate",
      visibleText: "",
      accessibleName: "Section",
    }));
    expect(result.implementationDefects).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "empty-visual-heading" }),
    ]));
  });

  test("does not let an sr-only H1 satisfy the visible page-H1 requirement", () => {
    const result = auditHeadingStructure({ html: '<main><h1 class="sr-only">Accessible title</h1></main>' });
    expect(result.implementationDefects).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "missing-visible-page-h1" }),
    ]));
    expect(result.headings[0].exposure.accessible).toBe(true);
  });

  test("visually counts aria-hidden H1 and reports its accessibility defect", () => {
    const result = auditHeadingStructure({ html: '<main><h1 aria-hidden="true">Visual title</h1></main>' });
    expect(result.implementationDefects).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "missing-page-h1" }),
    ]));
    expect(result.implementationDefects).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "heading-hidden-from-accessibility-tree" }),
    ]));
  });

  test("treats animation reveal H1 as a browser-proof candidate rather than permanently hidden", () => {
    const result = auditHeadingStructure({
      html: '<main><h1 style="opacity:0;transform:translateY(16px)" data-framer-motion="true">Title</h1></main>',
    });
    expect(result.implementationDefects).toHaveLength(0);
    expect(result.unresolvedFindings).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "page-h1-visibility-browser-proof-required" }),
    ]));
    expect(result.browserProofLimits).toContain("computed-visibility-and-settled-animation-state");
  });

  test("reports downward rank skips but permits upward jumps and same-rank siblings", () => {
    const skipped = auditHeadingStructure({ html: "<main><h1>A</h1><h3>B</h3><h2>C</h2><h4>D</h4></main>" });
    expect(skipped.implementationDefects.filter((finding) => finding.code === "native-heading-rank-skip"))
      .toEqual([
        expect.objectContaining({ fromRank: 1, toRank: 3 }),
        expect.objectContaining({ fromRank: 2, toRank: 4 }),
      ]);
    const valid = auditHeadingStructure({ html: "<main><h1>A</h1><h2>B</h2><h3>C</h3><h2>D</h2><h2>E</h2></main>" });
    expect(valid.implementationDefects.filter((finding) => finding.code === "native-heading-rank-skip"))
      .toHaveLength(0);
  });

  test("does not let an ARIA-only level 2 bridge a native H1 to native H3 skip", () => {
    const result = auditHeadingStructure({
      html: '<main><h1>Page</h1><div role="heading" aria-level="2">ARIA section</div><h3>Native subsection</h3></main>',
    });
    expect(result.implementationDefects).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "native-heading-rank-skip", fromRank: 1, toRank: 3 }),
    ]));
    expect(result.implementationDefects).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "accessible-heading-rank-skip" }),
    ]));
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "native-accessible-outline-divergence" }),
    ]));
  });

  test("includes sr-only headings in the accessible sequence but not the native visual sequence", () => {
    const result = auditHeadingStructure({
      html: '<main><h1>Page</h1><h2 class="sr-only">Accessible section</h2><h3>Visible subsection</h3></main>',
    });
    expect(result.implementationDefects).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "native-heading-rank-skip", fromRank: 1, toRank: 3 }),
    ]));
    expect(result.implementationDefects).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "accessible-heading-rank-skip" }),
    ]));
  });

  test("reports missing and invalid aria-level values distinctly", () => {
    const result = auditHeadingStructure({
      html: '<main><h1>Page</h1><div role="heading">Missing</div><div role="heading" aria-level="0">Invalid</div></main>',
    });
    expect(result.implementationDefects).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "missing-aria-heading-level" }),
      expect.objectContaining({ code: "invalid-aria-heading-level" }),
    ]));
  });

  test("does not allow opacity-0 H1 to satisfy visible H1 and requires browser proof for breakpoint H1", () => {
    const hidden = auditHeadingStructure({ html: '<main><h1 class="opacity-0">Hidden</h1></main>' });
    expect(hidden.implementationDefects).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "missing-visible-page-h1" }),
    ]));
    const responsive = auditHeadingStructure({ html: '<main><h1 class="md:hidden">Responsive</h1></main>' });
    expect(responsive.unresolvedFindings).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "page-h1-visibility-browser-proof-required" }),
    ]));
  });

  test("does not reset heading rank at section, article, or component boundaries", () => {
    const result = auditHeadingStructure({
      html: "<main><h1>A</h1><section><h3>B</h3></section><article><h4>C</h4></article><div data-component><h5>D</h5></div></main>",
    });
    expect(result.implementationDefects.filter((finding) => finding.code === "native-heading-rank-skip"))
      .toEqual([expect.objectContaining({ fromRank: 1, toRank: 3 })]);
  });

  test.each([
    ['<h1>Page</h1><article><h3>Article</h3></article>', "article"],
    ['<header><h1>Page</h1></header><main><h3>Main</h3></main>', "header-main"],
  ])("preserves the primary outline across %s boundaries", (html) => {
    const result = auditHeadingStructure({ html });
    expect(result.implementationDefects).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "native-heading-rank-skip", fromRank: 1, toRank: 3 }),
      expect.objectContaining({ code: "accessible-heading-rank-skip", fromRank: 1, toRank: 3 }),
    ]));
  });

  test("evaluates named chrome separately and excludes closed conditional content from the default sequence", () => {
    const result = auditHeadingStructure({
      html: `
        <main><h1>Page</h1><h2>Section</h2></main>
        <footer><h2>Footer group</h2><h3>Links</h3></footer>
        <dialog><h5>Closed</h5></dialog>
        <details><summary>Question</summary><h5>Answer</h5></details>
      `,
    });
    expect(result.implementationDefects.filter((finding) => finding.code === "native-heading-rank-skip")).toHaveLength(0);
    expect(result.conditionalInventory).toHaveLength(2);
  });

  test("audits open dialogs for a heading or accessible label and expanded details in their own sequence", () => {
    const result = auditHeadingStructure({
      html: `
        <main><h1>Page</h1></main>
        <dialog open><p>No heading</p></dialog>
        <details open><summary>Question</summary><h4>Answer</h4></details>
      `,
    });
    expect(result.implementationDefects).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "open-dialog-missing-heading-or-label" }),
      expect.objectContaining({ code: "conditional-native-heading-rank-skip", toRank: 4 }),
    ]));
  });

  test("audits a visible non-native role=dialog for a heading or accessible label", () => {
    const result = auditHeadingStructure({ html: '<main><h1>Page</h1></main><div role="dialog"><p>Body</p></div>' });
    expect(result.implementationDefects).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "visible-dialog-missing-heading-or-label" }),
    ]));
  });

  test("does not let hidden or inaccessible-only descendant headings satisfy an active dialog label contract", () => {
    const hiddenOnly = auditHeadingStructure({
      html: '<main><h1>Page</h1></main><div role="dialog"><h2 hidden>Hidden title</h2><h2 aria-hidden="true">Inaccessible title</h2></div>',
    });
    expect(hiddenOnly.implementationDefects).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "visible-dialog-missing-heading-or-label" }),
    ]));

    const exposed = auditHeadingStructure({
      html: '<main><h1>Page</h1></main><div role="dialog"><h2>Visible title</h2></div>',
    });
    expect(exposed.implementationDefects).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "visible-dialog-missing-heading-or-label" }),
    ]));

    const labelled = auditHeadingStructure({
      html: '<main><h1>Page</h1></main><div role="dialog" aria-label="Panel"><h2 hidden>Hidden title</h2></div>',
    });
    expect(labelled.implementationDefects).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "visible-dialog-missing-heading-or-label" }),
    ]));
  });

  test("audits a visible non-native role=dialog outline from a rank-one baseline", () => {
    const skipped = auditHeadingStructure({
      html: '<main><h1>Page</h1></main><div role="dialog"><h4>Dialog</h4></div>',
    });
    expect(skipped.implementationDefects).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "conditional-native-heading-rank-skip", fromRank: 1, toRank: 4 }),
      expect.objectContaining({ code: "conditional-accessible-heading-rank-skip", fromRank: 1, toRank: 4 }),
    ]));

    const valid = auditHeadingStructure({
      html: '<main><h1>Page</h1></main><div role="dialog" aria-label="Panel"><h2>Dialog</h2></div>',
    });
    expect(valid.implementationDefects.filter(({ code }) => code.startsWith("conditional-") && code.endsWith("heading-rank-skip")))
      .toHaveLength(0);
  });

  test("does not audit a closed native dialog merely because it repeats role=dialog", () => {
    const result = auditHeadingStructure({ html: '<main><h1>Page</h1></main><dialog role="dialog"><p>Body</p></dialog>' });
    expect(result.implementationDefects).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "open-dialog-missing-heading-or-label" }),
    ]));
  });

  test("keeps a generic editorial aside in the main outline unless it has a named heading-region marker", () => {
    const result = auditHeadingStructure({
      html: '<main><h1>Page</h1><aside><h3>Editorial aside</h3></aside><aside data-heading-region="product-promo"><h2>Promo</h2></aside></main>',
    });
    expect(result.headings[1]).toEqual(expect.objectContaining({ region: "main/editorial" }));
    expect(result.headings[2]).toEqual(expect.objectContaining({ region: "named:product-promo" }));
  });

  test("applies only named exceptions with rationale and evidence", () => {
    const result = auditHeadingStructure({
      html: "<main><h1>Page</h1><h3>Legacy section</h3></main>",
      exceptions: [{
        name: "legacy-widget-outline",
        code: "native-heading-rank-skip",
        selector: "main:nth-of-type(1) > h3:nth-of-type(1)",
        rationale: "Third-party widget contract",
        evidence: "ticket-123",
      }, {
        name: "legacy-widget-accessible-outline",
        code: "accessible-heading-rank-skip",
        selector: "main:nth-of-type(1) > h3:nth-of-type(1)",
        rationale: "Third-party widget contract",
        evidence: "ticket-123",
      }],
    });
    expect(result.implementationDefects).toHaveLength(0);
    expect(result.exceptions).toHaveLength(2);
  });
});

describe("heading audit inventory and origin policy", () => {
  test("fingerprints protected source paths and exact bytes deterministically and detects mutations", () => {
    const sources = [
      { path: "content/pages/b/en.mdx", bytes: Buffer.from("beta\r\n") },
      { path: "content/pages/a/en.mdx", bytes: Buffer.from("alpha\n") },
    ];
    const fingerprint = protectedSourceFingerprint(sources);
    expect(protectedSourceFingerprint([...sources].reverse())).toBe(fingerprint);
    expect(protectedSourceFingerprint([
      sources[0],
      { ...sources[1], bytes: Buffer.from("alpha changed\n") },
    ])).not.toBe(fingerprint);
    expect(protectedSourceFingerprint([
      { ...sources[0], path: "content/pages/c/en.mdx" },
      sources[1],
    ])).not.toBe(fingerprint);
  });

  test("combines labeled evidence fingerprints deterministically with mutation sensitivity", () => {
    const inputs = [
      { name: "artifact", fingerprint: "sha256:aaa" },
      { name: "auditedSources", fingerprint: "sha256:bbb" },
      { name: "publishableCorpus", fingerprint: "sha256:ccc" },
    ];
    const combined = combineEvidenceFingerprints(inputs);
    expect(combineEvidenceFingerprints([...inputs].reverse())).toBe(combined);
    expect(combineEvidenceFingerprints([
      inputs[0],
      inputs[1],
      { ...inputs[2], fingerprint: "sha256:changed" },
    ])).not.toBe(combined);
  });

  test("requires exact count, build identity, fingerprint, and unique URLs", () => {
    const records = [{ url: "/" }, { url: "/about/" }];
    expect(assertHeadingInventory(records, {
      expectedCount: 2,
      buildId: "build-1",
      artifactFingerprint: "sha256:abc",
    })).toEqual(expect.objectContaining({ exact: true, actualCount: 2 }));
    expect(() => assertHeadingInventory(records, {
      expectedCount: 3,
      buildId: "build-1",
      artifactFingerprint: "sha256:abc",
    })).toThrow(/expected 3 records/u);
    expect(() => assertHeadingInventory([{ url: "/" }, { url: "/" }], {
      expectedCount: 2,
      buildId: "build-1",
      artifactFingerprint: "sha256:abc",
    })).toThrow(/duplicate URL/u);
    expect(() => assertHeadingInventory(records, {
      expectedCount: 2,
      buildId: "",
      artifactFingerprint: "",
    })).toThrow(/build identity/u);
  });

  test("classifies exact protected-MDX findings as editorial, shared findings as implementation, and uncertain origins as unresolved", () => {
    const headings = [
      { selector: "main > h3", sourceAttribution: { origin: "protected-mdx", evidence: "content/pages/x/es.mdx:20" } },
      { selector: "footer > h5", sourceAttribution: { origin: "shared-component", evidence: "src/components/Footer.tsx" } },
      { selector: "main > h4", sourceAttribution: { origin: "unresolved", evidence: null } },
    ];
    const findings = [
      { severity: "implementation-defect", code: "native-heading-rank-skip", selector: "main > h3" },
      { severity: "implementation-defect", code: "fixed-region-leading-rank", selector: "footer > h5" },
      { severity: "implementation-defect", code: "native-heading-rank-skip", selector: "main > h4" },
    ];
    const result = classifyHeadingFindingOrigins(findings, headings);
    expect(result.editorialDefects).toEqual([expect.objectContaining({ code: "native-heading-rank-skip" })]);
    expect(result.implementationDefects).toEqual([expect.objectContaining({ code: "fixed-region-leading-rank" })]);
    expect(result.unresolvedFindings).toEqual([expect.objectContaining({ code: "native-heading-rank-skip" })]);
  });

  test("prefers frontmatter h1 evidence and preserves title as a secondary candidate", () => {
    const raw = '---\ntitle: "About Noel"\nh1: "ERP adviser"\n---\nBody';
    expect(frontmatterHeadingCandidates(raw, { title: "About Noel", h1: "ERP adviser" }, "content/pages/about/en.mdx"))
      .toEqual([
        { field: "h1", text: "ERP adviser", evidence: "content/pages/about/en.mdx:3" },
        { field: "title", text: "About Noel", evidence: "content/pages/about/en.mdx:2" },
      ]);
  });

  test("matches repeated protected headings occurrence-by-occurrence and preserves source rank evidence", () => {
    const matcher = createOccurrenceAwareSourceMatcher([
      { rank: 4, text: "1. SAP Basis", evidence: "content/pages/sap-modules/en.mdx:258" },
      { rank: 4, text: "1. SAP Basis", evidence: "content/pages/sap-modules/en.mdx:1412" },
    ]);
    expect(matcher.match({ rank: 3, text: "1. SAP Basis" })).toBeNull();
    expect(matcher.match({ rank: 4, text: "1. SAP Basis" })).toEqual(expect.objectContaining({
      evidence: "content/pages/sap-modules/en.mdx:258",
      occurrence: 1,
    }));
  });

  test.each([
    ["Big Bang", 83],
    ["SAP S/4HANA", 50],
    ["Discover", 70],
  ])("does not consume a later protected H3 when a generated H4 shares text: %s", (text, line) => {
    const matcher = createOccurrenceAwareSourceMatcher([
      { rank: 3, text, evidence: `content/posts/example/en.mdx:${line}` },
    ]);
    expect(matcher.match({ rank: 4, text })).toBeNull();
    expect(matcher.match({ rank: 3, text })).toEqual(expect.objectContaining({
      origin: "protected-mdx",
      evidence: `content/posts/example/en.mdx:${line}`,
      sourceRank: 3,
      renderedRank: 3,
      occurrence: 1,
    }));
  });

  test("reconciles deterministic shard counts, heading totals, unique routes, sizes, and hashes", () => {
    expect(assertHeadingShardManifest({
      expectedRouteCount: 2,
      expectedHeadingCount: 3,
      shards: [
        { locale: "en", routeCount: 1, headingCount: 2, byteLength: 100, sha256: "a".repeat(64), urls: ["/"] },
        { locale: "es", routeCount: 1, headingCount: 1, byteLength: 80, sha256: "b".repeat(64), urls: ["/es/page/"] },
      ],
    })).toEqual(expect.objectContaining({ exact: true, shardCount: 2 }));
    expect(() => assertHeadingShardManifest({
      expectedRouteCount: 2,
      expectedHeadingCount: 3,
      shards: [{ locale: "en", routeCount: 2, headingCount: 3, byteLength: 1, sha256: "bad", urls: ["/", "/"] }],
    })).toThrow(/duplicate shard URL|invalid shard hash/u);
  });
});
