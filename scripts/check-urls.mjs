#!/usr/bin/env node
// Pre-launch URL verification. Fetches every URL in _docs/references/wordpress-urls.md
// against http://localhost:PORT and reports pass/fail.
//
// Pass = HTTP 200 AND response body has a non-fallback <title> AND body size > 30 KB
// (Next.js dev 404 pages are ~12 KB and have no <title>).

import fs from 'node:fs/promises';
import path from 'node:path';

const PORT = process.env.PORT || '3456';
const BASE = `http://localhost:${PORT}`;

const PAGES = [
  '/',
  '/write-for-us-lets-share-our-experiences/',
  '/privacy-policy-noeldcosta/',
  '/system-implementation-sap/',
  '/ai-insights-shiftgearx-noeldcosta/',
  '/contact-noel-erp-support/',
  '/sap-implementation/',
  '/erp-ai-services/',
  '/sap-erp-consultant-my-story-noel-dcosta/',
  '/all-our-partners/',
  '/consulting-career-guides/',
  '/sap-implementation/sap-for-aviation/',
  '/erp-for-small-business-ai-automation/',
  '/ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/',
  '/case-studies/',
  '/sap-implementation-cost-calculator/',
  '/sap-implementation/for-retail/',
  '/sap-implementation/for-manufacturing/',
  '/sap-job-description-generator/',
  '/sap-solution-builder/',
  '/sap-implementation/rise-with-sap/',
  '/free-data-migration-estimator-sap-oracle-microsoft/',
];

const POSTS = [
  '/2024-sap-timeline-planning-implementation-guide-essentials/',
  '/2025-the-year-sap-generative-ai-redefines-middle-east-careers/',
  '/5-best-crm-systems-for-sap-in-2024/',
  '/adopt-my-requirements-gathering-template-7-hacks-to-follow/',
  '/ai-governance-framework-guide-building-a-responsible-ai-plan/',
  '/ai-governance-in-sap-implementations-compliance-security/',
  '/ai-risk-management-framework-a-step-by-step-guide-for-2025/',
  '/best-erp-for-manufacturing/',
  '/best-erp-for-small-business-operations/',
  '/best-erp-software-small-business-a-real-world-guide-for-2025/',
  '/best-sap-articles-for-implementation-noel-dcosta/',
  '/best-sap-documentation-tools-2024-guide/',
  '/best-sap-implementation-strategies-to-avoid-costly-mistakes/',
  '/best-sap-implementation-templates-activate-2024/',
  '/best-sap-technical-change-management-tools-2025/',
  '/build-a-winning-sap-business-case-template-implementation-guide/',
  '/building-the-perfect-erp-implementation-team-in-2024/',
  '/case-study-finance-process-modernization/',
  '/change-management-plan-success/',
  '/citizen-engagement-with-sap-cx-public-sector/',
  '/create-and-manage-sap-universal-id-link-s-user-and-p-user-ids/',
  '/creating-an-effective-sap-project-steering-committee/',
  '/ecc-to-s4hana-migration/',
  '/erp-implementation-contract-negotiation-cost-review-cfo/',
  '/erp-implementation-kpis-metrics/',
  '/erp-modernization-2025-cloud-ai-clean-core/',
  '/erp-modernization-mistakes/',
  '/erp-modernization-sap-servicenow/',
  '/erp-recovery-fmcg-sap-analytics-cloud/',
  '/erp-system-selection-case-study-manufacturing/',
  '/essential-sap-implementation-team-roles/',
  '/how-to-avoid-scope-creep-in-an-sap-implementation/',
  '/how-to-create-an-sap-implementation-project-charter/',
  '/master-the-sap-btp-cockpit-simple-steps/',
  '/mastering-sap-implementation-a-step-by-step-guide-for-2025/',
  '/my-journey-with-customer-information-solutions-defense/',
  '/oracle-erp-vs-sap/',
  '/project-planning-and-control-get-sap-projects-back-on-track/',
  '/resource-allocation-planning-for-sap-projects/',
  '/sap-analytics-cloud/',
  '/sap-ariba-implementation-uae-public-sector/',
  '/sap-ariba-your-2025-guide-to-sourcing-supplier-management/',
  '/sap-bpc-features-deployment-best-practice-guide/',
  '/sap-btp-cockpit-issues/',
  '/sap-business-one-price-guide/',
  '/sap-clean-core-strategy-what-it-means-for-your-business/',
  '/sap-conversational-ai-and-successfactors-for-hr-in-2025/',
  '/sap-cpi/',
  '/sap-ecc-to-s4hana-migration-case-study/',
  '/sap-ehs-environmental-health-and-safety-management/',
  '/sap-enterprise-warehouse-management-sap-ewm-essentials/',
  '/sap-fico/',
  '/sap-implementation-cost-and-budget-breakdown/',
  '/sap-implementation-cost-breakdown-why-budgets-explode-50/',
  '/sap-implementation-public-sector-compliance/',
  '/sap-implementation-vs-rollout-differences-challenges-best-practices/',
  '/sap-integration-suite-delivery-delays/',
  '/sap-license-negotiation-10-key-points-to-consider-in-2024/',
  '/sap-manufacturing-industry-secrets/',
  '/sap-negotiation-advisors-reduce-cost/',
  '/sap-performance-testing-it-leaders/',
  '/sap-pp-production-planning/',
  '/sap-project-risk-assessment-matrix-and-mitigation-strategies/',
  '/sap-project-scope-template-management-and-control/',
  '/sap-quality-gates-implementation/',
  '/sap-sd-sales-and-distribution/',
  '/sap-stakeholder-management-strategy/',
  '/sap-testing-validation-tools-comparison/',
  '/sap-training-strategies-for-employees-to-drive-adoption/',
  '/sap-vs-oracle-which-erp-is-better-for-your-business/',
  '/simple-consulting-frameworks-explained/',
  '/start-your-sap-implementation-project-right/',
  '/structured-thinking-problem-solving/',
  '/the-50-billion-erp-failure-why-cfos-still-reach-for-excel-instead/',
  '/top-sap-implementation-partners-in-the-usa-2025-by-tier/',
  '/top-sap-project-tracking-tools-2025/',
  '/top-skills-engineers-need-to-succeed-in-consulting/',
  '/what-consultants-actually-do-beyond-using-buzzwords/',
  '/why-2025-trump-tariffs-mean-higher-prices-for-everyone/',
  '/why-erp-integration-with-salesforce-fails-and-how-to-fix-it/',
  '/why-sap-data-migration-fails-and-how-to-fix-it/',
  '/why-sap-integrated-business-planning-sap-ibp-matters/',
];

const CATEGORIES = [
  '/category/ai-governance/',
  '/category/erp-consulting-guide/',
  '/category/sap-case-studies/',
  '/category/sap-modules/',
];

const TAGS = [
  '/tag/sap-crisis-management/',
  '/tag/sap-erp-modernization/',
  '/tag/sap-implementation-strategies/',
  '/tag/sap-industry-topics/',
  '/tag/sap-planning-and-selection/',
  '/tag/sap-technical-decisions/',
];

const ALL = [
  ...PAGES.map(p => ({ section: 'pages', path: p })),
  ...POSTS.map(p => ({ section: 'posts', path: p })),
  ...CATEGORIES.map(p => ({ section: 'categories', path: p })),
  ...TAGS.map(p => ({ section: 'tags', path: p })),
];

async function check(url) {
  const start = Date.now();
  try {
    const res = await fetch(url, { redirect: 'manual', headers: { 'User-Agent': 'PreLaunchCheck/1.0' } });
    const elapsed = Date.now() - start;
    const text = await res.text();
    const titleMatch = text.match(/<title>([^<]*)<\/title>/);
    const title = titleMatch ? titleMatch[1].trim() : '';
    const hasHreflang = /rel=["']?alternate["']?[^>]*hreflang=/i.test(text);
    const hreflangCount = (text.match(/hreflang=/gi) || []).length;
    const langLinks = (text.match(/href=["']\/(es|ja|fr|ru|it|de|pt|el|ar|nl|zh-CN|zh-TW|ko|hr|hi|ka|ml|da|tl)\//g) || []).length;
    return {
      status: res.status,
      size: text.length,
      title,
      hreflangCount,
      langLinks,
      elapsedMs: elapsed,
    };
  } catch (err) {
    return { status: 0, size: 0, title: '', hreflangCount: 0, langLinks: 0, elapsedMs: Date.now() - start, error: String(err) };
  }
}

function classify(r) {
  if (r.status !== 200) return 'FAIL';
  // Next dev 404 page is ~12KB with no <title>. Real pages are >>30KB with a meaningful title.
  if (!r.title) return 'FAIL';
  if (r.size < 30000) return 'FAIL';
  return 'PASS';
}

async function main() {
  const results = [];
  let totalHreflang = 0;
  let totalLangLinks = 0;
  console.log(`Checking ${ALL.length} URLs against ${BASE}…`);

  // Small concurrency to avoid hammering the dev server
  const CONCURRENCY = 4;
  let idx = 0;
  async function worker() {
    while (idx < ALL.length) {
      const i = idx++;
      const { section, path: p } = ALL[i];
      const r = await check(BASE + p);
      const verdict = classify(r);
      totalHreflang += r.hreflangCount;
      totalLangLinks += r.langLinks;
      results.push({ section, path: p, ...r, verdict });
      process.stdout.write(`${verdict === 'PASS' ? '.' : 'X'}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log('');

  // Also check /sitemap.xml, /robots.txt
  console.log('Checking /sitemap.xml and /robots.txt…');
  const sitemapRes = await fetch(BASE + '/sitemap.xml', { headers: { 'User-Agent': 'PreLaunchCheck/1.0' } });
  const sitemapText = await sitemapRes.text();
  const robotsRes = await fetch(BASE + '/robots.txt', { headers: { 'User-Agent': 'PreLaunchCheck/1.0' } });
  const robotsText = await robotsRes.text();

  const sitemapUrls = Array.from(sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)).map(m => m[1]);
  const sitemapInfo = {
    status: sitemapRes.status,
    size: sitemapText.length,
    contentType: sitemapRes.headers.get('content-type') || '',
    urlCount: sitemapUrls.length,
    hasLangPrefixes: sitemapUrls.some(u => /\/(es|ja|fr|ru|it|de|pt|el|ar|nl|zh-CN|zh-TW|ko|hr|hi|ka|ml|da|tl)\//.test(u)),
    validXml: /<\?xml/.test(sitemapText) && /<urlset/.test(sitemapText),
    firstFew: sitemapUrls.slice(0, 5),
    urls: sitemapUrls,
  };
  const robotsInfo = {
    status: robotsRes.status,
    size: robotsText.length,
    contentType: robotsRes.headers.get('content-type') || '',
    body: robotsText,
  };

  const out = {
    base: BASE,
    timestamp: new Date().toISOString(),
    results,
    totalHreflang,
    totalLangLinks,
    sitemap: sitemapInfo,
    robots: robotsInfo,
  };

  const outPath = path.join('scripts', 'check-urls-output.json');
  await fs.writeFile(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log(`Wrote ${outPath}`);

  const fails = results.filter(r => r.verdict === 'FAIL');
  console.log(`\nSummary: ${results.length - fails.length} pass / ${fails.length} fail`);
  if (fails.length) {
    console.log('\nFailures:');
    for (const f of fails) {
      console.log(`  ${f.section.padEnd(11)} ${f.path}  status=${f.status} size=${f.size} title="${f.title.slice(0, 40)}"`);
    }
  }
  console.log(`\nTotal hreflang annotations across all pages: ${totalHreflang}`);
  console.log(`Total /{lang}/ links across all pages: ${totalLangLinks}`);
  console.log(`Sitemap: status=${sitemapInfo.status} urls=${sitemapInfo.urlCount} langPrefixes=${sitemapInfo.hasLangPrefixes} validXml=${sitemapInfo.validXml}`);
  console.log(`Robots:  status=${robotsInfo.status} size=${robotsInfo.size}`);
}

main().catch(err => { console.error(err); process.exit(1); });
