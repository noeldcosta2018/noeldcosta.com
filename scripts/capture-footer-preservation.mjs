// Generates new Phase 4E1 evidence only; never overwrites any artifact.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
import * as cheerio from "cheerio";
import { reconcileImageRoutes } from "../src/lib/image-alt-audit.mjs";

const stage = process.argv[2];
if (!["initial-after", "reconstructed-before", "final-after"].includes(stage)) throw new Error("Use an approved Phase 4E1 capture stage");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const manifest = JSON.parse(readFileSync(".next/prerender-manifest.json", "utf8"));
const { publicRoutes } = reconcileImageRoutes(manifest, { knownTemplates: [...new Set(Object.values(manifest.routes).map((route) => route.srcRoute))] });
const routes = {}, markup = {}, assets = {};
let unnamedFooterLinks = 0;
for (const route of publicRoutes) {
  const file = path.join(".next/server/app", route === "/" ? "index.html" : `${route.slice(1)}.html`);
  const $ = cheerio.load(readFileSync(file, "utf8"));
  unnamedFooterLinks += $("footer a").filter((_, element) => $(element).find("svg").length > 0 && !$(element).attr("aria-label") && !$(element).text().trim()).length;
  const jsonLd = $("script[type='application/ld+json']").toArray().map((element) => $(element).html());
  const resources = $("link[href],script[src]").toArray().map((element) => ({ tag: element.tagName, attributes: { ...element.attribs } }));
  for (const resource of resources) {
    const url = resource.attributes.href ?? resource.attributes.src;
    if (!url.startsWith("/_next/static/")) continue;
    const pathname = new URL(url, "https://local.invalid").pathname;
    if (assets[pathname]) continue;
    const bytes = readFileSync(path.join(".next", pathname.slice("/_next/".length)));
    assets[pathname] = { hash: hash(bytes), bytes: bytes.toString("base64") };
  }
  $("script").remove();
  const head = $("head").toString(), dom = $.html(), footer = $("footer").toString();
  routes[route] = { domHash: hash(dom), headHash: hash(head), footerHash: hash(footer), jsonLdHash: hash(JSON.stringify(jsonLd)) };
  markup[route] = { head, dom, jsonLd, resources };
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
const digest = createHash("sha256");
for (const file of protectedFiles) digest.update(file).update("\0").update(readFileSync(file)).update("\0");
const footerBytes = readFileSync("src/components/Footer.tsx");
const baseline = {
  stage, buildId: readFileSync(".next/BUILD_ID", "utf8").trim(), routeCount: publicRoutes.length,
  // Measured authored-name check, not a full accessibility audit.
  unnamedFooterLinks,
  protectedCount: protectedFiles.length, protectedHash: digest.digest("hex"),
  footerSourceHash: hash(footerBytes), footerSourceNormalized: footerBytes.toString("utf8").replaceAll("\r\n", "\n").trimEnd(), routes,
};
const directory = "docs/codex/audit/phase-4e1-preservation";
mkdirSync(directory, { recursive: true });
const evidence = gzipSync(JSON.stringify({ baseline, markup, assets }));
writeFileSync(`${directory}/${stage}.json.gz`, evidence, { flag: "wx" });
writeFileSync(`${directory}/${stage}-baseline.json`, JSON.stringify(baseline), { flag: "wx" });
console.log(JSON.stringify({ stage, buildId: baseline.buildId, routeCount: baseline.routeCount, assetCount: Object.keys(assets).length, compressedBytes: evidence.length, evidenceHash: hash(evidence), protectedHash: baseline.protectedHash, footerSourceHash: baseline.footerSourceHash }));
