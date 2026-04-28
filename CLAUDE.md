@AGENTS.md

@BRAND.md

@VOICE.md

@BUYER-CEO.md

@BUYER-CONSULTANT.md

@DESIGN\_SYSTEM.md

@PRD.md

# Noel D'Costa — Personal Brand Site

This is the personal brand site for Noel D'Costa. Senior ERP/AI advisor.
Eventual replacement for noeldcosta.com (currently WordPress). Multi-language
via the `\[lang]` segment. SEO migration target: zero URL changes from
the WordPress version. Better copy, same paths.

## Stack notes

* Next.js (App Router, src/ directory). Read AGENTS.md before writing code.
* TypeScript everywhere.
* MDX for blog content (mdx-components.tsx at root, content/ folder for posts).
* Tailwind (postcss.config.mjs).
* Multi-language via dynamic \[lang] segment in src/app/.
* Design system tokens in src/app/globals.css (Command Center system).

## Routing table

|Task|Edit|Read|
|-|-|-|
|Homepage hero|src/components/Hero.tsx|\_docs/homepage/01-hero.md, BUYER-CEO.md|
|Homepage trust bar / logos|src/components/LogoScroll.tsx, Ticker.tsx|\_docs/homepage/02-trust-bar.md|
|Homepage problem section|src/components/ProblemStats.tsx|\_docs/homepage/03-problem.md|
|Homepage services / what I do|src/components/Services.tsx|\_docs/homepage/04-services.md|
|Homepage case studies|src/components/TrackRecord.tsx|\_docs/homepage/05-case-studies.md|
|Homepage AI capabilities|src/components/AICapabilities.tsx|\_docs/homepage/06-ai.md|
|Homepage tools / products|src/components/Tools.tsx|\_docs/homepage/07-tools.md|
|Homepage testimonials|src/components/Testimonials.tsx|\_docs/homepage/08-testimonials.md|
|Homepage about / credentials|src/components/Credentials.tsx|\_docs/homepage/09-about.md|
|Homepage final CTA|src/components/CTABanner.tsx|\_docs/homepage/10-cta.md|
|Nav, footer (global)|src/components/Nav.tsx, Footer.tsx|BRAND.md|
|For-consultants page|src/app/\[lang]/for-consultants/|\_docs/for-consultants/CONTEXT.md|
|About page|src/app/\[lang]/about/|\_docs/about/CONTEXT.md|
|Case study page|src/app/\[lang]/case-studies/\[slug]/|\_docs/case-studies/CONTEXT.md|
|Tool page|src/app/\[lang]/tools/\[slug]/|\_docs/tools/CONTEXT.md|
|Blog post layout|src/components/PostPage.tsx|\_docs/blog/CONTEXT.md|
|Category page layout|src/components/CategoryPage.tsx|\_docs/blog/CONTEXT.md|
|MDX content|content/|\_docs/blog/CONTEXT.md|
|SEO, sitemap, robots|src/lib/seo.ts, sitemap.ts, robots.ts|BRAND.md, \_docs/references/wordpress-urls.md|
|Locales / i18n|src/lib/locales.ts|-|

## Rules

* Read AGENTS.md before writing any Next.js code. The version has breaking changes.
* Read BRAND.md and VOICE.md before writing any user-facing copy.
* Before changing a URL or route, stop. SEO migration target is zero URL changes from WordPress.
* Sentence-case headings everywhere. No title case marketing copy.
* No em-dash sentence patterns ("X — Y" structures). See VOICE.md.
* Use design tokens from DESIGN\_SYSTEM.md / globals.css. No new colors.
* Multi-language: write English first. Translation is downstream.
* When unsure, ask before generating files.

## Naming conventions

* Component files: PascalCase (Hero.tsx, ProblemStats.tsx).
* Doc files: kebab-case (01-hero.md, design-system.md).
* Content slugs: match WordPress slugs exactly. Do not invent new slugs.
* Source material for blog posts: content/\_source/\[topic]-notes.md.

## Constraints — what NOT to do

### URLs and SEO

* DO NOT change any existing URL slug from noeldcosta.com. Every WordPress
URL maps 1:1 to a Next.js route. Rewriting copy is fine. Renaming slugs
is not.
* DO NOT add new URL patterns without checking the existing site first.
If a similar page exists at noeldcosta.com, use that slug.
* DO NOT remove or modify src/lib/seo.ts, src/app/sitemap.ts, src/app/robots.ts
without flagging it explicitly. SEO infrastructure is migration-critical.
* DO NOT introduce 301 redirects unless I explicitly ask. The plan is
zero redirects.
* DO NOT change canonical tags or hreflang patterns without checking
src/lib/locales.ts first.
* DO NOT generate sitemap entries for non-existent pages.

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
If a number isn't in \_docs/references/client-list.md, ask before using it.

### Code and stack

* DO NOT modify package.json dependencies without flagging it. The Next.js
version has breaking changes — see AGENTS.md.
* DO NOT introduce new heavy dependencies (animation libs, UI kits,
CSS-in-JS) without asking. Stack is Next.js + Tailwind. Keep it that way.
* DO NOT use 'use client' on the homepage components unless they
genuinely need client-side interactivity. SEO and performance suffer.
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

* DO NOT introduce new colors outside the DESIGN\_SYSTEM.md palette.
* DO NOT use Tailwind's default color names (blue-500, gray-400) unless
there's a specific reason. Use --cc-\* tokens.
* DO NOT use stock photography of people. Real photos only or no photos.
* DO NOT add emoji to public-facing copy. (Fine in chat.)
* DO NOT animate things that don't need to move. Tickers fine, decorative
animations no.

## Constraints — blog \& MDX content (anti-AI-detection)

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
source interview, transcript, or notes file in content/\_source/.
* DO NOT write articles where every paragraph could be moved without
changing the meaning. That structure is a generation tell.

### Process for blog posts

1. Reference material first. Before writing, ask Noel for the source —
project notes, an interview transcript, a video transcript, a draft.
Without source material, the post will read as generated.
2. Voice match. Read VOICE.md and the last 3 published posts to calibrate.
3. Draft in markdown in content/. Include source references in
frontmatter.
4. After drafting, run a "human pass" — re-read and add 2-3 imperfections,
asides, or specific moments that a generator wouldn't naturally include.
5. Flag any claim that needs fact-checking. Don't fabricate numbers.

### Frontmatter required for every MDX post

* title, slug (matches WordPress slug), date, lang, category
* author: "Noel D'Costa"
* experience\_source: where the content came from (project, interview, etc)
* last\_reviewed: date Noel last read it personally

The experience\_source field is internal. It's a forcing function. If
it's empty, the post isn't ready to publish.

