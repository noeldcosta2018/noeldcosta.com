import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const SCHEMA_POLICY = Object.freeze({ version: 'phase-4f-bounded-v1',
  sources: ['https://schema.org/docs/datamodel.html', 'https://developers.google.com/search/docs/appearance/structured-data/article', 'https://developers.google.com/search/docs/appearance/structured-data/breadcrumb', 'https://developers.google.com/search/docs/appearance/structured-data/sd-policies', 'https://developers.google.com/search/updates', 'https://schema.org/ProfessionalService'],
  limits: ['Not a full Schema.org validator or JSON-LD processor', 'Not Google Rich Results Test or rich-result eligibility certification', 'No live WordPress parity, network context resolution, dynamic visibility, asset crawlability or claim fact verification', 'Source/emitter candidates are provenance, not proven schema ownership or source/schema equivalence'],
  faq: 'Google FAQ rich results removed May 7 2026; diagnostic only, no eligibility claim',
});
const primaryTypes = new Set(['Article', 'BlogPosting', 'TechArticle', 'WebPage', 'AboutPage', 'ContactPage', 'CollectionPage', 'FAQPage', 'SoftwareApplication']);
const articles = new Set(['Article', 'BlogPosting', 'TechArticle']);
const partialTypes = new Set(['EducationalOccupationalCredential', 'Blog', 'Thing', 'SpeakableSpecification']);
const supportedTypes = new Set([...primaryTypes, ...partialTypes, 'BreadcrumbList', 'ListItem', 'Question', 'Answer', 'Person', 'Organization', 'WebSite', 'ImageObject', 'Book', 'Offer', 'ProfessionalService']);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const list = value => value === undefined ? [] : Array.isArray(value) ? value : [value];
const text = value => typeof value === 'string' && value.trim().length > 0;
const normalize = value => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim().toLowerCase();
const typesOf = value => list(value?.['@type']).filter(type => typeof type === 'string');
function isoTime(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})?)?$/u.exec(value);
  if (!match) return null;
  const [, y, m, d, h, minute, second, zone] = match;
  const year = Number(y), month = Number(m), day = Number(d);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  if (month < 1 || month > 12 || day < 1 || day > [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] || Number(h ?? 0) > 23 || Number(minute ?? 0) > 59 || Number(second ?? 0) > 59) return null;
  if (zone && zone !== 'Z' && (Number(zone.slice(1, 3)) > 23 || Number(zone.slice(4)) > 59)) return null;
  const millis = Date.parse(h === undefined ? `${value}T00:00:00Z` : zone ? value : `${value}Z`);
  return Number.isFinite(millis) ? millis : null;
}
export function auditSchema({ html, locale }) {
  const $ = cheerio.load(html), findings = { observedDefects: [], recommendations: [], manualReview: [], diagnostics: [] };
  const canonicalValues = $('link[rel="canonical"]').map((_, element) => $(element).attr('href') ?? null).get();
  const canonical = canonicalValues.length === 1 ? canonicalValues[0] : null;
  const htmlLang = $('html').attr('lang') ?? null;
  const scripts = [], nodes = [], references = [], definitions = [], identities = new Map();
  const add = (field, code, evidence = {}) => findings[field].push({ code, ...evidence });
  const documentUrl = id => { try { const url = new URL(id, canonical ?? 'https://noeldcosta.com/'); url.hash = ''; return url.href; } catch { return null; } };
  const identity = id => { try { return new URL(id, canonical ?? 'https://noeldcosta.com/').href; } catch { return id; } };
  $('script').each((domIndex, element) => {
    if (($(element).attr('type') ?? '').trim().toLowerCase() !== 'application/ld+json') return;
    const rawText = $(element).text(), scriptIndex = scripts.length;
    const script = { scriptIndex, domIndex, rawText, sha256: sha256(rawText), parsed: null, parseError: null, unsupported: [] };
    scripts.push(script);
    try { script.parsed = JSON.parse(rawText); } catch (error) { script.parseError = error.message; add('observedDefects', 'invalid-json', { scriptIndex, path: '$', error: error.message }); return; }
    if (!object(script.parsed) && !Array.isArray(script.parsed) || Object.keys(script.parsed ?? {}).length === 0) add('observedDefects', 'empty-or-primitive-schema-block', { scriptIndex, path: '$' });
    function walk(value, jsonPath, context, topLevel, related = false) {
      if (Array.isArray(value)) {
        if (topLevel && !value.length) add('observedDefects', 'empty-or-primitive-schema-block', { scriptIndex, path: jsonPath });
        value.forEach((child, index) => walk(child, `${jsonPath}[${index}]`, context, topLevel, related)); return;
      }
      if (!object(value)) { if (topLevel) add('observedDefects', 'empty-or-primitive-schema-block', { scriptIndex, path: jsonPath }); return; }
      const ownContext = Object.hasOwn(value, '@context') ? value['@context'] : context;
      if (Object.hasOwn(value, '@context') && !(typeof ownContext === 'string' && /^https?:\/\/schema\.org\/?$/u.test(ownContext))) script.unsupported.push({ code: 'unsupported-context', path: jsonPath });
      for (const key of Object.keys(value)) if (key.startsWith('@') && !['@context', '@type', '@id', '@graph'].includes(key)) script.unsupported.push({ code: 'unsupported-jsonld-keyword', keyword: key, path: jsonPath });
      const types = typesOf(value);
      if (Object.hasOwn(value, '@type') && (!list(value['@type']).length || list(value['@type']).some(type => !text(type)))) script.unsupported.push({ code: 'unsupported-type-shape', path: jsonPath });
      if (types.length) {
        if (!(typeof ownContext === 'string' && /^https?:\/\/schema\.org\/?$/u.test(ownContext))) script.unsupported.push({ code: 'unsupported-effective-context', path: jsonPath });
        if (types.some(type => !supportedTypes.has(type))) script.unsupported.push({ code: 'unsupported-type', types, path: jsonPath });
        const primary = !related && types.some(type => primaryTypes.has(type)) && (topLevel || Object.keys(value).some(key => !['@id', '@type', '@context'].includes(key)) && documentUrl(value.url ?? value['@id']) === canonical);
        nodes.push({ scriptIndex, path: jsonPath, types, primary, relationship: related ? 'related' : primary ? 'primary' : 'other', value });
      }
      if (typeof value['@id'] === 'string') {
        const entry = { scriptIndex, path: jsonPath, id: value['@id'], resolvedId: identity(value['@id']), value };
        if (Object.keys(value).some(key => key !== '@id' && key !== '@context')) definitions.push(entry); else references.push(entry);
      }
      for (const [key, child] of Object.entries(value)) if (key !== '@context') walk(child, `${jsonPath}[${JSON.stringify(key)}]`, ownContext, key === '@graph' && topLevel, related || ['hasPart', 'mentions', 'author', 'publisher', 'image', 'itemListElement', 'offers', 'worksFor', 'hasCredential'].includes(key));
    }
    walk(script.parsed, '$', undefined, true);
    script.unsupported.forEach(finding => add('manualReview', finding.code, { scriptIndex, ...finding }));
  });
  // Unknown JSON-LD can affect resolution across scripts; suppress all automated
  // semantics for this page while retaining extraction and syntax findings.
  const safe = scripts.every(script => script.unsupported.every(feature => feature.code === 'unsupported-type'));
  if (safe) {
    for (const entry of definitions) {
      const previous = identities.get(entry.resolvedId);
      if (previous) for (const [key, value] of Object.entries(entry.value)) {
        if (key === '@context' || key === '@id') continue;
        if (Object.hasOwn(previous, key) && value !== null && previous[key] !== null && typeof value !== 'object' && typeof previous[key] !== 'object' && value !== previous[key]) add('observedDefects', 'identity-scalar-conflict', { scriptIndex: entry.scriptIndex, path: entry.path, id: entry.id, property: key, values: [previous[key], value], interpretation: 'observed inconsistency, not universal JSON-LD invalidity' });
      }
      // Null is an ignored contribution in the supported plain JSON-LD subset.
      // Retain it in raw extraction, but do not erase prior semantic values.
      const contributions = Object.fromEntries(Object.entries(entry.value).filter(([, value]) => value !== null));
      identities.set(entry.resolvedId, { ...previous, ...contributions });
    }
    for (const ref of references) if (!identities.has(ref.resolvedId) && (ref.id.startsWith('#') || documentUrl(ref.id) === canonical)) add('manualReview', 'local-reference-unresolved', { scriptIndex: ref.scriptIndex, path: ref.path, id: ref.id });
  }
  const resolve = value => object(value) && value['@id'] ? identities.get(identity(value['@id'])) ?? value : value;
  const compareUrl = (value, evidence) => {
    if (!value) return;
    let parsed;
    try { parsed = new URL(value); } catch { add('observedDefects', 'primary-url-shape', { ...evidence, value }); return; }
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'noeldcosta.com') add('observedDefects', 'primary-url-origin', { ...evidence, value });
    if (canonical && documentUrl(value) !== canonical) add('observedDefects', 'primary-canonical-mismatch', { ...evidence, value, canonical });
  };
  const visible = cheerio.load(html);
  visible('script,style,nav,footer,header,template,noscript,[hidden],[aria-hidden="true"]').remove();
  const bodyText = normalize(visible('main').length ? visible('main').text() : visible('body').text());
  const plainText = value => normalize(cheerio.load(String(value ?? '')).text());
  for (const node of nodes) {
    const value = resolve(node.value), evidence = { scriptIndex: node.scriptIndex, path: node.path, types: node.types };
    if (node.types.some(type => ['Person', 'Book', 'Offer', 'ProfessionalService', 'SoftwareApplication'].includes(type))) add('manualReview', 'claims-human-verification', { ...evidence, claims: value });
    if (node.types.includes('ProfessionalService')) add('manualReview', 'professional-service-deprecated', evidence);
    if (node.types.some(type => partialTypes.has(type))) add('manualReview', 'type-partial-coverage', evidence);
    if (!safe || node.types.some(type => !supportedTypes.has(type))) continue;
    if (node.primary) {
      if (['url', 'mainEntityOfPage', '@id'].every(property => value[property] === undefined)) add('recommendations', 'primary-url-recommended', evidence);
      for (const property of ['url', 'mainEntityOfPage', '@id']) {
        const candidate = value[property];
        const target = typeof candidate === 'string' ? candidate : candidate?.['@id'] ?? candidate?.url;
        const identifier = property === '@id' || property === 'mainEntityOfPage' && object(candidate) && typeof candidate['@id'] === 'string';
        if (property === 'mainEntityOfPage' && typeof candidate === 'string' && candidate.startsWith('#')) add('manualReview', 'main-entity-string-identifier-ambiguity', { ...evidence, property, value: candidate });
        else compareUrl(identifier && target ? identity(target) : target, { ...evidence, property });
      }
      if (value.inLanguage === undefined) add('recommendations', 'primary-language-recommended', evidence);
      else if (typeof value.inLanguage !== 'string') add('manualReview', 'language-shape-unsupported', evidence);
      else if (value.inLanguage !== htmlLang || value.inLanguage !== locale) add('observedDefects', 'primary-language-mismatch', { ...evidence, inLanguage: value.inLanguage, htmlLang, locale });
      if (node.types.some(type => articles.has(type))) {
        for (const property of ['datePublished', 'dateModified', 'image', 'headline', 'author']) {
          const field = value[property];
          const present = property === 'author' ? list(field).some(author => { const resolved = resolve(author); return text(resolved) || text(resolved?.name); }) : field !== undefined && field !== null && field !== '' && (!Array.isArray(field) || field.length > 0);
          if (!present) add('recommendations', `article-${property}-recommended`, evidence);
        }
        for (const property of ['datePublished', 'dateModified']) if (value[property] !== undefined && isoTime(value[property]) === null) add('observedDefects', 'article-date-invalid', { ...evidence, property, value: value[property] });
        const published = isoTime(value.datePublished), modified = isoTime(value.dateModified);
        if (published !== null && modified !== null && modified < published) add('observedDefects', 'article-date-order', evidence);
      }
    }
    if (node.types.includes('BreadcrumbList')) {
      const items = list(value.itemListElement).map(resolve);
      if (!items.length) add('observedDefects', 'breadcrumb-empty', evidence);
      items.forEach((item, index) => {
        if (!Number.isInteger(item?.position) || item.position !== index + 1) add('observedDefects', 'breadcrumb-position', { ...evidence, index });
        if (!text(item?.name)) add('observedDefects', 'breadcrumb-name', { ...evidence, index });
        const destination = typeof item?.item === 'string' ? item.item : item?.item?.['@id'] ?? item?.item?.url;
        if (!destination && index !== items.length - 1) add('observedDefects', 'breadcrumb-item-missing', { ...evidence, index });
        if (destination) { try { const url = new URL(destination); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); } catch { add('observedDefects', 'breadcrumb-url-shape', { ...evidence, index, destination }); }
          if (index === items.length - 1) compareUrl(destination, { ...evidence, property: 'final-breadcrumb-item' }); }
      });
    }
    if (node.types.includes('FAQPage')) {
      add('diagnostics', 'faq-rich-results-removed', { ...evidence, date: '2026-05-07' });
      const questions = list(value.mainEntity).map(resolve);
      if (!questions.length) add('observedDefects', 'faq-empty-questions', evidence);
      questions.forEach((question, index) => {
        const answers = list(question?.acceptedAnswer).map(resolve);
        if (!typesOf(question).includes('Question') || !text(question.name) || !answers.length || answers.some(answer => !typesOf(answer).includes('Answer') || !text(answer.text))) add('observedDefects', 'faq-question-answer-structure', { ...evidence, index });
        if (text(question?.name) && (!bodyText.includes(plainText(question.name)) || answers.some(answer => text(answer?.text) && !bodyText.includes(plainText(answer.text))))) add('manualReview', 'faq-visible-correspondence', { ...evidence, index, reason: 'Static text absence needs human review; visibility and rendering not proven.' });
      });
    }
    if (['WebSite', 'Organization', 'ImageObject', 'ListItem', 'Question', 'Answer'].some(type => node.types.includes(type))) add('manualReview', 'type-partial-coverage', evidence);
  }
  if (!scripts.length) add('manualReview', 'zero-schema-route');
  return { htmlSha256: sha256(html), canonical, canonicalValues, htmlLang, robots: $('meta[name="robots"]').map((_, element) => $(element).attr('content')).get(), scripts, nodes, references, definitions, semanticChecksSuppressed: !safe, findings };
}
