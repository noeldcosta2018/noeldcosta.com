import test from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
import { decodeArchiveEvidence, verifyArchiveRecords, verifyArchiveSource, extractArchiveMetadata } from './archive-schema-verification.mjs';

function fixture() {
  const before = { '/tag/example/': { archive: true, metadata: { links: [{ rel: 'canonical', href: 'https://noeldcosta.com/tag/example/' }], title: 'Example' }, bodyHash: 'unchanged', scriptHashes: ['before1', 'before2'], schemas: [{ '@type': 'CollectionPage', url: 'https://noeldcosta.com/tag/example', hasPart: [{ url: 'https://noeldcosta.com/article/' }] }, { '@type': 'BreadcrumbList', itemListElement: [{ position: 1, item: 'https://noeldcosta.com/' }, { position: 2, item: 'https://noeldcosta.com/tag/example' }] }], findings: [{}, {}] } };
  const after = structuredClone(before);
  after['/tag/example/'].schemas[0].url += '/';
  after['/tag/example/'].schemas[1].itemListElement[1].item += '/';
  after['/tag/example/'].findings = [];
  return { before, after };
}
const options = { routeCount: 1, changedFields: 2, remainingDefects: 0 };
test('accepts exactly the two allowed canonical-aligned URL fields', () => { const { before, after } = fixture(); assert.deepEqual(verifyArchiveRecords(before, after, options), ['/tag/example/']); });
for (const [name, mutate] of [
  ['wrong route', value => { value['/wrong/'] = value['/tag/example/']; delete value['/tag/example/']; }],
  ['missing route', value => { delete value['/tag/example/']; }],
  ['additional duplicate-equivalent route', value => { value['/tag/example'] = structuredClone(value['/tag/example/']); }],
  ['wrong breadcrumb position', value => { value['/tag/example/'].schemas[1].itemListElement[1].position = 1; }],
  ['changed hasPart', value => { value['/tag/example/'].schemas[0].hasPart[0].url = 'https://noeldcosta.com/wrong/'; }],
  ['altered metadata', value => { value['/tag/example/'].metadata.title = 'Changed'; }],
  ['altered body', value => { value['/tag/example/'].bodyHash = 'changed'; }],
]) test(`rejects ${name}`, () => { const { before, after } = fixture(); mutate(after); assert.throws(() => verifyArchiveRecords(before, after, options)); });
test('rejects corrupted compressed evidence and accepts original bytes', () => {
  const bytes = gzipSync(JSON.stringify(fixture()));
  const digest = createHash('sha256').update(bytes).digest('hex');
  assert.deepEqual(decodeArchiveEvidence(bytes, digest), fixture());
  const corrupt = Buffer.from(bytes); corrupt[10] ^= 1;
  assert.throws(() => decodeArchiveEvidence(corrupt, digest), /Evidence hash mismatch/);
});
test('source comparison permits only the declaration and its edited-line newline', () => {
  const original = Buffer.from('// preserve\r\nconst tagUrl = `${SITE_URL}/tag/${tag}`;\r\n// also preserve\r\n');
  const repaired = Buffer.from('// preserve\r\nconst tagUrl = `${SITE_URL}/tag/${tag}/`;\n// also preserve\r\n');
  assert.equal(verifyArchiveSource(original, repaired, 'TagPage.tsx').onlyExpectedReplacement, true);
  assert.throws(() => verifyArchiveSource(original, Buffer.from(repaired.toString().replace('// preserve\r\n', '// preserve\n')), 'TagPage.tsx'));
});
test('live parser attributes compare equally with persisted JSON without dropping values', () => {
  const $ = cheerio.load('<html lang="ja" dir="ltr"><head><title>日本語</title><meta name="description" content="具体的な内容"><link rel="canonical" href="https://noeldcosta.com/ja/example/"></head><body>本文</body></html>');
  const current = extractArchiveMetadata($);
  assert.deepEqual(current, JSON.parse(JSON.stringify(current)));
  assert.equal(current.html.lang, 'ja');
  assert.equal(current.meta[0].content, '具体的な内容');
  assert.equal(current.links[0].href, 'https://noeldcosta.com/ja/example/');
});
