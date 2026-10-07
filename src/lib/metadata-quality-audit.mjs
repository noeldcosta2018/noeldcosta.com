import * as cheerio from "cheerio";

export function normalizeMetadataText(value) {
  const literal = String(value ?? "").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const decoded = cheerio.load(`<span>${literal}</span>`, null, false).text();
  return decoded
    .normalize("NFKC")
    .replace(/\s+/gu, " ")
    .trim();
}

function metaValues($, selector) {
  return $(selector)
    .toArray()
    .map((element) => normalizeMetadataText($(element).attr("content")));
}

export function extractDocumentMetadata(html) {
  const $ = cheerio.load(html);
  const head = $("head").first();
  const titles = head
    .children("title")
    .toArray()
    .map((element) => normalizeMetadataText($(element).text()));

  return {
    titles,
    descriptions: metaValues($, 'head meta[name="description" i]'),
    canonicals: $("head link[rel~='canonical' i]")
      .toArray()
      .map((element) => normalizeMetadataText($(element).attr("href"))),
    ogTitles: metaValues($, 'head meta[property="og:title" i]'),
    ogDescriptions: metaValues($, 'head meta[property="og:description" i]'),
    ogUrls: metaValues($, 'head meta[property="og:url" i]'),
    twitterTitles: metaValues($, 'head meta[name="twitter:title" i]'),
    twitterDescriptions: metaValues($, 'head meta[name="twitter:description" i]'),
  };
}

export function attributeMetadataSource(frontmatter, field) {
  if (field === "title") {
    if (normalizeMetadataText(frontmatter?.metaTitle)) return "metaTitle";
    if (normalizeMetadataText(frontmatter?.title)) return "title";
  }
  if (field === "description") {
    if (normalizeMetadataText(frontmatter?.metaDescription)) return "metaDescription";
    if (normalizeMetadataText(frontmatter?.excerpt)) return "excerpt";
  }
  return "template fallback";
}

const EXPLICIT_TEMPLATE_PROVENANCE = new Set([
  "homepage",
  "portfolio-archive",
  "static-page",
  "interactive-tool",
]);

export function metadataProvenance({ url, template, candidates = [], values = {} }) {
  if (EXPLICIT_TEMPLATE_PROVENANCE.has(template)) {
    return {
      protectedSourcePath: null,
      title: "explicit static/template metadata",
      description: "explicit static/template metadata",
      ogTitle: "explicit static/template metadata",
      ogDescription: "explicit static/template metadata",
      twitterTitle: "explicit static/template metadata",
      twitterDescription: "explicit static/template metadata",
      resolution: "dedicated-template-precedence",
    };
  }
  if (template === "category-archive" || template === "tag-archive" || template === "archive-shortcut") {
    return {
      protectedSourcePath: null,
      title: "template fallback",
      description: "template fallback",
      ogTitle: "template fallback",
      ogDescription: "template fallback",
      twitterTitle: "template fallback",
      twitterDescription: "template fallback",
      resolution: "archive-template-precedence",
    };
  }

  let source = null;
  let resolution = "unresolved";
  if (url === "/about/") {
    source = candidates.find((candidate) => candidate.kind === "mdx-page" && candidate.slug === "about") ?? null;
    resolution = source ? "dedicated-about-slug" : "unresolved";
  } else {
    const desiredKind = template === "post" ? "post" : template === "mdx-page" || template === "dedicated-mdx-page" ? "mdx-page" : null;
    const eligible = desiredKind
      ? candidates.filter((candidate) => candidate.kind === desiredKind)
      : candidates;
    source = eligible.find((candidate) => candidate.kind === "post") ?? eligible[0] ?? null;
    resolution = source ? "route-contract-candidate" : "unresolved";
  }
  if (!source) {
    const inherited = (value) =>
      normalizeMetadataText(value) === "Noel D'Costa | ERP, Data & AI" ||
      [
        "25+ years helping companies migrate ERP, build AI, and get real value from SAP and Oracle systems.",
        "ECC to S/4HANA migrations. AI on top of ERP. Real results.",
        "25+ years delivering SAP, Oracle, and AI programmes across aviation, government, finance, retail, and manufacturing.",
      ].includes(normalizeMetadataText(value));
    return {
      protectedSourcePath: null,
      title: inherited(values.title) ? "inherited default" : "explicit static/template metadata",
      description: inherited(values.description) ? "inherited default" : "explicit static/template metadata",
      ogTitle: inherited(values.ogTitle) ? "inherited default" : "explicit static/template metadata",
      ogDescription: inherited(values.ogDescription) ? "inherited default" : "explicit static/template metadata",
      twitterTitle: inherited(values.twitterTitle) ? "inherited default" : "explicit static/template metadata",
      twitterDescription: inherited(values.twitterDescription) ? "inherited default" : "explicit static/template metadata",
      resolution,
    };
  }

  const titleSource = attributeMetadataSource(source.frontmatter, "title");
  const descriptionSource = attributeMetadataSource(source.frontmatter, "description");
  return {
    protectedSourcePath: source.sourcePath,
    title: titleSource,
    description: descriptionSource,
    ogTitle: titleSource,
    ogDescription: descriptionSource,
    twitterTitle: titleSource,
    twitterDescription: descriptionSource,
    resolution,
  };
}

function frontmatterLines(raw) {
  const lines = String(raw ?? "").replace(/^\uFEFF/u, "").split(/\r?\n/u);
  if (lines[0]?.trim() !== "---") return [];
  const closingIndex = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (closingIndex < 0) return [];
  return lines.slice(1, closingIndex).map((line, index) => ({
    lineNumber: index + 2,
    line,
  }));
}

function normalizedLocale(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().replaceAll("_", "-");
  if (!normalized) return null;
  return normalized === "zh-cn" ? "zh" : normalized.split("-")[0];
}

export function auditProtectedFrontmatter({
  raw,
  frontmatter,
  expectedLocale,
  sourcePath,
}) {
  const findings = [];
  const keys = new Map();
  for (const entry of frontmatterLines(raw)) {
    const match = entry.line.match(/^([A-Za-z][A-Za-z0-9_-]*):(?:\s|$)/u);
    if (!match) continue;
    const key = match[1];
    if (!keys.has(key)) keys.set(key, []);
    keys.get(key).push(entry);
  }
  for (const [key, entries] of keys) {
    if (entries.length < 2) continue;
    findings.push({
      severity: "editorial-defect",
      code: "protected-frontmatter-duplicate-key",
      sourcePath,
      key,
      rawEvidence: entries,
    });
  }

  if (!normalizeMetadataText(frontmatter?.metaTitle) && !normalizeMetadataText(frontmatter?.title)) {
    findings.push({
      severity: "editorial-defect",
      code: "protected-frontmatter-missing-title",
      sourcePath,
    });
  }
  if (
    !normalizeMetadataText(frontmatter?.metaDescription) &&
    !normalizeMetadataText(frontmatter?.excerpt)
  ) {
    findings.push({
      severity: "editorial-defect",
      code: "protected-frontmatter-missing-description",
      sourcePath,
    });
  }

  const declarationEntries = ["locale", "lang", "language"]
    .filter((key) => frontmatter?.[key] !== undefined)
    .map((key) => ({ key, value: frontmatter[key] }));
  const normalizedExpected = normalizedLocale(expectedLocale);
  for (const declaration of declarationEntries) {
    const declaredLocale = normalizedLocale(declaration.value);
    if (!declaredLocale || !normalizedExpected || declaredLocale === normalizedExpected) continue;
    findings.push({
      severity: "editorial-defect",
      code: "protected-frontmatter-explicit-locale-mismatch",
      sourcePath,
      declarationKey: declaration.key,
      declaredLocale,
      expectedLocale: normalizedExpected,
      rawEvidence: keys.get(declaration.key) ?? [],
    });
  }
  return findings;
}

function codePointLength(value) {
  return [...normalizeMetadataText(value)].length;
}

function unresolvedPlaceholder(value) {
  const normalized = normalizeMetadataText(value);
  return (
    /(^|[\s|:,(])%s(?=$|[\s|:,.!)])/iu.test(normalized) ||
    /\{\{\s*[A-Za-z_][\w.-]*\s*\}\}/u.test(normalized) ||
    /\$\{\s*[A-Za-z_][\w.-]*\s*\}/u.test(normalized) ||
    /\[\[\s*[A-Za-z_][\w.-]*\s*\]\]/u.test(normalized) ||
    /<%[=\-]?\s*[A-Za-z_][\w.-]*\s*%>/u.test(normalized)
  );
}

export function metadataLengthDiagnostics({ title, description }) {
  const diagnostics = [];
  const titleLength = codePointLength(title);
  const descriptionLength = codePointLength(description);
  if (titleLength < 15 || titleLength > 70) {
    diagnostics.push({
      severity: "diagnostic",
      code: "title-length",
      codePoints: titleLength,
      thresholds: { minimum: 15, maximum: 70 },
    });
  }
  if (descriptionLength < 50 || descriptionLength > 180) {
    diagnostics.push({
      severity: "diagnostic",
      code: "description-length",
      codePoints: descriptionLength,
      thresholds: { minimum: 50, maximum: 180 },
    });
  }
  return diagnostics;
}

export function classifySocialMetadata({
  documentTitle,
  documentDescription,
  ogTitle,
  ogDescription,
  twitterTitle,
  twitterDescription,
  inheritedDefaults,
  socialExceptions = {},
}) {
  const approvedBrandSuffix = " | Noel D'Costa";
  const titlesAreEquivalent = (left, right) => {
    if (left === right) return true;
    const suffixCount = (value) => value.split(approvedBrandSuffix).length - 1;
    if (suffixCount(left) > 1 || suffixCount(right) > 1) return false;
    if (left.endsWith(approvedBrandSuffix) && suffixCount(right) === 0) {
      return left.slice(0, -approvedBrandSuffix.length) === right;
    }
    if (right.endsWith(approvedBrandSuffix) && suffixCount(left) === 0) {
      return right.slice(0, -approvedBrandSuffix.length) === left;
    }
    return false;
  };
  const fields = [
    ["og-title", "title", ogTitle, inheritedDefaults?.title],
    ["og-description", "description", ogDescription, inheritedDefaults?.descriptions?.includes(normalizeMetadataText(ogDescription))],
    ["twitter-title", "title", twitterTitle, inheritedDefaults?.title],
    ["twitter-description", "description", twitterDescription, inheritedDefaults?.descriptions?.includes(normalizeMetadataText(twitterDescription))],
  ];
  const documentValues = {
    "og-title": normalizeMetadataText(documentTitle),
    "twitter-title": normalizeMetadataText(documentTitle),
    "og-description": normalizeMetadataText(documentDescription),
    "twitter-description": normalizeMetadataText(documentDescription),
  };

  return fields.flatMap(([field, kind, rawValue, inherited]) => {
    const value = normalizeMetadataText(rawValue);
    if (!value) {
      return [{ severity: "diagnostic", code: `missing-${field}` }];
    }
    const isInherited =
      typeof inherited === "boolean"
        ? inherited
        : normalizeMetadataText(inherited) === value;
    const matchesDocument = kind === "title"
      ? titlesAreEquivalent(value, documentValues[field])
      : value === documentValues[field];
    if (isInherited && !matchesDocument) {
      return [{
        severity: "implementation-defect",
        code: `inherited-default-${field}`,
        value,
      }];
    }
    if (!matchesDocument && !normalizeMetadataText(socialExceptions[field])) {
      return [{
        severity: "diagnostic",
        code: `social-value-mismatch-${field}`,
        value,
        documentValue: documentValues[field],
      }];
    }
    return [];
  });
}

export function assertMetadataInventory(records, {
  expectedCount,
  buildId,
  artifactFingerprint,
}) {
  if (!normalizeMetadataText(buildId) || !normalizeMetadataText(artifactFingerprint)) {
    throw new Error("Metadata audit requires a build identity and artifact fingerprint.");
  }
  if (records.length !== expectedCount) {
    throw new Error(
      `Metadata inventory expected ${expectedCount} records, received ${records.length}.`,
    );
  }
  const urls = records.map((record) => record.url);
  const duplicateUrls = [...new Set(urls.filter((url, index) => urls.indexOf(url) !== index))];
  if (duplicateUrls.length > 0) {
    throw new Error(`Metadata inventory contains duplicate URL(s): ${duplicateUrls.join(", ")}`);
  }
  return {
    expectedCount,
    actualCount: records.length,
    buildId,
    artifactFingerprint,
  };
}

function duplicateFindings(records, field, code) {
  const groups = new Map();
  for (const record of records) {
    const value = normalizeMetadataText(record[field]);
    if (!value) continue;
    const key = `${record.locale}\u0000${value}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }

  const findings = [];
  for (const group of groups.values()) {
    const families = new Set(group.map((record) => record.canonicalFamily));
    if (families.size < 2) continue;
    findings.push({
      severity: "editorial-defect",
      code,
      locale: group[0].locale,
      value: normalizeMetadataText(group[0][field]),
      canonicalFamilies: [...families].sort(),
      urls: [...new Set(group.map((record) => record.url))].sort(),
    });
  }
  return findings;
}

function crossLocaleDiagnostics(records, field, code) {
  const groups = new Map();
  for (const record of records) {
    const value = normalizeMetadataText(record[field]);
    if (!value) continue;
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(record);
  }
  const diagnostics = [];
  for (const [value, group] of groups) {
    const locales = [...new Set(group.map((record) => record.locale))].sort();
    if (locales.length < 2) continue;
    diagnostics.push({
      severity: "diagnostic",
      code,
      value,
      locales,
      urls: [...new Set(group.map((record) => record.url))].sort(),
    });
  }
  return diagnostics;
}

export function auditMetadataRecords(records) {
  const implementationDefects = [];
  const diagnostics = [];
  const exceptions = [];

  for (const record of records) {
    if (record.titleCount !== 1 || !normalizeMetadataText(record.title)) {
      implementationDefects.push({
        severity: "implementation-defect",
        code: "document-title-count",
        url: record.url,
        observed: record.titleCount,
      });
    }
    if (record.descriptionCount !== 1 || !normalizeMetadataText(record.description)) {
      implementationDefects.push({
        severity: "implementation-defect",
        code: "meta-description-count",
        url: record.url,
        observed: record.descriptionCount,
      });
    }
    if (/\| Noel D'Costa\s*\| Noel D'Costa$/u.test(normalizeMetadataText(record.title))) {
      implementationDefects.push({
        severity: "implementation-defect",
        code: "repeated-brand-suffix",
        url: record.url,
        value: normalizeMetadataText(record.title),
      });
    }
    for (const field of ["title", "description"]) {
      if (unresolvedPlaceholder(record[field])) {
        implementationDefects.push({
          severity: "implementation-defect",
          code: "unresolved-document-placeholder",
          field,
          url: record.url,
          value: normalizeMetadataText(record[field]),
        });
      }
    }
    const allowsDocumentDefault =
      record.documentDefaultException === "homepage-explicit-metadata";
    if (!allowsDocumentDefault && normalizeMetadataText(record.title) === "Noel D'Costa | ERP, Data & AI") {
      implementationDefects.push({
        severity: "implementation-defect",
        code: "inherited-default-document-title",
        url: record.url,
        value: normalizeMetadataText(record.title),
      });
    }
    if (
      !allowsDocumentDefault &&
      normalizeMetadataText(record.description) ===
        "25+ years helping companies migrate ERP, build AI, and get real value from SAP and Oracle systems."
    ) {
      implementationDefects.push({
        severity: "implementation-defect",
        code: "inherited-default-document-description",
        url: record.url,
        value: normalizeMetadataText(record.description),
      });
    }
    diagnostics.push(
      ...metadataLengthDiagnostics(record).map((finding) => ({ ...finding, url: record.url })),
    );
    if (record.exception) exceptions.push({ url: record.url, exception: record.exception });
  }

  const editorialDefects = [
    ...duplicateFindings(records, "title", "duplicate-title"),
    ...duplicateFindings(records, "description", "duplicate-description"),
  ];
  diagnostics.push(
    ...crossLocaleDiagnostics(records, "title", "cross-locale-identical-title"),
    ...crossLocaleDiagnostics(records, "description", "cross-locale-identical-description"),
  );

  return { implementationDefects, editorialDefects, diagnostics, exceptions };
}
