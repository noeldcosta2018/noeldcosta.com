# Ranking plan: from decay to page one (12 October 2026)

Evidence: Search Console API (Q3 2025 vs Q3 2026, last 90 days of queries), a crawl of all 2,307 sitemap URLs, and 20 URL inspections. Raw pulls are in the session scratchpad; the audit summary is in the chat of 12 October 2026.

## Honest framing

Nobody can promise position 1. Google decides, and head terms such as "sap implementation" (position 59 today) are held by SAP, Big 4 firms and large SIs with years of links. What is achievable: position 1 to 3 for specific buyer questions where Noel has first-hand experience, top 10 for the mid-size terms, and steady progress on the head terms as authority builds. Every target below has a date to check, not a guarantee.

## Where we start

| Target query | Monthly impressions (90d / 3) | Position today | Target |
|---|---|---|---|
| sap vs oracle / oracle vs sap | about 640 | 20 / 14 | 1 to 3 |
| sap implementation cost | about 190 | 29 | 1 to 3 |
| clean core / sap clean core | about 230 | 17 / 57 | top 5 |
| sap ecc to s/4hana migration | about 200 | 37 to 67 | top 10 |
| sap implementation project | about 110 | 29 | top 5 |
| best erp for manufacturing | about 170 | 66 to 70 | top 10 |
| sap business one pricing | about 140 | 50 | top 5 |
| sap implementation partner / services | about 500 | 66 to 90 | top 20, then top 10 |
| sap implementation (head term) | about 590 | 59 | top 20 by end of plan |
| S-user / Universal ID cluster | high | 6.5 | hold, win back clicks |

## Phase 1: fix the foundations (weeks 1 to 2)

Goal: stop the site wasting Google's trust on weak pages. Small, low-risk changes.

1. Tag clean-up. 74 tags cover one article and 22 cover two, each about 150 words. Set single-article tags to noindex and remove them from the sitemap, or merge them into broader tags. Keep the six WordPress topic tags and tags with three or more articles. Needs Noel's sign-off (SEO change).
2. Link the stranded pages: the four tag pages nothing links to, and the three pages only reachable from the menu (partners, advisory, supporting your business), plus more links into the aviation and system-implementation pages.
3. Request indexing for the 10 new Data & analytics articles and recheck the "crawled, not indexed" URLs.
4. Set up rank tracking for the target queries above (weekly), so every later phase is measured.

Exit check: build, tests, crawl shows no unlinked sitemap pages, sitemap count drops by the removed tags.

## Phase 2: win back the decayed money pages (weeks 2 to 6)

Goal: the ten pages that lost the most, refreshed one per batch, in the same way as the Data & analytics articles: Noel answers a few questions, the article gets first-hand detail, current facts with sources, a direct answer in the first two sentences, a table where it helps, a FAQ, and links into the cluster. URLs and publication dates never change; `updated` is set.

Order (by lost clicks and buyer value):
1. /sap-implementation-cost-and-budget-breakdown/ (607 to 66 clicks) and /sap-implementation-cost-breakdown-why-budgets-explode-50/ (decide: merge or differentiate, they compete)
2. /sap-vs-oracle-which-erp-is-better-for-your-business/ and /oracle-erp-vs-sap/ (same: one clear winner page)
3. /sap-clean-core-strategy-what-it-means-for-your-business/ (position 12 to 36)
4. /ecc-to-s4hana-migration/
5. /mastering-sap-implementation-a-step-by-step-guide-for-2025/ and /2024-sap-timeline-planning-implementation-guide-essentials/
6. /best-sap-implementation-templates-activate-2024/
7. /sap-business-one-price-guide/
8. /best-erp-for-manufacturing/ (position 44 to 83)
9. /master-the-sap-btp-cockpit-simple-steps/
10. /create-and-manage-sap-universal-id-link-s-user-and-p-user-ids/ (ranking held, clicks lost to AI answers: add a quotable answer block and a step list)

Translations follow each approved English refresh. Non-English pages bring about 70% of clicks, so this matters as much as the English.

Exit check per page: position and clicks 4 weeks after the refresh, against the table above.

## Phase 3: build one buyer topic Google trusts (weeks 4 to 12)

Goal: topical authority on S/4HANA migration and SAP programme cost, the topics that win consulting work. Today they sit at positions 42 to 56.

1. One hub page (likely /sap-implementation/ or a migration hub, decided with Noel) that answers the main question and links to every article in the cluster.
2. Six to eight new articles from real searches, each answering one question fully, for example: S/4HANA migration cost by company size, brownfield vs greenfield vs selective, RISE with SAP contract traps, how long an S/4HANA migration takes, data migration for S/4HANA, choosing an SAP partner, SAP programme recovery.
3. Every article links up to the hub and across to two or three siblings; the existing calculator and migration assessment tools are linked from the hub.
4. Same quality bar as the Data & analytics series: first person only from Noel's confirmed experience, official sources, no invented facts.

Exit check: cluster average position from 50 to under 20, at least three queries in the top 3.

## Phase 4: authority signals beyond the site (weeks 6 onwards)

Rankings for competitive buyer terms depend on who links to you and whether Google can verify the author.

1. Author page and article bylines: credentials (CIMA, AICPA), named programmes where permitted, LinkedIn and YouTube links, consistent Person schema.
2. Case studies: named or anonymised programmes with signed-off numbers, linked from the matching articles.
3. Links: republish summaries on LinkedIn and partner publications (SAP Press, MSN, TechBullion, The Next Disruption) with links to the full article; YouTube videos on the refreshed topics embedded in the articles; ERPCV and SAPopedia linking to the relevant guides.
4. Digital PR: one original data piece per quarter (for example, a survey of SAP programme overruns from Noel's network) that others cite.

Exit check: referring domains growing month on month (Search Console links report), branded searches up.

## Phase 5: keep it (ongoing, monthly)

1. Monthly decay check: any page losing more than 30% of clicks quarter on quarter gets a refresh.
2. Expand Data & analytics with the next set of searches once the first ten are indexed and ranking.
3. Track AI answers: pages that keep rankings but lose clicks get a quotable answer block and richer comparison content.
4. Quarterly review of this plan against the target table.

How it runs (set up 14 October 2026): `scripts/seo-monthly-report.py` pulls Search Console and writes `docs/claude/seo-reports/<date>.md` with all four checks plus target-query and cluster progress. A scheduled task ("noeldcosta.com monthly SEO report") runs it on the 3rd of each month at 09:00 and summarises the actions; the quarterly review is part of the January, April, July and October runs. Baseline: `docs/claude/seo-reports/2026-10-11.md` (data to 11 October, before the migration and Data & analytics pages could show).

## Working rules

Each step is one batch: build, tests, preview, review, Noel's approval, then push. No URL, slug, canonical or hreflang changes without sign-off. No invented experience, clients or numbers.
