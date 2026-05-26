# UI strings i18n audit — 2026-05-26

Audit of hardcoded English UI strings across the noeldcosta-web Next.js
codebase, to support the Phase 4 native-i18n migration (11 locales served
via `/[lang]/` URL prefixes, rewriting to `/intl/[lang]/`).

Scope: user-facing strings rendered in components, layouts, and config.
Excluded: MDX article content, internal docs, scripts, test fixtures,
dev-only logs, and admin pages. ARIA labels and SR-only text included.

## Do-not-translate policy (Block 6a.3 — added 2026-05-26)

The following content MUST be preserved verbatim across all 10 target
locales — never machine-translated. Block 6c (UI string translation)
must route these through the `<noTranslate>...</noTranslate>` marker
in `scripts/translate-content.mjs` (see CR-3 fix in commit Block 6a.3,
or `npm run translate:test-marker` for the smoke test). Translating
these breaks authenticity (real-people quotes), brand identity (proper
nouns), or legal claims (attributed statements).

| File | Region | Reason |
|---|---|---|
| `src/components/Testimonials.tsx:10-32` | The 3 testimonial body strings (Mike Papamichael, Andrew MacFarlane, Takhliq Hanif quotes) | Real attributed quotes from real people. Translating misrepresents what they said. |
| `src/components/article/testimonials/data.ts` | All 9 testimonial body strings | Same reason. |
| `src/components/Hero.tsx` line 184 | `"CIMA"`, `"AICPA"`, `"Masters in Accounting"`, client names | Proper nouns and credentials. |
| `src/components/LogoScroll.tsx:3-14` | All 12 client names (`"EDGE Group"`, `"Etihad Airways"`, etc.) | Proper nouns. Transliteration risk in Arabic/Japanese; keep Latin script. |
| `src/components/Credentials.tsx:60-64` | Press publication names | Proper nouns. |
| `src/components/TrackRecord.tsx:39, 55, 71, 87, 103` | Client and subsidiary names | Proper nouns. |
| `src/components/Footer.tsx` line 151 | `"© 2026 Noel D'Costa · Quantinoid LLC"` | Legal copyright line. |
| All `src/components/case-studies/` verbatim quote strings | Per case-study | Real-client attributed claims. |
| `src/lib/case-studies.ts` `client.label` for each case study | Per case-study | Client names — proper nouns. |
| `src/components/article/programmes/data.ts` programme `sectorRegion` lines | All entries | Proper nouns (city, sector). |
| Job titles in any role descriptor (`"Ex-CIO, Etihad Aviation Group"`, etc.) | Partial — translate the role label ("Ex-CIO"), keep the company name verbatim | Per audit recommendation. |

Implementation pattern (for Block 6c):

```mdx
{/* English source MDX */}
<noTranslate>
"Working with Noel on the Etihad SAP Centre of Excellence reset our
delivery pace by months. Senior, direct, no PowerPoint theatre."
— Mike Papamichael, Ex-CIO, Etihad Aviation Group
</noTranslate>
```

After running `npm run translate`, the wrapped block is identical in
every `<lang>.mdx` output file. The wrapper tags themselves survive in
the translated file so re-translating later is idempotent.

When Block 6c externalizes UI strings into a per-locale dictionary,
the testimonial component bodies should NOT be in the dictionary at
all — they should be rendered as MDX or as a fixed-string constant
that the translation pipeline never sees.

## Summary

- **Total hardcoded UI strings found: ~680**
  - Inline strings (in JSX/markup): **~290**
  - Strings declared in same-file constants/arrays: **~390**
- Strings already in shared lib constants (i.e. `src/lib/*.ts`,
  `src/components/tagMeta.ts`): **~95** (`CATEGORIES`, `INDUSTRY_LABEL`,
  `SERVICE_LABEL`, `REGION_LABEL`, `TAG_META`, `SAP_MODULE_CATEGORIES`,
  `SAP_MODULES`, COUNTRIES, scenarios)
- Date/number formatters using a locale: **2**
  (both hardcode `"en-US"`)
- Date/number formatters NOT using locale (default or string-concat):
  **~10** (`.toLocaleString()` / `.toLocaleDateString()` without arg,
  plus several hand-rolled `$` / `%` formatters)

The string count is an estimate. The four LLM-tool clients
(`ErpCostClient.tsx`, `SapCostClient.tsx`, `MigrationClient.tsx`,
`SolutionClient.tsx`) carry roughly 250 enum/option/label/help strings
between them — those are listed by file and quantity rather than fully
enumerated. The Hero/Services/HowIWork/WhatIBelieve/Testimonials/FAQ
homepage components carry verbatim copy that is best treated as
"per-locale paragraph keys" rather than one-string-at-a-time.

## Existing i18n infrastructure

The codebase has **no third-party i18n library** in `package.json` — no
`next-intl`, `react-i18next`, `next-i18next`, `react-intl`, `lingui`,
or `formatjs`. (This is consistent with the AGENTS.md rule "do not
introduce i18n libraries" which the Phase 4 migration explicitly
overrides.)

What does exist:

- **`src/lib/locales.ts`** — single source of truth for the locale
  union, the `TARGET_LANGUAGES` list, hreflang locales, native-name
  labels (`LOCALE_NATIVE_NAMES`), `OG_LOCALE_MAP`, RTL locales,
  `localePathPrefix()`, and `localizedPath()`. Recently added by the
  prompt author.
- **`src/lib/seo.ts`** — emits `buildLanguageAlternates(englishPath)`
  used in every route's metadata. Already locale-aware for canonical /
  hreflang.
- **MDX content** translations live under `content/posts/<slug>/<lang>.mdx`
  and are consumed via `getPost(slug, locale)` / `getPage(slug, locale)`
  in `src/lib/content.ts`. The script `scripts/translate-content.mjs`
  generates these.
- **Locale-aware routes**: `src/app/(site)/intl/[lang]/...` mirrors the
  English routes; `next.config.ts` rewrites `/<lang>/...` to
  `/intl/<lang>/...`. The locale is threaded into `CategoryPage`,
  `TagPage`, `PostPage`, `MdxPageLayout` as a `locale` prop. **However,
  those components only pass the locale into content-fetch and
  JSON-LD URL generation — none of their hardcoded UI chrome (e.g.
  "Home", "Start here", "View all N articles", "Read article →",
  "Continue reading", section eyebrows) is locale-switched.**
- **`src/components/LanguageSwitcher.tsx`** — newly shipped, uses
  `LOCALE_NATIVE_NAMES`, handles ARIA, RTL `dir`, and URL stripping.
  Its own ARIA strings ("Select language") are hardcoded English.
- **No translation function or message catalogue** exists. There is no
  `t("key")` wrapper, no `translations/<lang>.json`, no `dictionaries/`
  folder. Every UI string is a JSX literal or a top-of-file constant.

Other locale-conscious code:

- `src/app/(site)/layout.tsx` sets `<html lang="en" dir="ltr">`
  **unconditionally** — should derive from the served locale (RTL for
  `ar`). This is a structural bug that will land on every translated
  page until fixed.
- `src/components/LanguageSwitcher.tsx` does set `lang` / `dir` per
  option in its listbox, so the switcher itself renders Arabic
  right-aligned correctly.
- `next.config.ts` (not read in this audit) controls the
  `/<lang>/* → /intl/<lang>/*` rewrites.

## Findings — grouped by file

### src/components/Nav.tsx

PILLARS and TOOLS are local constants at top of file (lines 27-86).
Mobile drawer rebuilds the same list at lines 369-378.

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 30 | `"ERP Consulting Guide"` | PILLARS label, nav dropdown + mobile drawer | constant in same file |
| 31 | `"Delivery playbooks, programme recovery, go-live readiness."` | PILLARS blurb | constant |
| 35 | `"SAP Modules"` | PILLARS label | constant |
| 36 | `"SAP S/4HANA, Oracle, Dynamics. Module-level deep dives."` | PILLARS blurb | constant |
| 40 | `"ERP Strategy"` | PILLARS label | constant |
| 41 | `"Roadmaps, TCO, vendor selection, transformation design."` | PILLARS blurb | constant |
| 45 | `"AI Governance"` | PILLARS label | constant |
| 46 | `"Policy, risk, controls, model oversight on ERP data."` | PILLARS blurb | constant |
| 50 | `"Agentic AI"` | PILLARS label | constant |
| 51 | `"Autonomous agents in the ERP stack. What actually works."` | PILLARS blurb | constant |
| 55 | `"SAP Case Studies"` | PILLARS label | constant |
| 56 | `"Real programme outcomes from aviation, government, and retail."` | PILLARS blurb | constant |
| 62 | `"ERP Cost Calculator"` | TOOLS label | constant |
| 63 | `"LLM-estimated cost band for any ERP programme."` | TOOLS blurb | constant |
| 67 | `"SAP Cost Calculator"` | TOOLS label | constant |
| 69 | `"SAP-specific cost, licence, and resourcing estimate."` | TOOLS blurb | constant |
| 72 | `"Migration Estimator"` | TOOLS label | constant |
| 74 | `"Data migration effort across SAP, Oracle, and Microsoft."` | TOOLS blurb | constant |
| 77 | `"JD Generator"` | TOOLS label | constant |
| 79 | `"Role-accurate SAP job descriptions in seconds."` | TOOLS blurb | constant |
| 82 | `"Solution Builder"` | TOOLS label | constant |
| 84 | `"Sketch a solution architecture from a plain-English brief."` | TOOLS blurb | constant |
| 144 | `"noeldcosta — home"` | brand link aria-label | inline |
| 154 | `"Close menu"` / `"Open menu"` | hamburger aria-label | inline |
| 188 | `"Solutions"` | desktop dropdown trigger | inline |
| 236 | `"Tools"` | desktop dropdown trigger | inline |
| 274 | `"Case Studies"` | top nav link | inline |
| 293 | `"Books"` | top nav link | inline |
| 312 | `"About"` | top nav link | inline |
| 332 | `"Contact"` | top nav primary CTA | inline |
| 370 | `"Solutions"` | mobile drawer heading | inline |
| 372 | `"Tools"` | mobile drawer heading | inline |
| 374 | `"Company"` | mobile drawer heading | inline |
| 375 | `"Books"` | mobile drawer link | inline |
| 376 | `"About"` | mobile drawer link | inline |
| 377 | `"Contact"` | mobile drawer link | inline |

Note: PILLARS labels duplicate `src/lib/content.ts` `CATEGORIES` (which
has `label: "ERP Consulting Guide"` etc.) — there is **two sources of
truth** for category labels. Same applies to TOOLS labels which
duplicate `src/components/Footer.tsx`.

### src/components/Footer.tsx

solutions/tools/company arrays declared inline in component body (lines 5-26).

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 6 | `"ERP Consulting Guide"` | solutions link label | constant |
| 7 | `"SAP Modules"` | solutions link label | constant |
| 8 | `"ERP Strategy"` | solutions link label | constant |
| 9 | `"AI Governance"` | solutions link label | constant |
| 10 | `"Agentic AI"` | solutions link label | constant |
| 11 | `"SAP Case Studies"` | solutions link label | constant |
| 14 | `"ERP Cost Calculator"` | tools link label | constant |
| 15 | `"SAP Cost Calculator"` | tools link label | constant |
| 16 | `"Migration Estimator"` | tools link label | constant |
| 17 | `"JD Generator"` | tools link label | constant |
| 18 | `"Solution Builder"` | tools link label | constant |
| 21 | `"About"` | company link label | constant |
| 22 | `"Books"` | company link label | constant |
| 23 | `"Case Studies"` | company link label | constant |
| 24 | `"YouTube"` | company link label | constant |
| 25 | `"Contact"` | company link label | constant |
| 39 | `"noeldcosta — home"` | brand link aria-label | inline |
| 44-47 | `"ERP, Data & AI consulting. 25+ years helping companies get real value from SAP, Oracle, and AI systems."` | brand blurb under logo | inline |
| 90 | `"Solutions"` | footer column heading | inline |
| 106 | `"Free Tools"` | footer column heading | inline |
| 122 | `"Company"` | footer column heading | inline |
| 151 | `"© 2026 Noel D'Costa · Quantinoid LLC"` | copyright (year hard-coded) | inline |
| 155 | `"Privacy"` | bottom link | inline |
| 161 | `"Support"` | bottom link | inline |

### src/components/LanguageSwitcher.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 166 | `"Select language"` | button aria-label | inline |
| 167 | `"listbox"` (`aria-haspopup`) | non-translatable structural | n/a |
| 188 | `"Select language"` | listbox aria-label | inline |

Native-name labels (`LOCALE_NATIVE_NAMES`) are already
translation-aware by design (they show in the user's target language),
so no work needed there.

### src/components/StickyCTA.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 42 | `"Book consultation"` | floating CTA button | inline |

### src/components/Hero.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 25 | `'I run ERP transformations'` | HEADLINE constant, h1 first half | constant |
| 26 | `'the board can defend.'` | EMPHASIS constant, h1 italic tail | constant |
| 28-33 | `'$700M+'` / `'delivered'`, `'84'` / `'entities migrated'`, `'25 yrs'` / `'in ERP & AI'`, `'5'` / `'continents'` | STATS row | constant |
| 68 | `"Noel D'Costa"` | mobile headshot alt | inline |
| 86 | `'ERP · AI · 25 years'` | eyebrow | inline |
| 128-132 | `"ECC to S/4HANA. AI on SAP. 25 years delivering enterprise transformations across..."` (multi-line sub-headline with bold spans) | sub-headline paragraph | inline |
| 130 | `"defence, aviation, energy, financial services, and the public sector"` | bold span | inline |
| 131 | `"$700M+ in total impact"` | bold span | inline |
| 132 | `"CIMA-qualified. I lead the engagement. I don't subcontract."` | sub-headline tail | inline |
| 157 | `"Book a 30-min call"` | primary CTA | inline |
| 174 | `"See case studies"` | secondary CTA | inline |
| 184 | `"CIMA"` / `"AICPA"` / `"Masters in Accounting"` / `"25+ years across EDGE Group, Etihad, ADNOC, PIF entities, DXC, and the UAE Government"` | credibility line | inline |
| 196 | `"Noel D'Costa on LinkedIn"` | LinkedIn aria-label | inline |
| 248 | `"Noel D'Costa"` | desktop headshot alt | inline |

### src/components/LogoScroll.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 3-14 | 12 client names (`"EDGE Group"`, `"Etihad Airways"`, `"DXC Technology"`, `"Dept. of Gov. Enablement"`, `"Technology Innovation Institute"`, `"Protiviti"`, `"ADNOC"`, `"PIF Entities"`, `"Pepsi"`, `"P&G"`, `"United Arab Bank"`, `"Etoile Group"`) | LOGOS constant | constant |
| 24 | `"Delivered for companies including"` | section eyebrow | inline |

Client names are proper nouns — most should NOT be translated.
"Dept. of Gov. Enablement" is the only ambiguous one (Arabic
transliteration is a separate question).

### src/components/Ticker.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 2-8 | 7 ticker items, each with `mod` / `txt` / `badge` strings: e.g. `"ECC Migration"`, `"LIVE"`, `"25 Entities → 1 ERP"`, `"$60M SAVED"`, `"Route Profitability"`, `"$400M+"`, `"ERP Tracking Tool"`, `"BUILT"`, `"1,200+ Career Packs"`, `"89% MORE INTERVIEWS"`, `"800+ Consultants"`, `"$300M"` | ITEMS constant | constant |

Mix of stat labels and product/programme names. The badges
("LIVE", "BUILT", "ACTIVE", "$60M SAVED") are user-facing and should
be locale-switched.

### src/components/ProblemStats.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 6 | `"of ERP projects go over budget or miss their deadline."` | stat body 1 | constant |
| 7 | `"Panorama Consulting, 2024"` | stat source (citation; arguably should NOT translate) | constant |
| 13 | `"average cost overrun on mid-market S/4HANA migrations."` | stat body 2 | constant |
| 14 | `"Resulting IT, 2024"` | stat source | constant |
| 20 | `"of companies say ERP failed to deliver expected business value."` | stat body 3 | constant |
| 21 | `"Gartner Research, 2023"` | stat source | constant |
| 33 | `"[ The problem ]"` | section eyebrow | inline |
| 36 | `"Most ERP projects fail. Yours doesn't have to."` | h2 aria-label | inline |
| 41 | `"Most ERP projects fail."` (`{`...`}` text node) | h2 visible first half | inline |
| 43 | `"Yours doesn't have to."` | h2 italic tail | inline |
| 48 | `"You already know this. The numbers just confirm it."` | section intro | inline |

### src/components/Services.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 79 | `"[ 01 · Who I help ]"` | section eyebrow | inline |
| 85-88 | `"Two types of people find me useful."` / `"Maybe you're one."` | h2 | inline |
| 91-92 | `"Companies that need ERP and AI done right. Consultants who need straight advice on their career."` | section intro | inline |
| 97 | `"CLIENT · 01"` | service card 1 number eyebrow | inline (prop) |
| 98 | `"Company Executives & Sponsors"` | service card 1 title | inline (prop) |
| 99 | `"CIOs · CFOs · Programme Directors"` | service card 1 who | inline (prop) |
| 101-102 | 2 paragraphs of body copy | service card 1 paras | inline (prop array) |
| 104-110 | 5 list bullets (`"ECC to S/4HANA migration planning and delivery"`, etc.) | service card 1 list | inline (prop array) |
| 111 | `"Talk about your project →"` | service card 1 CTA (with arrow) | inline (prop) |
| 116 | `"CLIENT · 02"` | service card 2 number | inline |
| 117 | `"ERP & SAP Consultants"` | service card 2 title | inline |
| 118 | `"Independent Consultants · Career Changers"` | service card 2 who | inline |
| 120-121 | 2 paragraphs | service card 2 paras | inline |
| 123-129 | 5 list bullets | service card 2 list | inline |
| 130 | `"Check out my tools →"` | service card 2 CTA | inline |

### src/components/TrackRecord.tsx

PROJECTS constant declared inline at the top of the file (lines 37-118).

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 39 | `"EDGE Group"` | project company name | constant |
| 40 | `"$60M saved"` | badge | constant |
| 42 | `"25 Defense Entities → One S/4HANA"` | project title | constant |
| 43 | `"Consolidated 8 legacy ERPs onto single S/4HANA core. 126-member team. 81% process automation across the entire defence group."` | project desc | constant |
| 45 | `"edge.dashboard"` | dashboard label | constant |
| 47-50 | `"Cost Reduction"`, `"Automation"`, `"Team Size"`, `"Legacy Systems"` | metric labels | constant |
| 47-50 | `"$60M"`, `"81%"`, `"126"`, `"8 → 1"` | metric values | constant |
| 52 | `"EDGE HQ"`, `"NIMR"`, `"HALCON"`, `"SIGN4L"`, `"AL TARIQ"`, `"+20 more"` | tag list | constant |
| 55 | `"Etihad Airways"` | project 2 company | constant |
| 56 | `"$400M+ impact"` | badge | constant |
| 58 | `"SAP Centre of Excellence — 8 Years"` | project 2 title | constant |
| 59 | `"Built route profitability on SAP. Flight-level P&L across 100+ aircraft and 1,000+ weekly flights. $36M in direct benefits."` | project 2 desc | constant |
| 61-65 | metric labels/values | constant |
| 68 | `"Finance"`, `"SAP COE"`, `"Route P&L"`, `"8 years"` | tags | constant |
| 71 | `"TII"` | project 3 | constant |
| 72 | `"Greenfield"` | badge | constant |
| 74 | `"S/4HANA Greenfield — 5 Research Entities"` | title | constant |
| 75 | `"Dual-ledger Finance (cash + accrual, IPSAS). Cloud on Azure and AWS. Full lifecycle from blueprint through hypercare."` | desc | constant |
| 77-81 | metric labels (`"Entities"`, `"Architecture"`, `"Ledger"`, `"Reporting"`) and values (`"5"`, `"Greenfield"`, `"Dual"`, `"IPSAS"`) | constant |
| 84 | `"S/4HANA"`, `"Azure"`, `"AWS"`, `"Cash + Accrual"`, `"Hypercare"` | tags | constant |
| 87 | `"DXC Technology"` | project 4 | constant |
| 88 | `"$300M pipeline"` | badge | constant |
| 90 | `"Managing Partner — 800+ Consultants"` | title | constant |
| 91 | `"SAP, Oracle, Microsoft practices across MEA. PIF entities, banking, public sector."` | desc | constant |
| 93-97 | metric labels (`"Pipeline"`, `"Consultants"`, `"Practices"`, `"Region"`) and values | constant |
| 100 | `"SAP"`, `"Oracle"`, `"Microsoft"`, `"PIF"`, `"Banking"`, `"Public Sector"` | tags | constant |
| 103 | `"Govt. Enablement"` | project 5 | constant |
| 104 | `"84 entities"` | badge | constant |
| 106 | `"Digital Executive Advisor"` | title | constant |
| 107 | `"SAP and Oracle landscape strategy. Oracle EBS to Fusion Cloud migration. Enterprise Architecture (TOGAF)."` | desc | constant |
| 109-113 | metric labels (`"Entities"`, `"Migration"`, `"Framework"`, `"Role"`) | constant |
| 116 | `"Oracle EBS"`, `"Oracle Fusion"`, `"Enterprise Arch"`, `"Strategy"` | tags | constant |
| 120 | `"DISCOVER"`, `"PREPARE"`, `"EXPLORE"`, `"REALIZE"`, `"DEPLOY"` (ALL_PHASES) | phase pill labels | constant |
| 173 | `"[ 03 · Track record ]"` | eyebrow | inline |
| 176 | `"Programmes I've led. Not advised on. Led."` | h2 aria-label | inline |
| 181 | `"Programmes I've led."` | h2 first half | inline |
| 183 | `"Not advised on. Led."` | h2 italic tail | inline |
| 186 | `"Real companies. Real numbers. I was in the room running these."` | section intro | inline |
| 251 | `"LIVE"` | dashboard "live" badge | inline |
| 280 | `"Programme Phases"` | dashboard label | inline |

### src/components/HowIWork.tsx

STEPS constant inline at top (lines 22-62).

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 33-36 | Step 01 — `"Discovery call"`, `"30 minutes · free"`, `"Direct with me"`, full body paragraph, `"Output: clear yes or no on whether to scope a paid engagement."` | constant |
| 39-44 | Step 02 — `"Scoping engagement"`, `"1 to 2 weeks · day rate or fixed"`, `"Direct with me plus your nominated lead"`, full body, output | constant |
| 47-52 | Step 03 — `"Delivery engagement"`, `"3 to 12 months · fee structure varies"`, `"Direct involvement throughout"`, full body, output | constant |
| 55-60 | Step 04 — `"Hypercare or advisory retainer"`, `"Optional · monthly"`, `"Lighter touch, named contact"`, full body, output | constant |
| 72 | `"[ 04 · How I work ]"` | eyebrow | inline |
| 79-82 | `"Four steps."` / `"No opaque engagement model."` | h2 | inline |
| 85-86 | `"Each step has a clear output. You can stop after any of them. The first one is free."` | section intro | inline |

### src/components/WhatIBelieve.tsx

BELIEFS constant inline (lines 17-47).

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 24-25 | Belief 01 title + body (~70 words) | constant |
| 28-30 | Belief 02 title + body | constant |
| 33-35 | Belief 03 title + body | constant |
| 38-40 | Belief 04 title + body | constant |
| 43-45 | Belief 05 title + body | constant |
| 57 | `"[ 05 · What I believe ]"` | eyebrow | inline |
| 64-67 | `"Five positions."` / `"All defensible in print."` | h2 | inline |
| 70-72 | `"These are the opinions I will hold in a SteerCo. If one of them matches something you have already thought but could not say out loud, we should talk."` | section intro | inline |
| 106 | `"Book a 30-min call"` | CTA | inline |
| 109-110 | `"Direct with me. No SDR layer."` | CTA tagline | inline |

Note: A second BELIEFS array exists at
`src/components/article/beliefs/data.ts` for the about-page MDX
component — **same content, slightly different wording (`"shouldn't"`
vs `"should not"`, `"versus"` vs `"vs"`, etc.)** Two sources of truth.

### src/components/AICapabilities.tsx

FEATURES, STACK_TAGS, TERMINAL_LINES constants inline (lines 3-58).

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 5 | `"Agentic AI on SAP BTP"` | feature 1 title | constant |
| 6 | `"Autonomous AI agents that work inside your SAP landscape. Handle approvals, flag anomalies, route decisions. Not chatbots. Agents that take action."` | feature 1 body | constant |
| 15 | `"Predictive Analytics"` | feature 2 title | constant |
| 16 | `"Forecast demand, cash flow, maintenance schedules from your ERP data. Built on SAP Datasphere and Analytics Cloud. Real models, not dashboards."` | feature 2 body | constant |
| 24 | `"Intelligent Automation"` | feature 3 title | constant |
| 25 | `"Invoice matching, PO creation, journal entries. AI handles the repetitive work. Your team handles exceptions. 81% automation at EDGE Group."` | feature 3 body | constant |
| 33 | `"AI Governance & Risk"` | feature 4 title | constant |
| 34 | `"Policies, oversight frameworks, compliance processes. Deploy AI without the legal risk. Satisfy regulators and stakeholders."` | feature 4 body | constant |
| 44 | `"Anomaly detected:"` + `"PO-4891 exceeds budget threshold by 23%"` | terminal line | constant (JSX) |
| 45 | `"Agent action:"` + `"Routed to CFO for approval"` | terminal line | constant |
| 46 | `"Cash flow forecast:"` + `"Q3 shortfall predicted."` + `"Adjusting accruals."` | terminal line | constant |
| 47 | `"Invoice matching:"` + `"847 of 852 auto-matched"` | terminal line | constant |
| 48 | `"Maintenance prediction:"` + `"Asset MX-220 flagged."` + `"Schedule by Aug 15."` | terminal line | constant |
| 52-57 | STACK_TAGS labels — `"SAP Business AI"`, `"Joule"`, `"SAP BTP"`, `"Datasphere"`, `"Analytics Cloud"`, `"Custom Agents"` | constant |
| 75 | `"[ 02 · AI capabilities ]"` | eyebrow | inline |
| 78 | `"AI on top of your ERP. Not buzzwords. Real systems."` | h2 aria-label | inline |
| 83 | `"AI on top of your ERP."` | h2 first half | inline |
| 85-86 | `"Not buzzwords. Real systems."` | h2 italic | inline |
| 90-92 | `"I build practical AI that works with your SAP data. Agentic AI, predictive models, intelligent automation. Things that actually move the needle."` | section intro | inline |
| 124 | `"agent.erp — agentic pipeline"` | terminal label | inline |
| 128 | `"LIVE"` | terminal badge | inline |
| 134 | `"AI Stack"` | terminal subsection label | inline |

### src/components/Tools.tsx

TOOLS constant inline (lines 10-42).

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 18 | `"Command Central"` | tool 1 name | constant |
| 19 | `"Implementation"` | tool 1 type badge | constant |
| 20 | `"Track your ERP implementation in one place."` | tool 1 title | constant |
| 21 | `"Progress, risks, milestones, team performance. Built because every project I walked into had tracking spread across 15 different spreadsheets. Real-time dashboards. Not another status deck."` | tool 1 body | constant |
| 22 | `"Explore Command Central →"` | tool 1 CTA | constant |
| 35 | `"ERPCV"` | tool 2 name | constant |
| 36 | `"Career"` | tool 2 type | constant |
| 37 | `"Stop losing interviews you should be winning."` | tool 2 title | constant |
| 38 | `"6-document career pack. Executive CV, project portfolio, cover letter, interview prep, LinkedIn messages, reference sheet. 1,200+ packs delivered. 89% more interviews. $19.99 one-time."` | tool 2 body | constant |
| 39 | `"Try ERPCV free →"` | tool 2 CTA | constant |
| 53 | `"[ 06 · Built by me ]"` | eyebrow | inline |
| 56 | `"Tools I build for the ERP world."` | h2 aria-label | inline |
| 61-62 | `"Tools I build"` / `"for the ERP world."` | h2 | inline |
| 66-67 | `"Advice is half the job. The other half is building the tools the work actually needs. Used by consultants and companies across 130+ regions."` | section intro | inline |

### src/components/Testimonials.tsx

TESTIMONIALS constant inline (lines 10-32) — verbatim attributed quotes
from real people. These should NOT be translated (testimonials are
quotes of what people actually said in English). However the role lines
("Ex-CIO, Etihad Aviation Group" etc.) are descriptive and may need
locale variants.

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 12-14 | Mike Papamichael quote | constant (DO NOT translate verbatim text) |
| 15 | `"Mike Papamichael"` | name (proper noun) | constant |
| 16 | `"Ex-CIO, Etihad Aviation Group"` | role | constant |
| 19-23 | Andrew MacFarlane quote + name + `"Ex-CIO, Etihad / Managing Partner, Cumbrae"` | constant |
| 26-30 | Takhliq Hanif quote + name + `"Head of Architecture, Volkswagen Financial Services"` | constant |
| 42 | `"[ 09 · From people I've worked with ]"` | eyebrow | inline |
| 45 | `"Don't take my word for it. Read theirs."` | h2 aria-label | inline |
| 50-51 | `"Don't take my word for it."` / `"Read theirs."` | h2 | inline |
| 62 | `"★★★★★"` | star row (Unicode, locale-agnostic) | inline |

### src/components/Credentials.tsx

CREDS and PRESS constants inline (lines 18-65).

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 21 | `"CIMA & AICPA"` | cred 1 label | constant |
| 22 | `"Management accounting"` | cred 1 sub | constant |
| 30 | `"Masters in Accounting"` | cred 2 label | constant |
| 31 | `"Finance depth, not surface"` | cred 2 sub | constant |
| 40 | `"SAP Certified PM"` | cred 3 label | constant |
| 41 | `"Activate · SAFe · ITIL"` | cred 3 sub | constant |
| 49 | `"Solution Architect"` | cred 4 label | constant |
| 50 | `"Architecture across the stack"` | cred 4 sub | constant |
| 60-64 | press names `"SAP Press"`, `"MSN"`, `"LinkedIn"`, `"IPS"`, `"Techbullion"` (used as logo alt text) | constant |
| 75 | `"[ 08 · Why this works ]"` | eyebrow | inline |
| 78 | `"Senior on the system. Senior on the close."` | h2 aria-label | inline |
| 83-85 | `"Senior on the system."` / `"Senior on the close."` | h2 | inline |
| 87-89 | `"Most SAP consultants understand the system. Few understand the business. I have both."` | section intro | inline |
| 125 | `"Featured on"` | press strip label | inline |
| 145 | `"Also published in:"` | press strip secondary label | inline |
| 147 | `"The Next Disruption"` | publication name | inline |

### src/components/YouTubeSection.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 16 | `"[ 07 · Watch & learn ]"` | eyebrow | inline |
| 19 | `"Videos from the field. Not theory. Real projects."` | h2 aria-label | inline |
| 24-25 | `"Videos from the field."` / `"Not theory. Real projects."` | h2 | inline |
| 29-30 | `"I share what I've learned from 25 years of ERP and AI implementations. The stuff nobody tells you."` | intro | inline |
| 46 | `"Subscribe on YouTube"` | CTA | inline |

### src/components/CTABanner.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 29 | `"READY WHEN YOU ARE"` | eyebrow | inline |
| 35 | `"Your next programme starts with a conversation."` | h2 | inline |
| 38-39 | `"30 minutes. No sales pitch. Tell me what's going on with your ERP or AI programme. I'll tell you straight if I can help."` | body | inline |
| 48 | `"Book a 30-min call ↗"` | primary CTA (with arrow) | inline |
| 54 | `"Email me directly"` | secondary CTA | inline |

### src/components/FAQ.tsx

FAQS constant inline (lines 15-44).

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 17 | `"What does an engagement actually look like?"` | Q1 | constant |
| 18 | A1 (full paragraph) | constant |
| 21 | `"Are you available right now?"` | Q2 | constant |
| 22 | A2 | constant |
| 25 | `"How do you charge?"` | Q3 | constant |
| 26 | A3 | constant |
| 29 | `"Do you replace my SI partner or work alongside them?"` | Q4 | constant |
| 30 | A4 | constant |
| 33 | `"Will you sign an NDA?"` | Q5 | constant |
| 34 | A5 | constant |
| 37 | `"How is this different from McKinsey, BCG, or the Big 4?"` | Q6 | constant |
| 38 | A6 | constant |
| 41 | `"Why personal brand and not a firm?"` | Q7 | constant |
| 42 | A7 | constant |
| 55 | `"[ Frequently asked questions ]"` | eyebrow | inline |
| 62 | `"What CFOs ask me first."` | h2 | inline |

### src/components/BookCallButton.tsx

No hardcoded user-facing strings (children passed in, Calendly config
has hex colors). Skipped.

### src/components/CategoryPage.tsx

CATEGORY_TAGLINES and ALL_CATEGORIES constants inline (lines 33-51).

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 34 | `"From the field, not the slides."` | tagline (erp-consulting-guide) | constant |
| 35 | `"Deep technical. Real projects."` | tagline (sap-modules) | constant |
| 36 | `"Real numbers. Not estimates."` | tagline (erp-strategy) | constant |
| 37 | `"Grounded. Not hype."` | tagline (ai-governance) | constant |
| 38 | `"What works now."` | tagline (agentic-ai) | constant |
| 39 | `"Named clients. Real outcomes."` | tagline (sap-case-studies) | constant |
| 45-50 | ALL_CATEGORIES — `"ERP Consulting Guide"`, `"SAP Modules"`, `"ERP Strategy & Cost"`, `"AI Governance"`, `"Agentic AI"`, `"SAP Case Studies"` | constant (duplicates Nav PILLARS, Footer solutions, lib/content CATEGORIES) |
| 119 | `Read article` (from PostCard inline) | card CTA | inline |
| 125 | `Read article` | post card affordance text | inline (JSX) |
| 119 | `{mins} min read` | reading time stamp | inline (uses English "min read") |
| 154 | `{mins} min read` | StartHereRow reading time | inline |
| 221 | `"Practical. Not theoretical."` | default heroTagline | inline |
| 254 | `"Home"` | breadcrumb | inline |
| 273 | `"Category"` | breadcrumb tail label | inline |
| 295-297 | Feature badges — `"Senior advisory"`, `"25 years field experience"`, `${posts.length} articles` | inline (`articles` is English) |
| 330 | `"Start here"` | sidebar eyebrow | inline |
| 345 | `View all {posts.length} articles` | sidebar link | inline (English "View all"/"articles") |
| 367 | `"[ Browse by topic ]"` | section eyebrow | inline |
| 371 | `"Find what matters to you. Pick your topic."` | h2 aria-label | inline |
| 376-377 | `"Find what matters to you."` / `"Pick your topic."` | h2 | inline |
| 380-381 | `"Every article is tagged by subject. Start where your problem is."` | section intro | inline |
| 418 | `{count} {count === 1 ? "article" : "articles"}` | per-tag count | inline (English plural rules) |
| 444 | `"[ Featured insights ]"` | section eyebrow | inline |
| 448 | `"Reads worth your time. Start with these."` | h2 aria-label | inline |
| 453-454 | `"Reads worth your time."` / `"Start with these."` | h2 | inline |
| 457-458 | `"The guides I wish existed when I started. Drawn from 25 years of ERP delivery."` | section intro | inline |
| 491 | `"[ Latest articles ]"` | section eyebrow | inline |
| 494 | `"The full archive. Field notes, not theory."` | h2 aria-label | inline |
| 499-500 | `"The full archive."` / `"Field notes, not theory."` | h2 | inline |
| 503-504 | `"Every article in this category. Written from delivery experience, not vendor decks."` | section intro | inline |
| 556 | `"Noel D'Costa"` | About strip name (proper noun) | inline |
| 559-561 | About strip bio | inline |
| 567-569 | `"Board-level perspective"`, `"Independent advice"`, `"Enterprise delivery experience"` | credentials | inline |
| 587 | `"Full bio →"` | About strip link | inline |
| 162-181 | breadcrumbs array: `"Home"`, `meta.label` | inline |

### src/components/TagPage.tsx

Heavy overlap with CategoryPage chrome.

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 99 | `Read article` | card CTA | inline |
| 93 | `{mins} min read` | card reading time | inline |
| 121-123 | breadcrumb labels `"Home"`, `info.label` | inline |
| 178 | `"Home"` | hero breadcrumb | inline |
| 183 | `"Tag"` | hero breadcrumb segment | inline |
| 207-208 | `"Tag"` (kicker) | inline |
| 240-241 | `{posts.length} {posts.length === 1 ? "article" : "articles"}` | hero badge | inline |
| 252 | `"25 years field experience"` | hero badge | inline |
| 273 | `"[ No articles yet ]"` | empty-state eyebrow | inline |
| 280-281 | `Nothing tagged {info.label} yet.` | empty-state h2 | inline |
| 283-285 | empty-state body | inline |
| 322 | `"[ Featured insights ]"` | inline (duplicate of CategoryPage) |
| 329-332 | `"Reads worth your time. Start with these."` | inline (duplicate) |
| 334-335 | `"The pieces in this tag I send to clients most often."` | inline |
| 366 | `"[ More on this tag ]"` | inline |
| 373-376 | `"The full archive. Field notes, not theory."` | inline (duplicate) |
| 378-379 | `Every article tagged {info.label}.` | inline |
| 409 | `"[ Other tags ]"` | inline |
| 416 | `"Pick another angle."` | inline |
| 475 | `"Noel D'Costa"` | inline (proper noun) |
| 478-481 | About strip bio | inline |
| 489 | `"Full bio →"` | inline |

### src/components/PostPage.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 85-92 | breadcrumb labels `"Home"`, category label (from constant), `fm.title` | inline |
| 113 | `"Home"` | breadcrumb visible link | inline |
| 166 | `"Noel D'Costa"` | author fallback (proper noun) | inline (in JSX call) |
| 190 | `"Contents"` | mobile ToC disclosure summary | inline |
| 254 | `"Command Centre"` | ProductPromoCard prop | inline |
| 253 | `"Built by Noel"` | ProductPromoCard kicker | inline |
| 253 | `"Executive visibility, risk posture, and decision governance for ERP and SAP programmes. See where delivery is actually bleeding — before it hits the steering committee."` | ProductPromoCard description | inline |
| 255 | `"Try Command Centre free"` | ProductPromoCard CTA | inline |
| 279 | `"Tool · Free to start"` | ProductPromoCard kicker | inline |
| 280 | `"Build a professional ERP CV in minutes"` | ProductPromoCard title | inline |
| 281 | ERPCV description (~50 words) | inline |
| 283 | `"Generate your ERP CV"` | CTA | inline |
| 293 | `"Continue reading"` | RelatedArticles label | inline |

### src/components/MdxPageLayout.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 38, 60 | `"Home"` | breadcrumb | inline |

### src/components/article/ArticleHero.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 17 | `"Noel D'Costa"` | DISPLAY_AUTHOR constant (proper noun) | constant |
| 42 | `"en-US"` (locale arg to `.toLocaleDateString`) | date label — **hardcoded English locale** | inline arg |
| 51 | `"en-US"` (locale arg) | reviewed label — **hardcoded English locale** | inline arg |
| 111 | `"Updated "` | date prefix | inline |
| 117 | `"min read"` | reading time | inline |
| 123 | `"Reviewed "` | reviewed prefix | inline |

### src/components/article/KeyTakeaways.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 11 | `"Key takeaways"` | default title prop (overridable) | inline default |

### src/components/article/AuthorBox.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 16 | `"Running an ERP programme right now?"` | default ctaTitle | inline default |
| 17 | `"If this article touched on a programme you are live in right now, a 30-minute conversation usually gets further than another week of internal analysis."` | default ctaBody | inline default |
| 36 | `"Noel D'Costa"` (image alt) | inline (proper noun) |
| 44 | `"Written by"` | eyebrow | inline |
| 48 | `"Noel D'Costa"` (visible name) | inline |
| 53-58 | bio paragraph (~50 words) | inline |
| 64 | `"About Noel"` | secondary link | inline |
| 75 | `"LinkedIn"` | secondary link | inline |
| 84 | `"YouTube"` | secondary link | inline |
| 107 | `"Book a 30-min call"` | primary CTA | inline |
| 115 | `"See case studies"` | secondary CTA | inline |

### src/components/article/CTASection.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 10 | `"Working on something similar?"` | default title | inline default |
| 11 | `"If this article touched on a programme you are live in right now, a 30-minute conversation usually gets further than another week of internal analysis."` | default body | inline default |
| 12 | `"Talk about your project"` | default primaryCta | inline default |
| 13 | `"See how I help"` | default secondaryCta | inline default |
| 41 | `"Noel D'Costa"` | image alt (proper noun) | inline |
| 49 | `"Next step"` | eyebrow | inline |

### src/components/article/RelatedArticles.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 74 | `"Related reading"` | default label prop | inline default |
| 99 | `"More from the archive"` | section h2 | inline |
| 106 | `"Browse all"` | link to home | inline |

### src/components/article/TableOfContents.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 114 | `"Table of contents"` | nav aria-label | inline |
| 119-121 | `"Table of"` / `"contents"` (split with italic emphasis) | visible heading | inline |

### src/components/article/PullQuote.tsx

No fixed strings (children + attribution come from prop). Skipped.

### src/components/article/ProductPromoCard.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 28 | `"Learn more"` | default cta prop | inline default |

(All other ProductPromoCard strings come from props; their callers'
strings — e.g. `"Command Centre"`, `"Built by Noel"` — are covered
under PostPage.tsx / CaseStudyArticlePage.tsx above.)

### src/components/article/contact/ContactHero.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 24 | `"Get in touch"` | eyebrow | inline |
| 28 | `"30 minutes. No sales pitch."` | h2 aria-label | inline |
| 33-35 | `"30 minutes."` / `"No sales pitch."` | h2 | inline |
| 38-39 | `"Pick a slot on my calendar. Tell me what's going on with your ERP or AI programme. I'll tell you straight if I can help."` | body | inline |

### src/components/article/contact/CalendlyEmbed.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 95 | `"Loading scheduler…"` | loading state | inline |
| 103 | `"Book on Calendly →"` | fallback CTA | inline |

### src/components/article/contact/ContactBlock.tsx

ITEMS constant inline (lines 25-65). Labels (display text under each
icon).

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 28 | `"Phone UAE"` | label | constant |
| 34 | `"Phone US"` | label | constant |
| 40 | `"Email"` | label | constant |
| 46 | `"Website"` | label | constant |
| 52 | `"LinkedIn"` | label | constant |
| 59 | `"YouTube"` | label | constant |

(Display values are phone numbers, email, URLs — should not translate.)

### src/components/article/beliefs/data.ts + BeliefsGrid.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| data.ts 19-46 | 5 beliefs — title + body each, similar to but textually different from `WhatIBelieve.tsx` | constant |
| BeliefsGrid 30 | `"I believe"` | per-card eyebrow | inline |

### src/components/article/programmes/data.ts + ProgrammesList.tsx

Six programmes — each with mono sectorRegion, badge, badge type, title,
body[]. All declared in `data.ts` lines 19-76. Used by the
`/sap-erp-consultant-my-story-noel-dcosta` page via `<programmes-list />`
MDX tag.

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| data.ts 20 | `"SUPPLY CHAIN · DUBAI"` (sectorRegion) | constant |
| data.ts 21 | `"RECOVERY"` (badge) | constant |
| data.ts 23 | `"The 2am call from Dubai"` (title) | constant |
| data.ts 25-27 | body paragraphs (~110 words) | constant |
| ... (5 more programmes follow same pattern) | constant |

### src/components/article/capabilities/data.tsx + CapabilitiesRow.tsx

Three capabilities. Lines 36-77 of data.tsx.

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 38 | `"Programme recovery"` | title | constant |
| 39-40 | body | constant |
| 51 | `"ECC to S/4HANA and cloud ERP"` | title | constant |
| 52-53 | body | constant |
| 65 | `"AI on ERP data"` | title | constant |
| 66-67 | body | constant |

### src/components/article/credibility/CredibilityBand.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 22-25 | 4 stats — `"$700M+"` / `"delivered in transformations"`, `"25 yrs"` / `"across ERP and AI programmes"`, `"3"` / `"credentials: CIMA · AICPA · MAcc"`, `"6"` / `"named clients: EDGE · Etihad · ADNOC · PIF · DXC · UAE Gov"` | constant |

### src/components/article/safeguard/SafeguardBand.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 41 | `"My commitment"` | eyebrow | inline |
| 47-48 | `"I safeguard your investment from the predictable mistakes that turn ERP programmes into business disasters."` | quote (in `<>` quotes) | inline |

### src/components/article/testimonials/data.ts + TestimonialsGrid.tsx

9 testimonials. data.ts lines 23-107. Like the homepage Testimonials,
the quoted text should NOT be machine-translated. The role lines (job
titles, organisations) are mixed proper-noun + descriptive — partial
translation candidate.

### src/components/article/hero/AboutHero.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 25 | `"Book a 30-min call"` | primary CTA | inline |
| 34 | `"Email me directly"` | secondary CTA | inline |
| 47 | `"Portrait of Noel D'Costa"` | image alt | inline |

### src/components/article/featured/FeaturedOn.tsx

PUBLICATIONS constant inline (lines 17-43). All values are publication
names (proper nouns) and image URLs — no body copy.

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 56 | `${pub.name} logo` | image alt | inline |
| 69 | `${pub.name} — view profile` | link aria-label | inline |

### src/components/case-studies/CaseStudyArticlePage.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 75-77 | breadcrumbs — `"Home"`, `"Case Studies"`, `fm.title` | inline |
| 114 | `"Contents"` | mobile ToC summary | inline |
| 175-180 | ProductPromoCard props — `"Built by Noel"`, `"Command Centre"`, description, `"Try Command Centre free"` | inline (duplicate of PostPage) |

### src/components/case-studies/CaseStudyArticleHero.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 133 | `"← All case studies"` | breadcrumb back link | inline |
| 145 | `"Client"`, `"Industry"`, `"Region"`, `"Duration"`, `"My role"` | meta-strip labels (`<MetaItem>` calls) | inline |

### src/components/case-studies/CaseStudyHero.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 87 | `"[ Featured case study ]"` | eyebrow | inline |
| 173 | `"Read the full case study"` | CTA | inline |

### src/components/case-studies/CaseStudyCard.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 183 | `"Read the case"` | affordance text | inline |

### src/components/case-studies/CaseStudyPortfolioPage.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 47-49 | `"44%"` / `"custom code, cleaned"`, `"1,200+"` / `"outlets migrated"`, `"7"` / `"countries in scope"` | hero stats | inline |
| 78 | `"[ Hand-picked ]"` | section eyebrow | inline |
| 81 | `"Programmes that show the range. Different industries, same playbook."` | h2 aria-label | inline |
| 86-87 | `"Programmes that show the range."` / `"Different industries, same playbook."` | h2 | inline |
| 107 | `"[ The archive ]"` | section eyebrow | inline |
| 110 | `"Everything else. Filter to your situation."` | h2 aria-label | inline |
| 115-117 | `"Everything else."` / `"Filter to your situation."` | h2 | inline |

### src/components/case-studies/CaseStudyMethodology.tsx

CELLS constant inline (lines 16-35).

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 19 | `"Named where I can."` | rule title | constant |
| 20-22 | body | constant |
| 25 | `"Anonymous where I must."` | rule title | constant |
| 26-28 | body | constant |
| 31 | `"Real numbers, no padding."` | rule title | constant |
| 32-34 | body | constant |
| 42 | `"[ How I write these ]"` | section eyebrow | inline |
| 45 | `"Full numbers. Anonymous where it matters."` | h2 aria-label | inline |
| 50-52 | h2 | inline |
| 54-56 | section intro | inline |
| 76 | `"Rule"` | per-cell eyebrow | inline |

### src/components/case-studies/RelatedCaseStudies.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 45 | `"[ Other programmes ]"` | section eyebrow | inline |
| 49 | `"Different industries. Same playbook."` | h2 aria-label | inline |
| 53-55 | h2 | inline |

### src/components/case-studies/FilterChips.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 46-49 | SORTS array — `"Recent"`, `"Industry"`, `"Region"` | constant |
| 229 | `"Close filters"` | scrim aria-label | inline |
| 237 | `"Filters"` | mobile sheet heading | inline |
| 242 | `"Close filters"` | close button aria-label | inline |
| 249 | `"Industry"` | mobile section title | inline |
| 260 | `"Service"` | mobile section title | inline |
| 271 | `"Region"` | mobile section title | inline |
| 291 | `"Clear all"` | mobile button | inline |
| 297 | `"Show results"` | mobile button | inline |
| 364 | `"All"` | desktop chip button | inline |
| 367 | `"Industry"` | desktop chip label | inline |
| 372 | `"Service"` | desktop chip label | inline |
| 378 | `"Region"` | desktop chip label | inline |
| 392 | `"Filters"` | mobile filters button | inline |
| 403 | `"Sort"` | sort label | inline |
| 408 | `"Sort case studies"` | select aria-label | inline |
| 443 | `"Clear all"` | clear button | inline |
| 467 | `Remove ${label} filter` | pill remove aria-label | inline |

### src/components/case-studies/NumberTicker.tsx

No hardcoded UI strings (numeric formatter). However the formatter
uses `parseFloat()` on values that may contain `,` thousands — locale
support not present.

### src/components/tagMeta.ts

5 TAG_META entries (lines 17-50) — each has `label`, `description`. These
are translation candidates (descriptive English strings, used as topic
card titles/descriptions in `CategoryPage.tsx`).

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 19 | `"Planning & Selection"` | tag label | constant |
| 20 | `"Vendor shortlisting, readiness, and programme setup."` | tag description | constant |
| 24 | `"Strategy"` | tag label | constant |
| 25 | `"Delivery frameworks, governance, and go-live planning."` | tag description | constant |
| 29 | `"Technical"` | tag label | constant |
| 30 | `"Architecture, integration, and technical risk decisions."` | tag description | constant |
| 34, 40 | `"Modernization & Industry"` | tag label (used twice) | constant |
| 35-36, 41-42 | tag description | constant |
| 46 | `"Crisis & Recovery"` | tag label | constant |
| 47 | `"Programme recovery, risk mitigation, and escalation."` | tag description | constant |

### src/lib/case-studies.ts

INDUSTRY_LABEL / SERVICE_LABEL / REGION_LABEL maps (lines 31-54). These
feed FilterChips, CaseStudyCard, CaseStudyArticleHero meta strips.

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 32 | `"Aviation"`, `"Defence"`, `"Government / Public Sector"`, `"FMCG / Retail"`, `"Manufacturing"`, `"Finance / Banking"` | INDUSTRY_LABEL | constant in shared lib |
| 41 | `"ECC to S/4HANA Migration"`, `"AI on SAP"`, `"Programme Recovery"`, `"ERP Selection"`, `"Contract Review"`, `"Solution Architecture"` | SERVICE_LABEL | constant in shared lib |
| 50 | `"GCC"`, `"UK"`, `"Europe"`, `"South Asia"` | REGION_LABEL | constant in shared lib |
| 90+ | 8 case studies, each with `client.label`, `duration`, `role`, `cover.alt`, `headline.primary`, `headline.italic`, `headlineStat.value`, `headlineStat.label`, `outcome` | constant — substantial body of marketing copy |

### src/lib/content.ts (CATEGORIES)

The CATEGORIES map (not read in full but referenced everywhere) declares
the 6 content pillars' labels and descriptions. Cross-checked usage in
CategoryPage, MdxPageLayout, sitemap. **Single source of truth for
category labels**, except Nav.tsx PILLARS and Footer.tsx solutions
already duplicate the labels in their own arrays — three locations to
update if a category label changes.

### src/components/StickyCTA.tsx

(Already covered above — single string "Book consultation".)

### src/components/article/ReadingProgress.tsx

(Not read; assumed to render a progress bar only, no text. If wrong it
gets re-audited in the implementation pass.)

### src/components/Hero.tsx headshot alt, About strip name, etc.

`"Noel D'Costa"` appears as proper-noun image alt across at least Hero,
ArticleHero, AuthorBox, CTASection, CategoryPage, TagPage, AboutHero.
Proper noun — should NOT be translated, but the surrounding label may
need locale variants ("Portrait of Noel D'Costa" → "Retrato de Noel
D'Costa" in Spanish, for instance).

### Tool clients — high-volume string buckets

These four files carry the bulk of the remaining inline strings (form
labels, option labels, placeholders, help text). Per-line enumeration
would balloon this audit; sampling and counts only:

- `src/app/(site)/erp-implementation-cost-calculator/ErpCostClient.tsx`
  — **~160 user-facing strings**. Step labels (`"Company"`, `"Scope"`,
  `"Countries"`, `"Delivery"`, `"Financials"`); ~30 select options
  (revenue bands, industries, ERP maturity, implementation type,
  approach, deployment, customization, complexity, SI tier, delivery,
  change-mgmt, training, etc.); section titles; field labels with
  `<Label>`, `<Hint>` paragraphs; CFO/CIO view-toggle text; result
  display labels (`"Internal team rate"`, etc.); print/export labels
  (`"ERP Programme Estimate — ${date}"`, `"Not a vendor quote.
  Generated: ${ts}"`). All inline.
- `src/app/(site)/sap-implementation-cost-calculator/SapCostClient.tsx`
  — **~40 strings**. FIELDS array with select options (sector,
  company size, SAP edition, region multiselect, Fiori scope, etc.),
  placeholders, the `"Estimate my SAP cost"` submit label, the
  `"Enter your SAP programme details"` section heading.
- `src/app/(site)/free-data-migration-estimator-sap-oracle-microsoft/MigrationClient.tsx`
  — **~35 strings**. Similar shape.
- `src/app/(site)/sap-job-description-generator/JdClient.tsx`
  — **~50 strings**. Role family, seniority, sector, region, work
  arrangement selects + placeholders; `"Generate job description"`
  submit; `"Describe the role"` heading.
- `src/app/(site)/sap-solution-builder/SolutionClient.tsx` — ~80 form/UI
  strings (not enumerated; similar pattern).

### src/components/tools/ToolForm.tsx (shared form widget)

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 98 | `"Generate"` | default `submitLabel` | inline |
| 209 | `"No response stream"` | error | inline |
| 251 | `"Network error"` | error fallback | inline |
| 191-194 | `"Please select an option"`, `"This field is required"` | error rewrite | inline |
| 337 | `"Select…"` | placeholder option | inline |
| 381 | `"Separate multiple values with commas."` | tags helper | inline |
| 394 | `"Yes"` | boolean checkbox label | inline |
| 415 | `"Generating…"` | submit-in-flight label | inline |

### src/components/tools/ToolOutput.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 31 | `"Generating…"` | streaming state | inline |
| 34 | `"Result"` | result header | inline |
| 42 | `"Copy as markdown"` | copy button | inline |
| 49 | `"Start over"` | reset button | inline |

### src/components/tools/ToolShell.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 49 | `"Home"`, `"Tools"`, `label` | breadcrumb labels | inline (label is prop) |
| 83 | `"Home"` | breadcrumb visible | inline |
| 87 | `"Tools"` | breadcrumb middle | inline |
| 98 | `"[ Free Tool ]"` | hero eyebrow | inline |

### src/components/tools/ModulePicker.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 113 | `{value.length} selected` | counter (English "selected") | inline |
| 124 | `"Search modules (e.g. Treasury, Payroll, EWM, Group Reporting)…"` | search placeholder | inline |
| 132 | `"Add the core Finance modules most ERPs start with"` | button title attribute | inline |
| 135 | `"+ Add core finance"` | button label | inline |
| 143 | `"Clear"` | clear button | inline |
| 208 | `Deselect all ${cat.label} modules` / `Select all ${cat.label} modules` | bulk aria-label | inline |
| 212-215 | `All ${catTotal} ${cat.label.toLowerCase()} modules selected · click to clear` etc. | tooltip | inline |

### src/lib/sap-modules.ts (referenced but not read in full)

Per ModulePicker behaviour, this lib carries 70+ module labels +
categories (Finance, Procurement, Supply Chain, Sales/CX, HCM, Projects,
Analytics, Platform, Industry) + module descriptions. Roughly **~250
strings** in this single data file — most are SAP module names (proper
nouns / acronyms, low translation pressure) but the category labels and
descriptions are descriptive English.

### src/lib/erp-calculator/* (countries.ts, scenarios.ts, types.ts)

Not read in full. Calc-engine.ts uses `new Intl.NumberFormat("en-US",
…)` to format currency — hardcoded `en-US`. COUNTRIES and SCENARIOS
contain English labels.

### src/lib/solution-builder/engine.ts

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 307 | `` `$${amount.toLocaleString()}` `` | currency formatter — no locale arg, no currency code | inline |

### src/lib/tools/registry.ts

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 94 | `` `Approximate master data records: ${i.approximateMasterDataRecords.toLocaleString()}` `` | LLM input label — server-side | inline |
| 95 | `` `Approximate transactional records: ${…}` `` | same | inline |

(These two are server-side prompt strings sent to the LLM. Not strictly
UI but they describe user-facing labels that may inform the LLM's
output — probably stay English for prompt stability.)

### src/components/books/* (books page suite)

#### BookCard.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 84 | `"Paid"` / `"Free"` (`isPaid ? "Paid" : "Free"`) | badge | inline |
| 117 | `"Get the book"` | CTA button | inline |
| 41-46 | Accordion items (constructed in same file) — questions: `"Who is this for?"`, `"What will you get from this book?"`, `"How do I access this?"` | inline |

#### LeadCaptureModal.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 109 | `"Please enter your name."` | validation error | inline |
| 115 | `"Please enter a valid email address."` | validation error | inline |
| 119 | `"Please tick the data-processing consent to continue."` | validation error | inline |
| 124 | `"Please accept the Terms of Use to continue."` | validation error | inline |
| 160 | `"Something went wrong. Please try again."` | network error fallback | inline |
| 170-172 | `"We have your details and will email the download link after payment."` | paid success message | inline |
| 181 | `"Network error. Please try again."` | network error | inline |
| 214 | `"Close"` | close button aria-label | inline |
| 224-226 | `"Sent. Check your inbox."` | free success heading | inline |
| 227-230 | `The download link for {context.bookTitle} is on its way.` | free success body | inline |
| 237-238 | `"Download now"` | download CTA | inline |
| 246-249 | `"We have your details."` | paid success heading | inline |
| 258 | `"Requesting"` | form eyebrow | inline |
| 274 | `"Name"` | label | inline |
| 283 | `"Your name"` | placeholder | inline |
| 290 | `"Email"` | label | inline |
| 298 | `"you@company.com"` | placeholder | inline |
| 314-318 | data-processing consent paragraph + `"Privacy Policy"` link | inline |
| 332-336 | terms acceptance paragraph + `"Terms of Use"` link | inline |
| 347-350 | marketing opt-in paragraph | inline |
| 360-363 | `"Sending…"`, `"Continue to checkout"`, `"Send me the book"` | submit button (3 states) | inline |
| 267-269 | `${context.price.toFixed(2)} ebook` — currency formatter no locale | inline |

#### BookAccordion.tsx

No fixed strings (items come from props). Skipped.

#### BookThumbnail.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 40 | `Cover of ${book.title}` | aria-label | inline |
| 62 | `Cover of ${book.title}` | image alt | inline |
| 77 | `"Noel D'Costa"` | placeholder cover text | inline |

#### BookSection.tsx

(`eyebrow`, `heading`, `intro` come from page-level props at
`src/app/(site)/books/page.tsx` — covered in next section. Plus:)

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 104 | `${heading} list` | ul aria-label | inline |

### src/app/(site)/books/page.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 35-37 | metadata title `"Books by Noel D'Costa | SAP, ERP and Enterprise AI"`, description | inline |
| 66-70 | ACCORDION_QUESTIONS — `"Who is this for?"`, `"What will you get from this book?"`, `"How do I access this?"` | constant (duplicate of BookCard) |
| 167 | `"Writing and commentary featured in"` | section eyebrow | inline |
| 191 | `"[ 02 · Free books ]"` | BookSection eyebrow | inline (passed as prop) |
| 192 | `"Free reading. Sent by email."` | BookSection heading | inline |
| 193 | `"Three field guides from active SAP and AI work. Drop an email, the PDF arrives."` | BookSection intro | inline |
| 201 | `"[ 03 · Paid books ]"` | inline |
| 202 | `"The deep one. Paid."` | inline |
| 203 | `"Practical execution, not theory. $12.99 ebook, ships the day you buy."` | inline |

### src/app/(site)/privacy/page.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 16-18 | metadata title/description | inline |
| 48 | `"[ Site · Privacy ]"` | eyebrow | inline |
| 54 | `"Privacy"` | h1 | inline |
| 59-62 | intro paragraph | inline |
| 64 | `"What I collect"` | h2 | inline |
| 67-72 | What-I-collect paragraph | inline |
| 74 | `"Why I collect it"` | h2 | inline |
| 77-85 | Why paragraph (includes GDPR reference) | inline |
| 87 | `"How long it stays"` | h2 | inline |
| 90-95 | How-long paragraph | inline |
| 97 | `"Your rights"` | h2 | inline |
| 100-111 | Rights paragraph | inline |
| 114 | `"Cookies and analytics"` | h2 | inline |
| 117-122 | Cookies paragraph | inline |
| 125 | `"See also:"` + `"Terms of use"` + `"Updated: {UPDATED}"` | footer line | inline |

### src/app/(site)/terms/page.tsx

(Same shape as privacy — ~12 distinct strings: H1 `"Terms of use"`,
intro, 5 H2 section titles, 5 body paragraphs, footer "See also" line.
All inline.)

### src/app/(site)/about/page.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 29-31 | breadcrumbs `"Home"`, `"About"` | inline |
| 44 | `"Home"` | breadcrumb visible | inline |
| 49 | `"About"` | breadcrumb tail | inline |

### src/app/(site)/intl/[lang]/page.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 35 | `"Noel D'Costa | ERP, AI & S/4HANA Advisor"` (TITLE) | metadata — **same English title rendered to ALL 11 locales** |
| 36-37 | DESCRIPTION (same as English) | metadata — **English description on every locale page** |

### src/app/(site)/page.tsx (English homepage)

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 26-28 | TITLE / DESCRIPTION metadata | inline |

### src/app/(site)/layout.tsx

| Line | String | Usage | Inline or constant? |
|------|--------|-------|---------------------|
| 36-37 | metadata default title `"Noel D'Costa | ERP, Data & AI"`, description, OG, Twitter | inline |
| 78 | `lang="en"` hardcoded on `<html>` element — **structural i18n bug** (should be per-served-locale) | inline |
| 79 | `dir="ltr"` hardcoded — **must be `"rtl"` when locale is `ar`** | inline |

## Date/number formatting findings

| Location | What it formats | Locale-aware? |
|----------|------------------|----------------|
| `src/components/article/ArticleHero.tsx` line 42 | Article published date | Hardcoded `"en-US"` — passes locale arg, but always English |
| `src/components/article/ArticleHero.tsx` line 51 | Last-reviewed date | Hardcoded `"en-US"` |
| `src/components/admin/BookLeadsTable.tsx` line 250 | Lead timestamp | `.toLocaleString()` no arg — uses server/runtime locale (admin only, low priority) |
| `src/lib/erp-calculator/calc-engine.ts` line 704 | Currency display in calculator | `new Intl.NumberFormat("en-US", …)` — hardcoded English currency formatting |
| `src/lib/erp-calculator/calc-engine.ts` line 687 | Generated-at timestamp | `.toISOString()` — locale-agnostic (machine readable) |
| `src/lib/solution-builder/engine.ts` line 307 | Money formatting (`$${amount.toLocaleString()}`) | No locale arg, no currency code, manual `$` prefix |
| `src/lib/tools/registry.ts` lines 94-95 | Master-data / transactional record counts in LLM prompt | `.toLocaleString()` no arg (server-side prompt; English OK) |
| `src/app/(site)/erp-implementation-cost-calculator/ErpCostClient.tsx` line 1023 | Users column in result table | `.toLocaleString()` no arg |
| `src/app/(site)/erp-implementation-cost-calculator/ErpCostClient.tsx` line 1058 | Result numeric | `new Intl.NumberFormat("en-US", …)` — hardcoded |
| `src/app/(site)/erp-implementation-cost-calculator/ErpCostClient.tsx` line 1085 | Internal team rate display | `new Intl.NumberFormat("en-US")` — hardcoded |
| `src/app/(site)/erp-implementation-cost-calculator/ErpCostClient.tsx` line 1138 | "Saved" timestamp | `.toLocaleString()` no arg |
| `src/app/(site)/erp-implementation-cost-calculator/ErpCostClient.tsx` line 1197, 1211 | Export/print labels | `.toLocaleDateString()`, `.toLocaleString()` no arg |
| `src/components/books/LeadCaptureModal.tsx` line 267-269 | `${context.price.toFixed(2)} ebook` | No `Intl.NumberFormat`, no currency code, hard `$` |
| `src/components/books/BookCard.tsx` line 85 | `$${price.toFixed(2)}` | Same — no Intl, no currency |
| `src/components/article/ArticleHero.tsx` line 111 | `"Updated "` static prefix to date | Date label is in English locale; prefix is English |
| `src/lib/seo.ts` line 121 | Parse-only `new Date(...)` for ISO normalisation | Locale-agnostic (correct) |

**Net summary on formatters:**

- Article dates: 2 occurrences, both hardcoded `"en-US"`.
- Numbers/currency: ~10 occurrences in calculator and lead UIs — most
  are no-locale `.toLocaleString()` (uses server's default, which in
  Vercel is typically English) or hardcoded `"en-US"` `Intl.NumberFormat`.
  None pass the current Locale through.
- Currency symbol: hand-rolled `$` prefix in books pricing, ERP
  calculator, and solution builder — no per-locale currency support.

## Existing patterns that switch on Locale

Located by inspection (Grep / Read):

- `src/lib/seo.ts` — `localizeCanonicalOverride(canonical, locale)`,
  `englishPathForPage`, `buildLanguageAlternates(englishPath)` — all
  branch on `locale === "en"`.
- `src/lib/locales.ts` — `localePathPrefix(locale)`,
  `localizedPath(locale, path)` — branch on locale for URL prefix.
- `src/components/LanguageSwitcher.tsx` — uses `LOCALE_NATIVE_NAMES[loc]`
  to render the option text in its own language; sets `dir="rtl"`
  for `ar`.

**No existing pattern switches a translatable UI string on locale.**
Every translation done today is at the MDX content level via the
`getPost(slug, locale)` / `getPage(slug, locale)` content layer.
Component chrome is the gap.

## Recommended next steps

1. **Adopt a translation helper before touching components.** Even
   without `next-intl`, define a minimal `t(locale, key)` API or a
   per-locale JSON dictionary mounted in a server-component context
   provider. Otherwise every component needs a `locale` prop and
   inline conditional — a much larger diff. The thinnest viable shape
   is `src/lib/strings/<locale>.json` + a typed `t()` that takes the
   served locale and a key.

2. **Resolve the dual-source-of-truth tax first.** Category labels
   live in three places (`Nav.tsx` PILLARS, `Footer.tsx` solutions,
   `src/lib/content.ts` CATEGORIES); tool labels live in two
   (`Nav.tsx` TOOLS, `Footer.tsx` tools); beliefs live in two
   (`WhatIBelieve.tsx` and `src/components/article/beliefs/data.ts`
   with subtle copy drift). Consolidate to a single source per
   concept before localising — otherwise every locale carries the
   same duplication.

3. **Fix `<html lang>` / `<html dir>` first as a one-line wedge.**
   `src/app/(site)/layout.tsx` line 78-79 always emits `lang="en"
   dir="ltr"` even on `/ar/`, `/ja/`, etc. This breaks screen readers
   and CSS logical-property direction on every translated page. It's
   a 5-minute fix and should not wait for the rest of the
   localisation work.

4. **Triage by user-visibility, not by string count.** The 5
   highest-value files for the first cut are Nav, Footer,
   CategoryPage, PostPage chrome, and the Hero — every translated URL
   passes through them. The 2,000-line `ErpCostClient.tsx` carries
   the most strings but is one tool page deep in the funnel; localise
   later. Testimonials and case-study verbatim quotes should NOT be
   machine-translated (they are real attributed people's words) —
   carve those out of the translation pipeline explicitly so a
   future contributor doesn't auto-run them.
