import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import * as cheerio from 'cheerio';
import { reconcileImageRoutes } from '../src/lib/image-alt-audit.mjs';
import { auditSchema } from './lib/schema-audit.mjs';
import { decodeArchiveEvidence, verifyArchiveRecords, verifyArchiveSource, extractArchiveMetadata } from './lib/archive-schema-verification.mjs';

const stage = process.argv[2];
assert.ok(['before', 'after'].includes(stage), 'Use before or after');
const output = 'docs/codex/audit/phase-4g-archive-schema';
const targets = ['src/components/CategoryPage.tsx', 'src/components/TagPage.tsx'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = file => readFileSync(file);
const build = read('.next/BUILD_ID');
const manifestBytes = read('.next/prerender-manifest.json');
const manifest = JSON.parse(manifestBytes);
const { publicRoutes } = reconcileImageRoutes(manifest, { knownTemplates: [...new Set(Object.values(manifest.routes).map(route => route.srcRoute))] });
assert.equal(publicRoutes.length, 1457);

const files = [];
function walk(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name).replaceAll('\\', '/');
    if (item.isDirectory()) walk(file);
    else if (item.isFile()) files.push(file);
  }
}
for (const directory of ['src', 'content', 'public', 'docs/codex/audit/phase-4f-schema-inventory']) walk(directory);
files.push('package.json', 'package-lock.json', 'next.config.ts');
for (const item of readdirSync('docs/codex/audit')) if (item.startsWith('phase-4f-') && !item.includes('schema-inventory')) files.push(`docs/codex/audit/${item}`);
const protectedFiles = files.filter(file => !targets.includes(file)).sort();
const protectedDigest = createHash('sha256');
for (const file of protectedFiles) protectedDigest.update(file).update('\0').update(read(file)).update('\0');
const protectedHash = protectedDigest.digest('hex');

const historical = [];
for (const file of readdirSync('docs/codex/audit/phase-4f-schema-inventory')) historical.push(...read(`docs/codex/audit/phase-4f-schema-inventory/${file}`).toString().trim().split('\n').filter(Boolean).map(JSON.parse));
const historicalMap = new Map(historical.map(route => [route.url, route]));
const records = {};
let defects = 0;
for (const route of publicRoutes) {
  const url = route === '/' ? '/' : `${route.replace(/\/$/, '')}/`;
  const bytes = read(path.join('.next/server/app', route === '/' ? 'index.html' : `${route.slice(1)}.html`));
  const original = historicalMap.get(url);
  assert.ok(original, `Unrecognized historical route ${url}`);
  if (stage === 'before') assert.equal(hash(bytes), original.htmlSha256, `Historical HTML changed: ${url}`);
  const $ = cheerio.load(bytes.toString());
  const rawScripts = $('script[type="application/ld+json"]').toArray().map(el => $(el).html());
  const schemas = rawScripts.map(raw => JSON.parse(raw));
  const metadata = extractArchiveMetadata($);
  $('script').remove();
  const audit = auditSchema({ html: bytes.toString(), locale: original.locale });
  defects += audit.findings.observedDefects.length;
  records[url] = { htmlHash: hash(bytes), scriptHashes: rawScripts.map(hash), bodyHash: hash($('body').html()), metadata, schemas, findings: audit.findings.observedDefects, archive: ['category-archive', 'tag-archive', 'archive-or-portfolio'].includes(original.template) && original.findings.observedDefects.length > 0 };
}
assert.equal(read('.next/BUILD_ID').toString(), build.toString(), 'Build changed during capture');
assert.ok(read('.next/prerender-manifest.json').equals(manifestBytes), 'Manifest changed during capture');
const capture = { stage, buildId: build.toString().trim(), manifestHash: hash(manifestBytes), protectedCount: protectedFiles.length, protectedHash, source: Object.fromEntries(targets.map(file => [file, read(file).toString('base64')])), defects, records };
let affectedRoutes = [];
if (stage === 'before') {
  assert.equal(defects, 274);
  assert.equal(Object.values(records).filter(route => route.archive).length, 127);
} else {
  const baselineSummary = JSON.parse(read(`${output}/before-summary.json`));
  const baseline = decodeArchiveEvidence(read(`${output}/before.json.gz`), baselineSummary.evidenceHash);
  assert.equal(protectedHash, baseline.protectedHash, 'Protected files changed');
  assert.equal(protectedFiles.length, baseline.protectedCount);
  affectedRoutes = verifyArchiveRecords(baseline.records, records);
  assert.equal(defects, 20);
  for (const file of targets) {
    verifyArchiveSource(Buffer.from(baseline.source[file], 'base64'), read(file), file);
  }
}
mkdirSync(output, { recursive: true });
const compressed = gzipSync(JSON.stringify(capture));
writeFileSync(`${output}/${stage}.json.gz`, compressed, { flag: 'wx' });
const summary = { stage, buildId: capture.buildId, routeCount: publicRoutes.length, protectedCount: capture.protectedCount, protectedHash, evidenceHash: hash(compressed), evidenceBytes: compressed.length, defects, affectedRoutes, removedFindings: stage === 'after' ? 254 : 0, metadataAndBodyUnchanged: stage === 'after', onlyExpectedSchemaFieldsChanged: stage === 'after' };
writeFileSync(`${output}/${stage}-summary.json`, `${JSON.stringify(summary, null, 2)}\n`, { flag: 'wx' });
console.log(JSON.stringify({ ...summary, affectedRoutes: affectedRoutes.length }));
