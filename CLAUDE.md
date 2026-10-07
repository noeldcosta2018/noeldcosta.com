@AGENTS.md

@BRAND.md

@VOICE.md

@BUYER-CEO.md

@blog-editor.md

# Noel D'Costa — noeldcosta.com

Noel's personal authority site. This repository is the Next.js replacement for
the WordPress site at noeldcosta.com. Public URLs, translated content and SEO
equity are protected assets. Better copy and a new visual system, same paths.

## Current direction (6 October 2026) — read first

`NOELDCOSTA_REVAMP_BRIEF.md` (workspace root, one level above `worktrees/`) is the
current business direction. Where any older file in this repository conflicts
with it, the brief wins. Do not re-ask Noel whether the site is SAP-first,
academy-first or a new build.

- The site leads with Noel's experience helping customers in three connected
  areas: Enterprise Applications (SAP, Oracle, Microsoft), Data (Databricks,
  SAP Analytics Cloud) and AI (Enterprise AI, Private AI, SAP Joule, AI for
  small businesses). Planning, delivery and recovery describe how Noel helps.
  They are not the whole proposition.
- AI Academy is secondary: one distinct homepage chapter plus a dedicated page
  (proposed `/ai-academy/`). No enrolment, payment, waitlist, LMS or
  certificate mechanics until separately approved.
- Visual foundation: the supplied MDLBeast source at `../../MDLBeast`. It is a
  confidential DXC client proposal. Reuse layout, type and motion patterns
  only. Never copy its copy, data, client names, logos, media or `/reference`.
- Colours and fonts may change in this revamp, once, through one approved
  system. `DESIGN_SYSTEM.md` describes the current tokens, not a permanent lock.
- Working plan: `docs/claude/revamp-working-plan.md` (workspace root). The
  revamp is implemented on the `claude/integration` worktree; batch reviews
  live in `docs/claude/batch-*.md`.
- Codex runs separately in this worktree under `AGENTS.md` and
  `docs/codex/**`. Do not edit, stage, revert or clean its uncommitted work.

## Multilingual facts (supersedes all GTranslate text in older files)

- There is no GTranslate dependency in the new application. The repository
  holds first-class translated MDX (`src/lib/locales.ts`), loaded by
  `src/lib/content.ts`.
- Published languages (Noel, 7 October 2026): English plus de, es, fr, hi, it,
  ja, ko, nl, pt, ru, tr, ar (right to left), Simplified Chinese (content
  locale `zh`, public prefix `/zh-CN/`), Traditional Chinese (`/zh-TW/`),
  Greek (`/el/`) and Croatian (`/hr/`).
- Translations are made from the reviewed English with the procedure in
  `docs/claude/i18n/ARTICLE-AGENT.md` and checked with
  `scripts/check-translation.mjs` and `scripts/check-i18n.mjs`. Noel's first
  person uses masculine forms where a language marks gender. Turkish uses
  "Kontrolling" for CO.
- The protected public URL and locale contract is
  `docs/codex/seo-protected-routes.json` plus
  `docs/codex/locale-content-manifest.json`. Follow it. Do not change slugs,
  locale prefixes, trailing slashes or canonical relationships to make a menu
  or design easier.
- Emit hreflang only for real translations. Never serve English fallback as a
  translation.
- `PRD.md` and `_docs/homepage/**` describe the earlier English-only,
  SAP-first plan. Treat them as history, not instructions.

## Rules that still apply

- Before changing a URL, route, redirect, sitemap, robots, canonical, hreflang
  or `src/lib/seo.ts`, stop and flag it. Target is zero URL changes. The only
  redirects are the old WordPress slugs WordPress already redirects (approved
  by Noel, 7 October 2026). New pages are additive.
- No invented testimonials, clients, numbers, credentials, dates or outcomes.
  Company names already in Noel's content stay (Noel, 7 October 2026).
  Quote recommendations verbatim from the published source and keep the
  relationship accurate (employer, colleague, advisory client). A referee's
  later employer is not Noel's client.
- Real photos of Noel only. No generated people, no stock people.
- No new dependencies without flagging. Framer Motion is the motion layer; no
  second motion framework. Core copy and links stay in server-rendered HTML.
  Respect `prefers-reduced-motion`, keyboard use and Arabic RTL.
- No tracking scripts, pixels or analytics without asking.
- Sentence-case headings. First person for Noel's experience, second person
  for the reader. No em-dash drama patterns. VOICE.md banned words apply.
- No "Built with" badges, tool logos or generator commentary on public pages.
- No deploy, commit, push, merge or destructive git command without explicit
  approval in the current conversation.

## Article refresh (supersedes the old "never change ranking articles" stance)

Existing article text may be improved through a reviewed pilot. URLs, slugs,
locale prefixes and publication dates do not change. Log old and new title,
description and H1 with the reason.

- Show experience only through sourced facts: Noel's notes, published
  recommendations, client-list.md, his approved writing. Never add invented
  moments, numbers, mistakes or anecdotes to "sound human". The old
  instructions to add a lived moment, a number and "voice imperfections" to
  every post are withdrawn. Where Noel's input is needed, put a private
  question in the review notes, not a placeholder in the article.
- Verify product facts against official SAP, Oracle, Microsoft and Databricks
  sources with dates. Separate released features from previews.
- Set `updated` only when content changes. Set `lastReviewed` only after Noel
  has actually reviewed it (this replaces step 7 of blog-editor.md).
- Translations follow the approved English pilot, keep local search intent,
  and never claim native-language review that did not happen.

## Stack notes

- Next.js 16 App Router, TypeScript, Tailwind, MDX in `content/`. Read
  AGENTS.md and `node_modules/next/dist/docs/` before writing Next.js code.
- `trailingSlash: true`. Locale handling in `src/lib/locales.ts` and
  `src/lib/content.ts`.

## Reference files

| File | Purpose |
|------|---------|
| `../../NOELDCOSTA_REVAMP_BRIEF.md` | Current direction (6 Oct 2026) |
| `docs/codex/seo-protected-routes.json` | Protected public routes |
| `docs/codex/locale-content-manifest.json` | Locale availability per slug |
| `client-list.md` | Nameable clients, numbers, TODO-verify flags |
| `src/components/article/testimonials/data.ts` | Recommendation text (verify against published source) |
| `_docs/references/priority-urls.md`, `search-console-findings.md` | Search evidence (dated; state the date range when citing) |
| `PRD.md`, `_docs/homepage/**` | Superseded plan, kept for history |
