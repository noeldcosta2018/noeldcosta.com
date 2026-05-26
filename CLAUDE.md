@AGENTS.md

@BRAND.md

@VOICE.md

@BUYER-CEO.md

@BUYER-CONSULTANT.md

@DESIGN_SYSTEM.md

@PRD.md

@blog-editor.md

# Noel D'Costa — Personal Brand Site

Personal brand site for Noel D'Costa. Senior ERP/AI advisor. Replacement
for noeldcosta.com (currently WordPress). SEO migration target: zero URL
changes from the WordPress version. Better copy, same paths.

## Critical context for any code changes

The WordPress origin uses GTranslate as a Translation Delivery Network for
the 10 non-English locales. Search Console data shows 64.5% of clicks come
from these translated URLs, so the Next.js replacement must serve all 11
language variants natively to preserve that traffic on cutover.

The Next.js site implements **self-hosted i18n** — no GTranslate, no
client-side translation, no external proxy. Architecture:

* **URL contract:** English is flat (`/sap-implementation/`); translated
  routes carry a locale prefix (`/ja/sap-implementation/`, `/ar/...`, etc.).
  Every WordPress URL is preserved 1:1 at both the English path and at the
  prefixed path for each of the 10 routed locales.
* **Routed locales** (10 + English): ar, de, el, es, fr, it, ja, nl, pt, ru.
  Single source of truth in `src/lib/locales.ts` (`TARGET_LANGUAGES`,
  `RTL_LOCALES`, `LOCALE_NATIVE_NAMES`, `OG_LOCALE_MAP`).
* **Routing:** `next.config.ts` rewrites `/<lang>/*` to `/intl/<lang>/*`
  internally. Two route groups split the public site:
  - `src/app/(site-en)/` — root layout for English routes, hardcoded
    `<html lang="en" dir="ltr">`.
  - `src/app/(site-intl)/intl/[lang]/` — root layout for translated routes
    under the `[lang]` dynamic segment, with `<html lang={params.lang}`
    `dir={RTL_LOCALES.includes(lang) ? "rtl" : "ltr"}>`. Statically
    prerendered via `generateStaticParams` + `dynamicParams: false`.
  - Body chrome (fonts, JSON-LD, LanguageSwitcher) is shared via
    `src/components/RootLayoutShell.tsx`.
* **Translation pipeline:** `scripts/translate-content.mjs` re-translates
  the English MDX sources into the 10 target locales using OpenAI's
  GPT-5.4 API. Output lives at `content/{posts,pages}/<slug>/<lang>.mdx`.
  Branded terms (SAP, S/4HANA, Joule, ERP, etc.) are preserved via a
  glossary; the script supports `--dry-run`, chunking for large files
  (>40KB), and a `<noTranslate>...</noTranslate>` marker for verbatim
  content (testimonial quotes, proper-noun client names).
* **Build characteristics:** 2,769 statically prerendered pages
  (every English path × 11 locales). All translated routes serve from
  Vercel's edge cache (`X-Vercel-Cache: HIT`); no runtime translation
  lookup, no dynamic SSR.
* **SEO:** every page emits per-locale canonical, full reciprocal
  hreflang map (en + 10 + `x-default`), and `og:locale` per `OG_LOCALE_MAP`.
  Sitemap emits one entry per locale per URL.

See `_docs/references/wordpress-urls.md` for the canonical URL list,
`_docs/references/search-console-findings.md` for the traffic data,
`_docs/audits/i18n-strings-audit-2026-05-26.md` for the UI strings audit,
and `_docs/audits/phase-4-comprehensive-review-2026-05-26.md` for the
end-to-end review of the i18n migration.

## Stack notes

* Next.js (App Router, src/ directory). Read AGENTS.md before writing code.
* TypeScript everywhere.
* MDX for blog content (mdx-components.tsx at root, content/ folder for posts).
* Tailwind (postcss.config.mjs).
* Self-hosted i18n. 11 locales (en + 10 routed). English at flat URLs;
  translated at `/<lang>/...` via the `(site-intl)/intl/[lang]/` route
  group. See "Critical context" above.
* Design system tokens in src/app/globals.css (Command Center system).

## Routing table

| Task | Edit | Read |
|------|------|------|
| Homepage hero | src/components/Hero.tsx | _docs/homepage/01-hero.md, BUYER-CEO.md |
| Homepage trust bar / logos | src/components/LogoScroll.tsx, Ticker.tsx | _docs/homepage/02-trust-bar.md |
| Homepage problem section | src/components/ProblemStats.tsx | _docs/homepage/03-problem.md |
| Homepage services / what I do | src/components/Services.tsx | _docs/homepage/04-services.md |
| Homepage case studies | src/components/TrackRecord.tsx | _docs/homepage/05-case-studies.md |
| Homepage how I work | src/components/HowIWork.tsx | _docs/homepage/06-how-i-work.md |
| Homepage what I believe | src/components/WhatIBelieve.tsx | _docs/homepage/07-what-i-believe.md, BRAND.md |
| Homepage AI capabilities | src/components/AICapabilities.tsx | _docs/homepage/08-ai-capabilities.md |
| Homepage tools / products | src/components/Tools.tsx | _docs/homepage/09-tools.md |
| Homepage testimonials | src/components/Testimonials.tsx | _docs/homepage/10-testimonials.md |
| Homepage about / credentials | src/components/Credentials.tsx | _docs/homepage/11-credentials.md |
| Homepage YouTube section | src/components/YouTubeSection.tsx | _docs/homepage/12-youtube.md |
| Homepage final CTA | src/components/CTABanner.tsx | _docs/homepage/13-cta.md |
| Nav (global) | src/components/Nav.tsx | _docs/homepage/14-nav.md, BRAND.md |
| Footer (global) | src/components/Footer.tsx | _docs/homepage/15-footer.md, BRAND.md |
| Brand wordmark (Nav + Footer) | src/components/BrandWordmark.tsx | public/brand/noeldcosta-on-{light,dark}.svg |
| Homepage assembly | src/app/(site-en)/page.tsx | PRD.md (H-16) |
| For-consultants page | src/app/(site-en)/for-consultants/ | _docs/for-consultants/CONTEXT.md |
| About page | src/app/(site-en)/about/ | _docs/about/CONTEXT.md |
| Case study page | src/app/(site-en)/[...slug]/ (English) | _docs/case-studies/CONTEXT.md |
| Tool page | src/app/(site-en)/<tool-slug>/ | _docs/tools/CONTEXT.md |
| Blog post layout | src/components/PostPage.tsx | _docs/blog/CONTEXT.md |
| Category page layout | src/components/CategoryPage.tsx | _docs/blog/CONTEXT.md |
| MDX content (English source) | content/posts/<slug>/en.mdx, content/pages/<slug>/en.mdx | _docs/blog/CONTEXT.md |
| Translated MDX content | content/{posts,pages}/<slug>/<lang>.mdx (generated by scripts/translate-content.mjs) | scripts/translate-content.mjs |
| English root layout | src/app/(site-en)/layout.tsx | — |
| Intl root layout (per-locale `<html lang/dir>`) | src/app/(site-intl)/intl/[lang]/layout.tsx | — |
| Shared body chrome (fonts, JSON-LD, LanguageSwitcher) | src/components/RootLayoutShell.tsx | — |
| Locale constants (LOCALES, TARGET_LANGUAGES, RTL_LOCALES, OG_LOCALE_MAP) | src/lib/locales.ts | — |
| Locale-prefix rewrites (`/<lang>/* → /intl/<lang>/*`) | next.config.ts | — |
| Language switcher (floating widget) | src/components/LanguageSwitcher.tsx | — |
| Translation script (OpenAI GPT-5.4) | scripts/translate-content.mjs | — |
| SEO, sitemap, robots | src/lib/seo.ts, src/app/sitemap.ts, src/app/robots.ts | BRAND.md, _docs/references/wordpress-urls.md |

## Rules

* Read AGENTS.md before writing any Next.js code. The version has breaking changes.
* Read BRAND.md and VOICE.md before writing any user-facing copy.
* Before changing a URL or route, stop. SEO migration target is zero URL changes from WordPress.
* Sentence-case headings everywhere. No title case marketing copy.
* No em-dash sentence patterns ("X — Y" structures). See VOICE.md.
* Use design tokens from DESIGN_SYSTEM.md / globals.css. No new colors.
* Components that render content must accept and use a `locale` prop. URL
  construction (Link hrefs, JSON-LD URLs, canonical) must use
  `localizedPath(locale, path)` from `src/lib/locales.ts` so translated
  pages don't leak users back to English.
* When unsure, ask before generating files.

## Naming conventions

* Component files: PascalCase (Hero.tsx, ProblemStats.tsx).
* Doc files: kebab-case (01-hero.md, design-system.md).
* Content slugs: match WordPress slugs exactly. Do not invent new slugs.
* Source material for blog posts: content/_source/[topic]-notes.md.

## Constraints — what NOT to do

### URLs and SEO

* DO NOT change any existing URL slug from noeldcosta.com. Every WordPress
URL maps 1:1 to a Next.js route. Rewriting copy is fine. Renaming slugs
is not. 64.5% of traffic depends on URL preservation.
* DO NOT change the locale-prefix shape. English stays flat; translated
routes stay at `/<lang>/<slug>/` with the trailing slash. The
`/intl/<lang>/...` shape is an internal rewrite target — never link to it
directly, and never expose it in canonicals or sitemap entries.
* DO NOT add new URL patterns without checking the existing site first.
If a similar page exists at noeldcosta.com, use that slug.
* DO NOT remove or modify src/lib/seo.ts, src/app/sitemap.ts, src/app/robots.ts
without flagging it explicitly. SEO infrastructure is migration-critical.
* DO NOT introduce 301 redirects unless I explicitly ask. The plan is
zero redirects.
* DO NOT hand-roll hreflang tags. Use `buildLanguageAlternates(englishPath)`
from `src/lib/seo.ts` — it emits the full reciprocal map (en + 10 routed
locales + `x-default`) that Google requires for cluster recognition.
* DO NOT generate sitemap entries for non-existent pages.
* DO NOT emit only English entries in the sitemap. Every URL must appear
once per locale via the `emitWithLocales` helper in `src/app/sitemap.ts`.

### i18n compatibility

* DO NOT render user-facing copy client-side only. Initial SSR HTML is what
search engines (and the `getStaticParams` prerender) see — anything that
only appears after JavaScript runs misses the build-time translation pass.
* DO NOT introduce `proxy.ts` / middleware that modifies request headers
on translated routes. The Block 6a v1 attempt (commit `d5fcdd9`, reverted
in `857e89c`) forced dynamic SSR on the `[...slug]` catch-all routes,
which then 404'd because `outputFileTracingExcludes` strips `content/`
from the function bundle. The multi-root-layout pattern (Block 6a.2) is
the canonical fix.
* DO NOT hardcode `lang="en"` or `dir="ltr"` on the `<html>` element.
Use the route group: English route group hardcodes en/ltr; intl route
group derives from `params.lang` + `RTL_LOCALES`.
* DO NOT hardcode `href="/"` or `href="/category/X"` etc. in visible
breadcrumbs or any cross-page link inside a component that accepts a
`locale` prop. Use `localizedPath(locale, "/...")` so translated users
stay in their locale when clicking back.

### Voice and copy

* DO NOT use em-dash sentence patterns ("X — Y" or "doesn't just X, it Y").
Banned. See VOICE.md.
* DO NOT use marketing buzzwords from the VOICE.md banned list.
* DO NOT write in third person about Noel. First person only.
* DO NOT use "we", "our team", "Quantinoid" in user-facing copy. This
is a personal brand site.
* DO NOT use Title Case for headings. Sentence case only.
* DO NOT add testimonials, quotes, or attribution that isn't on the
reference list. Made-up quotes are an instant fail.
* DO NOT invent client names, project numbers, or financial outcomes.
If a number isn't in _docs/references/client-list.md, ask before using it.

### Code and stack

* DO NOT modify package.json dependencies without flagging it. The Next.js
version has breaking changes. See AGENTS.md.
* DO NOT introduce new heavy dependencies (animation libs, UI kits,
CSS-in-JS) without asking. Stack is Next.js + Tailwind. Keep it that way.
* DO NOT add i18n libraries (next-intl, next-i18next, react-intl, lingui)
without explicit discussion. The codebase uses an in-house pattern: a
`locale` prop threaded through components plus `localizedPath()` helpers.
If a future use case (plurals, ICU message format, datetime localisation
beyond `Intl.DateTimeFormat`) genuinely needs library support, flag it.
* DO NOT use 'use client' on the homepage components unless they
genuinely need client-side interactivity. SEO and performance suffer.
Initial-paint translation correctness also suffers — client-only copy
misses the build-time per-locale prerender.
* DO NOT add tracking scripts, pixels, or analytics without asking.
* DO NOT generate placeholder content (Lorem ipsum, fake names,
stock testimonials). If real content is missing, leave a clear
TODO comment and ask.
* DO NOT fix accessibility, performance, or SEO issues silently as
side effects. Flag them, ask, then fix.

### Audience boundaries

* DO NOT put consultant career content on the main homepage. That
audience lives on /for-consultants and on erpcv.com.
* DO NOT cross-pollinate buyer messaging. CEO copy on the homepage,
consultant copy on /for-consultants. They don't overlap.
* DO NOT write copy that addresses two audiences in one section.
One section, one audience, one job.

### Design

* DO NOT introduce new colors outside the DESIGN_SYSTEM.md palette.
* DO NOT use Tailwind's default color names (blue-500, gray-400) unless
there's a specific reason. Use --cc-* tokens.
* DO NOT use stock photography of people. Real photos only or no photos.
* DO NOT add emoji to public-facing copy. (Fine in chat.)
* DO NOT animate things that don't need to move. Tickers fine, decorative
animations no.

## Constraints — blog & MDX content (anti-AI-detection)

Blog content must read as human-written experience. Google's helpful
content systems down-rank generated content that lacks experience signals.
The site survives migration only if blog content passes E-E-A-T scrutiny.

### Always include in every blog post

* A specific lived moment. "On the EDGE Group programme in 2022, we hit X
in week 3 of cutover." Not "Many programmes face challenges."
* At least one concrete number that came from real experience. "We saved
$4.2M by..." Not "significant savings."
* A named client, vendor, or system version where appropriate
(and where contractually OK to name).
* An opinion or judgment. Not just "this happened" but "this is what
I learned and would do differently."
* Voice imperfections. A sentence fragment. A "honestly, this surprised me."
An aside. Real writing has texture.

### Never do in blog content

* DO NOT start posts with "In today's fast-paced world", "In an era of
digital transformation", or any variation. Banned opener pattern.
* DO NOT use the phrase "It's important to note that". Just say the thing.
* DO NOT structure every section as Problem → Solution → Benefit. That's
generated-content scaffolding. Mix structures.
* DO NOT write paragraphs that are exactly the same length throughout
the post. Real human writing has rhythm variance.
* DO NOT include a generic conclusion paragraph that summarises what
was just said. Real writers end on a thought, an opinion, or a question.
* DO NOT use bullet lists with parallel-structure items in every section.
("Three benefits of X: Reduced costs. Improved visibility. Better
outcomes.") That's the giveaway pattern.
* DO NOT generate articles longer than 2,500 words on a topic without a
source interview, transcript, or notes file in content/_source/.
* DO NOT write articles where every paragraph could be moved without
changing the meaning. That structure is a generation tell.

### Process for blog posts

1. Reference material first. Before writing, ask Noel for the source.
Project notes, an interview transcript, a video transcript, a draft.
Without source material, the post will read as generated.
2. Voice match. Read VOICE.md and the last 3 published posts to calibrate.
3. Draft in markdown in content/. Include source references in
frontmatter.
4. After drafting, run a "human pass". Re-read and add 2-3 imperfections,
asides, or specific moments that a generator wouldn't naturally include.
5. Flag any claim that needs fact-checking. Don't fabricate numbers.

### Frontmatter required for every MDX post

* title, slug (matches WordPress slug), date, category
* author: "Noel D'Costa"
* experience_source: where the content came from (project, interview, etc)
* last_reviewed: date Noel last read it personally

The experience_source field is internal. It's a forcing function. If
it's empty, the post isn't ready to publish.

Note on translation. The English MDX at `content/<type>/<slug>/en.mdx` is
the source of truth. Translated variants are generated by
`scripts/translate-content.mjs` and committed under
`content/<type>/<slug>/<lang>.mdx`. To re-translate a post after editing
the English version, run `npm run translate -- --slug <slug>` (use
`--dry-run` first to estimate cost). Wrap verbatim content (testimonial
quotes, proper-noun client names) in `<noTranslate>...</noTranslate>` so
the pipeline preserves it across all locales.

## Reference files

| File | Purpose |
|------|---------|
| `_docs/references/wordpress-urls.md` | Every URL to preserve. Source of truth for migration. |
| `_docs/references/priority-urls.md` | Top 143 URLs ranked by Search Console traffic. |
| `_docs/references/search-console-findings.md` | Why GTranslate matters. Traffic data. |
| `_docs/references/search-console-export.xlsx` | Raw Search Console data. |
| `_docs/audits/_prompts/audit-1-mobile.md` | Mobile responsiveness audit prompt. |
| `_docs/audits/_prompts/audit-2-seo.md` | SEO audit prompt. |
| `_docs/audits/_prompts/phase-3-gtranslate.md` | Historical — pre-pivot GTranslate setup prompt (kept for context, no longer applicable). |
| `_docs/audits/i18n-strings-audit-2026-05-26.md` | Audit of ~680 hardcoded UI strings; input to Block 6c. |
| `_docs/audits/phase-4-comprehensive-review-2026-05-26.md` | End-to-end review of the self-hosted i18n migration. |
| `playbook.md` (repo root or _docs/) | Step-by-step migration plan. |
