import { readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertGeneratedHtmlInventory,
  assertRequiredHttpCoverage,
  classifyIndexabilityPolicy,
  evaluateIndexability,
  evaluateHttpOutcome,
  rawHeaderValues,
} from "../src/lib/indexability-audit.mjs";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_BUILD_ROOT = path.join(PROJECT_ROOT, ".next", "server", "app");
const DEFAULT_OUTPUT = path.join(
  PROJECT_ROOT,
  "docs",
  "codex",
  "audit",
  "phase-4b-indexability-audit.json",
);
const USER_AGENT =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const auditNow = new Date();
const EXPECTED_NON_HTML_PRERENDER_ROUTES = [
  "/favicon.ico",
  "/llms.txt",
  "/robots.txt",
  "/sitemap.xml",
];
const REQUIRED_HTTP_COVERAGE = [
  "dynamic-public-archive",
  "admin-login",
  "dynamic-admin",
  "missing-public-route",
  "missing-localized-route",
  "held-arabic-route",
  "held-chinese-route",
  "unsupported-locale-route",
  "canonical-localized-article",
  "canonical-localized-page",
  "canonical-english-post",
  "canonical-english-page",
  "about-page",
  "case-studies-page",
  "public-tool",
  "real-alias",
  "raw-mdx-negative",
];

function option(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function expectedNoRedirect(finalPath, status) {
  return {
    initialStatus: status,
    finalStatus: status,
    redirectExpectation: "none",
    finalPath,
  };
}

async function walkHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walkHtml(absolute)));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(absolute);
  }
  return files.sort((left, right) => left.localeCompare(right));
}

function artifactToUrl(artifactPath) {
  const normalized = artifactPath.replaceAll("\\", "/");
  if (normalized === "_global-error.html" || normalized === "_not-found.html") {
    return null;
  }
  const withoutExtension = normalized.slice(0, -".html".length);
  if (withoutExtension === "index") return "/";
  return `/${withoutExtension}/`;
}

function artifactToManifestRoute(artifactPath, url) {
  if (artifactPath === "_global-error.html") return "/_global-error";
  if (artifactPath === "_not-found.html") return "/_not-found";
  if (url === "/") return "/";
  return url.slice(0, -1);
}

function metaValues(html, targetName) {
  const values = [];
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    const attributes = Object.fromEntries(
      [...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gi)].map(
        ([, name, , value]) => [name.toLowerCase(), value],
      ),
    );
    if (attributes.name?.trim().toLowerCase() === targetName) {
      values.push(attributes.content ?? "");
    }
  }
  return values;
}

function publicLocale(url, publicPrefixes) {
  if (!url) return null;
  const firstSegment = url.split("/").filter(Boolean)[0];
  return publicPrefixes.has(firstSegment) ? firstSegment : "en";
}

function routeWithoutLocale(url, publicPrefixes) {
  if (!url) return null;
  const segments = url.split("/").filter(Boolean);
  if (publicPrefixes.has(segments[0])) segments.shift();
  return segments.length === 0 ? "/" : `/${segments.join("/")}/`;
}

function templateFor(url, classification, manifestByPath, publicPrefixes) {
  if (!url) return classification;
  const route = routeWithoutLocale(url, publicPrefixes);
  if (route === "/") return "homepage";
  if (classification === "public-archive") return "archive";
  if (classification === "public-tool") return "interactive-tool";
  if (classification === "admin") return "admin";
  const manifestItem = manifestByPath.get(route.slice(1));
  if (manifestItem) return `mdx-${manifestItem.kind}`;
  return "public-route";
}

function requestOnce(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const transport = parsed.protocol === "https:" ? https : http;
    const request = transport.request(parsed, {
      method: "GET",
      headers: { "user-agent": USER_AGENT },
    });
    request.on("response", (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        resolve({
          url,
          status: response.statusCode ?? 0,
          location: response.headers.location ?? null,
          rawHeaders: response.rawHeaders,
          body: Buffer.concat(chunks).toString("utf8"),
        });
      });
    });
    request.on("error", reject);
    request.end();
  });
}

async function requestFollowingRedirects(requestedUrl, maxRedirects = 5) {
  const chain = [];
  let currentUrl = requestedUrl;
  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    const response = await requestOnce(currentUrl);
    chain.push(response);
    if (
      response.status >= 300 &&
      response.status < 400 &&
      response.location
    ) {
      currentUrl = new URL(response.location, currentUrl).toString();
      continue;
    }
    return { initial: chain[0], final: response, chain };
  }
  throw new Error(`Exceeded ${maxRedirects} redirects for ${requestedUrl}`);
}

async function auditHttpCheck(baseUrl, check) {
  const requestedUrl = new URL(check.path, baseUrl).toString();
  const { initial, final, chain } = await requestFollowingRedirects(requestedUrl);
  const html = final.body;
  const policy = classifyIndexabilityPolicy({
    url: check.path,
    status: final.status,
  });
  const expectedPolicy = check.expectedPolicy ?? policy.expectedPolicy;
  const robots = metaValues(html, "robots");
  const googlebot = metaValues(html, "googlebot");
  const xRobotsTag = rawHeaderValues(final.rawHeaders, "x-robots-tag");
  const evaluation = evaluateIndexability({
    expectedPolicy,
    robots,
    googlebot,
    xRobotsTag,
    now: auditNow,
  });
  const httpOutcome = evaluateHttpOutcome(
    {
      requestedUrl,
      status: initial.status,
      finalStatus: final.status,
      finalUrl: final.url,
    },
    check.expectedHttp,
  );
  const policyResult =
    evaluation.policyResult === "defect" || httpOutcome.result === "defect"
      ? "defect"
      : evaluation.policyResult;

  return {
    url: check.path,
    coverageCategory: check.coverageCategory,
    template: check.template,
    classification: check.classification ?? policy.classification,
    locale: check.locale,
    expectedPolicy,
    expectedHttp: check.expectedHttp,
    status: initial.status,
    finalStatus: final.status,
    finalUrl: final.url,
    redirectChain: chain.map((response) => ({
      url: response.url,
      status: response.status,
      location: response.location,
      xRobotsTag: rawHeaderValues(response.rawHeaders, "x-robots-tag"),
    })),
    robots,
    googlebot,
    xRobotsTag,
    effectiveResult: evaluation.effectiveResult,
    effectiveIndex: evaluation.effectiveIndex,
    effectiveFollow: evaluation.effectiveFollow,
    unavailableAfter: evaluation.unavailableAfter,
    directivePolicyResult: evaluation.policyResult,
    httpOutcomeResult: httpOutcome.result,
    httpOutcomeIssues: httpOutcome.issues,
    policyResult,
    rationale: check.rationale ?? policy.rationale,
    evidenceEnvironment: "local Next.js production server; Googlebot user agent",
  };
}

const buildRoot = path.resolve(option("--build-root") ?? DEFAULT_BUILD_ROOT);
const outputPath = path.resolve(option("--output") ?? DEFAULT_OUTPUT);
const baseUrl = option("--base-url");
if (!baseUrl) {
  throw new Error(
    "--base-url is required so the audit cannot omit mandatory production-mode HTTP coverage.",
  );
}
const manifest = JSON.parse(
  await readFile(path.join(PROJECT_ROOT, "docs", "codex", "locale-content-manifest.json"), "utf8"),
);
const prerenderManifestPath = path.join(PROJECT_ROOT, ".next", "prerender-manifest.json");
const prerenderManifestRaw = await readFile(prerenderManifestPath, "utf8");
const prerenderManifest = JSON.parse(prerenderManifestRaw);
const allPrerenderRoutes = Object.keys(prerenderManifest.routes);
const nonHtmlPrerenderRoutes = allPrerenderRoutes
  .filter((route) => EXPECTED_NON_HTML_PRERENDER_ROUTES.includes(route))
  .sort();
if (
  JSON.stringify(nonHtmlPrerenderRoutes) !==
  JSON.stringify([...EXPECTED_NON_HTML_PRERENDER_ROUTES].sort())
) {
  throw new Error(
    `Non-HTML prerender route mismatch; expected ${EXPECTED_NON_HTML_PRERENDER_ROUTES.join(", ")}, received ${nonHtmlPrerenderRoutes.join(", ")}.`,
  );
}
const htmlPrerenderRoutes = allPrerenderRoutes.filter(
  (route) => !EXPECTED_NON_HTML_PRERENDER_ROUTES.includes(route),
);
const buildId = (await readFile(path.join(PROJECT_ROOT, ".next", "BUILD_ID"), "utf8")).trim();
const artifactFingerprint = createHash("sha256")
  .update(buildId)
  .update("\n")
  .update(prerenderManifestRaw)
  .digest("hex");
const publicPrefixes = new Set(
  Object.values(manifest.public_locale_map).filter(Boolean),
);
const manifestByPath = new Map(
  manifest.items
    .filter((item) => item.public_path !== "")
    .map((item) => [item.public_path, item]),
);
const htmlFiles = await walkHtml(buildRoot);
const inventory = [];

for (const file of htmlFiles) {
  const artifactPath = path.relative(buildRoot, file).replaceAll("\\", "/");
  const url = artifactToUrl(artifactPath);
  const html = await readFile(file, "utf8");
  const policy = classifyIndexabilityPolicy({ url, artifactPath });
  const robots = metaValues(html, "robots");
  const googlebot = metaValues(html, "googlebot");
  const xRobotsTag = [];
  const evaluation = evaluateIndexability({
    expectedPolicy: policy.expectedPolicy,
    robots,
    googlebot,
    xRobotsTag,
    now: auditNow,
  });
  inventory.push({
    url,
    nonRoutableMarker: url ? null : artifactPath,
    artifactPath,
    manifestRoute: artifactToManifestRoute(artifactPath, url),
    template: templateFor(url, policy.classification, manifestByPath, publicPrefixes),
    classification: policy.classification,
    locale: publicLocale(url, publicPrefixes),
    expectedPolicy: policy.expectedPolicy,
    status: null,
    finalUrl: null,
    robots,
    googlebot,
    xRobotsTag,
    effectiveResult: evaluation.effectiveResult,
    effectiveIndex: evaluation.effectiveIndex,
    effectiveFollow: evaluation.effectiveFollow,
    unavailableAfter: evaluation.unavailableAfter,
    policyResult: evaluation.policyResult,
    rationale: policy.rationale,
    evidenceEnvironment: "local Next.js production build artifact",
  });
}

const inventoryCompleteness = assertGeneratedHtmlInventory(inventory, {
  total: 1460,
  manifestRoutes: htmlPrerenderRoutes,
  localeCounts: {
    de: 109,
    en: 259,
    es: 109,
    fr: 109,
    hi: 109,
    it: 109,
    ja: 109,
    ko: 109,
    nl: 109,
    null: 2,
    pt: 109,
    ru: 109,
    tr: 109,
  },
  classificationCounts: {
    admin: 1,
    "framework-not-found": 1,
    "non-routable-framework-artifact": 1,
    "public-archive": 123,
    "public-page": 1328,
    "public-tool": 6,
  },
  templateCounts: {
    admin: 1,
    archive: 123,
    "framework-not-found": 1,
    homepage: 1,
    "interactive-tool": 6,
    "mdx-page": 338,
    "mdx-post": 972,
    "non-routable-framework-artifact": 1,
    "public-route": 17,
  },
  nonRoutableMarkers: ["_global-error.html", "_not-found.html"],
});

const httpChecks = [];
const representativePost =
  "/best-sap-implementation-templates-activate-2024/";
const representativePage = "/sap-implementation/sap-modules/";
const checks = [
    {
      path: "/category/sap-modules/",
      expectedHttp: expectedNoRedirect("/category/sap-modules/", 200),
      coverageCategory: "dynamic-public-archive",
      template: "dynamic-archive-route",
      classification: "public-archive",
      locale: "en",
      expectedPolicy: "index",
      rationale: "Representative dynamic archive retains public indexability.",
    },
    {
      path: "/admin/login/",
      expectedHttp: expectedNoRedirect("/admin/login/", 200),
      coverageCategory: "admin-login",
      template: "admin-login",
      classification: "admin",
      locale: "en",
      expectedPolicy: "noindex",
      rationale: "Admin login is intentionally non-indexable.",
    },
    {
      path: "/admin/book-leads/",
      expectedHttp: expectedNoRedirect("/admin/book-leads/", 200),
      coverageCategory: "dynamic-admin",
      template: "dynamic-admin-route",
      classification: "admin",
      locale: "en",
      expectedPolicy: "noindex",
      rationale: "Authenticated admin content and its login destination are intentionally non-indexable.",
    },
    {
      path: `/es${representativePost}`,
      expectedHttp: expectedNoRedirect(`/es${representativePost}`, 200),
      coverageCategory: "canonical-localized-article",
      template: "localized-mdx-post",
      classification: "public-page",
      locale: "es",
      expectedPolicy: "index",
      rationale: "Published Spanish article is canonical public content and must remain indexable.",
    },
    {
      path: `/es${representativePage}`,
      expectedHttp: expectedNoRedirect(`/es${representativePage}`, 200),
      coverageCategory: "canonical-localized-page",
      template: "localized-mdx-page",
      classification: "public-page",
      locale: "es",
      expectedPolicy: "index",
      rationale: "Published Spanish MDX page is canonical public content and must remain indexable.",
    },
    {
      path: representativePost,
      expectedHttp: expectedNoRedirect(representativePost, 200),
      coverageCategory: "canonical-english-post",
      template: "english-mdx-post",
      classification: "public-page",
      locale: "en",
      expectedPolicy: "index",
      rationale: "Canonical English post must retain public indexability.",
    },
    {
      path: representativePage,
      expectedHttp: expectedNoRedirect(representativePage, 200),
      coverageCategory: "canonical-english-page",
      template: "english-mdx-page",
      classification: "public-page",
      locale: "en",
      expectedPolicy: "index",
      rationale: "Canonical English MDX page must retain public indexability.",
    },
    {
      path: "/about/",
      expectedHttp: expectedNoRedirect("/about/", 200),
      coverageCategory: "about-page",
      template: "about-page",
      classification: "public-page",
      locale: "en",
      expectedPolicy: "index",
      rationale: "About retains its deliberate canonical relationship and existing indexability policy.",
    },
    {
      path: "/case-studies/",
      expectedHttp: expectedNoRedirect("/case-studies/", 200),
      coverageCategory: "case-studies-page",
      template: "case-studies-archive",
      classification: "public-page",
      locale: "en",
      expectedPolicy: "index",
      rationale: "Case studies retains its existing public indexability policy.",
    },
    {
      path: "/erp-implementation-cost-calculator/",
      expectedHttp: expectedNoRedirect("/erp-implementation-cost-calculator/", 200),
      coverageCategory: "public-tool",
      template: "interactive-tool",
      classification: "public-tool",
      locale: "en",
      expectedPolicy: "index",
      rationale: "Existing public tool retains its current indexability policy.",
    },
    {
      path: "/business-one/",
      expectedHttp: expectedNoRedirect("/business-one/", 200),
      coverageCategory: "real-alias",
      template: "flat-content-alias",
      classification: "public-page",
      locale: "en",
      expectedPolicy: "index",
      rationale: "Established flat alias remains a public 200 surface under its approved canonical policy.",
    },
    {
      path: `/content/posts${representativePost}es.raw.mdx`,
      expectedHttp: expectedNoRedirect(
        `/content/posts${representativePost}es.raw.mdx`,
        404,
      ),
      coverageCategory: "raw-mdx-negative",
      template: "raw-mdx-direct-request",
      classification: "negative-http-route",
      locale: "es",
      expectedPolicy: "noindex",
      rationale: "A direct URL derived from a verified real raw MDX file must remain 404 and non-indexable.",
    },
    ...[
      ["/definitely-missing-phase-4b/", "en", "missing-public-route", "missing-public-route"],
      [`/de/definitely-missing-phase-4b/`, "de", "missing-localized-route", "missing-localized-route"],
      [`/ar${representativePost}`, "ar", "held-arabic-route", "held-arabic-route"],
      [`/zh-CN${representativePost}`, "zh-CN", "held-chinese-route", "held-chinese-route"],
      [`/el${representativePost}`, "el", "unsupported-locale-route", "unsupported-locale-route"],
    ].map(([checkPath, locale, template, coverageCategory]) => ({
      path: checkPath,
      expectedHttp: expectedNoRedirect(checkPath, 404),
      coverageCategory,
      template,
      classification: ["held-arabic-route", "held-chinese-route", "unsupported-locale-route"].includes(
        coverageCategory,
      )
        ? undefined
        : "negative-http-route",
      locale,
      expectedPolicy: "noindex",
      rationale: "Missing, held, or unsupported public routes must remain 404 and non-indexable.",
    })),
];
for (const check of checks) httpChecks.push(await auditHttpCheck(baseUrl, check));
const httpCoverage = assertRequiredHttpCoverage(
  httpChecks,
  REQUIRED_HTTP_COVERAGE,
);

const countBy = (records, key) =>
  Object.fromEntries(
    [...new Set(records.map((record) => record[key]))]
      .sort((left, right) => String(left).localeCompare(String(right)))
      .map((value) => [value ?? "null", records.filter((record) => record[key] === value).length]),
  );
const defects = [...inventory, ...httpChecks].filter(
  (record) => record.policyResult === "defect",
);
const report = {
  schemaVersion: 1,
  generatedAt: auditNow.toISOString(),
  scope: "Phase 4B indexability policy audit and accidental-noindex detection only",
  evidenceLimits: [
    "Build artifacts and HTTP responses prove directive permission, not inclusion in or ranking by Google.",
    "Generated HTML has no response headers; X-Robots-Tag is therefore audited separately through HTTP checks.",
    "Missing explicit index or follow is treated as indexable-by-directives, not as a defect.",
    "The complete .html artifact inventory contains 1,460 files; the separate 1,468 Next.js build-output invariant also includes non-HTML/dynamic route outputs.",
  ],
  evidenceEnvironment: {
    buildRoot: path.relative(PROJECT_ROOT, buildRoot).replaceAll("\\", "/"),
    buildId,
    artifactFingerprint: `sha256:${artifactFingerprint}`,
    fingerprintInputs: [".next/BUILD_ID", ".next/prerender-manifest.json"],
    httpBaseUrl: baseUrl ?? null,
    node: process.version,
    platform: `${process.platform}-${process.arch}`,
    userAgent: baseUrl ? USER_AGENT : null,
    directiveEvaluationClock: auditNow.toISOString(),
  },
  invariants: {
    expectedTotalBuildOutputs: 1468,
    expectedLocalizedRoutes: 1199,
    expectedLocalizedArticles: 891,
    expectedLocalizedMdxPages: 308,
    expectedSeoGraphFamilies: 108,
    expectedSeoGraphMembers: 1296,
    note: "Phase 4B does not modify or recompute Phase 4A route and graph contracts.",
  },
  summary: {
    generatedHtmlFiles: inventory.length,
    generatedHtmlByClassification: countBy(inventory, "classification"),
    generatedHtmlByLocale: countBy(inventory, "locale"),
    generatedHtmlByEffectiveResult: countBy(inventory, "effectiveResult"),
    httpChecks: httpChecks.length,
    httpChecksByClassification: countBy(httpChecks, "classification"),
    defects: defects.length,
    inventoryCompleteness,
    explicitlyExcludedNonHtmlPrerenderRoutes: nonHtmlPrerenderRoutes,
    requiredHttpCoverage: httpCoverage,
  },
  defects,
  generatedHtmlInventory: inventory,
  httpChecks,
};

await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(
  `Indexability audit: ${inventory.length} HTML artifacts, ${httpChecks.length} HTTP checks, ${defects.length} defects.`,
);
console.log(`Wrote ${path.relative(PROJECT_ROOT, outputPath).replaceAll("\\", "/")}`);
if (defects.length > 0) process.exitCode = 1;
