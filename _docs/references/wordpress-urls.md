# WordPress URLs (migration target)

Source. Yoast XML sitemap plus Google Search Console performance data (last 16 months).

The Next.js site must serve content at every one of these URLs. Same path. Same trailing slash. Same case. No language prefix on the Next.js side (GTranslate handles that externally).

## Critical context

Search Console data shows **64.5% of all clicks come from non-English URLs** that GTranslate serves. The top 50 unique URLs (counting all language versions together) account for **89.3% of total traffic**.

Translated URLs follow this pattern. `https://noeldcosta.com/{lang}/{english-slug}/`. Examples:

- `/es/sap-business-one-price-guide/` (Spanish)
- `/ja/master-the-sap-btp-cockpit-simple-steps/` (Japanese)
- `/de/create-and-manage-sap-universal-id-link-s-user-and-p-user-ids/` (German)

These translated URLs are served by GTranslate's proxy. The Next.js site only needs to serve the English version at the canonical path. GTranslate handles the rest.

## Languages with indexed traffic

Search Console confirms 20 languages have indexed URLs with traffic:

| Language code | Language | Clicks | Notes |
|---|---|---|---|
| ja | Japanese | 4,408 | Highest non-English traffic |
| es | Spanish | 3,919 | |
| fr | French | 3,016 | |
| ru | Russian | 2,396 | |
| it | Italian | 2,215 | |
| de | German | 1,991 | |
| pt | Portuguese | 1,605 | |
| el | Greek | 1,143 | Not in default GTranslate language pack |
| ar | Arabic | 962 | |
| nl | Dutch | 831 | |
| zh-CN | Chinese Simplified | 578 | |
| zh-TW | Chinese Traditional | 303 | |
| ko | Korean | 135 | |
| hr | Croatian | 43 | |
| hi | Hindi | 23 | |
| ka | Georgian | 12 | |
| ml | Malayalam | 11 | |
| da | Danish | 2 | |
| tl | Tagalog | 2 | |

Confirm against GTranslate dashboard settings during phase 3. The currently-enabled languages should match this list.

## Pages from Yoast page-sitemap.xml

| URL | WordPress lastmod |
|-----|-------------------|
| / | 2026-01-21 |
| /write-for-us-lets-share-our-experiences/ | 2025-04-22 |
| /privacy-policy-noeldcosta/ | 2025-04-22 |
| /system-implementation-sap/ | 2025-04-24 |
| /ai-insights-shiftgearx-noeldcosta/ | 2025-05-21 |
| /contact-noel-erp-support/ | 2025-06-24 |
| /sap-implementation/ | 2025-06-30 |
| /erp-ai-services/ | 2025-07-05 |
| /sap-erp-consultant-my-story-noel-dcosta/ | 2025-07-11 |
| /all-our-partners/ | 2025-07-15 |
| /consulting-career-guides/ | 2025-07-25 |
| /sap-implementation/sap-for-aviation/ | 2025-07-25 |
| /erp-for-small-business-ai-automation/ | 2025-08-24 |
| /ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/ | 2025-09-14 |
| /case-studies/ | 2025-10-16 |
| /sap-implementation-cost-calculator/ | 2025-10-16 |
| /sap-implementation/for-retail/ | 2025-10-16 |
| /sap-implementation/for-manufacturing/ | 2025-10-16 |
| /sap-job-description-generator/ | 2025-10-16 |
| /sap-solution-builder/ | 2025-10-16 |
| /sap-implementation/rise-with-sap/ | 2025-10-16 |
| /free-data-migration-estimator-sap-oracle-microsoft/ | 2025-10-16 |

## Top 50 priority URLs by traffic (89.3% of all clicks)

Sorted by combined clicks across all language versions. The top of this list is where any URL break would be catastrophic.

| # | URL path | Clicks | Lang versions |
|---|----------|--------|---------------|
| 1 | /create-and-manage-sap-universal-id-link-s-user-and-p-user-ids/ | 3,438 | 14 |
| 2 | /sap-implementation-cost-and-budget-breakdown/ | 2,349 | 12 |
| 3 | /best-sap-implementation-templates-activate-2024/ | 1,894 | 12 |
| 4 | /sap-business-one-price-guide/ | 1,705 | 15 |
| 5 | /sap-pp-production-planning/ | 1,536 | 12 |
| 6 | /master-the-sap-btp-cockpit-simple-steps/ | 1,452 | 13 |
| 7 | /mastering-sap-implementation-a-step-by-step-guide-for-2025/ | 1,331 | 17 |
| 8 | /sap-vs-oracle-which-erp-is-better-for-your-business/ | 1,299 | 14 |
| 9 | /2024-sap-timeline-planning-implementation-guide-essentials/ | 1,148 | 10 |
| 10 | /sap-clean-core-strategy-what-it-means-for-your-business/ | 992 | 11 |
| 11 | /sap-implementation-cost-breakdown-why-budgets-explode-50/ | 926 | 12 |
| 12 | /sap-fico/ | 914 | 13 |
| 13 | /sap-implementation-cost-calculator/ | 638 | 12 |
| 14 | /why-sap-data-migration-fails-and-how-to-fix-it/ | 588 | 10 |
| 15 | /ecc-to-s4hana-migration/ | 567 | 13 |
| 16 | /sap-cpi/ | 554 | 11 |
| 17 | /sap-btp-cockpit-issues/ | 541 | 11 |
| 18 | /sap-license-negotiation-10-key-points-to-consider-in-2024/ | 523 | 12 |
| 19 | /start-your-sap-implementation-project-right/ | 507 | 9 |
| 20 | /erp-implementation-kpis-metrics/ | 465 | 14 |
| 21 | /adopt-my-requirements-gathering-template-7-hacks-to-follow/ | 453 | 10 |
| 22 | /sap-sd-sales-and-distribution/ | 418 | 11 |
| 23 | /sap-implementation/sap-modules/ | 418 | 14 |
| 24 | /sap-implementation-vs-rollout-differences-challenges-best-practices/ | 401 | 9 |
| 25 | /ai-risk-management-framework-a-step-by-step-guide-for-2025/ | 398 | 14 |
| 26 | /best-erp-for-manufacturing/ | 394 | 10 |
| 27 | /essential-sap-implementation-team-roles/ | 384 | 11 |
| 28 | /sap-analytics-cloud/ | 369 | 9 |
| 29 | /sap-training-strategies-for-employees-to-drive-adoption/ | 358 | 12 |
| 30 | /top-sap-implementation-partners-in-the-usa-2025-by-tier/ | 349 | 8 |
| 31 | /top-sap-project-tracking-tools-2025/ | 330 | 10 |
| 32 | /sap-quality-gates-implementation/ | 325 | 12 |
| 33 | /sap-manufacturing-industry-secrets/ | 319 | 7 |
| 34 | /sap-bpc-features-deployment-best-practice-guide/ | 315 | 10 |
| 35 | /best-sap-documentation-tools-2024-guide/ | 312 | 6 |
| 36 | /write-for-us-lets-share-our-experiences/ | 302 | 8 |
| 37 | /sap-enterprise-warehouse-management-sap-ewm-essentials/ | 292 | 11 |
| 38 | /sap-implementation/sap-for-aviation/ | 279 | 11 |
| 39 | / | 276 | 12 |
| 40 | /oracle-erp-vs-sap/ | 258 | 14 |
| 41 | /project-planning-and-control-get-sap-projects-back-on-track/ | 256 | 12 |
| 42 | /best-erp-software-small-business-a-real-world-guide-for-2025/ | 254 | 12 |
| 43 | /how-to-create-an-sap-implementation-project-charter/ | 253 | 9 |
| 44 | /5-best-crm-systems-for-sap-in-2024/ | 249 | 11 |
| 45 | /ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/ | 246 | 12 |
| 46 | /best-sap-implementation-strategies-to-avoid-costly-mistakes/ | 245 | 9 |
| 47 | /free-data-migration-estimator-sap-oracle-microsoft/ | 229 | 11 |
| 48 | /sap-testing-validation-tools-comparison/ | 225 | 10 |
| 49 | /ai-governance-framework-guide-building-a-responsible-ai-plan/ | 218 | 12 |
| 50 | /structured-thinking-problem-solving/ | 212 | 8 |

## Full URL list

The Search Console export has 143 unique URLs (canonical paths, after stripping language prefixes). The remaining 93 URLs beyond the top 50 each have under 200 clicks but still contribute.

Every URL in the sitemap must serve content on the new site. If a sitemap URL has zero traffic in Search Console, it still gets indexed and Google may use it for crawl budget calculations.

Sources, fetched 2026-05-24:

- `https://noeldcosta.com/post-sitemap.xml` (82 blog posts)
- `https://noeldcosta.com/category-sitemap.xml` (4 categories)
- `https://noeldcosta.com/post_tag-sitemap.xml` (6 tags)

Cross-reference against `_docs/references/search-console-export.xlsx` for traffic data.



### Blog posts (82)

| Path | Last modified |
|------|----------------|
| /2024-sap-timeline-planning-implementation-guide-essentials/ | 2025-10-17 |
| /2025-the-year-sap-generative-ai-redefines-middle-east-careers/ | 2025-10-17 |
| /5-best-crm-systems-for-sap-in-2024/ | 2025-10-17 |
| /adopt-my-requirements-gathering-template-7-hacks-to-follow/ | 2025-10-17 |
| /ai-governance-framework-guide-building-a-responsible-ai-plan/ | 2025-10-17 |
| /ai-governance-in-sap-implementations-compliance-security/ | 2025-10-17 |
| /ai-risk-management-framework-a-step-by-step-guide-for-2025/ | 2025-10-17 |
| /best-erp-for-manufacturing/ | 2025-10-17 |
| /best-erp-for-small-business-operations/ | 2025-08-24 |
| /best-erp-software-small-business-a-real-world-guide-for-2025/ | 2025-10-17 |
| /best-sap-articles-for-implementation-noel-dcosta/ | 2026-01-11 |
| /best-sap-documentation-tools-2024-guide/ | 2025-10-17 |
| /best-sap-implementation-strategies-to-avoid-costly-mistakes/ | 2025-10-16 |
| /best-sap-implementation-templates-activate-2024/ | 2025-10-17 |
| /best-sap-technical-change-management-tools-2025/ | 2025-10-17 |
| /build-a-winning-sap-business-case-template-implementation-guide/ | 2025-09-11 |
| /building-the-perfect-erp-implementation-team-in-2024/ | 2025-10-17 |
| /case-study-finance-process-modernization/ | 2025-08-18 |
| /change-management-plan-success/ | 2025-09-15 |
| /citizen-engagement-with-sap-cx-public-sector/ | 2025-09-11 |
| /create-and-manage-sap-universal-id-link-s-user-and-p-user-ids/ | 2026-01-11 |
| /creating-an-effective-sap-project-steering-committee/ | 2025-10-16 |
| /ecc-to-s4hana-migration/ | 2025-10-17 |
| /erp-implementation-contract-negotiation-cost-review-cfo/ | 2025-09-11 |
| /erp-implementation-kpis-metrics/ | 2025-10-17 |
| /erp-modernization-2025-cloud-ai-clean-core/ | 2026-01-05 |
| /erp-modernization-mistakes/ | 2025-10-17 |
| /erp-modernization-sap-servicenow/ | 2026-01-05 |
| /erp-recovery-fmcg-sap-analytics-cloud/ | 2025-09-11 |
| /erp-system-selection-case-study-manufacturing/ | 2025-08-17 |
| /essential-sap-implementation-team-roles/ | 2025-10-17 |
| /how-to-avoid-scope-creep-in-an-sap-implementation/ | 2025-10-17 |
| /how-to-create-an-sap-implementation-project-charter/ | 2025-10-17 |
| /master-the-sap-btp-cockpit-simple-steps/ | 2026-01-11 |
| /mastering-sap-implementation-a-step-by-step-guide-for-2025/ | 2025-08-30 |
| /my-journey-with-customer-information-solutions-defense/ | 2025-10-17 |
| /oracle-erp-vs-sap/ | 2025-09-05 |
| /project-planning-and-control-get-sap-projects-back-on-track/ | 2025-10-16 |
| /resource-allocation-planning-for-sap-projects/ | 2025-09-11 |
| /sap-analytics-cloud/ | 2025-10-16 |
| /sap-ariba-implementation-uae-public-sector/ | 2025-10-16 |
| /sap-ariba-your-2025-guide-to-sourcing-supplier-management/ | 2025-10-17 |
| /sap-bpc-features-deployment-best-practice-guide/ | 2025-10-17 |
| /sap-btp-cockpit-issues/ | 2026-01-11 |
| /sap-business-one-price-guide/ | 2025-10-16 |
| /sap-clean-core-strategy-what-it-means-for-your-business/ | 2025-10-17 |
| /sap-conversational-ai-and-successfactors-for-hr-in-2025/ | 2025-10-17 |
| /sap-cpi/ | 2025-09-11 |
| /sap-ecc-to-s4hana-migration-case-study/ | 2025-09-12 |
| /sap-ehs-environmental-health-and-safety-management/ | 2025-10-17 |
| /sap-enterprise-warehouse-management-sap-ewm-essentials/ | 2025-10-16 |
| /sap-fico/ | 2025-08-30 |
| /sap-implementation-cost-and-budget-breakdown/ | 2025-10-17 |
| /sap-implementation-cost-breakdown-why-budgets-explode-50/ | 2025-10-16 |
| /sap-implementation-public-sector-compliance/ | 2025-10-17 |
| /sap-implementation-vs-rollout-differences-challenges-best-practices/ | 2025-10-17 |
| /sap-integration-suite-delivery-delays/ | 2025-08-17 |
| /sap-license-negotiation-10-key-points-to-consider-in-2024/ | 2025-09-15 |
| /sap-manufacturing-industry-secrets/ | 2025-10-17 |
| /sap-negotiation-advisors-reduce-cost/ | 2025-09-15 |
| /sap-performance-testing-it-leaders/ | 2025-08-14 |
| /sap-pp-production-planning/ | 2025-10-17 |
| /sap-project-risk-assessment-matrix-and-mitigation-strategies/ | 2025-10-17 |
| /sap-project-scope-template-management-and-control/ | 2025-09-11 |
| /sap-quality-gates-implementation/ | 2025-10-17 |
| /sap-sd-sales-and-distribution/ | 2025-10-17 |
| /sap-stakeholder-management-strategy/ | 2025-10-17 |
| /sap-testing-validation-tools-comparison/ | 2025-10-16 |
| /sap-training-strategies-for-employees-to-drive-adoption/ | 2025-10-17 |
| /sap-vs-oracle-which-erp-is-better-for-your-business/ | 2025-10-16 |
| /simple-consulting-frameworks-explained/ | 2025-09-15 |
| /start-your-sap-implementation-project-right/ | 2025-08-24 |
| /structured-thinking-problem-solving/ | 2025-08-14 |
| /the-50-billion-erp-failure-why-cfos-still-reach-for-excel-instead/ | 2025-08-14 |
| /top-sap-implementation-partners-in-the-usa-2025-by-tier/ | 2025-10-17 |
| /top-sap-project-tracking-tools-2025/ | 2025-10-17 |
| /top-skills-engineers-need-to-succeed-in-consulting/ | 2025-08-15 |
| /what-consultants-actually-do-beyond-using-buzzwords/ | 2025-09-15 |
| /why-2025-trump-tariffs-mean-higher-prices-for-everyone/ | 2025-10-17 |
| /why-erp-integration-with-salesforce-fails-and-how-to-fix-it/ | 2025-10-17 |
| /why-sap-data-migration-fails-and-how-to-fix-it/ | 2025-10-16 |
| /why-sap-integrated-business-planning-sap-ibp-matters/ | 2025-10-17 |

### Categories (4)

| Path | Last modified |
|------|----------------|
| /category/ai-governance/ | 2025-10-17 |
| /category/erp-consulting-guide/ | 2025-09-15 |
| /category/sap-case-studies/ | 2025-10-17 |
| /category/sap-modules/ | 2025-10-17 |

### Tags (6)

| Path | Last modified |
|------|----------------|
| /tag/sap-crisis-management/ | 2025-10-17 |
| /tag/sap-erp-modernization/ | 2026-01-05 |
| /tag/sap-implementation-strategies/ | 2026-01-05 |
| /tag/sap-industry-topics/ | 2025-10-17 |
| /tag/sap-planning-and-selection/ | 2025-10-17 |
| /tag/sap-technical-decisions/ | 2026-01-11 |


## Notes

- The WordPress site has NO language prefix on the English version. Flat structure.
- Trailing slashes are present on every URL. Match them exactly.
- Some URLs are nested (e.g. `/sap-implementation/for-retail/` is a child of `/sap-implementation/`). The Next.js routing must support nesting.
- Two cost calculator URLs exist. `/sap-implementation-cost-calculator/` AND `/ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/`. Both must work.
- The Search Console data shows "Translated results" as a search appearance type (128 clicks, 16,268 impressions, position 8.65). This is Google's feature where they show translated versions in user-local language. GTranslate enables this.
