import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import {
  assertHeadingInventory,
  assertHeadingShardManifest,
  auditHeadingStructure,
  classifyHeadingFindingOrigins,
  combineEvidenceFingerprints,
  createOccurrenceAwareSourceMatcher,
  frontmatterHeadingCandidates,
  normalizeHeadingText,
  normalizeMdxHeadingText,
  mdxBodyLineOffset,
  protectedSourceFingerprint as fingerprintProtectedSources,
} from "../src/lib/heading-structure-audit.mjs";

const PROJECT_ROOT = process.cwd();
const NEXT_ROOT = path.join(PROJECT_ROOT, ".next");
const SERVER_APP_ROOT = path.join(NEXT_ROOT, "server", "app");
const OUTPUT_PATH = path.join(PROJECT_ROOT, "docs", "codex", "audit", "phase-4d-heading-structure-audit.json");
const SHARD_ROOT = path.join(PROJECT_ROOT, "docs", "codex", "audit", "phase-4d-heading-inventory");
const EXPECTED_PUBLIC_HTML_COUNT = 1457;
const EXPECTED_AUDITED_PROTECTED_SOURCE_COUNT = 1393;
const EXPECTED_PUBLISHABLE_PROTECTED_SOURCE_COUNT = 1625;
const NON_HTML_ROUTES = new Set(["/favicon.ico", "/llms.txt", "/robots.txt", "/sitemap.xml"]);
const EXCLUDED_HTML_ROUTES = new Set(["/_global-error", "/_not-found", "/admin/login"]);
const PUBLISHED_LOCALES = ["en", "de", "es", "fr", "hi", "it", "ja", "ko", "nl", "pt", "ru", "tr"];
const REPOSITORY_LOCALES = ["en", "ar", "de", "es", "fr", "hi", "it", "ja", "ko", "nl", "pt", "ru", "tr", "zh"];
const PUBLISHED_LOCALE_SET = new Set(PUBLISHED_LOCALES);
const LOCALE_PREFIXES = new Set(PUBLISHED_LOCALES.filter((locale) => locale !== "en"));
const HEADING_EXCEPTIONS_BY_URL = Object.freeze({});

function publicUrl(route) {
  return route === "/" ? "/" : `${route.replace(/\/$/u, "")}/`;
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
    return publicUrl(new URL(value, "https://noeldcosta.com").pathname);
  } catch {
    return publicUrl(`/${fallback}/`);
  }
}

function localizedPath(locale, pathname) {
  return locale === "en" ? pathname : publicUrl(`/${locale}${pathname}`);
}

function addCandidate(routeCandidates, route, source) {
  if (!routeCandidates.has(route)) routeCandidates.set(route, []);
  const candidates = routeCandidates.get(route);
  if (!candidates.some((candidate) => candidate.sourcePath === source.sourcePath)) candidates.push(source);
}

function sourceHeadingInventory(body, sourcePath, lineOffset = 0) {
  const headings = [];
  const lines = String(body ?? "").split(/\r?\n/u);
  for (const [index, line] of lines.entries()) {
    const markdown = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/u);
    if (markdown) {
      headings.push({
        rank: markdown[1].length,
        text: normalizeMdxHeadingText(markdown[2]),
        evidence: `${sourcePath}:${lineOffset + index + 1}`,
      });
    }
    for (const html of line.matchAll(/<h([1-6])(?:\s[^>]*)?>(.*?)<\/h\1>/giu)) {
      headings.push({
        rank: Number(html[1]),
        text: normalizeHeadingText(html[2].replace(/<[^>]+>/gu, " ")),
        evidence: `${sourcePath}:${lineOffset + index + 1}`,
      });
    }
  }
  return headings;
}

async function contentSourceInventory() {
  const routeCandidates = new Map();
  const protectedSources = [];
  const protectedPublishableSources = [];
  for (const kind of ["posts", "pages"]) {
    const root = path.join(PROJECT_ROOT, "content", kind);
    const slugs = (await readdir(root, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    for (const slug of slugs) {
      for (const locale of REPOSITORY_LOCALES) {
        const absolutePath = path.join(root, slug, `${locale}.mdx`);
        let rawBytes;
        try {
          rawBytes = await readFile(absolutePath);
        } catch (error) {
          if (error?.code === "ENOENT") continue;
          throw error;
        }
        const sourcePath = path.relative(PROJECT_ROOT, absolutePath).replaceAll("\\", "/");
        protectedPublishableSources.push({ path: sourcePath, bytes: rawBytes });
        if (!PUBLISHED_LOCALE_SET.has(locale)) continue;
        protectedSources.push({ path: sourcePath, bytes: rawBytes });
        const raw = rawBytes.toString("utf8");
        let parsed;
        try {
          parsed = matter(raw);
        } catch {
          parsed = { data: { slug }, content: "" };
        }
        const pathname = kind === "posts"
          ? publicUrl(`/${parsed.data.slug || slug}/`)
          : normalizePathname(parsed.data.originalUrl, parsed.data.slug || slug);
        const source = {
          kind: kind === "posts" ? "post" : "mdx-page",
          slug: parsed.data.slug || slug,
          locale,
          sourcePath,
          frontmatterHeadings: frontmatterHeadingCandidates(raw, parsed.data, sourcePath),
          headings: sourceHeadingInventory(parsed.content, sourcePath, mdxBodyLineOffset(raw)),
        };
        addCandidate(routeCandidates, localizedPath(locale, pathname), source);
        if (kind === "pages" && locale === "en") addCandidate(routeCandidates, publicUrl(`/${source.slug}/`), source);
      }
    }
  }
  for (const candidates of routeCandidates.values()) candidates.sort((a, b) => a.sourcePath.localeCompare(b.sourcePath));
  return { routeCandidates, protectedSources, protectedPublishableSources };
}

function routeSource(url, candidates) {
  if (url === "/about/") return candidates.find((candidate) => candidate.kind === "mdx-page" && candidate.slug === "about") ?? null;
  return candidates.find((candidate) => candidate.kind === "post") ?? candidates[0] ?? null;
}

function attributionResolver(source) {
  const sourceMatcher = createOccurrenceAwareSourceMatcher(source?.headings ?? []);
  return ({ $, element, selector }) => {
    const regionElement = $(element);
    const headingSource = regionElement.closest("[data-heading-source]").attr("data-heading-source");
    const sharedHeadingSources = {
      CompareSplit: "src/components/article/diagrams/CompareSplit.tsx",
      DecisionTree: "src/components/article/diagrams/DecisionTree.tsx",
      Stepper: "src/components/article/diagrams/Stepper.tsx",
    };
    if (headingSource && sharedHeadingSources[headingSource]) {
      return { origin: "shared-component", evidence: sharedHeadingSources[headingSource] };
    }
    const namedRegion = regionElement.closest("[data-heading-region]").attr("data-heading-region");
    if (namedRegion === "product-promo") {
      return { origin: "shared-component", evidence: "src/components/article/ProductPromoCard.tsx" };
    }
    if (regionElement.closest("footer").length) {
      return { origin: "shared-component", evidence: "src/components/Footer.tsx" };
    }
    if (regionElement.closest("nav").length) {
      return { origin: "shared-component", evidence: "src/components/Nav.tsx" };
    }
    const rank = /^h[1-6]$/u.test(element.name) ? Number(element.name.slice(1)) : Number.parseInt($(element).attr("aria-level"), 10);
    const text = normalizeHeadingText($(element).text());
    const frontmatterHeading = source?.frontmatterHeadings.find((candidate) => candidate.text === text);
    if (source && rank === 1 && frontmatterHeading) {
      return {
        origin: "protected-frontmatter",
        evidence: frontmatterHeading.evidence,
        field: frontmatterHeading.field,
      };
    }
    if (source && regionElement.closest(".prose-noel").length) {
      const sourceHeading = sourceMatcher.match({ rank, text });
      if (sourceHeading) return sourceHeading;
      return { origin: "unresolved", evidence: `${source.sourcePath}; rendered inside .prose-noel but no exact source-heading match` };
    }
    if (regionElement.closest("dialog,[role='dialog'],details,template").length) {
      return { origin: "unresolved", evidence: "conditional renderer without exact protected-source match" };
    }
    return { origin: "shared-template", evidence: selector };
  };
}

function findingAttribution(finding, headings, routeSourcePath) {
  if (finding.selector) return headings.find((heading) => heading.selector === finding.selector)?.sourceAttribution;
  if (finding.selectors?.length) {
    const origins = finding.selectors
      .map((selector) => headings.find((heading) => heading.selector === selector)?.sourceAttribution)
      .filter(Boolean);
    if (origins.length > 0 && origins.every((entry) => entry.origin.startsWith("protected-"))) return origins[0];
    if (origins.some((entry) => entry.origin.startsWith("shared-"))) return origins.find((entry) => entry.origin.startsWith("shared-"));
  }
  return {
    origin: "shared-template",
    evidence: routeSourcePath ? `route renderer for ${routeSourcePath}` : "route renderer",
  };
}

const [buildIdRaw, manifestRaw] = await Promise.all([
  readFile(path.join(NEXT_ROOT, "BUILD_ID"), "utf8"),
  readFile(path.join(NEXT_ROOT, "prerender-manifest.json"), "utf8"),
]);
const buildId = buildIdRaw.trim();
const manifest = JSON.parse(manifestRaw);
const manifestRoutes = Object.keys(manifest.routes).sort();
const observedNonHtml = manifestRoutes.filter((route) => NON_HTML_ROUTES.has(route));
if (observedNonHtml.length !== NON_HTML_ROUTES.size) {
  throw new Error(`Expected ${NON_HTML_ROUTES.size} non-HTML routes, received ${observedNonHtml.length}.`);
}
const publicRoutes = manifestRoutes.filter((route) => !NON_HTML_ROUTES.has(route) && !EXCLUDED_HTML_ROUTES.has(route));
if (publicRoutes.length !== EXPECTED_PUBLIC_HTML_COUNT) {
  throw new Error(`Expected ${EXPECTED_PUBLIC_HTML_COUNT} intended-public HTML routes, received ${publicRoutes.length}.`);
}

const { routeCandidates, protectedSources, protectedPublishableSources } = await contentSourceInventory();
if (protectedSources.length !== EXPECTED_AUDITED_PROTECTED_SOURCE_COUNT) {
  throw new Error(`Expected ${EXPECTED_AUDITED_PROTECTED_SOURCE_COUNT} audited protected sources, received ${protectedSources.length}.`);
}
if (protectedPublishableSources.length !== EXPECTED_PUBLISHABLE_PROTECTED_SOURCE_COUNT) {
  throw new Error(`Expected ${EXPECTED_PUBLISHABLE_PROTECTED_SOURCE_COUNT} publishable protected sources, received ${protectedPublishableSources.length}.`);
}
const protectedSourceFingerprint = fingerprintProtectedSources(protectedSources);
const protectedPublishableContentFingerprint = fingerprintProtectedSources(protectedPublishableSources);
const artifactHash = createHash("sha256").update(buildIdRaw).update("\0").update(manifestRaw);
const records = [];
const routeCollisionDiagnostics = [];

for (const route of publicRoutes) {
  const url = publicUrl(route);
  const artifactPath = artifactPathForRoute(route);
  const html = await readFile(artifactPath, "utf8");
  artifactHash.update("\0").update(url).update("\0").update(html);
  const candidates = routeCandidates.get(url) ?? [];
  if (candidates.length > 1) {
    routeCollisionDiagnostics.push({
      severity: "diagnostic",
      code: "heading-source-route-collision",
      url,
      candidates: candidates.map(({ kind, slug, sourcePath }) => ({ kind, slug, sourcePath })),
    });
  }
  const source = routeSource(url, candidates);
  const audit = auditHeadingStructure({
    html,
    exceptions: HEADING_EXCEPTIONS_BY_URL[url] ?? [],
    sourceAttribution: attributionResolver(source),
  });
  const attributedFindings = audit.implementationDefects.map((finding) => ({
    ...finding,
    sourceAttribution: findingAttribution(finding, audit.headings, source?.sourcePath),
  }));
  const origins = classifyHeadingFindingOrigins(attributedFindings, audit.headings);
  records.push({
    url,
    locale: localeFromRoute(route),
    artifactPath: path.relative(PROJECT_ROOT, artifactPath).replaceAll("\\", "/"),
    sourceCandidates: candidates.map(({ kind, slug, sourcePath }) => ({ kind, slug, sourcePath })),
    resolvedProtectedSource: source?.sourcePath ?? null,
    headings: audit.headings,
    conditionalInventory: audit.conditionalInventory,
    findings: {
      implementationDefects: origins.implementationDefects,
      editorialDefects: origins.editorialDefects,
      unresolvedFindings: [...origins.unresolvedFindings, ...audit.unresolvedFindings],
      diagnostics: audit.diagnostics,
    },
    exceptions: audit.exceptions,
    browserProofLimits: audit.browserProofLimits,
  });
}

records.sort((left, right) => left.url.localeCompare(right.url));
const artifactFingerprint = `sha256:${artifactHash.digest("hex")}`;
const evidenceFingerprint = combineEvidenceFingerprints([
  { name: "artifact", fingerprint: artifactFingerprint },
  { name: "auditedAttributionSources", fingerprint: protectedSourceFingerprint },
  { name: "protectedPublishableCorpus", fingerprint: protectedPublishableContentFingerprint },
]);
const inventory = assertHeadingInventory(records, {
  expectedCount: EXPECTED_PUBLIC_HTML_COUNT,
  buildId,
  artifactFingerprint,
});
const implementationDefects = records.flatMap((record) =>
  record.findings.implementationDefects.map((finding) => ({ ...finding, url: record.url })));
const editorialDefects = records.flatMap((record) =>
  record.findings.editorialDefects.map((finding) => ({ ...finding, url: record.url })));
const unresolvedFindings = records.flatMap((record) =>
  record.findings.unresolvedFindings.map((finding) => ({ ...finding, url: record.url })));
const diagnostics = [
  ...records.flatMap((record) => record.findings.diagnostics.map((finding) => ({ ...finding, url: record.url }))),
  ...routeCollisionDiagnostics,
];
const exceptions = records.flatMap((record) => record.exceptions.map((exception) => ({ ...exception, url: record.url })));
const totalHeadings = records.reduce((count, record) => count + record.headings.length, 0);
const visibilityCounts = records.flatMap((record) => record.headings).reduce((counts, heading) => {
  counts[heading.visibility] += 1;
  return counts;
}, { visible: 0, hidden: 0, indeterminate: 0 });

function aggregateFindings(findings) {
  const groups = new Map();
  for (const finding of findings) {
    const key = JSON.stringify({
      severity: finding.severity,
      code: finding.code,
      fromRank: finding.fromRank ?? null,
      toRank: finding.toRank ?? null,
      region: finding.region ?? null,
      sourceOrigin: finding.sourceAttribution?.origin ?? null,
    });
    if (!groups.has(key)) groups.set(key, { ...JSON.parse(key), count: 0, exampleUrls: [] });
    const group = groups.get(key);
    group.count += 1;
    if (group.exampleUrls.length < 5 && finding.url && !group.exampleUrls.includes(finding.url)) {
      group.exampleUrls.push(finding.url);
    }
  }
  return [...groups.values()].sort((left, right) =>
    left.code.localeCompare(right.code) ||
    String(left.region).localeCompare(String(right.region)) ||
    String(left.sourceOrigin).localeCompare(String(right.sourceOrigin)) ||
    (left.fromRank ?? 0) - (right.fromRank ?? 0) ||
    (left.toRank ?? 0) - (right.toRank ?? 0));
}

await mkdir(SHARD_ROOT, { recursive: true });
const expectedShardFiles = new Set(PUBLISHED_LOCALES.map((locale) => `${locale}.ndjson`));
const existingShardFiles = (await readdir(SHARD_ROOT)).filter((file) => file.endsWith(".ndjson"));
const unexpectedShardFiles = existingShardFiles.filter((file) => !expectedShardFiles.has(file));
if (unexpectedShardFiles.length > 0) {
  throw new Error(`Unexpected Phase 4D heading shard file(s): ${unexpectedShardFiles.join(", ")}`);
}

const shardValidationInputs = [];
const shardManifest = [];
for (const locale of PUBLISHED_LOCALES) {
  const shardRecords = records.filter((record) => record.locale === locale);
  const shardFile = `${locale}.ndjson`;
  const shardPath = path.join(SHARD_ROOT, shardFile);
  const body = `${shardRecords.map((record) => JSON.stringify(record)).join("\n")}\n`;
  const byteLength = Buffer.byteLength(body, "utf8");
  const sha256 = createHash("sha256").update(body).digest("hex");
  await writeFile(shardPath, body, "utf8");
  const entry = {
    locale,
    path: path.relative(PROJECT_ROOT, shardPath).replaceAll("\\", "/"),
    format: "ndjson-one-route-record-per-line",
    routeCount: shardRecords.length,
    headingCount: shardRecords.reduce((count, record) => count + record.headings.length, 0),
    conditionalHeadingCount: shardRecords.reduce((count, record) => count + record.conditionalInventory.length, 0),
    byteLength,
    sha256,
  };
  shardManifest.push(entry);
  shardValidationInputs.push({ ...entry, urls: shardRecords.map((record) => record.url) });
}
const shardInventory = assertHeadingShardManifest({
  expectedRouteCount: records.length,
  expectedHeadingCount: totalHeadings,
  shards: shardValidationInputs,
});

const routeSummaries = records.map((record) => ({
  url: record.url,
  locale: record.locale,
  shard: `${record.locale}.ndjson`,
  resolvedProtectedSource: record.resolvedProtectedSource,
  headingCount: record.headings.length,
  conditionalHeadingCount: record.conditionalInventory.length,
  visibilityCounts: record.headings.reduce((counts, heading) => {
    counts[heading.visibility] += 1;
    return counts;
  }, { visible: 0, hidden: 0, indeterminate: 0 }),
  findings: {
    implementationDefects: record.findings.implementationDefects.length,
    editorialDefects: record.findings.editorialDefects.length,
    unresolvedFindings: record.findings.unresolvedFindings.length,
    diagnostics: record.findings.diagnostics.length,
    exceptions: record.exceptions.length,
  },
}));

const report = {
  schemaVersion: 2,
  evidence: {
    buildId,
    artifactFingerprint,
    artifactFingerprintInputs: [".next/BUILD_ID exact bytes", ".next/prerender-manifest.json exact bytes", "all intended-public generated HTML URL plus exact bytes in URL order"],
    protectedSourceFingerprint,
    protectedSourceFileCount: protectedSources.length,
    protectedSourceFingerprintInputs: ["exactly 1,393 audited attribution-source MDX files across the 12 routed locales (en, de, es, fr, hi, it, ja, ko, nl, pt, ru, tr), hashed as normalized relative path plus exact bytes in path order; held ar/zh locales and *.raw.mdx files are excluded"],
    protectedPublishableContentFingerprint,
    protectedPublishableContentFileCount: protectedPublishableSources.length,
    protectedPublishableContentFingerprintInputs: ["all 1,625 publishable content/posts and content/pages locale MDX files across all 14 repository locales, hashed as normalized relative path plus exact bytes in path order; *.raw.mdx files are excluded and never read"],
    evidenceFingerprint,
    evidenceFingerprintInputs: ["length-framed artifactFingerprint", "length-framed protectedSourceFingerprint", "length-framed protectedPublishableContentFingerprint"],
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
    pageH1: "exactly one nonempty visually exposed native H1 per tested viewport; static indeterminate reveal/responsive visibility and candidate counts require browser proof",
    accessibleOutline: "sr-only headings remain in the accessible outline but do not satisfy visible H1; aria-hidden/inert headings remain visually counted and raise accessibility findings",
    visualEmptiness: "every non-hidden heading requires nonempty visual text independently of its accessible name; indeterminate responsive/reveal candidates fail because exposure cannot make empty visual content nonempty",
    sequence: "the primary document outline preserves document order across other, main, editorial, header, article, section, and component boundaries; approved named fixed regions remain separate; downward skips greater than one fail; upward jumps and same-rank siblings pass",
    conditionalContent: "closed dialogs, templates, and closed details bodies remain in conditional inventory; closed details summary subtrees stay exposed and participate in their containing default outline; native open dialogs, visible role=dialog regions, and expanded details are audited separately from a rank-one baseline",
    outlinePolicy: "native visual and accessible native-plus-ARIA outlines are evaluated independently; ARIA-only headings never bridge native rank skips; sr-only headings participate only in the accessible outline",
    regionPolicy: "footer, nav, and explicit data-heading-region contracts have independent sequences; generic editorial asides remain in their containing main/editorial outline",
    staticLimit: "generated HTML establishes candidates and explicit inline evidence, not universal computed visibility",
    exceptionPolicy: "only named route/code/selector exceptions with rationale and evidence may suppress a finding",
    protectedContentPolicy: "exact protected-source findings are editorial; content is never rewritten by this audit",
    sourceAttributionPolicy: "protected MDX occurrence matches require exact normalized text and exact rank; explicit data-heading-source markers identify shared generated component headings before protected-source matching",
  },
  status: {
    auditExecution: "pass",
    intendedPublicHtmlCount: records.length,
    totalHeadingCount: totalHeadings,
    visibilityCounts,
    implementationDefectCount: implementationDefects.length,
    editorialDefectCount: editorialDefects.length,
    unresolvedFindingCount: unresolvedFindings.length,
    diagnosticCount: diagnostics.length,
    exceptionCount: exceptions.length,
    overallHeadingStructureVerdict: implementationDefects.length > 0
      ? "fail-implementation-defects"
      : editorialDefects.length > 0 || unresolvedFindings.length > 0
        ? "editorial-or-manual-review-required"
        : diagnostics.length > 0
          ? "pass-with-diagnostics"
          : "pass",
  },
  inventory,
  shardInventory,
  shards: shardManifest,
  browserProofLimits: [
    "computed-visibility-and-settled-animation-state",
    "responsive-breakpoint-visibility",
    "no-javascript-reveal-behavior",
    "opened-dialog-and-expanded-details-interaction",
  ],
  findingAggregates: {
    implementationDefects: aggregateFindings(implementationDefects),
    editorialDefects: aggregateFindings(editorialDefects),
    unresolvedFindings: aggregateFindings(unresolvedFindings),
    diagnostics: aggregateFindings(diagnostics),
    exceptions: aggregateFindings(exceptions),
  },
  routeSummaries,
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output: path.relative(PROJECT_ROOT, OUTPUT_PATH), ...report.status }, null, 2));
if (implementationDefects.length > 0) process.exitCode = 1;
