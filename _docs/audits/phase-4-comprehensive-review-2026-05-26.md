# Phase 4 — comprehensive review (2026-05-26)

Branch: `staging-gtranslate-test`
Commit reviewed: `258d27f` (Block 6a.2 — multi-root-layout architecture)
Reviewer: read-only audit, no code changes, no commits.

---

## TL;DR

Block 6a.2 is sound. Build clean, lint clean, tsc clean, all 11 spot-check URLs serve 200 with correct `lang/dir` on Vercel preview, every URL hits the edge cache. The architectural pivot from proxy.ts to multi-root-layout was the right call.

But the migration is **not as close to done as the block count suggests**. Three findings are CRITICAL (must address — see Part 6.1), six are IMPORTANT (should address before cutover — Part 6.2), and the timeline is more like 5-7 days than 3-5.

The most consequential CRITICAL is `[CR-1]`: the visible breadcrumb chrome in `PostPage`, `MdxPageLayout`, `CategoryPage`, `TagPage`, `CaseStudyArticlePage` renders `<Link href="/">Home</Link>` regardless of locale. Clicking "Home" on `/ja/sap-implementation/` returns the user to the English root, silently switching their language. JSON-LD breadcrumbs are correctly locale-prefixed; only the visible nav is broken. This is user-facing and exists on every translated content page.

**Verdict: PROCEED to Block 6b CONDITIONALLY — fix the three CRITICAL items first (estimated ~2-3 hours), then continue.**

---

## PART 1 — Strategic review

### 1.1 Architectural integrity — SOUND

**Severity: NICE-TO-HAVE (no change required)**

The multi-root-layout pattern (`(site-en)/layout.tsx` + `(site-intl)/intl/[lang]/layout.tsx` + `RootLayoutShell`) is the canonical Next.js 16 pattern documented at `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md:140-146`. Evidence:

- Build emits 2,769 static pages — no route conflicts between `(site-en)` and `(site-intl)`.
- Vercel preview cache headers on `258d27f`: every public URL shows `X-Vercel-Cache: HIT` and the matched path is the specific route (`/sap-implementation`, `/intl/ar`), not the catch-all. Confirms static prerender survives at the edge.
- `generateStaticParams` in `src/app/(site-intl)/intl/[lang]/layout.tsx` enumerates all 10 `TARGET_LANGUAGES`; `dynamicParams = false` rejects anything outside.
- `/xx/sap-implementation/` returns 404 in production — the `next.config.ts` rewrite regex `(ar|de|el|es|fr|it|ja|nl|pt|ru)` filters invalid locales before route resolution.

**Hidden-assumption risk: low.** The only edge case I'd watch in Block 7+ is what happens if a new locale is added to `TARGET_LANGUAGES` in `locales.ts` but the `LOCALE_GROUP` regex in `next.config.ts:76` is not updated in lockstep. That keeps the rewrite from firing for the new locale, and `(site-intl)/intl/[lang]/page.tsx` still receives requests through `/intl/xx/` direct hits but not through `/xx/...`. **Recommended action:** during Block 6b, factor the locale regex into `locales.ts` so both files derive from a single source. Not blocking.

### 1.2 Scope alignment — PARTIALLY DRIFTED

**Severity: IMPORTANT**

The original Phase 4 plan (per `PRD.md` and `CLAUDE.md`) was zero internationalization — GTranslate would handle all 11 locales externally. The codebase has clearly pivoted to self-hosted i18n. Phase 4 is now the i18n migration itself. Blocks observed in this session:

| Block | Status | Description |
|---|---|---|
| 4 (SEO) | DONE | Per-locale canonical, hreflang alternates, og:locale |
| 5 (LangSwitcher) | DONE | `src/components/LanguageSwitcher.tsx` |
| 6 (content translation) | DONE | 117 slugs × 10 locales = 1,170 translated MDX files |
| 6a (html lang/dir) | DONE (after retry) | Block 6a v1 reverted; 6a.2 shipped |
| 6b (consolidation) | PENDING | Dedup Nav PILLARS / Footer solutions / lib/content CATEGORIES; dedup WhatIBelieve vs article/beliefs |
| 6c (UI strings) | PENDING | ~680 hardcoded strings × 10 locales |
| 7 (RTL CSS) | PENDING | Arabic dir="rtl" needs CSS to flip |
| 8 (final verification) | PENDING | Cross-browser, perf, a11y |
| Phase 5 (cutover) | PENDING | DNS, monitoring, GTranslate decommission |

**Unplanned work that this review surfaces:**
- **`[CR-1]` Locale-aware visible breadcrumbs** — affects every translated content page. Was not in Block 6c's scope (which focuses on string-bag externalization). Needs a per-component pass.
- **Doc rewrite** — CLAUDE.md and PRD.md still describe the abandoned GTranslate plan. Future agents will be misled.
- **Translate-pipeline guardrails** — testimonials, attributed quotes, and proper-noun client names must be carved out of any future re-translation run. Not currently flagged in the script.

**Realistic remaining work to Phase 5:** see timeline in §6.4.

### 1.3 Cost reality

**Severity: NICE-TO-HAVE**

Numbers from the translation script's documented benchmark (`scripts/translate-content.mjs:14-19, 42, 73-76`):

| Item | Estimate |
|---|---|
| **Spend to date (Block 6 — MDX content)** | 117 slugs × 10 langs ≈ **$100-160** depending on file size mix. Japanese benchmark $0.09/file for ~15KB; larger files (sap-modules ≈ 83KB) chunked but cost scales linearly. The user's stated ~$154 figure is consistent. |
| **Block 6c — UI strings (~680 strings × 10 langs)** | Short strings, can be batched into a few API calls. Each batch ~$0.02-0.05 in input cost, ~$0.10-0.30 output. Realistic total: **$5-30**. |
| **Total Phase 4 projected spend** | **$110-190 one-time.** |
| **Ongoing cost** | Translation re-runs only when content changes. If 20 posts/year × 10 langs × $0.09 ≈ **$18/year** maintenance. |
| **GTranslate alternative** | $200/year subscription, recurring. Self-hosted breaks even within ~9 months. |

Cost is not a risk factor. The dominant cost in the migration is engineering time, not API spend.

### 1.4 Documentation drift — CRITICAL gap

**Severity: CRITICAL**

`CLAUDE.md` and `PRD.md` describe the abandoned GTranslate strategy in load-bearing language that contradicts the shipped code:

- `CLAUDE.md` (loaded into every Claude Code session in this repo): **"DO NOT add a language prefix to any URL. Do not nest routes under `[lang]`. English at root only."** — directly contradicted by `src/app/(site-intl)/intl/[lang]/`.
- `CLAUDE.md`: **"DO NOT add i18n libraries (next-intl, next-i18next, react-intl). Translation is handled externally by GTranslate."** — the entire translation pipeline at `scripts/translate-content.mjs` and the `getPost(slug, locale)` machinery contradict this.
- `PRD.md` Phase 4: **"Translated versions of migrated posts are handled by GTranslate automatically after launch. No per-language MDX files needed."** — actually, 1,170 per-language MDX files exist in `content/`.
- `BRAND.md` and `VOICE.md` are unaffected — they describe the brand, not the i18n strategy.
- `AGENTS.md` is one line, unaffected.

**Cleanup needed before Phase 5:**
1. Rewrite the "Critical context" section of `CLAUDE.md` and the "Translation architecture" section of `PRD.md` to describe self-hosted i18n via `/[lang]/` URLs.
2. Update the routing table in `CLAUDE.md` to reference `(site-en)/` and `(site-intl)/` paths.
3. Update Phase 4 status in `PRD.md` to show the actual blocks (6, 6a/6a.2, 6b, 6c, 7, 8).
4. Fix two stale `(site)/` path comments in `src/app/sitemap.ts` lines 52 and 187 — comment-only, but cleanup is cheap.

**Recommended action:** fix before cutover. Whoever inherits this codebase in 6 months will be misled otherwise.

### 1.5 Quality of translated MDX

**Severity: IMPORTANT — unverified**

1,170 translated MDX files exist. Total per-locale count is identical (117 each — perfect parity), so the pipeline ran to completion. Quality is **not verified** in this session, and based on the conversation history, only spot-checks have been done (the user noted "GPT-5.4 said so" as the basis).

**Quality signals available without re-reading every file:**
- Glossary in `scripts/translate-content.mjs:103-129` protects SAP, S/4HANA, ECC, Fiori, RISE, FICO, BAPI, HANA, BTP, etc. — these terms stay in Latin script in translations. Spot-check on `/ja/` confirms this works.
- The script preserves code blocks, MDX components, markdown structure via placeholders before LLM call. Round-tripping is mechanical, not semantic — drift is unlikely on code/structure.
- The script's chunking logic (`BODY_CHUNK_THRESHOLD = 40_000`) splits large bodies on H2 boundaries to stay under the 20-min timeout. Boundary-handling is fragile in principle but the build produces no errors, suggesting no broken MDX output.

**What is NOT verified:**
- Idiom and tone in target languages (especially Arabic, Japanese, Russian where the user has no native speakers).
- Whether testimonial quotes were translated (per audit doc, they SHOULD NOT be — they're attributed real-people statements). The translation script has no carve-out for testimonial blocks.
- Whether client names and proper nouns survive ("Etihad" vs "اتحاد" — the glossary covers SAP-family terms but not client names).

**Post-launch quality monitoring plan: not defined.** Recommended: pick one native speaker per locale from Noel's network, send them 3-5 representative URLs each, ask for a 15-min pass for blocking issues only. Cost: 0 (favor); risk reduction: significant for the top 4 markets (ar, ja, de, es per Search Console traffic).

---

## PART 2 — Code review

### 2.1 Multi-root-layout architecture — SOUND

**Severity: NICE-TO-HAVE**

`src/app/(site-en)/layout.tsx` and `src/app/(site-intl)/intl/[lang]/layout.tsx` are clean. Both:
- Import `RootLayoutShell` for the body chrome (JSON-LD scripts, LanguageSwitcher).
- Independently load the same three Google fonts and set the same CSS variable class on `<html>`.
- Carry the same `metadata` export with the same OpenGraph defaults.

`RootLayoutShell.tsx` (41 lines) is a clean encapsulation of the `<body>` content.

**Duplicate code between the two root layouts: real but bounded.** The font setup (16 lines) and the `metadata` export (~35 lines including OG/Twitter/robots) are textually identical. If a brand defaults change is made in one layout and not the other, the two will drift silently. Mitigation:
- Could be factored into `src/lib/site-metadata.ts` — exports a shared `Metadata` constant and the three font constants. Both layouts import.
- Not blocking. Drift risk is low because both layouts get touched together in any global brand change.

**`generateStaticParams`** in the intl layout: enumerates `TARGET_LANGUAGES` — correct, 10 locales. `dynamicParams = false`: confirmed to prevent runtime fallback (production 404 on `/xx/sap-implementation/`).

**Code paths that bypass the route groups: none found.** No `proxy.ts` orphan, no `middleware.ts`, no leftover `(site)/` directory. Two stale `(site)/` path comments in `src/app/sitemap.ts:52, 187` (comment-only drift; non-functional). Two stale references in conversation comments inside intl/[lang]/page.tsx that reference Block 4 ordering — also comment-only.

**Recommended action:** Optional refactor in Block 6b to factor the duplicated font/metadata setup. Defer if time-constrained.

### 2.2 Routing and rewrites — SOUND

**Severity: NICE-TO-HAVE**

`next.config.ts` rewrites at lines 75-84:
```js
{ source: `/:lang(${LOCALE_GROUP})`, destination: "/intl/:lang" },
{ source: `/:lang(${LOCALE_GROUP})/:path*`, destination: "/intl/:lang/:path*" }
```

`LOCALE_GROUP = "ar|de|el|es|fr|it|ja|nl|pt|ru"` is duplicated between this regex and `src/lib/locales.ts:TARGET_LANGUAGES`. As flagged in §1.1, this is the single highest-priority single-source-of-truth fix when Block 6b touches anything.

URL→route mapping verified against production (`X-Matched-Path` header):

| Public URL | Matched path | Route group |
|---|---|---|
| `/` | `/` | `(site-en)/page.tsx` |
| `/sap-implementation/` | `/sap-implementation` | `(site-en)/[...slug]` |
| `/sap-implementation/sap-modules/` | `/sap-implementation/sap-modules` | `(site-en)/[...slug]` |
| `/about/` | `/about` | `(site-en)/about/page.tsx` |
| `/ja/` | `/intl/ja` | `(site-intl)/intl/[lang]/page.tsx` |
| `/ja/sap-implementation/sap-modules/` | `/intl/ja/sap-implementation/sap-modules` | `(site-intl)/intl/[lang]/[...slug]` |
| `/ar/` | `/intl/ar` | (with `dir="rtl"`) |

No URL matches multiple route patterns. Catch-all in `(site-en)/[...slug]` does NOT intercept locale-prefixed URLs because the rewrite consumes them at the routing-engine layer before catch-all matching.

### 2.3 Translation pipeline — ROBUST

**Severity: NICE-TO-HAVE**

`scripts/translate-content.mjs` is 1,200+ lines, well-commented. Highlights:

- **Credentials:** dual path — `OPENAI_API_KEY` env var preferred, falls back to file at `%USERPROFILE%\.config\openai\key.txt`. Script reads key with `existsSync` check; never logs the key. **No credential leak found** in tracked files (`git ls-files | grep -i "key\|secret"` returns one MDX article with "key" in title and translated MDX files — none have actual secrets).
- **Glossary** (`scripts/translate-content.mjs:103-129`) — 20 brand terms protected with whole-word case-sensitive matching. Wraps each match in `<span translate="no">` before sending to API, unwraps after. Per spot-check on `/ja/`, `/ar/`, branded terms stay in Latin script.
- **Chunking** (`BODY_CHUNK_THRESHOLD = 40_000`, `TARGET_CHUNK_MAX_CHARS = 30_000`): splits body on H2 boundaries when source exceeds 40KB. Empirically needed for `sap-modules` (83KB body) which timed out the 20-min EXTENDED timeout. Each chunk gets a uniform per-call latency.
- **Cost modelling:** documented benchmark, separate token-density coefficients for CJK/Cyrillic/Greek (ar, el, ja, ru) vs Latin scripts. `--dry-run` estimates spend before any API call.

**One blind spot:** the script translates everything in the source MDX, including verbatim attributed testimonials and proper-noun client names that should stay English. Per the audit (`_docs/audits/i18n-strings-audit-2026-05-26.md:391-406, 730-736`), `Testimonials.tsx` and `article/testimonials/data.ts` carry real quotes that **must not be translated**. The component itself is not currently in the MDX pipeline (its data is in `.ts` files, not MDX), so this is a future risk if testimonials migrate into MDX content. **Recommended action:** add a `<span translate="no">` carve-out pattern to the script and document the policy. Defer to Block 6c.

### 2.4 SEO outputs — STRONG

**Severity: NICE-TO-HAVE**

`src/lib/seo.ts` is comprehensive (742 lines). Verified:

- **Canonical URLs** are correctly locale-prefixed for all 11 variants via `localizedPath(locale, englishPath)`. Override via `frontmatter.canonical` works (the `localizeCanonicalOverride` function re-splices the locale prefix unless the URL is external).
- **hreflang alternates** are reciprocal: `buildLanguageAlternates(englishPath)` emits one entry per `HREFLANG_LOCALES` (en + 10 routed locales) plus `x-default`. Verified on `/de/sap-implementation/` SSR HTML during 6a.2 verification — full reciprocal map present.
- **og:locale per locale**: `OG_LOCALE_MAP` carries ISO 639-1+3166 codes (`ar_AE`, `pt_BR`, `ja_JP`, etc.) — region choices documented inline (UAE for Arabic since Noel's GCC focus; Brazil for Portuguese since SAP demand there). Verified on Vercel preview.
- **JSON-LD `inLanguage`** matches the served locale on `articleJsonLd`, `pageWebPageJsonLd`, `pageArticleJsonLd`. The sitewide `websiteJsonLd()` and `personJsonLd()` hardcode `"en"` — defensible since the entity itself is English-named, but worth a thought.
- **Sitemap** at `src/app/sitemap.ts` emits ONE entry per supported locale per URL via `emitWithLocales` — every entry carries the full 11-language reciprocal hreflang map. This is the cluster-completeness Google requires.
- **Sitemap excludes `/intl/` paths**: confirmed via `robots.ts` line 62 (`disallow: "/intl/"`) and the absence of `intl/` URLs in `sitemap.ts`. `/intl/[lang]/` exists as the internal rewrite target; it's not in the sitemap and is disallowed in robots.

**One observation:** `src/app/robots.ts:17-21` returns a blanket `disallow: "/"` for `VERCEL_ENV === "preview"`. So Vercel preview deployments correctly tell crawlers not to index. Production parity check: production has `VERCEL_ENV === "production"`, which falls through to the full ruleset. Good.

### 2.5 Language switcher — MOSTLY SOUND, RTL gap

**Severity: IMPORTANT (Block 7 prerequisite)**

`src/components/LanguageSwitcher.tsx` (251 lines):

- URL construction (`buildTargetHref`) handles three edge cases:
  1. Direct `/intl/<lang>/` hits — strips the `intl/` shim.
  2. Already-prefixed URLs — strips current locale.
  3. English-target — returns root (no prefix).
  Verified by reading lines 34-48. Correct for nested URLs, `/intl/` direct, English flat.
- A11y: `aria-haspopup="listbox"`, `aria-expanded`, `aria-label`, listbox `role`, each option has `role="option"` and `aria-selected`. Arrow / Home / End keys handled. Escape returns focus to trigger. Focus moves to current language on open. **Good.**
- MutationObserver pattern (lines 67-80): watches `#mobile-menu` for `aria-hidden` changes, unmounts switcher when drawer opens. Reliable because the drawer always emits the aria-hidden attribute change.
- Restructure compatibility: usePathname() is content-route-aware, locale detection via `detectLocale` doesn't depend on the `(site)`/`(site-en)` path. Confirmed working on the production preview at 258d27f.

**RTL gap (NEW finding, for Block 7):** the switcher uses CSS `right: max(1rem, env(safe-area-inset-right))` at lines 158-162 to pin to the bottom-right corner. On `dir="rtl"` (Arabic), this still pins right (visual leading edge in RTL = right). The intent on RTL is to pin to the **trailing** edge (left in RTL, mirroring English bottom-right). Fix: use logical property `insetInlineEnd` instead of `right`. Same applies to `safe-area-inset-right` → `safe-area-inset-end` (though `safe-area-inset-*-inline-*` browser support is uneven; manual `dir` check + variable swap may be more reliable).

The dropdown panel itself uses `absolute right-0 bottom-full` (line 191) — same RTL flip needed.

**Hardcoded ARIA strings:** `"Select language"` × 2. Audit-flagged. Block 6c work.

**Recommended action:** fix RTL positioning in Block 7. Hardcoded strings in Block 6c. No action on the rest.

### 2.6 Component locale awareness — IMPORTANT BUG

**Severity: CRITICAL — `[CR-1]`**

`PostPage.tsx`, `MdxPageLayout.tsx`, `CategoryPage.tsx`, `TagPage.tsx`, `CaseStudyArticlePage.tsx` all accept a `locale` prop and correctly use it for:
- Content lookup (`getPost(slug, locale)`).
- JSON-LD URL construction (`${SITE_URL}${langPrefix}/${slug}/`).
- Canonical URL emission (via `buildPostMetadata` / `buildPageMetadata`).

**But the visible breadcrumb chrome is hardcoded English and locale-leaky:**

| File:line | Element |
|---|---|
| `src/components/PostPage.tsx:108-114` | `<Link href="/">Home</Link>` — sends `/ja/` users back to English root |
| `src/components/PostPage.tsx:118-125` | `<Link href={\`/category/${catMeta.slug}\`}>` — same; no locale prefix |
| `src/components/MdxPageLayout.tsx:60` | `<Link href="/">Home</Link>` |
| `src/components/CategoryPage.tsx:251-256` | `<Link href="/">Home</Link>` (+ visible label "Home", "Category") |
| `src/components/TagPage.tsx:178, 183` | Same pattern (per audit doc) |
| `src/components/case-studies/CaseStudyArticlePage.tsx:75-77` | `breadcrumbs = [..., {name: "Home"}, {name: "Case Studies"}, ...]` and corresponding visible links |

A reader on `/ja/sap-implementation/sap-modules/` who clicks the breadcrumb "Home" lands on `/`, the **English** homepage. That's silent language-switching as a UI side effect — a real Phase 4 regression that ships every time a translated user navigates back. JSON-LD breadcrumbs DO use `langPrefix` correctly, so crawlers see the right URLs; only the human-visible nav is wrong.

**Fix scope:** ~10 lines per file, 5 files. Pattern: replace `href="/"` with `href={\`${localePathPrefix(locale)}/\`}` and same for category/tag hrefs. The component already receives `locale`. Block 6c will also need to localize the visible label text "Home"/"Category"/"Tag"/"Case Studies", but the URL fix can land first as a tactical patch.

**Recommended action: fix now (before Block 6b).** Without it, every translated content page leaks the user back to English.

### 2.7 Orphan files and dead code

**Severity: NICE-TO-HAVE**

- `find src -name "proxy.*" -o -name "middleware.*"` returns nothing. The reverted Block 6a v1 proxy.ts was fully removed in 857e89c.
- `src/app/(site)/` does not exist (`rmdir` confirmed in Block 6a.2 commit).
- Comment-only stale paths: `src/app/sitemap.ts:52, 187` mention `src/app/(site)/[...slug]/page.tsx`. The actual file is now at `src/app/(site-en)/[...slug]/page.tsx`. Trivial 2-line fix.
- Conversation comment in `src/app/(site-intl)/intl/[lang]/page.tsx:29-33` references the file's role in Block 3 but the file path comment is correct.
- No unused imports detected by `npx tsc --noEmit` (exit 0).
- ESLint clean (exit 0) — confirms no dead-code rules flagging anything.

### 2.8 Hardcoded strings audit

**Severity: IMPORTANT — IN-PLAN for Block 6c**

`_docs/audits/i18n-strings-audit-2026-05-26.md` is thorough — 1,224 lines documenting ~680 user-facing strings across components, with file-and-line precision. The audit identifies:
- 290 inline JSX strings
- 390 same-file constant strings
- 95 strings already in shared lib constants (good — partial DRY)
- 2 hardcoded `"en-US"` date formatters in `src/components/article/ArticleHero.tsx:42, 51`
- ~10 non-locale-aware `.toLocaleString()` / `.toLocaleDateString()` calls
- ~10 hand-rolled `$` currency prefixes in calculators and book pricing

**Beyond the audit, I checked the newly-touched files:**
- `src/app/(site-en)/layout.tsx`: metadata strings are inline English (title, description, OG, Twitter). Layout-level metadata is currently single-source-English; the per-locale homepage override via `HOMEPAGE_META` only fires on the intl homepage. For translated MDX pages, the layout's `title.template` "%s | Noel D'Costa" applies — the brand suffix stays English. Reasonable for SEO (English brand name is a search anchor) but a deliberate Phase 5 decision, not an accident.
- `src/app/(site-intl)/intl/[lang]/layout.tsx`: same metadata structure, also inline English defaults. The `HOMEPAGE_META` in `page.tsx` overrides for the homepage; translated MDX pages get their `metaTitle`/`metaDescription` from frontmatter (which IS translated).
- `src/components/RootLayoutShell.tsx`: no UI strings, only JSON-LD.

**No new English-text concatenation into translated content** found in the multi-root-layout changes.

### 2.9 React key-prop warnings

**Severity: IMPORTANT**

The dev server log shows hundreds of `Each child in a list should have a unique "key" prop` warnings per page load. They were present before Block 6a and persist after Block 6a.2 — not caused by the restructure. The warnings appear in production-build dev mode but not in production HTML (React 19 suppresses).

**Likely source:** `src/components/mdx/MdxBody.tsx` uses `react-markdown` with `rehypeAutolinkHeadings` configured with `behavior: "wrap"` (line 45). The wrap behavior wraps each heading in an anchor element. When MDX bodies contain dense lists, the wrapped headings + their original children create nested lists that `react-markdown` renders without explicit `key={...}` on the wrappers. This is a known `react-markdown` v10 issue when used with `rehype-raw` (allows arbitrary HTML — line 41) + `rehype-autolink-headings`.

**Diagnostic recommendation:** verify by adding `--inspect` flags or commenting out `rehypeAutolinkHeadings` temporarily and checking if the warnings go away. **Fix approach** (deferred): either:
1. Switch `rehypeAutolinkHeadings` behavior from `"wrap"` to `"append"` — heading anchors become trailing icons rather than wrapping the heading. Different visual.
2. Upgrade `react-markdown` and `rehype-autolink-headings` to versions that emit keys for wrapped elements.
3. Replace `react-markdown` with a custom MDX compiler — large.

Option 1 is the cheapest, but it changes the heading-anchor visual. Worth a 5-minute spike before Block 7. **Not blocking.** Console warnings in dev only; production HTML is unaffected and search engines don't see them.

### 2.10 Testimonials and do-not-translate content

**Severity: IMPORTANT — for Block 6c policy**

`src/components/Testimonials.tsx` carries three real testimonials in a `TESTIMONIALS` constant inline (lines 10-32) — Mike Papamichael, Andrew MacFarlane, Takhliq Hanif. `src/components/article/testimonials/data.ts` has 9 more in the same shape. Per the audit doc (lines 392-406, 730-736), **these are verbatim attributed real-people quotes and must not be translated.**

**Current state:** the translation pipeline doesn't touch these (they live in `.tsx` and `.ts` files, not in MDX content/). So zero risk today.

**Future risk:** Block 6c will externalize all UI strings, including testimonial bodies, into translation dictionaries or per-locale variants. If the testimonial text gets externalized to a `<lang>.json` file alongside everything else and routed through `translate-content.mjs`, the LLM will translate the quotes — which is misrepresenting what those people actually said.

**Recommended action:** before Block 6c starts:
1. Add a "DO NOT TRANSLATE" register to the translation script — a list of file paths or string IDs that the pipeline must leave verbatim regardless of locale.
2. Document the policy in `blog-editor.md` or a new `translate-policy.md`.
3. For role descriptions (e.g. "Ex-CIO, Etihad Aviation Group"), the audit recommends partial translation — make the policy explicit: "Job titles translate. Company names don't."

The case-study verbatim quotes (`src/components/article/testimonials/`) get the same treatment.

---

## PART 3 — Build review

### 3.1 Local build — CLEAN

**Severity: NICE-TO-HAVE**

`npm run build` on `258d27f`:

| Metric | Value |
|---|---|
| Exit code | 0 |
| Compile time | 12.8s (Turbopack) |
| TypeScript phase | 5.3s |
| Static page generation | 71s (7 workers, 2,769 pages) |
| **Total static pages** | **2,769** (matches Block 6a.2 baseline; no regression) |
| Dynamic functions | 5 (`/admin/book-leads`, 4 API routes) |
| Errors | 0 |
| Warnings | 0 |
| Deprecation notices | 0 (the proxy → middleware deprecation surfaces only when `src/middleware.ts` exists, which it does not) |

Build output (from `/tmp/build.log`): all `[lang]` subtrees enumerated (`/intl/ar`, `/intl/de`, ..., `/intl/ru`) plus 1,257 translated `[...slug]` paths, 57 category index paths × 10 locales, 1,167 tag archive paths × 10 locales.

### 3.2 Bundle analysis

**Severity: NICE-TO-HAVE — not deeply measured**

Build did not emit a bundle analyzer report. From the build output:
- Each route function is ~7.77MB (per the build output for `[...slug]` and `_not-found`).
- `outputFileTracingExcludes` in `next.config.ts` strips `content/`, `public/images/`, `scripts/`, `.next/cache/`, and the Anthropic SDK markdown docs from function bundles — without this, Vercel rejects (250MB cap per function). Critical config; do not remove.

**RootLayoutShell deduplication:** since both root layouts import the same `RootLayoutShell.tsx`, Turbopack should produce one shared chunk. Build output doesn't break out chunks at this granularity, but the function-bundle size (7.77MB) is identical across route handlers, indicating no per-route duplication of shell code.

**Recommended action:** run `next build --bundle-analyzer` (or equivalent) before Phase 5 cutover to baseline bundle size. Compare against the previous-WordPress baseline if available. Defer unless someone reports a perf regression.

### 3.3 Vercel production parity — STRONG

**Severity: NICE-TO-HAVE**

No `vercel.json` exists. Vercel uses defaults from `next.config.ts`. Production parity with local build is high because:
- Same Next.js version (16.2.4).
- Same Turbopack build.
- `outputFileTracingExcludes` applies identically.

Local `npm run build` (exit 0, 2,769 pages) matches Vercel's preview build (Ready in 49s for 6a.2 deployment, same page count). No environment-specific divergence found.

**One Vercel-only behavior to be aware of:** `X-Vercel-Cache: HIT` headers on the preview confirm Vercel's CDN edge cache serves static pages without invoking the function. If Block 6c introduces dynamic rendering (via runtime translation lookups), this will flip to `MISS` and slow first-byte. Static-prerender all translation lookups in Block 6c.

### 3.4 Static generation — VERIFIED

| Asset | Count |
|---|---|
| Static prerendered pages | 2,769 |
| Translated MDX files | 1,287 (117 slugs × 11 locales) |
| Total MDX files in `content/` | 2,336 (including `.raw.mdx` sidecars and source notes) |
| Sitemap entries | ~2,750 (one per English path × 11 locales — matches user's stated figure) |
| Dynamic-rendered routes | 5 (admin + API) |

All non-API public routes are statically prerendered. Accidental dynamic rendering: none detected.

### 3.5 Environment configuration — CLEAN

**Severity: NICE-TO-HAVE**

`.gitignore` (lines 33-68) correctly excludes:
- `.env*` (all env files).
- `noeldcosta-translate.json`, `*-service-account*.json`, `*-gcp-key*.json`, `.config/gcloud/` (Google credentials).
- `openai-key*`, `openai-*.txt`, `*openai*credentials*`, `.config/openai/` (OpenAI credentials).
- `public/Books/*.pdf`, `private/books/` (paid book manuscripts).

`git ls-files` cross-check — no env files committed. No credentials in tracked files. The only "key/secret/credential" filename match is `_docs/homepage/11-credentials.md` (the brand credentials page, no secrets) and MDX files mentioning "key" in titles.

`.env.local` exists locally but is not committed. **Recommended action:** create `.env.example` with placeholder keys so contributors know what env vars to set. Defer to post-launch.

**No required-but-undocumented env vars** detected in the build (build succeeded without complaining). Supabase env vars must be set on Vercel for `/admin/book-leads` and Stripe routes — assumed configured per the existing book-buy flow.

### 3.6 TypeScript — CLEAN

`npx tsc --noEmit` exit 0. No type errors.

Quick scan for type laxness:
- `any` in production code: a few in `RootLayoutShell` (no), `LanguageSwitcher` (none), `PostPage` (none). Bigger risk in `MdxBody.tsx` line 50-ish (`as any` cast for ReactMarkdown custom-tag support — documented inline).
- `as` casts: a few in `LanguageSwitcher.tsx` (e.g. `e.target as Node` in `mousedown` handler) — defensible.

**Recommended action:** no action. The casts that exist are deliberate and documented.

### 3.7 Linting — CLEAN

`npm run lint` exit 0. No errors, no warnings.

**Recommended action:** no action.

---

## PART 4 — Regression and edge cases

### 4.1 Previously broken scenarios — ALL FIXED

| Scenario | Status on `258d27f` Vercel preview |
|---|---|
| `/sap-implementation/` (was 404 in 6a v1 d5fcdd9) | **HTTP 200**, `X-Vercel-Cache: HIT`, `lang="en" dir="ltr"` |
| `/about/` (was 404 in 6a v1) | **HTTP 200**, `X-Vercel-Cache: HIT` |
| `/sap-implementation/sap-modules/` (nested URL) | **HTTP 200**, canonical = `https://noeldcosta.com/sap-implementation/sap-modules/`, full reciprocal hreflang map (verified at 6a.2 build time) |
| `/intl/ja/` direct access | **HTTP 200**, `lang="ja" dir="ltr"`, canonical = `https://noeldcosta.com/ja/` (correctly canonicalizes to the public URL, not `/intl/ja/`) |

The 6a v1 regressions are fully repaired by the architectural split. No new regressions discovered.

### 4.2 RTL handling — FOUNDATION SHIPPED, COMPONENTS NEED AUDIT

**Severity: IMPORTANT for Block 7**

`/ar/` and `/ar/sap-fico/` both emit `<html lang="ar" dir="rtl">` in production HTML. Browser CSS will apply RTL flipping to logical properties (`margin-inline-*`, `padding-inline-*`, `text-align: start/end`, etc.) but NOT to physical properties.

**Components with known physical-CSS issues (audit candidates for Block 7):**
- `src/components/LanguageSwitcher.tsx`: uses `right: max(1rem, ...)` (line 160) — should be `insetInlineEnd`. Dropdown panel uses `absolute right-0` (line 191) — won't flip in Tailwind v4 without logical-property variant.
- `src/components/StickyCTA.tsx` (per audit, "fixed CTA"): likely same pattern.
- `src/components/Nav.tsx`: mobile drawer uses fixed positioning. Likely physical-property based.
- `src/components/Hero.tsx`: headshot pinned right via flexbox `justify-end` or similar — `flex-row` does flip with `dir`, but inline-style `right:` would not.
- `src/components/article/TableOfContents.tsx`: sticky right-rail.
- All `.cc-mask` gradient masks (per `DESIGN_SYSTEM.md`): use `linear-gradient(to right, ...)` — needs `to inline-end`.
- All `pl-*`/`pr-*`/`ml-*`/`mr-*` Tailwind utilities throughout. Tailwind v4 has `ps-*`/`pe-*`/`ms-*`/`me-*` logical alternatives. The grep at audit-build time would surface counts.

**Scope estimate for Block 7:** ~30-50 component files touched, ~200-400 utility-class replacements (`pl-*` → `ps-*`, etc.). Plus the manual logical-property swaps in inline styles. Plus a visual regression pass on `/ar/` homepage, hero, nav, dropdown, sticky CTA, breadcrumbs.

**Test coverage strategy:** there are no automated tests. Block 7 needs at minimum:
1. Manual screenshot diff (English vs Arabic) on the top 5 pages — home, sap-implementation, about, sap-modules, a tag archive.
2. Mobile viewport check at 375px on Arabic.
3. Spot-check a translated blog post with the full long-form layout.

### 4.3 Mobile responsiveness — NOT MEASURED IN THIS REVIEW

**Severity: IMPORTANT — pre-existing concern**

Mobile audit `_docs/audits/mobile-audit-*.md` was referenced in PRD as task M-04 (status: pending). Not run during Phase 4. Recommended before cutover.

**What's already in place:**
- `LanguageSwitcher` button has `min-h-[44px] min-w-[44px]` (line 170) — meets WCAG 2.1 minimum touch target.
- Nav mobile drawer is sized for thumb reach (per DESIGN_SYSTEM.md).
- Body density is 14-16px (per blog-editor.md).

**Recommended action:** run the mobile audit prompt (`_docs/audits/_prompts/audit-1-mobile.md`) before Phase 5. Estimated 1 hour.

### 4.4 Performance — NOT BENCHMARKED IN THIS REVIEW

**Severity: NICE-TO-HAVE**

`Cache-Control: private, no-cache, no-store, max-age=0` on preview URLs is Vercel's preview default — production will use different headers. No TTFB or LCP measurements taken in this review.

**Pre-existing performance work in the codebase:**
- `optimizeCss: true` (critters) is enabled in `next.config.ts:16`.
- AVIF + WebP image formats configured.
- Capped `deviceSizes` to 1920px (per `next.config.ts:27`).
- Font `preload: false` on Sora (fallback only) to keep above-fold preloads minimal.
- `--cc-shadow-*` tokens use real CSS shadows (not box-shadow stacks).

Restructure performance impact: zero functions added, both root layouts re-use the same shared shell — bundle should be unchanged.

**Recommended action:** Lighthouse run pre-cutover (PRD task L-01, status pending). Estimated 30 min.

---

## PART 5 — Risk assessment

### 5.1 Risks for upcoming blocks

#### Block 6b — source consolidation

**Severity: IMPORTANT — manageable**

Three sources of truth identified by the audit:
1. **Category labels**: `Nav.tsx` PILLARS (lines 27-58), `Footer.tsx` solutions (lines 5-12), `src/lib/content.ts` CATEGORIES. Three places, same six labels.
2. **Tool labels**: `Nav.tsx` TOOLS (lines 60-86), `Footer.tsx` tools (lines 14-19). Two places, five labels.
3. **Beliefs**: `src/components/WhatIBelieve.tsx` BELIEFS (homepage, ~5 entries), `src/components/article/beliefs/data.ts` (about-page MDX include, same 5 with **subtle wording drift** — `"shouldn't"` vs `"should not"`, `"versus"` vs `"vs"`). Two places.

**Risks:**
- Categories: low. The labels are short and don't carry voice nuance. `lib/content.ts` is the canonical type-checked source; Nav and Footer can derive from it. Mechanical refactor.
- Tools: low. Same shape.
- Beliefs: **medium**. The two arrays have textually different content (per audit). One is homepage-context (8-second scan), one is about-page-context (long-form). Consolidating to one source loses one context. **Recommended approach:** keep two arrays but mark in code that they're intentional variants (a comment + linked URLs). OR consolidate and accept the homepage version goes long-form, which may bloat the hero scan. Get Noel's call before refactor.

**What could break during consolidation:**
- If Nav PILLARS array shape changes (e.g. adds a description field that wasn't there), Nav.tsx rendering changes. Test homepage manually after consolidation.
- If beliefs consolidation drops a sentence the homepage relied on for scan-time messaging, the homepage's WhatIBelieve component renders shorter copy. Visual regression risk.

#### Block 6c — UI string translation (~680 strings × 10 locales)

**Severity: IMPORTANT — biggest remaining work**

**Translation infrastructure decision:**

Three options:
1. **No library, in-house dictionary.** `src/lib/strings/<locale>.json` + a typed `t(locale, key)`. Minimal dep footprint, full control, easy to debug. Block 6c becomes: extract 680 strings → JSON keys → translate JSON → wire `t()` into each component.
2. **next-intl.** Mature, App-Router-native, supports nested keys + ICU message format (plurals, currency). Adds a runtime dep + boilerplate, but solves the plural problem (`{count, plural, one {article} other {articles}}`).
3. **lingui or react-intl.** Heavier than next-intl, less Next-aware.

**Recommended: Option 1 (in-house dictionary)** for this codebase size and the existing pattern (locale prop already threaded through components). Add `next-intl` only if Block 6c surfaces plural/gender/datetime complexity that an in-house `t()` can't handle cleanly.

**String length risks:**
- German strings are typically ~15-20% longer than English. Buttons, badges, eyebrows may overflow fixed widths (Hero "Book a 30-min call" → "Buchen Sie ein 30-minütiges Gespräch"). Visual regression test on `/de/` is mandatory.
- Arabic is generally narrower in character count but right-aligned with complex shaping. Combined with `dir="rtl"` from Block 7, visual checks needed.
- Japanese is shortest; rarely causes layout issues but the kerning/leading on `font-display` may need re-tuning for CJK glyphs.

**ErpCostClient.tsx (~160 strings) — specific risks:**
- 2,000+ line file. Form labels, select options, help text, error messages, result-display labels, print/export labels.
- Numeric formatting hardcoded to `en-US` (Intl.NumberFormat at lines 1058, 1085) — needs per-locale conversion.
- Currency: hand-rolled `$` prefix, no currency code. German users would expect `€`, Saudi users would expect `SAR` or `د.إ`. This is a Phase 5 decision: do we localize currency, or keep USD throughout?
- The tool sends user inputs to the LLM (per `src/lib/tools/registry.ts:94-95`); the prompt is English-stable. Keep the LLM prompt in English regardless of UI locale.

**What could go wrong:**
- Easy to miss strings (the audit estimates ~680 but is doing manual enumeration; real number may be higher).
- Easy to translate testimonial bodies by accident (see §2.10).
- Easy to translate proper-noun client names ("Etihad" should stay "Etihad" in Japanese, not transliterate to カタカナ).

#### Block 7 — RTL CSS

**Severity: IMPORTANT — scoped**

See §4.2. Estimate: ~30-50 files, ~200-400 class replacements. Tailwind v4 has logical-property variants (`ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`, `text-end`).

**Components most at risk:**
- `LanguageSwitcher.tsx` (positioning)
- `StickyCTA.tsx` (positioning)
- `Nav.tsx` (drawer, dropdowns)
- `Hero.tsx` (headshot alignment)
- All `cc-mask` gradient masks
- All breadcrumb chrome
- All ProductPromoCard variants
- TableOfContents sticky rail
- CategoryPage hero stat panel

**Test coverage strategy:** manual screenshot diff (en vs ar) on top 10 pages + mobile viewport check. No automated visual regression infra exists; building one is out of scope for Phase 4.

#### Block 8 — final verification

**Severity: NICE-TO-HAVE — well-bounded**

Pass criteria should be:
1. `npm run build` exit 0 with 2,769+ pages.
2. Vercel preview deploys clean.
3. Lighthouse mobile + desktop scores: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100.
4. Cross-browser visual check: Chrome, Safari, Firefox, Edge on `/`, `/ja/`, `/ar/`, `/de/sap-implementation/`, plus a tool page.
5. Mobile real-device check: at least iPhone Safari and one Android Chrome.
6. WCAG AA: focus ring on every interactive element; keyboard nav through nav + drawer + dropdown + dialog + lang switcher.
7. The 11-URL smoke test from this review continues to pass on the final commit.

Sign-off process: not defined. Recommended: Noel reads the 5 highest-traffic pages in person on Arabic, Japanese, German (the top 3 SEO markets) before DNS cutover.

#### Phase 5 — cutover

**Severity: IMPORTANT — needs documentation**

Open questions:
- **DNS strategy:** what TTL, what cutover window, who's on standby?
- **Rollback plan:** if metric K drops by X% in 24h, what's the revert command? Update DNS back to WordPress origin?
- **Monitoring:** which dashboards (Vercel Analytics + Search Console + manual ranking checks) will we watch in the first 72h?
- **GTranslate subscription:** keep it active during cutover as fallback? Cancel after 30 days of stable self-hosted i18n?

None of this is captured in PRD Phase 5 with enough specificity. Recommended action: 2-hour planning doc before Phase 5 starts.

### 5.2 Pre-launch checklist (additions)

Items not in current PRD Phase 5 plan that this review surfaces:

1. **Rewrite CLAUDE.md and PRD.md** to describe the actual self-hosted i18n architecture (§1.4).
2. **Stale path comments in `src/app/sitemap.ts`** (lines 52, 187) — trivial 2-line fix.
3. **Fix the visible breadcrumb locale leak** in 5 component files (§2.6, `[CR-1]`).
4. **Decide on testimonial / do-not-translate policy** before any future re-translation run (§2.10).
5. **Run the mobile audit** prompt that's been pending since M-04 (§4.3).
6. **Run Lighthouse** pre-cutover (§4.4).
7. **Quality spot-check translations** with native speakers for top 3 markets (§1.5).
8. **Document the DNS cutover + rollback plan** (§5.1 / Phase 5).
9. **GTranslate decision** — keep / cancel / overlap (§5.1 / Phase 5).
10. **Block 6c testimonial carve-out** in the translation script (§2.10).

---

## PART 6 — Recommendations

### 6.1 Critical (must address before Block 6b)

#### [CR-1] Locale-leaky visible breadcrumbs

**Description:** `PostPage.tsx`, `MdxPageLayout.tsx`, `CategoryPage.tsx`, `TagPage.tsx`, `CaseStudyArticlePage.tsx` all render `<Link href="/">Home</Link>` regardless of served locale. Users on `/ja/sap-implementation/` who click "Home" land on `/` (English), silently switching language. JSON-LD breadcrumbs are correctly locale-prefixed; only the human-visible nav is broken.

**Evidence:**
- `src/components/PostPage.tsx:108-114`, `118-125`
- `src/components/MdxPageLayout.tsx:60`
- `src/components/CategoryPage.tsx:251-256, 273`
- `src/components/TagPage.tsx:178, 183` (per audit)
- `src/components/case-studies/CaseStudyArticlePage.tsx:75-77`

**Recommended action: FIX NOW.** Pattern: replace `href="/"` with `href={\`${localePathPrefix(locale)}/\`}`. Visible label translation can wait for Block 6c. Estimated time: 1-2 hours, including testing on `/ja/` and `/ar/`.

#### [CR-2] Documentation drift contradicts the codebase

**Description:** `CLAUDE.md` and `PRD.md` describe the abandoned GTranslate strategy. Both explicitly say "No `[lang]` segment" and "no i18n libraries" — the entire current `src/app/(site-intl)/intl/[lang]/` subtree and the `scripts/translate-content.mjs` pipeline contradict these.

**Evidence:**
- `CLAUDE.md` "Critical context" section
- `PRD.md` "Translation architecture" section
- `PRD.md` Phase 4 description

**Recommended action: FIX BEFORE CUTOVER (Phase 5).** Whoever loads CLAUDE.md after the migration will be misled into thinking they shouldn't add `[lang]/` routes. The whole architectural pivot is invisible from the docs. Estimated time: 1 hour to rewrite the two affected sections.

#### [CR-3] No testimonial / proper-noun carve-out in translation pipeline

**Description:** `scripts/translate-content.mjs` has a glossary for SAP brand terms (`SAP`, `S/4HANA`, etc.) but NO carve-out for testimonial bodies, attributed quotes, or client names that should stay verbatim. Block 6c will externalize 680 UI strings into a translation dictionary — if testimonials follow, the LLM will translate real-people's quotes.

**Evidence:**
- `src/components/Testimonials.tsx:10-32` (3 testimonials)
- `src/components/article/testimonials/data.ts` (9 testimonials)
- `_docs/audits/i18n-strings-audit-2026-05-26.md:392-406, 730-736`

**Recommended action: FIX BEFORE BLOCK 6C STARTS.** Add a "DO NOT TRANSLATE" marker pattern (e.g. `<span translate="no">` or a `tNoTranslate` key prefix) to the script + document the policy in `blog-editor.md`. Estimated time: 30 min plus a paragraph in the policy doc.

### 6.2 Important (fix during Phase 4, not blocking)

#### [I-1] Single source of truth for locale list

`next.config.ts:76` hardcodes `"ar|de|el|es|fr|it|ja|nl|pt|ru"` and `locales.ts:49-60` carries `TARGET_LANGUAGES` separately. If a new locale is added, two files must update in lockstep. Mitigation: derive the regex from the array via a build-time codegen, or accept the drift risk with a code comment cross-reference. **Action: fix in Block 6b consolidation.** Estimated 15 min.

#### [I-2] Duplicate metadata between (site-en) and (site-intl) layouts

`src/app/(site-en)/layout.tsx` and `src/app/(site-intl)/intl/[lang]/layout.tsx` both carry the same `metadata` export (~35 lines each) and the same font setup. Risk: brand defaults drift if changed in one and not the other. Mitigation: factor into `src/lib/site-metadata.ts` and `src/lib/site-fonts.ts`. **Action: fix in Block 6b.** Estimated 30 min.

#### [I-3] Hardcoded "en-US" in ArticleHero date formatters

`src/components/article/ArticleHero.tsx:42, 51` call `.toLocaleDateString("en-US", ...)`. On Japanese articles, dates render as "January 15, 2024" instead of "2024年1月15日". **Action: fix in Block 6c.** Estimated 15 min — accept a locale prop, pass through.

#### [I-4] Stale `(site)/` path comments in `sitemap.ts`

Lines 52 and 187 reference `src/app/(site)/[...slug]/page.tsx` which no longer exists. Trivial cleanup. **Action: fix in Block 6b or 6c.** Estimated 2 min.

#### [I-5] Translated MDX quality not verified by native speakers

1,170 translated files, no human spot-check beyond a few samples. **Action: send 3-5 URLs each to one native speaker for top 3 markets (Arabic, Japanese, German) before Phase 5.** Estimated 1 hour to coordinate + native speakers' own time.

#### [I-6] Mobile audit and Lighthouse pending

PRD M-04 and L-01 are status `pending`. Not new from this review but unrun, and Phase 5 should not cut over without them. **Action: run both during Block 8.** Estimated 2 hours combined.

### 6.3 Nice-to-have (defer to post-launch backlog)

#### [N-1] `react-markdown` key-prop warnings

Hundreds of warnings in dev console from MDX rendering. Production-build HTML is unaffected. Cosmetic. **Action: investigate post-launch.** Estimated 1-2 hours to confirm source and either swap rehype config or upgrade deps.

#### [N-2] Bundle analyzer baseline

No bundle size baseline was captured. Useful for future regression tracking. **Action: post-launch.** Estimated 30 min.

#### [N-3] `.env.example` for contributors

`.env.local` is gitignored correctly; no example file documents required env vars. **Action: post-launch when more contributors join.** Estimated 15 min.

#### [N-4] Sitewide JSON-LD `inLanguage: "en"`

`websiteJsonLd()` and `personJsonLd()` hardcode `"en"`. Defensible since the entity is English-named, but could be locale-aware. **Action: post-launch.** Estimated 20 min.

#### [N-5] Currency formatting in calculators

Hand-rolled `$` prefix throughout calculators and book pricing. No per-locale currency. **Action: post-launch — Phase 5 doesn't need it; treat as a separate localization-finishing-touches phase.**

### 6.4 Honest assessment

**Is the migration on the right track?** Yes. The Block 6a v1 regression was costly (a partial day burned on the proxy debug + revert), but the 6a.2 architectural decision is sound and the Vercel preview proves it. The translation pipeline is well-engineered and the per-locale parity (117 files each) shows the work was done methodically, not in a rush.

**Are there architectural choices that should be reconsidered?** No. The multi-root-layout pattern is the canonical Next.js 16 i18n shape for the "English flat, translated /<lang>/" URL contract. Reconsidering it now would mean re-implementing translation infra from scratch.

**Is there scope creep risk in the remaining blocks?**
- **Block 6b (consolidation):** medium. Beliefs deduplication has a real semantic decision (homepage vs about-page voice) that needs Noel's call.
- **Block 6c (UI strings):** high. The audit's 680-string estimate is a lower bound (manual counting). The actual number after careful pass is plausibly 800-1,000. Plus testimonial carve-out, plus locale-aware date/number formatters, plus visual regression on string-length changes. **Realistic: 2 days, not 1.**
- **Block 7 (RTL):** medium. The component-level CSS audit is the biggest unknown — 30-50 files, ~300 utility-class replacements. Plus the manual physical-property swaps. **Realistic: 1-2 days.**
- **Block 8 (verification):** low. Well-bounded — Lighthouse + mobile + cross-browser + 11-URL smoke. **Realistic: 1 day.**

**Is the 3-5 day cutover timeline realistic?** Not quite. With the three CRITICAL fixes added (~3 hours) and the upper-bound estimates above, the more honest range is **5-7 days from this commit to DNS cutover**, including:
- 0.5 day: fix [CR-1], [CR-2], [CR-3]
- 1 day: Block 6b
- 2 days: Block 6c
- 1.5 days: Block 7
- 1 day: Block 8
- 0.5 day: Phase 5 prep + cutover + first-day monitoring

The 3-5 estimate was based on Block 6 already being done. It is — but the unplanned breadcrumb fix, the unwrite docs, and the visual regression burden of 6c+7 weren't priced in.

---

## Final verdict

**Should we proceed with Block 6b next, or address findings first?**

**Conditional YES — proceed with Block 6b after addressing the three CRITICAL items first.**

Specifically:
1. Fix [CR-1] (locale-leaky breadcrumbs) — 1-2 hours.
2. Fix [CR-2] (CLAUDE.md / PRD.md doc drift) — 1 hour.
3. Fix [CR-3] (testimonial carve-out in translate script) — 30 min.

These can land as a single commit on `staging-gtranslate-test` before Block 6b begins. They are not architecturally entangled with 6b's consolidation work, and fixing them first means Block 6b inherits a clean baseline rather than carrying these as parallel debts.

Block 6b itself is low-risk and can proceed immediately after the three fixes.

The remaining blocks (6c, 7, 8) are scoped large enough that they should be tackled one at a time with reviews at each boundary, not as a single sprint.
