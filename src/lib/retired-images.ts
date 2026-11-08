/**
 * Hero images that are no longer shown on the page (Hallmark audit, 7 Nov 2026).
 *
 * Each one is a generated stock picture whose main subject is a screen,
 * tablet or print-out showing invented charts or dashboards (AGENTS.md rejects
 * fake dashboards), or a generated person, including generated scenes of Noel
 * (CLAUDE.md: real photos of Noel only, no generated people). The files and the `hero` frontmatter stay as they are, so
 * Open Graph images, structured data and the image sitemap do not change;
 * only the on-page hero and the archive thumbnails fall back to the image-free
 * layout. Remove a path from this list when its post gets a replacement image
 * (the four AI roadmap heroes were replaced on 8 Nov 2026, see
 * docs/claude/assets/hallmark-replacement-briefs.md).
 */
export const RETIRED_HEROES: ReadonlySet<string> = new Set([
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
  // Generated people (8 Nov 2026): CLAUDE.md allows real photos of Noel only
  // and no generated or stock people. Includes generated scenes of Noel and
  // one hero whose subject is kiosk screens.
  "/images/data-ai/databricks-vs-microsoft-fabric.webp",
  "/images/data-ai/snowflake-vs-databricks.webp",
  "/images/heroes/2025-the-year-sap-generative-ai-redefines-middle-east-careers.webp",
  "/images/heroes/adopt-my-requirements-gathering-template-7-hacks-to-follow.webp",
  "/images/heroes/best-erp-for-manufacturing.webp",
  "/images/heroes/best-erp-software-small-business-a-real-world-guide-for-2025.webp",
  "/images/heroes/citizen-engagement-with-sap-cx-public-sector.webp",
  "/images/heroes/erp-implementation-kpis-metrics.webp",
  "/images/heroes/erp-modernization-sap-servicenow.webp",
  "/images/heroes/how-to-create-an-sap-implementation-project-charter.webp",
  "/images/heroes/mastering-sap-implementation-a-step-by-step-guide-for-2025.webp",
  "/images/heroes/oracle-erp-vs-sap.webp",
  "/images/heroes/project-planning-and-control-get-sap-projects-back-on-track.webp",
  "/images/heroes/resource-allocation-planning-for-sap-projects.webp",
  "/images/heroes/sap-ariba-your-2025-guide-to-sourcing-supplier-management.webp",
  "/images/heroes/sap-conversational-ai-and-successfactors-for-hr-in-2025.webp",
  "/images/heroes/sap-implementation-public-sector-compliance.webp",
  "/images/heroes/sap-license-negotiation-10-key-points-to-consider-in-2024.webp",
  "/images/heroes/sap-training-strategies-for-employees-to-drive-adoption.webp",
  "/images/heroes/sap-vs-oracle-which-erp-is-better-for-your-business.webp",
  "/images/manufacturing/erp-for-defence-manufacturing.webp",
  "/images/migration/choose-s4hana-migration-partner.webp",
  "/images/migration/s4hana-migration-cost.webp",
  "/images/migration/sap-programme-recovery.webp",
  "/images/partners/how-to-choose-sap-implementation-partner.webp",
  "/images/partners/sap-partner-vs-independent-consultant.webp",
  "/images/testing/sap-testing-explained.webp",
  "/images/testing/sap-user-acceptance-testing.webp",
]);

/** True when a hero path should not be displayed (it is still used for metadata). */
export function isRetiredHero(src: string | undefined | null): boolean {
  return Boolean(src && RETIRED_HEROES.has(src));
}
