import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import * as cheerio from 'cheerio';
import matter from 'gray-matter';
import { extractArchiveMetadata } from './lib/archive-schema-verification.mjs';

const root = 'docs/codex/audit/phase-5b-sitemap';
const read = file => readFileSync(file);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const decode = (file, summary) => {
  const bytes = read(file);
  assert.equal(hash(bytes), JSON.parse(read(summary)).evidenceHash);
  return JSON.parse(gunzipSync(bytes));
};
const before = decode(`${root}/before.json.gz`, `${root}/before-summary.json`);
const old = decode('docs/codex/audit/phase-4g-archive-schema/after.json.gz', 'docs/codex/audit/phase-4g-archive-schema/after-summary.json');
const manifestBytes = read('.next/prerender-manifest.json');
assert.deepEqual(Object.keys(JSON.parse(manifestBytes).routes).sort(), before.manifestRoutes);
for (const [file, expected] of Object.entries(before.protectedFiles)) assert.equal(hash(read(file)), expected, `Protected file changed: ${file}`);
for (const name of ['robots.txt', 'llms.txt']) assert.equal(read(`.next/server/app/${name}.body`).toString('base64'), before.surfaces[name]);

const xml = read('.next/server/app/sitemap.xml.body');
const $ = cheerio.load(xml, { xmlMode: true });
assert.equal($('urlset').length, 1);
assert.equal($('urlset').attr('xmlns'), 'http://www.sitemaps.org/schemas/sitemap/0.9');
assert.ok(xml.length < 50 * 1024 * 1024);
const entries = $('url').toArray().map(el => {
  const node = $(el);
  assert.equal(node.children('loc').length, 1);
  return { url: node.children('loc').text(), markup: node.html(), date: node.children('lastmod').text() || undefined, images: node.find('image\\:loc').toArray().map(e => $(e).text()) };
});
assert.equal(entries.length, 1439);
assert.equal(new Set(entries.map(e => e.url)).size, entries.length);
assert.equal($('xhtml\\:link').length, 0);
const oldXml = cheerio.load(Buffer.from(before.surfaces['sitemap.xml'], 'base64').toString(), { xmlMode: true });
const canonical = record => record.metadata.links.find(l => l.rel === 'canonical')?.href;
const english = oldXml('url').toArray().map(el => ({url: oldXml(el).children('loc').text(), markup: oldXml(el).html()})).filter(e => canonical(old.records[new URL(e.url).pathname]) === e.url);
assert.equal(english.length, 240);
const locales = ['de','es','fr','hi','it','ja','ko','nl','pt','ru','tr'];
const translated = Object.entries(old.records).filter(([path, record]) => locales.includes(path.split('/')[1]) && canonical(record) === `https://noeldcosta.com${path}`);
assert.equal(translated.length, 1199);
assert.deepEqual(entries.map(e => e.url).sort(), [...english.map(e => e.url), ...translated.map(([path]) => `https://noeldcosta.com${path}`)].sort());
const inventory = JSON.parse(read('docs/codex/locale-content-manifest.json')).items;
const counts = {};
for (const entry of entries) {
  const url = new URL(entry.url);
  assert.equal(url.origin, 'https://noeldcosta.com');
  assert.ok(url.pathname.endsWith('/'));
  const record = old.records[url.pathname];
  assert.equal(canonical(record), entry.url);
  const restrictions = record.metadata.meta.filter(m => ['robots','googlebot'].includes(m.name?.toLowerCase())).map(m => m.content || '').join(',');
  assert.ok(!/\bnoindex\b|\bnone\b/.test(restrictions), `Excluded directives: ${entry.url}`);
  const locale = locales.includes(url.pathname.split('/')[1]) ? url.pathname.split('/')[1] : 'en';
  counts[locale] = (counts[locale] || 0) + 1;
  if (locale === 'en') { assert.equal(entry.markup, english.find(e => e.url === entry.url).markup); continue; }
  const path = url.pathname.slice(locale.length+2);
  const item = inventory.find(i => i.public_path === path && i.available_locales.includes(locale));
  assert.ok(item, `Not manifest-backed: ${entry.url}`);
  const fm = matter(read(`content/${item.kind === 'post' ? 'posts' : 'pages'}/${item.slug}/${locale}.mdx`).toString()).data;
  assert.notEqual(fm.noindex, true);
  const date = item.kind === 'post' ? fm.lastReviewed || fm.updated || fm.date : fm.updated || fm.date;
  const input = date ? String(date).trim() : '';
  const parsed = input ? new Date(input.includes('T') ? input : input.replace(' ', 'T')) : null;
  const expectedDate = parsed && Number.isFinite(parsed.getTime()) ? parsed.toISOString() : undefined;
  assert.equal(entry.date, expectedDate, `Locale date changed: ${entry.url}`);
  assert.deepEqual(entry.images, fm.hero ? [fm.hero.startsWith('http') ? fm.hero : `https://noeldcosta.com${fm.hero}`] : []);
}
assert.equal(counts.en, 240);
for (const locale of locales) assert.equal(counts[locale], 109);

const htmlHashes = {};
for (const [path, original] of Object.entries(old.records)) {
  const file = `.next/server/app/${path === '/' ? 'index.html' : path.slice(1,-1)+'.html'}`;
  const bytes = read(file);
  const page = cheerio.load(bytes.toString());
  assert.deepEqual(extractArchiveMetadata(page), original.metadata, `Metadata: ${path}`);
  const raw = page('script[type="application/ld+json"]').toArray().map(el => page(el).html());
  assert.deepEqual(raw.map(hash), original.scriptHashes, `Raw schema: ${path}`);
  assert.deepEqual(raw.map(JSON.parse), original.schemas, `Schema: ${path}`);
  page('script').remove();
  assert.equal(hash(page('body').html()), original.bodyHash, `Body: ${path}`);
  htmlHashes[path] = hash(bytes);
}
assert.ok(read('.next/prerender-manifest.json').equals(manifestBytes));
const result = {buildId: read('.next/BUILD_ID').toString().trim(), previousBuildId: before.buildId, entries: entries.length, bytes: xml.length, sha256: hash(xml), counts, protectedFiles: Object.keys(before.protectedFiles).length, publicRoutesVerified: Object.keys(htmlHashes).length, englishMetadataPreserved: true, localeSourceProvenance: true, robotsAndLlmsUnchanged: true, htmlHashes};
writeFileSync(`${root}/after.json`, JSON.stringify(result,null,2), {flag:'wx'});
console.log(JSON.stringify({...result,htmlHashes:undefined}));
