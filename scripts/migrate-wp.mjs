// WordPress XML -> MDX migration
// Usage: node scripts/migrate-wp.mjs <path-to-wp-export.xml>
// Output: content/posts/<slug>/en.mdx and content/pages/<slug>/en.mdx

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import TurndownService from 'turndown';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const xmlPath = process.argv[2] || 'C:/Users/noel_/Downloads/noeldcosta.WordPress.2026-04-19 (1).xml';
if (!existsSync(xmlPath)) {
  console.error(`XML not found: ${xmlPath}`);
  process.exit(1);
}

const xml = readFileSync(xmlPath, 'utf8');

// --- Tag-aware category remap ---
// Old WP categories are uneven. Remap to new 6-category taxonomy.
// The big 'sap-articles-archives' bucket gets split heuristically by slug/title keywords.
const EXPLICIT_CAT_MAP = {
  'sap-modules': 'platforms-modules',
  'sap-case-studies': 'case-studies',
  'erp-consulting-guide': 'consulting-career', // excluded from nav
  'ai-governance': 'ai-governance',
};

// Heuristic rules for sap-articles-archives (applied in order, first match wins)
const HEURISTICS = [
  { cat: 'agentic-ai', kw: ['generative-ai', 'conversational-ai', 'agentic', 'copilot', 'genai', 'llm'] },
  { cat: 'ai-governance', kw: ['ai-governance', 'ai-risk', 'responsible-ai'] },
  { cat: 'platforms-modules', kw: [
    'sap-pp', 'sap-sd', 'sap-fico', 'sap-mm', 'sap-ehs', 'sap-ewm', 'sap-ibp', 'sap-bpc',
    'sap-ariba', 'sap-cpi', 'sap-btp', 'sap-analytics-cloud', 'sap-integration-suite',
    'sap-business-one', 'sap-cx', 'successfactors', 'sap-universal-id'
  ]},
  { cat: 'erp-strategy', kw: [
    'vs-oracle', 'oracle-erp-vs', 'best-erp', 'erp-for-small', 'for-small-business',
    'clean-core', 'ecc-to-s4hana', 'ecc-to-s-4hana', 's4hana-migration', 'greenfield', 'brownfield',
    'license-negotiation', 'negotiation-advisors', 'contract-negotiation', 'contract-review',
    'tariffs', 'excel-instead', 'manufacturing-industry-secrets', 'data-migration',
    'modernization', 'erp-integration-with-salesforce'
  ]},
  // Everything else in sap-articles-archives -> erp-implementation
];

function chooseCategory(slug, wpCats) {
  // Consulting career stays excluded even if they appear elsewhere
  if (wpCats.includes('erp-consulting-guide')) return 'consulting-career';
  // Explicit mapping wins if not the big bucket
  for (const c of wpCats) {
    if (c !== 'sap-articles-archives' && EXPLICIT_CAT_MAP[c]) return EXPLICIT_CAT_MAP[c];
  }
  // Heuristics for the big bucket
  for (const { cat, kw } of HEURISTICS) {
    if (kw.some(k => slug.includes(k))) return cat;
  }
  // Default for sap-articles-archives remainder
  if (wpCats.includes('sap-articles-archives')) return 'erp-implementation';
  return 'erp-implementation';
}

// --- HTML -> Markdown ---
const td = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '_',
});
// Preserve iframes (embedded videos) as raw HTML
td.keep(['iframe', 'figure', 'figcaption']);
// Strip WordPress image caption shortcodes leftover
td.addRule('wp-caption', {
  filter: node => node.nodeName === 'DIV' && (node.className || '').includes('wp-caption'),
  replacement: (content) => '\n\n' + content.trim() + '\n\n',
});

// --- XML helpers ---
function extract(item, tag) {
  const cdata = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`).exec(item);
  if (cdata) return cdata[1];
  const plain = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(item);
  return plain ? plain[1] : '';
}

function extractAllCategories(item) {
  const re = /<category domain="category" nicename="([^"]+)"[^>]*>(?:<!\[CDATA\[([^\]]+)\]\]>)?<\/category>/g;
  const out = [];
  let m;
  while ((m = re.exec(item))) out.push(m[1]);
  return out;
}

function extractMeta(item, key) {
  const re = new RegExp(`<wp:meta_key><!\\[CDATA\\[${key}\\]\\]></wp:meta_key>\\s*<wp:meta_value><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></wp:meta_value>`);
  const m = re.exec(item);
  return m ? m[1] : '';
}

// --- Process items ---
const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
const report = { posts: [], pages: [], skipped: [], byCategory: {} };

// Build attachment lookup: wp:post_id -> url
const attachmentUrls = new Map();
for (const item of items) {
  const type = extract(item, 'wp:post_type');
  if (type !== 'attachment') continue;
  const id = extract(item, 'wp:post_id');
  const url = extract(item, 'wp:attachment_url');
  if (id && url) attachmentUrls.set(id, url);
}

function featuredImage(item) {
  const id = extractMeta(item, '_thumbnail_id');
  if (id && attachmentUrls.has(id)) return attachmentUrls.get(id);
  return '';
}

function escapeYaml(s) {
  if (!s) return '';
  return s.replace(/"/g, '\\"').replace(/\n/g, ' ').trim();
}

function processItem(item) {
  const type = extract(item, 'wp:post_type');
  const status = extract(item, 'wp:status');
  if (!['post','page'].includes(type) || status !== 'publish') return;

  const slug = extract(item, 'wp:post_name');
  if (!slug) return;
  const title = extract(item, 'title');
  const link = (/<link>([^<]*)<\/link>/.exec(item) || [])[1] || '';
  const pubDate = extract(item, 'wp:post_date');
  const modDate = extract(item, 'wp:post_modified');
  const excerpt = extract(item, 'excerpt:encoded');
  const contentHtml = extract(item, 'content:encoded');
  const author = extract(item, 'dc:creator');
  const wpCats = extractAllCategories(item);
  const tags = (item.match(/<category domain="post_tag" nicename="([^"]+)"/g) || [])
    .map(s => /nicename="([^"]+)"/.exec(s)[1]);

  const category = type === 'post' ? chooseCategory(slug, wpCats) : '';
  const hero = featuredImage(item);

  // Convert HTML to Markdown
  let markdown = '';
  try {
    markdown = td.turndown(contentHtml || '');
  } catch (e) {
    markdown = contentHtml || '';
    console.warn(`  turndown failed for ${slug}: ${e.message}`);
  }

  // Frontmatter
  const fm = [
    '---',
    `title: "${escapeYaml(title)}"`,
    `slug: "${slug}"`,
    `date: "${pubDate}"`,
    modDate && modDate !== pubDate ? `updated: "${modDate}"` : '',
    excerpt ? `excerpt: "${escapeYaml(excerpt)}"` : '',
    hero ? `hero: "${hero}"` : '',
    type === 'post' ? `category: "${category}"` : '',
    tags.length ? `tags: [${tags.map(t => `"${t}"`).join(', ')}]` : '',
    author ? `author: "${author}"` : '',
    `originalUrl: "${link}"`,
    type === 'post' && category === 'consulting-career' ? 'excludeFromNav: true' : '',
    '---',
    '',
  ].filter(Boolean).join('\n');

  const body = `${fm}\n${markdown}\n`;

  // Write file
  const subdir = type === 'post' ? 'posts' : 'pages';
  const dir = join(repoRoot, 'content', subdir, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'en.mdx'), body, 'utf8');

  const summary = { slug, title, category, type, link, wpCats: wpCats.join('|') };
  if (type === 'post') report.posts.push(summary);
  else report.pages.push(summary);

  if (type === 'post') {
    report.byCategory[category] = (report.byCategory[category] || 0) + 1;
  }
}

for (const item of items) processItem(item);

// Write migration report
const reportPath = join(repoRoot, 'content', 'migration-report.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

console.log(`\n✓ Migration complete`);
console.log(`  Posts: ${report.posts.length}`);
console.log(`  Pages: ${report.pages.length}`);
console.log(`\n  Posts by new category:`);
for (const [c, n] of Object.entries(report.byCategory).sort((a,b) => b[1]-a[1])) {
  console.log(`    ${c}: ${n}`);
}
console.log(`\n  Report: ${reportPath}`);
