// Single publication rule for translated variants of manifest items.
// Localized route params, the sitemap and the hreflang graph all go through
// isTranslatableManifestItem (plus the published-locale list in
// locale-url.ts), so a translated URL is either in all three or in none.

export interface LocaleContentManifestItem {
  kind: string;
  slug: string;
  public_path: string;
  available_locales: readonly string[];
}

// Pages whose English URL is a dedicated interactive tool route. Their
// translated MDX is not routed: the localized tool routes serve them instead.
// (The S/4HANA migration assessment is a plain MDX page, so its translations
// are routed like any other page.)
const DEDICATED_TOOL_PAGE_SLUGS = new Set([
  "erp-implementation-cost-calculator",
  "free-data-migration-estimator-sap-oracle-microsoft",
  "sap-implementation-cost-calculator",
  "sap-job-description-generator",
  "sap-solution-builder",
]);

export function isTranslatableManifestItem(
  item: LocaleContentManifestItem,
): boolean {
  if (item.public_path.trim().length === 0) return false;
  if (item.kind === "post") return true;
  return (
    item.kind === "page" &&
    // /about/ keeps its pre-existing first-party canonical to the WordPress
    // story page and is not part of the language graph.
    item.slug !== "about" &&
    !DEDICATED_TOOL_PAGE_SLUGS.has(item.slug)
  );
}
