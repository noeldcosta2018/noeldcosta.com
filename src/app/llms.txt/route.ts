import { CATEGORIES, getAllPosts, getPage } from "@/lib/content";
import { AUTHOR, SITE_URL } from "@/lib/seo";

/**
 * /llms.txt — proposed standard (jeremyhoward/llms-txt) for giving LLMs a
 * structured, navigable summary of the site. ChatGPT, Claude, and Perplexity
 * actively check for it; sites that publish llms.txt get more reliable
 * citations because the agent can find the right page in one fetch instead
 * of crawling the whole sitemap.
 *
 * Format spec: https://llmstxt.org/
 *   - First line: # H1 (site name)
 *   - Blockquote: short site summary
 *   - ## sections of links, where each link is "- [Title](url): Description"
 *   - Final ## Optional section is for content the LLM may skip
 *
 * Generated dynamically from the content catalogue so it stays current.
 */

export const dynamic = "force-static";

export async function GET() {
  const posts = getAllPosts("en");
  const aboutPage = getPage("about", "en");
  const aboutDesc =
    aboutPage?.frontmatter.excerpt ||
    aboutPage?.frontmatter.metaDescription ||
    "Background, credentials, and engagement model";

  // Group posts by category, take top ~10 per category by reading-time
  // proxy. Caps the file at a reasonable size — full archive lives in the
  // sitemap, which we link as Optional at the end.
  const byCategory: Record<string, typeof posts> = {};
  for (const p of posts) {
    const cat = p.frontmatter.category;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
  }

  const lines: string[] = [];
  lines.push(`# ${AUTHOR.name}`);
  lines.push("");
  lines.push(`> ${AUTHOR.description}`);
  lines.push("");

  // About / contact
  lines.push("## About");
  lines.push(`- [About ${AUTHOR.name}](${SITE_URL}/about): ${aboutDesc}`);
  lines.push(
    `- [Contact](${SITE_URL}/contact-noel-erp-support): Discovery call booking and ERP advisory enquiries`,
  );
  lines.push("");

  // Per-category top posts
  for (const [catSlug, catMeta] of Object.entries(CATEGORIES)) {
    const catPosts = byCategory[catSlug] || [];
    if (catPosts.length === 0) continue;
    lines.push(`## ${catMeta.label}`);
    lines.push(`> ${catMeta.description}`);
    lines.push("");
    const top = catPosts.slice(0, 12);
    for (const p of top) {
      const fm = p.frontmatter;
      const desc = fm.metaDescription || fm.excerpt || fm.title;
      const cleanDesc = desc.replace(/\s+/g, " ").trim().slice(0, 200);
      lines.push(
        `- [${fm.title}](${SITE_URL}/${fm.slug}): ${cleanDesc}`,
      );
    }
    lines.push("");
  }

  // Tools
  lines.push("## Tools");
  const tools = [
    {
      slug: "sap-implementation-cost-calculator",
      title: "SAP Implementation Cost Calculator",
      desc: "Estimate the all-in cost of an SAP S/4HANA programme by scope, modules, and entities",
    },
    {
      slug: "sap-job-description-generator",
      title: "SAP Job Description Generator",
      desc: "Generate role-specific SAP job descriptions for hiring and team scoping",
    },
    {
      slug: "free-data-migration-estimator-sap-oracle-microsoft",
      title: "Free Data Migration Estimator",
      desc: "Estimate effort and cost of ERP data migration across SAP, Oracle, and Microsoft platforms",
    },
    {
      slug: "sap-solution-builder",
      title: "SAP Solution Builder",
      desc: "Map business requirements to SAP modules and licensing",
    },
    {
      slug: "erp-implementation-cost-calculator",
      title: "ERP Implementation Cost Calculator",
      desc: "Top-down ERP cost estimator across vendor, geography, and complexity",
    },
  ];
  for (const t of tools) {
    lines.push(`- [${t.title}](${SITE_URL}/${t.slug}): ${t.desc}`);
  }
  lines.push("");

  // Optional — the sitemap covers the rest
  lines.push("## Optional");
  lines.push(
    `- [Full sitemap](${SITE_URL}/sitemap.xml): Complete archive of articles across all categories and locales`,
  );
  for (const [catSlug, catMeta] of Object.entries(CATEGORIES)) {
    lines.push(
      `- [${catMeta.label} archive](${SITE_URL}/category/${catSlug}): All articles in this category`,
    );
  }

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
