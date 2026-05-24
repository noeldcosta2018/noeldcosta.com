# Phase 3. GTranslate setup and continuity

Use this AFTER mobile and SEO audits are complete AND the Next.js site is ready for launch (or in staging).

Read CLAUDE.md and AGENTS.md first. Then come back here.

## Context

The WordPress site uses GTranslate as a Translation Delivery Network. GTranslate is an external proxy that serves all `/{lang}/` URLs by fetching English content from the origin and translating it.

Traffic data shows roughly 90k non-English requests across Spanish, Japanese, Russian, French, Portuguese, German, Italian, Arabic, and Chinese (Simplified and Traditional). This traffic must be preserved through the migration.

The plan:
1. Next.js site serves English only at flat URLs (matches WordPress 1:1).
2. GTranslate continues to proxy translated URLs.
3. After DNS cutover, GTranslate's origin should point to the new Next.js site.

This document covers the setup and verification work.

## Goal

Verify GTranslate continues to work after the Next.js migration. Identify any breakage. Set up correctly.

## Step 1. Audit the current GTranslate setup

Before changing anything, document the current state.

- Log into the GTranslate dashboard.
- Note the current plan (Startup, Business, Enterprise, etc).
- Note the configured languages. Compare against the traffic data.
- Note the URL structure setting. Subdirectory or subdomain.
- Note the origin server configured in GTranslate. Currently the WordPress server.
- Export or screenshot the current configuration.

If access to the dashboard isn't available, fetch a few translated URLs and inspect the response headers and HTML structure to infer the setup:

- https://noeldcosta.com/es/
- https://noeldcosta.com/ja/
- https://noeldcosta.com/ru/
- https://noeldcosta.com/de/

Look for GTranslate-specific markers in the HTML. CSS classes, script sources, response headers.

## Step 2. Verify the Next.js origin is GTranslate-compatible

GTranslate proxies HTML. It needs to find translatable content in the initial HTML response. Things that break GTranslate:

- Content rendered only after JavaScript execution (CSR-only components).
- Content loaded via fetch after page load.
- Inline SVG with English text that isn't in alt text or accessible labels.
- Heavy client-side hydration that swaps content after first paint.

For each route on the Next.js site:

- View source. Confirm critical content is in the initial HTML.
- Disable JavaScript in the browser. Confirm the page still shows the main content.
- If content disappears with JS disabled, that content won't translate via GTranslate.

Flag every page where content depends on JS to render.

## Step 3. Test GTranslate against a staging Next.js site

Before DNS cutover, point GTranslate at the staging environment.

- Create a staging URL for the Next.js site (e.g. staging.noeldcosta.com or a Vercel preview URL).
- In the GTranslate dashboard, add a test configuration pointing to staging.
- Generate a temporary test URL like staging.noeldcosta.com/es/.
- Verify content loads. Verify translation quality matches the live site.
- Spot-check 5 pages across different sections (homepage, blog post, tool page, case study, contact).

Report what works. Report what breaks.

## Step 4. Compare URL coverage

GTranslate generates translated URLs for every English URL on the origin. After migration:

- The English URL list must match WordPress exactly (this is the SEO audit's job).
- GTranslate will then generate translated URLs for each new English URL.

For each WordPress translated URL that's currently indexed (check Search Console), confirm:

- The English version exists on the Next.js site at the matching path.
- GTranslate, pointed at Next.js, generates the same translated URL.

Use the language traffic data to prioritize. Spanish first (highest traffic), then Japanese, Russian, French, Portuguese, German, Italian, Arabic, Chinese.

Run a script if needed. For each WordPress page URL, request the equivalent translated URL on the staging GTranslate setup and confirm it responds with 200.

## Step 5. Sitemap considerations

GTranslate handles translated sitemaps on their proxy. The Next.js sitemap should:

- Contain only English URLs.
- Not include hreflang annotations (GTranslate adds these on the proxy).
- Match the WordPress English URL list exactly.

Verify the Next.js sitemap meets these requirements. The SEO audit should have caught this. Confirm here.

## Step 6. DNS and CDN configuration

The DNS setup for GTranslate typically involves:

- CNAME records for translated subdirectories (rare) or subdomain routing.
- Origin server configuration in GTranslate dashboard.
- Cache invalidation rules.

Document the current DNS setup. Plan the cutover. Coordinate with the Next.js deployment.

If using Vercel for Next.js:
- Vercel's edge network may interact with GTranslate's proxy. Test for double-caching issues.
- Vercel preview URLs may not work as GTranslate origins. Use a stable staging domain.

## Step 7. Post-launch verification

After DNS cutover, verify:

- All WordPress English URLs serve from Next.js. Use the wordpress-urls.md list.
- All GTranslate translated URLs continue to work. Sample at least 10 per active language.
- Search Console for any new 404 spikes or crawl errors.
- GTranslate dashboard for any failed translation jobs.

Set up monitoring for the first 30 days post-launch. Watch for ranking drops in non-English languages especially.

## Output format

Save findings to `_docs/audits/gtranslate-setup-YYYY-MM-DD.md`.

Sections:

1. Current GTranslate configuration. Plan, languages, origin, URL structure.
2. Next.js compatibility findings. Pages that may break translation.
3. Staging test results. What worked. What broke.
4. URL coverage check. Translated URLs that should exist post-launch.
5. Sitemap verification. Confirm Next.js sitemap is English-only and matches WordPress.
6. DNS and cutover plan.
7. Post-launch monitoring checklist.

## What you're explicitly NOT doing in this pass

- Not rebuilding translations natively in Next.js.
- Not switching translation vendors.
- Not modifying GTranslate's translation quality.
- Not changing the English URL structure.

Just verifying GTranslate continues to work after the migration.
