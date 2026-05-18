# Blog editor SOP

Standing process for editing or producing any blog post on this site. Reference for every agent (and human) that touches `content/posts/`.

This file is imported into CLAUDE.md. It sits on top of VOICE.md (which defines the brand voice) and BRAND.md (which defines who is writing). When the two conflict, VOICE.md wins.

## Purpose

A post on this site has to read like Noel wrote it after a programme. Not like an AI summarised the topic. Not like a marketing page. Not like a textbook chapter. The reader is a CIO or CFO scanning between meetings. The post earns their next 90 seconds by being specific, opinionated, and short on filler.

## Voice contract

Every post follows the rules in VOICE.md. Headline summary:

- First person. "I led the cutover at Etihad in Q3 2023", never "the project team led..."
- Short sentences. Fragments OK.
- Sentence-case headings. No Title Case. No ALL CAPS.
- Concrete names, numbers, system versions, dates. No "a major airline" when "Etihad" is true.
- An opinion or judgment in every post. "I'd do this differently next time" is fine. "Industry experts agree" is not.
- One sensory or physical detail per post. "The whiteboard from that workshop is still in the war room" beats five paragraphs of generic advice.

## Banned patterns

These trigger an instant rewrite, not a suggestion.

### Openers
- "In today's fast-paced world"
- "In an era of digital transformation"
- "As businesses increasingly"
- "In the rapidly evolving landscape of"
- "It's no secret that"
- "Have you ever wondered"
- "Picture this:"
- Any opener that does meta-commentary about what the post is about ("This post will cover...", "In this article, I will...")

### Transitions and filler
- "Furthermore", "Moreover", "Additionally", "That being said", "With that in mind", "In conclusion"
- "It's important to note that", "It's worth mentioning that"
- "First, let's discuss...", "Next, we'll look at..."

### Closers
- "I hope this helps"
- "In summary, [restating everything just said]"
- "By following these steps, you can..."
- "Remember that the key to success is..."
- "Hopefully this guide helped you..."
- Any farewell pleasantry

### Lexical tells (instant rewrite)
- "delve" — hard banned, the AI-detector trigger word
- "tapestry", "landscape", "realm", "sphere", "arena" used metaphorically
- "robust", "seamless", "innovative", "cutting-edge", "best-in-class", "world-class"
- "leverage" as a verb
- "plays a pivotal role", "a testament to", "stands as", "it's crucial to understand"
- "unlock", "empower", "transformation journey", "synergies", "game-changer"
- "AI-powered", "AI-driven", "next-generation"

### Em-dash drama patterns
- "X doesn't just Y, it Z"
- "It's not just consulting, it's partnership"
- Em-dashes for dramatic effect. Use commas, colons, or periods.

## Structure rules

### Headings
- H1: page title only, owned by ArticleHero. Never use `#` in the MDX body.
- H2: top-level section. ~6 maximum per post.
- H3: sub-section inside an H2. Used when a section has 2 or more named parts.
- H4: rarely. Inline mini-heading. Often a `**bold paragraph.**` is better.
- Sentence case for every level. "How I choose a strategy", not "How I Choose A Strategy".

### Lists
- **Every list of three or more items gets numbered.** Numbers improve scan, make the list look intentional, and let readers reference items ("see point 3"). This is a strict rule on this site, not a stylistic choice.
- Bulleted lists are reserved for two-item juxtapositions or for inline lists embedded in a sentence flow. If you find yourself writing three or more bullets, switch to numbered.
- If a heading promises a count ("Five strategies", "Common mistakes (4)"), the count in the heading must match the list under it.
- Max one list per H2 section unless the items are genuinely different categories. More than that is a generated-content tell.

### Paragraph rhythm
- Vary length. A 4-sentence paragraph followed by a 1-sentence paragraph reads human. Four 4-sentence paragraphs in a row reads generated.
- One idea per paragraph. If a paragraph has more than one idea, split it.
- Short paragraphs are normal. A single line is allowed.

### Body text density
Body copy is sized for reading density (15-16px). Editorial sites converge there. Marketing pages use 17-18px to slow the eye and give space for CTAs. This is the former.

### Pull quotes and callouts
- Pull quotes are smaller than body text on this site (~15px), not bigger. They are a typographic accent, not a billboard.
- Use them sparingly. One per long-form post, zero on short posts.

### Tables
- Use GFM markdown tables, not flattened cell-per-line. The renderer applies papaya headers and zebra rows.
- A short intro sentence above every table.
- Maximum 3 tables per post. If a post needs more, the post is doing two jobs and should be split.

### Code blocks
- Fenced with the language: ```sql, ```python, ```javascript.
- Inline code for system names: `S/4HANA`, `FI/CO`, `BTP`.
- Maximum 30 lines per block. Beyond that, link to a gist or repo.
- Verify every code block runs / compiles before publishing.

### FAQ sections
- Every article with FAQ content opens the FAQ block with `## Frequently asked questions` as the section H2. Mandatory. The H2 is what makes the FAQ a navigable section for readers, what shows up in the ToC, and what reinforces FAQPage schema for crawlers.
- Use `<details><summary>Question</summary>Answer</details>` for each Q/A pair. The renderer styles them as accordions and emits FAQPage / Question / Answer JSON-LD automatically (see `extractFaqItems` in PostPage.tsx).
- Maximum 8 FAQ items. Beyond that, the post owes the reader a deeper section, not more accordion entries.
- Each `<summary>` must end with a question mark and read as a search query a real user would type. The text is what crawlers and AI search use to match the FAQ to a query.

## Detection checklist

Run this against every post before it ships.

### Sentence-level
- [ ] No sentence longer than 30 words. Run-ons get split.
- [ ] Active voice unless passive is genuinely better ("The data was migrated overnight" reads OK; "The migration of the data was performed by the team during the overnight window" does not).
- [ ] No more than one superlative per 500 words. "The best", "the most important", "the worst" are reserved for actual rankings.
- [ ] No repeated concept within 200 words unless it's a deliberate refrain.

### Section-level
- [ ] Every section serves a different purpose. If two sections could swap places without changing the post, merge them.
- [ ] Every section header followed by a 3-item bullet list with parallel grammar is a generated-content pattern. Mix structures.
- [ ] No section is exactly the same length as every other. Real writing has rhythm variance.

### Acronyms
- [ ] First mention of any acronym expanded: "SAP S/4HANA Cloud (S/4HC)". After that, the acronym alone is fine.
- [ ] Industry-standard acronyms (SAP, ERP, AI, CIO, CFO) need no expansion.
- [ ] Project- or context-specific acronyms always expanded.

### Length
- [ ] Posts under 600 words: probably too short to rank. Either grow it with substance or fold it into a parent post.
- [ ] Posts over 3,500 words: split into a series. Each part stands alone. Cross-link between them.
- [ ] If the post is over 2,500 words and has no source material in `content/_source/`, it reads as generated. Add source notes or cut it back.

### Links
- [ ] Every link's anchor text is descriptive on its own. "Read my [SAP migration cost guide](/...)" not "Click [here](/...)".
- [ ] No more than 5 internal links per 1000 words. Beyond that the post reads as SEO bait.
- [ ] No more than 3 external links per 1000 words. External links to authoritative sources only (SAP.com, Gartner, IDC, SEC filings, government).

## Technical accuracy

- [ ] System version numbers correct as of the article's `last_reviewed` date.
- [ ] Module names match SAP's official naming ("Financial Accounting (FI)", not "Finance module").
- [ ] Code snippets run in the language they claim.
- [ ] Pricing figures, project sizes, and dates verifiable from public sources or `_docs/references/client-list.md`.
- [ ] If a fact cannot be sourced, cut it. Don't soften it ("studies suggest", "many companies report") to keep it in.

## SEO and frontmatter

Every post needs this frontmatter, complete, before merge:

```yaml
title:            # max 60 chars, sentence case
slug:             # matches WordPress slug exactly
date:             # YYYY-MM-DD
updated:          # YYYY-MM-DD when content changed
hero:             # /images/wp/... path
heroAlt:          # descriptive alt text, 8-15 words
category:         # one of: erp-implementation, platforms-modules,
                  # erp-strategy, ai-governance, agentic-ai,
                  # case-studies
tags:             # 2-5 specific tags
author:           # "Noel D'Costa"
metaTitle:        # 50-60 chars, can differ from title for SEO
metaDescription:  # 140-160 chars, must include primary keyword
excerpt:          # 1-2 sentences, used in card previews
experienceSource: # where the content came from (project, interview,
                  # transcript). Internal field but mandatory.
                  # If empty, the post is not ready.
lastReviewed:     # YYYY-MM-DD, last date Noel personally read it
keyTakeaways:     # 3-6 single-line bullets, used in the
                  # KeyTakeaways card near the top
pullQuote:        # optional, one sentence, used mid-article
```

### SEO checks
- [ ] `title` is 60 characters or fewer. Google truncates titles past roughly 580px wide in SERPs, which works out to 50-60 characters for typical fonts. Anything over 60 risks being cut mid-word.
- [ ] `metaTitle` is 60 characters or fewer. Same rule. Title Case is conventional here for click-through; sentence case stays on the `title` field for the on-page H1.
- [ ] `metaDescription` is 140-160 characters. Beyond 160, Google truncates with an ellipsis.
- [ ] Primary keyword in title, H1 (page title), first paragraph, one H2, meta description.
- [ ] metaDescription written for a human, not stuffed with keywords. Has to read.
- [ ] Internal links to 2 to 4 related posts in the same category.
- [ ] Hero image has a meaningful filename, not `Untitled-design-7.webp`.
- [ ] heroAlt describes the image, does not stuff keywords.

## Code-to-prose ratio

- Reference posts (calculators, frameworks): up to 40% code/tables, 60% prose.
- Strategy posts: up to 20% tables, 80% prose.
- Tutorial posts: up to 50% code, 50% prose. Heavy code with no prose is documentation, not a blog post.

## Asides and judgment

Asides earn their place when they:
- Add a personal admission ("I got this wrong on the Etihad project")
- Add a contrarian opinion that contradicts the surrounding text
- Add a sensory detail that grounds the reader in a real moment

Asides do NOT earn their place when they:
- Restate what the surrounding paragraph just said
- Soften a strong claim ("of course, every business is different")
- Add a generic caveat ("results may vary depending on your context")

## Imagery and graphics

Every article needs visual variety so the reader is never staring at a wall of text. Two complementary tools.

### Body imagery (required on every long-form post)

The ArticleHero already renders the hero image at the top. Beyond that:

1. **Every post over 1,500 words must include at least one inline body image** placed roughly 30-40% of the way through. This breaks the text wall at the point where readers start scrolling rather than reading.
2. **Posts over 2,500 words need a second inline image** at the 70% mark.
3. **Source: Pexels.com (free, commercial-use, no attribution required).** Search terms should be specific to the article topic (e.g. "data center" for migration articles, "boardroom" for governance articles, "financial reports" for finance articles).
4. **No people imagery unless their faces are obscured or out of frame.** Per BRAND.md: real photos of Noel only when a human is shown.
5. **Use raw `<img>` tags** in MDX (not next/image) for Pexels URLs. The MdxBody renderer styles them with rounded-xl + papaya border automatically.

### Diagrams (when they earn their place)

Use the four diagram primitives in `src/components/article/diagrams/` when the topic is:
1. A comparison (Big Bang vs Phased) → `<compare-split>`
2. A timeline or phased sequence (SAP Activate phases) → `<stepper>`
3. A decision (Greenfield vs Brownfield vs Bluefield) → `<decision-tree>`
4. A statistic worth dwelling on → `<stat-block>`

Articles do NOT need a diagram when the topic is:
1. A short opinion (under 1,000 words)
2. A FAQ-style reference
3. Already supported by a table that covers the same comparison

### Implementation
- Diagram tags MUST be written on a single line in the MDX source. Multi-line `<stepper>\n  title="..."\n  steps="..."\n></stepper>` is treated as text by the markdown parser and the tag renders as escaped HTML in the page. Keep the entire opening tag on one line, even if it gets long.
- Inline SVG diagrams in MDX, styled with the Command Center tokens. Reuse components from `src/components/article/` where possible.
- Subtle scroll-reveal via the existing `FadeUp` wrapper. Diagrams reveal as the reader arrives at them.
- Animation is incidental. The diagram should make sense on first paint, not require the animation to read.
- Video (via Remotion) is reserved for thumbnail / intro reels, not inline article content. Use the `remotion-best-practices` skill when producing those.

### Diagram library to grow over time
Place reusable diagram components in `src/components/article/diagrams/`. Each component:
- Renders pure SVG, no external assets
- Accepts data via props so it can be reused across posts
- Uses Command Center tokens (papaya, corbeau, bone, cream)
- Includes an `aria-label` for accessibility

## Edit output format

When reviewing a post, return findings in this exact shape. Saves a round-trip.

### Must address (blockers)
Issues that violate banned patterns, factual inaccuracies, broken links, missing frontmatter, structural failures. Cannot ship without fixing. Each item lists the problem, the location (heading or line), and a concrete rewrite.

### Should address (quality)
Issues that hurt readability or signal generated content but do not block publishing. Lexical tells, paragraph-length monotony, repeated concepts, soft superlatives. Each item lists the problem and a concrete rewrite.

### Nice to have (polish)
Stylistic improvements, optional graphics, additional asides, better link text. Each item lists the opportunity, not a demand.

Concrete rewrites beat criticism. Don't say "this is verbose"; show the shorter version.

## Workflow

1. **Read the source material first.** If `experienceSource` is empty in frontmatter, stop. Ask Noel for source notes, a video transcript, or a project memory. Without source material, the post reads as generated and the rest of the edit is wasted work.
2. **Run the detection checklist.** Mark every flag.
3. **Categorise findings.** Must / Should / Nice.
4. **Apply Must-fixes directly.** Edit the MDX.
5. **Surface Should and Nice items as a list** under the commit message or PR description. Do not silently apply opinion-level changes.
6. **Verify after edit.** Re-read once more for rhythm and voice.
7. **Update `lastReviewed`** in frontmatter to today's date.

## What this SOP is not

- Not a writing guide for new posts from scratch. That is in VOICE.md and BRAND.md.
- Not a code style guide. That is in AGENTS.md.
- Not a SEO playbook. The bare minimum is in the SEO section above. Deeper SEO work is a separate review.
- Not a substitute for Noel reading the post. Every published post needs human review before merge.
