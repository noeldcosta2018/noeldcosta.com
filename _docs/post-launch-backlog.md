# Post-launch backlog

Items deferred from Phase 4 (the self-hosted i18n migration). None are
launch blockers — Phase 5 cutover ships without them. Listed by
priority. Cross-references the audit doc at
`_docs/audits/phase-4-comprehensive-review-2026-05-26.md` where
applicable.

## i18n — UI strings still inline

### Branded 404 for unmatched URLs
**Source:** Pass 2a-4.
**What:** `src/app/(site-en)/not-found.tsx` (added in Pass 2a-4) catches
`notFound()` calls inside the (site-en) route tree. It does NOT replace
the Next.js default 404 ("This page could not be found") for true
unmatched URLs. With the multi-root-layout architecture from Block 6a.2
plus `dynamicParams: false` on the catch-all routes, Next.js 404s at
the routing layer before any segment's `not-found.tsx` is consulted.
**Fix:** Create root-level `src/app/not-found.tsx` with its own
`<html>` + `<body>` (since there's no app-level layout — only the
route-group layouts). Reuse the `RootLayoutShell` pattern from Block
6a.2 to share the body chrome. Detect locale at the unmatched-URL
boundary (cannot use `usePathname` in a server component; consider a
client component with usePathname, OR static fallback to English).
**Estimate:** 2-3 hours.
**Priority:** Low. Default Next.js 404 is functional, just unbranded.

### LeadCaptureModal.tsx UI strings (~25)
**Source:** /superpowers review §2.8 + audit doc lines 1023-1048.
**What:** The book request modal has validation errors, success
messages, form labels, and CTAs all hardcoded inline. Pass 1
infrastructure has the `leadCapture.*` namespace ready with most keys
populated, but the component wasn't refactored in Pass 2a-4 (medium-
sized — ~25 strings — and out of the user's listed scope).
**Fix:** Same pattern as BookCard.tsx (Pass 2a-4): client component,
auto-detect locale via `usePathname`, wire to `m.leadCapture.*`.
**Estimate:** 1-2 hours.
**Priority:** Medium. Book purchase flow uses the modal; non-English
users see English errors today.

### TrackRecord PROJECTS tag arrays (~25 strings)
**Source:** Pass 2a-2 + 2a-2 TrackRecord extension.
**What:** PROJECTS_STATIC retains 5 projects × 4-6 tags (~25 strings)
as inline data. Tags mix proper nouns (`EDGE HQ`, `NIMR`, `HALCON`,
`SAP COE`, `Route P&L`, `S/4HANA`, `Azure`, `AWS`, `Oracle EBS`) with
descriptive labels (`Finance`, `Banking`, `Public Sector`, `Strategy`,
`Cash + Accrual`, `Hypercare`, `Enterprise Arch`). Pass 2a-2's
TrackRecord extension extracted title/desc/metric labels with
`<noTranslate>` markers but left tags inline.
**Fix:** Extract translatable tags to MESSAGES with `<noTranslate>`
markers around proper nouns. Each project gets a `tags: string[]` in
the messages record.
**Estimate:** 1 hour.
**Priority:** Low. Tags are visually compact badges; partial English on
translated routes is acceptable for now.

### AICapabilities TERMINAL_LINES + STACK_TAGS
**Source:** Pass 2a-2.
**What:** The terminal demo (5 JSX lines with embedded `<strong>` tags,
colored spans, proper nouns `PO-4891`, `MX-220`, `Q3`, `Aug 15`) and
the 6 stack-tag labels (`SAP Business AI`, `Joule`, `SAP BTP`,
`Datasphere`, `Analytics Cloud`, `Custom Agents`) stay inline. The SAP
product names are do-not-translate; the surrounding chrome is.
**Fix:** Either (a) translate inline-tagged JSX templates by splitting
each terminal line into 2-3 keys plus inline proper nouns/numerics, or
(b) keep the terminal demo English-only and translate only the
surrounding section chrome (which is already done).
**Estimate:** 2-3 hours for option (a); 0 for option (b).
**Priority:** Low. Terminal demo is a stylized tech showcase, not core
marketing copy.

### Consolidate `bcp47()` and `detectLocale()` helpers
**Source:** Pass 2b-1a.
**What:** `detectLocale(pathname)` is now duplicated in 9 client components
(Nav, Footer, Services, Tools, TrackRecord, StickyCTA, LanguageSwitcher,
BookCard, BooksHeroIntro, plus ErpCostClient added in 2b-1a). `bcp47(locale)`
is duplicated in 2 places (ArticleHero, ErpCostClient). Same code, copy-
pasted. Each new client component refactor adds another copy.
**Fix:** Extract both to `src/lib/i18n/locale-helpers.ts` as named exports.
Update every duplication site to import from the shared module. Delete the
local definitions. Zero behaviour change.
**Estimate:** 30 min.
**Priority:** Low. Pure refactor; pre-existing pattern. Worth doing before
the next big i18n pass to prevent further drift.

### Tool ARIA labels and `usePathname` switcher positioning
**Source:** Pass 2a-4 LanguageSwitcher review.
**What:** LanguageSwitcher's `aria-label="Select language"` is wired
(Pass 2a-4), but the floating positioning uses CSS `right:` and
`safe-area-inset-right` — flagged in /superpowers review §2.5 as not
flipping for RTL.
**Fix:** Replace physical-property CSS with logical properties
(`insetInlineEnd`, `safe-area-inset-end`) so the switcher pins to the
trailing edge on Arabic (left side) instead of always right. Part of
Block 7 RTL CSS work.
**Estimate:** 15 min (LanguageSwitcher specifically); see Block 7 for
the broader audit.
**Priority:** Medium. Block 7 will address as a batch.

## Quality

### Translated MDX quality not verified by native speakers
**Source:** /superpowers review §1.5 + §6.2 [I-5].
**What:** 1,170 translated MDX files generated by GPT-5.4. Only a few
spot-checks performed. No native-speaker review on Arabic, Japanese,
or German (top 3 markets).
**Fix:** Send 3-5 representative URLs to one native speaker each.
**Estimate:** 1 hour coordination + speaker time.
**Priority:** **HIGH before Phase 5 cutover.** Listed here because it's
not strictly a code/infra task, but should not be silently skipped.

### Currency formatting in calculators
**Source:** /superpowers review §6.3 [N-5] + audit doc lines 1140-1170.
**What:** Hand-rolled `$` prefix throughout calculators (ErpCostClient,
SapCostClient, MigrationClient, books pricing) and book pricing in
LeadCaptureModal. No per-locale currency.
**Fix:** Decide currency policy first (stay USD across all locales? or
localize?), then update `Intl.NumberFormat` calls to be locale-aware.
**Estimate:** 2-3 hours after policy decided.
**Priority:** Low. USD is universally understood; localization is
polish.

## Performance / Dev experience

### React `react-markdown` key-prop warnings (~180 in dev console)
**Source:** /superpowers review §2.9 + §6.3 [N-1].
**What:** `MdxBody.tsx` uses `rehypeAutolinkHeadings` with `wrap`
behavior, which causes nested elements without explicit `key` props
during MDX rendering. Dev console only; production HTML unaffected.
**Fix:** Switch `behavior: "wrap"` to `behavior: "append"` (visual
change — heading anchors become trailing icons) OR upgrade
`rehype-autolink-headings` to a version that emits keys for wrapped
elements OR replace `react-markdown` with a custom MDX compiler.
**Estimate:** 1-2 hours for the cheapest option.
**Priority:** Low. Cosmetic; doesn't affect production users.

### Bundle analyzer baseline
**Source:** /superpowers review §3.2 + §6.3 [N-2].
**What:** No bundle size baseline captured. Useful for future
regression tracking.
**Fix:** Run `next build --bundle-analyzer` (or equivalent), save the
output to `_docs/audits/`.
**Estimate:** 30 min.
**Priority:** Low.

### `.env.example` for contributors
**Source:** /superpowers review §3.5 + §6.3 [N-3].
**What:** `.env.local` is gitignored correctly; no example file
documents required env vars.
**Fix:** Create `.env.example` with placeholder keys (OpenAI, Supabase,
Stripe, etc.).
**Estimate:** 15 min.
**Priority:** Low. Only relevant when more contributors join.

### Sitewide JSON-LD `inLanguage: "en"` hardcoded
**Source:** /superpowers review §6.3 [N-4].
**What:** `websiteJsonLd()` and `personJsonLd()` in `src/lib/seo.ts`
hardcode `"en"` for `inLanguage`. The entity itself is English-named
but the JSON-LD could be locale-aware.
**Fix:** Pass locale into the JSON-LD builders; emit `inLanguage`
matching the served locale.
**Estimate:** 20 min.
**Priority:** Low. Defensible as-is; the entity is English-named.

## Audits / process

### Mobile audit (PRD M-04)
**Source:** PRD Phase 1.5 + /superpowers review §6.2 [I-6].
**What:** Mobile responsiveness audit prompt at
`_docs/audits/_prompts/audit-1-mobile.md` has been pending. Critical
mobile issues should be fixed before cutover.
**Fix:** Run the prompt; address ship-blocker issues only.
**Estimate:** 1-2 hours.
**Priority:** **HIGH before Phase 5 cutover.**

### Lighthouse audit (PRD L-01)
**Source:** PRD Phase 5 + /superpowers review §4.4.
**What:** Lighthouse mobile + desktop scores pending. Target:
Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100.
**Fix:** Run Lighthouse on representative URLs (homepage, an MDX page,
a category index, /books/). Document scores in `_docs/audits/`.
**Estimate:** 30 min.
**Priority:** **HIGH before Phase 5 cutover.**

### Cross-browser test (PRD L-04)
**Source:** PRD Phase 5 + /superpowers review §6.2 [Block 8].
**What:** Chrome, Safari, Firefox, Edge rendering across desktop +
mobile, covering English + /ja/ + /ar/ + /de/.
**Fix:** Manual real-device check.
**Estimate:** 2-3 hours.
**Priority:** **HIGH before Phase 5 cutover.**

## RTL — design decisions and deferred polish

### RTL flow reversal — design decisions
**Source:** Block 7 Phase 1 inventory.
**What:** `src/components/article/diagrams/CompareSplit.tsx` renders
two side-by-side panels (e.g. greenfield vs brownfield, big-bang vs
phased). Under `<html dir="rtl">` the panels naturally swap visual
order — what was on the left now renders on the right, and vice versa.
**Decision:** RTL flow reversal accepted as natural reading order. Do
not force original visual order with `rtl:flex-row-reverse` or
similar. Rationale: in RTL the reader's eye moves right-to-left, so
the "primary option then comparison option" semantic flow stays
correct after the visual swap. Trying to lock the left/right physical
order would feel awkward to native RTL readers — the diagram should
read like the surrounding prose, not as an embedded LTR island.
**Estimate:** N/A — explicit decision, no work required.
**Priority:** Documented for reviewer reference.

### Low-severity physical-property holdouts
**Source:** Block 7 Phase 1 inventory, low-severity tier.
**What:** A few small physical-property usages were deferred because
they don't render under Arabic or have no visible asymmetry:
- `src/components/tools/ToolShell.tsx:77` — symmetric `paddingLeft` /
  `paddingRight` clamp values (cosmetic, no asymmetry).
- `src/components/books/BookAccordion.tsx:55` — `text-left` on
  accordion header. Arabic content right-aligns via bidi anyway, but
  `text-start` is the explicit/canonical replacement.
- `src/components/books/LeadCaptureModal.tsx:215` — modal close button
  pinned `absolute top-2 right-2`. RTL convention varies; many web
  apps keep close-X in the same physical corner regardless of dir.
- `src/components/admin/BookLeadsTable.tsx:194` — internal admin tool,
  English-only.
- Calculator clients under `src/app/(site-en)/` — English-only routes
  by design; Arabic users land on MDX intro pages, not the React
  widgets. Includes ErpCostClient, SapCostClient, MigrationClient,
  JdClient, SolutionClient.
**Fix:** Replace each `ml-*` / `mr-*` / `pl-*` / `pr-*` / `text-left`
/ `text-right` / `left-*` / `right-*` / `border-l*` / `border-r*` /
`rounded-l*` / `rounded-r*` / `bg-gradient-to-r` with its logical
equivalent. Run `node scripts/check-rtl-properties.mjs` to enumerate.
**Estimate:** 2-3 hours for all holdouts.
**Priority:** Low. Defer until calculator localisation (separate
post-launch initiative) so we don't churn those files twice.

### Wire RTL audit script into CI in strict mode
**Source:** Block 7 Phase 2.
**What:** `scripts/check-rtl-properties.mjs` is warn-only today. Once
the low-severity holdouts above are migrated, flip the script into
strict mode by adding `npm run check-rtl` to the `lint` script in
`package.json` (or a pre-commit hook).
**Fix:** Two lines in `package.json`. Trivial once holdouts are
clear.
**Estimate:** 5 minutes.
**Priority:** Low. Backstop for after the manual cleanup completes.

## Category/tag pages — SEO metadata in translated locales

### Category page og:title/og:description not translated
**Source:** Block 8 Pass 8-2.
**What:** On `/<lang>/category/<slug>/` pages, `og:locale` correctly
reflects the locale (e.g. `ja_JP`), `og:url` is correctly the
locale-prefixed URL, and the page body content is translated — but
`og:title` and `og:description` render the English-only values pulled
from the `CATEGORIES` static constant in `src/lib/content.ts`
(e.g. "SAP Modules" / "Deep technical coverage of SAP and ERP modules.").
Social-share previews on Twitter / Facebook / LinkedIn for translated
category URLs therefore show an English title with a translated URL.
**Fix:** Extend MESSAGES schema with `categoryMeta.<slug>.label` and
`categoryMeta.<slug>.description` sub-namespaces. Populate English
values, run `--keys` translation pass across 10 locales. Update the
category route metadata to pull from MESSAGES.
**Estimate:** ~45 min refactor + ~$0.10 translation cost.
**Priority:** Medium.

### Tag page og:title/og:description not translated
**Source:** Block 8 Pass 8-2.
**What:** Same pattern as the category-page finding above, applied to
`/<lang>/tag/<slug>/`. `og:title` and `og:description` come from the
`tagMeta.ts` static constants and render English on translated routes.
**Fix:** Extend MESSAGES schema with `tagMeta.<slug>.label` and
`tagMeta.<slug>.description`. There are ~50+ WordPress tags, so the
translation cost is larger than the category equivalent.
**Estimate:** ~1 hour refactor + ~$0.20 translation cost.
**Priority:** Low. Tag pages are deeper in the site than category
indexes; lower share-volume impact.

### Category/tag pages have empty og:image
**Source:** Block 8 Pass 8-2.
**What:** `/category/<slug>/` and `/tag/<slug>/` render `og:image`
with empty `content=""`. Social-share previews fall back to no-image
OG cards (less engaging than image-bearing cards). Pre-existing,
unrelated to i18n migration.
**Fix:** Provide a default site OG image (e.g. `/og-default.png`) when
the page itself doesn't have a hero, or add per-category hero images
in `CATEGORIES` / `tagMeta`.
**Estimate:** ~15 min for the default fallback approach.
**Priority:** Low.

## Lighthouse follow-ups (Block 8 Pass 8-3)

### Accessibility pass to 95+
**Source:** Block 8 Pass 8-3 (`_docs/lighthouse-baseline.md`).
**What:** Mobile Lighthouse scored Accessibility 85-86 across 6
sample URLs against the PRD target of ≥ 95. Seven failing audits,
all pre-existing (not introduced by Block 6c / 7 / 8):
- `aria-hidden-focus` — focusable elements inside `aria-hidden="true"`
- `color-contrast` — insufficient contrast on some text
- `heading-order` — non-sequentially-descending headings (h1 → h3 jumps)
- `link-name` — at least one icon-only link without `aria-label`
- `label-content-name-mismatch` — visible text vs accessible name
- `landmark-one-main` — articles missing `<main>` element
- `target-size` — at least one touch target < 44 px (ar article)
**Fix:** Dedicated a11y pass. Address audits in the order above
(start with the structural ones — landmark-one-main, heading-order,
link-name — since those have ripple effects).
**Estimate:** 4-6 hours.
**Priority:** Medium. Not a cutover blocker; PRD L-03 will gate this
formally pre-launch but this captures the audit-level finding.

### Image weight reduction
**Source:** Block 8 Pass 8-3 (`_docs/lighthouse-baseline.md`).
**What:** Total page transfer 5.9-6.2 MiB on mobile per Lighthouse.
Post heroes and WordPress-imported imagery dominate. Largest single
factor in the Perf 47-73 scores. Will partially auto-improve at
cutover (warm edge cache), but real fix is image-format optimization.
**Fix:** Convert WordPress-imported `/images/wp/...` heroes to
AVIF/WebP at multiple resolutions via Next.js `Image` component
(currently using raw `<img>` tags in MDX for WordPress paths). Add
`<Image>` wrapper for non-MDX hero usage.
**Estimate:** 2-3 hours.
**Priority:** Low. Cosmetic / score-improving, not functional.

### `/ar/` TBT spike — verify on production
**Source:** Block 8 Pass 8-3 (`_docs/lighthouse-baseline.md`).
**What:** `/ar/` homepage shows Total Blocking Time = 1,680 ms vs
200-460 ms on LTR homepages. Likely a preview-cold-start artifact
(the Arabic homepage was migrated to logical properties in Block 7
and may need a first paint to resolve the CSS variables), but worth
re-measuring on production with warm edge cache. If it persists in
production, it's a real UX regression for the Arabic market.
**Fix:** Re-run Lighthouse on `/ar/` from production 7 days
post-cutover (median of 3-5 runs). Compare to LTR locales. If
sustained spike, investigate via Chrome DevTools Performance
panel — likely candidates are RTL CSS layout recalculation, a
client component that does extra work under RTL, or font-loading
order.
**Estimate:** 1 hour for the measurement; 2-4 hours if the issue
turns out to be real and needs root-cause investigation.
**Priority:** Low-medium. Re-measure on production warm-cache
before deciding fix urgency. Bump to medium if TBT > 800 ms
persists post-cutover — the Arabic market is the localization's
highest-traffic non-English locale per Search Console data.

## Adding to this file

Append new deferred items as they emerge. Keep entries terse: source,
what, fix, estimate, priority. Cross-reference the audit doc when
applicable. When an item is addressed, move it to a "Completed" section
at the bottom with the commit/PR reference, rather than deleting it
outright — keeps a record of what was deferred and when it was picked
up.
