# Search Console traffic analysis (16 months ending May 2026)

This document summarizes the Search Console export. Use it to inform migration priorities.

## The headline number

**64.5% of all clicks come from non-English URLs.**

Total clicks: 36,605. English clicks: 13,010. Non-English clicks: 23,595. The translated versions (served by GTranslate) carry the majority of the site's organic traffic.

## Traffic concentration

The top 50 unique URLs account for **89.3%** of all clicks. The top 10 alone account for around 47%. A handful of pages do most of the work.

The single highest-traffic page is `/create-and-manage-sap-universal-id-link-s-user-and-p-user-ids/` with 3,438 combined clicks across 14 language versions. That's about 215 clicks per month from one URL.

## Language breakdown by clicks

| Language code | Language | Clicks | URLs indexed |
|---|---|---|---|
| EN | English | 13,010 | 119 |
| ja | Japanese | 4,408 | 85 |
| es | Spanish | 3,919 | 85 |
| fr | French | 3,016 | 83 |
| ru | Russian | 2,396 | 79 |
| it | Italian | 2,215 | 80 |
| de | German | 1,991 | 71 |
| pt | Portuguese | 1,605 | 70 |
| el | Greek | 1,143 | 59 |
| ar | Arabic | 962 | 35 |
| nl | Dutch | 831 | 67 |
| zh-CN | Chinese Simplified | 578 | 65 |
| zh-TW | Chinese Traditional | 303 | 37 |
| ko | Korean | 135 | 30 |
| hr | Croatian | 43 | 8 |
| hi | Hindi | 23 | 11 |
| ka | Georgian | 12 | 6 |
| ml | Malayalam | 11 | 7 |
| da | Danish | 2 | 2 |
| tl | Tagalog | 2 | 1 |

Greek (el) is notable. 1,143 clicks. More traffic than Arabic or Dutch. Confirm it's enabled in GTranslate.

## Country breakdown

| Country | Clicks | Notes |
|---|---|---|
| India | 6,087 | English audience mainly |
| Japan | 4,308 | Maps to /ja/ traffic |
| Italy | 2,279 | Maps to /it/ traffic |
| United States | (top of impressions) | English audience |
| Vietnam | 9,201 impressions | Low CTR but high impressions |
| Mexico | 4,045 impressions | Spanish audience |
| Russian Federation | 3,830 impressions | Russian audience |

## Device split

| Device | Clicks | Impressions | Share |
|---|---|---|---|
| Desktop | 28,281 | 4,821,181 | 77.8% of clicks |
| Mobile | 8,050 | 1,106,699 | 22.1% of clicks |
| Tablet | 149 | 22,743 | 0.4% of clicks |

Mobile is roughly 22% of clicks. Lower than typical for a general consumer site. Makes sense given the audience (SAP consultants and IT decision-makers researching on desktop). Mobile responsiveness still matters but it's not the priority that desktop is.

## Search appearance

| Search appearance | Clicks | Impressions | Position |
|---|---|---|---|
| Review snippet | 812 | 153,834 | 27.39 |
| Translated results | 128 | 16,268 | 8.65 |

The "Translated results" feature is Google showing GTranslate's translations directly in SERP for users searching in those languages. 128 clicks via this feature. The 16k impressions tell you Google IS surfacing these as translated results.

## Top non-English URLs (the ones to protect at all costs)

| Rank | Translated URL | Clicks | Position |
|---|---|---|---|
| 1 | /es/best-sap-implementation-templates-activate-2024/ | 549 | 15.25 |
| 2 | /ja/create-and-manage-sap-universal-id-link-s-user-and-p-user-ids/ | 549 | 7.76 |
| 3 | /es/sap-implementation-cost-and-budget-breakdown/ | 496 | 12.87 |
| 4 | /ja/sap-vs-oracle-which-erp-is-better-for-your-business/ | 468 | 13.36 |
| 5 | /el/mastering-sap-implementation-a-step-by-step-guide-for-2025/ | 426 | 6.48 |
| 6 | /de/create-and-manage-sap-universal-id-link-s-user-and-p-user-ids/ | 425 | 8.70 |
| 7 | /ja/master-the-sap-btp-cockpit-simple-steps/ | 295 | 9.09 |
| 8 | /ru/adopt-my-requirements-gathering-template-7-hacks-to-follow/ | 291 | 8.99 |
| 9 | /es/sap-business-one-price-guide/ | 278 | 52,114 |
| 10 | /it/sap-implementation-cost-and-budget-breakdown/ | 260 | 11.71 |

## What this means for migration

1. **GTranslate must continue working after migration.** Not a nice-to-have. The majority of organic traffic depends on it.

2. **URL preservation is more critical than I initially flagged.** A single broken slug can lose 500+ clicks per month if it's a high-value page in 10+ languages.

3. **Blog posts are most of the traffic, not the static pages.** The `wordpress-urls.md` file initially had only 22 URLs (from page-sitemap.xml). The post-sitemap.xml has the high-value URLs.

4. **Mobile audit gets reprioritized.** 22% is meaningful but desktop dominates. Don't skip mobile, but don't over-invest either. The desktop experience matters more.

5. **Phase 3 (GTranslate setup) becomes the highest-stakes part of the migration.** It cannot fail. Plan a careful staging rollout.

## Open questions worth answering

- Why is Greek (1,143 clicks) ranking so well? Is the content particularly relevant to Greek SAP users, or is it just one breakout post (`/el/mastering-sap-implementation-a-step-by-step-guide-for-2025/` has 426 of those 1,143 clicks)? Worth understanding to know if it's defensible long-term.

- What's the conversion rate from non-English traffic? Search Console doesn't show this. Cross-reference Google Analytics. If Spanish/Japanese visitors are converting to consulting inquiries, the value is even higher than clicks suggest. If they're tire-kickers, less so.

- Vietnam shows 9,201 impressions but the click-through is unclear from this view. Worth investigating which Vietnamese-language pages are surfacing.

- The "Translated results" feature shows 16k impressions and 128 clicks. CTR is ~0.8%, which is low. There may be opportunity to improve how the translated titles render in SERP.

These are post-launch optimization questions. The migration itself just needs to preserve what's already working.
