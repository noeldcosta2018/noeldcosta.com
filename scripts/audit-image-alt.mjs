import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import {
  IMAGE_ALT_POLICY, IMAGE_PUBLISHED_LOCALES, assertImageInventory, assertImageShardManifest,
  assignEquivalentImageContexts, attachEquivalentImageReviews, auditImageAlternatives, combineEvidenceFingerprints,
  createImageAttributionResolver, imageCanonicalFamily,
  imagePublicUrl, parseImageSource, protectedSourceFingerprint, reconcileImageRoutes, representativeImageRecords,
} from "../src/lib/image-alt-audit.mjs";

const REPOSITORY_LOCALES = ["en", "ar", "de", "es", "fr", "hi", "it", "ja", "ko", "nl", "pt", "ru", "tr", "zh"];
const DEFAULT_CONTRACT = Object.freeze({
  routeCount: 1457, routedSourceCount: 1393, allSourceCount: 1625, locales: IMAGE_PUBLISHED_LOCALES,
  routedSourceFingerprint: "sha256:86b26eb1d49ddabdd4fdd4a0924eb21631478dd4948a197be710942479ee817b",
  allSourceFingerprint: "sha256:c1b0162d14cace592fd3057eb469e7baee61513b91b611534dcb2aa0eb5dbeac",
});
const relative = (root, file) => path.relative(root, file).replaceAll("\\", "/");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const countBy = (values) => Object.fromEntries([...values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map()).entries()].sort(([a], [b]) => a.localeCompare(b)));

async function routeTemplates(root) {
  const result = new Map();
  async function walk(directory, segments = []) {
    for (const item of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, item.name);
      if (item.isDirectory()) await walk(file, item.name.startsWith("(") ? segments : [...segments, item.name]);
      else if (item.name === "page.tsx") {
        const route = `/${segments.join("/")}`;
        if (result.has(route)) throw new Error(`Duplicate route template evidence: ${route}`);
        result.set(route, relative(root, file));
      }
    }
  }
  await walk(path.join(root, "src/app"));
  return result;
}

async function sourcesForAudit(root, contract) {
  const sources = [], routedBytes = [], allBytes = [];
  for (const kind of ["posts", "pages"]) {
    const contentRoot = path.join(root, "content", kind);
    const slugs = (await readdir(contentRoot, { withFileTypes: true })).filter((item) => item.isDirectory()).map((item) => item.name).sort();
    for (const slug of slugs) for (const locale of REPOSITORY_LOCALES) {
      // Explicit publishable filenames only: .raw.mdx is never opened.
      const file = path.join(contentRoot, slug, `${locale}.mdx`);
      let bytes;
      try { bytes = await readFile(file); } catch (error) { if (error.code === "ENOENT") continue; throw error; }
      const sourcePath = relative(root, file);
      allBytes.push({ path: sourcePath, bytes });
      if (!contract.locales.includes(locale)) continue;
      routedBytes.push({ path: sourcePath, bytes });
      sources.push({ ...parseImageSource({ raw: bytes.toString("utf8"), sourcePath }), kind: kind === "posts" ? "post" : "mdx-page", slug, locale });
    }
  }
  const routedFingerprint = protectedSourceFingerprint(routedBytes), allFingerprint = protectedSourceFingerprint(allBytes);
  if (routedBytes.length !== contract.routedSourceCount || allBytes.length !== contract.allSourceCount || routedFingerprint !== contract.routedSourceFingerprint || allFingerprint !== contract.allSourceFingerprint) throw new Error("Protected source corpus count/fingerprint differs from approved evidence.");
  return { sources, routedFingerprint, allFingerprint, routedSourceCount: routedBytes.length, allSourceCount: allBytes.length };
}

function resolveRoute({ url, locale, srcRoute, $, sources, localizedPages }) {
  if (srcRoute === "/") return { template: "homepage", source: null };
  if (srcRoute === "/category/[category]" || srcRoute === "/tag/[tag]") return { template: srcRoute.includes("category") ? "category-archive" : "tag-archive", source: null };
  const candidates = sources.filter((source) => source.locale === locale);
  if (srcRoute === "/about") {
    const source = candidates.find((item) => item.kind === "mdx-page" && item.slug === "about");
    if (!source) throw new Error("Missing protected /about/ source.");
    return { template: "dedicated-mdx-page", source };
  }
  if (!["/[...slug]", "/[locale]/[...slug]"].includes(srcRoute)) return { template: "dedicated-static-or-tool", source: null };
  const segments = url.split("/").filter(Boolean);
  if (locale !== "en") segments.shift();
  const requested = `/${segments.join("/")}/`, slug = segments.at(-1);
  const categories = ["agentic-ai", "ai-governance", "erp-consulting-guide", "erp-strategy", "sap-case-studies", "sap-modules"];
  if (locale === "en" && segments.length === 1 && (categories.includes(slug) || slug === "case-studies")) return { template: ["case-studies", "sap-case-studies"].includes(slug) ? "case-study-portfolio" : "category-archive", source: null };
  const post = (locale === "en" || segments.length === 1) ? candidates.find((item) => item.kind === "post" && item.slug === slug) : null;
  if (post) return { template: $("article header.mb-12 h1").length === 1 ? "post" : "case-study-post", source: post };
  let pageSlug = slug;
  if (locale !== "en") {
    const matches = localizedPages.filter((item) => item.kind === "page" && imagePublicUrl(item.public_path) === requested);
    if (matches.length !== 1) throw new Error(`Missing/duplicate localized page route evidence: ${url}`);
    pageSlug = matches[0].slug;
  }
  const page = candidates.find((item) => item.kind === "mdx-page" && item.slug === pageSlug);
  if (!page) throw new Error(`Unmapped protected route evidence: ${url}`);
  return { template: "mdx-page", source: page };
}

function aggregateFindings(records, field) {
  const groups = new Map();
  for (const record of records) for (const finding of record.findings[field]) {
    const key = JSON.stringify([finding.code, finding.ownership ?? "not-applicable", finding.ownershipConfidence ?? "not-applicable"]);
    if (!groups.has(key)) groups.set(key, { code: finding.code, ownership: finding.ownership ?? "not-applicable", confidence: finding.ownershipConfidence ?? "not-applicable", count: 0, examples: [] });
    const group = groups.get(key);
    group.count++;
    if (group.examples.length < 3) group.examples.push({ url: record.url, selector: finding.selector ?? null });
  }
  return [...groups.values()].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

function routeRollup(record) {
  return { url: record.url, template: record.template, locale: record.locale, canonicalFamily: record.canonicalFamily, imageCount: record.imageCount,
    nativeImgCount: record.images.filter((image) => image.elementKind === "img").length,
    backgroundCount: record.backgroundImages.length, findings: Object.fromEntries(Object.entries(record.findings).map(([field, values]) => [field, values.length])) };
}

function groupRollup(records, field) {
  const groups = new Map();
  for (const record of records) {
    const key = record[field];
    if (!groups.has(key)) groups.set(key, { [field]: key, routeCount: 0, imageCount: 0, nativeImgCount: 0, backgroundCount: 0, observedDefectCount: 0 });
    const group = groups.get(key), rollup = routeRollup(record);
    group.routeCount++; group.imageCount += record.imageCount; group.nativeImgCount += rollup.nativeImgCount;
    group.backgroundCount += rollup.backgroundCount; group.observedDefectCount += record.findings.observedDefects.length;
  }
  return [...groups.values()].sort((a, b) => a[field].localeCompare(b[field]));
}

// Contract overrides support small on-disk test fixtures. The CLI always uses
// the fixed approved production-build contract above.
export async function runImageAudit({ root = process.cwd(), contract = DEFAULT_CONTRACT } = {}) {
  const nextRoot = path.join(root, ".next"), outputRoot = path.join(root, "docs/codex/audit");
  const shardRoot = path.join(outputRoot, "phase-4e-image-inventory");
  const [buildIdBytes, manifestBytes, templates, sourceInventory] = await Promise.all([
    readFile(path.join(nextRoot, "BUILD_ID")), readFile(path.join(nextRoot, "prerender-manifest.json")), routeTemplates(root), sourcesForAudit(root, contract),
  ]);
  const buildId = buildIdBytes.toString("utf8").trim();
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  const routes = reconcileImageRoutes(manifest, { expectedCount: contract.routeCount, knownTemplates: [...templates.keys()] });
  let localizedPages = [];
  if (routes.publicRoutes.some((route) => manifest.routes[route].srcRoute === "/[locale]/[...slug]")) {
    localizedPages = JSON.parse(await readFile(path.join(root, "docs/codex/locale-content-manifest.json"), "utf8")).items;
  }
  const artifactHash = createHash("sha256").update(buildIdBytes).update("\0").update(manifestBytes);
  const records = [];
  for (const route of routes.publicRoutes) {
    const url = imagePublicUrl(route), first = route.split("/")[1];
    const locale = contract.locales.includes(first) && first !== "en" ? first : "en";
    if (["ar", "zh", "zh-CN"].includes(first)) throw new Error(`Held locale entered routed image audit: ${route}`);
    const file = path.join(nextRoot, "server/app", route === "/" ? "index.html" : `${route.slice(1)}.html`);
    const bytes = await readFile(file); // Missing generated HTML must fail.
    artifactHash.update("\0").update(url).update("\0").update(bytes);
    const html = bytes.toString("utf8"), $ = cheerio.load(html), canonicals = $('link[rel="canonical"]');
    if (canonicals.length !== 1) throw new Error(`Missing/duplicate canonical evidence: ${url}`);
    const canonical = canonicals.attr("href"), canonicalFamily = imageCanonicalFamily(canonical);
    const srcRoute = manifest.routes[route].srcRoute;
    const { template, source } = resolveRoute({ url, locale, srcRoute, $, sources: sourceInventory.sources, localizedPages });
    const resolver = createImageAttributionResolver({ source, template, postSources: sourceInventory.sources.filter((item) => item.kind === "post" && item.locale === "en") });
    const audit = auditImageAlternatives({ html, locale, sourceAttribution: resolver });
    const backgroundImages = audit.backgroundImages.map((background) => {
      const element = $(background.selector)[0];
      const attribution = element ? resolver({ $, element, record: { source: background.source } }) : null;
      return { ...background, sourceAttribution: attribution, ownership: attribution?.origin ?? "unresolved", ownershipConfidence: attribution ? "proven" : "unknown" };
    });
    records.push({ url, template, canonicalFamily, locale, canonicalEvidence: { canonical, rule: "strip-known-locale-prefix-only" },
      artifactPath: relative(root, file), routeTemplateEvidence: templates.get(srcRoute), resolvedProtectedSource: source?.sourcePath ?? null,
      imageCount: audit.images.length, images: assignEquivalentImageContexts(audit.images), backgroundImages,
      sourceParserFindings: source?.unsupported ?? [],
      findings: { observedDefects: audit.observedDefects, editorialFindings: audit.editorialFindings, unresolvedFindings: audit.unresolvedFindings,
        diagnostics: audit.diagnostics.map((finding) => finding.code === "inline-background-image" ? { ...finding, ...backgroundImages.find((image) => image.selector === finding.selector && image.source === finding.source) } : finding) },
    });
  }
  records.sort((a, b) => a.url.localeCompare(b.url));
  const imageCount = records.reduce((sum, record) => sum + record.imageCount, 0);
  const artifactFingerprint = `sha256:${artifactHash.digest("hex")}`;
  const inventory = assertImageInventory(records, { expectedRouteCount: contract.routeCount, expectedImageCount: imageCount, buildId, artifactFingerprint });
  const evidenceFingerprint = combineEvidenceFingerprints([
    { name: "artifact", fingerprint: artifactFingerprint }, { name: "auditedAttributionSources", fingerprint: sourceInventory.routedFingerprint },
    { name: "protectedPublishableCorpus", fingerprint: sourceInventory.allFingerprint },
  ]);
  const crossLocaleReview = attachEquivalentImageReviews(records);
  await mkdir(shardRoot, { recursive: true });
  const unexpected = (await readdir(shardRoot)).filter((file) => !contract.locales.map((locale) => `${locale}.ndjson`).includes(file));
  if (unexpected.length) throw new Error(`Unexpected image inventory shard(s): ${unexpected.join(", ")}`);
  const shards = [], validation = [];
  for (const locale of contract.locales) {
    const shardRecords = records.filter((record) => record.locale === locale), file = path.join(shardRoot, `${locale}.ndjson`);
    const bytes = Buffer.from(`${shardRecords.map((record) => JSON.stringify(record)).join("\n")}\n`);
    const entry = { locale, path: relative(root, file), format: "ndjson-one-route-record-per-line", routeCount: shardRecords.length,
      imageCount: shardRecords.reduce((sum, record) => sum + record.imageCount, 0), byteLength: bytes.length, sha256: hash(bytes) };
    await writeFile(file, bytes);
    shards.push(entry);
    validation.push({ ...entry, urls: shardRecords.map((record) => record.url), bytes: await readFile(file) });
  }
  const shardInventory = assertImageShardManifest({ expectedRouteCount: contract.routeCount, expectedImageCount: imageCount, shards: validation });
  const allImages = records.flatMap((record) => record.images);
  const observedDefectCount = records.reduce((sum, record) => sum + record.findings.observedDefects.length, 0);
  const representatives = [];
  for (const locale of ["en", "es", "ja"]) {
    const selected = locale === "en" ? [records.find((r) => r.url === "/"), records.find((r) => r.url === "/about/"), records.find((r) => r.template === "category-archive"), records.find((r) => r.locale === "en" && r.template === "post" && r.images.some((i) => i.ownership === "protected-frontmatter") && r.images.some((i) => i.ownership === "protected-mdx"))] : [records.find((r) => r.locale === locale && r.template === "post"), records.find((r) => r.locale === locale && r.template === "mdx-page" && r.images.some((i) => i.sourceAttribution?.region === "page-hero"))];
    for (const record of selected.filter(Boolean)) {
      const images = representativeImageRecords(record.images);
      representatives.push({ url: record.url, template: record.template, locale: record.locale, canonicalFamily: record.canonicalFamily, images, backgroundImages: record.backgroundImages.slice(0, 3) });
    }
  }
  const report = {
    schemaVersion: 1,
    evidence: { buildId, artifactFingerprint, artifactFingerprintInputs: ["BUILD_ID exact bytes", "prerender-manifest exact bytes", "public URL + exact generated HTML bytes in manifest route order (NUL framed, Phase 4D contract)"],
      protectedSourceFingerprint: sourceInventory.routedFingerprint, protectedSourceFileCount: sourceInventory.routedSourceCount,
      protectedPublishableContentFingerprint: sourceInventory.allFingerprint, protectedPublishableContentFileCount: sourceInventory.allSourceCount,
      evidenceFingerprint, evidenceFingerprintInputs: "Length-framed named artifact, routed source, all-14 publishable corpus fingerprints",
      generatedHtmlInventory: { ...routes, publicRoutes: undefined, intendedPublicHtmlCount: records.length, exact: true },
      routedLocales: contract.locales, heldLocales: ["ar", "zh"], rawMdxRead: false },
    policy: { ...IMAGE_ALT_POLICY, sourceParsing: "Installed CommonMark AST + HTML source locations; fenced/inline code and comments excluded. Image references/dynamic HTML remain unsupported. Malformed frontmatter fails execution.",
      attribution: "Proven generated regions first; protected prose requires exact original source + alt presence + normalized alt + occurrence. Unknown ownership remains unresolved.",
      frontmatter: "ArticleHero explicit truthy heroAlt only is authored; article title/H1 fallback and MdxPageLayout title alt are generated with separate source provenance and frontmatter dependencies.",
      comparison: "Same canonical family, proven region, original source, within-source duplicate occurrence only. Identical strings are manual review, never automatic defects.",
      execution: "Existing site defects do not fail CLI; missing/duplicate/unmapped evidence and fingerprint/shard failures do.",
      limits: ["Static names are a bounded subset requiring actual browser AX checks", "Stylesheet backgrounds, pseudo-elements, client-only imagery, computed visibility and dynamic states are not exhaustive", "Unknown custom regions and raw SVG ownership remain unresolved"] },
    status: { auditExecution: "pass", evidenceIntegrity: "pass", siteFindingVerdict: observedDefectCount ? "observed-defects-present" : "manual-review-required", routeCount: records.length, imageCount, observedDefectCount },
    counts: { elementKinds: countBy(allImages.map((image) => image.elementKind)), ownership: countBy(allImages.map((image) => image.ownership)), ownershipConfidence: countBy(allImages.map((image) => image.ownershipConfidence)),
      accessibleExposure: countBy(allImages.map((image) => image.accessibleExposure)), altStatus: countBy(allImages.map((image) => image.altStatus)),
      zeroRelevantImageRoutes: records.filter((record) => record.imageCount === 0).length, zeroNativeImgRoutes: records.filter((record) => !record.images.some((image) => image.elementKind === "img")).length,
      inlineBackgroundImages: records.reduce((sum, record) => sum + record.backgroundImages.length, 0), sourceParserUnsupported: sourceInventory.sources.reduce((sum, source) => sum + source.unsupported.length, 0), crossLocaleManualReviewGroups: crossLocaleReview.length },
    inventory, shardInventory, shards,
    findingAggregates: Object.fromEntries(["observedDefects", "editorialFindings", "unresolvedFindings", "diagnostics"].map((field) => [field, aggregateFindings(records, field)])),
    crossLocaleReview: { count: crossLocaleReview.length, automaticDefect: false, representatives: crossLocaleReview.slice(0, 20) },
    templateRollups: groupRollup(records, "template"), localeRollups: groupRollup(records, "locale"), routeRollups: records.map(routeRollup), representatives,
  };
  await writeFile(path.join(outputRoot, "phase-4e-image-alt-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runImageAudit().then((report) => console.log(JSON.stringify(report.status, null, 2))).catch((error) => {
    console.error(JSON.stringify({ auditExecution: "fail", evidenceIntegrity: "fail", siteFindingVerdict: "not-evaluated", error: error.message }, null, 2));
    process.exitCode = 1;
  });
}
