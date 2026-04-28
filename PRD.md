# PRD — noeldcosta.com Personal Brand Site

Master plan for the rebuild. Read this before starting any work.
Read CLAUDE.md for rules and constraints. Read this for what to
build, in what order, and when something is "done."

Last updated: 2026-04-28

---

## Vision

A senior personal brand site for Noel D'Costa. The site exists to
win 30-minute discovery calls with enterprise CIOs, CFOs, and
Programme Directors who are running ECC-to-S/4HANA migrations or
adding AI on top of ERP. It eventually replaces the WordPress site
at noeldcosta.com without losing SEO. Same URLs. Better copy.
Better design. Built for a buyer who scans for under 90 seconds.

---

## Success metrics

Three metrics. Measurable. Reviewed quarterly.

### 1. Inbound LinkedIn DMs from CIO/CFO-level senior buyers

What we're measuring: cold inbound LinkedIn messages from people
with titles like CIO, CFO, Programme Director, Group Head of IT,
Chief Digital Officer at companies $100M+ revenue.

Baseline: track current monthly volume manually for the next 4 weeks.
Target: 2x baseline within 6 months of homepage launch.

Measurement method: Noel logs each qualifying inbound DM with
date, company, title, source. Simple spreadsheet or Notion table.
Site contribution measured by asking "how did you find me" in the
first reply.

### 2. SEO migration without traffic loss

What we're measuring: organic search traffic from Google to the
new Next.js site post-DNS-cutover, vs. the WordPress baseline.

Target: <10% organic traffic drop in the first 30 days.
Recovery to baseline within 90 days.
No drop in keyword rankings for the top 50 queries.

Measurement method: Google Search Console + Google Analytics
(or Plausible). Capture WordPress baseline for the 90 days
before cutover. Compare against the same 90-day window post-cutover.

This metric forces the zero-redirect URL contract. Every WordPress
URL maps 1:1 to a Next.js route. See `_docs/references/wordpress-urls.md`.

### 3. 30-min Calendly bookings per month

What we're measuring: discovery calls booked through the Calendly
link on the site (https://calendly.com/noeldcosta/30min).

Baseline: capture current monthly bookings before launch.
Target: 1.5x baseline within 3 months of homepage launch.

Measurement method: Calendly dashboard. Filter by booking source
URL where possible.

---

## Out of scope (this build)

Things we are NOT doing in this rebuild. If you find yourself
working on one of these, stop and ask.

- A pricing page. Engagements are scoped, not productized.
- A SaaS dashboard or login system on this site.
- A jobs board or careers page.
- A newsletter platform integration (deferred to phase 2 of the
  for-consultants page only).
- Live chat or chatbot widgets.
- Multi-language translation work. English first. Other locales
  are a separate downstream phase.
- Migration of every WordPress post. Top 20-30 only in this build.
- A redesign of erpcv.com or commandcc.io. Those sites stay as-is.
- Custom analytics or A/B testing infrastructure.

---

## Workflow — Opus + Sonnet

Two models. Two roles. Don't mix them.

### Opus (in chat with Noel)
- Writes briefs (per-section specs in `_docs/`)
- Reviews completed work
- Updates the PRD
- Resolves ambiguity, makes architecture calls
- Drafts copy that needs strategic judgment

### Sonnet (in Claude Code, in the repo)
- Reads CLAUDE.md and imported context files automatically
- Reads the brief for the task being worked on
- Refactors components, writes code, drafts MDX
- Runs the build, fixes type errors
- Self-checks against acceptance criteria

### The execution loop

1. Noel picks the next task from PRD.md (status: pending,
   dependencies met).
2. Noel asks Opus (chat) to write or update the brief in
   `_docs/[section]/[task-id].md`.
3. Opus drafts the brief. Noel reviews and edits.
4. Noel hands the task to Sonnet (Claude Code) with a prompt like:
   "Read PRD.md task H-01 and `_docs/homepage/01-hero.md`. Execute.
    Self-check against acceptance criteria. Report back."
5. Sonnet executes. Builds run. Files saved.
6. Noel reviews the result. Tests in browser.
7. If acceptance criteria met → mark task `done` in PRD.md.
   Commit. Push.
8. If issues → either go back to Sonnet (execution problem) or
   back to Opus (brief problem).

### Rules for Sonnet

- Sonnet does not change architecture. If a task seems wrong,
  flag it — don't fix it.
- Sonnet does not invent task IDs. If something needs doing that
  isn't in the PRD, add it as `proposed` and ask Noel.
- Sonnet does not skip dependencies. If H-04 says "depends on H-01",
  H-01 must be `done` before H-04 starts.
- Sonnet does not declare a task done without running the build
  and confirming acceptance criteria.

---

## Phase status legend

Each task carries a status. Update inline as work progresses.

- `pending` — not started, dependencies may or may not be met
- `ready` — dependencies met, can be picked up
- `in-progress` — actively being worked on
- `blocked` — waiting on a decision, asset, or external input
- `done` — acceptance criteria met, committed, deployed
- `proposed` — Sonnet flagged this; needs Opus/Noel to approve

---

## Phase 1 — Foundation

Status: 90% done.

| ID | Task | Status | Depends on | Acceptance criteria |
|---|---|---|---|---|
| F-01 | CLAUDE.md, BRAND.md, VOICE.md at repo root | done | — | Files exist, CLAUDE.md imports work, verification prompt returns correct answers |
| F-02 | BUYER-CEO.md, BUYER-CONSULTANT.md at root | done | F-01 | Imported into CLAUDE.md, Sonnet references them when writing copy |
| F-03 | DESIGN_SYSTEM.md at root | done | F-01 | Documents Command Center tokens; matches src/app/globals.css |
| F-04 | _docs/ folder structure created | done | — | _docs/homepage/, /for-consultants/, /about/, /case-studies/, /tools/, /blog/, /references/ all exist |
| F-05 | content/_source/ folder for blog source material | ready | — | Folder exists. .gitignore decision made (track or ignore based on repo public/private) |
| F-06 | _docs/references/wordpress-urls.md | done | — | URL master list from sitemap; referenced when creating new pages |
| F-07 | _docs/references/client-list.md | pending | — | List of clients we can name publicly, with scope and outcome numbers. Source material for case studies. |
| F-08 | _docs/references/testimonials.md | pending | — | Real testimonials with attribution. No invented quotes. |
| F-09 | Logos directory in /public | pending | — | Black-and-white SVG or optimized PNG logos for each named client. Naming convention: `/public/logos/{client-slug}.svg` |

F-07, F-08, F-09 are blocking content for Phase 2. Address before
starting H-02 (trust bar) and H-05 (case studies).

---

## Phase 2 — Homepage

Goal: ship a homepage that wins the 90-second scan for the CEO buyer.
11 sections. Build in order. Each section has a brief in `_docs/homepage/`.

| ID | Section | Component | Status | Depends on | Brief |
|---|---|---|---|---|---|
| H-01 | Hero | `src/components/Hero.tsx` | pending | F-01, F-03 | `_docs/homepage/01-hero.md` |
| H-02 | Trust bar (client logos) | `src/components/LogoScroll.tsx` | pending | H-01, F-09 | `_docs/homepage/02-trust-bar.md` |
| H-03 | Problem (3 stats) | `src/components/ProblemStats.tsx` | pending | H-01 | `_docs/homepage/03-problem.md` |
| H-04 | Services / What I do | `src/components/Services.tsx` | pending | H-01 | `_docs/homepage/04-services.md` |
| H-05 | Case studies | `src/components/TrackRecord.tsx` | pending | H-01, F-07 | `_docs/homepage/05-case-studies.md` |
| H-06 | How I work (4 steps) | `src/components/HowIWork.tsx` (NEW) | pending | H-01 | `_docs/homepage/06-how-i-work.md` |
| H-07 | What I believe (5 opinions) | `src/components/WhatIBelieve.tsx` (NEW) | pending | H-01, BRAND.md | `_docs/homepage/07-what-i-believe.md` |
| H-08 | AI capabilities | `src/components/AICapabilities.tsx` | pending | H-01 | `_docs/homepage/08-ai-capabilities.md` |
| H-09 | Tools (Command Central + ERPCV) | `src/components/Tools.tsx` | pending | H-01 | `_docs/homepage/09-tools.md` |
| H-10 | Testimonials | `src/components/Testimonials.tsx` | pending | H-01, F-08 | `_docs/homepage/10-testimonials.md` |
| H-11 | About / Credentials | `src/components/Credentials.tsx` | pending | H-01 | `_docs/homepage/11-credentials.md` |
| H-12 | YouTube section | `src/components/YouTubeSection.tsx` | pending | H-01 | `_docs/homepage/12-youtube.md` |
| H-13 | Final CTA | `src/components/CTABanner.tsx` | pending | H-01 | `_docs/homepage/13-cta.md` |
| H-14 | Nav (global) | `src/components/Nav.tsx` | pending | H-01 | `_docs/homepage/14-nav.md` |
| H-15 | Footer (global) | `src/components/Footer.tsx` | pending | H-01 | `_docs/homepage/15-footer.md` |
| H-16 | Page assembly | `src/app/[lang]/page.tsx` | pending | H-01 through H-15 | — |

### Acceptance criteria for the homepage as a whole (H-16)

- Loads under 1.5s on a 4G connection (Lighthouse mobile)
- Lighthouse performance score > 90
- Lighthouse accessibility score > 95
- All sections render correctly on 375px (mobile), 768px (tablet),
  1280px+ (desktop)
- Zero `'use client'` directives unless the section genuinely needs
  interactivity (only Ticker, LogoScroll, animations should be client)
- All copy passes VOICE.md checklist (no buzzwords, sentence-case,
  first person, no em-dash drama patterns)
- All colors use --cc-* tokens
- The 90-second scan test: a non-Noel reviewer can identify
  (a) what Noel does, (b) who he's worked with, (c) how to book a
  call — within 90 seconds of first view

### Section dependencies note

H-01 (hero) is the keystone. Everything else depends on it because
the hero locks in section header style, container width, vertical
rhythm, and CTA pattern that the rest of the homepage inherits.
Don't start H-02 through H-15 until H-01 is `done`.

H-02 (trust bar) and H-05 (case studies) are blocked by F-07
(client list) and F-09 (logos). Sort those first.

---

## Phase 3 — Secondary pages

Goal: complete the navigable site. Each page has its own CONTEXT.md
in `_docs/[page]/`.

| ID | Page | Route | Status | Depends on | Brief |
|---|---|---|---|---|---|
| S-01 | About | `/sap-erp-consultant-my-story-noel-dcosta/` | pending | H-16 | `_docs/about/CONTEXT.md` |
| S-02 | For consultants | `/for-consultants/` | pending | H-16 | `_docs/for-consultants/CONTEXT.md` |
| S-03 | Case studies index | `/case-studies/` | pending | H-05 | `_docs/case-studies/CONTEXT.md` |
| S-04 | Case study: EDGE Group | `/case-studies/edge-group/` | pending | S-03, F-07 | `_docs/case-studies/edge-group.md` |
| S-05 | Case study: Etihad | `/case-studies/etihad/` | pending | S-03, F-07 | `_docs/case-studies/etihad.md` |
| S-06 | Case study: TII | `/case-studies/tii/` | pending | S-03, F-07 | `_docs/case-studies/tii.md` |
| S-07 | Case study: DXC | `/case-studies/dxc/` | pending | S-03, F-07 | `_docs/case-studies/dxc.md` |
| S-08 | Case study: Govt Enablement | `/case-studies/govt-enablement/` | pending | S-03, F-07 | `_docs/case-studies/govt-enablement.md` |
| S-09 | Contact | `/contact-noel-erp-support/` | pending | H-16 | `_docs/contact/CONTEXT.md` |
| S-10 | Services index | `/erp-ai-services/` | pending | H-04 | `_docs/services/CONTEXT.md` |
| S-11 | SAP implementation hub | `/sap-implementation/` | pending | S-10 | `_docs/services/sap-implementation.md` |
| S-12 | Industry: aviation | `/sap-implementation/for-aviation/` | pending | S-11 | inherit from S-11 |
| S-13 | Industry: manufacturing | `/sap-implementation/for-manufacturing/` | pending | S-11 | inherit from S-11 |
| S-14 | Industry: retail | `/sap-implementation/for-retail/` | pending | S-11 | inherit from S-11 |
| S-15 | RISE with SAP | `/sap-implementation/rise-with-sap/` | pending | S-11 | inherit from S-11 |
| S-16 | GROW with SAP | `/sap-implementation/grow-with-sap/` | pending | S-11 | inherit from S-11 |
| S-17 | Business One | `/sap-implementation/business-one/` | pending | S-11 | inherit from S-11 |
| S-18 | SAP Modules | `/sap-implementation/sap-modules/` | pending | S-11 | inherit from S-11 |
| S-19 | S/4HANA | `/sap-implementation/s4hana/` | pending | S-11 | inherit from S-11 |
| S-20 | SAP Integration | `/sap-implementation/sap-integration-platforms/` | pending | S-11 | inherit from S-11 |
| S-21 | AI Governance | `/ai-governance-services/` | pending | H-08 | `_docs/services/ai-governance.md` |
| S-22 | Small business ERP | `/erp-for-small-business-ai-automation/` | pending | S-10 | `_docs/services/small-business.md` |
| S-23 | Consulting career guides | `/consulting-career-guides/` | pending | S-02 | `_docs/for-consultants/career-guides.md` |
| S-24 | SAP articles hub | `/best-sap-articles-for-implementation-noel-dcosta/` | pending | P-01 | `_docs/blog/sap-articles-hub.md` |
| S-25 | Tool: JD Generator | `/sap-job-description-generator/` | pending | H-09 | `_docs/tools/jd-generator.md` |
| S-26 | Tool: SAP Cost Calculator | `/sap-implementation-cost-calculator/` | pending | H-09 | `_docs/tools/sap-cost.md` |
| S-27 | Tool: Solution Builder | `/sap-solution-builder/` | pending | H-09 | `_docs/tools/solution-builder.md` |
| S-28 | Tool: Migration Estimator | `/free-data-migration-estimator-sap-oracle-microsoft/` | pending | H-09 | `_docs/tools/migration-estimator.md` |
| S-29 | Tool: Migration Assessment | `/sap-s4hana-migration-strategy-greenfield-vs-brownfield/` | pending | H-09 | `_docs/tools/migration-assessment.md` |
| S-30 | AI Insights hub | `/ai-insights-shiftgearx-noeldcosta/` | pending | H-08 | `_docs/services/ai-insights.md` |
| S-31 | Nested: ERP Cost Calculator | `/ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/` | pending | S-30, H-09 | `_docs/tools/erp-cost.md` |
| S-32 | All Partners | `/all-our-partners/` | pending | H-16 | `_docs/about/partners.md` |
| S-33 | Write For Us | `/write-for-us-lets-share-our-experiences/` | pending | H-16 | `_docs/about/write-for-us.md` |
| S-34 | Privacy Policy | `/privacy-policy-noeldcosta/` | pending | H-16 | content port from WordPress |

### Note on case study pages

All five case studies (S-04 to S-08) follow the same template.
Sonnet should build the template once (as part of S-04) and reuse
for the remaining four. Each takes content from `_docs/case-studies/`
plus referenced numbers from `_docs/references/client-list.md`.

### Note on existing tool pages

Tool pages S-25 to S-29 likely exist in the current Next.js codebase.
Task is "review and update" not "build from scratch." Check
`src/app/[lang]/` for existing routes before starting each.

---

## Phase 4 — Content migration

Goal: port priority blog content from WordPress to Next.js MDX
without losing SEO equity.

| ID | Task | Status | Depends on | Acceptance criteria |
|---|---|---|---|---|
| P-01 | MDX content infrastructure verified | pending | F-01 | `mdx-components.tsx`, `content/`, PostPage.tsx all working. Build succeeds with at least one test post. |
| P-02 | Identify top 20 priority articles | pending | — | List in `_docs/references/priority-posts.md`. Ranked by current organic traffic (use Google Search Console). |
| P-03 | Create voice memo / source process | pending | F-05 | Document workflow in `_docs/blog/CONTEXT.md`: voice memo → transcript → MDX draft. |
| P-04 | Migrate priority post 1 (proof) | pending | P-01, P-02, P-03 | First post live at `/{wordpress-slug}/`. Same URL, same metadata, rewritten copy per VOICE.md. SEO score >= WordPress equivalent. |
| P-05 | Migrate posts 2-10 | pending | P-04 | Each post follows the same pattern. Frontmatter complete with experience_source field. |
| P-06 | Migrate posts 11-20 | pending | P-05 | As above. |
| P-07 | Set up category pages | pending | P-04 | All 4 category pages render with correct posts: ai-governance, erp-consulting-guide, sap-case-studies, sap-modules. |
| P-08 | Configure sitemap.xml output | pending | P-06, P-07 | Next.js sitemap matches WordPress sitemap structure. All migrated URLs included. |
| P-09 | robots.txt configured | pending | P-08 | robots.txt exists, allows search engines, references sitemap. |
| P-10 | Long-tail post strategy | pending | P-06 | Decision documented: archive un-migrated posts on WordPress until migration, OR redirect to a coming-soon page, OR full migration timeline. |

---

## Phase 5 — Polish + launch

Goal: launch without dropping traffic. Ship it.

| ID | Task | Status | Depends on | Acceptance criteria |
|---|---|---|---|---|
| L-01 | Lighthouse audit (mobile + desktop) | pending | Phase 2 + 3 done | Performance >= 90, Accessibility >= 95, Best Practices >= 95, SEO 100. Both mobile and desktop. |
| L-02 | Mobile review (real devices) | pending | L-01 | Tested on actual iOS Safari (iPhone) and Android Chrome (mid-range device). All sections render correctly. |
| L-03 | Accessibility audit (WCAG AA) | pending | L-01 | All interactive elements keyboard-accessible. Color contrast meets AA. Screen reader test on hero and forms. |
| L-04 | Cross-browser test | pending | L-02 | Chrome, Safari, Firefox, Edge all render correctly on desktop and mobile. |
| L-05 | Capture WordPress baseline (90 days) | pending | — | Snapshot Search Console: top 50 keywords, organic traffic graph, top landing pages. Save to `_docs/references/seo-baseline.md`. |
| L-06 | Set up Google Search Console for Vercel domain | pending | — | New property added. Verified. Ready to receive traffic. |
| L-07 | Set up Calendly source tracking | pending | — | Calendly URL on the new site has UTM parameters or unique slug to attribute bookings. |
| L-08 | Set up LinkedIn DM tracking spreadsheet | pending | — | Simple Notion or sheet for Noel to log inbound DMs with date, company, title, source. |
| L-09 | DNS cutover plan documented | pending | Phase 2 + 3 + 4 done | Step-by-step in `_docs/launch/dns-cutover.md`. Includes rollback plan. |
| L-10 | DNS cutover (the launch) | pending | L-01 through L-09 | noeldcosta.com points at Vercel. WordPress disabled or set to readonly. New site live. |
| L-11 | Submit new sitemap to Search Console | pending | L-10 | Sitemap submitted. No errors. Crawl status confirmed. |
| L-12 | Monitor weeks 1-4 post-launch | pending | L-10 | Daily check Search Console for crawl errors, indexing issues, traffic drops. Log issues in `_docs/launch/post-launch-log.md`. |
| L-13 | 30-day post-launch review | pending | L-12 | Compare to baseline. Document traffic changes, ranking changes, conversion changes. Update PRD with phase 6 if needed. |

---

## How to update this PRD

When a task moves status: edit the row inline. Commit with message
`PRD: H-XX done` or `PRD: F-XX in-progress`.

When a new task is needed:
- Sonnet adds it as `proposed` with a draft entry
- Noel/Opus reviews and either accepts (changes to `pending` or
  `ready`) or rejects (deletes the row)

When a phase completes: change the phase status header. Note any
learnings at the bottom of that phase section.

This file is the source of truth. If something isn't here, it isn't
in scope. If you're not sure what to do next, read the next
`ready` task and start.
