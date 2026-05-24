# Staging pre-GTranslate verification

**Date:** 2026-05-25
**Auditor:** Claude (automated)
**Target:** Vercel Preview deployment from branch `staging-gtranslate-test`
**Initial run commit:** `f3b45f0` at https://noeldcosta-84ic8swzp-noeldcosta2018-8336s-projects.vercel.app
**Post-fix run commit:** `d513886` at https://noeldcosta-rb9icxrzy-noeldcosta2018-8336s-projects.vercel.app
**Source list:** `_docs/references/wordpress-urls.md`
**Verification script:** `scripts/check-urls.mjs` (raw output at `scripts/check-urls-output-staging.json`)
**Baseline for comparison:** `_docs/audits/pre-launch-check-2026-05-24.md` (localhost dev run, same 114 URLs)

## Method

1. Pushed `staging-gtranslate-test` to GitHub. Vercel built the branch as a Preview deployment (env `Preview`). Deployment Protection was disabled on Preview so the URL is publicly fetchable for the test.
2. Modified `scripts/check-urls.mjs` to accept `BASE_URL` (full origin) and to additionally capture `enLinks` (`/en/...` href occurrences) and the `<link rel="canonical">` URL on every page. Production HTML is smaller than `next dev` output, so the PASS size threshold drops from 30 KB to 8 KB when `BASE_URL` is not localhost. The 8 KB floor still cleanly separates real pages (smallest observed: 47 KB) from Vercel's bundled 404 page (~2 KB).
3. Ran the script with `BASE_URL=https://noeldcosta-84ic8swzp-noeldcosta2018-8336s-projects.vercel.app`. Output written to `scripts/check-urls-output-staging.json`.
4. For each path in `_docs/references/wordpress-urls.md`, recorded HTTP status, response body size, `<title>`, `<link rel="canonical">`, count of `hreflang=` occurrences, count of `/{lang}/` hrefs, and count of `/en/` hrefs.
5. A URL is a **PASS** if the response is HTTP 200, contains a non-empty `<title>`, and the body is larger than 8 KB.

## Headline result

**114 / 114 URLs return 200 with rendered content. Zero HTTP failures.**

| Section    | URLs | HTTP 200 | HTTP FAIL |
|------------|------|----------|-----------|
| Pages      | 22   | 22       | 0         |
| Posts      | 82   | 82       | 0         |
| Categories | 4    | 4        | 0         |
| Tags       | 6    | 6        | 0         |
| **Total**  | 114  | 114      | 0         |

**One blocker found that does not show up as an HTTP failure: five nested pages declare a canonical URL that strips the parent path. See "Blockers" below.**

## Supplementary checks

| Check | Result |
|---|---|
| `/sitemap.xml` returns HTTP 200, valid XML | PASS — `application/xml`, 250 `<loc>` entries, well-formed `<?xml ... ?><urlset ...>`. |
| `/sitemap.xml` includes every URL from this list | PASS — 0 of 114 expected URLs missing. |
| `/sitemap.xml` excludes language-prefixed URLs | PASS — 0 entries match `/{lang}/` for any of the 20 GTranslate locales. |
| `/robots.txt` returns HTTP 200, valid content | PASS — 27 bytes, body is exactly `User-Agent: *\nDisallow: /\n` (Preview-only output from the `VERCEL_ENV === 'preview'` branch added in commit `f3b45f0`). Production output is unchanged. |
| No locale prefixes in rendered URLs | PASS — 0 `/{lang}/` href occurrences across all 114 rendered pages. |
| No `/en/` prefixes in rendered URLs | PASS — 0 `/en/` href occurrences across all 114 rendered pages. |
| No hreflang annotations on rendered pages | PASS — 0 `hreflang=` occurrences across all 114 rendered pages. |
| Canonical URL points at `noeldcosta.com` (not `vercel.app`) | PASS — 114 / 114 canonicals use `https://noeldcosta.com/...`, none reference the Vercel hostname. |
| Canonical URL ends with trailing slash | PASS — 114 / 114 canonicals end with `/`. |
| **Canonical path matches the request path** | **FAIL — 5 / 114 nested pages declare a canonical that strips the parent path.** See "Blockers" below. |

## Blockers

### B-01. Five nested pages declare a wrong canonical URL

Five pages serve at a nested path on Next.js (matching WordPress 1:1) but emit a `<link rel="canonical">` that points at a flat path that does not exist on either WordPress or Next.js. Search engines treat the canonical as the authoritative URL, so ranking signal would consolidate at a 404. This is an SEO blocker for any future re-indexing.

| Requested path (serves 200) | Declared canonical | Canonical resolves on noeldcosta.com today? |
|---|---|---|
| /ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/ | https://noeldcosta.com/erp-implementation-cost-calculator/ | No — different page exists at `/sap-implementation-cost-calculator/` only |
| /sap-implementation/sap-for-aviation/ | https://noeldcosta.com/sap-for-aviation/ | No — only the nested path is canonical in `wordpress-urls.md` |
| /sap-implementation/for-manufacturing/ | https://noeldcosta.com/for-manufacturing/ | No — only the nested path is canonical |
| /sap-implementation/for-retail/ | https://noeldcosta.com/for-retail/ | No — only the nested path is canonical |
| /sap-implementation/rise-with-sap/ | https://noeldcosta.com/rise-with-sap/ | No — only the nested path is canonical |

All five canonicals appear to be generated by code that took only the last path segment. Fix should set the canonical to the request path including parent segments. The page bodies themselves are fine — they return 200 with full content — but the `<head>` metadata is broken.

This bug is **pre-existing**, not introduced by the migration: the localhost run on 2026-05-24 would also exhibit it (the localhost run pre-dated canonical capture in the script, but the responsible code path runs identically in dev and prod). The Vercel build surfaced it because the script was extended for this audit.

Per the playbook, this is a hard launch blocker. Address before pointing GTranslate at the Next.js origin — otherwise translated URLs will inherit a canonical that points at a non-existent English page and lose ranking equity.

## Pass/fail tables by section

### Pages (22)

| Path | HTTP | Size | Verdict |
|---|---|---|---|
| / | 200 | 255 KB | PASS |
| /ai-insights-shiftgearx-noeldcosta/ | 200 | 119 KB | PASS |
| /ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/ | 200 | 188 KB | PASS |
| /all-our-partners/ | 200 | 47 KB | PASS |
| /case-studies/ | 200 | 81 KB | PASS |
| /consulting-career-guides/ | 200 | 488 KB | PASS |
| /contact-noel-erp-support/ | 200 | 77 KB | PASS |
| /erp-ai-services/ | 200 | 141 KB | PASS |
| /erp-for-small-business-ai-automation/ | 200 | 294 KB | PASS |
| /free-data-migration-estimator-sap-oracle-microsoft/ | 200 | 196 KB | PASS |
| /privacy-policy-noeldcosta/ | 200 | 79 KB | PASS |
| /sap-erp-consultant-my-story-noel-dcosta/ | 200 | 255 KB | PASS |
| /sap-implementation-cost-calculator/ | 200 | 228 KB | PASS |
| /sap-implementation/ | 200 | 406 KB | PASS |
| /sap-implementation/for-manufacturing/ | 200 | 613 KB | PASS |
| /sap-implementation/for-retail/ | 200 | 542 KB | PASS |
| /sap-implementation/rise-with-sap/ | 200 | 447 KB | PASS |
| /sap-implementation/sap-for-aviation/ | 200 | 480 KB | PASS |
| /sap-job-description-generator/ | 200 | 164 KB | PASS |
| /sap-solution-builder/ | 200 | 176 KB | PASS |
| /system-implementation-sap/ | 200 | 142 KB | PASS |
| /write-for-us-lets-share-our-experiences/ | 200 | 159 KB | PASS |

### Posts (82)

| Path | HTTP | Size | Verdict |
|---|---|---|---|
| /2024-sap-timeline-planning-implementation-guide-essentials/ | 200 | 387 KB | PASS |
| /2025-the-year-sap-generative-ai-redefines-middle-east-careers/ | 200 | 299 KB | PASS |
| /5-best-crm-systems-for-sap-in-2024/ | 200 | 341 KB | PASS |
| /adopt-my-requirements-gathering-template-7-hacks-to-follow/ | 200 | 281 KB | PASS |
| /ai-governance-framework-guide-building-a-responsible-ai-plan/ | 200 | 310 KB | PASS |
| /ai-governance-in-sap-implementations-compliance-security/ | 200 | 219 KB | PASS |
| /ai-risk-management-framework-a-step-by-step-guide-for-2025/ | 200 | 279 KB | PASS |
| /best-erp-for-manufacturing/ | 200 | 352 KB | PASS |
| /best-erp-for-small-business-operations/ | 200 | 210 KB | PASS |
| /best-erp-software-small-business-a-real-world-guide-for-2025/ | 200 | 296 KB | PASS |
| /best-sap-articles-for-implementation-noel-dcosta/ | 200 | 47 KB | PASS |
| /best-sap-documentation-tools-2024-guide/ | 200 | 327 KB | PASS |
| /best-sap-implementation-strategies-to-avoid-costly-mistakes/ | 200 | 365 KB | PASS |
| /best-sap-implementation-templates-activate-2024/ | 200 | 746 KB | PASS |
| /best-sap-technical-change-management-tools-2025/ | 200 | 859 KB | PASS |
| /build-a-winning-sap-business-case-template-implementation-guide/ | 200 | 289 KB | PASS |
| /building-the-perfect-erp-implementation-team-in-2024/ | 200 | 320 KB | PASS |
| /case-study-finance-process-modernization/ | 200 | 227 KB | PASS |
| /change-management-plan-success/ | 200 | 322 KB | PASS |
| /citizen-engagement-with-sap-cx-public-sector/ | 200 | 249 KB | PASS |
| /create-and-manage-sap-universal-id-link-s-user-and-p-user-ids/ | 200 | 266 KB | PASS |
| /creating-an-effective-sap-project-steering-committee/ | 200 | 300 KB | PASS |
| /ecc-to-s4hana-migration/ | 200 | 327 KB | PASS |
| /erp-implementation-contract-negotiation-cost-review-cfo/ | 200 | 191 KB | PASS |
| /erp-implementation-kpis-metrics/ | 200 | 406 KB | PASS |
| /erp-modernization-2025-cloud-ai-clean-core/ | 200 | 257 KB | PASS |
| /erp-modernization-mistakes/ | 200 | 414 KB | PASS |
| /erp-modernization-sap-servicenow/ | 200 | 307 KB | PASS |
| /erp-recovery-fmcg-sap-analytics-cloud/ | 200 | 279 KB | PASS |
| /erp-system-selection-case-study-manufacturing/ | 200 | 272 KB | PASS |
| /essential-sap-implementation-team-roles/ | 200 | 408 KB | PASS |
| /how-to-avoid-scope-creep-in-an-sap-implementation/ | 200 | 362 KB | PASS |
| /how-to-create-an-sap-implementation-project-charter/ | 200 | 321 KB | PASS |
| /master-the-sap-btp-cockpit-simple-steps/ | 200 | 279 KB | PASS |
| /mastering-sap-implementation-a-step-by-step-guide-for-2025/ | 200 | 343 KB | PASS |
| /my-journey-with-customer-information-solutions-defense/ | 200 | 230 KB | PASS |
| /oracle-erp-vs-sap/ | 200 | 316 KB | PASS |
| /project-planning-and-control-get-sap-projects-back-on-track/ | 200 | 306 KB | PASS |
| /resource-allocation-planning-for-sap-projects/ | 200 | 521 KB | PASS |
| /sap-analytics-cloud/ | 200 | 291 KB | PASS |
| /sap-ariba-implementation-uae-public-sector/ | 200 | 223 KB | PASS |
| /sap-ariba-your-2025-guide-to-sourcing-supplier-management/ | 200 | 328 KB | PASS |
| /sap-bpc-features-deployment-best-practice-guide/ | 200 | 286 KB | PASS |
| /sap-btp-cockpit-issues/ | 200 | 294 KB | PASS |
| /sap-business-one-price-guide/ | 200 | 262 KB | PASS |
| /sap-clean-core-strategy-what-it-means-for-your-business/ | 200 | 249 KB | PASS |
| /sap-conversational-ai-and-successfactors-for-hr-in-2025/ | 200 | 236 KB | PASS |
| /sap-cpi/ | 200 | 263 KB | PASS |
| /sap-ecc-to-s4hana-migration-case-study/ | 200 | 270 KB | PASS |
| /sap-ehs-environmental-health-and-safety-management/ | 200 | 318 KB | PASS |
| /sap-enterprise-warehouse-management-sap-ewm-essentials/ | 200 | 317 KB | PASS |
| /sap-fico/ | 200 | 365 KB | PASS |
| /sap-implementation-cost-and-budget-breakdown/ | 200 | 429 KB | PASS |
| /sap-implementation-cost-breakdown-why-budgets-explode-50/ | 200 | 474 KB | PASS |
| /sap-implementation-public-sector-compliance/ | 200 | 340 KB | PASS |
| /sap-implementation-vs-rollout-differences-challenges-best-practices/ | 200 | 354 KB | PASS |
| /sap-integration-suite-delivery-delays/ | 200 | 338 KB | PASS |
| /sap-license-negotiation-10-key-points-to-consider-in-2024/ | 200 | 293 KB | PASS |
| /sap-manufacturing-industry-secrets/ | 200 | 280 KB | PASS |
| /sap-negotiation-advisors-reduce-cost/ | 200 | 317 KB | PASS |
| /sap-performance-testing-it-leaders/ | 200 | 337 KB | PASS |
| /sap-pp-production-planning/ | 200 | 298 KB | PASS |
| /sap-project-risk-assessment-matrix-and-mitigation-strategies/ | 200 | 383 KB | PASS |
| /sap-project-scope-template-management-and-control/ | 200 | 347 KB | PASS |
| /sap-quality-gates-implementation/ | 200 | 390 KB | PASS |
| /sap-sd-sales-and-distribution/ | 200 | 375 KB | PASS |
| /sap-stakeholder-management-strategy/ | 200 | 363 KB | PASS |
| /sap-testing-validation-tools-comparison/ | 200 | 600 KB | PASS |
| /sap-training-strategies-for-employees-to-drive-adoption/ | 200 | 334 KB | PASS |
| /sap-vs-oracle-which-erp-is-better-for-your-business/ | 200 | 305 KB | PASS |
| /simple-consulting-frameworks-explained/ | 200 | 253 KB | PASS |
| /start-your-sap-implementation-project-right/ | 200 | 350 KB | PASS |
| /structured-thinking-problem-solving/ | 200 | 253 KB | PASS |
| /the-50-billion-erp-failure-why-cfos-still-reach-for-excel-instead/ | 200 | 244 KB | PASS |
| /top-sap-implementation-partners-in-the-usa-2025-by-tier/ | 200 | 422 KB | PASS |
| /top-sap-project-tracking-tools-2025/ | 200 | 298 KB | PASS |
| /top-skills-engineers-need-to-succeed-in-consulting/ | 200 | 233 KB | PASS |
| /what-consultants-actually-do-beyond-using-buzzwords/ | 200 | 235 KB | PASS |
| /why-2025-trump-tariffs-mean-higher-prices-for-everyone/ | 200 | 243 KB | PASS |
| /why-erp-integration-with-salesforce-fails-and-how-to-fix-it/ | 200 | 242 KB | PASS |
| /why-sap-data-migration-fails-and-how-to-fix-it/ | 200 | 250 KB | PASS |
| /why-sap-integrated-business-planning-sap-ibp-matters/ | 200 | 233 KB | PASS |

### Categories (4)

| Path | HTTP | Size | Verdict |
|---|---|---|---|
| /category/ai-governance/ | 200 | 179 KB | PASS |
| /category/erp-consulting-guide/ | 200 | 410 KB | PASS |
| /category/sap-case-studies/ | 200 | 82 KB | PASS |
| /category/sap-modules/ | 200 | 263 KB | PASS |

### Tags (6)

| Path | HTTP | Size | Verdict |
|---|---|---|---|
| /tag/sap-crisis-management/ | 200 | 172 KB | PASS |
| /tag/sap-erp-modernization/ | 200 | 290 KB | PASS |
| /tag/sap-implementation-strategies/ | 200 | 327 KB | PASS |
| /tag/sap-industry-topics/ | 200 | 290 KB | PASS |
| /tag/sap-planning-and-selection/ | 200 | 206 KB | PASS |
| /tag/sap-technical-decisions/ | 200 | 278 KB | PASS |

## Differences vs the localhost run

Both runs cover the same 114 URLs. Status outcomes are identical: 114 / 114 return 200 on both.

| Dimension | Localhost (2026-05-24, `next dev`) | Vercel Preview (2026-05-25, prod build) | Comment |
|---|---|---|---|
| URLs returning 200 | 114 / 114 | 114 / 114 | Same. |
| Sitemap `<loc>` count | 250 | 250 | Same. |
| Sitemap missing-from-list | 0 | 0 | Same. |
| Hreflang occurrences across all pages | 0 | 0 | Same. |
| `/{lang}/` href occurrences | 0 | 0 | Same. |
| `/en/` href occurrences | (not captured) | 0 | Captured for the first time on the Vercel run; result is clean. |
| `/robots.txt` body | Standard production output (AI-crawler allowlist, points at `noeldcosta.com` sitemap) | `User-Agent: *\nDisallow: /\n` (27 bytes) | Different by design. The new `VERCEL_ENV === 'preview'` branch in `src/app/robots.ts` (commit `f3b45f0`) makes Previews invisible to crawlers. Production output is unchanged. |
| Page body size, median | ~280 KB (dev) | 294 KB (prod) | Similar. Dev HTML includes more whitespace; prod includes more inlined RSC payload. Both well above the threshold. |
| Page body size, min | 52 KB (`/all-our-partners/`) | 47 KB (`/all-our-partners/`) | Similar; Vercel ~10% smaller as expected for minified production HTML. |
| Page body size, max | ~700 KB | 859 KB (`/best-sap-technical-change-management-tools-2025/`) | Within the same order of magnitude. |
| Canonical capture | (not in script on 2026-05-24) | 114 captured, 5 mismatched | New finding from this run — see B-01. The underlying code is identical between dev and prod, so the bug also exists on localhost; it was simply not measured. |
| URLs that worked locally but failed on Vercel | None | — | No regressions from production build. |
| URLs that worked on Vercel but failed locally | None | — | — |

The production build did not introduce a single new HTTP failure relative to dev. All five canonical-mismatch URLs themselves serve 200 with rendered content; the bug is in the `<head>` metadata only.

## Summary

1. **Total URLs tested:** 114 (22 pages + 82 posts + 4 categories + 6 tags) plus `/sitemap.xml` and `/robots.txt`.
2. **Total passing the HTTP / title / size check:** 114.
3. **Total failing the HTTP / title / size check:** 0.
4. **Failing URLs and what went wrong:** No URL failed the HTTP check. However, **five URLs declare a wrong canonical** and that is a separate hard blocker (B-01 above):
   - `/ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/` — canonical points at `/erp-implementation-cost-calculator/`
   - `/sap-implementation/sap-for-aviation/` — canonical points at `/sap-for-aviation/`
   - `/sap-implementation/for-manufacturing/` — canonical points at `/for-manufacturing/`
   - `/sap-implementation/for-retail/` — canonical points at `/for-retail/`
   - `/sap-implementation/rise-with-sap/` — canonical points at `/rise-with-sap/`
5. **Differences between this run and the localhost run:**
   - **No URL changed state.** Every URL that passed on localhost also passes on Vercel; nothing new fails.
   - The production build is roughly 10% smaller in HTML payload at the low end (47 KB vs 52 KB minimum) and 20% larger at the high end (859 KB vs ~700 KB), consistent with minified production HTML plus larger inlined RSC payloads for content-heavy pages.
   - `/robots.txt` deliberately differs on the Preview hostname: it serves `Disallow: /` so Previews can never be indexed. Production behavior is unchanged.
   - Canonical URLs were not captured on 2026-05-24, so the canonical-mismatch finding is new. The bug is environment-independent and is present in dev as well.

## Post-fix verification (commit `d513886`)

The canonical-strip bug (B-01) was fixed by introducing `canonicalUrlForPage()` in `src/lib/seo.ts`. The helper prefers `frontmatter.canonical`, then derives the URL from `frontmatter.originalUrl` when present, then falls back to `flatPath(slug)`. It is used in three builders — `buildPageMetadata`, `pageWebPageJsonLd`, `pageArticleJsonLd` — so the `<link rel="canonical">`, the OG `url`, the WebPage `@id` and `url`, and the Article `mainEntityOfPage.@id` all agree on the same URL.

After redeploying, the verification script was re-run against the new Preview URL.

### Headline (post-fix run)

| Check | Result |
|---|---|
| HTTP 200 on all 114 URLs | PASS — 114 / 114 |
| Canonical path matches request path | PASS — 0 mismatches across all 114 pages (was 5) |
| Canonical hostname is `noeldcosta.com` | PASS — 114 / 114 |
| Canonical ends with `/` | PASS — 114 / 114 |
| Pages with no canonical | 0 |
| Sitemap `<loc>` count | 250, valid XML, 0 lang prefixes, 0 expected URLs missing |
| `/robots.txt` body on Preview | `User-Agent: *\nDisallow: /\n` (27 bytes), unchanged |
| Hreflang / `/{lang}/` / `/en/` href occurrences | 0 / 0 / 0 |

### Affected URL canonicals (now correct)

| Requested path | Canonical declared | Match |
|---|---|---|
| /ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/ | https://noeldcosta.com/ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/ | OK |
| /sap-implementation/sap-for-aviation/ | https://noeldcosta.com/sap-implementation/sap-for-aviation/ | OK |
| /sap-implementation/for-manufacturing/ | https://noeldcosta.com/sap-implementation/for-manufacturing/ | OK |
| /sap-implementation/for-retail/ | https://noeldcosta.com/sap-implementation/for-retail/ | OK |
| /sap-implementation/rise-with-sap/ | https://noeldcosta.com/sap-implementation/rise-with-sap/ | OK |

### Regression spot-check on 5 random non-affected URLs

| Path | Canonical | Match |
|---|---|---|
| /erp-implementation-kpis-metrics/ | https://noeldcosta.com/erp-implementation-kpis-metrics/ | OK |
| /5-best-crm-systems-for-sap-in-2024/ | https://noeldcosta.com/5-best-crm-systems-for-sap-in-2024/ | OK |
| /master-the-sap-btp-cockpit-simple-steps/ | https://noeldcosta.com/master-the-sap-btp-cockpit-simple-steps/ | OK |
| /sap-stakeholder-management-strategy/ | https://noeldcosta.com/sap-stakeholder-management-strategy/ | OK |
| /erp-ai-services/ | https://noeldcosta.com/erp-ai-services/ | OK |

### JSON-LD parity check on `/sap-implementation/sap-for-aviation/`

Parsed the rendered HTML on the post-fix Preview and confirmed every URL-bearing metadata field now resolves to the nested URL:

| Field | Value |
|---|---|
| `<link rel="canonical">` | https://noeldcosta.com/sap-implementation/sap-for-aviation/ |
| `<meta property="og:url">` | https://noeldcosta.com/sap-implementation/sap-for-aviation/ |
| WebPage JSON-LD `@id` | https://noeldcosta.com/sap-implementation/sap-for-aviation/#webpage |
| WebPage JSON-LD `url` | https://noeldcosta.com/sap-implementation/sap-for-aviation/ |
| Article JSON-LD `mainEntityOfPage.@id` | https://noeldcosta.com/sap-implementation/sap-for-aviation/#webpage |

All five fields agree. The Article schema itself does not carry a top-level `url`; it links back to the WebPage via `mainEntityOfPage`, which is the correct schema.org pattern.

### Status

Blocker B-01 cleared. 114 / 114 URLs pass on the post-fix Preview, with 0 canonical mismatches and 0 regressions on the previously-correct 109 URLs. Safe to proceed to step 3 of phase 3 (pointing GTranslate at the Preview origin).

## Recommended next steps

1. ~~Fix the canonical generation for the five nested pages before continuing phase 3.~~ Done in commit `d513886`.
2. ~~Re-run this script after the fix lands on `staging-gtranslate-test` and confirm 0 canonical mismatches.~~ Done — 0 mismatches.
3. Proceed to step 3 of phase 3: point the GTranslate dashboard at the Preview origin and verify translated URL coverage. Note that the Preview's `robots.txt` is `Disallow: /`, which GTranslate's crawler must be able to bypass during testing — confirm with the GTranslate dashboard settings before pointing the origin.
