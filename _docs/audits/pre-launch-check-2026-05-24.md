# Pre-launch URL verification

**Date:** 2026-05-24
**Auditor:** Claude (automated)
**Target:** Next.js dev server running locally
**Source list:** `_docs/references/wordpress-urls.md`
**Verification script:** `scripts/check-urls.mjs` (raw output at `scripts/check-urls-output.json`)

## Method

1. Started the Next.js dev server (`npm run dev`). An existing instance was already running on port 3456; the verification ran against `http://localhost:3456/` and was re-confirmed against `http://localhost:3000/` for the supplementary checks. Both ports serve the same build from this repo.
2. For each path in `_docs/references/wordpress-urls.md`, fetched `http://localhost:{port}{path}` and recorded HTTP status, response body size, and `<title>`.
3. A URL is a **PASS** if the response is HTTP 200, contains a non-empty `<title>`, and the body is larger than 30 KB. The Next.js dev 404 page is ~12 KB with no `<title>`, so the threshold reliably separates rendered content from error pages.

## Headline result

**114 / 114 URLs PASS. Zero failures. No hard blockers for launch from this check.**

| Section    | URLs | Pass | Fail |
|------------|------|------|------|
| Pages      | 22   | 22   | 0    |
| Posts      | 82   | 82   | 0    |
| Categories | 4    | 4    | 0    |
| Tags       | 6    | 6    | 0    |
| **Total**  | 114  | 114  | 0    |

## Supplementary checks

| Check                                            | Result |
|---|---|
| `/sitemap.xml` returns HTTP 200, valid XML       | PASS — `application/xml`, 250 `<loc>` entries, well-formed `<?xml ... ?><urlset ...>` |
| `/sitemap.xml` includes every URL from this list | PASS — 0 of 114 expected URLs missing from sitemap |
| `/sitemap.xml` excludes language-prefixed URLs   | PASS — 0 URLs match `/{lang}/` pattern |
| `/robots.txt` returns HTTP 200, valid content    | PASS — 725 bytes, `text/plain`, allows AI crawlers, points at `https://noeldcosta.com/sitemap.xml` |
| No locale prefixes in rendered URLs              | PASS — 0 `/{lang}/` href occurrences across all 114 rendered pages |
| No hreflang annotations                          | PASS — 0 `hreflang=` occurrences across all 114 rendered pages |
| No `<link rel="alternate">` language tags        | PASS — none in homepage source |

## Observations (not blockers)

1. **Two tags render identical content under the same H1.** `/tag/sap-erp-modernization/` and `/tag/sap-industry-topics/` both render the title "Modernization & Industry" and link to the same 34 posts (verified by diffing the href sets). Both URLs serve 200 with full HTML, so they pass this check, but they look like aliases for the same internal tag. Worth confirming this is intentional before launch — if not, one should redirect to the other or render distinct content. WordPress preserved both as separate tag slugs in `wordpress-urls.md`, so both URLs must continue to resolve regardless.
2. **Two pages are at the lower end of the size range** but still well above the 30 KB threshold and have real titles:
   - `/all-our-partners/` — 52 KB, title "Partner Directory | Noel D'Costa"
   - `/best-sap-articles-for-implementation-noel-dcosta/` — 53 KB, title "Stronger Businesses with ERP Solutions and AI | Noel D'Costa"
   Both render normally; flagging only because they are noticeably smaller than the surrounding pages (which average 200–500 KB).
3. **Robots.txt allows all AI crawlers** (GPTBot, ClaudeBot, PerplexityBot, etc.) and blocks Bytespider and ImagesiftBot. Confirm this matches Noel's intent for the production launch.

## Pass/fail tables by section

### Pages (22)

| Path | HTTP | Size | Verdict |
|---|---|---|---|
| / | 200 | 262 KB | PASS |
| /ai-insights-shiftgearx-noeldcosta/ | 200 | 131 KB | PASS |
| /ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/ | 200 | 203 KB | PASS |
| /all-our-partners/ | 200 | 52 KB | PASS |
| /case-studies/ | 200 | 119 KB | PASS |
| /consulting-career-guides/ | 200 | 532 KB | PASS |
| /contact-noel-erp-support/ | 200 | 85 KB | PASS |
| /erp-ai-services/ | 200 | 156 KB | PASS |
| /erp-for-small-business-ai-automation/ | 200 | 319 KB | PASS |
| /free-data-migration-estimator-sap-oracle-microsoft/ | 200 | 213 KB | PASS |
| /privacy-policy-noeldcosta/ | 200 | 88 KB | PASS |
| /sap-erp-consultant-my-story-noel-dcosta/ | 200 | 278 KB | PASS |
| /sap-implementation-cost-calculator/ | 200 | 246 KB | PASS |
| /sap-implementation/ | 200 | 446 KB | PASS |
| /sap-implementation/for-manufacturing/ | 200 | 666 KB | PASS |
| /sap-implementation/for-retail/ | 200 | 590 KB | PASS |
| /sap-implementation/rise-with-sap/ | 200 | 488 KB | PASS |
| /sap-implementation/sap-for-aviation/ | 200 | 521 KB | PASS |
| /sap-job-description-generator/ | 200 | 179 KB | PASS |
| /sap-solution-builder/ | 200 | 191 KB | PASS |
| /system-implementation-sap/ | 200 | 156 KB | PASS |
| /write-for-us-lets-share-our-experiences/ | 200 | 174 KB | PASS |

### Posts (82)

| Path | HTTP | Size | Verdict |
|---|---|---|---|
| /2024-sap-timeline-planning-implementation-guide-essentials/ | 200 | 412 KB | PASS |
| /2025-the-year-sap-generative-ai-redefines-middle-east-careers/ | 200 | 318 KB | PASS |
| /5-best-crm-systems-for-sap-in-2024/ | 200 | 363 KB | PASS |
| /adopt-my-requirements-gathering-template-7-hacks-to-follow/ | 200 | 299 KB | PASS |
| /ai-governance-framework-guide-building-a-responsible-ai-plan/ | 200 | 331 KB | PASS |
| /ai-governance-in-sap-implementations-compliance-security/ | 200 | 233 KB | PASS |
| /ai-risk-management-framework-a-step-by-step-guide-for-2025/ | 200 | 296 KB | PASS |
| /best-erp-for-manufacturing/ | 200 | 376 KB | PASS |
| /best-erp-for-small-business-operations/ | 200 | 224 KB | PASS |
| /best-erp-software-small-business-a-real-world-guide-for-2025/ | 200 | 316 KB | PASS |
| /best-sap-articles-for-implementation-noel-dcosta/ | 200 | 53 KB | PASS |
| /best-sap-documentation-tools-2024-guide/ | 200 | 348 KB | PASS |
| /best-sap-implementation-strategies-to-avoid-costly-mistakes/ | 200 | 390 KB | PASS |
| /best-sap-implementation-templates-activate-2024/ | 200 | 801 KB | PASS |
| /best-sap-technical-change-management-tools-2025/ | 200 | 919 KB | PASS |
| /build-a-winning-sap-business-case-template-implementation-guide/ | 200 | 307 KB | PASS |
| /building-the-perfect-erp-implementation-team-in-2024/ | 200 | 340 KB | PASS |
| /case-study-finance-process-modernization/ | 200 | 243 KB | PASS |
| /change-management-plan-success/ | 200 | 342 KB | PASS |
| /citizen-engagement-with-sap-cx-public-sector/ | 200 | 267 KB | PASS |
| /create-and-manage-sap-universal-id-link-s-user-and-p-user-ids/ | 200 | 282 KB | PASS |
| /creating-an-effective-sap-project-steering-committee/ | 200 | 320 KB | PASS |
| /ecc-to-s4hana-migration/ | 200 | 349 KB | PASS |
| /erp-implementation-contract-negotiation-cost-review-cfo/ | 200 | 205 KB | PASS |
| /erp-implementation-kpis-metrics/ | 200 | 433 KB | PASS |
| /erp-modernization-2025-cloud-ai-clean-core/ | 200 | 272 KB | PASS |
| /erp-modernization-mistakes/ | 200 | 442 KB | PASS |
| /erp-modernization-sap-servicenow/ | 200 | 327 KB | PASS |
| /erp-recovery-fmcg-sap-analytics-cloud/ | 200 | 299 KB | PASS |
| /erp-system-selection-case-study-manufacturing/ | 200 | 292 KB | PASS |
| /essential-sap-implementation-team-roles/ | 200 | 434 KB | PASS |
| /how-to-avoid-scope-creep-in-an-sap-implementation/ | 200 | 386 KB | PASS |
| /how-to-create-an-sap-implementation-project-charter/ | 200 | 341 KB | PASS |
| /master-the-sap-btp-cockpit-simple-steps/ | 200 | 296 KB | PASS |
| /mastering-sap-implementation-a-step-by-step-guide-for-2025/ | 200 | 365 KB | PASS |
| /my-journey-with-customer-information-solutions-defense/ | 200 | 247 KB | PASS |
| /oracle-erp-vs-sap/ | 200 | 335 KB | PASS |
| /project-planning-and-control-get-sap-projects-back-on-track/ | 200 | 326 KB | PASS |
| /resource-allocation-planning-for-sap-projects/ | 200 | 557 KB | PASS |
| /sap-analytics-cloud/ | 200 | 310 KB | PASS |
| /sap-ariba-implementation-uae-public-sector/ | 200 | 239 KB | PASS |
| /sap-ariba-your-2025-guide-to-sourcing-supplier-management/ | 200 | 349 KB | PASS |
| /sap-bpc-features-deployment-best-practice-guide/ | 200 | 304 KB | PASS |
| /sap-btp-cockpit-issues/ | 200 | 312 KB | PASS |
| /sap-business-one-price-guide/ | 200 | 278 KB | PASS |
| /sap-clean-core-strategy-what-it-means-for-your-business/ | 200 | 264 KB | PASS |
| /sap-conversational-ai-and-successfactors-for-hr-in-2025/ | 200 | 250 KB | PASS |
| /sap-cpi/ | 200 | 280 KB | PASS |
| /sap-ecc-to-s4hana-migration-case-study/ | 200 | 290 KB | PASS |
| /sap-ehs-environmental-health-and-safety-management/ | 200 | 338 KB | PASS |
| /sap-enterprise-warehouse-management-sap-ewm-essentials/ | 200 | 338 KB | PASS |
| /sap-fico/ | 200 | 387 KB | PASS |
| /sap-implementation-cost-and-budget-breakdown/ | 200 | 456 KB | PASS |
| /sap-implementation-cost-breakdown-why-budgets-explode-50/ | 200 | 505 KB | PASS |
| /sap-implementation-public-sector-compliance/ | 200 | 361 KB | PASS |
| /sap-implementation-vs-rollout-differences-challenges-best-practices/ | 200 | 377 KB | PASS |
| /sap-integration-suite-delivery-delays/ | 200 | 360 KB | PASS |
| /sap-license-negotiation-10-key-points-to-consider-in-2024/ | 200 | 310 KB | PASS |
| /sap-manufacturing-industry-secrets/ | 200 | 297 KB | PASS |
| /sap-negotiation-advisors-reduce-cost/ | 200 | 337 KB | PASS |
| /sap-performance-testing-it-leaders/ | 200 | 358 KB | PASS |
| /sap-pp-production-planning/ | 200 | 316 KB | PASS |
| /sap-project-risk-assessment-matrix-and-mitigation-strategies/ | 200 | 408 KB | PASS |
| /sap-project-scope-template-management-and-control/ | 200 | 369 KB | PASS |
| /sap-quality-gates-implementation/ | 200 | 415 KB | PASS |
| /sap-sd-sales-and-distribution/ | 200 | 398 KB | PASS |
| /sap-stakeholder-management-strategy/ | 200 | 385 KB | PASS |
| /sap-testing-validation-tools-comparison/ | 200 | 639 KB | PASS |
| /sap-training-strategies-for-employees-to-drive-adoption/ | 200 | 355 KB | PASS |
| /sap-vs-oracle-which-erp-is-better-for-your-business/ | 200 | 323 KB | PASS |
| /simple-consulting-frameworks-explained/ | 200 | 267 KB | PASS |
| /start-your-sap-implementation-project-right/ | 200 | 372 KB | PASS |
| /structured-thinking-problem-solving/ | 200 | 268 KB | PASS |
| /the-50-billion-erp-failure-why-cfos-still-reach-for-excel-instead/ | 200 | 257 KB | PASS |
| /top-sap-implementation-partners-in-the-usa-2025-by-tier/ | 200 | 449 KB | PASS |
| /top-sap-project-tracking-tools-2025/ | 200 | 315 KB | PASS |
| /top-skills-engineers-need-to-succeed-in-consulting/ | 200 | 247 KB | PASS |
| /what-consultants-actually-do-beyond-using-buzzwords/ | 200 | 249 KB | PASS |
| /why-2025-trump-tariffs-mean-higher-prices-for-everyone/ | 200 | 256 KB | PASS |
| /why-erp-integration-with-salesforce-fails-and-how-to-fix-it/ | 200 | 256 KB | PASS |
| /why-sap-data-migration-fails-and-how-to-fix-it/ | 200 | 265 KB | PASS |
| /why-sap-integrated-business-planning-sap-ibp-matters/ | 200 | 247 KB | PASS |

### Categories (4)

| Path | HTTP | Size | Verdict |
|---|---|---|---|
| /category/ai-governance/ | 200 | 186 KB | PASS |
| /category/erp-consulting-guide/ | 200 | 417 KB | PASS |
| /category/sap-case-studies/ | 200 | 120 KB | PASS |
| /category/sap-modules/ | 200 | 269 KB | PASS |

### Tags (6)

| Path | HTTP | Size | Verdict |
|---|---|---|---|
| /tag/sap-crisis-management/ | 200 | 179 KB | PASS |
| /tag/sap-erp-modernization/ | 200 | 297 KB | PASS |
| /tag/sap-implementation-strategies/ | 200 | 334 KB | PASS |
| /tag/sap-industry-topics/ | 200 | 297 KB | PASS * |
| /tag/sap-planning-and-selection/ | 200 | 213 KB | PASS |
| /tag/sap-technical-decisions/ | 200 | 285 KB | PASS |

\* Renders the same posts list and title as `/tag/sap-erp-modernization/`. See observation 1.

## Notes on scope

- This check measures whether each URL returns rendered HTML with substantive content. It does not validate that the content on each page matches the intended copy, that copy passes VOICE.md, or that mobile rendering works. Those are covered by `mobile-audit-2026-05-24.md` and `seo-audit-2026-05-24.md`.
- The check ran against the local dev server. Production verification still needed after the Vercel deploy and DNS cutover (playbook step L-13).
- Translated URLs (`/{lang}/...`) are handled by GTranslate's external proxy and are out of scope for the Next.js origin check.
