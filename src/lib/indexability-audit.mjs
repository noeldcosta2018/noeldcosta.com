const TOOL_PATHS = new Set([
  "/erp-implementation-cost-calculator/",
  "/free-data-migration-estimator-sap-oracle-microsoft/",
  "/sap-implementation-cost-calculator/",
  "/sap-job-description-generator/",
  "/sap-s4hana-migration-strategy-greenfield-vs-brownfield/",
  "/sap-solution-builder/",
]);
const COLON_VALUE_DIRECTIVES = new Set([
  "max-image-preview",
  "max-snippet",
  "max-video-preview",
  "unavailable_after",
]);
const HELD_PUBLIC_LOCALE_PREFIXES = new Set(["ar", "zh-CN"]);
const UNSUPPORTED_PUBLIC_LOCALE_PREFIXES = new Set(["el", "zh"]);

function tokenize(values) {
  return values
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .flatMap((value) => {
      if (value === "none") return ["noindex", "nofollow"];
      if (value === "all") return ["index", "follow"];
      return [value];
    });
}

export function parseRobotsDirectives(values = []) {
  const directives = [...new Set(tokenize(values))].sort();
  const index = directives.includes("noindex")
    ? "blocked"
    : directives.includes("index")
      ? "allowed"
      : "unspecified";
  const follow = directives.includes("nofollow")
    ? "blocked"
    : directives.includes("follow")
      ? "allowed"
      : "unspecified";

  return { directives, index, follow };
}

function applicableXRobotsTag(values, crawler) {
  const applicable = [];

  for (const value of values) {
    let scope = null;
    for (const part of String(value).split(",")) {
      const token = part.trim().toLowerCase();
      const scoped = token.match(/^([a-z][a-z0-9_-]*):\s*(.+)$/);
      if (scoped && !COLON_VALUE_DIRECTIVES.has(scoped[1])) {
        scope = scoped[1];
        if (scope === crawler) applicable.push(scoped[2]);
      } else if (scope === null || scope === crawler) {
        applicable.push(token);
      }
    }
  }

  return applicable;
}

function evaluateUnavailableAfter(directives, now) {
  const values = directives
    .filter((directive) => directive.startsWith("unavailable_after:"))
    .map((directive) => ({
      directive,
      value: directive.slice("unavailable_after:".length).trim(),
    }));
  if (values.length === 0) return { state: "absent", directives: [] };

  const nowMilliseconds = new Date(now).getTime();
  if (Number.isNaN(nowMilliseconds)) {
    throw new Error(`Invalid indexability evaluation clock: ${String(now)}`);
  }
  const parsed = values.map((entry) => ({
    ...entry,
    timestamp: Date.parse(entry.value),
  }));
  const invalid = parsed.filter((entry) => Number.isNaN(entry.timestamp));
  if (invalid.length > 0) {
    return {
      state: "invalid",
      directives: values.map((entry) => entry.directive),
      invalidValues: invalid.map((entry) => entry.value),
    };
  }

  const earliest = Math.min(...parsed.map((entry) => entry.timestamp));
  return {
    state: earliest <= nowMilliseconds ? "expired" : "future",
    directives: values.map((entry) => entry.directive),
    earliestExpiration: new Date(earliest).toISOString(),
    evaluatedAt: new Date(nowMilliseconds).toISOString(),
  };
}

export function evaluateIndexability({
  expectedPolicy,
  robots = [],
  googlebot = [],
  xRobotsTag = [],
  crawler = "googlebot",
  now = new Date(),
}) {
  const generic = parseRobotsDirectives([
    ...robots,
    ...applicableXRobotsTag(xRobotsTag, crawler),
  ]);
  const crawlerSpecific = parseRobotsDirectives(googlebot);
  const unavailableAfter = evaluateUnavailableAfter(
    [...generic.directives, ...crawlerSpecific.directives],
    now,
  );
  const directiveIndex =
    generic.index === "blocked" || crawlerSpecific.index === "blocked"
      ? "blocked"
      : generic.index === "allowed" || crawlerSpecific.index === "allowed"
        ? "allowed"
        : "unspecified";
  const effectiveIndex =
    directiveIndex === "blocked"
      ? "blocked"
      : unavailableAfter.state === "invalid"
        ? "indeterminate"
        : unavailableAfter.state === "expired"
          ? "blocked"
          : directiveIndex;
  const effectiveFollow =
    generic.follow === "blocked" || crawlerSpecific.follow === "blocked"
      ? "blocked"
      : generic.follow === "allowed" || crawlerSpecific.follow === "allowed"
        ? "allowed"
        : "unspecified";
  const effectiveResult =
    directiveIndex === "blocked"
      ? "blocked-by-noindex"
      : unavailableAfter.state === "invalid"
        ? "indeterminate-unavailable-after"
        : unavailableAfter.state === "expired"
          ? "blocked-by-unavailable-after"
          : "indexable-by-directives";
  const policyResult =
    unavailableAfter.state === "invalid"
      ? "defect"
      : expectedPolicy === "not-applicable"
      ? "not-applicable"
      : expectedPolicy === "noindex"
        ? effectiveIndex === "blocked"
          ? "compliant"
          : "defect"
        : effectiveIndex === "blocked" ||
            effectiveIndex === "indeterminate" ||
            effectiveFollow === "blocked"
          ? "defect"
          : "compliant";

  return {
    generic,
    crawlerSpecific,
    effectiveIndex,
    effectiveFollow,
    effectiveResult,
    policyResult,
    unavailableAfter,
  };
}

export function classifyIndexabilityPolicy({
  url,
  artifactPath = "",
  status,
}) {
  const normalizedArtifact = artifactPath.replaceAll("\\", "/");
  if (normalizedArtifact.endsWith("_global-error.html")) {
    return {
      classification: "non-routable-framework-artifact",
      expectedPolicy: "not-applicable",
      rationale: "Next.js internal error artifact is not a public route.",
    };
  }
  if (normalizedArtifact.endsWith("_not-found.html")) {
    return {
      classification: "framework-not-found",
      expectedPolicy: "noindex",
      rationale: "Next.js not-found output must remain excluded from indexing.",
    };
  }
  const firstSegment =
    url?.split("/").filter(Boolean)[0] ??
    normalizedArtifact.split("/").filter(Boolean)[0];
  if (HELD_PUBLIC_LOCALE_PREFIXES.has(firstSegment)) {
    return {
      classification: "held-locale-route",
      expectedPolicy: "noindex",
      rationale: "Held locale routes are not approved for publication or indexing.",
    };
  }
  if (UNSUPPORTED_PUBLIC_LOCALE_PREFIXES.has(firstSegment)) {
    return {
      classification: "unsupported-locale-route",
      expectedPolicy: "noindex",
      rationale: "Unsupported locale routes are not part of the approved public contract.",
    };
  }
  if (status === 404 || status === 410) {
    return {
      classification: "negative-http-route",
      expectedPolicy: "noindex",
      rationale: "A negative response must not be indexed.",
    };
  }
  if (url?.startsWith("/admin/")) {
    return {
      classification: "admin",
      expectedPolicy: "noindex",
      rationale: "Private administration surfaces are deliberately non-indexable.",
    };
  }
  if (url?.startsWith("/category/") || url?.startsWith("/tag/")) {
    return {
      classification: "public-archive",
      expectedPolicy: "index",
      rationale: "Existing public archives retain their current indexability policy.",
    };
  }
  if (url && TOOL_PATHS.has(url.replace(/^\/[a-z]{2}(?=\/)/, ""))) {
    return {
      classification: "public-tool",
      expectedPolicy: "index",
      rationale: "Existing public tools retain their current indexability policy.",
    };
  }
  return {
    classification: "public-page",
    expectedPolicy: "index",
    rationale: "Generated public content retains its current indexability policy.",
  };
}

export function assertRequiredHttpCoverage(records, requiredCategories) {
  const presentSet = new Set(records.map((record) => record.coverageCategory));
  const missing = requiredCategories.filter((category) => !presentSet.has(category));
  if (missing.length > 0) {
    throw new Error(`Missing required HTTP audit coverage: ${missing.join(", ")}`);
  }

  return {
    required: requiredCategories,
    present: requiredCategories.filter((category) => presentSet.has(category)),
  };
}

function countValues(records, key) {
  const counts = {};
  for (const record of records) {
    const value = record[key] ?? "null";
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function normalizedCounts(counts) {
  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated].sort();
}

export function assertGeneratedHtmlInventory(records, expected) {
  const issues = [];
  const artifactPaths = records.map((record) => record.artifactPath);
  const publicUrls = records
    .map((record) => record.url)
    .filter((value) => value !== null);
  const manifestRoutes = records.map((record) => record.manifestRoute);
  const duplicateArtifacts = duplicates(artifactPaths);
  const duplicateUrls = duplicates(publicUrls);

  if (records.length !== expected.total) {
    issues.push(
      `Expected ${expected.total} generated HTML artifacts, received ${records.length}.`,
    );
  }
  if (duplicateArtifacts.length > 0) {
    issues.push(`Duplicate artifact path: ${duplicateArtifacts.join(", ")}.`);
  }
  if (duplicateUrls.length > 0) {
    issues.push(`Duplicate public URL: ${duplicateUrls.join(", ")}.`);
  }

  const actualManifestRoutes = [...new Set(manifestRoutes)].sort();
  const expectedManifestRoutes = [...new Set(expected.manifestRoutes)].sort();
  if (JSON.stringify(actualManifestRoutes) !== JSON.stringify(expectedManifestRoutes)) {
    const missing = expectedManifestRoutes.filter(
      (route) => !actualManifestRoutes.includes(route),
    );
    const unexpected = actualManifestRoutes.filter(
      (route) => !expectedManifestRoutes.includes(route),
    );
    issues.push(
      `Prerender manifest mismatch; missing: ${missing.join(", ") || "none"}; unexpected: ${unexpected.join(", ") || "none"}.`,
    );
  }

  for (const [label, key, expectedCounts] of [
    ["locale", "locale", expected.localeCounts],
    ["classification", "classification", expected.classificationCounts],
    ["template", "template", expected.templateCounts],
  ]) {
    const actual = countValues(records, key);
    if (
      JSON.stringify(actual) !== JSON.stringify(normalizedCounts(expectedCounts))
    ) {
      issues.push(
        `${label} counts mismatch; expected ${JSON.stringify(normalizedCounts(expectedCounts))}, received ${JSON.stringify(actual)}.`,
      );
    }
  }

  const actualMarkers = records
    .map((record) => record.nonRoutableMarker)
    .filter(Boolean)
    .sort();
  const expectedMarkers = [...expected.nonRoutableMarkers].sort();
  if (JSON.stringify(actualMarkers) !== JSON.stringify(expectedMarkers)) {
    issues.push(
      `Non-routable marker mismatch; expected ${expectedMarkers.join(", ") || "none"}, received ${actualMarkers.join(", ") || "none"}.`,
    );
  }

  if (issues.length > 0) throw new Error(issues.join(" "));
  return {
    total: records.length,
    uniqueArtifactPaths: new Set(artifactPaths).size,
    uniquePublicUrls: new Set(publicUrls).size,
    uniqueManifestRoutes: new Set(manifestRoutes).size,
    manifestMatch: true,
    localeCounts: countValues(records, "locale"),
    classificationCounts: countValues(records, "classification"),
    templateCounts: countValues(records, "template"),
    nonRoutableMarkers: actualMarkers,
  };
}

export function evaluateHttpOutcome(observed, expected) {
  const issues = [];
  const redirected =
    (observed.status >= 300 && observed.status < 400) ||
    observed.finalUrl !== observed.requestedUrl;
  if (observed.status !== expected.initialStatus) {
    issues.push(
      `Expected initial status ${expected.initialStatus}, received ${observed.status}.`,
    );
  }
  if (observed.finalStatus !== expected.finalStatus) {
    issues.push(
      `Expected final status ${expected.finalStatus}, received ${observed.finalStatus}.`,
    );
  }
  if (expected.redirectExpectation === "none" && redirected) {
    issues.push("Unexpected redirect.");
  }
  if (expected.redirectExpectation === "required" && !redirected) {
    issues.push("Expected redirect did not occur.");
  }
  const finalPath = new URL(observed.finalUrl).pathname;
  if (finalPath !== expected.finalPath) {
    issues.push(
      `Expected final path ${expected.finalPath}, received ${finalPath}.`,
    );
  }
  return {
    result: issues.length === 0 ? "compliant" : "defect",
    redirected,
    issues,
  };
}

export function rawHeaderValues(rawHeaders, targetName) {
  const normalizedTarget = targetName.toLowerCase();
  const values = [];
  for (let index = 0; index < rawHeaders.length; index += 2) {
    if (String(rawHeaders[index]).toLowerCase() === normalizedTarget) {
      values.push(String(rawHeaders[index + 1] ?? ""));
    }
  }
  return values;
}
