import test from 'node:test';
import assert from 'node:assert/strict';
import { auditSchema } from './schema-audit.mjs';
const canonical = 'https://noeldcosta.com/es/example/';
const run = (data, body = '', raw = false) => auditSchema({ html: `<html lang="es"><head><link rel="canonical" href="${canonical}"></head><body><main>${body}</main><script type="application/ld+json">${raw ? data : JSON.stringify(data)}</script></body></html>`, locale: 'es' });
const graph = (...nodes) => ({ '@context': 'https://schema.org', '@graph': nodes });
const page = (extra = {}) => ({ '@type': 'Article', url: canonical, inLanguage: 'es', ...extra });
const codes = (result, field = 'observedDefects') => result.findings[field].map(f => f.code);
test('extracts only JSON-LD scripts, retains raw hashes and paths through arrays/graphs', () => {
  const result = run([graph(page({ author: { '@id': '#person' } })), { '@context': 'http://schema.org/', '@type': 'Person', '@id': '#person', name: 'Noel' }]);
  assert.equal(result.scripts.length, 1); assert.equal(result.nodes.length, 2); assert.equal(result.references.length, 1);
  assert.match(result.nodes[0].path, /\[0\]\["@graph"\]\[0\]/); assert.match(result.scripts[0].sha256, /^[a-f0-9]{64}$/);
  assert(!codes(result, 'recommendations').includes('article-author-recommended'));
});
test('invalid JSON and primitive/empty blocks are observed structures', () => {
  for (const value of ['{', 'null', '[]', '{}', '"text"', '']) assert(codes(run(value, '', true)).some(c => ['invalid-json', 'empty-or-primitive-schema-block'].includes(c)));
});
test('merges complementary and identical Person definitions but observes scalar conflicts', () => {
  const person = { '@type': 'Person', '@id': '#p', name: 'Noel' };
  const good = run(graph(person, person, { '@id': '#p', url: 'https://noeldcosta.com/' }, page({ author: { '@id': '#p' } })));
  assert(!codes(good).includes('identity-scalar-conflict')); assert(!codes(good, 'recommendations').includes('article-author-recommended'));
  assert(codes(run(graph(person, { ...person, name: 'Other' }))).includes('identity-scalar-conflict'));
});
test('primary page compares exact canonical and language; nested summaries/global identities exempt', () => {
  const result = run(graph(page({ url: canonical.slice(0, -1), inLanguage: 'en', hasPart: page({ url: 'https://noeldcosta.com/other/', inLanguage: 'en' }) }), { '@type': 'WebSite', '@id': 'https://noeldcosta.com/#website', url: 'https://noeldcosta.com/' }));
  assert.equal(codes(result).filter(c => c === 'primary-canonical-mismatch').length, 1);
  assert.equal(codes(result).filter(c => c === 'primary-language-mismatch').length, 1);
  assert.equal(result.nodes.filter(n => n.primary).length, 1);
});
test('date calendar and chronology checked, missing article fields recommended', () => {
  assert(codes(run(graph(page({ datePublished: '2026-02-30' })))).includes('article-date-invalid'));
  assert(codes(run(graph(page({ datePublished: '2026-03-01', dateModified: '2026-02-28' })))).includes('article-date-order'));
  assert(!codes(run(graph(page({ datePublished: '2024-02-29' })))).includes('article-date-invalid'));
  assert.equal(codes(run(graph(page()))).length, 0);
  assert(codes(run(graph(page()), undefined), 'recommendations').includes('article-author-recommended'));
});
test('breadcrumbs allow final omitted item and exempt parent URLs', () => {
  const crumb = items => graph({ '@type': 'BreadcrumbList', itemListElement: items });
  const first = { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://noeldcosta.com/' };
  assert.equal(codes(run(crumb([first, { '@type': 'ListItem', position: 2, name: 'Page' }]))).length, 0);
  assert(codes(run(crumb([{ ...first, position: 0 }]))).includes('breadcrumb-position'));
});
test('FAQ empty structure is observed and visible mismatch is manual only', () => {
  const faq = graph({ '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'Why?', acceptedAnswer: { '@type': 'Answer', text: 'Because.' } }] });
  assert(codes(run(faq, 'Other prose'), 'manualReview').includes('faq-visible-correspondence'));
  assert(!codes(run(faq, 'Why? Because.'), 'manualReview').includes('faq-visible-correspondence'));
  assert(codes(run(graph({ '@type': 'FAQPage', mainEntity: [] }))).includes('faq-empty-questions'));
});
test('unsupported contexts/keywords/types suppress automated semantics and retain extraction', () => {
  for (const extra of [{ '@context': { '@vocab': 'https://schema.org/' } }, { '@reverse': { mentions: {} } }, { '@type': 'Unimplemented' }]) {
    const result = run({ '@context': 'https://schema.org', ...page({ url: 'broken', inLanguage: 'en' }), ...extra });
    assert(result.findings.manualReview.length); assert.equal(codes(result).length, 0); assert.equal(result.scripts.length, 1);
  }
});
test('zero schema and unresolved local website are retained manual coverage', () => {
  const result = auditSchema({ html: '<html lang="en"><script type="text/javascript">{}</script></html>', locale: 'en' });
  assert.equal(result.scripts.length, 0); assert(codes(result, 'manualReview').includes('zero-schema-route'));
  assert(codes(run(graph(page({ isPartOf: { '@id': '#website' } }))), 'manualReview').includes('local-reference-unresolved'));
});
test('Book/Offer/Person/service claims and unimplemented types remain manual', () => {
  const result = run(graph(...['Book', 'Offer', 'Person', 'ProfessionalService', 'SoftwareApplication', 'Course'].map(type => ({ '@type': type }))));
  assert(codes(result, 'manualReview').includes('claims-human-verification'));
  assert(codes(result, 'manualReview').includes('professional-service-deprecated'));
  assert(codes(result, 'manualReview').includes('unsupported-type'));
});
test('known partial nested vocabulary does not suppress primary checks; page identity stub stays related', () => {
  const result = run(graph(page({ inLanguage: 'en', '@id': '#article', mainEntityOfPage: { '@type': 'WebPage', '@id': canonical }, speakable: { '@type': 'SpeakableSpecification' }, about: { '@type': 'Thing' } }), { '@type': 'Person', hasCredential: { '@type': 'EducationalOccupationalCredential', name: 'Credential claim' } }));
  assert(!result.semanticChecksSuppressed);
  assert(codes(result).includes('primary-language-mismatch'));
  assert(!codes(result).includes('primary-url-shape'));
  assert.equal(result.nodes.filter(node => node.primary).length, 1);
  assert(codes(result, 'manualReview').includes('type-partial-coverage'));
});
test('empty graph and primitive array entries remain observed structure findings', () => {
  for (const data of [[true], { '@context': 'https://schema.org', '@graph': [] }]) assert(codes(run(data)).includes('empty-or-primitive-schema-block'));
});
test('malformed type/context nodes stay unresolved and unknown type does not suppress known siblings', () => {
  const malformed = run({ '@context': 'https://schema.org', '@type': { value: 'Article' }, url: 'bad' });
  assert(codes(malformed, 'manualReview').includes('unsupported-type-shape'));
  const result = run(graph({ '@type': 'Unimplemented' }, page({ inLanguage: 'en' })));
  assert(codes(result).includes('primary-language-mismatch'));
  assert(codes(result, 'manualReview').includes('unsupported-type'));
});
test('ISO dates reject invalid time, offset, leap day and preserve valid fractional seconds', () => {
  for (const date of ['2025-02-29', '2026-01-02T24:00:00Z', '2026-01-02T10:60:00Z', '2026-01-02T10:00:00+25:00', 'yesterday']) assert(codes(run(graph(page({ datePublished: date })))).includes('article-date-invalid'));
  assert(!codes(run(graph(page({ datePublished: '2026-01-02T10:00:00.123+04:00' })))).includes('article-date-invalid'));
});
test('global/external refs do not imply dangling defect; primary URL HTTPS/host is a signal', () => {
  const result = run(graph(page({ url: 'http://example.org/es/example/', publisher: { '@id': 'https://noeldcosta.com/#org' }, author: { '@id': 'https://external.example/person' } })));
  assert(codes(result).includes('primary-url-origin'));
  assert(!codes(result, 'manualReview').includes('local-reference-unresolved'));
});
test('missing optional primary identifiers recommend review instead of observed defect', () => {
  const result = run(graph({ '@type': 'SoftwareApplication', name: 'Example' }));
  assert(codes(result, 'recommendations').includes('primary-url-recommended'));
  assert.equal(codes(result).length, 0);
});
test('mainEntityOfPage fragment identity with own context stays a stub and resolves against canonical', () => {
  const result = run(graph(page({ mainEntityOfPage: { '@context': 'https://schema.org', '@type': 'WebPage', '@id': '#page' } })));
  assert(!codes(result).includes('primary-url-shape'));
  assert(!codes(result).includes('primary-canonical-mismatch'));
  assert.equal(result.nodes.filter(node => node.primary).length, 1);
  assert(!codes(result, 'recommendations').includes('primary-language-recommended'));
});
test('nested typed identity stub own context does not create a second primary page', () => {
  const result = run(graph(page({ mainEntityOfPage: { '@context': 'http://schema.org/', '@type': 'WebPage', '@id': canonical } })));
  assert.equal(result.nodes.filter(node => node.primary).length, 1);
  assert(!codes(result, 'recommendations').includes('primary-language-recommended'));
});
test('JSON-LD null contribution does not erase a resolved author identity name', () => {
  const result = run(graph({ '@type': 'Person', '@id': '#p', name: 'Noel' }, { '@id': '#p', name: null }, page({ author: { '@id': '#p' } })));
  assert(!codes(result, 'recommendations').includes('article-author-recommended'));
  assert(!codes(result).includes('identity-scalar-conflict'));
});
test('equivalent relative and absolute identity identifiers merge without lexical conflict', () => {
  const result = run(graph({ '@type': 'Person', '@id': '#p', name: 'Noel' }, { '@id': `${canonical}#p`, url: 'https://noeldcosta.com/' }, page({ author: { '@id': '#p' } })));
  assert(!codes(result).includes('identity-scalar-conflict'));
  assert(!codes(result, 'recommendations').includes('article-author-recommended'));
});
