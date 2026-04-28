# WordPress URL master list

Source: https://noeldcosta.com/sitemap_index.xml (fetched 2026-04-28).
This is the URL contract. Every WordPress URL on the live site
maps 1:1 to a Next.js route on this build. Zero changes. Zero redirects.

When creating a new page, check this list first. If a similar URL
exists, use the existing slug.

## Pages (from page-sitemap.xml)

| WordPress URL | Likely route in Next.js | Notes |
|---|---|---|
| `/` | `src/app/[lang]/page.tsx` | Homepage |
| `/sap-erp-consultant-my-story-noel-dcosta/` | `src/app/[lang]/sap-erp-consultant-my-story-noel-dcosta/page.tsx` | About page. Long ugly slug, but SEO equity is on it. Keep it. |
| `/contact-noel-erp-support/` | `src/app/[lang]/contact-noel-erp-support/page.tsx` | Contact |
| `/system-implementation-sap/` | `src/app/[lang]/system-implementation-sap/page.tsx` | Story / origin page |
| `/erp-ai-services/` | `src/app/[lang]/erp-ai-services/page.tsx` | Services index |
| `/sap-implementation/` | `src/app/[lang]/sap-implementation/page.tsx` | SAP implementation hub |
| `/sap-implementation/for-aviation/` | `src/app/[lang]/sap-implementation/for-aviation/page.tsx` | Industry: aviation |
| `/sap-implementation/for-manufacturing/` | `src/app/[lang]/sap-implementation/for-manufacturing/page.tsx` | Industry: manufacturing |
| `/sap-implementation/for-retail/` | `src/app/[lang]/sap-implementation/for-retail/page.tsx` | Industry: retail |
| `/sap-implementation/rise-with-sap/` | `src/app/[lang]/sap-implementation/rise-with-sap/page.tsx` | RISE with SAP |
| `/sap-implementation/grow-with-sap/` | `src/app/[lang]/sap-implementation/grow-with-sap/page.tsx` | GROW with SAP |
| `/sap-implementation/business-one/` | `src/app/[lang]/sap-implementation/business-one/page.tsx` | Business One |
| `/sap-implementation/sap-modules/` | `src/app/[lang]/sap-implementation/sap-modules/page.tsx` | Modules |
| `/sap-implementation/s4hana/` | `src/app/[lang]/sap-implementation/s4hana/page.tsx` | S/4HANA |
| `/sap-implementation/sap-integration-platforms/` | `src/app/[lang]/sap-implementation/sap-integration-platforms/page.tsx` | Integration |
| `/case-studies/` | `src/app/[lang]/case-studies/page.tsx` | Case studies index |
| `/erp-for-small-business-ai-automation/` | `src/app/[lang]/erp-for-small-business-ai-automation/page.tsx` | Small business |
| `/ai-governance-services/` | `src/app/[lang]/ai-governance-services/page.tsx` | AI governance |
| `/consulting-career-guides/` | `src/app/[lang]/consulting-career-guides/page.tsx` | Career guides hub |
| `/best-sap-articles-for-implementation-noel-dcosta/` | `src/app/[lang]/best-sap-articles-for-implementation-noel-dcosta/page.tsx` | SAP articles hub |
| `/all-our-partners/` | `src/app/[lang]/all-our-partners/page.tsx` | Partners |
| `/write-for-us-lets-share-our-experiences/` | `src/app/[lang]/write-for-us-lets-share-our-experiences/page.tsx` | Write for us |
| `/privacy-policy-noeldcosta/` | `src/app/[lang]/privacy-policy-noeldcosta/page.tsx` | Privacy |

## Tools (from page-sitemap.xml)

| WordPress URL | Likely route in Next.js | Notes |
|---|---|---|
| `/sap-job-description-generator/` | `src/app/[lang]/sap-job-description-generator/page.tsx` | Tool: JD generator |
| `/sap-implementation-cost-calculator/` | `src/app/[lang]/sap-implementation-cost-calculator/page.tsx` | Tool: SAP cost |
| `/sap-solution-builder/` | `src/app/[lang]/sap-solution-builder/page.tsx` | Tool: solution builder |
| `/free-data-migration-estimator-sap-oracle-microsoft/` | `src/app/[lang]/free-data-migration-estimator-sap-oracle-microsoft/page.tsx` | Tool: migration estimator |
| `/sap-s4hana-migration-strategy-greenfield-vs-brownfield/` | `src/app/[lang]/sap-s4hana-migration-strategy-greenfield-vs-brownfield/page.tsx` | Tool: migration assessment |
| `/ai-insights-shiftgearx-noeldcosta/` | `src/app/[lang]/ai-insights-shiftgearx-noeldcosta/page.tsx` | AI insights hub (parent) |
| `/ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/` | `src/app/[lang]/ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/page.tsx` | Tool: ERP cost (nested) |

## Categories (from category-sitemap.xml)

These map to category index pages (use the existing CategoryPage.tsx
component).

| WordPress URL | Likely route in Next.js |
|---|---|
| `/category/ai-governance/` | `src/app/[lang]/category/ai-governance/page.tsx` |
| `/category/erp-consulting-guide/` | `src/app/[lang]/category/erp-consulting-guide/page.tsx` |
| `/category/sap-case-studies/` | `src/app/[lang]/category/sap-case-studies/page.tsx` |
| `/category/sap-modules/` | `src/app/[lang]/category/sap-modules/page.tsx` |

## Posts

Blog posts live at `/{slug}/` on WordPress (no `/blog/` prefix).
The post sitemap at https://noeldcosta.com/post-sitemap.xml has
the full list. Hundreds of posts. Map dynamically using the existing
PostPage.tsx and the content/ MDX folder.

When porting a post:
1. Pull the post content from WordPress (via export or scrape).
2. Save to `content/{slug}.mdx` using the EXACT slug from WordPress.
3. Frontmatter must include the original WordPress slug as `slug`.
4. Add `experience_source` field per CLAUDE.md anti-AI rules.
5. Re-write copy per VOICE.md but keep the slug identical.

## URLs that don't exist on WordPress yet but are planned

These are NEW pages we'll add. They won't exist on WordPress when
launched, so SEO equity starts at zero. That's fine.

| New URL | Purpose |
|---|---|
| `/for-consultants/` | Dedicated consultant audience page (per BRAND.md) |
| `/what-i-believe/` | Optional: long-form version of opinions section |

## Multi-language note

All URLs above sit under `[lang]`. So the actual route is
`/{lang}/sap-implementation/`, where lang is `en`, `ar`, etc.
Default lang is English. Other locales are downstream — write
English first.

## Author and tag sitemaps

These exist (`author-sitemap.xml`, `post_tag-sitemap.xml`) but are
generally less critical to mirror exactly. Author pages can be
deprecated if Noel is the only author. Tag pages can be added in
phase 2.

## Update process

When new WordPress pages get published, add them here. This file is
the single source of truth for what URLs Claude Code is allowed to
create.
