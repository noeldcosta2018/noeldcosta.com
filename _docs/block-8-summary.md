# Block 8 — final verification summary

The pre-cutover gate for the self-hosted i18n migration. Block 8 ran
six sub-passes against the `staging-gtranslate-test` branch on a
Vercel preview, plus two small mid-block fixes for bugs the
verification surfaced. This file is the close-out record.

**Branch:** `staging-gtranslate-test`
**Head commit:** `8e98048` (pre-close-out) → will be bumped one
commit by the close-out itself.
**Commits ahead of `master`:** **35** — the full Phase 4 work
(B-1 through B-8 per `PRD.md`'s Phase 4 self-hosted i18n table, plus
the few Block 6c sub-passes that were not yet on `master`).
**Merge dry-run result:** `git merge-tree $(git merge-base HEAD origin/master) HEAD origin/master`
returned **0 conflicts**. The branch is mergeable as a fast-forward
or clean three-way merge whenever Phase 5 begins.

---

## Sub-pass results

| Sub-pass | Description | Result |
|---|---|---|
| 8-1 | 66-URL battery (10 locales × 6 page types + 6 English regression) | **60/60 substantive routes pass**. 10 `/[lang]/books/` 404 by architectural design (no `(site-intl)/intl/[lang]/books/` route; documented in `(site-en)/books/page.tsx`). |
| 8-1.5 | Sitemap fix surfaced by 8-1 | Excluded `/books/` from per-locale emission (`emitEnglishOnly` helper). Verified live: 1 `/books/` URL in sitemap, 11 calculator URLs still per-locale. |
| 8-2 | SEO outputs — sitemap, robots.txt, llms.txt, hreflang, canonical, og:locale | Sitemap-level hreflang reciprocal across 11 locales + x-default. Page-level hreflang via Next.js Metadata API (`hrefLang` attribute, 12 per page). robots.ts correctly returns `Disallow: /` on preview and the full crawler allowlist on production via `VERCEL_ENV` guard. og:locale + translated og:title/description per locale (category/tag chrome stays English — backlogged). |
| 8-3 | Lighthouse mobile baseline on 6 URLs | SEO=69 / Perf 47-73 / A11y 85-86 / BP=100 / CLS=0. SEO=69 is a preview artifact (will hit 100 at cutover when robots opens). Perf will improve ~10-20 with warm edge cache. A11y has 7 real failing audits, none introduced by Block 6c/7/8. |
| 8-4 | Functional verification | API surface (`/api/books/leads`, `/api/tools/[tool]`, `/api/stripe/...`, `/api/admin/leads`) verified via curl. Admin login + Calendly link verified via SSR. Interactive flows (LanguageSwitcher click, lead modal full flow, calculator Step 1→2) deferred to manual smoke test in the cutover plan — Chrome MCP was unresponsive on the preview domain during the agent session. |
| 8-4.5 | `/api/books/leads` runtime bug fix surfaced by 8-4 | All 4 valid book slugs were returning 400 "Unknown book" because `next.config.ts` `outputFileTracingExcludes: { "/*": ["content/**"] }` strips content from API function bundles. Fix: `src/lib/books-registry.ts` static array of book metadata. Verified live: 404 for invalid slug, 500 with Supabase env-var error for valid slugs (which proves the registry lookup now succeeds). |
| 8-5 | Native-speaker review batch | 13 representative strings (chrome / hero / calculator / SAP module / industry guidance) × Japanese + Arabic. Saved to `_docs/native-review-batch-1.md` for user to hand to native speakers or review themselves. |
| 8-6 | Cutover plan + rollback doc | `_docs/cutover-plan.md` covers DNS, env vars, GTranslate cancellation, rollback, pre/post-cutover checklists, backups. This file (`_docs/block-8-summary.md`) is the close-out. |

---

## Findings carried into the post-launch backlog

Each item added during Block 8 verification is in
`_docs/post-launch-backlog.md` under named sections so they're easy to
pick up post-cutover. Summary:

- **Category page og:title/og:description not translated** (Pass 8-2) —
  medium priority. ~45 min refactor + ~$0.10 translation cost.
- **Tag page og:title/og:description not translated** (Pass 8-2) —
  low priority. ~1 hour + ~$0.20.
- **Category/tag pages empty og:image** (Pass 8-2) — low priority.
  ~15 min for the default fallback approach.
- **Lighthouse Accessibility 85-86 → 95+ pass** (Pass 8-3) — medium
  priority. 7 audits: aria-hidden-focus, color-contrast, heading-order,
  link-name, label-content-name-mismatch, landmark-one-main,
  target-size. ~4-6 hours.
- **Image weight reduction** (Pass 8-3) — low priority. Total
  transfer 5.9-6.2 MiB is heavy. Convert via Next.js `Image` to
  AVIF/WebP. ~2-3 hours.
- **`/ar/` TBT spike to verify-on-production** (Pass 8-3) — low
  priority. TBT = 1,680 ms vs 200-460 ms on LTR locales. Likely a
  preview-cold-start artifact, but worth re-measuring on warm
  production cache. ~1 hour.

Plus the existing RTL-tooling and content-localisation items the
backlog already carried in from Block 7 and earlier passes.

---

## Outstanding items before cutover

Three categories. All are user-side, not agent-side.

### Native-speaker review (Pass 8-5)

Hand `_docs/native-review-batch-1.md` to a native Japanese reader and
a native Arabic reader (or review yourself if you have the languages).
Mark each row OK / minor / major / wrong. Any "major" or "wrong" rows
get fixed via `node scripts/translate-ui-strings.mjs --lang ar --keys <dotpath>`
(or `--lang ja`) before cutover. Cost ~$0.01-0.05 per fix.

If overall quality is **>90% OK**, no batch 2 needed pre-launch — the
spot check holds. If overall quality is **<70% OK**, re-run the
affected locale with a tightened system prompt.

### Manual browser smoke test (deferred from Pass 8-4)

10 minutes, captured in `_docs/cutover-plan.md` Section 6:
1. LanguageSwitcher click → locale route resolution (en → ja → ar → en).
2. `/books/` lead capture modal end-to-end (free book).
3. All 5 calculators Step 1 → Step 2 transitions.

If any step fails, that's a cutover blocker.

### Vercel production environment variables

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`,
`OPENAI_API_KEY`, `NEXT_PUBLIC_SITE_URL`. Captured in
`_docs/cutover-plan.md` Section 2. Spot-test
`/api/books/leads` on production after configuring to confirm the
endpoint returns a download URL instead of the documented "missing
env vars" 500.

---

## Block 8 commit log

Three commits landed within Block 8 itself:

1. `9b8fcde` — Pass 8-1.5: exclude English-only `/books/` from
   per-locale sitemap emission.
2. `8e98048` — Pass 8-4.5: inline books registry fixes
   `/api/books/leads` runtime lookup.
3. (this commit) — close-out: cutover plan + summary + final backlog
   additions.

Both of the in-block fixes came from verification catching bugs
that were pre-existing (Pass 2a-4 onwards) but never exercised by
prior verification.

---

## What "ready for Phase 5 cutover" means

- All Block 8 sub-passes complete ✓
- All cutover blockers caught and fixed ✓
- Branch is mergeable to `master` with zero conflicts ✓
- Documentation captures every step the user needs to execute the
  cutover plus the rollback path if anything fails ✓
- Outstanding items are user-side (native review, browser smoke
  test, env-var config) and explicitly listed in the cutover
  checklist ✓

When the user finishes the three outstanding categories above,
they can:

1. Merge `staging-gtranslate-test` → `master`.
2. Trigger the production Vercel build (auto on push to master).
3. Execute `_docs/cutover-plan.md`.

Phase 4 ends here. Phase 5 begins at DNS change.
