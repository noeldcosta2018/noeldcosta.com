# Per-post quality + SEO checklist

Apply this checklist to every blog post in `content/posts/`. Most of the
visual treatment (nav, footer, hero, author box, related articles, animations,
schema) is rendered automatically by `PostPage.tsx` — so the per-post work is
mostly **frontmatter completeness**, **body cleanup**, and **content quality**.

A reference, fully-passed example: `content/posts/sap-performance-testing-it-leaders/en.mdx`.

---

## 1. Frontmatter — required fields

Every post **must** declare these. Missing any of them = post is not
production-ready. Run `npm run check:eeat:strict` to fail the build on
missing E-E-A-T fields.

```yaml
---
title: "<Article title — sentence case, ≤ 70 chars>"
metaTitle: "<SEO title for SERPs — ≤ 50 chars; brand suffix added by template>"
metaDescription: "<150-160 chars, value proposition + primary keyword. NEVER generic.>"
excerpt: "<100-200 chars — same idea as metaDescription but slightly longer; shows on category cards>"
slug: "<exact WordPress slug — DO NOT change>"
date: "YYYY-MM-DDTHH:mm:ssZ"          # ISO 8601 ONLY. WP format "YYYY-MM-DD HH:mm:ss" must be converted.
updated: "YYYY-MM-DDTHH:mm:ssZ"        # same format if present
lastReviewed: "YYYY-MM-DD"             # date Noel personally read end-to-end (E-E-A-T)
hero: "/images/wp/.../hero.webp"       # path must resolve in /public
heroAlt: "<descriptive alt text>"      # NEVER fall back to title
category: "<one of: erp-implementation | platforms-modules | erp-strategy | ai-governance | agentic-ai | case-studies>"
tags: ["<tag>", "<tag>"]               # 1-3 tags from existing taxonomy
author: "Noel D'Costa"                 # NEVER "noeldcosta" slug
experienceSource: "<provenance — project, interview, transcript>"  # E-E-A-T forcing field
originalUrl: "https://noeldcosta.com/<slug>/"  # housekeeping; not user-visible
---
```

### Optional but recommended

```yaml
keyTakeaways:                    # renders the "Key takeaways" card near top
  - "<bullet 1, 8-15 words>"
  - "<bullet 2>"
pullQuote: "<single sentence from the article, the punchiest one>"
pullQuoteAttribution: "<optional — leave blank if it's the author>"
mentions: ["SAP S/4HANA", "Fiori"]  # per-post override of default entity stack
deck: "<one-line standfirst that shows below H1 — 25-40 words>"
```

### Frontmatter rules

- ✗ DO NOT use unquoted YAML date strings (`2026-05-04`) — gray-matter parses them as Date objects and breaks string handling. ALWAYS quote.
- ✗ DO NOT use the WP date format (`2025-07-12 19:43:57`) — fails Google's structured-data validator.
- ✗ DO NOT use `author: "noeldcosta"` (the WP slug). Always `"Noel D'Costa"`.
- ✗ DO NOT leave `metaDescription` and `excerpt` empty. Default fallback is the title repeated, which Google penalises.

---

## 2. Body — WordPress migration artifacts to strip

Most posts came from WordPress and have these recurring issues:

### Headings

- [ ] **Remove duplicate H1.** The frontmatter `title` is rendered by `ArticleHero`. If the body opens with `# <same title>`, delete it.
- [ ] **Remove orphan headings before the H1.** WordPress often left `### Category Label` or `### Section Header` lines at the very top. Delete them.
- [ ] **Sentence case all H2/H3.** Not Title Case. Not ALL CAPS.
- [ ] **Primary keyword in 1-2 H2s naturally.** Not stuffed. The keyphrase from `metaTitle` should appear in section headings where it reads naturally. Aim for 0.5-1.0% density across the body.
- [ ] **No banned heading patterns:** "Why X matters", "How to X", "What is X", "Benefits of X", "Conclusion" used in unbroken sequence. Mix structures.

### CTAs and broken WP shortcodes

- [ ] **Strip inline mailto CTAs.** Lines like `[Talk to Noel – Free 15-Min Call](mailto:...)` must go. The AuthorBox at the bottom is the canonical CTA.
- [ ] **Strip mid-article CTA blocks** that came through as raw HTML or broken links. Command Centre and ERPCV cards are auto-injected by `PostPage`.
- [ ] **Fix broken article-link sections.** WordPress occasionally exported `[Category\n\n### Title](url)` patterns that render as broken links. Convert to a 2x2 dark card grid (see `sap-performance-testing-it-leaders/en.mdx` for the inline-HTML pattern).

### Tables and lists

- [ ] **Convert flat-text tables to GFM pipe tables.** `MdxBody` already animates them via FadeUp.
- [ ] **Fix nested lists.** Sub-bullets must be indented (4 spaces) under the parent. WordPress sometimes exported `- - item` which renders as a separate list with double bullets.
- [ ] **FAQ blocks → `<details>/<summary>` accordions.** This both styles them as accordions AND generates FAQPage JSON-LD automatically.

### Images

- [ ] **All image paths resolve.** Test every `/images/wp/...` path.
- [ ] **Add alt text to body images.** Even ones referenced via inline markdown `![alt](url)` — the alt slot must be a description, not the title.
- [ ] **No image-only paragraphs at the very bottom.** WP often left a trailing image with no context — delete or move into the article.

### Links

- [ ] **Fix WP-format links.** `https://noeldcosta.com/<slug>/` (with trailing slash) → site-relative `/[<slug>]/` if pointing internally — actually NO, keep absolute `https://noeldcosta.com/<slug>` because canonical strategy. Just remove the trailing slash to match canonical.
- [ ] **Outbound links to authoritative sources work** (sap.com, oracle.com, vendor docs, etc.).
- [ ] **No broken outbound links.** Run a link checker.

---

## 3. Content quality — anti-AI-detection (per VOICE.md)

Google's helpful content classifier and AI detectors look for these tells.
Posts with these patterns rank poorly and may be flagged as low quality.

### Banned openers (instant rewrite)

- ✗ "In today's fast-paced world..."
- ✗ "In an era of digital transformation..."
- ✗ "As businesses increasingly..."
- ✗ "It's no secret that..."
- ✗ "Picture this:"

### Banned transitions / connectives

- ✗ "Furthermore"
- ✗ "Moreover"
- ✗ "Additionally"
- ✗ "It's important to note that"
- ✗ "That being said"
- ✗ "In conclusion"

### Banned closers

- ✗ Generic summary paragraph that restates the article
- ✗ "By following these steps, you can..."
- ✗ "Hopefully this helped..."

### Banned lexical tells

- ✗ "Delve" (the most-flagged AI word)
- ✗ "Tapestry", "landscape", "realm", "sphere" used metaphorically
- ✗ "Robust", "seamless", "innovative", "cutting-edge", "best-in-class"
- ✗ "Plays a pivotal role"
- ✗ "A testament to"
- ✗ Frequent use of "leverage" as a verb

### Required experience markers (E-E-A-T)

Every post should include at least 3-5 of:

- [ ] Specific date or quarter ("In Q3 2023...")
- [ ] Specific city or site ("...at the Abu Dhabi office...")
- [ ] Named system with version ("S/4HANA 1909", "ECC 6.0 EHP 7")
- [ ] Named module ("FI/CO", "MM/SD", "PP-PI")
- [ ] A surprised moment ("I assumed X. It turned out to be Y.")
- [ ] An admission ("I got this wrong on the Etihad project.")
- [ ] An aside ("(this is the part nobody tells you in vendor decks)")
- [ ] A judgment ("I'd do this differently next time.")
- [ ] Sensory or physical detail ("The whiteboard from that workshop is still in the war room.")

### Voice rules

- [ ] **First person.** "I led", "I worked with", "I delivered". Not "we", "the team".
- [ ] **Short sentences.** Fragments OK.
- [ ] **No em-dash sentence patterns** ("X — Y" creating artificial drama; "doesn't just X, it Y" structures).
- [ ] **Numbers without buildup.** "25 entities. One ERP. $60M saved." Not "After many years of careful analysis, we managed to save..."

---

## 4. SEO + structured data — auto-handled, but verify

Most schema is generated automatically from frontmatter. Just confirm:

- [ ] **Single H1.** ArticleHero renders the H1 from frontmatter; body must not have a duplicate.
- [ ] **Title length < 70 chars** (with " | Noel D'Costa" suffix added by template = ≤ 65 chars for the `metaTitle` itself).
- [ ] **Description 150-160 chars.** Hand-written, includes primary keyword, value prop.
- [ ] **All images have alt text.** Hero gets `heroAlt` from frontmatter; body images need inline alt.
- [ ] **Dates in ISO 8601** format (covered by frontmatter rules above).
- [ ] **`experienceSource` and `lastReviewed` set** (covered above; verified by `npm run check:eeat`).

Auto-generated schemas (no manual work — verify by viewing source):

- BlogPosting (or TechArticle for `platforms-modules` category)
- BreadcrumbList
- FAQPage (only when body has `<details>/<summary>` accordions)
- Person, WebSite, Blog (sitewide via layout)
- AboutPage, ContactPage, CollectionPage (page-type specific)
- speakable, mentions, about, isPartOf — all generated from frontmatter

---

## 5. Visual treatment — fully automatic

These are rendered by `PostPage.tsx` and `MdxBody.tsx` — no per-post work needed.
Verify by visual review:

- [ ] Article hero: papaya category tag → H1 → deck → byline → hero image, with staggered entrance animation
- [ ] Hero image has 2px papaya border + warm dual-layer shadow
- [ ] Reading progress bar at top
- [ ] Sticky TOC rail on desktop (right side, dark corbeau background, papaya numbers)
- [ ] Inline mobile TOC (collapsible details) for narrow viewports
- [ ] Mid-article Command Centre dark card with dashboard image (auto-injected if `splitAtMidH2` finds a midpoint)
- [ ] ERPCV dark card before the AuthorBox (auto-injected)
- [ ] Combined orange/papaya AuthorBox at the end (author bio + "Book a 30-min call" CTA)
- [ ] Related articles grid with staggered fade-up + hover lift
- [ ] All inline body images get the papaya border + shadow (via `MdxBody`)
- [ ] All tables animate up with FadeUp
- [ ] All `<details>/<summary>` blocks render as accordion cards
- [ ] Pull quote (if `pullQuote` in frontmatter) renders with papaya left border

If any of the above looks wrong, the issue is in the component, not the post.

---

## 6. Per-category special cases

### `platforms-modules`
- Schema becomes `TechArticle` (more specific subtype). No action — auto-applied.

### `case-studies`
- If client name is contractually OK to publish, lead with it in the title and `metaTitle`.
- Mention specific scope numbers in the first 2 paragraphs (entities, modules, $ saved, weeks of recovery, etc.).
- Use a `pullQuote` from the case study if one exists.

### `ai-governance` and `agentic-ai`
- Per CLAUDE.md / PROMPT.md: never lead with AI capability. Sequence is Foundation → Data Quality → Analytics → AI.
- A warning callout about not adopting AI before fixing data foundations is mandatory and must be prominent.

---

## 7. Verification commands

Run after editing each post (or batch of posts):

```bash
# Build — fails on TypeScript errors, broken imports, missing files
npm run build

# E-E-A-T compliance (soft mode — reports counts)
npm run check:eeat

# E-E-A-T strict (fails build on missing fields — use after backfill)
npm run check:eeat:strict
```

Visual verification on the deployed Vercel preview:

```bash
URL="https://noeldcosta-com.vercel.app/en/<slug>"

# Single H1
curl -sL "$URL" | grep -c '<h1'   # must be 1

# All images have alt
curl -sL "$URL" | grep -oE '<img[^>]*alt="[^"]+"' | wc -l
curl -sL "$URL" | grep -oE '<img[^>]*alt=""' | wc -l    # should be 0

# Schema types present
curl -sL "$URL" | grep -oE '"@type":"[A-Za-z]+"' | sort -u

# ISO dates
curl -sL "$URL" | grep -oE '"date(Published|Modified)":"[^"]+"'
```

---

## 8. Acceptance — when is a post "done"?

A post is production-ready when:

1. ✓ All required frontmatter fields are present and valid
2. ✓ Body has no duplicate H1, no stray pre-H1 headings, no inline mailto CTAs, no broken WP shortcodes
3. ✓ At least 3 experience markers from §3 are present in the body
4. ✓ No banned openers, transitions, closers, or lexical tells from §3
5. ✓ All images render and have meaningful alt text
6. ✓ All internal links resolve; all outbound links work
7. ✓ Page passes `npm run build` with zero errors
8. ✓ Page passes `npm run check:eeat:strict` (frontmatter compliance)
9. ✓ Visual review on Vercel preview shows correct hero, AuthorBox, related articles, and animations
10. ✓ Single H1, schema present, ISO dates, alt text all verified via curl

---

## 9. What you should NEVER touch

- ✗ The `slug` field. Must match the WordPress URL exactly. Zero redirects is the migration contract.
- ✗ The hero design, author box, related articles, schemas, or any auto-generated UI. If something looks wrong, fix it in the component, not the post.
- ✗ Tailwind colors outside the design system (corbeau, papaya, bone, paper, cream, canyon, haiti, night, silver). No new hex values.
- ✗ Adding `<style>` tags or inline `class=` in MDX bodies — they don't reliably attach. Use inline `style="..."` if absolutely necessary.
- ✗ Adding new HTML element types in raw HTML blocks (`<ul>`, `<img>`, `<a>`, `<p>` — these all hit `MdxBody`'s component overrides and inherit the styled article treatment, which often isn't what you want for custom blocks). Use `<div>` and `<span>` with inline styles.
