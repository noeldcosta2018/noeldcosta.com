# Mobile responsiveness audit — 2026-05-24

Read-only code audit per `_docs/audits/_prompts/audit-1-mobile.md`. No browser/Playwright session was run in this environment (Windows shell, no Node dev server brought up). All findings derived from static reading of `src/components/`, `src/app/[lang]/`, `src/app/globals.css`. Anything that requires a real viewport to confirm is called out in the "Couldn't verify without a browser" section.

## Breakpoint strategy

- No `tailwind.config.*` exists. Tailwind v4 is configured via `@import "tailwindcss"` + `@theme` block in [src/app/globals.css:1](src/app/globals.css:1). No custom breakpoints — defaults apply: `sm:640`, `md:768`, `lg:1024`, `xl:1280`, `2xl:1536`.
- Mobile-first responsive classes used across the codebase: `sm:`, `md:`, `lg:`, plus the `max-md:` / `max-lg:` / `max-sm:` variants on several components. Mixing both directions is fine but makes intent harder to read in a few places (e.g. `ProblemStats.tsx`, `Footer.tsx`).
- One global flag set in [src/app/globals.css:509](src/app/globals.css:509): `body { overflow-x: hidden }`. See finding HIGH-2.
- Body text default is `15px` ([globals.css:510](src/app/globals.css:510)), below the 16-px mobile-readability floor the audit calls for. See finding HIGH-1.
- A number of components hard-code typography via inline `style={{ fontSize: ... }}` rather than Tailwind classes, which makes the breakpoint story inconsistent — `Hero.tsx`, `Nav.tsx`, `CategoryPage.tsx`, `StickyCTA.tsx` are the main offenders.

## Components with no responsive classes (suspects)

Checked all of `src/components/*.tsx`. The following carry zero `sm:`/`md:`/`lg:` or `max-*:` variants. Most are intentionally simple, but each needed a closer look:

- [BrandWordmark.tsx](src/components/BrandWordmark.tsx) — pure SVG, scales by `height` prop. OK.
- [Ticker.tsx](src/components/Ticker.tsx) — continuous marquee inside `overflow-hidden`. OK on layout, see LOW-1.
- [LogoScroll.tsx](src/components/LogoScroll.tsx) — same pattern. OK.
- [StickyCTA.tsx](src/components/StickyCTA.tsx) — fixed-position pill at `bottom:28; right:28`. See MED-3.
- [TerminalFeed.tsx](src/components/TerminalFeed.tsx) — small interior block, sized by parent.

---

## Findings

Severity ranking is from worst to least bad within each block. File:line links are clickable.

### Critical

None. There is no component that would render unusably at 375 px, nor any that breaks the page layout entirely. The critical-severity bucket is empty.

### High

#### HIGH-1 — Body text is 15 px on every viewport

- **Where:** [src/app/globals.css:510](src/app/globals.css:510) — `body { font-size: 15px; line-height: 1.6 }`
- **Breakpoint:** all breakpoints (base style, no mobile override)
- **What breaks:** The audit calls for a 16-px minimum body size on mobile; 15 px is the global default and most components inherit it (Hero subhead is the only one that explicitly bumps to 16 px). 15 px on a 375-px viewport is borderline legible at arm's length and trips most accessibility heuristics.
- **Suggested fix:** Raise the base body to 16 px, then re-tune individual components that look too large.

#### HIGH-2 — `body { overflow-x: hidden }` masks underlying overflow

- **Where:** [src/app/globals.css:509](src/app/globals.css:509)
- **Breakpoint:** all
- **What breaks:** It is a band-aid that hides any horizontal overflow caused by individual sections, so we cannot tell from this audit whether the page is actually overflow-clean at 375 px. Real overflow bugs become invisible during development.
- **Suggested fix:** Remove it, fix root causes (likely the marquees and the dashboard mockups), keep `overflow-hidden` scoped to the marquee containers only.

#### HIGH-3 — MDX tables use `overflow-hidden` + `table-fixed`, no horizontal scroll on mobile

- **Where:** [src/components/mdx/MdxBody.tsx:200-206](src/components/mdx/MdxBody.tsx:200) — `<FadeUp as="figure" className="not-prose my-10 overflow-hidden ...">` wrapping `<table className="w-full table-fixed text-[0.78rem] md:text-[0.9rem]">`
- **Breakpoint:** < `md` (768 px). Confirmed pattern, not viewport-verified.
- **What breaks:** GFM tables in blog MDX (the renderer cited as the styled-table path in `blog-editor.md`) cap at viewport width and squish all columns into the available space. Three- or four-column tables become unreadable on a 375-px screen because `table-fixed` distributes width evenly with no min-column-width.
- **Suggested fix:** Replace `overflow-hidden` on the figure with `overflow-x-auto`, drop `table-fixed` and let columns size to content, or wrap the `<table>` in an inner scroll container.

#### HIGH-4 — Hero headshot is desktop-only, no mobile alternative

- **Where:** [src/components/Hero.tsx:210](src/components/Hero.tsx:210) — `<div className="hidden lg:block lg:col-span-6">`
- **Breakpoint:** < `lg` (< 1024 px)
- **What breaks:** Per `BUYER-CEO.md`, the buyer scans for a real human face. On mobile and tablet, the hero shows none. This is a content/brand issue surfaced via layout (no fallback image, no smaller framed shot above the headline). Bigger impact than it looks because mobile is a meaningful share of traffic.
- **Suggested fix:** Add a smaller framed headshot above the headline at `< lg`, or a small inline avatar next to the eyebrow line. Don't just drop the desktop frame onto mobile — the 4:5 ratio dominates the fold.

#### HIGH-5 — PostPage breadcrumb truncates the post title aggressively on mobile

- **Where:** [src/components/PostPage.tsx:128-133](src/components/PostPage.tsx:128) — `<li ... className="text-corbeau/60 truncate max-w-[200px] md:max-w-[360px]">`
- **Breakpoint:** < `md` (truncates at 200 px)
- **What breaks:** At 375 px with 24 px outer padding the title is forcibly cut to 200 px. Most blog titles are longer than that, so the user lands on an article and the breadcrumb says "ECC to S/4HANA Migration: A Co…" with no way to see the rest. Hurts orientation, not just aesthetics.
- **Suggested fix:** Drop the per-page title from the breadcrumb on mobile (keep Home / Category only), or replace the truncate with two-line wrap.

#### HIGH-6 — TrackRecord sticky dashboard does not work on mobile/tablet single-column layout

- **Where:** [src/components/TrackRecord.tsx:218-220](src/components/TrackRecord.tsx:218) — dashboard panel has `sticky top-[84px]` but at `max-lg` the grid collapses to one column ([line 189](src/components/TrackRecord.tsx:189): `grid-cols-2 ... max-lg:grid-cols-1`), so the dashboard renders *below* the entire project list.
- **Breakpoint:** < `lg` (< 1024 px)
- **What breaks:** The IntersectionObserver still updates the active project as the user scrolls through the list, but the dashboard panel that should reflect that state lives below all five rows and is already off-screen. The user never sees the swap that the component is built around. The whole interaction reduces to a static dashboard for the last project.
- **Suggested fix:** Either disable the sticky observer behaviour at `< lg` and render the dashboard above the list, or pair each project row with its own inline mini-dashboard on mobile.

#### HIGH-7 — Hero headline relies on flex-wrap of per-word spans with a non-zero gap

- **Where:** [src/components/Hero.tsx:61-98](src/components/Hero.tsx:61) — h1 is `display: flex; flex-wrap: wrap; gap: '0.22em'` with each of four words plus the italic clause as separate spans.
- **Breakpoint:** ~375 px (suspected)
- **What breaks:** At 375 px the clamp floor is 36 px. "I run ERP transformations" is 4 words, the italic span "the board can defend." adds a fifth. With per-word animation delays and inline-block spans, the words break across lines in places a normal h1 would not (e.g. "I" alone on a line). This is a layout-fragility issue, not a hard break — the fact that it relies on flex-wrap of spans (instead of `display: block` with `text-wrap: balance`) means small font-metric differences across browsers can produce ugly line breaks. Couldn't confirm without a browser.
- **Suggested fix:** Render the headline as plain text inside the h1 (one text node), apply the per-word stagger via a CSS animation on the parent, and let normal text-wrap handle line breaks.

### Medium

#### MED-1 — Hero side padding is fixed at 24 px on mobile and never scales

- **Where:** [src/components/Hero.tsx:43](src/components/Hero.tsx:43) — `padding: '40px 24px 48px'` (inline style, no responsive token)
- **Breakpoint:** all (but only noticeable on mobile vs. the rest of the page)
- **What breaks:** Every other section uses `clamp(1.5rem,5vw,4rem)` for side padding (24 → 64 px). The hero is fixed at 24 px. At 375 px this matches the rest; at 768 px the rest of the page has ~38 px margins while the hero still has 24 px, so the hero content sits slightly wider than the section below it.
- **Suggested fix:** Replace the inline padding with the same `clamp(1.5rem,5vw,4rem)` token used by the other sections.

#### MED-2 — Sticky terminal panel in AICapabilities has the same single-column issue as TrackRecord

- **Where:** [src/components/AICapabilities.tsx:115](src/components/AICapabilities.tsx:115) — `sticky top-[84px]` on the right-column terminal mockup; outer grid is `grid-cols-2 ... max-lg:grid-cols-1`.
- **Breakpoint:** < `lg`
- **What breaks:** Same shape as HIGH-6 but the interaction is dumber — the terminal mockup is static, so the sticky position just means it sits awkwardly under the feature list and doesn't move. No real swap to lose, but the panel adds vertical length without payoff and the `max-w-[500px]` keeps it from filling the column.
- **Suggested fix:** Remove `sticky top-[84px]` at `< lg`, drop the `max-w-[500px]` constraint so the panel fills the column.

#### MED-3 — Sticky "Book consultation" pill can obscure mobile content

- **Where:** [src/components/StickyCTA.tsx:14-44](src/components/StickyCTA.tsx:14) — `position: fixed; bottom: 28; right: 28; z-index: 50`
- **Breakpoint:** all (only annoying on mobile)
- **What breaks:** On 375 × 667 the pill covers roughly 150 × 44 of the bottom-right corner. It can sit over the primary CTA on CTABanner and Hero, and overlaps the Footer's social icons. Plus the StickyCTA appears *and* the page-level "Book a 30-min call" CTAs are present, doubling the same offer.
- **Suggested fix:** Hide the StickyCTA when the in-page CTABanner is in view (IntersectionObserver), or hide it on mobile entirely and rely on the in-page CTAs.

#### MED-4 — Nav desktop menu is crowded between 768 and ~900 px

- **Where:** [src/components/Nav.tsx:159](src/components/Nav.tsx:159) — `<ul className="hidden md:flex items-center gap-6">` shows Solutions / Tools / Case Studies / Books / About / Contact at `md+`.
- **Breakpoint:** 768–~900 px
- **What breaks:** At 768 px the right side of the nav has six items (two with dropdown carets) plus the orange Contact pill, all in `gap-6` (~24 px) — about 540 px of content fighting for ~620 px of available space after the wordmark. Items can wrap, push the Contact pill off, or jostle as fonts load.
- **Suggested fix:** Defer the desktop menu to `lg:` (1024+) and keep the burger up to that point. The dropdowns are non-trivial — a 768-px tablet user is still better served by the drawer.

#### MED-5 — `cc-scan-line` continuous animation runs unconditionally on TrackRecord and AICapabilities dashboard mockups

- **Where:** [src/app/globals.css:401-410](src/app/globals.css:401), used in [TrackRecord.tsx:222](src/components/TrackRecord.tsx:222) and [AICapabilities.tsx:116](src/components/AICapabilities.tsx:116)
- **Breakpoint:** all
- **What breaks:** Reduce-motion is respected ([globals.css:413-415](src/app/globals.css:413)) but on default mobile settings it runs at 4 s intervals indefinitely. Two scan-lines plus two `animate-pulse-dot` plus the logo-scroll and tick-scroll marquees means at least 6 concurrent loops on the homepage. Battery and CPU cost on entry-level Android is meaningful.
- **Suggested fix:** Gate the dashboard scan-lines on `(min-width: 1024px)` via CSS — they are mostly decorative for the desktop visual story.

#### MED-6 — VideoCarousel: prev/next arrows hidden on mobile, no edge mask visible

- **Where:** [src/components/VideoCarousel.tsx:139](src/components/VideoCarousel.tsx:139) — arrows are `hidden md:flex`; the edge-mask referenced in the docstring (line 14) is not actually applied in the JSX.
- **Breakpoint:** < `md`
- **What breaks:** Mobile users get native swipe (good) but no visual affordance that more cards exist past the right edge. The cards just clip abruptly at the viewport boundary because no `mask-image` is set on the scroller in this file. Discoverability hit, not a layout break.
- **Suggested fix:** Add the documented `mask-image: linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)` on the scroller, or render a small "swipe →" hint on first paint at `< md`.

#### MED-7 — Nav hamburger uses `☰` / `×` text glyphs, font-size 1.3 rem

- **Where:** [src/components/Nav.tsx:148-156](src/components/Nav.tsx:148)
- **Breakpoint:** all (only visible on `< md`)
- **What breaks:** Rendering varies between Android system font and iOS — `☰` shows as a thicker box on some Android builds, `×` reads as small "x" instead of the close glyph on others. Touch target is fine (`min-w-[44px] min-h-[44px]`); it's the icon legibility that's inconsistent.
- **Suggested fix:** Replace with an inline SVG (3-line hamburger and an X), matching the icon style used elsewhere from `lucide-react`.

#### MED-8 — Hero stat "border-r" between tiles disappears on mobile but inter-tile spacing might be too cramped

- **Where:** [src/components/Hero.tsx:187-204](src/components/Hero.tsx:187) — `max-md:flex-col max-md:divide-y max-md:divide-corbeau/[0.08]` with per-tile `pr-6 mr-6 max-md:pr-0 max-md:mr-0 max-md:py-3 max-md:first:pt-0`
- **Breakpoint:** < `md`
- **What breaks:** At `< md` the four stat tiles stack vertically with `py-3` (12 px) padding per row and a 1 px divider. So the strip eats about 4 × ~70 px = 280 px of vertical real estate on a 375-px-wide phone, all four stats far below the fold. The first paint shows the CTAs and credibility line but the stats are pushed off-screen. They are part of the credibility scan and should appear higher.
- **Suggested fix:** At `< md`, render the stats as a 2 × 2 grid instead of a 4-row vertical stack so they fit in roughly the same height as one full-width stat tile.

#### MED-9 — CategoryPage "About Noel" strip flexes into one row at `sm:` but contains four columns of content

- **Where:** [src/components/CategoryPage.tsx:589](src/components/CategoryPage.tsx:589) — `<div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">` with headshot + bio + credentials column + "Full bio →" link.
- **Breakpoint:** 640 px (sm) — visible at portrait tablets and large phones
- **What breaks:** At 640–768 px the four blocks compete for ~580 px of width. The credentials column ends up at ~180 px wide, the bio paragraph clamps to ~200 px, the "Full bio →" link sits squashed at the right edge. Layout is technically intact but reads poorly.
- **Suggested fix:** Step the flex-row direction to `lg:flex-row` instead of `sm:flex-row` so the row layout only kicks in when there is genuine width for it.

#### MED-10 — `LogoScroll.tsx` mask-image at 8/92 % cuts logos abruptly on a 375-px screen

- **Where:** [src/components/LogoScroll.tsx:32-38](src/components/LogoScroll.tsx:32)
- **Breakpoint:** < ~640 px
- **What breaks:** 8 % of 375 = ~30 px fade band. Logos are sized at `text-[0.95rem]` (~15 px), so the fade actually swallows about a third of a typical client name (e.g. "EDGE Group" cuts to "DGE Grou"). Marquee animation is intentional, but the fade math doesn't scale.
- **Suggested fix:** Widen the fade band to ~4 % on mobile via a media query, or replace the mask with a hard cut at `< sm`.

### Low

#### LOW-1 — Ticker has no mobile-specific concession

- **Where:** [src/components/Ticker.tsx:34-49](src/components/Ticker.tsx:34) — single-row marquee, no media query.
- **Breakpoint:** all
- **What breaks:** Nothing strictly. But the audit checklist (DESIGN_SYSTEM.md → "Mobile considerations") explicitly says "Hide tickers on mobile (cc-mask doesn't render well on narrow screens)." The ticker is still rendered on mobile on category pages and homepage.
- **Suggested fix:** Wrap in `hidden md:block`, or accept the design-system note is stale.

#### LOW-2 — Hero credibility line concatenates six items in one paragraph

- **Where:** [src/components/Hero.tsx:162-170](src/components/Hero.tsx:162) — "CIMA · AICPA · Masters in Accounting · 25+ years across EDGE Group, Etihad, ADNOC, PIF entities, DXC, and the UAE Government"
- **Breakpoint:** < `md` (most painful at 375 px)
- **What breaks:** At 375 px this paragraph wraps to ~6 lines of `text-sm` (~14 px) muted text below the CTAs. Not a layout break — it just adds vertical noise to the fold. The LinkedIn icon next to it has `flex-shrink-0` and gets bumped down to its own row, looking detached from the paragraph it belongs to.
- **Suggested fix:** Show only "CIMA · AICPA · Masters in Accounting" at `< md`, keep the client roll-call for `md+`.

#### LOW-3 — Services card padding `p-10` (40 px) is too generous at 375 px

- **Where:** [src/components/Services.tsx:29](src/components/Services.tsx:29) — `p-10`
- **Breakpoint:** < `lg` (single column, narrower card)
- **What breaks:** With 327 px usable on a 375-px screen minus 80 px of internal padding, the body text runs at ~247 px wide. Multi-line copy reads as a tall, narrow strip and the "01 / 02" eyebrow takes a third of the card's perceived width.
- **Suggested fix:** Step down to `p-6 md:p-10`.

#### LOW-4 — Hero CTAs `font-size: 14` inline does not scale up to body's preferred 16 px

- **Where:** [src/components/Hero.tsx:126](src/components/Hero.tsx:126) and [Hero.tsx:143](src/components/Hero.tsx:143) — both CTAs `fontSize: 14`
- **Breakpoint:** all
- **What breaks:** 14 px is on the small side for the primary action on a 375-px screen, especially when it is the orange/papaya CTA that the audience is being asked to tap. Touch target is fine (~44 px tall due to `padding: '12px 22px'`).
- **Suggested fix:** Bump CTA labels to 15–16 px on `< md`.

#### LOW-5 — Footer brand description capped at 280 px width

- **Where:** [src/components/Footer.tsx:45-48](src/components/Footer.tsx:45) — `max-w-[280px]`
- **Breakpoint:** all
- **What breaks:** At 375 px the footer falls to 1 column (`max-sm:grid-cols-1`). The body paragraph still respects the 280-px max-width, so it sits narrower than the section padding allows. Visual not functional.
- **Suggested fix:** Drop the max-width at `< sm`.

#### LOW-6 — Mobile-drawer link reveal stagger compounds with many items

- **Where:** [src/components/Nav.tsx:354-403](src/components/Nav.tsx:354) — 60 ms per item × ~17 items ≈ 1 s before the last link appears
- **Breakpoint:** `< md`
- **What breaks:** Slow visible reveal on the drawer's last few items. Not broken, just sluggish. Reduce-motion users get the global guard so they are unaffected.
- **Suggested fix:** Cap the stagger at 8 items, or step to 30 ms.

#### LOW-7 — Hero stats clamp to `1.4rem` (~22 px) on mobile

- **Where:** [src/components/Hero.tsx:196](src/components/Hero.tsx:196)
- **Breakpoint:** all
- **What breaks:** The four stat numbers ($700M+ / 84 / 25 yrs / 5) shrink to 22 px and lose the "scale of the work" emphasis that the section is supposed to deliver. Adequate, not striking.
- **Suggested fix:** Increase the clamp floor to `1.65rem` (~26 px).

#### LOW-8 — Mobile drawer pushes scroll-lock side effect via direct body style mutation

- **Where:** [src/components/Nav.tsx:13-22](src/components/Nav.tsx:13) — `document.body.style.overflow = "hidden"` on mount.
- **Breakpoint:** < `md`
- **What breaks:** Not a layout issue but flagging here: if another component is also writing `body.style.overflow` (none today) they conflict. The mount/unmount restore pattern is fine.
- **Suggested fix:** None for now — note for future maintainers.

#### LOW-9 — `Credentials.tsx` mobile 2-column layout draws an inconsistent vertical divider

- **Where:** [src/components/Credentials.tsx:95-115](src/components/Credentials.tsx:95) — `${i % 2 === 0 ? "max-md:pr-6 max-md:border-r max-md:border-corbeau/[0.1]" : ""}`
- **Breakpoint:** < `md`
- **What breaks:** Items 0 and 2 get a right border in the 2-column grid; items 1 and 3 don't. Visually consistent only if there are exactly 4 items. If the array changes length, the rule breaks asymmetrically.
- **Suggested fix:** Use `even:border-r` / `odd:border-r` instead of per-index calculation. Cosmetic.

#### LOW-10 — Form (ToolForm) has no `inputMode` / `autoComplete` hints

- **Where:** [src/components/tools/ToolForm.tsx:293-327](src/components/tools/ToolForm.tsx:293)
- **Breakpoint:** all (mobile-only impact)
- **What breaks:** Number inputs use `type="number"` which gets the right keypad. But text inputs don't carry `inputMode` or `autoComplete`, so a "company name" field still triggers the standard alphanumeric keyboard with autocorrect on iOS. Not a layout issue, but a mobile-form usability hit. There is no contact form in the codebase yet — the only `<form>` is the tool form.
- **Suggested fix:** Add `autoComplete="off"` and per-field `inputMode` once the contact form is built (S-09 in PRD).

---

## Counts by severity

- Critical: 0
- High: 7
- Medium: 10
- Low: 10
- **Total: 27**

## Top 5 fixes ranked by impact

1. **HIGH-1 — Base body 15 → 16 px.** One-line change in `globals.css`, lifts readability across every page on mobile. Re-tune any component that visibly grows after.
2. **HIGH-3 — Make MDX tables horizontally scroll instead of squish.** Single edit to `MdxBody.tsx`. Blog is the bulk of the SEO surface; readable tables matter for E-E-A-T.
3. **HIGH-6 — Fix TrackRecord dashboard on mobile.** The component as written delivers no value at `< lg`. This is the keystone of the homepage's credibility section, so a passive failure here hurts the 90-second scan story.
4. **HIGH-4 — Mobile Hero headshot.** Buyer profile (`BUYER-CEO.md`) explicitly calls out the face-on-the-page test. Currently absent on phones.
5. **HIGH-2 — Drop `body { overflow-x: hidden }`.** Surface any overflow bug that's currently hidden so it can actually be fixed.

## Couldn't verify without a browser

The following findings need a real viewport to confirm severity. They are reported above on the best read of the static code, but I'd downgrade or upgrade some after a Playwright run at 375 / 414 / 768.

- HIGH-7 — Hero per-word flex-wrap behaviour at exactly 375 px and exactly 414 px. The headline may render fine and the finding could move to LOW.
- MED-1 — Hero side padding mismatch vs. surrounding sections is most visible at 768 px, where it would shift content alignment by ~14 px. Worth eyeballing.
- MED-4 — Nav crowding at 768–900 px. Could be visually fine if font metrics fall under `gap-6`.
- MED-10 — LogoScroll mask cut percentage at 375 px. The math suggests a third of "EDGE Group" gets faded out, but the actual perceived effect depends on font kerning.
- LOW-1, LOW-7 — purely aesthetic; need to be seen.
- All Lighthouse-style metrics (touch target spacing in pixels measured, real horizontal scroll detection with `body { overflow-x: hidden }` lifted, image LCP and CLS on Hero) are out of scope of static reading.

## Notes

- No HTML `<table>` elements were found anywhere in `src/components/` outside of the MDX renderer. The only table risk is HIGH-3 (MDX blog content).
- No contact form exists yet in the routing tree — `/contact-noel-erp-support` is not present under `src/app/[lang]/`. The only `<form>` is `src/components/tools/ToolForm.tsx` (calculators). When the contact form is built (PRD S-09), apply the form rules from the audit prompt (full-width inputs, labels above, `type="email"`/`type="tel"`, full-width submit on mobile).
- Tailwind v4 (no `tailwind.config.*`) uses `@theme` in CSS. Anyone running this audit again should not look for the missing config file as a finding.
- The `[lang]` segment is being removed in PRD M-02. Routes that currently sit under `src/app/[lang]/*` will move to `src/app/*`. None of the findings above are made worse by that move.
