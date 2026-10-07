import { describe, expect, it } from "vitest";
import {
  auditMetadataRecords,
  auditProtectedFrontmatter,
  attributeMetadataSource,
  assertMetadataInventory,
  classifySocialMetadata,
  extractDocumentMetadata,
  metadataLengthDiagnostics,
  metadataProvenance,
  normalizeMetadataText,
} from "./metadata-quality-audit.mjs";
import * as seo from "./seo";

describe("metadata quality HTML extraction", () => {
  it("extracts only the document head title and normalizes entities, Unicode, and whitespace", () => {
    const html = `<!doctype html><html><head>
      <title>  SAP &amp; ERP\n Guide  </title>
      <meta name="description" content=" Cafe\u0301 &amp; strategy ">
      <script>const ignored = "<title>script title</title>"</script>
    </head><body><svg><title>SVG title</title></svg></body></html>`;

    expect(extractDocumentMetadata(html)).toMatchObject({
      titles: ["SAP & ERP Guide"],
      descriptions: ["Café & strategy"],
    });
  });

  it("retains every document title and description so missing and multiple fields cannot pass", () => {
    const html = `<html><head><title>A</title><title>B</title>
      <meta name="description" content="One"><meta name="description" content="Two">
    </head></html>`;
    const extracted = extractDocumentMetadata(html);
    expect(extracted.titles).toEqual(["A", "B"]);
    expect(extracted.descriptions).toEqual(["One", "Two"]);
    expect(extractDocumentMetadata("<html><head></head></html>").titles).toEqual([]);
  });

  it("retains empty and missing-content description tags in exact counts", () => {
    const extracted = extractDocumentMetadata(`<html><head>
      <meta name="description" content="">
      <meta name="description" content="Useful description">
      <meta name="description">
    </head></html>`);
    expect(extracted.descriptions).toEqual(["", "Useful description", ""]);

    const result = auditMetadataRecords([{
      locale: "en",
      template: "static",
      url: "/empty-description/",
      canonicalFamily: "/empty-description/",
      titleCount: 1,
      title: "A valid document title",
      descriptionCount: extracted.descriptions.length,
      description: extracted.descriptions[0],
    }]);
    expect(result.implementationDefects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: "meta-description-count",
        observed: 3,
        url: "/empty-description/",
      }),
    ]));
  });

  it("normalizes compatibility Unicode without mutating the supplied string", () => {
    const source = "  ＳＡＰ\u00a0  Modules  ";
    expect(normalizeMetadataText(source)).toBe("SAP Modules");
    expect(source).toBe("  ＳＡＰ\u00a0  Modules  ");
    expect(normalizeMetadataText("SAP &amp; ERP &#x2014; delivery")).toBe(
      "SAP & ERP — delivery",
    );
  });
});

describe("metadata quality policy", () => {
  const base = {
    locale: "en",
    template: "post",
    titleCount: 1,
    descriptionCount: 1,
    title: "A sufficiently descriptive page title",
    description:
      "A sufficiently descriptive summary that clearly explains the specific page for search readers.",
    findings: [],
  };

  it("fails missing and multiple required document fields", () => {
    const result = auditMetadataRecords([
      { ...base, url: "/missing/", canonicalFamily: "/missing/", titleCount: 0 },
      { ...base, url: "/multiple/", canonicalFamily: "/multiple/", descriptionCount: 2 },
    ]);
    expect(result.implementationDefects.map((finding) => finding.code)).toEqual([
      "document-title-count",
      "meta-description-count",
    ]);
  });

  it("fails a repeated approved brand suffix", () => {
    const result = auditMetadataRecords([
      {
        ...base,
        url: "/privacy/",
        canonicalFamily: "/privacy/",
        title: "Privacy | Noel D'Costa | Noel D'Costa",
      },
    ]);
    expect(result.implementationDefects).toEqual([
      expect.objectContaining({ code: "repeated-brand-suffix", url: "/privacy/" }),
    ]);
  });

  it("fails unresolved document placeholders without flagging ordinary percent or braces", () => {
    const records = [
      { ...base, url: "/title-placeholder/", canonicalFamily: "/title-placeholder/", title: "%s | Noel D'Costa" },
      { ...base, url: "/description-placeholder/", canonicalFamily: "/description-placeholder/", description: "{{ page.description }}" },
      { ...base, url: "/ordinary/", canonicalFamily: "/ordinary/", title: "Save 50% {when eligible}", description: "A normal description with {ordinary braces} and enough detail for readers to understand it." },
    ];
    const result = auditMetadataRecords(records);
    expect(result.implementationDefects.filter((finding) => finding.code === "unresolved-document-placeholder"))
      .toEqual([
        expect.objectContaining({ field: "title", url: "/title-placeholder/" }),
        expect.objectContaining({ field: "description", url: "/description-placeholder/" }),
      ]);
  });

  it("fails inherited layout document defaults on a non-home page", () => {
    const result = auditMetadataRecords([{
      ...base,
      url: "/wrong-default/",
      canonicalFamily: "/wrong-default/",
      title: "Noel D'Costa | ERP, Data & AI",
      description: "25+ years helping companies migrate ERP, build AI, and get real value from SAP and Oracle systems.",
    }]);
    expect(result.implementationDefects).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "inherited-default-document-title" }),
      expect.objectContaining({ code: "inherited-default-document-description" }),
    ]));
  });

  it("allows a layout-default document value only through an explicit homepage exception", () => {
    const homepage = {
      ...base,
      url: "/",
      canonicalFamily: "/",
      title: "Noel D'Costa | ERP, Data & AI",
      description: "25+ years helping companies migrate ERP, build AI, and get real value from SAP and Oracle systems.",
    };
    expect(auditMetadataRecords([homepage]).implementationDefects).toHaveLength(2);
    const result = auditMetadataRecords([{
      ...homepage,
      documentDefaultException: "homepage-explicit-metadata",
    }]);
    expect(result.implementationDefects).toEqual([]);
  });

  it("flags exact normalized duplicates only across distinct canonical families in one locale", () => {
    const result = auditMetadataRecords([
      { ...base, url: "/one/", canonicalFamily: "/one/" },
      { ...base, url: "/one-alias/", canonicalFamily: "/one/" },
      { ...base, url: "/two/", canonicalFamily: "/two/" },
      { ...base, url: "/es/one/", canonicalFamily: "/es/one/", locale: "es" },
    ]);
    expect(result.editorialDefects).toHaveLength(2);
    expect(result.editorialDefects.every((finding) => finding.code.startsWith("duplicate-"))).toBe(true);
    expect(result.editorialDefects.every((finding) => finding.urls.includes("/two/"))).toBe(true);
  });

  it("records aliases and approved About/archive-shortcut exceptions without suppressing completeness", () => {
    const result = auditMetadataRecords([
      { ...base, url: "/about/", canonicalFamily: "/", exception: "about-canonical" },
      { ...base, url: "/sap-modules/", canonicalFamily: "/category/sap-modules/", exception: "archive-shortcut" },
      { ...base, url: "/category/sap-modules/", canonicalFamily: "/category/sap-modules/" },
    ]);
    expect(result.exceptions).toEqual([
      expect.objectContaining({ url: "/about/", exception: "about-canonical" }),
      expect.objectContaining({ url: "/sap-modules/", exception: "archive-shortcut" }),
    ]);
    expect(result.implementationDefects).toEqual([]);
  });

  it("fails inventory drift, duplicate URLs, and missing build identity", () => {
    expect(() => assertMetadataInventory([{ url: "/" }], {
      expectedCount: 2,
      buildId: "build",
      artifactFingerprint: "sha256:value",
    })).toThrow(/expected 2 records, received 1/);
    expect(() => assertMetadataInventory([{ url: "/" }, { url: "/" }], {
      expectedCount: 2,
      buildId: "build",
      artifactFingerprint: "sha256:value",
    })).toThrow(/duplicate URL/);
    expect(() => assertMetadataInventory([{ url: "/" }], {
      expectedCount: 1,
      buildId: "",
      artifactFingerprint: "",
    })).toThrow(/build identity/);
  });

  it("reports cross-locale identical metadata as translation-suspicion diagnostics only", () => {
    const result = auditMetadataRecords([
      { ...base, url: "/one/", canonicalFamily: "/one/" },
      { ...base, url: "/es/one/", canonicalFamily: "/es/one/", locale: "es" },
    ]);
    expect(result.implementationDefects).toEqual([]);
    expect(result.editorialDefects).toEqual([]);
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "cross-locale-identical-title" }),
      expect.objectContaining({ code: "cross-locale-identical-description" }),
    ]));
  });

  it("attributes protected metadata without inventing fallback copy", () => {
    const frontmatter = {
      metaTitle: "Meta title",
      title: "Editorial title",
      metaDescription: "Meta description",
      excerpt: "Editorial excerpt",
    };
    expect(attributeMetadataSource(frontmatter, "title")).toBe("metaTitle");
    expect(attributeMetadataSource({ title: "Editorial title" }, "title")).toBe("title");
    expect(attributeMetadataSource(frontmatter, "description")).toBe("metaDescription");
    expect(attributeMetadataSource({ excerpt: "Editorial excerpt" }, "description")).toBe("excerpt");
    expect(attributeMetadataSource({ title: "Only a title" }, "description")).toBe("template fallback");
  });

  it("resolves homepage and case-studies provenance to explicit templates despite content collisions", () => {
    const collision = {
      kind: "mdx-page",
      slug: "case-studies",
      sourcePath: "content/pages/case-studies/en.mdx",
      frontmatter: { title: "Collision title" },
    };
    for (const [url, template] of [["/", "homepage"], ["/case-studies/", "portfolio-archive"]]) {
      expect(metadataProvenance({
        url,
        template,
        candidates: [collision],
        values: {
          title: "Rendered title",
          description: "Rendered description",
          ogTitle: "Rendered title",
          ogDescription: "Rendered description",
          twitterTitle: "Rendered title",
          twitterDescription: "Rendered description",
        },
      })).toMatchObject({
        protectedSourcePath: null,
        title: "explicit static/template metadata",
        description: "explicit static/template metadata",
        ogTitle: "explicit static/template metadata",
        ogDescription: "explicit static/template metadata",
        twitterTitle: "explicit static/template metadata",
        twitterDescription: "explicit static/template metadata",
      });
    }
  });

  it("resolves /about/ to the actual about MDX and attributes every rendered field", () => {
    const about = {
      kind: "mdx-page",
      slug: "about",
      sourcePath: "content/pages/about/en.mdx",
      frontmatter: {
        title: "About",
        metaTitle: "About Noel",
        excerpt: "Excerpt",
        metaDescription: "About description",
      },
    };
    const staleCollision = {
      kind: "mdx-page",
      slug: "old-about",
      sourcePath: "content/pages/old-about/en.mdx",
      frontmatter: { title: "Old" },
    };
    expect(metadataProvenance({
      url: "/about/",
      template: "dedicated-mdx-page",
      candidates: [staleCollision, about],
      values: {},
    })).toEqual({
      protectedSourcePath: "content/pages/about/en.mdx",
      title: "metaTitle",
      description: "metaDescription",
      ogTitle: "metaTitle",
      ogDescription: "metaDescription",
      twitterTitle: "metaTitle",
      twitterDescription: "metaDescription",
      resolution: "dedicated-about-slug",
    });
  });

  it("records missing and duplicate protected frontmatter fields from raw evidence", () => {
    const raw = `---
title: First title
title: Second title
slug: example
---
Body`;
    const findings = auditProtectedFrontmatter({
      raw,
      frontmatter: { title: "Second title", slug: "example" },
      expectedLocale: "en",
      sourcePath: "content/pages/example/en.mdx",
    });
    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "protected-frontmatter-duplicate-key", key: "title" }),
      expect.objectContaining({ code: "protected-frontmatter-missing-description" }),
    ]));
    expect(findings.find((finding) => finding.code === "protected-frontmatter-duplicate-key")?.rawEvidence)
      .toEqual([
        { lineNumber: 2, line: "title: First title" },
        { lineNumber: 3, line: "title: Second title" },
      ]);
  });

  it("reports only explicit locale declaration contradictions as wrong-language editorial defects", () => {
    expect(auditProtectedFrontmatter({
      raw: "---\nlocale: en\ntitle: T\nexcerpt: D\n---",
      frontmatter: { locale: "en", title: "T", excerpt: "D" },
      expectedLocale: "es",
      sourcePath: "content/pages/example/es.mdx",
    })).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: "protected-frontmatter-explicit-locale-mismatch",
        declaredLocale: "en",
        expectedLocale: "es",
      }),
    ]));
    expect(auditProtectedFrontmatter({
      raw: "---\ntitle: English-looking words\nexcerpt: Still no declaration\n---",
      frontmatter: { title: "English-looking words", excerpt: "Still no declaration" },
      expectedLocale: "ja",
      sourcePath: "content/pages/example/ja.mdx",
    }).some((finding) => finding.code.includes("locale"))).toBe(false);
  });

  it("keeps length thresholds diagnostic and counts Unicode code points", () => {
    expect(metadataLengthDiagnostics({ title: "短い", description: "説明" })).toEqual([
      expect.objectContaining({ code: "title-length", codePoints: 2 }),
      expect.objectContaining({ code: "description-length", codePoints: 2 }),
    ]);
    expect(metadataLengthDiagnostics({
      title: "A useful title between limits",
      description: "A useful description that is comfortably between the diagnostic lower and upper limits for this audit.",
    })).toEqual([]);
  });

  it("classifies missing social fields as diagnostic and inherited wrong-page defaults as implementation defects", () => {
    expect(classifySocialMetadata({ documentTitle: "Archive", documentDescription: "Archive desc" })).toEqual([
      expect.objectContaining({ severity: "diagnostic", code: "missing-og-title" }),
      expect.objectContaining({ severity: "diagnostic", code: "missing-og-description" }),
      expect.objectContaining({ severity: "diagnostic", code: "missing-twitter-title" }),
      expect.objectContaining({ severity: "diagnostic", code: "missing-twitter-description" }),
    ]);
    expect(classifySocialMetadata({
      documentTitle: "SAP Modules",
      documentDescription: "Archive desc",
      ogTitle: "Home",
      ogDescription: "Homepage copy",
      twitterTitle: "Home",
      twitterDescription: "Homepage copy",
      inheritedDefaults: { title: "Home", descriptions: ["Homepage copy"] },
    }).every((finding) => finding.severity === "implementation-defect")).toBe(true);
  });

  it("flags unrelated populated social titles and descriptions for review", () => {
    expect(classifySocialMetadata({
      documentTitle: "SAP Modules",
      documentDescription: "Deep technical coverage of SAP and ERP modules.",
      ogTitle: "A different article",
      ogDescription: "Unrelated Open Graph copy.",
      twitterTitle: "Another title",
      twitterDescription: "Unrelated Twitter copy.",
    })).toEqual([
      expect.objectContaining({ severity: "diagnostic", code: "social-value-mismatch-og-title" }),
      expect.objectContaining({ severity: "diagnostic", code: "social-value-mismatch-og-description" }),
      expect.objectContaining({ severity: "diagnostic", code: "social-value-mismatch-twitter-title" }),
      expect.objectContaining({ severity: "diagnostic", code: "social-value-mismatch-twitter-description" }),
    ]);
  });

  it("allows exactly one approved trailing brand suffix on either title value", () => {
    const common = {
      documentDescription: "Shared description",
      ogDescription: "Shared description",
      twitterDescription: "Shared description",
    };
    expect(classifySocialMetadata({
      ...common,
      documentTitle: "SAP Modules",
      ogTitle: "SAP Modules | Noel D'Costa",
      twitterTitle: "SAP Modules | Noel D'Costa",
    })).toEqual([]);
    expect(classifySocialMetadata({
      ...common,
      documentTitle: "SAP Modules | Noel D'Costa",
      ogTitle: "SAP Modules",
      twitterTitle: "SAP Modules",
    })).toEqual([]);
    expect(classifySocialMetadata({
      ...common,
      documentTitle: "SAP Modules | Noel D'Costa | Noel D'Costa",
      ogTitle: "SAP Modules | Noel D'Costa",
      twitterTitle: "SAP Modules | Noel D'Costa",
    })).toEqual([
      expect.objectContaining({ code: "social-value-mismatch-og-title" }),
      expect.objectContaining({ code: "social-value-mismatch-twitter-title" }),
    ]);
  });

  it("allows only explicitly named social variants and does not waive inherited defaults", () => {
    expect(classifySocialMetadata({
      documentTitle: "SAP Modules",
      documentDescription: "Document description",
      ogTitle: "SAP Modules",
      ogDescription: "Intentional channel-specific copy",
      twitterTitle: "SAP Modules",
      twitterDescription: "Document description",
      socialExceptions: {
        "og-description": "approved-og-description-variant",
      },
    })).toEqual([]);

    expect(classifySocialMetadata({
      documentTitle: "SAP Modules",
      documentDescription: "Document description",
      ogTitle: "Home",
      ogDescription: "Homepage copy",
      twitterTitle: "SAP Modules",
      twitterDescription: "Document description",
      inheritedDefaults: { title: "Home", descriptions: ["Homepage copy"] },
      socialExceptions: {
        "og-title": "approved-og-title-variant",
        "og-description": "approved-og-description-variant",
      },
    })).toEqual([
      expect.objectContaining({ severity: "implementation-defect", code: "inherited-default-og-title" }),
      expect.objectContaining({ severity: "implementation-defect", code: "inherited-default-og-description" }),
    ]);
  });
});

describe("archive metadata regression", () => {
  it("keeps an already branded archive title absolute and sets route-specific social metadata", () => {
    const metadata = seo.buildArchiveMetadata({
      title: "SAP Modules | Noel D'Costa",
      description: "Deep technical coverage of SAP and ERP modules.",
      canonical: "https://noeldcosta.com/category/sap-modules/",
    });
    expect(metadata.title).toEqual({ absolute: "SAP Modules | Noel D'Costa" });
    expect(metadata.openGraph).toMatchObject({
      title: "SAP Modules | Noel D'Costa",
      description: "Deep technical coverage of SAP and ERP modules.",
      url: "https://noeldcosta.com/category/sap-modules/",
    });
    expect(metadata.twitter).toMatchObject({
      title: "SAP Modules | Noel D'Costa",
      description: "Deep technical coverage of SAP and ERP modules.",
    });
  });

  it("provides a shared static-page boundary with absolute and route-specific social metadata", () => {
    expect(typeof seo.buildStaticPageMetadata).toBe("function");
    const metadata = seo.buildStaticPageMetadata?.({
      title: "Privacy | Noel D'Costa",
      description: "Privacy details for this website and its forms.",
      canonical: "https://noeldcosta.com/privacy/",
    });
    expect(metadata).toMatchObject({
      title: { absolute: "Privacy | Noel D'Costa" },
      twitter: {
        title: "Privacy | Noel D'Costa",
        description: "Privacy details for this website and its forms.",
      },
    });
  });
});
