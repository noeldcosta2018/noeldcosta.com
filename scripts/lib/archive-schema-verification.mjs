import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

export function decodeArchiveEvidence(bytes, expectedHash) {
  assert.equal(createHash('sha256').update(bytes).digest('hex'), expectedHash, 'Evidence hash mismatch');
  return JSON.parse(gunzipSync(bytes));
}

export function extractArchiveMetadata($) {
  return {
    html: { ...$('html').attr() },
    title: $('title').text(),
    meta: $('meta').toArray().map(el => ({ ...el.attribs })),
    links: $('link[rel="canonical"],link[rel="alternate"]').toArray().map(el => ({ ...el.attribs })),
  };
}

export function verifyArchiveSource(beforeBytes, afterBytes, file) {
  const original = beforeBytes.toString('utf8');
  const oldLine = file.includes('Category') ? 'const categoryUrl = `${SITE_URL}/category/${meta.slug}`;' : 'const tagUrl = `${SITE_URL}/tag/${tag}`;';
  const newLine = file.includes('Category') ? 'const categoryUrl = `${SITE_URL}/category/${meta.slug}/`;' : 'const tagUrl = `${SITE_URL}/tag/${tag}/`;';
  assert.equal(original.split(oldLine).length, 2, 'Expected exactly one declaration');
  // apply_patch changed only the edited line's CRLF to LF. All other bytes remain exact.
  const expected = original.replace(oldLine, newLine).replace(`${newLine}\r\n`, `${newLine}\n`);
  assert.ok(afterBytes.equals(Buffer.from(expected)), `Unexpected component byte change: ${file}`);
  return { file, editedLineCrLfToLf: original.includes(`${oldLine}\r\n`), onlyExpectedReplacement: true };
}

export function verifyArchiveRecords(before, after, { routeCount = 1457, changedFields = 254, remainingDefects = 20 } = {}) {
  assert.equal(Object.keys(before).length, routeCount);
  assert.deepEqual(Object.keys(after).sort(), Object.keys(before).sort(), 'Route inventory changed');
  const affected = [];
  let fields = 0, defects = 0;
  for (const [url, current] of Object.entries(after)) {
    const previous = before[url];
    assert.deepEqual(current.metadata, previous.metadata, `Metadata changed: ${url}`);
    assert.equal(current.bodyHash, previous.bodyHash, `Visible markup changed: ${url}`);
    const expected = structuredClone(previous.schemas);
    if (previous.archive) {
      affected.push(url);
      let permitted = 0;
      const canonical = previous.metadata.links.find(link => link.rel === 'canonical').href;
      for (const schema of expected) {
        if (schema['@type'] === 'CollectionPage') { assert.equal(`${schema.url}/`, canonical); schema.url += '/'; permitted++; }
        if (schema['@type'] === 'BreadcrumbList') { const last = schema.itemListElement.at(-1); assert.equal(`${last.item}/`, canonical); last.item += '/'; permitted++; }
      }
      assert.equal(permitted, 2, `Unexpected archive schema: ${url}`);
      fields += permitted;
      assert.equal(current.findings.length, 0, `Archive findings remain: ${url}`);
    } else {
      assert.deepEqual(current.findings, previous.findings, `Unexpected finding change: ${url}`);
      assert.deepEqual(current.scriptHashes, previous.scriptHashes, `Unrelated raw script change: ${url}`);
    }
    assert.deepEqual(current.schemas, expected, `Unexpected JSON-LD change: ${url}`);
    defects += current.findings.length;
  }
  assert.equal(fields, changedFields);
  assert.equal(affected.length * 2, changedFields);
  assert.equal(defects, remainingDefects);
  return affected;
}
