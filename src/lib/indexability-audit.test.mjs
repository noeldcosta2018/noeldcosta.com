import { describe, expect, it } from "vitest";
import {
  assertGeneratedHtmlInventory,
  assertRequiredHttpCoverage,
  classifyIndexabilityPolicy,
  evaluateIndexability,
  evaluateHttpOutcome,
  parseRobotsDirectives,
  rawHeaderValues,
} from "./indexability-audit.mjs";

describe("Phase 4B required HTTP coverage", () => {
  const required = [
    "canonical-localized-content",
    "canonical-english-post",
    "canonical-english-page",
    "public-tool",
    "real-alias",
    "raw-mdx-negative",
  ];

  it("rejects an audit when a required HTTP category is missing", () => {
    expect(() =>
      assertRequiredHttpCoverage(
        [{ coverageCategory: "canonical-localized-content" }],
        required,
      ),
    ).toThrow(/canonical-english-post.*raw-mdx-negative/);
  });

  it("accepts an audit only when every required HTTP category is present", () => {
    expect(
      assertRequiredHttpCoverage(
        required.map((coverageCategory) => ({ coverageCategory })),
        required,
      ),
    ).toEqual({ required, present: required });
  });
});

describe("Phase 4B indexability directive parsing", () => {
  it("normalizes case and combines duplicate directives with restrictions winning", () => {
    expect(
      parseRobotsDirectives(["INDEX, FOLLOW", "NoIndex", "NOFOLLOW"]),
    ).toMatchObject({
      index: "blocked",
      follow: "blocked",
      directives: ["follow", "index", "nofollow", "noindex"],
    });
  });

  it("expands none and does not treat missing index or follow as a defect", () => {
    expect(parseRobotsDirectives(["none"])).toMatchObject({
      index: "blocked",
      follow: "blocked",
    });
    expect(parseRobotsDirectives([])).toEqual({
      directives: [],
      index: "unspecified",
      follow: "unspecified",
    });
  });

  it("lets crawler-specific directives make generic permission more restrictive", () => {
    expect(
      evaluateIndexability({
        expectedPolicy: "index",
        robots: ["index, follow"],
        googlebot: ["noindex"],
        xRobotsTag: ["googlebot: nofollow", "INDEX"],
      }),
    ).toMatchObject({
      effectiveResult: "blocked-by-noindex",
      effectiveIndex: "blocked",
      effectiveFollow: "blocked",
      policyResult: "defect",
    });
  });

  it("honors generic X-Robots-Tag restrictions and duplicate header values", () => {
    expect(
      evaluateIndexability({
        expectedPolicy: "noindex",
        robots: [],
        googlebot: [],
        xRobotsTag: ["all", "NoIndex", "nofollow"],
      }),
    ).toMatchObject({
      effectiveResult: "blocked-by-noindex",
      policyResult: "compliant",
    });
  });

  it("does not mistake colon-valued X-Robots directives for crawler scopes", () => {
    expect(
      evaluateIndexability({
        expectedPolicy: "index",
        xRobotsTag: [
          "unavailable_after: 25 Jun 2030 15:00:00 PST",
          "googlebot: noindex",
        ],
      }).generic.directives,
    ).toEqual([
      "noindex",
      "unavailable_after: 25 jun 2030 15:00:00 pst",
    ]);
  });

  it.each([
    ["generic robots", { robots: ["index, nofollow"] }],
    ["crawler-specific meta", { googlebot: ["nofollow"] }],
    ["applicable response header", { xRobotsTag: ["nofollow"] }],
  ])("rejects public nofollow from %s", (_, directives) => {
    expect(
      evaluateIndexability({
        expectedPolicy: "index",
        ...directives,
      }),
    ).toMatchObject({
      effectiveIndex: expect.not.stringMatching(/^blocked$/),
      effectiveFollow: "blocked",
      policyResult: "defect",
    });
  });

  it("keeps unspecified follow compliant for public routes", () => {
    expect(
      evaluateIndexability({
        expectedPolicy: "index",
        robots: ["index"],
      }),
    ).toMatchObject({
      effectiveIndex: "allowed",
      effectiveFollow: "unspecified",
      policyResult: "compliant",
    });
  });

  it("keeps a future unavailable_after directive compliant", () => {
    expect(
      evaluateIndexability({
        expectedPolicy: "index",
        robots: ["unavailable_after: 31 Dec 2026 23:59:59 GMT"],
        now: "2026-01-01T00:00:00.000Z",
      }),
    ).toMatchObject({
      effectiveResult: "indexable-by-directives",
      policyResult: "compliant",
      unavailableAfter: { state: "future" },
    });
  });

  it("blocks public indexing after unavailable_after expires", () => {
    expect(
      evaluateIndexability({
        expectedPolicy: "index",
        robots: ["unavailable_after: 31 Dec 2025 23:59:59 GMT"],
        now: "2026-01-01T00:00:00.000Z",
      }),
    ).toMatchObject({
      effectiveIndex: "blocked",
      effectiveResult: "blocked-by-unavailable-after",
      policyResult: "defect",
      unavailableAfter: { state: "expired" },
    });
  });

  it("applies crawler-scoped unavailable_after to Googlebot", () => {
    expect(
      evaluateIndexability({
        expectedPolicy: "index",
        xRobotsTag: [
          "googlebot: unavailable_after: 31 Dec 2025 23:59:59 GMT",
        ],
        now: "2026-01-01T00:00:00.000Z",
      }),
    ).toMatchObject({
      effectiveResult: "blocked-by-unavailable-after",
      policyResult: "defect",
    });
  });

  it("ignores unavailable_after scoped only to another crawler", () => {
    expect(
      evaluateIndexability({
        expectedPolicy: "index",
        xRobotsTag: [
          "bingbot: unavailable_after: 31 Dec 2025 23:59:59 GMT",
        ],
        now: "2026-01-01T00:00:00.000Z",
      }),
    ).toMatchObject({
      effectiveResult: "indexable-by-directives",
      policyResult: "compliant",
      unavailableAfter: { state: "absent" },
    });
  });

  it("surfaces an invalid unavailable_after as indeterminate and defective", () => {
    expect(
      evaluateIndexability({
        expectedPolicy: "index",
        googlebot: ["unavailable_after: someday maybe"],
        now: "2026-01-01T00:00:00.000Z",
      }),
    ).toMatchObject({
      effectiveIndex: "indeterminate",
      effectiveResult: "indeterminate-unavailable-after",
      policyResult: "defect",
      unavailableAfter: { state: "invalid" },
    });
  });
});

describe("Phase 4B route policy classification", () => {
  it("classifies policy independently of observed directives", () => {
    expect(classifyIndexabilityPolicy({ url: "/about/" })).toMatchObject({
      classification: "public-page",
      expectedPolicy: "index",
    });
    expect(
      classifyIndexabilityPolicy({ url: "/category/sap-modules/" }),
    ).toMatchObject({
      classification: "public-archive",
      expectedPolicy: "index",
    });
    expect(
      classifyIndexabilityPolicy({
        url: "/erp-implementation-cost-calculator/",
      }),
    ).toMatchObject({
      classification: "public-tool",
      expectedPolicy: "index",
    });
    expect(classifyIndexabilityPolicy({ url: "/admin/login/" })).toMatchObject(
      {
        classification: "admin",
        expectedPolicy: "noindex",
      },
    );
  });

  it("keeps framework artifacts and negative HTTP routes distinct", () => {
    expect(
      classifyIndexabilityPolicy({
        artifactPath: "_global-error.html",
        url: null,
      }),
    ).toMatchObject({
      classification: "non-routable-framework-artifact",
      expectedPolicy: "not-applicable",
    });
    expect(
      classifyIndexabilityPolicy({
        artifactPath: "_not-found.html",
        url: null,
      }),
    ).toMatchObject({
      classification: "framework-not-found",
      expectedPolicy: "noindex",
    });
    expect(
      classifyIndexabilityPolicy({ url: "/definitely-missing/", status: 404 }),
    ).toMatchObject({
      classification: "negative-http-route",
      expectedPolicy: "noindex",
    });
  });

  it("classifies held and unsupported locale URLs independently of a successful response", () => {
    expect(
      classifyIndexabilityPolicy({
        url: "/ar/example/",
        artifactPath: "ar/example.html",
        status: 200,
      }),
    ).toMatchObject({
      classification: "held-locale-route",
      expectedPolicy: "noindex",
    });
    expect(
      classifyIndexabilityPolicy({
        url: "/zh-CN/example/",
        artifactPath: "zh-CN/example.html",
        status: 200,
      }),
    ).toMatchObject({
      classification: "held-locale-route",
      expectedPolicy: "noindex",
    });
    expect(
      classifyIndexabilityPolicy({
        url: "/el/example/",
        artifactPath: "el/example.html",
        status: 200,
      }),
    ).toMatchObject({
      classification: "unsupported-locale-route",
      expectedPolicy: "noindex",
    });
    expect(
      classifyIndexabilityPolicy({
        url: null,
        artifactPath: "ar/example.html",
        status: 200,
      }),
    ).toMatchObject({
      classification: "held-locale-route",
      expectedPolicy: "noindex",
    });
    expect(classifyIndexabilityPolicy({ url: "/ai/example/" })).toMatchObject({
      classification: "public-page",
      expectedPolicy: "index",
    });
  });
});

describe("Phase 4B inventory completeness", () => {
  const expected = {
    total: 2,
    manifestRoutes: ["/", "/about"],
    localeCounts: { en: 2 },
    classificationCounts: { "public-page": 2 },
    templateCounts: { homepage: 1, "public-route": 1 },
    nonRoutableMarkers: [],
  };
  const complete = [
    {
      artifactPath: "index.html",
      manifestRoute: "/",
      url: "/",
      locale: "en",
      classification: "public-page",
      template: "homepage",
      nonRoutableMarker: null,
    },
    {
      artifactPath: "about.html",
      manifestRoute: "/about",
      url: "/about/",
      locale: "en",
      classification: "public-page",
      template: "public-route",
      nonRoutableMarker: null,
    },
  ];

  it("rejects incomplete generated HTML inventories", () => {
    expect(() => assertGeneratedHtmlInventory(complete.slice(0, 1), expected)).toThrow(
      /expected 2 generated HTML artifacts, received 1/i,
    );
  });

  it("rejects duplicate artifact paths and URLs", () => {
    expect(() =>
      assertGeneratedHtmlInventory([complete[0], complete[0]], expected),
    ).toThrow(/duplicate artifact path.*duplicate public URL/i);
  });

  it("accepts only an exact prerender manifest and count match", () => {
    expect(assertGeneratedHtmlInventory(complete, expected)).toMatchObject({
      total: 2,
      uniqueArtifactPaths: 2,
      uniqueManifestRoutes: 2,
      manifestMatch: true,
    });
  });
});

describe("Phase 4B HTTP outcome enforcement", () => {
  const expected = {
    initialStatus: 200,
    finalStatus: 200,
    redirectExpectation: "none",
    finalPath: "/example/",
  };

  it("rejects a wrong response status even when robots directives are restrictive", () => {
    expect(
      evaluateHttpOutcome(
        {
          requestedUrl: "http://127.0.0.1:3110/example/",
          status: 404,
          finalStatus: 404,
          finalUrl: "http://127.0.0.1:3110/example/",
        },
        expected,
      ),
    ).toMatchObject({ result: "defect" });
  });

  it("rejects an unexpected redirect and final URL", () => {
    expect(
      evaluateHttpOutcome(
        {
          requestedUrl: "http://127.0.0.1:3110/example/",
          status: 307,
          finalStatus: 200,
          finalUrl: "http://127.0.0.1:3110/admin/login/",
        },
        expected,
      ),
    ).toMatchObject({ result: "defect" });
  });
});

describe("Phase 4B raw response-header preservation", () => {
  it("keeps duplicate X-Robots-Tag fields separate so a generic restriction remains applicable", () => {
    const values = rawHeaderValues(
      [
        "X-Robots-Tag",
        "bingbot: noindex",
        "x-robots-tag",
        "noindex",
      ],
      "x-robots-tag",
    );
    expect(values).toEqual(["bingbot: noindex", "noindex"]);
    expect(
      evaluateIndexability({
        expectedPolicy: "index",
        xRobotsTag: values,
      }),
    ).toMatchObject({
      effectiveIndex: "blocked",
      policyResult: "defect",
    });
  });
});
