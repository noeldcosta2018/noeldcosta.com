// Console-only verification; historical audit evidence is never overwritten.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { auditImageAlternatives, reconcileImageRoutes } from "../src/lib/image-alt-audit.mjs";

const baseline = JSON.parse(readFileSync(process.argv[2] ?? "docs/codex/audit/phase-4e1-footer-baseline.json", "utf8"));
const hash = (value) => createHash("sha256").update(value).digest("hex");
const links = [
  ["https://www.linkedin.com/in/noeldcosta/", "Noel D'Costa on LinkedIn"],
  ["https://www.youtube.com/@NoelDCostaERPAI", "Noel D'Costa on YouTube"],
  ["mailto:solutions@noeldcosta.com", "Email Noel D'Costa"],
];
const manifest = JSON.parse(readFileSync(".next/prerender-manifest.json", "utf8"));
const { publicRoutes } = reconcileImageRoutes(manifest, {
  expectedCount: baseline.routeCount,
  knownTemplates: [...new Set(Object.values(manifest.routes).map((route) => route.srcRoute))],
});
assert.deepEqual(publicRoutes, Object.keys(baseline.routes), "Public route set/order changed");
const differences = [], locales = {};
let checkedLinks = 0, observedDefects = 0, graphics = 0;
for (const route of publicRoutes) {
  const html = readFileSync(path.join(".next/server/app", route === "/" ? "index.html" : `${route.slice(1)}.html`), "utf8");
  const $ = cheerio.load(html);
  assert.equal($("footer").length, 1, `${route}: footer count`);
  for (const [href, label] of links) {
    const anchor = $("footer a").filter((_, element) => $(element).attr("href") === href && $(element).find("svg").length > 0);
    assert.equal(anchor.length, 1, `${route}: unique social link ${href}`);
    assert.equal(anchor.attr("aria-label"), label, `${route}: missing/wrong accessible name for ${href}`);
    assert.equal(anchor.find("svg").length, 1, `${route}: SVG count`);
    assert.equal(anchor.find("svg").attr("aria-hidden"), "true", `${route}: decorative SVG exposed`);
    checkedLinks++;
  }
  const audit = auditImageAlternatives({ html });
  observedDefects += audit.observedDefects.length;
  graphics += audit.images.length;
  const jsonLdHash = hash(JSON.stringify($("script[type='application/ld+json']").toArray().map((element) => $(element).html())));
  // Strip only this batch's six attributes to compare with the original build.
  for (const [href] of links) {
    const anchor = $("footer a").filter((_, element) => $(element).attr("href") === href && $(element).find("svg").length > 0);
    anchor.removeAttr("aria-label").find("svg").removeAttr("aria-hidden");
  }
  $("script").remove();
  const current = { domHash: hash($.html()), footerHash: hash($("footer").toString()), headHash: hash($("head").toString()), jsonLdHash };
  for (const field of Object.keys(current)) if (current[field] !== baseline.routes[route][field]) differences.push({ route, field });
  const locale = route.split("/")[1];
  const key = ["de", "es", "fr", "hi", "it", "ja", "ko", "nl", "pt", "ru", "tr"].includes(locale) ? locale : "en";
  locales[key] = (locales[key] ?? 0) + 1;
}
const files = [];
function walk(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) walk(file);
    else if (item.isFile()) files.push(file.replaceAll("\\", "/"));
  }
}
for (const directory of ["src", "content", "public", "docs/codex/audit/phase-4e-image-inventory"]) walk(directory);
files.push("package.json", "package-lock.json", "docs/codex/audit/phase-4e-image-alt-audit.json");
const protectedFiles = files.filter((file) => file !== "src/components/Footer.tsx").sort();
const protectedDigest = createHash("sha256");
for (const file of protectedFiles) protectedDigest.update(file).update("\0").update(readFileSync(file)).update("\0");
const protectedHash = protectedDigest.digest("hex");
assert.equal(protectedFiles.length, baseline.protectedCount, "Protected file count changed");
assert.equal(protectedHash, baseline.protectedHash, "Protected sources/content/assets/historical audit changed");
const footerSource = readFileSync("src/components/Footer.tsx", "utf8");
const strippedSource = footerSource.replace(/\s+aria-label="(?:Noel D'Costa on LinkedIn|Noel D'Costa on YouTube|Email Noel D'Costa)"/gu, "").replace(/ aria-hidden="true"/gu, "").replaceAll("\r\n", "\n").trimEnd();
assert.equal(strippedSource, baseline.footerSourceNormalized, "Footer changed beyond six allowed attributes");
const report = {
  status: differences.length || observedDefects ? "fail" : "pass",
  baselineBuildId: baseline.buildId,
  buildId: readFileSync(".next/BUILD_ID", "utf8").trim(),
  routeCount: publicRoutes.length, locales, checkedLinks, graphics,
  historicalBeforeObservedDefects: 4371, beforeUnnamedFooterLinks: baseline.unnamedFooterLinks,
  afterObservedDefects: observedDefects,
  protectedCount: protectedFiles.length, protectedHash,
  footerSourceHash: hash(footerSource), normalizedFooterSourceUnchanged: true,
  comparison: "All non-script DOM/head/footer preserved after stripping six allowed attributes; JSON-LD separately compared. Executable scripts excluded because builds change RSC payload/build identifiers.",
  differences,
};
console.log(JSON.stringify(report, null, 2));
assert.equal(observedDefects, 0, "Image audit still reports observed defects");
assert.equal(differences.length, 0, "Generated markup/SEO evidence changed beyond scope");
