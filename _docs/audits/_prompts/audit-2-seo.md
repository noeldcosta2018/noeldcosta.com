# Audit 2. SEO

Read CLAUDE.md and AGENTS.md first. Then come back here.

## Context you need before starting

The site uses GTranslate as a Translation Delivery Network. GTranslate is an external proxy service. It serves all `/{lang}/` URLs (e.g. `/es/`, `/ja/`, `/ka/`) by fetching the English version from the origin and translating it. The current Next.js codebase has a `[lang]` segment, but the migration plan is to remove it. The Next.js site will serve English only at flat URLs. GTranslate handles all translations externally.

This simplifies the SEO audit considerably. You don't need to worry about hreflang, locale-specific canonicals, or multi-language sitemaps. GTranslate handles all of that on the proxy side.

What you DO need to worry about. The English URLs must match the WordPress URLs exactly. Zero changes. The Yoast sitemap is the source of truth.

## The one rule that overrides everything

URLs cannot change. The WordPress site is indexed in Google Search Console. Every existing URL must work at the exact same path on the Next.js site. No exceptions. No "we'll add a redirect" workaround. Same URL or you lose rankings.

Specifically:
- Same path. Same trailing slash. Same case.
- No language prefix. The Next.js site serves English only at root.
- No slug changes. Even if you think the new slug is better.

If you find a Next.js route that doesn't match a WordPress URL, that's the highest-severity issue in this audit.

## Goal

Audit the Next.js site for SEO readiness against the WordPress migration. Report findings. Don't fix anything in this pass.

## WordPress URL list (the source of truth)

Reference the file at `_docs/references/wordpress-urls.md`. If it doesn't exist, fetch from these sitemaps:

- https://noeldcosta.com/sitemap_index.xml (index)
- https://noeldcosta.com/post-sitemap.xml (blog posts)
- https://noeldcosta.com/page-sitemap.xml (pages)
- https://noeldcosta.com/category-sitemap.xml (blog categories)
- https://noeldcosta.com/post_tag-sitemap.xml (blog tags)

Pages already extracted:

```
/
/write-for-us-lets-share-our-experiences/
/privacy-policy-noeldcosta/
/system-implementation-sap/
/ai-insights-shiftgearx-noeldcosta/
/contact-noel-erp-support/
/sap-implementation/
/erp-ai-services/
/sap-erp-consultant-my-story-noel-dcosta/
/all-our-partners/
/consulting-career-guides/
/sap-implementation/sap-for-aviation/
/erp-for-small-business-ai-automation/
/ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/
/case-studies/
/sap-implementation-cost-calculator/
/sap-implementation/for-retail/
/sap-implementation/for-manufacturing/
/sap-job-description-generator/
/sap-solution-builder/
/sap-implementation/rise-with-sap/
/free-data-migration-estimator-sap-oracle-microsoft/
```

For blog posts, fetch post-sitemap.xml and extract the full list. There will be more URLs than pages.

## What to check

### Part 1. URL preservation (most important)

For each WordPress URL:

- Find the matching Next.js route.
- Confirm the rendered URL exactly matches WordPress.
- Critical. The Next.js site must serve English at flat URLs. NOT at `/en/sap-implementation/`. If routes are nested under `[lang]`, that's a critical issue.

Output a table:

```
WordPress URL                          Next.js renders at              Match?
/sap-implementation/                   /en/sap-implementation/         ✗ CRITICAL (lang prefix)
/sap-implementation/                   /sap-implementation/            ✓
/case-studies/                         /case-studies/                  ✓
```

Also flag:
- WordPress URLs that have no matching Next.js route. These will 404 after migration.
- Next.js routes that have no matching WordPress URL. Could be new (fine, but ask) or invented (not fine).

### Part 2. The [lang] segment removal scope

Since GTranslate handles translation externally, the `[lang]` segment in `src/app/[lang]/` needs to be removed. Don't remove it in this pass. Just report on the scope of what needs to change.

- List every route currently nested under `src/app/[lang]/`.
- Check `src/lib/locales.ts`. Note what it exports.
- Check `src/middleware.ts` if it exists. Note any locale detection logic.
- Check `next.config.js` or `next.config.mjs` for i18n config.

Estimate the work. Files to move, references to clean up. One-paragraph summary.

### Part 3. Sitemap and robots

Open `src/app/sitemap.ts`.

- List every URL it generates.
- Cross-check against the WordPress sitemap URLs.
- Flag missing entries (WordPress URL not in new sitemap).
- Flag extra entries (Next.js sitemap has URLs that don't exist on the live site).
- Critical. The sitemap should generate flat English URLs only. GTranslate handles the translated sitemaps separately on their proxy.
- Confirm lastmod dates are dynamic, not hardcoded.
- Confirm priority and changefreq make sense.

Open `src/app/robots.ts`.

- Confirm production allows crawling.
- Sitemap URL referenced correctly.
- No accidental Disallow on important paths.
- Note. The robots.txt only needs to handle the English origin. GTranslate manages crawl directives on their proxy.

### Part 4. Head tags and meta

For each route, check:

- Title tag present. Unique. Under 60 chars.
- Meta description present. Under 160 chars. Not duplicated across pages.
- Canonical URL set. Points to the live URL (the same as WordPress).
- Open Graph tags. og:title, og:description, og:image, og:url, og:type.
- Twitter card tags. twitter:card, twitter:title, twitter:description.
- Robots meta where needed.

GTranslate will translate these meta tags on the proxy. So the English versions need to be correct and complete.

Open `src/lib/seo.ts`. Confirm the helpers output what they claim. Read the code. Don't trust it.

### Part 5. Structured data

Look for JSON-LD blocks. Yoast generates schema on the WordPress site. The new site should match or improve it.

- Blog posts. Article schema. author, datePublished, dateModified, headline, image.
- Homepage. Person schema for Noel. Include sameAs links to social profiles.
- Case studies. Article or CreativeWork schema.
- Tools pages (cost calculator, solution builder, job description generator). SoftwareApplication or Product schema.
- Contact page. ContactPage schema.
- BreadcrumbList wherever breadcrumbs render.

For each WordPress URL, check what schema the WordPress page currently emits. View source on the live page. The new page should emit equivalent or better schema.

If schema is missing entirely on a page that needs it, flag as critical.

### Part 6. Content SEO basics

For each page:

- One H1 per page. Not zero. Not two.
- Heading hierarchy logical. No jumping H1 to H4.
- All images have alt text. Decorative images use alt="".
- Internal links use descriptive anchor text. No "click here", "read more".
- No broken internal links.

Spot-check 5 random pages. Don't audit every page for content SEO. Sample only.

### Part 7. Performance signals

- Find `'use client'` directives in `src/components/`. Judge whether each genuinely needs client-side JS. Flag the ones that don't. Server components are faster and better for SEO.
- Image optimization. Confirm `next/image` is used. `sizes` prop set on responsive images. `priority` only on above-the-fold images.
- Font loading. Self-hosted or Google Fonts via next/font.
- No render-blocking third-party scripts.
- Largest Contentful Paint candidates identified. Hero image, hero text.

If you can run Lighthouse via Playwright or similar, run it on:
- Homepage
- A blog post
- The case studies page
- One tool page (cost calculator)

Report Core Web Vitals scores.

### Part 8. Yoast feature parity

The WordPress site uses Yoast SEO. Things Yoast does by default that the Next.js site needs to replicate:

- XML sitemap with image sitemaps. Check if Next.js sitemap includes images.
- OpenGraph defaults across all pages.
- Schema.org Organization and WebSite blocks site-wide.
- Breadcrumbs schema on relevant pages.
- Author schema on blog posts.

Flag anything Yoast handles that the Next.js site doesn't.

### Part 9. GTranslate compatibility check

The Next.js site will sit behind GTranslate after launch. Some things can break GTranslate's proxy:

- Heavy client-side rendering. If content only appears after JS execution, GTranslate may miss it. Flag any component that renders critical content client-side.
- Dynamic content loaded via fetch after page load. GTranslate sees the initial HTML. Flag content that loads dynamically.
- Custom fonts that don't load over CORS. GTranslate's cached pages may break font rendering.
- Inline SVG with text. GTranslate may or may not translate text inside SVG. Flag any SVG that contains user-visible English copy.
- Aria labels and alt text. GTranslate should translate these but only if they're in the initial HTML.

Report any pattern that could cause GTranslate to fail or produce broken translations.

## Output format

Save findings to `_docs/audits/seo-audit-YYYY-MM-DD.md`.

Sections:

1. URL preservation table. Pass or fail per WordPress URL. Most important section.
2. [lang] segment removal scope. What needs to change.
3. Sitemap and robots findings.
4. Head tags and meta findings.
5. Structured data findings.
6. Content SEO findings.
7. Performance signals.
8. Yoast feature parity.
9. GTranslate compatibility risks.

For each finding include:
- File path. Line number if relevant.
- WordPress URL affected.
- What's wrong. One sentence.
- Severity. Critical, high, medium, low.
- Suggested fix. One line.

At the end:
- Total counts by severity.
- Top 5 fixes ranked by impact on launch.
- Anything that needs running the site or external tools to verify.

Don't fix anything in this pass. Report only.

## Critical reminders before you start

- Do not change any URL. Not slugs. Not paths. Not trailing slashes. Not case.
- Do not introduce 301 redirects. The plan is zero redirects.
- Do not modify `src/lib/seo.ts`, `src/app/sitemap.ts`, or `src/app/robots.ts` without flagging it explicitly first.
- Do not remove the `[lang]` segment in this pass. Just report on the scope.
- Do not generate sitemap entries for pages that don't exist.
- If you find a slug mismatch between Next.js and WordPress, the Next.js slug must change to match WordPress. Not the other way around.
