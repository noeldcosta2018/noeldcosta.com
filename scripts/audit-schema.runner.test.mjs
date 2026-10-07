import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runSchemaAudit, verifySchemaShards } from './audit-schema.mjs';
import { protectedSourceFingerprint } from '../src/lib/image-alt-audit.mjs';
const emptyFingerprint = protectedSourceFingerprint([]);
async function fixture(t, routes = { '/': { srcRoute: '/' } }) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'schema-audit-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const directory of ['.next/server/app', 'src/app', 'content/posts', 'content/pages']) await mkdir(path.join(root, directory), { recursive: true });
  await writeFile(path.join(root, 'src/app/page.tsx'), 'export default function Page() {}');
  await writeFile(path.join(root, '.next/BUILD_ID'), 'fixture-build');
  const manifest = { routes: { ...Object.fromEntries(['/favicon.ico', '/llms.txt', '/robots.txt', '/sitemap.xml'].map(route => [route, {}])), ...routes } };
  await writeFile(path.join(root, '.next/prerender-manifest.json'), JSON.stringify(manifest));
  await writeFile(path.join(root, '.next/server/app/index.html'), '<html lang="en"><head><link rel="canonical" href="https://noeldcosta.com/"></head><body>Home</body></html>');
  const contract = { routeCount: Object.keys(routes).length, locales: ['en'], localeCounts: { en: Object.keys(routes).length }, routedSourceCount: 0, allSourceCount: 0, routedSourceFingerprint: emptyFingerprint, allSourceFingerprint: emptyFingerprint };
  return { root, contract };
}
test('runner persists deterministic zero-schema records and verifies persisted counts/hashes', async t => {
  const options = await fixture(t), first = await runSchemaAudit(options), second = await runSchemaAudit(options);
  assert.equal(first.status.auditExecution, 'pass'); assert.deepEqual(first, second);
  assert.equal(first.status.routeCount, 1); assert.equal(first.status.scriptCount, 0);
  const shard = first.shards[0], file = path.join(options.root, shard.path);
  const record = JSON.parse((await readFile(file, 'utf8')).trim());
  assert.equal(record.url, '/'); assert(record.routeTemplateEvidence.sha256);
  await writeFile(file, '{}\n');
  await assert.rejects(verifySchemaShards({ root: options.root, shards: first.shards, records: [record], contract: options.contract }), /corrupt|hash|byte|count/i);
});
test('runner rejects missing HTML and unmapped template evidence', async t => {
  const options = await fixture(t, { '/missing': { srcRoute: '/' } });
  await assert.rejects(runSchemaAudit(options), /ENOENT/);
  const unmapped = await fixture(t, { '/': { srcRoute: '/unknown' } });
  await assert.rejects(runSchemaAudit(unmapped), /Unmapped/);
});
test('runner rejects duplicate route URL, held locales and unexpected shards', async t => {
  const duplicate = await fixture(t, { '/example': { srcRoute: '/' }, '/example/': { srcRoute: '/' } });
  await assert.rejects(runSchemaAudit(duplicate), /Duplicate/);
  const held = await fixture(t, { '/ar/example': { srcRoute: '/' } });
  await assert.rejects(runSchemaAudit(held), /Held locale/);
  const extra = await fixture(t);
  await mkdir(path.join(extra.root, 'docs/codex/audit/phase-4f-schema-inventory'), { recursive: true });
  await writeFile(path.join(extra.root, 'docs/codex/audit/phase-4f-schema-inventory/extra.ndjson'), '');
  await assert.rejects(runSchemaAudit(extra), /Unexpected/);
});
test('runner maps dedicated ToolShell candidate MDX provenance and guards source hashes', async t => {
  const options = await fixture(t, { '/': { srcRoute: '/' } });
  await writeFile(path.join(options.root, 'src/app/page.tsx'), 'const SLUG = "example"; export default function Page() { return <ToolShell slug={SLUG}/>; }');
  await mkdir(path.join(options.root, 'content/pages/example'), { recursive: true });
  const bytes = Buffer.from('---\ntitle: Example\ndate: 2026-01-02\n---\nProse');
  await writeFile(path.join(options.root, 'content/pages/example/en.mdx'), bytes);
  const fingerprint = protectedSourceFingerprint([{ path: 'content/pages/example/en.mdx', bytes }]);
  options.contract = { ...options.contract, allSourceCount: 1, routedSourceCount: 1, allSourceFingerprint: fingerprint, routedSourceFingerprint: fingerprint };
  const report = await runSchemaAudit(options);
  const record = JSON.parse((await readFile(path.join(options.root, report.shards[0].path), 'utf8')).trim());
  assert.equal(record.additionalSourceCandidates[0].sourcePath, 'content/pages/example/en.mdx');
  assert.equal(record.additionalSourceCandidates[0].frontmatter.title, 'Example');
  await writeFile(path.join(options.root, 'content/pages/example/en.mdx'), 'changed');
  await assert.rejects(runSchemaAudit(options), /source corpus/);
});
