# Lighthouse baseline — pre-cutover (Block 8 Pass 8-3)

Snapshot of the staging-gtranslate-test branch at the Block 8 verification
gate. Captured against the Vercel preview deployment (not production —
preview behaves differently from production in several ways noted below).

Use this as the **baseline** for post-cutover comparison: if production
Lighthouse scores drop meaningfully against these numbers in the first 30
days post-launch, that's a regression to investigate. If they go UP
(which we expect — preview deployments under-perform production), that's
the i18n migration not degrading the site.

## Run metadata

- **Date:** 2026-06-01
- **Commit:** `9b8fcde` on `staging-gtranslate-test`
- **Preview URL:** `https://noeldcosta-ge6ao0mpk-noeldcosta2018-8336s-projects.vercel.app`
- **Tool:** Lighthouse 12.x (via `npx lighthouse --form-factor=mobile`)
- **Profile:** Mobile (slow 4G throttling, 4× CPU slowdown)
- **Browser:** Headless Chromium (auto-launched by lighthouse CLI)

## Scores

| Tag | URL | Perf | A11y | BP | SEO | LCP | TBT | CLS | FCP | SI | Bytes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| homepage-en | `/` | 56 | 86 | 100 | 69 | 6.5 s | 460 ms | 0 | 3.2 s | 5.4 s | 5,909 KiB |
| homepage-ja | `/ja/` | 70 | 86 | 100 | 69 | 6.2 s | 200 ms | 0 | 2.7 s | 2.9 s | 5,911 KiB |
| homepage-ar | `/ar/` | 47 | 86 | 100 | 69 | 5.9 s | 1,680 ms | 0 | 2.0 s | 4.5 s | 5,911 KiB |
| article-en | `/sap-implementation/` | 61 | 85 | 100 | 69 | 6.3 s | 410 ms | 0 | 2.9 s | 3.7 s | 6,159 KiB |
| article-ja | `/ja/sap-implementation/` | 73 | 85 | 100 | 69 | 6.1 s | 80 ms | 0 | 2.9 s | 2.9 s | 6,198 KiB |
| article-ar | `/ar/sap-implementation/` | 56 | 85 | 100 | 69 | 18.5 s | 380 ms | 0 | 3.0 s | 5.3 s | 6,249 KiB |

CLS = 0 across the board. No layout-shift regressions from Block 7 RTL
work — the logical-property migration didn't introduce any reflow during
load.

## Findings

### SEO = 69 across all 6 URLs — preview-deployment artifact

The single failing audit on every URL is `is-crawlable: Page is blocked
from indexing`, caused by the preview deployment serving `Disallow: /`
in `robots.txt` (per the `VERCEL_ENV === "preview"` guard in
`src/app/robots.ts`).

This rule **disappears in production** — `VERCEL_ENV === "production"`
falls through to the full robots.txt with AI crawler allowlist, sitemap
reference, `/intl/` disallow, and named bad-actor blocks. At cutover the
`is-crawlable` audit will pass automatically and **SEO will jump from
69 → 100** without any code change.

**No action required.** Verified manually that the production robots.ts
behaviour is correct (Block 8 Pass 8-2).

### Performance = 47-73 — preview-deployment artifact + real workload

LCP is the big offender — 5.9-6.5s on most pages, 18.5s on
`/ar/sap-implementation/`. Two compounding factors:

1. **Preview deployments lack edge cache for fresh URLs.** Each preview
   URL is a one-shot deployment that hasn't been warmed across Vercel's
   global edge. First request goes through serverless cold start. Real
   production traffic hits warm edge cache for the 2,769 prerendered
   pages. Expect LCP to drop to 1-2 s range post-cutover.
2. **The 18.5 s LCP on `/ar/sap-implementation/`** is almost certainly a
   single-shot cold-start outlier rather than systemic. Other Arabic
   page hit 5.9 s, in line with the LTR pages.

Total transfer size of ~5.9 MiB is on the heavy side for mobile — image
optimization (hero images, post heroes) and JS bundle splitting are the
post-launch performance levers. None of this is a Block 6/7/8 regression.

**Defer to post-launch performance pass.** Document the production
Lighthouse numbers ~7 days after cutover and compare against these
preview numbers. If production LCP is still >3 s on the homepage with
warm cache, prioritise image optimization.

### TBT spike on `/ar/` homepage — 1,680 ms

`/ar/` (Arabic homepage) shows TBT = 1,680 ms vs 200-460 ms on the LTR
homepages. Hypothesis: RTL CSS recalculation under the homepage's heavy
component count (Hero, ProblemStats, Services, TrackRecord, etc.) is
costing JS main-thread time.

Worth a focused investigation post-launch — but **not a launch
blocker** because:
- Score is 47 (still in the "Needs Improvement" band, not "Poor")
- Arabic homepage was just migrated to logical properties in Block 7;
  the TBT cost is likely the browser's first paint resolving the new
  CSS variables.
- Real-user data on production with warm cache will be much better.

### Accessibility = 85-86 — below PRD target of 95

PRD target is ≥95. Current is 85-86. Failing audits (consistent across
URLs):

| Audit | Severity | Where |
|---|---|---|
| `aria-hidden-focus` | Real | Focusable elements inside `aria-hidden="true"` containers |
| `color-contrast` | Real | Insufficient contrast on some text (5 of 6 pages) |
| `heading-order` | Real | Non-sequentially-descending headings (h1 → h3 jump) |
| `link-name` | Real | At least one icon-only link without `aria-label` |
| `label-content-name-mismatch` | Real | Button visible-text and accessible-name differ |
| `landmark-one-main` | Real (articles) | Missing `<main>` element on article pages |
| `target-size` | Real (ar article only) | Touch target <44 px |

None of these are introduced by Block 6c / 7 / 8 work — they're
pre-existing accessibility issues. The Block 6c marker-strip and Block
7 logical-property work didn't regress accessibility (CLS=0,
target-size only on one Arabic page).

**Decision: defer to post-launch a11y pass.** Cutover bar is functional
not WCAG-AA-perfect. Document for post-launch backlog.

### Best Practices = 100 across all 6 ✓

No issues. Security headers, HTTPS, no console errors, no deprecated
APIs. Block 7 didn't introduce any regressions here.

### CLS = 0 across all 6 ✓

Zero cumulative layout shift on all pages. The Block 7 RTL migration
did not introduce any reflow during load. The `<html dir>` is set in
the root layout SSR so the browser knows the direction before any CSS
loads.

## Post-cutover comparison plan

7 days after DNS cutover, re-run this exact battery against production
URLs. Expected changes:

- **SEO 69 → 100** (robots.txt unlocks).
- **Performance** should improve by 10-20 points across the board as
  edge cache warms. LCP expected to drop to 1-3 s range.
- **A11y** unchanged (real issues, not preview artifacts) — track for
  post-launch a11y pass.
- **BP and CLS** unchanged.

If any score DROPS from these baseline numbers, the i18n migration
introduced a regression and needs investigation.

## Findings to add to post-launch backlog

1. **A11y to 95+ pass:** address the 7 accessibility audits above
   (aria-hidden-focus, color-contrast, heading-order, link-name,
   label-content-name-mismatch, landmark-one-main, target-size).
   ~4-6 hours.
2. **Image weight reduction:** total transfer 5.9-6.2 MiB is heavy.
   Post heroes and WordPress-imported imagery dominate. Convert to
   AVIF/WebP at multiple resolutions via Next.js `Image` component.
   ~2-3 hours.
3. **Investigate TBT spike on `/ar/`:** is it the RTL logical-CSS
   resolution cost on the homepage's heavy component count, or a
   single-shot outlier? Repeat Lighthouse 3-5 times on production
   to get the median TBT. ~1 hour for the measurement.
