import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditSchema, SCHEMA_POLICY, sha256 } from './lib/schema-audit.mjs';
import { IMAGE_PUBLISHED_LOCALES, imagePublicUrl, parseImageSource, protectedSourceFingerprint, reconcileImageRoutes } from '../src/lib/image-alt-audit.mjs';
const REPOSITORY_LOCALES = ['en', 'ar', 'de', 'es', 'fr', 'hi', 'it', 'ja', 'ko', 'nl', 'pt', 'ru', 'tr', 'zh'];
const CONTRACT = Object.freeze({ routeCount: 1457, locales: IMAGE_PUBLISHED_LOCALES,
  localeCounts: Object.fromEntries(IMAGE_PUBLISHED_LOCALES.map(locale => [locale, locale === 'en' ? 258 : 109])),
  routedSourceCount: 1393, allSourceCount: 1625,
  routedSourceFingerprint: 'sha256:86b26eb1d49ddabdd4fdd4a0924eb21631478dd4948a197be710942479ee817b',
  allSourceFingerprint: 'sha256:c1b0162d14cace592fd3057eb469e7baee61513b91b611534dcb2aa0eb5dbeac' });
const relative = (root, file) => path.relative(root, file).replaceAll('\\', '/');
const counts = records => ({ routeCount: records.length, scriptCount: records.reduce((sum, record) => sum + record.scripts.length, 0), nodeCount: records.reduce((sum, record) => sum + record.nodes.length, 0), referenceCount: records.reduce((sum, record) => sum + record.references.length, 0) });
async function templatesForAudit(root, freeze) {
  const templates = new Map();
  async function walk(directory, segments = []) {
    for (const item of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(directory, item.name);
      if (item.isDirectory()) await walk(file, item.name.startsWith('(') ? segments : [...segments, item.name]);
      else if (item.name === 'page.tsx') {
        const route = `/${segments.join('/')}`;
        if (templates.has(route)) throw new Error(`Duplicate route template evidence: ${route}`);
        const bytes = await freeze(file);
        templates.set(route, { path: relative(root, file), sha256: sha256(bytes) });
      }
    }
  }
  await walk(path.join(root, 'src/app'));
  return templates;
}
async function sourceInventory(root, contract, freeze) {
  const sources = [], all = [], routed = [];
  for (const kind of ['posts', 'pages']) {
    const directory = path.join(root, 'content', kind);
    for (const slug of (await readdir(directory, { withFileTypes: true })).filter(item => item.isDirectory()).map(item => item.name).sort()) {
      for (const locale of REPOSITORY_LOCALES) {
        const file = path.join(directory, slug, `${locale}.mdx`); // Never enumerate/open raw MDX.
        let bytes;
        try { bytes = await freeze(file); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
        const sourcePath = relative(root, file), entry = { path: sourcePath, bytes };
        all.push(entry);
        if (contract.locales.includes(locale)) {
          routed.push(entry);
          const parsed = parseImageSource({ raw: bytes.toString('utf8'), sourcePath });
          sources.push({ slug, locale, kind: kind === 'posts' ? 'post' : 'mdx-page', sourcePath, sha256: sha256(bytes), frontmatter: parsed.frontmatter });
        }
      }
    }
  }
  const routedFingerprint = protectedSourceFingerprint(routed), allFingerprint = protectedSourceFingerprint(all);
  if (all.length !== contract.allSourceCount || routed.length !== contract.routedSourceCount || routedFingerprint !== contract.routedSourceFingerprint || allFingerprint !== contract.allSourceFingerprint) throw new Error('Protected source corpus count/fingerprint differs from approved evidence.');
  return { sources, routedFingerprint, allFingerprint, routedSourceCount: routed.length, allSourceCount: all.length };
}
async function additionalCandidates(root, template, sources, freeze) {
  const raw = (await freeze(path.join(root, template.path))).toString('utf8'), result = [];
  if (raw.includes('ToolShell')) {
    const slug = /mdxSlug\s*=\s*["']([^"']+)["']/u.exec(raw)?.[1] ?? /const\s+SLUG\s*=\s*["']([^"']+)["']/u.exec(raw)?.[1];
    const source = sources.find(candidate => candidate.kind === 'mdx-page' && candidate.locale === 'en' && candidate.slug === slug);
    if (source) result.push({ ...source, confidence: 'candidate-only', basis: 'Literal ToolShell mdxSlug/SLUG plus loader getPage(resolvedMdxSlug, en)' });
    else result.push({ confidence: 'unresolved', basis: 'ToolShell source slug unavailable or protected MDX absent', slug: slug ?? null });
  }
  if (raw.includes('getAllBooks')) {
    for (const name of (await readdir(path.join(root, 'content/books'))).filter(name => name.endsWith('.mdx') && !name.endsWith('.raw.mdx')).sort()) {
      const file = path.join(root, 'content/books', name), bytes = await freeze(file), sourcePath = relative(root, file);
      result.push({ sourcePath, sha256: sha256(bytes), frontmatter: parseImageSource({ raw: bytes.toString('utf8'), sourcePath }).frontmatter, confidence: 'candidate-only', basis: 'getAllBooks filesystem loader; claim truth and individual schema ownership unverified' });
    }
  }
  return result;
}
function resolveSource({ route, locale, srcRoute, sources, localizedPages }) {
  if (srcRoute === '/') return { template: 'homepage', source: null };
  if (['/category/[category]', '/tag/[tag]'].includes(srcRoute)) return { template: srcRoute.includes('category') ? 'category-archive' : 'tag-archive', source: null };
  const candidates = sources.filter(source => source.locale === locale);
  if (srcRoute === '/about') {
    const source = candidates.find(source => source.kind === 'mdx-page' && source.slug === 'about');
    if (!source) throw new Error('Missing protected /about/ source.');
    return { template: 'dedicated-mdx-page', source };
  }
  if (!['/[...slug]', '/[locale]/[...slug]'].includes(srcRoute)) return { template: 'dedicated-static-or-tool', source: null };
  const segments = route.split('/').filter(Boolean);
  if (locale !== 'en') segments.shift();
  const slug = segments.at(-1), requested = imagePublicUrl(`/${segments.join('/')}`);
  if (locale === 'en' && segments.length === 1 && ['agentic-ai', 'ai-governance', 'erp-consulting-guide', 'erp-strategy', 'sap-case-studies', 'sap-modules', 'case-studies'].includes(slug)) return { template: 'archive-or-portfolio', source: null };
  const post = locale === 'en' || segments.length === 1 ? candidates.find(source => source.kind === 'post' && source.slug === slug) : null;
  if (post) return { template: 'post-or-case-study', source: post };
  let pageSlug = slug;
  if (locale !== 'en') {
    const matches = localizedPages.filter(item => item.kind === 'page' && imagePublicUrl(item.public_path) === requested);
    if (matches.length !== 1) throw new Error(`Missing/duplicate localized page route evidence: ${route}`);
    pageSlug = matches[0].slug;
  }
  const source = candidates.find(source => source.kind === 'mdx-page' && source.slug === pageSlug);
  if (!source) throw new Error(`Unmapped protected route evidence: ${route}`);
  return { template: 'mdx-page', source };
}
export async function verifySchemaShards({ root, shards, records, contract }) {
  const persisted = [];
  for (const shard of shards) {
    const bytes = await readFile(path.join(root, shard.path));
    if (bytes.length !== shard.byteLength || sha256(bytes) !== shard.sha256) throw new Error(`Corrupt schema shard hash/byte length: ${shard.path}`);
    const lines = bytes.toString('utf8').split('\n').filter(Boolean), parsed = lines.map(line => JSON.parse(line));
    if (parsed.some(record => record.locale !== shard.locale)) throw new Error('Corrupt shard locale evidence.');
    if (JSON.stringify(counts(parsed)) !== JSON.stringify(shard.totals)) throw new Error('Corrupt shard count evidence.');
    persisted.push(...parsed);
  }
  if (new Set(persisted.map(record => record.url)).size !== persisted.length) throw new Error('Duplicate persisted route evidence.');
  if (persisted.length !== contract.routeCount || JSON.stringify(counts(persisted)) !== JSON.stringify(counts(records))) throw new Error('Persisted inventory count mismatch.');
  const ordered = values => [...values].sort((a, b) => a.url.localeCompare(b.url));
  if (JSON.stringify(ordered(persisted)) !== JSON.stringify(ordered(records))) throw new Error('Persisted schema inventory differs from extraction.');
  for (const locale of contract.locales) if (persisted.filter(record => record.locale === locale).length !== contract.localeCounts[locale]) throw new Error(`Fixed locale route count mismatch: ${locale}`);
  return { ...counts(persisted), reparsedPersistedBytes: true, hashesVerified: true };
}
// Overrides are exclusively for small on-disk fixtures. CLI uses fixed CONTRACT.
export async function runSchemaAudit({ root = process.cwd(), contract = CONTRACT } = {}) {
  const frozen = new Map();
  const freeze = async file => { const bytes = await readFile(file); if (frozen.has(file) && !frozen.get(file).equals(bytes)) throw new Error(`Evidence changed during audit: ${relative(root, file)}`); frozen.set(file, bytes); return bytes; };
  const stable = async () => { for (const [file, bytes] of frozen) if (!(await readFile(file)).equals(bytes)) throw new Error(`Evidence changed during audit: ${relative(root, file)}`); };
  const nextRoot = path.join(root, '.next'), outputRoot = path.join(root, 'docs/codex/audit'), shardRoot = path.join(outputRoot, 'phase-4f-schema-inventory');
  const buildIdBytes = await freeze(path.join(nextRoot, 'BUILD_ID')), manifestBytes = await freeze(path.join(nextRoot, 'prerender-manifest.json'));
  if (!buildIdBytes.toString('utf8').trim()) throw new Error('Empty build ID evidence.');
  const manifest = JSON.parse(manifestBytes.toString('utf8')), templates = await templatesForAudit(root, freeze), source = await sourceInventory(root, contract, freeze);
  const routes = reconcileImageRoutes(manifest, { expectedCount: contract.routeCount, knownTemplates: [...templates.keys()] });
  let localizedPages = [];
  if (routes.publicRoutes.some(route => manifest.routes[route].srcRoute === '/[locale]/[...slug]')) localizedPages = JSON.parse((await freeze(path.join(root, 'docs/codex/locale-content-manifest.json'))).toString('utf8')).items;
  const records = [], artifactHash = createHash('sha256').update(buildIdBytes).update('\0').update(manifestBytes);
  for (const route of routes.publicRoutes) {
    const url = imagePublicUrl(route), first = route.split('/')[1];
    if (['ar', 'zh', 'zh-CN'].includes(first)) throw new Error(`Held locale entered schema audit: ${route}`);
    const locale = contract.locales.includes(first) && first !== 'en' ? first : 'en';
    const file = path.join(nextRoot, 'server/app', route === '/' ? 'index.html' : `${route.slice(1)}.html`), bytes = await freeze(file);
    artifactHash.update('\0').update(url).update('\0').update(bytes);
    const srcRoute = manifest.routes[route].srcRoute, mapping = resolveSource({ route: url, locale, srcRoute, sources: source.sources, localizedPages });
    const audit = auditSchema({ html: bytes.toString('utf8'), locale });
    if (audit.canonicalValues.length !== 1 || !audit.canonical) throw new Error(`Missing/duplicate canonical evidence: ${url}`);
    const additionalSourceCandidates = await additionalCandidates(root, templates.get(srcRoute), source.sources, freeze);
    records.push({ url, locale, template: mapping.template, artifactPath: relative(root, file), ...audit, htmlSha256: sha256(bytes), routeTemplateEvidence: templates.get(srcRoute), protectedSourceEvidence: mapping.source, additionalSourceCandidates,
      emitterProvenance: { confidence: 'candidate-only', note: 'Route template and protected MDX are source provenance; emitter ownership and source/schema equivalence not established.' } });
  }
  records.sort((a, b) => a.url.localeCompare(b.url));
  for (const locale of contract.locales) if (records.filter(record => record.locale === locale).length !== contract.localeCounts[locale]) throw new Error(`Fixed locale route count mismatch: ${locale}`);
  await stable();
  await mkdir(shardRoot, { recursive: true });
  const expectedFiles = contract.locales.map(locale => `${locale}.ndjson`);
  const unexpected = (await readdir(shardRoot)).filter(file => !expectedFiles.includes(file));
  if (unexpected.length) throw new Error(`Unexpected schema shard(s): ${unexpected.join(', ')}`);
  const shards = [];
  for (const locale of contract.locales) {
    const selected = records.filter(record => record.locale === locale), file = path.join(shardRoot, `${locale}.ndjson`);
    const bytes = Buffer.from(selected.map(record => JSON.stringify(record)).join('\n') + (selected.length ? '\n' : ''));
    await writeFile(file, bytes);
    shards.push({ locale, path: relative(root, file), totals: counts(selected), byteLength: bytes.length, sha256: sha256(bytes) });
  }
  const shardInventory = await verifySchemaShards({ root, shards, records, contract });
  await stable();
  const observedDefectCount = records.reduce((sum, record) => sum + record.findings.observedDefects.length, 0);
  const report = { schemaVersion: 1, policy: SCHEMA_POLICY,
    evidence: { buildId: buildIdBytes.toString('utf8').trim(), buildIdSha256: sha256(buildIdBytes), manifestSha256: sha256(manifestBytes), artifactFingerprint: `sha256:${artifactHash.digest('hex')}`, artifactFingerprintInputs: 'BUILD_ID, NUL, manifest, then NUL/public URL/NUL/exact HTML bytes in sorted reconciled public-route order',
      routedSourceFingerprint: source.routedFingerprint, protectedPublishableCorpusFingerprint: source.allFingerprint, routedSourceCount: source.routedSourceCount, allSourceCount: source.allSourceCount, rawMdxRead: false, publishedLocales: contract.locales, heldLocales: ['ar', 'zh'], stableExactBytesChecked: true, routeReconciliation: routes },
    status: { auditExecution: 'pass', evidenceIntegrity: 'pass', siteFindingVerdict: observedDefectCount ? 'observed-defects-present' : 'manual-review-required', ...counts(records), observedDefectCount }, shards, shardInventory,
    localeRollups: contract.locales.map(locale => ({ locale, ...counts(records.filter(record => record.locale === locale)) })),
    findingCounts: Object.fromEntries(['observedDefects', 'recommendations', 'manualReview', 'diagnostics'].map(field => [field, records.reduce((sum, record) => sum + record.findings[field].length, 0)])),
    routeRollups: records.map(record => ({ url: record.url, locale: record.locale, template: record.template, scriptCount: record.scripts.length, nodeCount: record.nodes.length, semanticChecksSuppressed: record.semanticChecksSuppressed, findingCounts: Object.fromEntries(Object.entries(record.findings).map(([field, values]) => [field, values.length])) })) };
  const reportFile = path.join(outputRoot, 'phase-4f-schema-audit.json'), reportBytes = Buffer.from(`${JSON.stringify(report, null, 2)}\n`);
  await writeFile(reportFile, reportBytes);
  if (!(await readFile(reportFile)).equals(reportBytes)) throw new Error('Corrupt summary persisted bytes.');
  await verifySchemaShards({ root, shards, records, contract });
  await stable();
  return report;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runSchemaAudit().then(report => console.log(JSON.stringify(report.status, null, 2))).catch(error => { console.error(JSON.stringify({ auditExecution: 'fail', evidenceIntegrity: 'fail', message: error.message })); process.exitCode = 1; });
