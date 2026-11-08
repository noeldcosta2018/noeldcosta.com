/**
 * Hero images that are no longer shown on the page (Hallmark audit, 7 Nov 2026).
 *
 * Each one is a generated stock picture whose main subject is a screen,
 * tablet or print-out showing invented charts or dashboards. AGENTS.md rejects
 * fake dashboards, and a made-up chart next to an article about real numbers
 * undercuts it. The files and the `hero` frontmatter stay as they are, so
 * Open Graph images, structured data and the image sitemap do not change;
 * only the on-page hero and the archive thumbnails fall back to the image-free
 * layout. Remove a path from this list when its post gets a replacement image.
 */
export const RETIRED_HEROES: ReadonlySet<string> = new Set([
  "/images/ai-roadmap/ai-roadmap-banking.webp",
  "/images/ai-roadmap/ai-roadmap-financial-services.webp",
  "/images/ai-roadmap/ai-roadmap-manufacturing.webp",
  "/images/ai-roadmap/ai-roadmap-retail.webp",
  "/images/data-ai/databricks-genie-agent-bricks.webp",
  "/images/data-ai/databricks-pricing-explained.webp",
  "/images/data-ai/erp-data-into-snowflake.webp",
  "/images/data-ai/snowflake-pricing-credits-explained.webp",
  "/images/heroes/2024-sap-timeline-planning-implementation-guide-essentials.webp",
  "/images/heroes/5-best-crm-systems-for-sap-in-2024.webp",
  "/images/heroes/ai-governance-in-sap-implementations-compliance-security.webp",
  "/images/heroes/ai-risk-management-framework-a-step-by-step-guide-for-2025.webp",
  "/images/heroes/best-erp-for-small-business-operations.webp",
  "/images/heroes/best-sap-documentation-tools-2024-guide.webp",
  "/images/heroes/best-sap-technical-change-management-tools-2025.webp",
  "/images/heroes/build-a-winning-sap-business-case-template-implementation-guide.webp",
  "/images/heroes/case-study-finance-process-modernization.webp",
  "/images/heroes/create-and-manage-sap-universal-id-link-s-user-and-p-user-ids.webp",
  "/images/heroes/erp-modernization-2025-cloud-ai-clean-core.webp",
  "/images/heroes/erp-modernization-mistakes.webp",
  "/images/heroes/erp-recovery-fmcg-sap-analytics-cloud.webp",
  "/images/heroes/master-the-sap-btp-cockpit-simple-steps.webp",
  "/images/heroes/sap-analytics-cloud.webp",
  "/images/heroes/sap-ariba-implementation-uae-public-sector.webp",
  "/images/heroes/sap-bpc-features-deployment-best-practice-guide.webp",
  "/images/heroes/sap-btp-cockpit-issues.webp",
  "/images/heroes/sap-ecc-to-s4hana-migration-case-study.webp",
  "/images/heroes/sap-enterprise-warehouse-management-sap-ewm-essentials.webp",
  "/images/heroes/sap-fico.webp",
  "/images/heroes/sap-implementation-cost-and-budget-breakdown.webp",
  "/images/heroes/sap-implementation-cost-breakdown-why-budgets-explode-50.webp",
  "/images/heroes/sap-integration-suite-delivery-delays.webp",
  "/images/heroes/sap-performance-testing-it-leaders.webp",
  "/images/heroes/sap-project-risk-assessment-matrix-and-mitigation-strategies.webp",
  "/images/heroes/sap-quality-gates-implementation.webp",
  "/images/heroes/sap-sd-sales-and-distribution.webp",
  "/images/heroes/sap-testing-validation-tools-comparison.webp",
  "/images/heroes/the-50-billion-erp-failure-why-cfos-still-reach-for-excel-instead.webp",
  "/images/heroes/top-sap-project-tracking-tools-2025.webp",
  "/images/heroes/top-skills-engineers-need-to-succeed-in-consulting.webp",
  "/images/heroes/what-consultants-actually-do-beyond-using-buzzwords.webp",
  "/images/heroes/why-2025-trump-tariffs-mean-higher-prices-for-everyone.webp",
  "/images/heroes/why-erp-integration-with-salesforce-fails-and-how-to-fix-it.webp",
  "/images/heroes/why-sap-data-migration-fails-and-how-to-fix-it.webp",
  "/images/manufacturing/erp-and-mes-manufacturing.webp",
  "/images/manufacturing/manufacturing-erp-cost.webp",
  "/images/manufacturing/mrp-live-vs-pp-ds-vs-ibp.webp",
  "/images/migration/rise-with-sap-contract-pricing.webp",
  "/images/migration/s4hana-migration-cockpit-step-by-step.webp",
  "/images/migration/s4hana-migration-timeline-project-plan.webp",
  "/images/migration/sap-readiness-check-migration-assessment.webp",
  "/images/partners/change-sap-partner-mid-project.webp",
  "/images/partners/sap-partner-rfp.webp",
  "/images/seo-refresh/sap-business-one-price-guide.webp",
  "/images/seo-refresh/sap-cpi.webp",
  "/images/seo-refresh/sap-ibp.webp",
  "/images/seo-refresh/sap-pp-production-planning.webp",
  "/images/testing/s4hana-testing-strategy.webp",
  "/images/testing/sap-regression-testing.webp",
  "/images/testing/sap-test-automation-guide.webp",
  "/images/testing/sap-test-data-management.webp",
]);

/** True when a hero path should not be displayed (it is still used for metadata). */
export function isRetiredHero(src: string | undefined | null): boolean {
  return Boolean(src && RETIRED_HEROES.has(src));
}
