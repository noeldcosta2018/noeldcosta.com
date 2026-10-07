import * as cheerio from "cheerio";
import { createHash } from "node:crypto";

export function protectedSourceFingerprint(sources) {
  const normalized = (sources ?? []).map((source) => ({
    path: String(source?.path ?? "").replaceAll("\\", "/"),
    bytes: Buffer.isBuffer(source?.bytes) ? source.bytes : Buffer.from(source?.bytes ?? ""),
  })).sort((left, right) => left.path.localeCompare(right.path));
  const paths = new Set();
  const hash = createHash("sha256");
  for (const source of normalized) {
    if (!source.path || paths.has(source.path)) throw new Error("Protected source fingerprint requires unique nonempty paths.");
    paths.add(source.path);
    const pathBytes = Buffer.from(source.path, "utf8");
    hash.update(`${pathBytes.length}:`).update(pathBytes);
    hash.update(`${source.bytes.length}:`).update(source.bytes);
  }
  return `sha256:${hash.digest("hex")}`;
}

export function combineEvidenceFingerprints(entries) {
  const normalized = (entries ?? []).map((entry) => ({
    name: String(entry?.name ?? ""),
    fingerprint: String(entry?.fingerprint ?? ""),
  })).sort((left, right) => left.name.localeCompare(right.name));
  const names = new Set();
  const hash = createHash("sha256");
  for (const entry of normalized) {
    if (!entry.name || !entry.fingerprint || names.has(entry.name)) {
      throw new Error("Combined evidence fingerprint requires unique nonempty names and fingerprints.");
    }
    names.add(entry.name);
    const nameBytes = Buffer.from(entry.name, "utf8");
    const fingerprintBytes = Buffer.from(entry.fingerprint, "utf8");
    hash.update(`${nameBytes.length}:`).update(nameBytes);
    hash.update(`${fingerprintBytes.length}:`).update(fingerprintBytes);
  }
  return `sha256:${hash.digest("hex")}`;
}

export function normalizeHeadingText(value) {
  const literal = String(value ?? "").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  return cheerio.load(`<span>${literal}</span>`, null, false)
    .text()
    .normalize("NFC")
    .replace(/\s+/gu, " ")
    .trim();
}

export function normalizeMdxHeadingText(value) {
  return normalizeHeadingText(
    String(value ?? "")
      .replace(/!\[([^\]]*)\]\([^)]*\)/gu, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/gu, "$1")
      .replace(/\\([\\`*{}[\]()#+.!_>~-])/gu, "$1")
      .replace(/[`*_~]/gu, "")
      .replace(/<[^>]+>/gu, " "),
  );
}

export function mdxBodyLineOffset(raw) {
  const lines = String(raw ?? "").replace(/^\uFEFF/u, "").split(/\r?\n/u);
  if (lines[0]?.trim() !== "---") return 0;
  const closingIndex = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  return closingIndex < 0 ? 0 : closingIndex + 1;
}

function frontmatterFieldLine(raw, field) {
  const lines = String(raw ?? "").replace(/^\uFEFF/u, "").split(/\r?\n/u);
  if (lines[0]?.trim() !== "---") return null;
  const closingIndex = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  const limit = closingIndex < 0 ? lines.length : closingIndex;
  const index = lines.slice(1, limit).findIndex((line) => new RegExp(`^${field}:(?:\\s|$)`, "u").test(line));
  return index < 0 ? null : index + 2;
}

export function frontmatterHeadingCandidates(raw, frontmatter, sourcePath) {
  return ["h1", "title"].flatMap((field) => {
    const text = normalizeHeadingText(frontmatter?.[field]);
    if (!text) return [];
    const line = frontmatterFieldLine(raw, field);
    return [{ field, text, evidence: line ? `${sourcePath}:${line}` : sourcePath }];
  });
}

export function createOccurrenceAwareSourceMatcher(sourceHeadings) {
  const queues = new Map();
  for (const heading of sourceHeadings ?? []) {
    const key = `${heading.rank}\0${normalizeHeadingText(heading.text)}`;
    if (!queues.has(key)) queues.set(key, []);
    queues.get(key).push(heading);
  }
  const occurrences = new Map();
  return {
    match({ rank, text }) {
      const key = `${rank}\0${normalizeHeadingText(text)}`;
      const queue = queues.get(key);
      if (!queue?.length) return null;
      const source = queue.shift();
      const occurrence = (occurrences.get(key) ?? 0) + 1;
      occurrences.set(key, occurrence);
      return {
        origin: "protected-mdx",
        evidence: source.evidence,
        sourceRank: source.rank,
        renderedRank: rank,
        occurrence,
      };
    },
  };
}

function parseStyle(value) {
  const declarations = new Map();
  for (const entry of String(value ?? "").split(";")) {
    const separator = entry.indexOf(":");
    if (separator < 0) continue;
    declarations.set(
      entry.slice(0, separator).trim().toLowerCase(),
      entry.slice(separator + 1).trim().toLowerCase(),
    );
  }
  return declarations;
}

function elementsToRoot($, element) {
  const elements = [];
  let current = element;
  while (current?.type === "tag") {
    elements.push(current);
    current = $(current).parent()[0];
  }
  return elements;
}

function classTokens($, element) {
  return String($(element).attr("class") ?? "").split(/\s+/u).filter(Boolean);
}

const TEMPLATE_CONTENT_CACHE = new WeakMap();

function isTemplateContent($, element) {
  let content = TEMPLATE_CONTENT_CACHE.get($);
  if (!content) {
    content = new WeakSet();
    const addTree = (node) => {
      content.add(node);
      for (const child of node.children ?? []) addTree(child);
    };
    for (const template of $("template").toArray()) {
      for (const child of template.children ?? []) addTree(child);
    }
    TEMPLATE_CONTENT_CACHE.set($, content);
  }
  return content.has(element);
}

function isSummarySubtreeOfClosedDetails($, subject, details) {
  if (details.name !== "details" || $(details).attr("open") !== undefined) return false;
  const summary = $(subject).closest("summary")[0];
  return Boolean(summary && $(summary).closest("details")[0] === details);
}

function ownVisibility($, element, subject = element) {
  const name = element.name?.toLowerCase();
  if (isTemplateContent($, element)) return ["hidden", "template-content"];
  if ($(element).attr("hidden") !== undefined) return ["hidden", "hidden-attribute"];
  if (name === "template") return ["hidden", "template-content"];
  if (name === "dialog" && $(element).attr("open") === undefined) return ["hidden", "closed-dialog"];
  if (
    name === "details" &&
    $(element).attr("open") === undefined &&
    !isSummarySubtreeOfClosedDetails($, subject, element)
  ) return ["hidden", "closed-details"];

  const classes = classTokens($, element);
  const hasResponsiveVisibility = classes.some((token) =>
    /^(?:(?:sm|md|lg|xl|2xl)|max-(?:sm|md|lg|xl|2xl)):(?:hidden|block|inline(?:-block|-flex|-grid)?|flex|grid|table|visible|invisible|opacity-(?:0|100)|sr-only|not-sr-only|clip|clip-auto)$/u.test(token));
  if (hasResponsiveVisibility) return ["indeterminate", "responsive-visibility"];
  if (classes.includes("sr-only") && !classes.includes("not-sr-only")) return ["hidden", "screen-reader-only"];
  if (classes.includes("hidden")) return ["hidden", "class-hidden"];
  if (classes.includes("invisible")) return ["hidden", "class-invisible"];
  if (classes.includes("opacity-0")) return ["hidden", "class-opacity-zero"];
  const classClipped =
    classes.includes("clip") ||
    classes.some((token) => /^\[(?:clip|clip-path):(?:rect\(0(?:px)?,?0(?:px)?,?0(?:px)?,?0(?:px)?\)|inset\(50%\))\]$/u.test(token)) ||
    (classes.includes("absolute") && classes.includes("w-px") && classes.includes("h-px") && classes.includes("overflow-hidden"));
  if (classClipped) return ["hidden", "class-clipped"];

  const style = parseStyle($(element).attr("style"));
  if (style.get("display") === "none") return ["hidden", "inline-display-none"];
  if (["hidden", "collapse"].includes(style.get("visibility"))) return ["hidden", "inline-visibility-hidden"];
  const opacity = style.get("opacity");
  if (opacity === "0" || opacity === "0.0") {
    if (style.has("transform") || $(element).attr("data-framer-motion") !== undefined) {
      return ["indeterminate", "animation-reveal-state"];
    }
    return ["hidden", "inline-opacity-zero"];
  }
  const clipped =
    /rect\(\s*0(?:px)?(?:\s*,?\s*0(?:px)?){3}\s*\)/u.test(style.get("clip") ?? "") ||
    /inset\(\s*50%\s*\)/u.test(style.get("clip-path") ?? "");
  if (clipped) return ["hidden", "inline-clipped"];
  return ["visible", "explicitly-visible"];
}

function visualState($, element) {
  let indeterminate = null;
  for (const candidate of elementsToRoot($, element)) {
    const [visibility, reason] = ownVisibility($, candidate, element);
    if (visibility === "hidden") return { visibility, visibilityReason: reason };
    if (visibility === "indeterminate" && !indeterminate) {
      indeterminate = { visibility, visibilityReason: reason };
    }
  }
  return indeterminate ?? { visibility: "visible", visibilityReason: "explicitly-visible" };
}

function isAriaHidden($, element) {
  return elementsToRoot($, element).some(
    (candidate) => String($(candidate).attr("aria-hidden") ?? "").toLowerCase() === "true",
  );
}

function isInert($, element) {
  return elementsToRoot($, element).some((candidate) => $(candidate).attr("inert") !== undefined);
}

function textForMode($, element, mode) {
  function visit(node) {
    if (node.type === "text") return node.data ?? "";
    if (node.type !== "tag") return "";
    if (node !== element) {
      const state = visualState($, node);
      if (mode === "visual" && state.visibility === "hidden") return "";
      if (mode === "accessible" && state.visibility === "hidden" && hiddenFromAccessibility(state.visibilityReason)) return "";
      if (mode === "accessible" && (isAriaHidden($, node) || isInert($, node))) return "";
    }
    return (node.children ?? []).map(visit).join("");
  }
  return normalizeHeadingText((element.children ?? []).map(visit).join(""));
}

function hiddenFromAccessibility(visibilityReason) {
  return [
    "hidden-attribute",
    "template-content",
    "closed-dialog",
    "closed-details",
    "class-hidden",
    "class-invisible",
    "inline-display-none",
    "inline-visibility-hidden",
  ].includes(visibilityReason);
}

function selectorFor($, element) {
  const parts = [];
  let current = element;
  while (current?.type === "tag" && !["html", "body"].includes(current.name)) {
    const siblings = $(current).parent().children(current.name).toArray();
    parts.unshift(`${current.name}:nth-of-type(${siblings.indexOf(current) + 1})`);
    current = $(current).parent()[0];
  }
  return parts.join(" > ");
}

function regionFor($, element) {
  if (isTemplateContent($, element)) return "template";
  const ancestors = elementsToRoot($, element);
  const named = ancestors.find((candidate) => normalizeHeadingText($(candidate).attr("data-heading-region")));
  if (named) return `named:${normalizeHeadingText($(named).attr("data-heading-region"))}`;
  if (ancestors.some((candidate) => candidate.name === "template")) return "template";
  if (ancestors.some((candidate) => candidate.name === "dialog" || $(candidate).attr("role") === "dialog")) return "dialog";
  const details = ancestors.find((candidate) => candidate.name === "details");
  if (details && !isSummarySubtreeOfClosedDetails($, element, details)) return "details";
  if (ancestors.some((candidate) => candidate.name === "nav" || $(candidate).attr("role") === "navigation")) return "nav";
  if (ancestors.some((candidate) => candidate.name === "footer" || $(candidate).attr("role") === "contentinfo")) return "footer";
  if (ancestors.some((candidate) => candidate.name === "main" || candidate.name === "article" || $(candidate).attr("role") === "main")) {
    return "main/editorial";
  }
  return "other";
}

function stateFor($, element) {
  if (isTemplateContent($, element)) return "template";
  const ancestors = elementsToRoot($, element);
  if (ancestors.some((candidate) => candidate.name === "template")) return "template";
  const dialog = ancestors.find((candidate) => candidate.name === "dialog");
  if (dialog) return $(dialog).attr("open") !== undefined ? "open" : "closed";
  const details = ancestors.find((candidate) => candidate.name === "details");
  if (details) {
    if ($(details).attr("open") !== undefined) return "expanded";
    if (isSummarySubtreeOfClosedDetails($, element, details)) return "summary";
    return "closed";
  }
  return "default";
}

function accessibleName($, element) {
  if (isAriaHidden($, element) || isInert($, element)) return "";
  const state = visualState($, element);
  if (state.visibility === "hidden" && hiddenFromAccessibility(state.visibilityReason)) return "";
  const label = normalizeHeadingText($(element).attr("aria-label"));
  if (label) return label;
  const labelledBy = String($(element).attr("aria-labelledby") ?? "").trim().split(/\s+/u).filter(Boolean);
  if (labelledBy.length > 0) {
    return normalizeHeadingText(labelledBy.map((id) => $(`#${CSS_ESCAPE(id)}`).text()).join(" "));
  }
  return textForMode($, element, "accessible");
}

function CSS_ESCAPE(value) {
  return String(value).replace(/([^A-Za-z0-9_-])/gu, "\\$1");
}

export function extractHeadingInventory(html, { sourceAttribution = null } = {}) {
  const $ = cheerio.load(String(html ?? ""));
  return $("h1,h2,h3,h4,h5,h6,[role='heading' i]")
    .toArray()
    .map((element, order) => {
      const native = /^h[1-6]$/u.test(element.name);
      const ariaLevelRaw = native ? null : $(element).attr("aria-level");
      const lexicalAriaLevel = ariaLevelRaw !== undefined && /^[1-9]\d*$/u.test(ariaLevelRaw);
      const parsedCandidate = lexicalAriaLevel ? Number(ariaLevelRaw) : null;
      const validAriaLevel = lexicalAriaLevel && Number.isSafeInteger(parsedCandidate);
      const parsedAriaLevel = validAriaLevel ? parsedCandidate : null;
      const rank = native ? Number(element.name.slice(1)) : parsedAriaLevel;
      const visual = visualState($, element);
      const rawText = $(element).text();
      const normalizedText = normalizeHeadingText(
        $(element).find("*").addBack().contents().toArray()
          .filter((node) => node.type === "text")
          .map((node) => node.data ?? "")
          .join(" "),
      );
      const selector = selectorFor($, element);
      const computedAccessibleName = accessibleName($, element);
      const attribution = typeof sourceAttribution === "function"
        ? sourceAttribution({ $, element, selector, order })
        : sourceAttribution;
      return {
        order,
        selector,
        kind: native ? "native" : "aria",
        rank: Number.isInteger(rank) && rank > 0 ? rank : null,
        ariaLevelStatus: native
          ? "not-applicable"
          : ariaLevelRaw === undefined
            ? "missing"
            : validAriaLevel
              ? "valid"
              : "invalid",
        rawText,
        normalizedText,
        visibleText: textForMode($, element, "visual"),
        accessibleName: computedAccessibleName,
        exposure: {
          visual: visual.visibility === "visible",
          accessible: Boolean(computedAccessibleName),
        },
        ...visual,
        region: regionFor($, element),
        state: stateFor($, element),
        sourceAttribution: attribution ?? { origin: "unresolved", evidence: null },
      };
    });
}

function rankSkipFindings(headings, { code = "heading-rank-skip", baseline = null } = {}) {
  const findings = [];
  let previous = baseline;
  for (const heading of headings) {
    if (!heading.rank) continue;
    if (previous !== null && heading.rank > previous + 1) {
      findings.push({
        severity: "implementation-defect",
        code,
        selector: heading.selector,
        fromRank: previous,
        toRank: heading.rank,
        region: heading.region,
      });
    }
    previous = heading.rank;
  }
  return findings;
}

function validException(exception) {
  return Boolean(
    normalizeHeadingText(exception?.name) &&
    normalizeHeadingText(exception?.code) &&
    normalizeHeadingText(exception?.selector) &&
    normalizeHeadingText(exception?.rationale) &&
    normalizeHeadingText(exception?.evidence),
  );
}

export function auditHeadingStructure({ html, exceptions = [], sourceAttribution = null }) {
  const headings = extractHeadingInventory(html, { sourceAttribution });
  let implementationDefects = [];
  const editorialDefects = [];
  const unresolvedFindings = [];
  const diagnostics = [];

  const pageHeadings = headings.filter((heading) =>
    heading.kind === "native" &&
    heading.rank === 1 &&
    ["main/editorial", "other"].includes(heading.region) &&
    heading.state === "default");
  if (pageHeadings.length === 0) {
    implementationDefects.push({ severity: "implementation-defect", code: "missing-page-h1" });
  } else {
    for (const heading of pageHeadings.filter((candidate) => !candidate.visibleText)) {
      implementationDefects.push({
        severity: "implementation-defect",
        code: "empty-page-h1",
        selector: heading.selector,
      });
    }
    const possibleVisibleCandidates = pageHeadings.filter((heading) =>
      heading.visibility !== "hidden" && Boolean(heading.visibleText));
    const definitelyVisibleCandidates = possibleVisibleCandidates.filter((heading) => heading.visibility === "visible");
    const indeterminateCandidates = possibleVisibleCandidates.filter((heading) => heading.visibility === "indeterminate");
    if (possibleVisibleCandidates.length === 0 && !implementationDefects.some((finding) => finding.code === "empty-page-h1")) {
      implementationDefects.push({ severity: "implementation-defect", code: "missing-visible-page-h1" });
    }
    if (definitelyVisibleCandidates.length > 1) {
      implementationDefects.push({
        severity: "implementation-defect",
        code: "multiple-page-h1",
        selectors: definitelyVisibleCandidates.map((heading) => heading.selector),
      });
    }
    if (indeterminateCandidates.length > 0 && possibleVisibleCandidates.length > 1) {
      unresolvedFindings.push({
        severity: "unresolved",
        code: "page-h1-count-browser-proof-required",
        selectors: possibleVisibleCandidates.map((heading) => heading.selector),
      });
    }
    for (const heading of indeterminateCandidates) {
      unresolvedFindings.push({
        severity: "unresolved",
        code: "page-h1-visibility-browser-proof-required",
        selector: heading.selector,
        reason: heading.visibilityReason,
      });
    }
  }

  for (const heading of headings) {
    if (heading.visibility !== "hidden" && !heading.visibleText) {
      implementationDefects.push({
        severity: "implementation-defect",
        code: "empty-visual-heading",
        selector: heading.selector,
      });
    }
    if (heading.visibility !== "hidden" && !heading.exposure.accessible) {
      implementationDefects.push({
        severity: "implementation-defect",
        code: "heading-hidden-from-accessibility-tree",
        selector: heading.selector,
        reason: heading.accessibleName ? "unknown" : "aria-hidden-or-inert",
      });
    }
    if (heading.kind === "aria" && heading.ariaLevelStatus === "missing") {
      implementationDefects.push({
        severity: "implementation-defect",
        code: "missing-aria-heading-level",
        selector: heading.selector,
      });
    } else if (heading.kind === "aria" && heading.ariaLevelStatus === "invalid") {
      implementationDefects.push({
        severity: "implementation-defect",
        code: "invalid-aria-heading-level",
        selector: heading.selector,
      });
    }
  }

  const defaultStates = new Set(["default", "summary"]);
  const nativeVisual = headings.filter((heading) =>
    heading.kind === "native" &&
    defaultStates.has(heading.state) &&
    heading.visibility !== "hidden" &&
    Boolean(heading.visibleText));
  const accessibleOutline = headings.filter((heading) =>
    defaultStates.has(heading.state) && heading.exposure.accessible && heading.rank);
  const outlineRegion = (heading) => ["main/editorial", "other"].includes(heading.region) ? "primary" : heading.region;
  const regions = [...new Set([
    ...nativeVisual.map(outlineRegion),
    ...accessibleOutline.map(outlineRegion),
  ])];
  for (const region of regions) {
    const nativeSequence = nativeVisual.filter((heading) => outlineRegion(heading) === region);
    const accessibleSequence = accessibleOutline.filter((heading) => outlineRegion(heading) === region);
    implementationDefects.push(...rankSkipFindings(nativeSequence, { code: "native-heading-rank-skip" }));
    implementationDefects.push(...rankSkipFindings(accessibleSequence, { code: "accessible-heading-rank-skip" }));
    const nativeKey = nativeSequence.map((heading) => `${heading.selector}:${heading.rank}`).join("|");
    const accessibleKey = accessibleSequence.map((heading) => `${heading.selector}:${heading.rank}`).join("|");
    if (nativeKey !== accessibleKey) {
      diagnostics.push({
        severity: "diagnostic",
        code: "native-accessible-outline-divergence",
        region,
        nativeSelectors: nativeSequence.map((heading) => heading.selector),
        accessibleSelectors: accessibleSequence.map((heading) => heading.selector),
      });
    }
    if ((region === "nav" || region === "footer" || region.startsWith("named:")) && nativeSequence[0]?.rank > 2) {
      implementationDefects.push({
        severity: "implementation-defect",
        code: "fixed-region-leading-rank",
        selector: nativeSequence[0].selector,
        region,
        observedRank: nativeSequence[0].rank,
      });
    }
  }

  const $ = cheerio.load(String(html ?? ""));
  $("dialog[open],[role='dialog']").each((_, dialog) => {
    const state = visualState($, dialog);
    if (state.visibility === "hidden") return;
    const hasHeading = headings.some((heading) => {
      const headingElement = $(heading.selector).first();
      return headingElement.closest("dialog,[role='dialog']")[0] === dialog &&
        heading.visibility !== "hidden" &&
        heading.exposure.accessible &&
        Boolean(heading.accessibleName);
    });
    const labelledBy = String($(dialog).attr("aria-labelledby") ?? "").trim().split(/\s+/u).filter(Boolean);
    const labelledByText = normalizeHeadingText(labelledBy.map((id) => $(`#${CSS_ESCAPE(id)}`).text()).join(" "));
    const hasLabel = Boolean(normalizeHeadingText($(dialog).attr("aria-label")) || labelledByText);
    if (!hasHeading && !hasLabel) {
      implementationDefects.push({
        severity: "implementation-defect",
        code: dialog.name === "dialog"
          ? "open-dialog-missing-heading-or-label"
          : "visible-dialog-missing-heading-or-label",
        selector: selectorFor($, dialog),
      });
    }
  });

  const expandedConditional = headings.filter((heading) =>
    (["open", "expanded"].includes(heading.state) || (heading.region === "dialog" && heading.state === "default")) &&
    heading.visibility !== "hidden" &&
    Boolean(heading.visibleText));
  const conditionalRoots = new Map();
  for (const heading of expandedConditional) {
    const rootElement = $(heading.selector).first().closest("dialog,[role='dialog'],details")[0];
    const root = rootElement ? selectorFor($, rootElement) : heading.region;
    if (!conditionalRoots.has(root)) conditionalRoots.set(root, []);
    conditionalRoots.get(root).push(heading);
  }
  for (const sequence of conditionalRoots.values()) {
    implementationDefects.push(...rankSkipFindings(sequence.filter((heading) => heading.kind === "native"), {
      code: "conditional-native-heading-rank-skip",
      baseline: 1,
    }));
    implementationDefects.push(...rankSkipFindings(sequence.filter((heading) => heading.exposure.accessible), {
      code: "conditional-accessible-heading-rank-skip",
      baseline: 1,
    }));
  }

  const appliedExceptions = [];
  const validExceptions = exceptions.filter(validException);
  implementationDefects = implementationDefects.filter((finding) => {
    const exception = validExceptions.find((candidate) =>
      candidate.code === finding.code && candidate.selector === finding.selector);
    if (!exception) return true;
    appliedExceptions.push({ ...exception, suppressedFinding: finding });
    return false;
  });
  for (const exception of exceptions.filter((candidate) => !validException(candidate))) {
    diagnostics.push({ severity: "diagnostic", code: "invalid-heading-exception", exception });
  }

  return {
    headings,
    conditionalInventory: headings.filter((heading) => ["closed", "template"].includes(heading.state)),
    implementationDefects,
    editorialDefects,
    unresolvedFindings,
    diagnostics,
    exceptions: appliedExceptions,
    browserProofLimits: [
      "computed-visibility-and-settled-animation-state",
      "responsive-breakpoint-visibility",
      "no-javascript-reveal-behavior",
      "opened-dialog-and-expanded-details-interaction",
    ],
  };
}

export function assertHeadingInventory(records, { expectedCount, buildId, artifactFingerprint }) {
  if (!normalizeHeadingText(buildId) || !normalizeHeadingText(artifactFingerprint)) {
    throw new Error("Heading audit requires a build identity and artifact fingerprint.");
  }
  if (records.length !== expectedCount) {
    throw new Error(`Heading inventory expected ${expectedCount} records, received ${records.length}.`);
  }
  const seen = new Set();
  const duplicates = new Set();
  for (const record of records) {
    if (seen.has(record.url)) duplicates.add(record.url);
    seen.add(record.url);
  }
  if (duplicates.size > 0) {
    throw new Error(`Heading inventory contains duplicate URL(s): ${[...duplicates].join(", ")}`);
  }
  return {
    expectedCount,
    actualCount: records.length,
    exact: records.length === expectedCount,
    buildId,
    artifactFingerprint,
  };
}

export function assertHeadingShardManifest({ expectedRouteCount, expectedHeadingCount, shards }) {
  const urls = [];
  let routeCount = 0;
  let headingCount = 0;
  let totalBytes = 0;
  for (const shard of shards ?? []) {
    if (!/^[a-f0-9]{64}$/iu.test(shard.sha256 ?? "")) {
      throw new Error(`Heading inventory has invalid shard hash for ${shard.locale ?? "unknown"}.`);
    }
    if (!Number.isInteger(shard.byteLength) || shard.byteLength <= 0) {
      throw new Error(`Heading inventory has invalid shard byte length for ${shard.locale ?? "unknown"}.`);
    }
    routeCount += shard.routeCount;
    headingCount += shard.headingCount;
    totalBytes += shard.byteLength;
    urls.push(...(shard.urls ?? []));
  }
  const duplicates = [...new Set(urls.filter((url, index) => urls.indexOf(url) !== index))];
  if (duplicates.length > 0) throw new Error(`Heading inventory contains duplicate shard URL(s): ${duplicates.join(", ")}`);
  if (routeCount !== expectedRouteCount) {
    throw new Error(`Heading shards expected ${expectedRouteCount} routes, received ${routeCount}.`);
  }
  if (headingCount !== expectedHeadingCount) {
    throw new Error(`Heading shards expected ${expectedHeadingCount} headings, received ${headingCount}.`);
  }
  return {
    shardCount: shards.length,
    routeCount,
    headingCount,
    totalBytes,
    exact: routeCount === expectedRouteCount && headingCount === expectedHeadingCount,
  };
}

export function classifyHeadingFindingOrigins(findings, headings) {
  const bySelector = new Map(headings.map((heading) => [heading.selector, heading]));
  const result = {
    implementationDefects: [],
    editorialDefects: [],
    unresolvedFindings: [],
  };
  for (const finding of findings) {
    const attribution = finding.sourceAttribution ?? bySelector.get(finding.selector)?.sourceAttribution;
    const enriched = { ...finding, sourceAttribution: attribution ?? { origin: "unresolved", evidence: null } };
    if (attribution?.origin === "protected-mdx" || attribution?.origin === "protected-frontmatter") {
      result.editorialDefects.push({ ...enriched, severity: "editorial-defect" });
    } else if (attribution?.origin === "shared-component" || attribution?.origin === "shared-template") {
      result.implementationDefects.push({ ...enriched, severity: "implementation-defect" });
    } else {
      result.unresolvedFindings.push({ ...enriched, severity: "unresolved" });
    }
  }
  return result;
}
