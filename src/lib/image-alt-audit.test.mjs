import { describe, expect, it } from "vitest";
import * as imageAudit from "./image-alt-audit.mjs";
import { createHash } from "node:crypto";
import { auditImageAlternatives, normalizeAlternativeText, computeAccessibleName, compareEquivalentImageAlternatives, IMAGE_ALT_POLICY } from "./image-alt-audit.mjs";

const audit = (html, options = {}) => auditImageAlternatives({ html, locale: "en", ...options });

describe("build source parsing and ownership", () => {
  const parse = (raw) => {
    expect(imageAudit.parseImageSource).toBeTypeOf("function");
    return imageAudit.parseImageSource({ raw, sourcePath: "content/posts/example/en.mdx" });
  };
  const resolve = (html, source, template = "post") => {
    expect(imageAudit.createImageAttributionResolver).toBeTypeOf("function");
    return audit(html, { sourceAttribution: imageAudit.createImageAttributionResolver({ source, template }) }).images;
  };
  it("extracts linked/ordinary Markdown and HTML images with original line and missing/empty alt", () => {
    const source = parse('---\ntitle: Title\nhero: /hero.png\nheroAlt: Authored\ncover: /cover.png\ncoverAlt: ""\n---\n![First](/a.png)\n[![Second](/b.png)](/go)\n<img src="/c.png">\n<img src="/d.png" alt="">');
    expect(source.images.map(({ source, altPresent, alt, evidence }) => [source, altPresent, alt, evidence])).toEqual([
      ["/a.png", true, "First", "content/posts/example/en.mdx:8"], ["/b.png", true, "Second", "content/posts/example/en.mdx:9"],
      ["/c.png", false, null, "content/posts/example/en.mdx:10"], ["/d.png", true, "", "content/posts/example/en.mdx:11"],
    ]);
    expect(source.frontmatterImages).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: "hero", source: "/hero.png", altField: "heroAlt", alt: "Authored", evidence: "content/posts/example/en.mdx:3", altEvidence: "content/posts/example/en.mdx:4" }),
      expect.objectContaining({ field: "cover", altPresent: true, alt: "" }),
    ]));
  });
  it("excludes fenced and inline code, comments, and unsupported image references", () => {
    const source = parse('```html\n<img src="/fake.png">\n```\n<!-- <img src="/comment.png"> -->\n`![Fake](/code.png)`\n![Real &amp; clear](/real.png)\n![Ref][x]\n\n[x]: /reference.png\n<about-hero></about-hero>');
    expect(source.images).toHaveLength(1);
    expect(source.images[0]).toMatchObject({ alt: "Real & clear" });
    expect(source.customTags).toContain("about-hero");
    expect(source.unsupported).toContainEqual(expect.objectContaining({ code: "unsupported-image-reference" }));
  });
  it("rejects raw paths before parsing and fails frontmatter parse errors", () => {
    expect(imageAudit.parseImageSource).toBeTypeOf("function");
    expect(() => imageAudit.parseImageSource({ sourcePath: "x.raw.mdx", get raw() { throw Error("must not access"); } })).toThrow(/raw/i);
    expect(() => parse('---\ntitle: [broken\n---\n![A](/a.png)')).toThrow();
  });
  it("does not guess dynamic raw HTML attributes", () => {
    const source = parse('<img src={hero} alt="A">');
    expect(source.images).toHaveLength(0);
    expect(source.unsupported).toHaveLength(1);
  });
  it("requires a proven prose wrapper and exact source; raw prose nav/footer are protected", () => {
    const source = parse('<img src="/a.png" alt="A">\n<img src="/b.png">');
    const images = resolve('<img src="/a.png" alt="A"><div class="prose-noel"><nav><img src="/a.png" alt="A"></nav><footer><img src="/b.png"></footer><img src="/unknown.png" alt="A"></div>', source);
    expect(images.map((x) => x.ownership)).toEqual(["unresolved", "protected-mdx", "protected-mdx", "unresolved"]);
  });
  it("gives existing generated markers precedence without consuming protected occurrences", () => {
    const source = parse('<img src="/a.png" alt="A">');
    const images = resolve('<div class="prose-noel"><div data-heading-source="CompareSplit"><img src="/a.png" alt="A"></div><img src="/a.png" alt="A"></div>', source);
    expect(images.map((x) => x.ownership)).toEqual(["shared-component", "protected-mdx"]);
  });
  it("proves injected AboutHero from custom tag plus not-prose structure before protected matching", () => {
    const source = parse('<about-hero></about-hero>\n<img src="/images/headshot.png" alt="Portrait of Noel D\'Costa">');
    const html = '<div class="prose-noel"><section class="not-prose mb-10"><a href="https://calendly.com/noeldcosta/30min">Book</a><a href="mailto:solutions@noeldcosta.com">Email</a><img class="cc-ken-burns" src="/images/headshot.png" alt="Portrait of Noel D\'Costa"></section><img src="/images/headshot.png" alt="Portrait of Noel D\'Costa"></div>';
    expect(resolve(html, source, "mdx-page").map((x) => x.ownership)).toEqual(["shared-component", "protected-mdx"]);
    expect(resolve(html, { ...source, customTags: [] }, "mdx-page")[0].ownership).toBe("unresolved");
  });
  it("keeps article title fallback generated while explicit heroAlt is protected", () => {
    const html = '<article><header class="mb-12"><h1>Visible title</h1><figure class="mt-10"><img src="/hero.png" alt="Visible title"></figure></header></article>';
    const source = parse('---\ntitle: Title\nh1: Visible title\nhero: /hero.png\n---\nBody');
    const image = resolve(html, source)[0];
    expect(image.ownership).toBe("shared-template");
    expect(image.sourceAttribution).toMatchObject({ altOwnership: "generated-title-fallback", sourceProvenance: { field: "hero" }, frontmatterDependency: { field: "h1" } });
    expect(resolve(html, parse('---\ntitle: Title\nhero: /hero.png\nheroAlt: Visible title\n---\nBody'))[0].ownership).toBe("protected-frontmatter");
  });
  it("page hero alt always belongs to title renderer, even with an explicit unused heroAlt", () => {
    const source = parse('---\ntitle: Title\nhero: /hero.png\nheroAlt: Authored\n---\nBody');
    const html = '<section class="bg-bone pt-28 pb-16"><div><h1>Title</h1><img class="w-full h-auto rounded-2xl mb-10" src="/hero.png" alt="Title"><div class="prose-noel"></div></div></section>';
    expect(resolve(html, source, "mdx-page")[0].sourceAttribution).toMatchObject({ origin: "shared-template", altOwnership: "generated-title-fallback", frontmatterDependency: { field: "title" } });
  });
  it("unknown generated regions do not consume MDX candidates", () => {
    const source = parse('![A](/a.png)');
    expect(resolve('<div class="prose-noel"><div class="not-prose"><img src="/a.png" alt="A"></div><img src="/a.png" alt="A"></div>', source).map((x) => x.ownership)).toEqual(["unresolved", "protected-mdx"]);
  });
  it("normalizes only known locale prefixes and preserves special about canonical", () => {
    expect(imageAudit.imageCanonicalFamily).toBeTypeOf("function");
    expect(imageAudit.imageCanonicalFamily("https://noeldcosta.com/es/sap-erp/", "/es/sap-erp/")).toBe("/sap-erp/");
    expect(imageAudit.imageCanonicalFamily("https://noeldcosta.com/sap-erp-consultant-my-story-noel-dcosta/", "/about/")).toBe("/sap-erp-consultant-my-story-noel-dcosta/");
    expect(imageAudit.imageCanonicalFamily("https://noeldcosta.com/news/x/", "/news/x/")).toBe("/news/x/");
    expect(() => imageAudit.imageCanonicalFamily(null, "/x/")).toThrow(/canonical/i);
  });
  it("normalizes relative manifest public_path values with a leading slash", () => {
    expect(imageAudit.imagePublicUrl("ai-governance-framework/")).toBe("/ai-governance-framework/");
  });
  it("reconciles exact routes and fails missing nonHTML, duplicate URLs and unknown evidence", () => {
    expect(imageAudit.reconcileImageRoutes).toBeTypeOf("function");
    const routes = { "/": { srcRoute: "/" }, "/favicon.ico": {}, "/llms.txt": {}, "/robots.txt": {}, "/sitemap.xml": {}, "/_not-found": {} };
    expect(imageAudit.reconcileImageRoutes({ routes }, { expectedCount: 1, knownTemplates: ["/"] }).publicRoutes).toEqual(["/"]);
    expect(() => imageAudit.reconcileImageRoutes({ routes: { ...routes, "/x": { srcRoute: "/unknown" } } }, { expectedCount: 2, knownTemplates: ["/"] })).toThrow(/unmapped/i);
    expect(() => imageAudit.reconcileImageRoutes({ routes: { ...routes, "/favicon.ico": undefined } }, { expectedCount: 1, knownTemplates: ["/"] })).toThrow();
    expect(() => imageAudit.reconcileImageRoutes({ routes: { ...routes, "/x": { srcRoute: "/" }, "/x/": { srcRoute: "/" } } }, { expectedCount: 3, knownTemplates: ["/"] })).toThrow(/duplicate/i);
  });
  it("attributes FeaturedOn and TestimonialsGrid only with source tag and fixed structure", () => {
    const source = parse('<featured-on></featured-on>\n<testimonials-grid></testimonials-grid>');
    const html = '<div class="prose-noel"><section class="not-prose my-10"><div class="grid grid-cols-2 sm:grid-cols-3 gap-4 items-center"><img class="object-contain" src="/images/wp/2025/02/3__6_-removebg-preview.webp" alt="SAP Press logo"></div></section><div class="not-prose my-10"><div class="grid grid-cols-1 md:grid-cols-2 gap-5"><section><h3>Tareq Ashmawy</h3><img class="w-14 h-14 rounded-full" src="/images/wp/2025/02/8.webp" alt="Portrait of Tareq Ashmawy"><blockquote>Quote</blockquote></section></div></div></div>';
    expect(resolve(html, source, "mdx-page").map((x) => x.sourceAttribution?.region)).toEqual(["featured-on", "testimonials-grid"]);
    expect(resolve(html, { ...source, customTags: [] }, "mdx-page").every((x) => x.ownership === "unresolved")).toBe(true);
  });
  it("proves homepage portrait, press and testimonial contracts without alt-based guessing", () => {
    const html = '<main><section><h1>Home</h1><div class="cc-enter-scale"><img src="/_next/image/?url=%2Fimages%2Fheadshot.png&w=1920&q=70" alt="Noel"></div></section><section class="bg-bone"><h2 aria-label="Senior on the system. Senior on the close.">Credentials</h2><ul><li><img src="/press/msn.webp" alt="MSN"></li></ul></section><section class="bg-cream"><h2 aria-label="Don\'t take my word for it. Read theirs.">Testimonials</h2><img sizes="48px" src="/people/mike-papamichael.webp" alt="Mike"></section></main>';
    expect(resolve(html, null, "homepage").map((x) => x.sourceAttribution?.region)).toEqual(["homepage-hero", "publication-logos", "homepage-testimonials"]);
    expect(resolve(html, null, "unknown").every((x) => x.ownership === "unresolved")).toBe(true);
  });
  it("proves author, related and category images with region contracts and linked post dependencies", () => {
    expect(imageAudit.createImageAttributionResolver).toBeTypeOf("function");
    const linkedSource = { ...parse('---\ntitle: Related title\nhero: /related.png\n---\nBody'), slug: "related" };
    const html = '<article><section class="mt-16 border-2 border-papaya"><h3>Noel</h3><a href="/about/">About</a><img sizes="72px" src="/images/headshot.png" alt="Noel"></section><section class="mt-16 mb-4"><header><h2>More from the archive</h2></header><a href="/related/"><img sizes="108px" src="/related.png" alt="Related title"></a></section></article>';
    const images = audit(html, { sourceAttribution: imageAudit.createImageAttributionResolver({ template: "post", postSources: [linkedSource] }) }).images;
    expect(images.map((x) => x.sourceAttribution?.region)).toEqual(["author-box", "related-article"]);
    expect(images[1].sourceAttribution).toMatchObject({ altOwnership: "generated-post-title", frontmatterDependency: { field: "title" } });
    const category = audit('<main><a class="group flex flex-col bg-paper rounded-2xl overflow-hidden" href="/related/"><img src="/related.png" alt="Related title"><h3>Related title</h3></a></main>', { sourceAttribution: imageAudit.createImageAttributionResolver({ template: "category-archive", postSources: [linkedSource] }) }).images;
    expect(category[0].sourceAttribution?.region).toBe("category-card");
  });
  it("proves only top-level footer/nav and keeps image context independent of translated ordering", () => {
    const source = parse('![A](/a.png)\n![B](/b.png)\n![A](/a.png)');
    const images = resolve('<nav style="position:fixed"><a aria-label="noeldcosta — home" href="/"><svg></svg></a></nav><div class="prose-noel"><img src="/b.png" alt="B"><img src="/a.png" alt="A"><img src="/a.png" alt="A"></div><footer class="bg-corbeau text-moon"><a href="/x"><svg></svg></a></footer>', source);
    expect(images.map((x) => x.sourceAttribution?.region)).toEqual(["navigation", "protected-prose", "protected-prose", "protected-prose", "footer"]);
    expect(imageAudit.assignEquivalentImageContexts).toBeTypeOf("function");
    const contexts = imageAudit.assignEquivalentImageContexts(images);
    expect(contexts[1].imageContext).toBe('protected-prose|/b.png|1');
    expect(contexts[2].imageContext).toBe('protected-prose|/a.png|1');
    expect(contexts[3].imageContext).toBe('protected-prose|/a.png|2');
    expect(contexts[4].imageContext).toBeNull();
  });
  it("retains every equivalent-context manual finding in route records with independent ownership", () => {
    expect(imageAudit.attachEquivalentImageReviews).toBeTypeOf("function");
    const records = ["en", "es", "ja"].map((locale) => ({ url: `/${locale}/x/`, canonicalFamily: "/x/", locale, images: [{ selector: "img", order: 1, imageContext: "hero|/a.png|1", normalizedAlt: locale === "ja" ? "Japanese" : "SAP", ownership: "shared-template", ownershipConfidence: "proven" }], findings: { editorialFindings: [] } }));
    const groups = imageAudit.attachEquivalentImageReviews(records);
    expect(groups).toHaveLength(1);
    expect(records[0].findings.editorialFindings).toContainEqual(expect.objectContaining({ code: "cross-locale-identical-alternative", automaticDefect: false, ownership: "shared-template", locales: ["en", "es"] }));
    expect(records[1].findings.editorialFindings).toHaveLength(1);
    expect(records[2].findings.editorialFindings).toHaveLength(0);
  });
  it("bounded representatives include raster images and defective SVG controls within shared regions", () => {
    expect(imageAudit.representativeImageRecords).toBeTypeOf("function");
    const images = [
      { elementKind: "svg", sourceAttribution: { region: "about-hero" }, observedFindings: [] },
      { elementKind: "img", sourceAttribution: { region: "about-hero" }, observedFindings: [] },
      { elementKind: "svg", sourceAttribution: { region: "footer" }, observedFindings: [] },
      { elementKind: "svg", sourceAttribution: { region: "footer" }, observedFindings: [{ code: "interactive-image-missing-name" }] },
    ];
    expect(imageAudit.representativeImageRecords([...images, ...images])).toEqual(images);
  });
});

describe("image audit runner persisted evidence", () => {
  it("keeps zero-image routes, writes deterministic exact shards, reports defects without failure, and rejects old shards", async () => {
    const { existsSync } = await import("node:fs");
    const runnerPath = new URL("../../scripts/audit-image-alt.mjs", import.meta.url);
    expect(existsSync(runnerPath)).toBe(true);
    const { runImageAudit } = await import(runnerPath.href);
    const { mkdtemp, mkdir, writeFile, readFile, rm } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const path = await import("node:path");
    const root = await mkdtemp(path.join(tmpdir(), "image-audit-test-"));
    try {
      for (const dir of [".next/server/app", "src/app", "content/posts", "content/pages"]) await mkdir(path.join(root, dir), { recursive: true });
      await writeFile(path.join(root, "src/app/page.tsx"), "fixture");
      await writeFile(path.join(root, ".next/BUILD_ID"), "fixture-build");
      await writeFile(path.join(root, ".next/prerender-manifest.json"), JSON.stringify({ routes: Object.fromEntries(["/", "/favicon.ico", "/llms.txt", "/robots.txt", "/sitemap.xml"].map((url) => [url, { srcRoute: url }])) }));
      const htmlPath = path.join(root, ".next/server/app/index.html");
      await writeFile(htmlPath, '<link rel="canonical" href="https://noeldcosta.com/"><main>No images</main>');
      const options = { root, contract: { routeCount: 1, routedSourceCount: 0, allSourceCount: 0, routedSourceFingerprint: imageAudit.protectedSourceFingerprint([]), allSourceFingerprint: imageAudit.protectedSourceFingerprint([]), locales: ["en"] } };
      const first = await runImageAudit(options);
      expect(first.status).toMatchObject({ auditExecution: "pass", evidenceIntegrity: "pass", imageCount: 0 });
      const reportPath = path.join(root, "docs/codex/audit/phase-4e-image-alt-audit.json");
      const bytes = await readFile(reportPath);
      const second = await runImageAudit(options);
      expect(await readFile(reportPath)).toEqual(bytes);
      expect(second.shards).toEqual(first.shards);
      await writeFile(htmlPath, '<link rel="canonical" href="https://noeldcosta.com/"><img src="/missing.png">');
      expect((await runImageAudit(options)).status).toMatchObject({ auditExecution: "pass", evidenceIntegrity: "pass", siteFindingVerdict: "observed-defects-present" });
      await writeFile(path.join(root, "docs/codex/audit/phase-4e-image-inventory/old.ndjson"), "old");
      await expect(runImageAudit(options)).rejects.toThrow(/unexpected.*shard/i);
    } finally { await rm(root, { recursive: true, force: true }); }
  });
});

describe("exact protected image attribution", () => {
  const candidate = (overrides = {}) => ({ source: "/same.webp", altPresent: true, alt: "First", evidence: "content/posts/x/en.mdx:10", ...overrides });
  const rendered = (overrides = {}) => ({ sourceRegion: "protected-prose", source: "/same.webp", altPresent: true, alt: "First", ...overrides });
  it("matches source, alt state and normalized text independently, consuming exact duplicate occurrences in order", () => {
    expect(imageAudit.createOccurrenceAwareImageMatcher).toBeTypeOf("function");
    const matcher = imageAudit.createOccurrenceAwareImageMatcher([
      candidate(), candidate({ alt: "Second", evidence: "content/posts/x/en.mdx:20" }),
      candidate({ evidence: "content/posts/x/en.mdx:30" }),
    ]);
    for (const value of [rendered({ source: "/other.webp" }), rendered({ alt: "Generated label" }), rendered({ altPresent: false }), rendered({ sourceRegion: "generated" }), rendered({ sourceRegion: null })]) {
      expect(matcher.match(value)).toBeNull();
    }
    expect(matcher.match(rendered({ alt: "Second" }))).toMatchObject({ origin: "protected-mdx", evidence: "content/posts/x/en.mdx:20", occurrence: 1 });
    expect(matcher.match(rendered({ alt: " \nFirst " }))).toMatchObject({ evidence: "content/posts/x/en.mdx:10", occurrence: 1 });
    expect(matcher.match(rendered())).toMatchObject({ evidence: "content/posts/x/en.mdx:30", occurrence: 2 });
    expect(matcher.match(rendered())).toBeNull();
  });
  it("never consumes missing and empty alt interchangeably", () => {
    const matcher = imageAudit.createOccurrenceAwareImageMatcher([candidate({ alt: "", altPresent: false })]);
    expect(matcher.match(rendered({ alt: "", altPresent: true }))).toBeNull();
    expect(matcher.match(rendered({ alt: null, altPresent: false }))).toMatchObject({ origin: "protected-mdx" });
  });
  it("decodes only an explicit Next optimizer path and preserves the original image query", () => {
    expect(imageAudit.decodeImageSource).toBeTypeOf("function");
    const source = "https://images.test/hero.webp?v=2&crop=a%2Fb";
    for (const prefix of ["/_next/image", "/_next/image/"]) {
      const originalSource = `${prefix}?url=${encodeURIComponent(source)}&w=640&q=75`;
      const decoded = imageAudit.decodeImageSource(originalSource);
      expect(decoded).toEqual({ originalSource, source, transformation: { kind: "next-image-optimizer", originalSource, source } });
      const matcher = imageAudit.createOccurrenceAwareImageMatcher([candidate({ source })]);
      expect(matcher.match(rendered({ source: originalSource }))).toMatchObject({ sourceTransformation: decoded.transformation });
    }
    for (const unknown of ["/resize?url=%2Fsame.webp", "/x/_next/image?url=%2Fsame.webp", "/same.webp?version=1", "/different/same.webp", "/_next/image?url=%2Fsame.webp&url=%2Fother.webp"]) {
      const matcher = imageAudit.createOccurrenceAwareImageMatcher([candidate()]);
      expect(matcher.match(rendered({ source: unknown }))).toBeNull();
    }
  });
  it("uses the resolver's generated-region decision before protected matching and retains observed defects", () => {
    const matcher = imageAudit.createOccurrenceAwareImageMatcher([candidate({ alt: null, altPresent: false })]);
    const result = audit('<main class="prose-noel"><section class="generated"><img src="/same.webp"></section><picture><source srcset="/same.avif 1x"><img src="/same.webp" srcset="/same-2.webp 2x"></picture><img src="/unknown.webp"></main>', {
      sourceAttribution: ({ $, element, record }) => {
        if ($(element).closest(".generated").length) return { origin: "shared-component", evidence: "src/components/FeaturedOn.tsx:1" };
        return matcher.match({ sourceRegion: $(element).closest(".prose-noel").length ? "protected-prose" : "unknown", source: record.source, altPresent: record.altPresent, alt: record.rawAlt });
      },
    });
    expect(result.images.map((item) => item.ownership)).toEqual(["shared-component", "protected-mdx", "unresolved"]);
    expect(result.images.map((item) => item.ownershipConfidence)).toEqual(["proven", "proven", "unknown"]);
    expect(result.observedDefects.filter((item) => item.code === "img-missing-alt").map((item) => item.ownership)).toEqual(["shared-component", "protected-mdx", "unresolved"]);
    expect(result.images[1]).toMatchObject({ source: "/same.webp", sourceSet: "/same-2.webp 2x", pictureCandidates: [{ sourceSet: "/same.avif 1x", media: null, type: null }] });
    expect(result.unresolvedFindings.filter((item) => item.code === "image-ownership-unresolved")).toHaveLength(1);
  });
  it("requires evidence for ownership and does not infer authored hero alt from generated title text", () => {
    const result = audit('<img src="/hero.webp" alt="Article title">', { sourceAttribution: () => ({ origin: "protected-frontmatter" }) });
    expect(result.images[0]).toMatchObject({ ownership: "unresolved", ownershipConfidence: "unknown" });
    const matcher = imageAudit.createOccurrenceAwareImageMatcher([candidate({ source: "/hero.webp", alt: "Article title" })]);
    expect(matcher.match(rendered({ source: "/hero.webp", alt: "Article title", sourceRegion: "generated-title-fallback" }))).toBeNull();
  });
  it("keeps resolver confidence separate and rejects unsupported origin claims", () => {
    const result = audit('<img src="/hero.webp">', { sourceAttribution: () => ({ origin: "shared-template", evidence: "src/components/Hero.tsx:12", confidence: "exact-template-contract" }) });
    expect(result.images[0]).toMatchObject({ ownership: "shared-template", ownershipConfidence: "exact-template-contract" });
    expect(result.observedDefects).toContainEqual(expect.objectContaining({ code: "img-missing-alt", ownership: "shared-template", ownershipConfidence: "exact-template-contract" }));
    const unknown = audit('<img src="/hero.webp">', { sourceAttribution: () => ({ origin: "probably-mdx", evidence: "similar text", confidence: "high" }) });
    expect(unknown.images[0]).toMatchObject({ ownership: "unresolved", ownershipConfidence: "unknown", sourceAttribution: null });
  });
});

describe("image audit evidence integrity", () => {
  const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
  const route = (overrides = {}) => ({ url: "/a/", template: "mdx-page", canonicalFamily: "/a/", locale: "en", imageCount: 0, images: [], ...overrides });
  const options = { expectedRouteCount: 1, expectedImageCount: 0, buildId: "build-123", artifactFingerprint: `sha256:${"a".repeat(64)}` };
  const shard = (records = [route()], overrides = {}) => {
    const bytes = Buffer.from(records.map((record) => JSON.stringify(record)).join("\n") + "\n");
    return { locale: records[0]?.locale ?? "en", path: "inventory/en.ndjson", routeCount: records.length, imageCount: records.reduce((total, record) => total + record.imageCount, 0), urls: records.map((record) => record.url), bytes, byteLength: bytes.length, sha256: hash(bytes), ...overrides };
  };
  it("fingerprints exact publishable bytes with unique normalized paths and rejects raw input", () => {
    expect(imageAudit.protectedSourceFingerprint).toBeTypeOf("function");
    const fingerprint = imageAudit.protectedSourceFingerprint([{ path: "content\\posts\\x\\en.mdx", bytes: Buffer.from("one\r\n") }]);
    expect(fingerprint).toBe(imageAudit.protectedSourceFingerprint([{ path: "content/posts/x/en.mdx", bytes: Buffer.from("one\r\n") }]));
    expect(fingerprint).not.toBe(imageAudit.protectedSourceFingerprint([{ path: "content/posts/x/en.mdx", bytes: Buffer.from("one\n") }]));
    expect(() => imageAudit.protectedSourceFingerprint([{ path: "content/x.mdx", bytes: "a" }, { path: "content/./x.mdx", bytes: "b" }])).toThrow(/unique/iu);
    for (const path of ["content/en.raw.mdx", "content/EN.RAW.MDX", ""]) expect(() => imageAudit.protectedSourceFingerprint([{ path, bytes: "a" }])).toThrow();
    expect(() => imageAudit.protectedSourceFingerprint([{ path: "content/en.raw.mdx", get bytes() { throw new Error("raw bytes were accessed"); } }])).toThrow(/Raw MDX/iu);
    expect(() => imageAudit.protectedSourceFingerprint([{ path: "content/en.mdx" }])).toThrow(/bytes/iu);
  });
  it("reuses length-framed combined fingerprints without concatenation ambiguity", () => {
    expect(imageAudit.combineEvidenceFingerprints).toBeTypeOf("function");
    const a = { name: "a", fingerprint: "bc" }, b = { name: "ab", fingerprint: "c" };
    expect(imageAudit.combineEvidenceFingerprints([a])).not.toBe(imageAudit.combineEvidenceFingerprints([b]));
    expect(imageAudit.combineEvidenceFingerprints([a, b])).toBe(imageAudit.combineEvidenceFingerprints([b, a]));
    expect(() => imageAudit.combineEvidenceFingerprints([a, a])).toThrow(/unique/iu);
  });
  it("retains and validates zero-image route records with exact totals and build evidence", () => {
    expect(imageAudit.assertImageInventory).toBeTypeOf("function");
    expect(imageAudit.assertImageInventory([route()], options)).toMatchObject({ routeCount: 1, imageCount: 0, exact: true, buildId: "build-123" });
    expect(() => imageAudit.assertImageInventory([route(), route()], { ...options, expectedRouteCount: 2 })).toThrow(/duplicate/iu);
    for (const field of ["url", "template", "canonicalFamily", "locale"]) expect(() => imageAudit.assertImageInventory([route({ [field]: " " })], options)).toThrow(new RegExp(field, "iu"));
    for (const invalid of [{ expectedRouteCount: 2 }, { expectedImageCount: 1 }, { expectedImageCount: -1 }, { buildId: " " }, { artifactFingerprint: "not-a-hash" }]) expect(() => imageAudit.assertImageInventory([route()], { ...options, ...invalid })).toThrow();
    expect(() => imageAudit.assertImageInventory([route({ imageCount: 1 })], options)).toThrow(/image/iu);
    expect(() => imageAudit.assertImageInventory([route({ images: undefined })], options)).toThrow(/image/iu);
  });
  it("reconciles unique locale shard bytes and their parsed route/image totals", () => {
    expect(imageAudit.assertImageShardManifest).toBeTypeOf("function");
    const en = shard(), ja = shard([route({ url: "/ja/a/", locale: "ja", imageCount: 1, images: [{ elementKind: "img" }] })], { path: "inventory/ja.ndjson" });
    expect(imageAudit.assertImageShardManifest({ expectedRouteCount: 2, expectedImageCount: 1, shards: [en, ja] })).toEqual({ shardCount: 2, routeCount: 2, imageCount: 1, totalBytes: en.byteLength + ja.byteLength, exact: true });
  });
  it("rejects tampered bytes, hashes, positive sizes, URLs, counts and parsed records", () => {
    const valid = shard();
    const check = (value, totals = {}) => imageAudit.assertImageShardManifest({ expectedRouteCount: 1, expectedImageCount: 0, shards: [value], ...totals });
    for (const invalid of [{ bytes: Buffer.from("tampered") }, { bytes: undefined }, { sha256: "not-a-hash" }, { sha256: "a".repeat(64) }, { byteLength: 0 }, { byteLength: valid.byteLength + 1 }, { routeCount: 2 }, { imageCount: 1 }, { urls: ["/wrong/"] }, { locale: "ja" }, { path: "" }]) expect(() => check({ ...valid, ...invalid })).toThrow();
    expect(() => check(valid, { expectedRouteCount: 2 })).toThrow();
    expect(() => check(valid, { expectedImageCount: 1 })).toThrow();
    expect(() => check(shard([route({ template: "" })]))).toThrow(/template/iu);
    const bytes = Buffer.from("not json\n");
    expect(() => check({ ...valid, bytes, byteLength: bytes.length, sha256: hash(bytes) })).toThrow();
  });
  it("rejects duplicate shard locales, normalized paths and route URLs", () => {
    const en = shard();
    const check = (second) => imageAudit.assertImageShardManifest({ expectedRouteCount: 2, expectedImageCount: 0, shards: [en, second] });
    expect(() => check(shard([route({ url: "/b/" })], { path: "inventory/b.ndjson" }))).toThrow(/locale/iu);
    expect(() => check(shard([route({ locale: "ja", url: "/ja/a/" })], { path: "inventory\\en.ndjson" }))).toThrow(/path/iu);
    expect(() => check(shard([route({ locale: "ja" })], { path: "inventory/ja.ndjson" }))).toThrow(/duplicate.*URL/iu);
  });
});

describe("image alternative inventory", () => {
  it("normalizes alternative text to a flat string without rewriting words", () => {
    expect(normalizeAlternativeText("  SAP\n BTP\t\r\f ")).toBe("SAP BTP");
    expect(normalizeAlternativeText(null)).toBe("");
  });
  it("inventories authored img alternatives and original source candidates", () => {
    const result = audit('<main lang="de"><picture><source srcset="/hero.avif 1x" type="image/avif"><img src="/hero.webp" srcset="/hero-2.webp 2x" alt="Enterprise transformation workshop"></picture></main>');
    expect(result.images).toEqual([expect.objectContaining({
      order: 1, elementKind: "img", source: "/hero.webp", sourceSet: "/hero-2.webp 2x",
      pictureCandidates: [{ sourceSet: "/hero.avif 1x", media: null, type: "image/avif" }],
      altStatus: "nonempty", accessibleName: "Enterprise transformation workshop",
      altPresent: true, rawAlt: "Enterprise transformation workshop", locale: "en", inheritedLanguage: "de",
      ownership: "unresolved", ownershipConfidence: "unknown", sourceAttribution: null,
    })]);
  });
});

describe("editorial signals never invent accessibility defects", () => {
  it.each(["file.webp", "/uploads/a.jpg", "https://example.test/a", "1234", "f8a81b22571acc88", "IMAGE", "Photo", "picture", "thumbnail", "graphic"])("flags %s only for manual review", (alt) => {
    const result = audit(`<img alt="${alt}">`);
    expect(result.observedDefects).toEqual([]);
    expect(result.editorialFindings).toContainEqual(expect.objectContaining({ code: "alternative-quality-review", automaticDefect: false }));
  });
  it.each(["SAP", "BTP", "Noel D'Costa", "image of the annual plan", "SAP S/4HANA"])("retains legitimate name/term %s without heuristic findings", (alt) => {
    const result = audit(`<img alt="${alt}">`);
    expect(result.editorialFindings).toEqual([]);
    expect(result.observedDefects).toEqual([]);
  });
  it("counts Unicode code points and treats 250 only as an internal diagnostic threshold", () => {
    expect(IMAGE_ALT_POLICY.lengthDiagnostic).toEqual({ thresholdCodePoints: 250, accessibilityRequirement: false });
    expect(audit(`<img alt="${"😀".repeat(250)}">`).diagnostics.map((item) => item.code)).not.toContain("alternative-length-diagnostic");
    const result = audit(`<img alt="${"😀".repeat(251)}">`);
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: "alternative-length-diagnostic", codePoints: 251, accessibilityRequirement: false }));
    expect(result.observedDefects).toEqual([]);
  });
  it("records caption duplication without treating captions as automatically sufficient alt", () => {
    const result = audit('<figure><img alt="SAP diagram"><figcaption>SAP diagram</figcaption></figure>');
    expect(result.editorialFindings).toContainEqual(expect.objectContaining({ code: "alternative-matches-caption", automaticDefect: false }));
    expect(result.observedDefects).toEqual([]);
  });
  it("limits cross-locale comparison to proven equivalent family AND image contexts", () => {
    const entries = [
      { canonicalFamily: "/a/", imageContext: "hero", locale: "en", normalizedAlt: "SAP", selector: "a" },
      { canonicalFamily: "/a/", imageContext: "hero", locale: "de", normalizedAlt: "SAP", selector: "b" },
      { canonicalFamily: "/b/", imageContext: "hero", locale: "ja", normalizedAlt: "SAP" },
      { canonicalFamily: "/a/", imageContext: "card", locale: "fr", normalizedAlt: "SAP" },
      { canonicalFamily: "/a/", locale: "es", normalizedAlt: "SAP" },
    ];
    expect(compareEquivalentImageAlternatives(entries)).toEqual([expect.objectContaining({
      code: "cross-locale-identical-alternative", locales: ["de", "en"], canonicalFamily: "/a/", imageContext: "hero", automaticDefect: false,
    })]);
    expect(compareEquivalentImageAlternatives(entries.slice(0, 1))).toEqual([]);
    expect(entries[0].normalizedAlt).toBe("SAP");
  });
});

describe("mandatory observed defects are independent of ownership", () => {
  it.each([
    ['<img src="/x.webp">', "img-missing-alt"],
    ['<a href="/x"><img src="/x.webp" alt=""></a>', "interactive-image-missing-name"],
    ['<button><svg><path d="M0 0"/></svg></button>', "interactive-image-missing-name"],
    ['<input type="image" src="/submit.webp" name="submit">', "image-input-missing-authored-alternative"],
    ['<svg role="img"></svg>', "semantic-image-missing-name"],
    ['<div role="img"></div>', "semantic-image-missing-name"],
  ])("reports %s as %s", (html, code) => {
    const result = audit(html);
    expect(result.observedDefects).toContainEqual(expect.objectContaining({ code, ownership: "unresolved", ownershipConfidence: "unknown" }));
    expect(result.unresolvedFindings).toContainEqual(expect.objectContaining({ code: "image-ownership-unresolved" }));
  });
  it("does not manufacture an authored label from a browser submit fallback", () => {
    expect(audit('<input type="image">').images[0]).toMatchObject({
      authoredName: "", authoredNameStatus: "missing", browserFallbackStatus: "browser-dependent", computedNameStatus: "browser-check-required",
    });
  });
  it.each([
    '<a href="/x" aria-label="Read"><img alt=""></a>',
    '<button><svg aria-hidden="true"></svg><span class="sr-only">Save</span></button>',
    '<button title="Save"><img alt=""></button>',
    '<input type="image" alt="Save">',
    '<svg role="img"><title>Diagram</title></svg>',
  ])("accepts independent authored names: %s", (html) => {
    expect(audit(html).observedDefects).toEqual([]);
  });
  it("inventories every SVG and role img but suppresses atomic descendants", () => {
    const result = audit('<div role="img" aria-label="Chart"><svg role="img"></svg><img alt="Segment"></div><svg></svg>');
    expect(result.images.map((item) => item.elementKind)).toEqual(["role-img", "svg", "img", "svg"]);
    expect(result.images.slice(1, 3).map((item) => item.accessibleExposure)).toEqual(["suppressed-atomic", "suppressed-atomic"]);
    expect(result.observedDefects).toEqual([]);
  });
});

const name = (html, selector = "#target") => computeAccessibleName({ html, selector });
describe("pinned accessible-name subset", () => {
  it("uses control content before title", () => {
    expect(name('<button id="target" title="Fallback">Save</button>')).toMatchObject({ name: "Save", namingMethod: "content" });
    expect(name('<a href="/" id="target" title="Fallback">Read</a>').name).toBe("Read");
  });
  it("uses ordered valid IDREFs before aria-label and ignores duplicate references", () => {
    expect(name('<img id="target" aria-labelledby="b missing a b" aria-label="Ignored" alt="Alt"><span id="a">First</span><span id="b">Second</span>').name).toBe("Second First");
  });
  it("uses the first duplicate id deterministically and reports ambiguity", () => {
    const result = name('<img id="target" aria-labelledby="a"><span id="a">First</span><span id="a">Second</span>');
    expect(result.name).toBe("First");
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: "duplicate-id-reference" }));
  });
  it("falls back from missing or empty references to aria-label then host alt", () => {
    expect(name('<img id="target" aria-labelledby="missing" aria-label="Label" alt="Alt">').name).toBe("Label");
    expect(name('<img id="target" aria-labelledby="empty" alt="Alt"><span id="empty"></span>').name).toBe("Alt");
  });
  it("does not follow chained labelledby relations during an existing traversal", () => {
    expect(name('<img id="target" aria-labelledby="a"><span id="a" aria-labelledby="b">Own text</span><span id="b">Other</span>').name).toBe("Own text");
    expect(name('<img id="target" aria-labelledby="a"><span id="a" aria-labelledby="b"></span><span id="b">Other</span>').name).toBe("");
  });
  it("terminates cycles and permits self reference to its own aria-label", () => {
    expect(name('<button id="target" aria-labelledby="target other" aria-label="Delete"></button><span id="other">File</span>').name).toBe("Delete File");
    expect(name('<button id="target" aria-labelledby="a"></button><span id="a" aria-labelledby="target">Cycle text</span>').name).toBe("Cycle text");
  });
  it("includes a directly referenced hidden subtree but excludes unrelated hidden descendants", () => {
    expect(name('<button id="target" aria-labelledby="a"></button><span hidden id="a">Hidden <b hidden>label</b></span>').name).toBe("Hidden label");
    expect(name('<button id="target" aria-labelledby="a"></button><span id="a">Visible <b hidden>secret</b></span>').name).toBe("Visible");
    expect(name('<button id="target"><span class="sr-only">Save</span><span aria-hidden="true">secret</span></button>').name).toBe("Save");
  });
  it("uses labels only for labelable controls and never form name", () => {
    expect(name('<label for="target">Explicit</label><input id="target" type="image" alt="Alt">').name).toBe("Explicit");
    expect(name('<label>Wrapped <input id="target" type="image" alt="Ignored"></label>').name).toBe("Wrapped");
    expect(name('<label for="target">Ignored</label><img id="target" alt="Alt">').name).toBe("Alt");
    expect(name('<input id="target" type="image" name="Not a label">').name).toBe("");
  });
  it("uses host-specific title fallback while respecting empty img alt", () => {
    expect(name('<img id="target" title="Fallback">').name).toBe("Fallback");
    expect(name('<img id="target" alt="" title="Not a name">').name).toBe("");
    expect(name('<input type="image" id="target" alt="" title="Submit order">').name).toBe("Submit order");
  });
  it("reports unsupported host fallback for browser review without inventing a name", () => {
    const result = audit('<figure><img><figcaption>A chart</figcaption></figure>');
    expect(result.images[0].computedNameStatus).toBe("browser-check-required");
    expect(result.unresolvedFindings).toContainEqual(expect.objectContaining({ code: "browser-name-check-required" }));
    expect(result.observedDefects).toContainEqual(expect.objectContaining({ code: "img-missing-alt" }));
  });
  it("does not let hidden SVGs or browser URL fallback mask unnamed social links", () => {
    expect(audit('<a href="https://linkedin.com/in/example"><svg aria-hidden="true"></svg></a>').observedDefects).toContainEqual(expect.objectContaining({ code: "interactive-image-missing-name" }));
  });
  it("keeps unsupported semantic SVG fallback unresolved rather than a definite missing name", () => {
    const result = audit('<svg role="img"><desc>Sales chart</desc></svg>');
    expect(result.images[0]).toMatchObject({ computedNameStatus: "browser-check-required", browserFallbackStatus: "unsupported-host-fallback" });
    expect(result.observedDefects).toEqual([]);
    expect(result.unresolvedFindings).toContainEqual(expect.objectContaining({ code: "browser-name-check-required" }));
  });
  it("does not declare authored names missing when their referenced host fallback is unsupported", () => {
    const result = audit('<input type="image" aria-labelledby="label"><svg id="label"><desc>Submit order</desc></svg>');
    expect(result.images[0]).toMatchObject({ authoredNameStatus: "unresolved", computedNameStatus: "browser-check-required", browserFallbackStatus: "unsupported-host-fallback" });
    expect(result.images[1].authoredNameStatus).toBe("unresolved");
    expect(result.observedDefects.map((item) => item.code)).not.toContain("image-input-missing-authored-alternative");
    expect(result.unresolvedFindings).toContainEqual(expect.objectContaining({ code: "authored-name-browser-check-required", order: 1 }));
    expect(audit('<input type="image">').images[0]).toMatchObject({ authoredNameStatus: "missing", browserFallbackStatus: "browser-dependent" });
    expect(audit('<input type="image">').observedDefects).toContainEqual(expect.objectContaining({ code: "image-input-missing-authored-alternative" }));
  });
  it("records unresolved authored control names consistently with referenced SVG names", () => {
    const result = audit('<button><svg><desc>Help</desc></svg></button>');
    expect(result.images[0]).toMatchObject({ authoredNameStatus: "unresolved", interactiveAuthoredNameStatus: "unresolved", interactiveComputedNameStatus: "browser-check-required" });
  });
  it("audits an SVG that is itself an interactive control", () => {
    const result = audit('<svg role="button" tabindex="0"></svg>');
    expect(result.images[0].interactiveAncestor).toBe(result.images[0].selector);
    expect(result.observedDefects).toContainEqual(expect.objectContaining({ code: "interactive-image-missing-name" }));
    expect(audit('<svg role="button" tabindex="0" aria-label="Save"></svg>').observedDefects).toEqual([]);
    expect(audit('<svg role="button" tabindex="0" hidden></svg>').observedDefects).toEqual([]);
    expect(audit('<div role="img" aria-label="Diagram"><svg role="button" tabindex="0"></svg></div>').observedDefects).toEqual([]);
  });
  it("keeps unrelated hidden descendants out of visible controls' authored names", () => {
    const result = audit('<button><span hidden>Save</span><img alt=""></button>');
    expect(result.images[0]).toMatchObject({ interactiveAccessibleName: "", interactiveAuthoredNameStatus: "missing" });
    expect(result.observedDefects).toContainEqual(expect.objectContaining({ code: "interactive-image-missing-name" }));
    const hiddenRoot = audit('<button hidden><span>Save</span><img alt=""></button>');
    expect(hiddenRoot.images[0]).toMatchObject({ interactiveAccessibleName: "", interactiveAuthoredNameStatus: "present" });
    expect(hiddenRoot.observedDefects).toEqual([]);
    const explicitHidden = audit('<button aria-labelledby="label"><img alt=""></button><span id="label" hidden>Save</span>');
    expect(explicitHidden.images[0]).toMatchObject({ interactiveAccessibleName: "Save", interactiveAuthoredNameStatus: "present" });
    expect(explicitHidden.observedDefects).toEqual([]);
  });
  it.each([
    '<a href="/help"><svg><desc>Help</desc></svg></a>',
    '<button><img alt=""><svg><desc>Help</desc></svg></button>',
    '<button aria-labelledby="label"></button><svg id="label"><desc>Help</desc></svg>',
  ])("propagates unsupported fallback through name computation: %s", (html) => {
    expect(computeAccessibleName({ html, selector: "a,button" })).toMatchObject({ computedNameStatus: "browser-check-required", browserFallbackStatus: "unsupported-host-fallback" });
    const result = audit(html);
    expect(result.observedDefects.map((item) => item.code)).not.toContain("interactive-image-missing-name");
  });
  it("records control uncertainty even when an earlier sibling has no fallback", () => {
    const result = audit('<button><img alt=""><svg><desc>Help</desc></svg></button>');
    expect(result.images[0].interactiveComputedNameStatus).toBe("browser-check-required");
    expect(result.unresolvedFindings).toContainEqual(expect.objectContaining({ code: "interactive-name-browser-check-required" }));
  });
  it("does not propagate hidden child fallback or bypass an independent authored name", () => {
    expect(audit('<a href="/help"><svg aria-hidden="true"><desc>Help</desc></svg></a>').observedDefects).toContainEqual(expect.objectContaining({ code: "interactive-image-missing-name" }));
    expect(computeAccessibleName({ html: '<button aria-label="Help"><svg><desc>Other</desc></svg></button>', selector: "button" })).toMatchObject({ name: "Help", computedNameStatus: "resolved-subset" });
  });
});

describe("decoration and static exposure", () => {
  it("accepts empty alt as decoration without extra markers", () => {
    const result = audit('<img src="/texture.webp" alt="">');
    expect(result.observedDefects).toEqual([]);
    expect(result.images[0]).toMatchObject({ altStatus: "empty-decorative", accessibleExposure: "decorative", authoredNameStatus: "empty-decorative" });
    expect(result.unresolvedFindings.map((item) => item.code)).not.toContain("decorative-intent-conflict-review-required");
  });
  it.each([
    '<img alt="" role="img">', '<img alt="" tabindex="0">', '<img alt="" aria-label="Diagram">',
    '<img alt="Chart" role="presentation">', '<img alt="Chart" aria-hidden="true">',
    '<svg role="none" tabindex="0"><title>Chart</title></svg>',
  ])("records conflicting decorative/informative/focusable intent: %s", (html) => {
    expect(audit(html).unresolvedFindings).toContainEqual(expect.objectContaining({ code: "decorative-intent-conflict-review-required" }));
  });
  it("never waives a missing alt merely because hidden or presentation is set", () => {
    expect(audit('<img aria-hidden="true"><img role="presentation">').observedDefects.filter((item) => item.code === "img-missing-alt")).toHaveLength(2);
  });
  it("retains hidden, template and closed-dialog images with separate visual/AX states", () => {
    const result = audit('<img hidden alt="A"><template><img alt="B"><svg></svg></template><dialog><img alt="C"></dialog><img aria-hidden="true" alt=""><img class="sr-only" alt="D"><img style="opacity:0" alt="E">');
    expect(result.images).toHaveLength(7);
    expect(result.images.map((item) => item.accessibleExposure)).toEqual(["hidden", "inert-template", "inert-template", "closed-dialog", "hidden", "exposed", "exposed"]);
    expect(result.images.map((item) => item.visualVisibility)).toEqual(["hidden", "not-rendered", "not-rendered", "not-rendered", "visible-static", "visually-hidden", "transparent"]);
  });
  it("classifies all SVGs conservatively", () => {
    expect(audit('<svg role="img"><title>Chart</title></svg><svg aria-hidden="true"></svg><svg></svg><div role="img" aria-label="Group"><svg></svg></div>').images.filter((item) => item.elementKind === "svg").map((item) => item.svgClassification)).toEqual(["semantic", "decorative", "uncertain", "suppressed"]);
  });
  it("keeps uncertain and unsupported computation for browser review", () => {
    const result = audit('<svg><desc>Possible fallback</desc></svg><input type="image">');
    expect(result.unresolvedFindings.map((item) => item.code)).toEqual(expect.arrayContaining(["svg-semantics-review-required", "browser-name-check-required"]));
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: "static-inventory-limitations" }));
  });
  it("records inline background URLs separately, including multiple layers", () => {
    const result = audit('<div style="background-image:url(\'/a.webp\'),url(/b.png)"></div><div style="background:url(/c.svg) center"></div>');
    expect(result.images).toEqual([]);
    expect(result.backgroundImages.map((item) => item.source)).toEqual(["/a.webp", "/b.png", "/c.svg"]);
    expect(result.diagnostics.filter((item) => item.code === "inline-background-image")).toHaveLength(3);
  });
  it("generates selectors that address the actual element", () => {
    expect(audit('<img alt="A">').images[0].selector).toBe("html:nth-of-type(1) > body:nth-of-type(1) > img:nth-of-type(1)");
  });
});
