import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import {
  auditProtectedFrontmatter,
  assertMetadataInventory,
  auditMetadataRecords,
  classifySocialMetadata,
  extractDocumentMetadata,
  metadataProvenance,
} from "../src/lib/metadata-quality-audit.mjs";

const PROJECT_ROOT = process.cwd();
const NEXT_ROOT = path.join(PROJECT_ROOT, ".next");
const SERVER_APP_ROOT = path.join(NEXT_ROOT, "server", "app");
const OUTPUT_PATH = path.join(
  PROJECT_ROOT,
  "docs",
  "codex",
  "audit",
  "phase-4c-metadata-quality-audit.json",
);
const EXPECTED_PUBLIC_HTML_COUNT = 1457;
const NON_HTML_ROUTES = new Set(["/favicon.ico", "/llms.txt", "/robots.txt", "/sitemap.xml"]);
const EXCLUDED_HTML_ROUTES = new Set(["/_global-error", "/_not-found", "/admin/login"]);
const PUBLISHED_LOCALES = ["en", "de", "es", "fr", "hi", "it", "ja", "ko", "nl", "pt", "ru", "tr"];
const LOCALE_PREFIXES = new Set(PUBLISHED_LOCALES.filter((locale) => locale !== "en"));
const TOOL_PATHS = new Set([
  "/erp-implementation-cost-calculator/",
  "/free-data-migration-estimator-sap-oracle-microsoft/",
  "/sap-implementation-cost-calculator/",
  "/sap-job-description-generator/",
  "/sap-s4hana-migration-strategy-greenfield-vs-brownfield/",
  "/sap-solution-builder/",
]);
const DEDICATED_STATIC_PATHS = new Set(["/books/", "/privacy/", "/terms/"]);
const INHERITED_DEFAULTS = {
  title: "Noel D'Costa | ERP, Data & AI",
  descriptions: [
    "ECC to S/4HANA migrations. AI on top of ERP. Real results.",
    "25+ years delivering SAP, Oracle, and AI programmes across aviation, government, finance, retail, and manufacturing.",
  ],
};
// Intentional route-level social variants must be named per field here. There
// are no approved variants in the current build inventory.
const SOCIAL_EXCEPTIONS_BY_URL = Object.freeze({});

function publicUrl(route) {
  return route === "/" ? "/" : `${route.replace(/\/$/, "")}/`;
}

function artifactPathForRoute(route) {
  return route === "/"
    ? path.join(SERVER_APP_ROOT, "index.html")
    : path.join(SERVER_APP_ROOT, `${route.slice(1)}.html`);
}

function localeFromRoute(route) {
  const first = route.split("/").filter(Boolean)[0];
  return LOCALE_PREFIXES.has(first) ? first : "en";
}

function normalizePathname(value, fallback) {
  try {
    const parsed = new URL(value, "https://noeldcosta.com");
    return publicUrl(parsed.pathname);
  } catch {
    return publicUrl(`/${fallback}/`);
  }
}

function localizedPath(locale, pathname) {
  if (locale === "en") return pathname;
  return publicUrl(`/${locale}${pathname}`);
}

function addCandidate(routeCandidates, route, source) {
  if (!routeCandidates.has(route)) routeCandidates.set(route, []);
  const candidates = routeCandidates.get(route);
  if (!candidates.some((candidate) => candidate.sourcePath === source.sourcePath)) {
    candidates.push(source);
  }
}

async function contentSourceInventory() {
  const routeCandidates = new Map();
  const sources = [];
  for (const kind of ["posts", "pages"]) {
    const root = path.join(PROJECT_ROOT, "content", kind);
    const slugs = (await readdir(root, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    for (const slug of slugs) {
      for (const locale of PUBLISHED_LOCALES) {
        const sourcePath = path.join(root, slug, `${locale}.mdx`);
        let raw;
        try {
          raw = await readFile(sourcePath, "utf8");
        } catch (error) {
          if (error?.code === "ENOENT") continue;
          throw error;
        }
        let data;
        let sourceFindings;
        try {
          ({ data } = matter(raw));
          sourceFindings = auditProtectedFrontmatter({
            raw,
            frontmatter: data,
            expectedLocale: locale,
            sourcePath: path.relative(PROJECT_ROOT, sourcePath).replaceAll("\\", "/"),
          });
        } catch (error) {
          data = { slug };
          sourceFindings = auditProtectedFrontmatter({
            raw,
            frontmatter: data,
            expectedLocale: locale,
            sourcePath: path.relative(PROJECT_ROOT, sourcePath).replaceAll("\\", "/"),
          });
          sourceFindings.push({
            severity: "editorial-defect",
            code: "protected-frontmatter-parse-error",
            sourcePath: path.relative(PROJECT_ROOT, sourcePath).replaceAll("\\", "/"),
            message: String(error?.message ?? error).split(/\r?\n/u)[0],
          });
        }
        const pathname = kind === "posts"
          ? publicUrl(`/${data.slug || slug}/`)
          : normalizePathname(data.originalUrl, data.slug || slug);
        const source = {
          kind: kind === "posts" ? "post" : "mdx-page",
          slug: data.slug || slug,
          locale,
          frontmatter: data,
          sourcePath: path.relative(PROJECT_ROOT, sourcePath).replaceAll("\\", "/"),
          frontmatterFindings: sourceFindings,
        };
        sources.push(source);
        addCandidate(routeCandidates, localizedPath(locale, pathname), source);
        if (kind === "pages" && locale === "en") {
          addCandidate(routeCandidates, publicUrl(`/${data.slug || slug}/`), source);
        }
      }
    }
  }
  for (const candidates of routeCandidates.values()) {
    candidates.sort((left, right) => left.sourcePath.localeCompare(right.sourcePath));
  }
  return { routeCandidates, sources };
}

function canonicalFamily(canonical, routeUrl) {
  if (!canonical) return routeUrl;
  try {
    return publicUrl(new URL(canonical, "https://noeldcosta.com").pathname);
  } catch {
    return routeUrl;
  }
}

function classifyTemplate(url, family) {
  if (url === "/") return "homepage";
  if (url === "/about/") return "dedicated-mdx-page";
  if (url === "/case-studies/") return "portfolio-archive";
  if (url.startsWith("/category/")) return "category-archive";
  if (url.startsWith("/tag/")) return "tag-archive";
  if (family.startsWith("/category/") || family.startsWith("/tag/")) return "archive-shortcut";
  if (TOOL_PATHS.has(url)) return "interactive-tool";
  if (DEDICATED_STATIC_PATHS.has(url)) return "static-page";
  return "content-route";
}

function first(values) {
  return values.length === 1 ? values[0] : null;
}

const [buildIdRaw, manifestRaw] = await Promise.all([
  readFile(path.join(NEXT_ROOT, "BUILD_ID"), "utf8"),
  readFile(path.join(NEXT_ROOT, "prerender-manifest.json"), "utf8"),
]);
const buildId = buildIdRaw.trim();
const artifactFingerprint = `sha256:${createHash("sha256")
  .update(buildIdRaw)
  .update("\0")
  .update(manifestRaw)
  .digest("hex")}`;
const manifest = JSON.parse(manifestRaw);
const manifestRoutes = Object.keys(manifest.routes).sort();
const observedNonHtml = manifestRoutes.filter((route) => NON_HTML_ROUTES.has(route));
if (observedNonHtml.length !== NON_HTML_ROUTES.size) {
  throw new Error(`Expected ${NON_HTML_ROUTES.size} non-HTML routes, received ${observedNonHtml.length}.`);
}
const publicRoutes = manifestRoutes.filter(
  (route) => !NON_HTML_ROUTES.has(route) && !EXCLUDED_HTML_ROUTES.has(route),
);
const contentAudit = await contentSourceInventory();
const records = [];
const usedSourcePaths = new Set();
const sourceCollisionDiagnostics = [];

for (const route of publicRoutes) {
  const url = publicUrl(route);
  const artifactPath = artifactPathForRoute(route);
  const html = await readFile(artifactPath, "utf8");
  const extracted = extractDocumentMetadata(html);
  const family = canonicalFamily(first(extracted.canonicals), url);
  const locale = localeFromRoute(route);
  const preliminaryTemplate = classifyTemplate(url, family);
  const candidates = contentAudit.routeCandidates.get(url) ?? [];
  if (candidates.length > 1) {
    sourceCollisionDiagnostics.push({
      severity: "diagnostic",
      code: "metadata-source-route-collision",
      url,
      candidates: candidates.map(({ kind, slug, sourcePath }) => ({ kind, slug, sourcePath })),
    });
  }
  const preselectedSource = preliminaryTemplate === "dedicated-mdx-page"
    ? candidates.find((candidate) => candidate.kind === "mdx-page" && candidate.slug === "about") ?? null
    : preliminaryTemplate === "content-route"
      ? candidates.find((candidate) => candidate.kind === "post") ?? candidates[0] ?? null
      : null;
  const template = preliminaryTemplate === "content-route"
    ? preselectedSource?.kind ?? "static-page"
    : preliminaryTemplate;
  const title = first(extracted.titles);
  const description = first(extracted.descriptions);
  const exception = url === "/about/"
    ? "about-canonical"
    : url !== family && (family.startsWith("/category/") || family.startsWith("/tag/"))
      ? "archive-shortcut"
      : url !== family
        ? "approved-canonical-alias"
        : null;
  const socialExceptions = SOCIAL_EXCEPTIONS_BY_URL[url] ?? {};
  const socialFindings = classifySocialMetadata({
    documentTitle: title,
    documentDescription: description,
    ogTitle: first(extracted.ogTitles),
    ogDescription: first(extracted.ogDescriptions),
    twitterTitle: first(extracted.twitterTitles),
    twitterDescription: first(extracted.twitterDescriptions),
    inheritedDefaults: INHERITED_DEFAULTS,
    socialExceptions,
  });
  const provenance = metadataProvenance({
    url,
    template,
    candidates,
    values: {
      title,
      description,
      ogTitle: first(extracted.ogTitles),
      ogDescription: first(extracted.ogDescriptions),
      twitterTitle: first(extracted.twitterTitles),
      twitterDescription: first(extracted.twitterDescriptions),
    },
  });
  const source = provenance.protectedSourcePath
    ? candidates.find((candidate) => candidate.sourcePath === provenance.protectedSourcePath) ?? null
    : null;
  if (source) usedSourcePaths.add(source.sourcePath);
  if (!source && candidates.length > 0) {
    sourceCollisionDiagnostics.push({
      severity: "diagnostic",
      code: "metadata-source-shadowed-by-route-precedence",
      url,
      template,
      candidates: candidates.map(({ kind, slug, sourcePath }) => ({ kind, slug, sourcePath })),
    });
  }
  for (const finding of socialFindings) {
    if (finding.code === "inherited-default-og-title") provenance.ogTitle = "inherited default";
    if (finding.code === "inherited-default-og-description") provenance.ogDescription = "inherited default";
    if (finding.code === "inherited-default-twitter-title") provenance.twitterTitle = "inherited default";
    if (finding.code === "inherited-default-twitter-description") provenance.twitterDescription = "inherited default";
  }
  const localFindings = [
    ...socialFindings,
    ...(source?.frontmatterFindings ?? []),
  ];

  records.push({
    url,
    canonicalFamily: family,
    locale,
    template,
    artifactPath: path.relative(PROJECT_ROOT, artifactPath).replaceAll("\\", "/"),
    titleCount: extracted.titles.length,
    title,
    descriptionCount: extracted.descriptions.length,
    description,
    social: {
      ogTitleCount: extracted.ogTitles.length,
      ogTitle: first(extracted.ogTitles),
      ogDescriptionCount: extracted.ogDescriptions.length,
      ogDescription: first(extracted.ogDescriptions),
      ogUrlCount: extracted.ogUrls.length,
      ogUrl: first(extracted.ogUrls),
      twitterTitleCount: extracted.twitterTitles.length,
      twitterTitle: first(extracted.twitterTitles),
      twitterDescriptionCount: extracted.twitterDescriptions.length,
      twitterDescription: first(extracted.twitterDescriptions),
    },
    sourceAttribution: provenance,
    exception,
    socialExceptions,
    ...(url === "/" ? { documentDefaultException: "homepage-explicit-metadata" } : {}),
    findings: localFindings,
  });
}

records.sort((left, right) => left.url.localeCompare(right.url));
const inventory = assertMetadataInventory(records, {
  expectedCount: EXPECTED_PUBLIC_HTML_COUNT,
  buildId,
  artifactFingerprint,
});
const aggregate = auditMetadataRecords(records);
const localFindings = records.flatMap((record) =>
  record.findings.map((finding) => ({ ...finding, url: record.url })),
);
const implementationDefects = [
  ...aggregate.implementationDefects,
  ...localFindings.filter((finding) => finding.severity === "implementation-defect"),
];
const editorialDefects = [
  ...aggregate.editorialDefects,
  ...contentAudit.sources
    .filter((source) => usedSourcePaths.has(source.sourcePath))
    .flatMap((source) => source.frontmatterFindings),
];
const diagnostics = [
  ...aggregate.diagnostics,
  ...localFindings.filter((finding) => finding.severity === "diagnostic"),
  ...sourceCollisionDiagnostics,
];
const protectedFrontmatterSummary = {
  missingTitle: editorialDefects.filter((finding) => finding.code === "protected-frontmatter-missing-title").length,
  missingDescription: editorialDefects.filter((finding) => finding.code === "protected-frontmatter-missing-description").length,
  duplicateKey: editorialDefects.filter((finding) => finding.code === "protected-frontmatter-duplicate-key").length,
  explicitLocaleMismatch: editorialDefects.filter((finding) => finding.code === "protected-frontmatter-explicit-locale-mismatch").length,
  parseError: editorialDefects.filter((finding) => finding.code === "protected-frontmatter-parse-error").length,
};
const socialExceptionCount = records.reduce(
  (count, record) => count + Object.keys(record.socialExceptions).length,
  0,
);

for (const finding of [
  ...aggregate.implementationDefects,
  ...aggregate.editorialDefects,
  ...aggregate.diagnostics,
]) {
  for (const url of finding.urls ?? (finding.url ? [finding.url] : [])) {
    const record = records.find((candidate) => candidate.url === url);
    if (record) record.findings.push({ ...finding, urls: undefined });
  }
}

const report = {
  schemaVersion: 1,
  evidence: {
    buildId,
    artifactFingerprint,
    fingerprintInputs: [".next/BUILD_ID", ".next/prerender-manifest.json"],
    generatedHtmlInventory: {
      manifestRouteCount: manifestRoutes.length,
      nonHtmlRoutes: observedNonHtml,
      excludedHtmlRoutes: [...EXCLUDED_HTML_ROUTES].sort(),
      intendedPublicHtmlCount: records.length,
      expectedIntendedPublicHtmlCount: EXPECTED_PUBLIC_HTML_COUNT,
      exact: records.length === EXPECTED_PUBLIC_HTML_COUNT,
    },
  },
  policy: {
    requiredDocumentTitleCount: 1,
    requiredMetaDescriptionCount: 1,
    titleDiagnosticCodePointRange: [15, 70],
    descriptionDiagnosticCodePointRange: [50, 180],
    duplicateScope: "exact normalized value across distinct canonical families within each locale",
    aliasPolicy: "aliases remain in completeness and share their canonical family for uniqueness",
    socialPolicy: "titles must match after normalization or differ only by one approved trailing brand suffix; descriptions must match after normalization; unrelated populated values are diagnostics unless they are proven inherited defaults (implementation defects) or have an explicit named route/field exception",
    protectedContentPolicy: "editorial defects are recorded; content is never rewritten by this audit",
    manualOnlyDiagnostics: ["language/script", "near-duplicate", "semantic-intent"],
  },
  status: {
    auditExecution: "pass",
    implementationDefectCount: implementationDefects.length,
    editorialDefectCount: editorialDefects.length,
    diagnosticCount: diagnostics.length,
    socialExceptionCount,
    protectedFrontmatter: protectedFrontmatterSummary,
    overallMetadataQualityVerdict: implementationDefects.length > 0
      ? "fail-implementation-defects"
      : editorialDefects.length > 0
        ? "editorial-review-required"
        : diagnostics.length > 0
          ? "pass-with-diagnostics"
          : "pass",
  },
  inventory,
  exceptions: aggregate.exceptions,
  implementationDefects,
  editorialDefects,
  diagnostics,
  records,
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output: path.relative(PROJECT_ROOT, OUTPUT_PATH), ...report.status }, null, 2));
if (implementationDefects.length > 0) process.exitCode = 1;
