import { getAllPageSlugs, getPage } from "./content";
import { publicPathFromOriginalUrl } from "./locale-url";

/**
 * WordPress URL prefixes that have nested English pages, e.g.
 * /sap-implementation/s4hana/ and
 * /ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/.
 * Each prefix has its own route folder under src/app/(site)/ so a
 * two-segment English path is not claimed by /[locale]/[...slug].
 */
export const NESTED_PREFIXES = new Set<string>([
  "sap-implementation",
  "ai-insights-shiftgearx-noeldcosta",
]);

/** Remaining segments of every English page published under `prefix`. */
export function nestedParams(prefix: string): { slug: string[] }[] {
  const out: { slug: string[] }[] = [];
  for (const slug of getAllPageSlugs()) {
    const page = getPage(slug, "en");
    if (!page || page.isFallback) continue;
    const segments = publicPathFromOriginalUrl(page.frontmatter.originalUrl, slug)
      .split("/")
      .filter(Boolean);
    if (segments.length > 1 && segments[0] === prefix) out.push({ slug: segments.slice(1) });
  }
  return out;
}
