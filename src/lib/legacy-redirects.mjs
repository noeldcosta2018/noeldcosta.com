// Old WordPress URLs that noeldcosta.com permanently redirects today (checked
// against the live site on 7 October 2026, see docs/claude/site-inventory.md).
// Recreated as permanent redirects on Noel's approval (7 October 2026). Each
// redirect also applies under every locale prefix whose target page has a
// translation, as the live site does (/de/old/ -> /de/new/).
//
// Plain JavaScript so next.config.ts and the sitemap can both import it.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/** from: old path, to: current path, target: the content folder behind `to`. */
export const LEGACY_REDIRECTS = [
  // Renamed posts
  { from: "master-the-sap-btp-cockpit-simple-steps-anyone-can-follow", to: "master-the-sap-btp-cockpit-simple-steps", target: "posts/master-the-sap-btp-cockpit-simple-steps" },
  { from: "a-practical-guide-to-ecc-to-s-4hana-migration-here-my-take", to: "ecc-to-s4hana-migration", target: "posts/ecc-to-s4hana-migration" },
  { from: "sap-sales-and-distribution-sd", to: "sap-sd-sales-and-distribution", target: "posts/sap-sd-sales-and-distribution" },
  { from: "success-factors-in-sap-project-planning-and-control", to: "project-planning-and-control-get-sap-projects-back-on-track", target: "posts/project-planning-and-control-get-sap-projects-back-on-track" },
  { from: "sap-btp-cockpit-frustrations-issues", to: "sap-btp-cockpit-issues", target: "posts/sap-btp-cockpit-issues" },
  { from: "sap-implementation-kpi-metrics", to: "erp-implementation-kpis-metrics", target: "posts/erp-implementation-kpis-metrics" },
  { from: "10-erp-modernization-mistakes-to-avoid-in-your-digital-strategy", to: "erp-modernization-mistakes", target: "posts/erp-modernization-mistakes" },
  { from: "start-your-sap-implementation-right", to: "start-your-sap-implementation-project-right", target: "posts/start-your-sap-implementation-project-right" },
  // Moved or merged pages
  { from: "sap-implementation-case-studies", to: "case-studies", target: "pages/case-studies" },
  { from: "sap-modules-functions-use-cases-and-integration", to: "sap-implementation/sap-modules", target: "pages/sap-modules" },
  { from: "contact", to: "contact-noel-erp-support", target: "pages/contact-noel-erp-support" },
  { from: "ai-governance-framework", to: "ai-governance-services", target: "pages/ai-governance-services" },
  { from: "ai-governance", to: "ai-governance-services", target: "pages/ai-governance-services" },
  { from: "sap-modules", to: "sap-implementation/sap-modules", target: "pages/sap-modules" },
  { from: "business-one", to: "sap-implementation/business-one", target: "pages/business-one" },
  { from: "for-manufacturing", to: "sap-implementation/for-manufacturing", target: "pages/for-manufacturing" },
  { from: "for-retail", to: "sap-implementation/for-retail", target: "pages/for-retail" },
  { from: "grow-with-sap", to: "sap-implementation/grow-with-sap", target: "pages/grow-with-sap" },
  { from: "rise-with-sap", to: "sap-implementation/rise-with-sap", target: "pages/rise-with-sap" },
  { from: "s4hana", to: "sap-implementation/s4hana", target: "pages/s4hana" },
  { from: "sap-for-aviation", to: "sap-implementation/sap-for-aviation", target: "pages/sap-for-aviation" },
  { from: "sap-integration-platforms", to: "sap-implementation/sap-integration-platforms", target: "pages/sap-integration-platforms" },
  { from: "erp-implementation-cost-calculator", to: "ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator", target: "pages/erp-implementation-cost-calculator" },
  // Short /about/ URL (English only) to the My story page it already named as
  // canonical; Google kept both indexed (Noel, 10 October 2026).
  { from: "about", to: "sap-erp-consultant-my-story-noel-dcosta", target: "pages/about" },
];

// Content locale file name to public URL prefix (Simplified Chinese lives in
// zh.mdx and is published under /zh-CN/).
const PREFIX = { zh: "zh-CN" };
const LOCALE_FILE = /^([a-z]{2}(?:-[A-Z]{2})?)\.mdx$/;

/** Public prefixes that have a translation of a content folder. */
function translatedPrefixes(root, target) {
  const dir = join(root, "content", target);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .map((f) => f.match(LOCALE_FILE)?.[1])
    .filter((l) => l && l !== "en")
    .map((l) => PREFIX[l] ?? l);
}

/** English source paths ("/contact/"), for the sitemap and link checks. */
export const LEGACY_REDIRECT_SOURCES = new Set(LEGACY_REDIRECTS.map((r) => `/${r.from}/`));

/**
 * Next.js redirect rules. Old multi-page WordPress posts (/slug/2/) go to the
 * single-page article, in English and under any two-letter or zh-XX prefix.
 */
export function legacyRedirectRules(root = process.cwd()) {
  const rules = [];
  for (const r of LEGACY_REDIRECTS) {
    rules.push({ source: `/${r.from}/`, destination: `/${r.to}/`, permanent: true });
    for (const prefix of translatedPrefixes(root, r.target)) {
      rules.push({ source: `/${prefix}/${r.from}/`, destination: `/${prefix}/${r.to}/`, permanent: true });
    }
  }
  rules.push(
    { source: "/:slug/:page([0-9]+)/", destination: "/:slug/", permanent: true },
    { source: "/:locale([a-z]{2}|zh-CN|zh-TW)/:slug/:page([0-9]+)/", destination: "/:locale/:slug/", permanent: true },
  );
  return rules;
}

/**
 * WordPress system addresses that outside sites, feed readers and search
 * engines still request (approved by Noel, 8 October 2026, for the move off
 * WordPress):
 * - media: /wp-content/uploads/... is mirrored at /images/wp/... (same paths;
 *   thumbnail sizes like name-300x200.webp go to the full-size file)
 * - per-page feeds (/slug/feed/, /category/x/feed/) go to the page itself;
 *   the site feed lives at /feed/ (src/app/feed/route.ts)
 * - Rank Math sitemaps that Search Console may still hold go to /sitemap.xml
 * - /ka/, /ml/, /da/ and /tl/ pages go to the English page (Noel, 8 Oct 2026)
 */
export function wordpressSystemRedirects() {
  const sitemaps = ["sitemap_index", "post-sitemap", "page-sitemap", "category-sitemap", "post_tag-sitemap", "author-sitemap"];
  return [
    // WordPress thumbnail sizes (name-300x200.webp) go to the full-size image.
    {
      source: "/wp-content/uploads/:year([0-9]{4})/:month([0-9]{2})/:base([^/]+?)-:size([0-9]+x[0-9]+).:ext(webp|png|jpg|jpeg|gif)",
      destination: "/images/wp/:year/:month/:base.:ext",
      permanent: true,
    },
    { source: "/wp-content/uploads/:path*", destination: "/images/wp/:path*", permanent: true },
    { source: "/:path+/feed/", destination: "/:path+/", permanent: true },
    // Languages the WordPress site machine-translated but the new site does not
    // publish (Georgian, Malayalam, Danish, Tagalog) go to the English page.
    { source: "/:lang(ka|ml|da|tl)/", destination: "/", permanent: true },
    { source: "/:lang(ka|ml|da|tl)/:path+/", destination: "/:path+/", permanent: true },
    ...sitemaps.map((name) => ({ source: `/${name}.xml`, destination: "/sitemap.xml", permanent: true })),
  ];
}
