# Translation architecture decision — self-host with next-intl + Google NMT

**Date:** 2026-05-25
**Author:** Claude (feasibility analysis)
**Status:** DRAFT for Noel's review. No code written.
**Decision under analysis:** Replace GTranslate proxy with self-hosted translation, served from the Next.js origin under `/{lang}/` sub-directories using `next-intl` (or equivalent). URL structure preserved.

This is a feasibility document. It does not approve the path, it scopes it. The current playbook still says "GTranslate stays externally"; if this analysis is accepted, the playbook, PRD, and CLAUDE.md all need updating in lockstep (called out in section 9).

## Important up-front finding

**The codebase already contains ~1,500 translated MDX files**, hand-cleaned from a GTranslate scrape, in 13 languages (ar, de, es, fr, hi, it, ja, ko, nl, pt, ru, tr, zh). Both `content/posts/` and `content/pages/` carry one MDX per locale. Frontmatter is locale-aware (`locale`, `translatedFrom`, `translationSource`, `canonicalUrl: "https://noeldcosta.com/{lang}/..."`). `src/lib/locales.ts` exports `LOCALES`, `TIER_1_LOCALES`, `RTL_LOCALES`. `src/lib/content.ts` already has `getPost(slug, locale)` and `resolveWithFallback` that returns English when a translation is missing.

This invalidates the cost framing in the question. The translation pipeline is mostly already executed. The actual work is:
1. Add the missing languages (search-console-findings.md lists 6 we currently lack: `el`, `zh-CN`/`zh-TW` split, `hr`, `ka`, `ml`, `da`, `tl` — Greek being the highest-stakes at 1,143 clicks/16mo)
2. Re-introduce `/{lang}/` routing at the App Router layer (the catch-all currently hardcodes `"en"`)
3. Build the SEO outputs (hreflang, localized sitemap, localized canonicals, localized JSON-LD)
4. Build the language switcher
5. Establish the maintenance pipeline for when English content changes

This changes the calculus for the GTranslate-vs-self-host decision materially. Read section 10 first if you only have time for one section.

---

## 1. Routing architecture

### Current state

`src/app/(site)/*` serves English at flat URLs. No `[lang]` segment. The catch-all `src/app/(site)/[...slug]/page.tsx` resolves multi-segment paths from `frontmatter.originalUrl` but calls `getPost(lastSlug, "en")` / `getPage(lastSlug, "en")` with `"en"` hard-coded. No `middleware.ts` exists. `next.config.ts` has no `i18n` block (App Router does not use the Pages-Router `i18n` config anyway).

### Target state

Serve English at flat URLs (e.g. `/sap-implementation/for-manufacturing/`) AND every other supported locale at `/{lang}/...` (e.g. `/ja/sap-implementation/for-manufacturing/`). The flat English URL is the canonical for English; each `/{lang}/` URL is the canonical for that language.

### Three approaches

#### Approach A — Single `[lang]` segment + middleware (next-intl conventional)

```
src/app/
  [lang]/
    (site)/
      page.tsx                 → /en/, /ja/, etc.
      [...slug]/page.tsx       → /en/foo/, /ja/foo/bar/
  ...
middleware.ts                  → rewrite "/" → "/en/", set locale on request
```

`next-intl`'s standard pattern. The middleware intercepts requests without a locale prefix and rewrites them internally (or 308-redirects). Locale flows to every page via params.

**Pro.** Best-supported pattern. Documentation is dense. Type-safe locale params. `useTranslations()` and `getLocale()` work out of the box. SSG static-generation works cleanly via `generateStaticParams`.

**Con.** Forces English under `/en/` by default, which **violates the zero-redirect URL contract** — `/sap-implementation/for-manufacturing/` would either 308 to `/en/sap-implementation/for-manufacturing/` (one redirect, breaks the contract) or the middleware silently rewrites internally (no redirect, but the URL in the address bar stays bare and the SEO canonical becomes ambiguous). The "as-needed" prefix mode in next-intl gets us close — English stays bare, other languages get prefixed — but it has known sharp edges around static rendering and `generateStaticParams`.

**Effort.** 2–3 days for routing scaffolding, 1 day to validate against all 250+ URLs.

#### Approach B — Two parallel route trees, no middleware

```
src/app/
  (site)/                      → English at root (current state, unchanged)
    page.tsx
    [...slug]/page.tsx
  [lang]/                      → all other locales
    (site)/
      page.tsx
      [...slug]/page.tsx
```

The flat tree keeps the English contract intact. The `[lang]/` tree only matches when the first segment is a known locale code (statically generated via `generateStaticParams`). No middleware is needed: Next.js's routing already picks the most specific match.

**Pro.** Zero impact on the English URL contract — `/sap-implementation/for-manufacturing/` resolves through the existing `(site)/[...slug]` path with no rewrite, no redirect, no header sniffing. The `[lang]` tree runs in parallel for translated traffic. Static generation works because the catch-all already pre-renders nested paths via `pathSegmentsFromOriginalUrl`. Easy to reason about. The `lang` param is explicit; no implicit "default locale" magic.

**Con.** Slight duplication: `[lang]/(site)/page.tsx` is mostly a thin wrapper passing `params.lang` to the same components that `(site)/page.tsx` uses. Layouts need to be shared explicitly via component composition. Some next-intl helpers expect a single locale segment at the top; we'd use next-intl mostly for string-bundle translation (UI chrome) and roll the URL resolution ourselves (which is already 80% built — see the existing `resolveWithFallback`).

**Effort.** 1–2 days. The existing catch-all does most of the heavy lifting; we add a `[lang]/(site)/[...slug]/page.tsx` that calls `getPage(lastSlug, params.lang as Locale)` instead of `"en"`. Most of the work is in SEO outputs (sitemap, hreflang, canonical), not routing.

#### Approach C — Single catch-all, locale parsed from slug array

```
src/app/(site)/[...slug]/page.tsx
```

The existing catch-all detects when `slug[0]` is a known locale code and shifts the rest of the segments by one. Single tree, no `[lang]`.

**Pro.** Smallest diff — only the catch-all changes. No new route folders.

**Con.** Locale handling is implicit and easy to break. Every helper that takes a `slug[]` has to know to check for a locale-prefix first. `generateStaticParams` becomes more involved (it must emit both `["sap-implementation","for-manufacturing"]` and `["ja","sap-implementation","for-manufacturing"]`). Easier to get wrong; less obvious to a future contributor.

**Effort.** 1 day raw, but higher long-term cognitive cost.

### Recommendation

**Approach B.** It preserves the English URL contract (no rewrites, no 308s), uses the routing infrastructure that already works (the `(site)/[...slug]/page.tsx` proven against 114 WordPress URLs in the 2026-05-25 audit), and gives us an explicit `[lang]` param without ever touching the English path. `next-intl` is reduced to a UI-strings library (which is what we actually need it for — translating navigation, buttons, footer chrome), not a routing controller.

Estimated effort: **2 days for routing**, including localized layout composition and validation.

---

## 2. Translation pipeline

### Reality vs the user's question framing

The question assumes "20 languages × 250 pages = 5,000 files to translate." That number is misleading.

**What exists today.**
- 36 English MDX pages + 35 each in 13 languages = **491 page MDX files** already on disk
- 81 English MDX posts + 81 each in 13 languages = **1,134 post MDX files** already on disk
- Total: **~1,625 translated documents already in the repo**, with full frontmatter, hand-cleaned (`translationSource: "gtranslate-scrape-cleanup"`)
- `.raw.mdx` siblings preserve the pre-cleanup scrape for traceability

**What's actually missing.**
- 7 additional languages to reach parity with current Search Console-indexed traffic: **Greek (el)** — 1,143 clicks, highest priority; **zh-CN/zh-TW** split (the existing `zh` is a single bucket); **hr** (43 clicks), **ka** (12), **ml** (11), **da** (2), **tl** (2). Honest read: only `el` and the `zh` split are economically worth doing. The rest can launch with English fallback.
- Page count gap: 1 page is English-only (`https-noeldcosta-com-sap-implementation-expert`, looks like a stray scrape). 81 posts × 14 locales but only 116 unique en+pages slugs total. Some translations may be stubs.

### If we add a language

| Step | Detail |
|---|---|
| 1. Read source | `content/{kind}/{slug}/en.mdx` |
| 2. Strip frontmatter | parse YAML, keep keys to translate (`title`, `h1`, `metaTitle`, `metaDescription`, `excerpt`, `heroAlt`, `keyTakeaways[]`, `pullQuote`), keep keys NOT to translate (`slug`, `originalUrl`, `date`, `updated`, `hero`, `author`, `experienceSource`) |
| 3. MDX-aware splitter | walk the body, mask code fences, masked import statements, MDX JSX components (`<stepper>`, `<compare-split>`, etc.), inline `<code>`. Each unmaskable region becomes a translation chunk. |
| 4. Glossary preservation | replace tokens before translation: `S/4HANA`, `S/4`, `FI/CO`, `BTP`, `RISE`, `GROW`, `Joule`, `ECC`, `MM`, `SD`, `PP`, `HCM`, named clients (Etihad, ADNOC, EDGE, etc.). Send placeholders; restore after |
| 5. Send to Google Translate v3 NMT | `projects.locations.translateText` with `source=en`, `target={code}`. Use the "v3 advanced" Translation API with a custom glossary resource. |
| 6. Reassemble | unmask code/JSX, restore glossary terms, rebuild frontmatter with locale-aware `canonicalUrl`, write to `content/{kind}/{slug}/{lang}.mdx` |
| 7. Per-MDX `lastTranslated` hash | record sha256 of the English source so we can detect drift later (see section 3) |

### Cost estimate for Google Translate API v3 NMT

Pricing (as of 2024–2025): **$20 per 1M characters** for NMT (basic). Glossary feature adds $0 — included.

- Average MDX body length on this site: scanning my recent audit, posts are ~250 KB rendered HTML; raw markdown source is roughly 8–15 KB per post (HTML inflates significantly). Average source: ~10,000 chars per post, ~3,000 chars per page.
- Translatable text in MDX is roughly 60–70% of the raw markdown (code blocks, frontmatter values, MDX components are masked).
- Per-post translatable chars: ~7,000. Per-page: ~2,000.
- Pages-only translation: 36 pages × 7 missing langs × 2,000 chars = **504,000 chars ≈ $10.08**
- Posts-only translation: 81 posts × 7 missing langs × 7,000 chars = **3,969,000 chars ≈ $79.38**
- Total to fill missing languages: **~$90 one-time**

To re-translate the existing 13 languages from scratch (if we don't trust the scrape-cleanup):
- 116 docs × 13 langs × avg 5,500 chars = 8,294,000 chars ≈ **$165.88 one-time**
- Total worst-case (re-translate everything plus fill missing): **~$255 one-time**

Ongoing: when one English MDX changes, re-translate 20 languages × ~5,500 chars = 110,000 chars ≈ **$2.20 per English content change**.

### Wall-clock for a full one-time run

Google Translate API rate-limited per project to ~300k chars/min (NMT model, well below the 6M chars/minute "advanced" cap). Total chars worst-case ~12M ÷ 300k/min = **~40 minutes of API time**. Add throttling for safety: budget **2 hours wall clock** for the whole pipeline including network, MDX parsing, glossary masking, and file writes.

### What does NOT translate

- Code blocks (```` ``` ````)
- Inline code (`` `S/4HANA` ``)
- MDX component tags (`<stepper>`, `<compare-split>`, `<decision-tree>`, `<stat-block>`, raw `<img>`, raw `<details>`/`<summary>`)
- URLs inside markdown links: `[anchor text](/url/)` — translate the anchor only
- Frontmatter keys: `slug`, `originalUrl`, `date`, `updated`, `hero`, `author`, `experienceSource`, `category`, `tags` (tags are cross-cutting; if we want localized tag labels, do that in a separate UI strings file)
- Glossary terms: see step 4 above

---

## 3. Content workflow post-launch

### Detecting stale translations

Two viable mechanisms.

**Option A — hash frontmatter field.** Add `sourceHash: "<sha256 of en.mdx body + relevant frontmatter>"` to every locale MDX. CI step (or pre-commit hook) re-computes the hash and warns if it differs from the current English source.

**Option B — git timestamps.** Compare `git log -1 --format=%ct content/{kind}/{slug}/en.mdx` against `content/{kind}/{slug}/{lang}.mdx`. If the English commit is newer, the translation is stale.

Recommendation: **both**, but `sourceHash` is the authoritative one (git timestamps can change for non-content reasons like rebase or copy-edits to whitespace).

### Re-translating only the changed content

Three sub-options ordered by complexity.

1. **Re-translate the whole file.** Simplest. Costs ~$2.20 per English change (see section 2). Risk: undoes any hand-tuned localization (e.g. cultural rephrasing the team did manually after the initial Google output). For a small team with no human translator on staff, this is fine.

2. **Section-level diff.** Split the MDX by H2/H3, hash each section, only re-translate sections whose hashes changed. Reduces cost ~5×. More tooling.

3. **Sentence-level diff.** Split by sentence, diff, re-translate changed sentences. Cheapest at scale, most complex tooling, highest risk of context-loss (Google needs surrounding context for pronouns/agreement).

Recommendation: **Option 1 for now.** Revisit only if the API bill becomes meaningful.

### Where translated files live

**Co-located with English.** Already the convention in the repo: `content/{kind}/{slug}/en.mdx`, `…/ja.mdx`, etc. Don't split into separate folders by language — it complicates `getPost(slug, locale)` lookup and divorces translations from the English source they came from.

### Build-time vs commit-time generation

- **Commit-time** (recommended): a `scripts/translate.mjs` runs locally or in a separate CI job. Translated MDX files are committed to the repo. Build is deterministic; Vercel builds from committed content.
  - Pro: build doesn't depend on API availability. PRs show translation diffs in review. No surprise API costs on every deploy.
  - Con: needs a workflow discipline ("after editing English, run `npm run translate`").

- **Build-time** (do not recommend): Translate during `next build` on Vercel.
  - Pro: zero manual step.
  - Con: every build hits the API. Vercel build minutes balloon. Translation diffs invisible. A bad API key or quota outage breaks deployment.

Recommendation: **commit-time**, with the translate script gated behind a GitHub Action that runs on push to `master` (or manually via `workflow_dispatch`). The Action opens a PR titled "chore(i18n): retranslate stale locales" if any sourceHash mismatches were detected.

---

## 4. RTL handling for Arabic

### Where dir="rtl" gets set

The root `<html>` element needs `dir="rtl"` when the active locale is Arabic. This is set in `src/app/layout.tsx` (or in a per-locale layout under `src/app/[lang]/(site)/layout.tsx` if we go with Approach B from section 1). One line: `<html lang={locale} dir={RTL_LOCALES.includes(locale) ? "rtl" : "ltr"}>`.

`RTL_LOCALES` already exists in `src/lib/locales.ts` and lists `["ar"]`.

### Codebase RTL audit (current state)

Directional-CSS usage in `src/`:

| Pattern | Count | Notes |
|---|---|---|
| `ml-N` / `mr-N` (Tailwind margins) | 13 | Should become `ms-N` / `me-N` |
| `pl-N` / `pr-N` (Tailwind padding) | 37 | Should become `ps-N` / `pe-N` |
| `text-left` / `text-right` | 31 | Should become `text-start` / `text-end` |
| `left-N` / `right-N` (positioning) | 21 | Should become `start-N` / `end-N` |
| `rounded-l-` / `rounded-r-` | 36 | Should become `rounded-s-` / `rounded-e-` |
| `border-l` / `border-r` | 21 | Should become `border-s` / `border-e` |
| Raw `margin-left` / `padding-right` / `text-align:left` / `float:left` / `translateX` in `.css` / `.ts` | 9 | Manual review per hit |
| **Total directional uses** | **~168** | Mostly mechanical conversion |

Tailwind has logical-property equivalents (`ms`/`me`, `ps`/`pe`, `start`/`end`, `rounded-s`/`rounded-e`, `border-s`/`border-e`, `text-start`/`text-end`) that flip automatically based on `dir`. The conversion is mostly find-and-replace, but each call site needs a visual check on both LTR and RTL.

Special cases worth flagging:

1. **Icons that imply direction.** Arrow icons, chevrons, "next" indicators all need to flip in RTL. Audit usages of `→`, `←`, and any SVG arrow.
2. **Logo/wordmark positioning.** The headshot is described as "right-aligned" in BRAND.md. In RTL it should be left-aligned. Check `Hero.tsx`.
3. **Number formatting.** Arabic typically uses Arabic-Indic digits, but for SAP technical content, Western Arabic digits are conventional. Default to keeping Western digits; revisit if a native speaker disagrees.
4. **Code blocks.** Code stays LTR regardless of locale. Add `dir="ltr"` on `<pre>` and `<code>` in the MDX renderer.
5. **Tables.** Tables in RTL flip column order. May need `dir="rtl"` on the `<table>` element specifically.

### Estimated effort

- Mechanical find-and-replace pass: **1 day**
- Visual review on both LTR and RTL for every affected component: **2 days**
- Icon-flip handling and edge-case fixes (tables, code, mixed-direction content): **1 day**
- Total: **~4 days for RTL**

The good news: Arabic is only 962 clicks out of 36,605 (2.6%). If we ship RTL imperfectly initially, the risk surface is bounded. Don't block launch on RTL polish; ship the routing and revisit the styling.

---

## 5. SEO outputs that need localization

### hreflang generation

Every page needs `<link rel="alternate" hreflang="{code}" href="{url}">` for every translation it has, plus a self-reference and an `x-default` pointing at English. CLAUDE.md currently bans hreflang ("GTranslate handles hreflang on its proxy"). That rule needs reversing.

- **Lives in.** `buildPostMetadata` and `buildPageMetadata` in [src/lib/seo.ts](src/lib/seo.ts). Both currently emit only `alternates.canonical`; need to add `alternates.languages` keyed by each available locale → its URL.
- **Per-page logic.** For each `(slug, kind)`, enumerate which locales have a non-fallback file (`resolveWithFallback` returns `isFallback: false`) and emit one `<link>` per such locale.
- **x-default.** `hreflang="x-default"` should point at the English URL (the canonical for English).

### Localized sitemap

`src/app/sitemap.ts` currently emits English-only URLs. Needs to be extended to emit:
- The flat English URL (current behaviour)
- One `/{lang}/...` URL per locale that has a non-fallback file
- Optionally, `alternates.languages` per sitemap entry (Next.js's `MetadataRoute.Sitemap` supports this via the `alternates.languages` key on each item)

Estimated sitemap size after localization: 250 English URLs × 14–20 locales = **~3,500–5,000 entries**. Single sitemap is fine until ~50,000 entries; no sitemap-index needed.

### Localized canonical URLs

Already plumbed correctly: `canonicalUrlForPage` in [src/lib/seo.ts](src/lib/seo.ts) (added in commit `d513886`) prefers `frontmatter.canonical`. The translated MDX files already declare `canonicalUrl: "https://noeldcosta.com/{lang}/{path}/"` in their frontmatter. The helper falls back to `frontmatter.canonical` first, so this **already works** — provided we surface the locale to `buildPageMetadata` (which it currently doesn't — it ignores the locale-prefix consideration when the catch-all hardcodes `"en"`).

### Localized JSON-LD

Several schemas embed URLs and language:
- `pageWebPageJsonLd` / `pageArticleJsonLd` — `url`, `@id`, `inLanguage` (currently hardcoded `"en"` at lines 469/512 of [src/lib/seo.ts](src/lib/seo.ts))
- `articleJsonLd` for posts — `url`, `@id`, `inLanguage` (same)
- `websiteJsonLd`, `blogJsonLd`, `aboutPageJsonLd`, `contactPageJsonLd` — `inLanguage` (currently `"en"`)
- `collectionPageJsonLd` for category indexes — `inLanguage`

All references to `"en"` (the literal string) and to `flatPath(post.locale, fm.slug)` need to become locale-aware. The `post.locale` / `page.locale` is already passed through by `resolveWithFallback`. The work is mechanical: replace the hardcoded `"en"` with `page.locale` and add a `localePrefixedPath()` helper that prepends `/{lang}` when `locale !== "en"`.

### Localized robots.txt

No change needed. `src/app/robots.ts` (post-fix commit `f3b45f0`) emits global directives that apply to all locales. The Preview `Disallow: /` gating is environment-based, not locale-based.

### Code locations summary

| Output | Where | Change needed |
|---|---|---|
| `<link rel="alternate" hreflang>` | `buildPostMetadata`, `buildPageMetadata` in [src/lib/seo.ts](src/lib/seo.ts) | Add `alternates.languages` |
| `<link rel="canonical">` | Same as above | Already locale-aware via `canonicalUrlForPage`; just pass locale through |
| Sitemap entries | [src/app/sitemap.ts](src/app/sitemap.ts) | Loop over `LOCALES`, emit one entry per (slug, locale) with non-fallback content, attach `alternates.languages` |
| JSON-LD `inLanguage` and `url` | All `*JsonLd` functions in [src/lib/seo.ts](src/lib/seo.ts) | Replace hardcoded `"en"` with `locale` parameter |
| `<html lang="...">` and `dir="..."` | [src/app/layout.tsx](src/app/layout.tsx) (or per-`[lang]` layout) | Read locale from route param |

Estimated effort: **2–3 days** for all SEO output changes plus validation.

---

## 6. Language switcher widget

### Requirements

- Renders the current language and lets the user pick another
- The "switch to {lang}" link must point at the equivalent URL in that language (e.g. on `/sap-implementation/for-manufacturing/`, switching to `ja` goes to `/ja/sap-implementation/for-manufacturing/`)
- Disables (or marks "English only" with a tooltip) options where no translation exists for the current page
- Works without JavaScript (server component, `<a>` tags, no client-side state)
- Visually consistent with the Command Center design tokens (`--cc-accent`, `--cc-card-border`, etc.)

### Placement options

1. **Top right of the global nav.** Standard pattern. Discoverable. Costs nav real estate.
2. **Footer.** Less discoverable but matches the "international users find it once" mental model. Worth pairing with option 1, not replacing it.
3. **Floating widget (sticky bottom-right).** Mimics the current GTranslate visual placement. Heavy. Don't recommend.

Recommendation: **nav (compact dropdown) + footer (full list)**. Pattern matches `commandcc.io` and `erpcv.com`.

### Implementation sketch

A server component that receives the current path and current locale as props. For each locale in `LOCALES`, it:
1. Checks whether the equivalent page has a non-fallback translation (`resolveWithFallback({ kind, slug, locale })` returns `isFallback: false`)
2. Builds the target URL by prepending `/{lang}` (or stripping it for English)
3. Renders an `<a>` per available locale; renders a disabled `<span>` (or omits) per locale with no translation

The dropdown UI itself can be CSS-only (no JS) using `<details><summary>` — same pattern used in MDX FAQ blocks per `blog-editor.md`. Keeps it server-rendered, GTranslate-compatible (irrelevant now but accessible), and zero-bundle.

### Estimated effort

- Component build: **half a day**
- Wire-up to nav and footer: **half a day**
- Visual polish across all 20 locales (especially RTL): **half a day**
- Total: **~1.5 days**

---

## 7. Top 5 risks

| # | Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| 1 | The hand-cleaned translations in `content/{kind}/{slug}/{lang}.mdx` are lower quality than current GTranslate live output. We ship and rankings drop because Google now sees stale or worse translations on our origin. | **Critical** — directly hits 64.5% of organic traffic. | Medium. The cleanup pass exists but quality is unverified. | Spot-check the top 10 translated URLs (per `_docs/references/priority-urls.md`) in native-speaker review before launch. Specifically Japanese (the second-highest traffic language at 4,408 clicks) and Spanish (3,919). Compare side-by-side with the live GTranslate output. Document gaps. |
| 2 | Greek (1,143 clicks) is not in the existing locale set. Ship without it and we lose 3% of clicks; mistranslate it (no native review) and we lose them anyway. | **High** — third-largest non-English language. | High. Greek requires either NMT-only (acceptable risk) or a native pass (added cost/time). | Ship Greek via NMT in the first batch. Flag Greek pages for native review post-launch as a low-priority improvement. Greek MT quality is acceptable for SAP/IT technical content. |
| 3 | `next-intl` + App Router + `trailingSlash: true` + `outputFileTracingExcludes` interact in subtle ways. Specifically, middleware bundles can balloon when the locales module accidentally pulls `content.ts` (already called out in [src/lib/locales.ts](src/lib/locales.ts) comments). Vercel rejects deploys over 250 MB per function. | **High** — could block deploys. | Medium. The codebase already prevented this once. | Reuse the existing isolation pattern in `src/lib/locales.ts`. Avoid `next-intl`'s middleware mode (per Approach B in section 1, we avoid middleware entirely). Validate function bundle sizes early via `vercel build` locally before pushing. |
| 4 | RTL bugs ship to Arabic. 168 directional CSS uses, mostly mechanical to convert, but visual regressions are easy to miss. Arabic-speaking visitors see broken layout, bounce. | Medium — Arabic is 2.6% of clicks but disproportionately represented in GCC (Noel's primary buyer geography). | High if we don't visual-test. | Add an Arabic locale to the Vercel Preview environment by default during staging. Run every PR through both LTR and RTL via screenshots in the audit script. Native Arabic review before launch is a stretch goal, not a blocker. |
| 5 | Search Console reports a transient drop in "Translated results" impressions because we changed the underlying URL source from GTranslate's CDN to our origin. Recovery should be quick but stakeholders will panic at the first weekly report. | Medium — recoverable but stressful. | High. Google takes 2–6 weeks to reprocess hreflang changes. | Communicate the expected dip in advance to anyone reviewing metrics. Set the success metric (PRD #2) to "no >10% drop after 60 days" rather than 30 days for the translated-URL cohort specifically. |

Honorable mentions (not top 5):
- **Glossary terms get translated when they shouldn't.** Mitigated by Google Translate v3 glossary feature + a pre-translation token-mask step.
- **`zh.mdx` is one Chinese variant; serving it at both `/zh-CN/` and `/zh-TW/` is wrong** for SEO. Split before launch; Traditional Chinese is small enough (303 clicks) that we can ship Simplified and add Traditional later.
- **Per-MDX `lastTranslated` drift over time** — if no one runs the translate script, translations stale silently. Mitigated by the GitHub Action gate.

---

## 8. Effort estimate

### Person-days, single contributor

| Workstream | Days |
|---|---|
| Routing (Approach B): add `[lang]/(site)/[...slug]/page.tsx`, wire locale to content lookups | 2 |
| SEO outputs: hreflang, localized sitemap, locale-aware JSON-LD, canonical adjustments | 3 |
| Language switcher (nav + footer) | 1.5 |
| RTL audit + conversion + visual review | 4 |
| Translation pipeline (`scripts/translate.mjs`): glossary, MDX-aware splitter, frontmatter handling, sourceHash | 3 |
| Fill missing locales (run pipeline, review output) | 1 |
| `el` (Greek) addition: pipeline run, spot-check | 0.5 |
| `zh-CN` / `zh-TW` split | 1 |
| Native-speaker spot-check coordination (Japanese, Spanish at minimum) | 1 (Noel's time) |
| QA: full URL audit against all locales (extend `scripts/check-urls.mjs`) | 1 |
| Documentation updates: CLAUDE.md, PRD.md, playbook.md, blog-editor.md (`lang` frontmatter is required again) | 0.5 |
| GTranslate teardown coordination | 0.5 |
| **Total** | **~19 days** |

### Critical path

```
1. Routing (2d) ──→ 2. Fill missing locales (1d) ──→ 3. SEO outputs (3d) ──→
   ──→ 4. QA full URL audit (1d) ──→ 5. Launch
```

Total critical path: ~10 days assuming the translation cleanup quality holds.

### Parallelization

- RTL audit (4d) can run alongside routing + SEO work
- Language switcher (1.5d) can be built on a Vercel Preview before SEO outputs are finalized
- Translation pipeline development (3d) can run alongside routing
- Native-speaker review coordination is async and bounded by Noel's network availability

With a single contributor working efficiently, the project lands in **2.5–3 calendar weeks** including QA. With one contributor plus Noel for review and decisions, **2 weeks** is achievable.

---

## 9. Pre-launch checklist

### Must complete before DNS cutover

1. **Routing changes deployed and tested on staging** for at least 3 days against the full 250-URL set in 14+ locales.
2. **Canonical URLs verified** — every `/{lang}/...` URL declares its own URL as canonical; every English flat URL declares the flat URL. Audit script extended to check canonicals for all locale URLs.
3. **hreflang verified** — every page emits a complete cluster of `<link rel="alternate">` tags pointing at every available locale plus `x-default` pointing at English. Validate via the Google Search Console URL Inspection tool on 5 priority pages.
4. **Localized sitemap.xml live** — submitted to Search Console. URLs present for every available locale. `<xhtml:link rel="alternate" hreflang>` annotations included.
5. **JSON-LD locale-aware** — `inLanguage` reflects the page locale; `url` and `@id` point at the locale URL. Validate via Google's Rich Results Test on 5 priority pages.
6. **`<html lang>` and `dir`** — set correctly on every locale. Visual check in Chrome DevTools on at least Japanese, Arabic, German, and one English page.
7. **Language switcher renders correctly** on at least Japanese, Arabic, German, Spanish. Disables locales without a translation. No JS required to work.
8. **Top 10 priority URLs (Japanese + Spanish + German)** have been read by a native speaker and judged "no worse than current GTranslate output". This is the single biggest pre-launch risk. Skipping this is acceptable if the alternative is delaying launch by months, but the risk should be explicit.
9. **The translation script can re-translate one English page** end-to-end and produce a diff-able output. Pipeline must work before launch, even if we don't need to re-translate yet.
10. **GTranslate dashboard** still pointing at WordPress origin. Don't change anything in the dashboard until cutover.
11. **Documentation updated**: CLAUDE.md ("DO NOT add a language prefix" rule reversed), PRD.md (Phase 5 launch checklist updated), playbook.md (steps 8-12 rewritten to reflect self-host).

### Can do post-launch

1. **Greek native-speaker review** — Greek ships from NMT at launch; native review is a fast-follow.
2. **`zh-TW` split** — ship `zh-CN` from the existing `zh.mdx`; `zh-TW` is 303 clicks, can wait 30 days.
3. **Low-traffic-language additions** (`hr`, `ka`, `ml`, `da`, `tl`) — total ~70 clicks combined; these can be deferred indefinitely or skipped permanently.
4. **Section-level diff for re-translation** — start with whole-file re-translation; optimize when the bill becomes noticeable.
5. **Tag/category localization** — tags currently aren't translated. Low-stakes.
6. **Icon-flip refinements for RTL** — ship with the obvious mechanical fixes; iterate.
7. **Per-MDX `lastTranslated` field** — start without it; add when the first content edit happens.

---

## 10. Comparison to Path 1 (GTranslate continuity)

The original plan (call it Path 1): keep GTranslate, switch its origin from WordPress to the new Next.js site, change nothing in `content/`, accept that 64.5% of traffic stays on the GTranslate CDN.

This document analyzes Path 2: self-host translations, serve from the Next.js origin.

| Dimension | Path 1 (GTranslate continuity) | Path 2 (self-host with next-intl) |
|---|---|---|
| **Effort to launch** | ~2 days (GTranslate dashboard config + DNS cutover + staging test) | **~10–15 days on the critical path** (routing + SEO outputs + RTL + pipeline + QA) |
| **Cost at steady state** | GTranslate subscription (current plan tier; check `_docs/audits/_prompts/phase-3-gtranslate.md` step 1) | $90 one-time for missing translations; ~$2/month ongoing for content edits |
| **SEO risk at launch** | Low. URLs and translation source don't change from a crawler's perspective; only the English origin changes. | Medium-to-high. Hreflang and canonical changes trigger Google reprocessing. Translated URLs now resolve at our origin instead of GTranslate's CDN — Google sees that as a moved resource. 2–8 week reprocessing window. |
| **Long-term control over translation quality** | Low. GTranslate is a black box. Their NMT may improve or regress without notice. We can't edit individual translations without paying for a higher tier. | High. Every translation is a file in the repo. PR-reviewable. Hand-edit any locale at any time. |
| **Performance** | Two hops (user → GTranslate edge → our origin) for non-English. | One hop (user → our origin/Vercel edge). 100–300 ms faster TTFB for non-English users. |
| **Vercel cost** | Lower. GTranslate caches non-English aggressively; our origin only serves the English requests. | Higher. We serve all 20 locales from the origin. Vercel bandwidth and edge-cache hits increase. Order of magnitude: maybe 2-3× current Vercel cost depending on caching. |
| **Reversibility** | Trivial. Roll GTranslate back to WordPress origin. | **Hard.** Removing `/{lang}/` URLs after launch means thousands of 404s. The only safe reversal is "leave the locale URLs serving from our origin and ALSO put GTranslate back" — which is dual-mode and confusing. **The decision is effectively one-way after launch.** |
| **Dependency footprint** | One vendor (GTranslate). | Two vendors (Google Translate API for the pipeline; can be swapped). Plus `next-intl` dependency (small). |
| **Operational burden** | GTranslate dashboard checks; nothing in the codebase. | Translation pipeline maintenance; PR review for translation changes; CLAUDE.md rule changes; future-developer onboarding includes locale awareness. |
| **Reading the brand** | "We use Google Translate via GTranslate" — neutral. | "We self-host translations" — small positive signal, mostly invisible to buyers. |

### My read

Path 2 is the better architecture **if and only if** the existing translation cleanup in `content/{kind}/{slug}/{lang}.mdx` is high enough quality to ship. That is the single load-bearing assumption. The cleanup files exist, they're well-structured, but no one has audited their fidelity against the current live GTranslate output. **Sample 5 pages in 3 languages with a native speaker before committing.**

If the cleanup quality holds, Path 2's only real cost is the 2-week build-out and the SEO reprocessing window. The reversibility risk is real but mostly bounded — translated URLs continue to exist and serve content; the only thing that flips is the canonical/hreflang declarations.

If the cleanup quality is **not** acceptable, Path 1 is the safer choice and we keep paying GTranslate.

### Recommended decision sequence

1. **Quality probe (1 day, low cost):** Pull 5 of the highest-traffic translated URLs from `_docs/references/priority-urls.md`. For each, render the live noeldcosta.com GTranslate output side-by-side with the corresponding `content/{kind}/{slug}/{lang}.mdx`. Get a native-speaker read on Japanese (1 page) and Spanish (1 page). Decision gate: are the cleaned MDX files publishable as-is?
2. **If yes:** Proceed with Path 2. Schedule the 10–15 day critical path. Brief Noel on the SEO reprocessing window.
3. **If no:** Either run the cleanup again with a better prompt (1 week to re-translate 1,500 docs), or default back to Path 1 and keep GTranslate.

The cost of the quality probe is trivial. The value of running it is large. **That's the next step before doing anything else.**

---

## Open questions for Noel

1. **Quality probe.** Will you do the 5-page native-speaker read for Japanese and Spanish, or do we recruit?
2. **Greek.** Greek isn't in the current locale set. Ship from NMT-only (acceptable risk), pay for a native pass post-launch, or skip Greek entirely?
3. **Zh split.** Do we need `zh-TW` at launch or can we ship `zh-CN` only and add Traditional later?
4. **GTranslate exit timing.** Decommission GTranslate at cutover, or keep it as a parallel hot-standby for 30 days?
5. **Translation script ownership.** Does the script live in this repo (`scripts/translate.mjs`) or as a separate Vercel Function? Separate function has audit-trail benefits but adds an integration surface.
6. **Glossary scope.** Beyond the obvious SAP product names, what other terms get glossary-protected? Client names (Etihad, ADNOC, EDGE Group, etc.) are an obvious one; do we want a longer list?

Answers to 1 and 4 are blocking. Answers to 2, 3, 5, 6 can be deferred but should be settled by the start of the routing work.
