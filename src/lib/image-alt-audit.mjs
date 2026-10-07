import * as cheerio from "cheerio";
import { createHash } from "node:crypto";
import { posix } from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { protectedSourceFingerprint as fingerprintExactSources } from "./heading-structure-audit.mjs";
export { combineEvidenceFingerprints } from "./heading-structure-audit.mjs";

// Static, explicitly bounded subset; never a substitute for a browser AX tree.
// Priority follows AccName 1.2 WD 2026-10-02, with HTML-AAM host sequences:
// https://www.w3.org/TR/2026/WD-accname-1.2-20261002/
// https://www.w3.org/TR/html-aam-1.0/#accessible-name-and-description-computation
// Not implemented: computed styles, CSS generated content, shadow/slot trees,
// embedded control values, constrained img/figcaption fallback, SVG desc
// fallback, or browser-generated filenames. Host fallback candidates remain
// browser-check-required rather than assertions about actual browser names.
const INTERACTIVE = 'a[href],button,[role="button"],[role="link"]';
const LABELABLE = "button,input:not([type=hidden]),meter,output,progress,select,textarea";

export const IMAGE_ALT_POLICY = Object.freeze({
  accessibleNameReference: "https://www.w3.org/TR/2026/WD-accname-1.2-20261002/",
  hostLanguageReference: "https://www.w3.org/TR/html-aam-1.0/",
  lengthDiagnostic: Object.freeze({ thresholdCodePoints: 250, accessibilityRequirement: false }),
  namingScope: "Static tested subset; draft and browser-dependent behavior requires browser verification.",
});

function ancestors(element) {
  const result = [];
  for (let node = element; node; node = node.parent) result.push(node);
  return result;
}

function hiddenReason(element) {
  for (const node of ancestors(element)) {
    const attrs = node.attribs ?? {};
    if (node.name === "template") return "inert-template";
    if (node.name === "dialog" && attrs.open === undefined) return "closed-dialog";
    if (attrs.hidden !== undefined) return "hidden-attribute";
    if (attrs["aria-hidden"] === "true") return "aria-hidden";
    if (/\b(?:display\s*:\s*none|visibility\s*:\s*(?:hidden|collapse)|content-visibility\s*:\s*hidden)\b/iu.test(attrs.style ?? "")) return "inline-hidden-style";
  }
  return null;
}

function exposure($, element, authoredName) {
  const node = $(element);
  const chain = ancestors(element);
  const reasons = [];
  const hidden = hiddenReason(element);
  if (hidden) reasons.push(hidden);
  const template = chain.some((item) => item.name === "template");
  const dialog = chain.some((item) => item.name === "dialog" && item.attribs?.open === undefined);
  const visuallyHidden = chain.some((item) => /(?:^|\s)(?:sr-only|visually-hidden)(?:\s|$)/u.test(item.attribs?.class ?? ""));
  const transparent = chain.some((item) => /(?:^|;)\s*opacity\s*:\s*0(?:\s*!important)?\s*(?:;|$)/iu.test(item.attribs?.style ?? ""));
  const visualHidden = chain.some((item) => item.attribs?.hidden !== undefined || /\b(?:display\s*:\s*none|visibility\s*:\s*(?:hidden|collapse)|content-visibility\s*:\s*hidden)\b/iu.test(item.attribs?.style ?? ""));
  const role = node.attr("role");
  const emptyAlt = element.name === "img" && node.attr("alt") !== undefined && !normalizeAlternativeText(node.attr("alt"));
  const presentation = role === "presentation" || role === "none";
  const focusable = node.attr("tabindex") !== undefined || node.attr("focusable") === "true" || node.is(INTERACTIVE) || element.name === "input";
  const decorativeSignals = [emptyAlt && "empty-alt", presentation && "presentational-role", hidden === "aria-hidden" && "aria-hidden"].filter(Boolean);
  const conflict = decorativeSignals.length > 0 && (focusable || !!authoredName || role === "img");
  const atomic = chain.slice(1).some((item) => item.attribs?.role === "img");
  const accessibleExposure = template ? "inert-template" : dialog ? "closed-dialog" : hidden ? "hidden" : atomic ? "suppressed-atomic" : conflict ? "uncertain" : (emptyAlt || presentation) ? "decorative" : "exposed";
  const visualVisibility = template || dialog ? "not-rendered" : visualHidden ? "hidden" : visuallyHidden ? "visually-hidden" : transparent ? "transparent" : "visible-static";
  if (visuallyHidden) reasons.push("screen-reader-only-class");
  if (transparent) reasons.push("inline-opacity-zero");
  return { accessibleExposure, visualVisibility, visibilityReason: reasons, decorativeSignals, conflict };
}

function createNameComputer($) {
  const ids = new Map();
  $("[id]").each((_, node) => {
    const id = $(node).attr("id");
    if (!ids.has(id)) ids.set(id, []);
    ids.get(id).push(node);
  });
  return (element, { includeHiddenRoot = false } = {}) => {
    const diagnostics = [];
    let unsupportedHostFallback = false;
    const visited = new Set();
    const empty = { name: "", namingMethod: "none" };
    function visit(node, context = {}) {
      if (!node || node === context.exclude || visited.has(node)) return empty;
      if (node.type === "text") { visited.add(node); return { name: node.data, namingMethod: "content" }; }
      if (!node.name || ["script", "style", "template"].includes(node.name)) return empty;
      if (hiddenReason(node) && !context.allowHidden) return empty;
      const el = $(node);
      if (!context.inReference) {
        const refs = [...new Set((el.attr("aria-labelledby") ?? "").split(/\s+/u).filter(Boolean))];
        const valid = refs.filter((id) => ids.has(id));
        if (refs.some((id) => !ids.has(id))) diagnostics.push({ code: "missing-id-reference" });
        if (valid.length) {
          const value = normalizeAlternativeText(valid.map((id) => {
            if (ids.get(id).length > 1) diagnostics.push({ code: "duplicate-id-reference", id });
            const target = ids.get(id)[0];
            return visit(target, { ...context, inReference: true, contentAllowed: true, allowHidden: !!hiddenReason(target) }).name;
          }).join(" "));
          if (value) { visited.add(node); return { name: value, namingMethod: "aria-labelledby" }; }
        }
      }
      visited.add(node);
      const label = normalizeAlternativeText(el.attr("aria-label"));
      if (label) return { name: label, namingMethod: "aria-label" };
      if (el.is(LABELABLE)) {
        const associated = $("label").toArray().filter((candidate) => {
          const explicit = $(candidate).attr("for");
          if (explicit !== undefined) return explicit === el.attr("id") && ids.get(explicit)?.[0] === node;
          return $(candidate).find(LABELABLE).first()[0] === node;
        });
        const value = normalizeAlternativeText(associated.map((candidate) => visit(candidate, {
          ...context, exclude: node, contentAllowed: true, allowHidden: !!hiddenReason(candidate),
        }).name).join(" "));
        if (value) return { name: value, namingMethod: "native-label" };
      }
      if (node.name === "img" && el.attr("alt") !== undefined) {
        return { name: normalizeAlternativeText(el.attr("alt")), namingMethod: "alt" };
      }
      if (node.name === "input" && el.attr("type")?.toLowerCase() === "image") {
        const alt = normalizeAlternativeText(el.attr("alt"));
        if (alt) return { name: alt, namingMethod: "alt" };
      }
      if (node.name === "svg") {
        const title = normalizeAlternativeText(el.children("title").first().text());
        if (title) return { name: title, namingMethod: "svg-title" };
      }
      const atomic = el.attr("role") === "img" || ["img", "svg", "input"].includes(node.name);
      if (!atomic && (context.contentAllowed || el.is(INTERACTIVE))) {
        const value = normalizeAlternativeText((node.children ?? []).map((child) => visit(child, { ...context, contentAllowed: true }).name).join(" "));
        if (value) return { name: value, namingMethod: "content" };
      }
      const title = normalizeAlternativeText(el.attr("title"));
      if (title) return { name: title, namingMethod: "title" };
      // Uncertainty belongs to the traversal, including references and nested
      // image content. A control consuming this candidate cannot be declared
      // definitely nameless until a browser resolves the unsupported fallback.
      if ((node.name === "svg" && el.children("desc").length > 0) ||
          (node.name === "img" && el.attr("alt") === undefined && el.attr("title") === undefined &&
            normalizeAlternativeText(el.closest("figure").children("figcaption").first().text()))) {
        unsupportedHostFallback = true;
      }
      return empty;
    }
    // Inventory authored naming for hidden roots only. A visible root must
    // still exclude unrelated hidden descendants; explicit IDREF traversal
    // independently applies its own hidden-reference exception above.
    const result = visit(element, { allowHidden: includeHiddenRoot && !!hiddenReason(element) });
    const browserDependent = $(element).is('input[type="image"]') && !result.name;
    return {
      ...result, name: normalizeAlternativeText(result.name), diagnostics,
      computedNameStatus: browserDependent || unsupportedHostFallback ? "browser-check-required" : result.name ? "resolved-subset" : "empty",
      browserFallbackStatus: unsupportedHostFallback ? "unsupported-host-fallback" : browserDependent ? "browser-dependent" : "not-needed",
    };
  };
}

export function computeAccessibleName({ html = "", selector } = {}) {
  const $ = cheerio.load(html);
  return createNameComputer($)($(selector).first()[0]);
}

export function normalizeAlternativeText(value) {
  return String(value ?? "").normalize("NFC").replace(/\s+/gu, " ").trim();
}

// Decode only Next's explicit local optimizer endpoint, once. Other URLs,
// queries, encodings, srcset and picture candidates are never rewritten.
export function decodeImageSource(originalSource) {
  const unchanged = { originalSource, source: originalSource, transformation: null };
  if (typeof originalSource !== "string" || !/^\/_next\/image\/?\?/u.test(originalSource)) return unchanged;
  const url = new URL(originalSource, "https://audit.invalid");
  const sources = url.searchParams.getAll("url");
  if (sources.length !== 1 || !sources[0]) return unchanged;
  const source = sources[0];
  return { originalSource, source, transformation: { kind: "next-image-optimizer", originalSource, source } };
}

// Candidates must come from proven publishable MDX. The caller establishes
// region provenance and checks known generated components before calling match.
// Queue keys include alt presence, so missing alt cannot consume decorative alt.
export function createOccurrenceAwareImageMatcher(candidates = []) {
  const queues = new Map();
  const keyFor = ({ source, altPresent, alt }) => JSON.stringify([source, altPresent, normalizeAlternativeText(alt)]);
  for (const candidate of candidates) {
    if (typeof candidate.source !== "string" || !candidate.source || typeof candidate.altPresent !== "boolean" || !normalizeAlternativeText(candidate.evidence)) {
      throw new Error("Image source candidates require a source, alt presence and concrete evidence.");
    }
    const key = keyFor(candidate);
    if (!queues.has(key)) queues.set(key, { items: [], consumed: 0 });
    queues.get(key).items.push(candidate);
  }
  return {
    match(rendered) {
      if (rendered.sourceRegion !== "protected-prose" || typeof rendered.altPresent !== "boolean") return null;
      const decoded = decodeImageSource(rendered.source);
      const queue = queues.get(keyFor({ ...rendered, source: decoded.source }));
      if (!queue || queue.consumed >= queue.items.length) return null;
      const candidate = queue.items[queue.consumed++];
      return { origin: "protected-mdx", evidence: candidate.evidence, occurrence: queue.consumed, sourceTransformation: decoded.transformation };
    },
  };
}

function selectorFor($, element) {
  const parts = [];
  for (let current = element; current; current = current.parent) {
    if (!current.name) continue;
    const siblings = (current.parent?.children ?? []).filter((sibling) => sibling.name === current.name);
    parts.unshift(`${current.name}:nth-of-type(${siblings.indexOf(current) + 1})`);
  }
  return parts.join(" > ");
}

// sourceAttribution({ $, element, record }) is a synchronous resolver. It must
// prove a generated component/region before attempting protected matching and
// return { origin, evidence, confidence? }, or null for unproven ownership.
// Findings describe observed behavior independently of this ownership decision.
export function auditImageAlternatives({ html = "", locale = null, sourceAttribution = null } = {}) {
  const $ = cheerio.load(html);
  const compute = createNameComputer($);
  const observedDefects = [];
  const editorialFindings = [];
  const unresolvedFindings = [];
  const diagnostics = [{
    code: "static-inventory-limitations",
    message: "Static HTML/inline-style subset only. Stylesheet backgrounds, pseudo-elements, client-only imagery, computed styles, shadow DOM, embedded control values and browser fallbacks are not exhaustively assessed; verify in browser accessibility trees.",
  }];
  const reportedControls = new Set();
  const images = $('img,input[type="image"],svg,[role="img"]').toArray().map((element, index) => {
    const node = $(element);
    const rawAlt = node.attr("alt") ?? null;
    const normalizedAlt = normalizeAlternativeText(rawAlt);
    const computed = compute(element);
    const authored = compute(element, { includeHiddenRoot: true });
    const interactive = node.is(INTERACTIVE) ? element : node.parents(INTERACTIVE).first()[0];
    const interactiveComputed = interactive ? compute(interactive) : null;
    const interactiveAuthored = interactive ? compute(interactive, { includeHiddenRoot: true }) : null;
    const interactiveName = interactiveComputed?.name ?? null;
    const atomicParent = node.parents('[role="img"]').first()[0];
    const exposureState = exposure($, element, authored.name);
    const svgClassification = element.name !== "svg" ? null : exposureState.accessibleExposure === "suppressed-atomic" ? "suppressed" : exposureState.decorativeSignals.length && !exposureState.conflict ? "decorative" : node.attr("role") === "img" || authored.name ? "semantic" : "uncertain";
    const record = {
      order: index + 1, selector: selectorFor($, element), elementKind: element.name === "input" ? "input-image" : ["img", "svg"].includes(element.name) ? element.name : "role-img",
      source: node.attr("src") ?? null, sourceSet: node.attr("srcset") ?? null,
      pictureCandidates: node.closest("picture").children("source").toArray().map((source) => ({
        sourceSet: $(source).attr("srcset") ?? null, media: $(source).attr("media") ?? null, type: $(source).attr("type") ?? null,
      })),
      altPresent: rawAlt !== null, rawAlt, normalizedAlt,
      altStatus: !["img", "input"].includes(element.name) ? "not-applicable" : rawAlt === null ? "missing" : normalizedAlt ? "nonempty" : "empty-decorative",
      accessibleName: computed.name, authoredName: authored.name,
      authoredNameStatus: authored.name ? "present" : authored.browserFallbackStatus === "unsupported-host-fallback" ? "unresolved" : exposureState.accessibleExposure === "decorative" ? "empty-decorative" : "missing", computedNameStatus: computed.computedNameStatus,
      browserFallbackStatus: computed.browserFallbackStatus, accessibleExposure: exposureState.accessibleExposure, visualVisibility: exposureState.visualVisibility, visibilityReason: exposureState.visibilityReason,
      decorativeSignals: exposureState.decorativeSignals, svgClassification, interactiveAncestor: interactive ? selectorFor($, interactive) : null, interactiveAccessibleName: interactiveName, figureCaption: normalizeAlternativeText(node.closest("figure").children("figcaption").first().text()) || null,
      interactiveComputedNameStatus: interactiveComputed?.computedNameStatus ?? null,
      interactiveAuthoredNameStatus: !interactiveAuthored ? null : interactiveAuthored.name ? "present" : interactiveAuthored.browserFallbackStatus === "unsupported-host-fallback" ? "unresolved" : "missing",
      locale, inheritedLanguage: node.closest("[lang]").attr("lang") ?? null, namingMethod: computed.namingMethod,
      observedFindings: [], ownership: "unresolved", ownershipConfidence: "unknown", sourceAttribution: null,
    };
    const attribution = typeof sourceAttribution === "function" ? sourceAttribution({ $, element, record }) : null;
    if (["protected-mdx", "protected-frontmatter", "shared-component", "shared-template"].includes(attribution?.origin) && normalizeAlternativeText(attribution.evidence)) {
      record.sourceAttribution = attribution;
      record.ownership = attribution.origin;
      record.ownershipConfidence = attribution.confidence ?? "proven";
    }
    const finding = (code) => ({ code, order: record.order, selector: record.selector, ownership: record.ownership, ownershipConfidence: record.ownershipConfidence });
    function defect(code) { const item = finding(code); observedDefects.push(item); record.observedFindings.push(item); }
    if (record.ownership === "unresolved") unresolvedFindings.push(finding("image-ownership-unresolved"));
    if (exposureState.conflict) unresolvedFindings.push(finding("decorative-intent-conflict-review-required"));
    if (svgClassification === "uncertain") unresolvedFindings.push(finding("svg-semantics-review-required"));
    if (computed.computedNameStatus === "browser-check-required") {
      unresolvedFindings.push(finding("browser-name-check-required"));
    }
    if (record.authoredNameStatus === "unresolved") unresolvedFindings.push(finding("authored-name-browser-check-required"));
    diagnostics.push(...computed.diagnostics.map((item) => ({ ...finding(item.code), ...item })));
    if (element.name === "img" && !record.altPresent) defect("img-missing-alt");
    if (record.elementKind === "input-image" && record.authoredNameStatus === "missing") defect("image-input-missing-authored-alternative");
    if (record.accessibleExposure === "exposed" && (node.attr("role") === "img" || (element.name === "svg" && authored.name)) && !computed.name && computed.computedNameStatus !== "browser-check-required") defect("semantic-image-missing-name");
    if (interactive && !hiddenReason(interactive) && !interactiveName && !atomicParent && !reportedControls.has(interactive)) {
      if (interactiveComputed.computedNameStatus === "browser-check-required") {
        unresolvedFindings.push({ ...finding("interactive-name-browser-check-required"), interactiveAncestor: record.interactiveAncestor });
      } else {
        defect("interactive-image-missing-name");
      }
      reportedControls.add(interactive);
    }
    const qualitySignals = [];
    if (/^(?:image|photo|picture|thumbnail|graphic)$/iu.test(normalizedAlt)) qualitySignals.push("placeholder-token");
    if (/^\p{N}+$/u.test(normalizedAlt)) qualitySignals.push("numeric-only");
    if (/^[a-f\d]{12,}$/iu.test(normalizedAlt) && /\d/u.test(normalizedAlt) && /[a-f]/iu.test(normalizedAlt)) qualitySignals.push("hash-like");
    if (/\.(?:avif|webp|jpe?g|png|gif|svg|bmp|tiff?|ico)(?:[?#].*)?$/iu.test(normalizedAlt)) qualitySignals.push("filename-like");
    if (/^(?:https?:\/\/|\/|\.\.?\/|[a-z]:\\)/iu.test(normalizedAlt)) qualitySignals.push("path-or-url-like");
    if (qualitySignals.length) editorialFindings.push({ ...finding("alternative-quality-review"), signals: qualitySignals, automaticDefect: false });
    const codePoints = [...normalizedAlt].length;
    if (codePoints > IMAGE_ALT_POLICY.lengthDiagnostic.thresholdCodePoints) diagnostics.push({ ...finding("alternative-length-diagnostic"), codePoints, accessibilityRequirement: false });
    if (normalizedAlt && normalizedAlt === record.figureCaption) editorialFindings.push({ ...finding("alternative-matches-caption"), automaticDefect: false });
    return record;
  });
  const backgroundImages = [];
  $("[style]").each((_, element) => {
    // A bounded inline CSS inventory, not a CSS parser; escaped/variable URLs
    // and stylesheet declarations require the browser review disclosed above.
    const style = $(element).attr("style");
    for (const declaration of style.matchAll(/(?:^|;)\s*background(?:-image)?\s*:\s*([^;]+)/giu)) {
      for (const match of declaration[1].matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/giu)) {
        const item = { selector: selectorFor($, element), source: match[1] ?? match[2] ?? match[3], locale, ownership: "unresolved", ownershipConfidence: "unknown" };
        backgroundImages.push(item);
        diagnostics.push({ code: "inline-background-image", ...item });
      }
    }
  });
  return { images, backgroundImages, observedDefects, editorialFindings, unresolvedFindings, diagnostics };
}

// The caller must prove equivalence; URLs, image basenames and alt similarity
// alone do not establish canonical-family or image-context identity.
export function compareEquivalentImageAlternatives(entries = []) {
  const groups = new Map();
  for (const entry of entries) {
    const text = normalizeAlternativeText(entry.normalizedAlt);
    if (!entry.canonicalFamily || !entry.imageContext || !entry.locale || !text) continue;
    const key = JSON.stringify([entry.canonicalFamily, entry.imageContext, text]);
    if (!groups.has(key)) groups.set(key, { canonicalFamily: entry.canonicalFamily, imageContext: entry.imageContext, normalizedAlt: text, locales: new Set() });
    groups.get(key).locales.add(entry.locale);
  }
  return [...groups.values()].filter((group) => group.locales.size > 1).map((group) => ({
    ...group, locales: [...group.locales].sort(), code: "cross-locale-identical-alternative", automaticDefect: false,
    message: "Manual review only: brand names, acronyms, technical terms and shared chrome may legitimately be identical. No language inference performed.",
  })).sort((a, b) => JSON.stringify([a.canonicalFamily, a.imageContext, a.normalizedAlt]).localeCompare(JSON.stringify([b.canonicalFamily, b.imageContext, b.normalizedAlt])));
}

function normalizedEvidencePath(value) {
  if (typeof value !== "string" || !value.trim()) throw new Error("Image evidence requires a nonempty path.");
  return posix.normalize(value.replaceAll("\\", "/"));
}

function evidenceBytes(value) {
  if (typeof value !== "string" && !(value instanceof Uint8Array)) throw new Error("Image evidence requires exact bytes.");
  return Buffer.from(value);
}

// Reuse Phase 4D's length-framed hash, adding the image audit's publishable-only
// guard. Reject raw paths before evaluating bytes, including lazy byte getters.
export function protectedSourceFingerprint(sources = []) {
  const normalized = sources.map((source) => {
    const path = normalizedEvidencePath(source?.path);
    if (/\.raw\.mdx$/iu.test(path)) throw new Error("Raw MDX cannot enter image attribution fingerprints.");
    return { path, bytes: evidenceBytes(source.bytes) };
  });
  return fingerprintExactSources(normalized);
}

function assertCount(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`Image inventory requires a nonnegative integer ${label}.`);
}

function validateImageRecords(records) {
  if (!Array.isArray(records)) throw new Error("Image inventory requires route records.");
  const urls = new Set();
  let imageCount = 0;
  for (const record of records) {
    for (const field of ["url", "template", "canonicalFamily", "locale"]) {
      if (typeof record?.[field] !== "string" || !record[field].trim()) throw new Error(`Image route requires ${field}.`);
    }
    if (urls.has(record.url)) throw new Error(`Image inventory contains duplicate URL: ${record.url}`);
    urls.add(record.url);
    assertCount(record.imageCount, "imageCount");
    if (!Array.isArray(record.images) || record.imageCount !== record.images.length) throw new Error(`Image count differs from inventory for ${record.url}.`);
    imageCount += record.imageCount;
  }
  return { routeCount: records.length, imageCount };
}

function assertImageTotals(actual, expectedRouteCount, expectedImageCount) {
  assertCount(expectedRouteCount, "expectedRouteCount");
  assertCount(expectedImageCount, "expectedImageCount");
  if (actual.routeCount !== expectedRouteCount) throw new Error(`Image inventory expected ${expectedRouteCount} routes, received ${actual.routeCount}.`);
  if (actual.imageCount !== expectedImageCount) throw new Error(`Image inventory expected ${expectedImageCount} images, received ${actual.imageCount}.`);
}

// One route record is required even when images is empty. These are execution /
// evidence guards; existing accessibility findings never cause them to fail.
export function assertImageInventory(records, { expectedRouteCount, expectedImageCount, buildId, artifactFingerprint }) {
  if (typeof buildId !== "string" || !buildId.trim() || !/^(?:sha256:)?[a-f0-9]{64}$/iu.test(artifactFingerprint ?? "")) {
    throw new Error("Image audit requires a build identity and SHA-256 artifact fingerprint.");
  }
  const totals = validateImageRecords(records);
  assertImageTotals(totals, expectedRouteCount, expectedImageCount);
  return { ...totals, exact: true, buildId, artifactFingerprint };
}

// Each shard supplies { locale, path, urls, routeCount, imageCount, byteLength,
// sha256, bytes }. Parse those exact NDJSON bytes so manifest claims are checked
// against persisted inventory, not just against other counters from the caller.
export function assertImageShardManifest({ expectedRouteCount, expectedImageCount, shards }) {
  if (!Array.isArray(shards)) throw new Error("Image inventory requires shards.");
  const locales = new Set(), paths = new Set();
  const records = [];
  let totalBytes = 0;
  for (const shard of shards) {
    if (typeof shard.locale !== "string" || !shard.locale.trim() || locales.has(shard.locale)) throw new Error("Image shards require unique nonempty locales.");
    locales.add(shard.locale);
    const path = normalizedEvidencePath(shard.path);
    if (paths.has(path)) throw new Error("Image shards require unique normalized paths.");
    paths.add(path);
    const bytes = evidenceBytes(shard.bytes);
    if (!Number.isSafeInteger(shard.byteLength) || shard.byteLength <= 0 || bytes.length !== shard.byteLength) throw new Error(`Image shard byte length mismatch: ${path}`);
    if (!/^[a-f0-9]{64}$/iu.test(shard.sha256 ?? "") || createHash("sha256").update(bytes).digest("hex") !== shard.sha256.toLowerCase()) throw new Error(`Image shard SHA-256 mismatch: ${path}`);
    const lines = bytes.toString("utf8").split("\n");
    if (lines.at(-1) === "") lines.pop();
    const parsed = lines.map((line) => JSON.parse(line));
    const totals = validateImageRecords(parsed);
    assertImageTotals(totals, shard.routeCount, shard.imageCount);
    if (parsed.some((record) => record.locale !== shard.locale)) throw new Error(`Image shard locale mismatch: ${path}`);
    if (!Array.isArray(shard.urls) || JSON.stringify(shard.urls) !== JSON.stringify(parsed.map((record) => record.url))) throw new Error(`Image shard URL inventory mismatch: ${path}`);
    records.push(...parsed);
    totalBytes += bytes.length;
  }
  const totals = validateImageRecords(records);
  assertImageTotals(totals, expectedRouteCount, expectedImageCount);
  return { shardCount: shards.length, ...totals, totalBytes, exact: true };
}

export const IMAGE_PUBLISHED_LOCALES = Object.freeze(["en", "de", "es", "fr", "hi", "it", "ja", "ko", "nl", "pt", "ru", "tr"]);
const NON_HTML = ["/favicon.ico", "/llms.txt", "/robots.txt", "/sitemap.xml"];
const EXCLUDED_HTML = ["/_global-error", "/_not-found", "/admin/login"];
export const imagePublicUrl = (route) => !route || route === "/" ? "/" : `/${route.replace(/^\/+|\/+$/gu, "")}/`;

export function reconcileImageRoutes(manifest, { expectedCount = 1457, knownTemplates = [] } = {}) {
  const routes = manifest?.routes;
  if (!routes || NON_HTML.some((route) => !routes[route])) throw new Error("Missing required non-HTML route evidence.");
  const all = Object.keys(routes).sort();
  const publicRoutes = all.filter((route) => !NON_HTML.includes(route) && !EXCLUDED_HTML.includes(route));
  const urls = publicRoutes.map(imagePublicUrl);
  if (new Set(urls).size !== urls.length) throw new Error("Duplicate public image route URL.");
  for (const route of publicRoutes) {
    if (!knownTemplates.includes(routes[route]?.srcRoute)) throw new Error(`Unmapped route evidence: ${route}`);
  }
  if (publicRoutes.length !== expectedCount) throw new Error(`Expected ${expectedCount} public HTML routes, received ${publicRoutes.length}.`);
  return { publicRoutes, manifestRouteCount: all.length, nonHtmlRoutes: NON_HTML, excludedHtmlRoutes: EXCLUDED_HTML };
}

export function imageCanonicalFamily(canonical) {
  if (!canonical) throw new Error("Missing canonical family evidence.");
  const parsed = new URL(canonical);
  if (parsed.origin !== "https://noeldcosta.com") throw new Error(`Unmapped canonical origin: ${canonical}`);
  const segments = parsed.pathname.split("/").filter(Boolean);
  if ([...IMAGE_PUBLISHED_LOCALES.filter((locale) => locale !== "en"), "ar", "zh-CN"].includes(segments[0])) segments.shift();
  return segments.length ? `/${segments.join("/")}/` : "/";
}

// The installed CommonMark parser is already used transitively by react-markdown.
// We inspect syntax without rendering/evaluating it. References and dynamic HTML
// attributes are deliberately unsupported; no basename or permissive alt match.
export function parseImageSource(input) {
  const sourcePath = normalizedEvidencePath(input.sourcePath);
  if (/\.raw\.mdx$/iu.test(sourcePath)) throw new Error("Raw MDX cannot enter source parsing.");
  const raw = String(input.raw);
  const parsed = matter(raw); // Invalid YAML is an integrity failure, never a fallback.
  const bodyOffset = raw.slice(0, raw.length - parsed.content.length).split("\n").length - 1;
  const lines = raw.split(/\r?\n/u);
  const fieldEvidence = (field) => {
    const index = lines.slice(1, bodyOffset).findIndex((line) => line.startsWith(`${field}:`));
    return index < 0 ? null : `${sourcePath}:${index + 2}`;
  };
  const images = [], unsupported = [], customTags = new Set();
  function visit(node) {
    const evidence = `${sourcePath}:${bodyOffset + (node.position?.start.line ?? 1)}`;
    if (node.type === "image") images.push({ source: node.url, altPresent: true, alt: node.alt, evidence });
    if (node.type === "imageReference") unsupported.push({ code: "unsupported-image-reference", evidence });
    if (node.type === "html") {
      const $ = cheerio.load(node.value, { sourceCodeLocationInfo: true }, false);
      $("*").each((_, element) => {
        if (element.name.includes("-")) customTags.add(element.name);
        if (element.name !== "img") return;
        const location = element.sourceCodeLocation;
        const imageEvidence = `${sourcePath}:${bodyOffset + node.position.start.line + (location?.startLine ?? 1) - 1}`;
        const markup = location ? node.value.slice(location.startOffset, location.startTag?.endOffset ?? location.endOffset) : "";
        const src = $(element).attr("src");
        if (!location || !src || /(?:src|alt)\s*=\s*\{/iu.test(markup) || (markup.match(/\bsrc\s*=/giu) ?? []).length !== 1 || (markup.match(/\balt\s*=/giu) ?? []).length > 1) {
          unsupported.push({ code: "unsupported-html-image", evidence: imageEvidence });
          return;
        }
        images.push({ source: src, altPresent: $(element).attr("alt") !== undefined, alt: $(element).attr("alt") ?? null, evidence: imageEvidence });
      });
    }
    for (const child of node.children ?? []) visit(child);
  }
  visit(unified().use(remarkParse).parse(parsed.content));
  const frontmatterImages = ["hero", "cover"].filter((field) => typeof parsed.data[field] === "string" && parsed.data[field]).map((field) => ({
    field, source: parsed.data[field], evidence: fieldEvidence(field), altField: `${field}Alt`,
    altPresent: Object.hasOwn(parsed.data, `${field}Alt`), alt: parsed.data[`${field}Alt`] ?? null, altEvidence: fieldEvidence(`${field}Alt`),
  }));
  return { sourcePath, frontmatter: parsed.data, images, frontmatterImages, customTags: [...customTags].sort(), unsupported,
    fieldEvidence: Object.fromEntries(["title", "h1", "hero", "heroAlt", "cover", "coverAlt"].map((field) => [field, fieldEvidence(field)])) };
}

export function createImageAttributionResolver({ source = null, template, postSources = [] } = {}) {
  const matcher = createOccurrenceAwareImageMatcher(source?.images ?? []);
  const generated = (component, region, extra = {}) => ({ origin: "shared-component", evidence: `src/components/${component}.tsx`, region, ...extra });
  return ({ $, element, record }) => {
    const node = $(element), prose = node.closest(".prose-noel"), region = node.closest(".not-prose");
    const decoded = decodeImageSource(record.source);
    const originalSource = decoded.source;
    const marked = node.closest("[data-heading-source]").attr("data-heading-source");
    if (["CompareSplit", "DecisionTree", "Stepper"].includes(marked)) return generated(`article/diagrams/${marked}`, marked);
    if (node.closest('[data-heading-region="product-promo"]').length) return generated("article/ProductPromoCard", "product-promo");
    // Existing MdxBody components are proved by the source tag AND their fixed
    // not-prose structure. A raw <nav>/<footer> inside prose is never chrome.
    if (source && prose.length && region.length) {
      if (source.customTags.includes("about-hero") && region.is("section.mb-10") &&
          region.find('a[href="https://calendly.com/noeldcosta/30min"]').length === 1 &&
          region.find('a[href="mailto:solutions@noeldcosta.com"]').length === 1 &&
          region.find('img.cc-ken-burns[src="/images/headshot.png"]').length === 1) {
        return generated("article/hero/AboutHero", "about-hero", { sourceTagEvidence: source.sourcePath });
      }
      if (source.customTags.includes("featured-on") && region.is("section.my-10") && region.children(".grid.grid-cols-2").length === 1 && node.hasClass("object-contain") &&
          ["3__6_-removebg-preview.webp", "4__1_-removebg-preview.webp", "5__2_-removebg-preview.webp", "1__1_-removebg-preview.webp", "2__4_-removebg-preview.webp", "image-25.webp"].some((name) => originalSource === `/images/wp/2025/02/${name}`)) {
        return generated("article/featured/FeaturedOn", "featured-on", { sourceTagEvidence: source.sourcePath });
      }
      if (source.customTags.includes("testimonials-grid") && region.is("div.my-10") && region.children(".grid.grid-cols-1.gap-5").length === 1 && node.is("img.w-14.h-14.rounded-full") &&
          node.closest("section").find("blockquote").length === 1 && node.closest("section").find("h3").length === 1 &&
          ["8.webp", "5.webp", "9.webp", "6.webp", "1-2.webp", "7.webp", "3-2.webp", "4-1.webp", "2-2.webp"].some((name) => originalSource === `/images/wp/2025/02/${name}`)) {
        return generated("article/testimonials/TestimonialsGrid", "testimonials-grid", { sourceTagEvidence: source.sourcePath });
      }
      return null;
    }
    if (source && prose.length) {
      const matched = matcher.match({ sourceRegion: "protected-prose", source: record.source, altPresent: record.altPresent, alt: record.rawAlt });
      return matched ? { ...matched, region: "protected-prose" } : null;
    }
    if (prose.length) return null;
    const footer = node.closest("footer.bg-corbeau.text-moon");
    if (footer.length && footer.parent().is("body")) return generated("Footer", "footer");
    const nav = node.closest("nav");
    if (nav.length && nav.parent().is("body") && /position:fixed/u.test(nav.attr("style") ?? "") && nav.find('a[aria-label="noeldcosta — home"]').length === 1) return generated("Nav", "navigation");
    const section = node.closest("section");
    if (template === "homepage") {
      if (originalSource === "/images/headshot.png" && node.closest(".cc-enter-scale").length && section.parent().is("main") && section.find("h1").length === 1) return generated("Hero", "homepage-hero");
      if (section.is(".bg-bone") && section.find('h2[aria-label="Senior on the system. Senior on the close."]').length === 1 &&
          (element.name === "svg" || (["sap-press", "msn", "linkedin", "ips", "techbullion"].some((name) => originalSource === `/press/${name}.webp`) && node.closest("li").length))) return generated("Credentials", "publication-logos");
      if (section.is(".bg-cream") && section.find("h2").attr("aria-label") === "Don't take my word for it. Read theirs." && node.attr("sizes") === "48px" &&
          ["mike-papamichael", "andrew-macfarlane", "takhliq-hanif"].some((name) => originalSource === `/people/${name}.webp`)) return generated("Testimonials", "homepage-testimonials");
    }
    if (["post", "case-study-post"].includes(template)) {
      if (originalSource === "/images/headshot.png" && node.attr("sizes") === "72px" && section.is(".mt-16.border-2.border-papaya") && section.find('a[href="/about"],a[href="/about/"]').length === 1 && section.find("h3").length) return generated("article/AuthorBox", "author-box");
    }
    const link = node.closest("a[href]");
    const relatedRegion = template === "post" && section.is(".mt-16.mb-4") && section.children("header").find("h2").text() === "More from the archive" && node.attr("sizes") === "108px";
    const categoryRegion = template === "category-archive" && link.is(".group.flex.flex-col.bg-paper.rounded-2xl.overflow-hidden") && link.find("h3").length === 1;
    if (relatedRegion || categoryRegion) {
      const linked = postSources.find((post) => imagePublicUrl(link.attr("href") ?? "") === `/${post.slug}/` && post.frontmatter.hero === originalSource && normalizeAlternativeText(post.frontmatter.title) === record.normalizedAlt);
      if (linked && record.altPresent) return generated(relatedRegion ? "article/RelatedArticles" : "CategoryPage", relatedRegion ? "related-article" : "category-card", {
        altOwnership: "generated-post-title", frontmatterDependency: { field: "title", evidence: linked.fieldEvidence.title },
        sourceProvenance: linked.frontmatterImages.find((image) => image.field === "hero"),
      });
    }
    if (source && template === "post" && node.closest("article header.mb-12").find("h1").length === 1) {
      if (originalSource === "/headshot.png" && node.attr("sizes") === "40px") return generated("article/ArticleHero", "article-author");
      const hero = source.frontmatterImages.find((item) => item.field === "hero" && item.source === originalSource);
      if (hero && node.parent().is("figure.mt-10") && record.altPresent) {
        const fm = source.frontmatter;
        if (typeof hero.alt === "string" && hero.alt && hero.altEvidence && normalizeAlternativeText(hero.alt) === record.normalizedAlt) {
          return { origin: "protected-frontmatter", evidence: hero.altEvidence, region: "article-hero", altOwnership: "authored-heroAlt", sourceProvenance: hero };
        }
        const field = fm.h1 ? "h1" : "title";
        if (!fm.heroAlt && normalizeAlternativeText(fm[field]) === record.normalizedAlt) return {
          origin: "shared-template", evidence: "src/components/PostPage.tsx -> src/components/article/ArticleHero.tsx alt={heroAlt || title}", region: "article-hero",
          altOwnership: "generated-title-fallback", sourceProvenance: hero, frontmatterDependency: { field, evidence: source.fieldEvidence[field] },
        };
      }
    }
    if (source && template === "mdx-page" && node.is("img.w-full.h-auto.rounded-2xl.mb-10") && node.siblings(".prose-noel").length === 1 && node.siblings("h1").length === 1) {
      const hero = source.frontmatterImages.find((item) => item.field === "hero" && item.source === originalSource);
      if (hero && record.altPresent && normalizeAlternativeText(source.frontmatter.title) === record.normalizedAlt) return {
        origin: "shared-template", evidence: "src/components/MdxPageLayout.tsx alt={fm.title}", region: "page-hero", altOwnership: "generated-title-fallback",
        sourceProvenance: hero, frontmatterDependency: { field: "title", evidence: source.fieldEvidence.title },
      };
    }
    return null;
  };
}

export function assignEquivalentImageContexts(images) {
  const occurrences = new Map();
  return images.map((image) => {
    const decoded = decodeImageSource(image.source);
    const region = image.sourceAttribution?.region;
    const key = decoded.source && region ? `${region}|${decoded.source}` : null;
    const occurrence = key ? (occurrences.get(key) ?? 0) + 1 : null;
    if (key) occurrences.set(key, occurrence);
    return { ...image, originalSource: decoded.source, sourceTransformation: decoded.transformation,
      imageContext: key ? `${key}|${occurrence}` : null };
  });
}

// Keep the complete manual-review evidence in persisted route records. Only
// bounded representatives belong in the summary; no group is discarded.
export function attachEquivalentImageReviews(records) {
  const groups = compareEquivalentImageAlternatives(records.flatMap((record) => record.images.map((image) => ({
    canonicalFamily: record.canonicalFamily, imageContext: image.imageContext, locale: record.locale, normalizedAlt: image.normalizedAlt,
  }))));
  const key = (family, context, alt) => JSON.stringify([family, context, alt]);
  const index = new Map(groups.map((group) => [key(group.canonicalFamily, group.imageContext, group.normalizedAlt), group]));
  for (const record of records) for (const image of record.images) {
    const group = index.get(key(record.canonicalFamily, image.imageContext, image.normalizedAlt));
    if (group) record.findings.editorialFindings.push({ ...group, selector: image.selector, order: image.order, ownership: image.ownership, ownershipConfidence: image.ownershipConfidence });
  }
  return groups;
}

export function representativeImageRecords(images) {
  const seen = new Set();
  return images.filter((image) => {
    const key = JSON.stringify([image.sourceAttribution?.region ?? "unresolved", image.elementKind, image.observedFindings.map((finding) => finding.code)]);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).slice(0, 16);
}
