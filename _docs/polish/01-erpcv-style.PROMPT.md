# P-01 ERPCV polish — Sonnet execution prompt

Copy the entire prompt block below. Paste into Claude Code in the
`noeldcosta-web/` folder. Hit enter.

---

## The prompt

```
Apply the ERPCV style polish pass per the brief at _docs/polish/01-erpcv-style.md.

Context to read first (in this order):
1. CLAUDE.md (which auto-imports BRAND.md, VOICE.md, BUYER-CEO.md, DESIGN_SYSTEM.md, PRD.md)
2. _docs/polish/01-erpcv-style.md — the full brief, all 7 passes
3. AGENTS.md — read before writing any Next.js code
4. src/app/layout.tsx, src/app/globals.css — current font and CSS setup
5. src/components/Hero.tsx, AICapabilities.tsx, TrackRecord.tsx,
   ProblemStats.tsx, Services.tsx, Tools.tsx, Credentials.tsx,
   Testimonials.tsx, YouTubeSection.tsx, CTABanner.tsx, LogoScroll.tsx
   — quick scan to see existing patterns

Important context: the brief references Noel's ERPCV source code
extensively. The italic emphasis is NOT a separate serif font —
it is the same display font (Epilogue) at fontStyle: italic,
fontWeight: 300, color: var(--cc-canyon). Do NOT add Fraunces or
any other serif font. Use the existing display font.

Tasks to complete in order:

PASS 1 — Italic emphasis on section headlines

1. Add the .cc-emphasis-italic utility class to globals.css per
   the brief.
2. Update each section component listed in the brief's table:
   ProblemStats, AICapabilities, TrackRecord, Tools, Credentials,
   Testimonials, YouTubeSection. For each, find the section
   headline and wrap the emphasized clause in
   <span className="cc-emphasis-italic">...</span>.
   Remove any existing two-color treatment if it conflicts (the
   class should provide the canyon color directly).
3. Verify each section eyebrow ([ 02 · AI CAPABILITIES ] etc) is
   unchanged.
4. Do NOT touch the Hero headline. Do NOT touch the final CTA headline.

PASS 2 — Pulse-dot eyebrow on hero

5. In Hero.tsx, replace the current text-only eyebrow with the
   pulse-dot + mono caps label pattern from the brief.
6. Add the @keyframes cc-pulse-dot animation and .cc-pulse-dot class
   to globals.css if not already present. Include the
   prefers-reduced-motion override.

PASS 3 — Grid texture backgrounds

7. Add the .cc-grid-faint utility class to globals.css per the brief.
8. Apply .cc-grid-faint to the Hero outer section wrapper. Verify
   it sits behind cc-glow-warm.
9. Inside CTABanner.tsx, add the inline grid texture div per the
   brief — corbeau lines at 0.1 opacity, 40px size — placed inside
   the orange block before the content.

PASS 4 — Stats strip in the hero

10. In Hero.tsx, add the four-stat strip below the existing
    credibility line + LinkedIn icon row. Use the inline-styled
    pattern from the brief. Stats: $700M+ delivered, 84 entities,
    25 years, 5 continents.
11. Verify mobile behavior: stats wrap, dividers hide on narrow
    screens (use a class like `hidden md:block` on the divider).

PASS 5 — Device chrome on dashboard cards

12. AICapabilities.tsx (agent.erp card) — verify cc-card class is
    applied, border-radius is 16px, mono label has cc-cursor at end,
    border-top divider exists before footer. Add what's missing.
    Strengthen box-shadow per brief.
13. TrackRecord.tsx (programme.dashboard card) — same checks and
    fixes.

PASS 6 — Add FAQ section

14. Create src/components/FAQ.tsx as a 'use client' component
    using the state-toggle pattern from the brief (NOT
    <details>/<summary>). Use the seven FAQ items from the brief
    verbatim. Use ChevronDown and ChevronUp from lucide-react.
15. Import FAQ into src/app/[lang]/page.tsx. Place between
    <Testimonials /> and <CTABanner />.

PASS 7 — Logo wall (conditional)

16. Check if /public/logos/ contains SVG files for named clients.
    - If YES: update LogoScroll.tsx to render <img> tags per
      the brief. Apply opacity 0.8 default, 1.0 on hover.
    - If NO: leave LogoScroll.tsx unchanged. Add a TODO comment
      referencing F-09 in PRD.md. Report back to Noel.

Constraints (do not violate):
- Do not touch Hero.tsx other than Pass 2 (eyebrow) and Pass 4
  (stats strip).
- Do not change copy except adding the FAQ content.
- Do not change section ordering or routing.
- Do not modify CLAUDE.md, BRAND.md, VOICE.md, BUYER-CEO.md,
  BUYER-CONSULTANT.md, DESIGN_SYSTEM.md, PRD.md, or anything
  in _docs/.
- All animations respect prefers-reduced-motion.
- All colors via --cc-* tokens. No hardcoded hex except for
  the documented patterns from ERPCV (rgba grid line colors).
- Match existing codebase patterns (lang prop convention, import
  style, Tailwind + CSS class hybrid).
- Do NOT add any new font dependencies. Use the existing display
  font in italic + weight 300 for emphasis.
- If lucide-react ChevronUp/ChevronDown is unavailable, use
  inline SVG.

When done:

1. Run npm run build. Confirm it builds with no errors.
2. Self-check against acceptance criteria in the brief. Report
   pass/fail per item.
3. Report back with:
   - Files changed (with line counts)
   - Build output summary
   - Acceptance criteria results
   - Anything you flagged or had to deviate from
   - Whether F-09 logos were available (if not, this remains pending)
   - Any visual regression risks Noel should test for

Do not commit. Do not push. Stop at the report.

If a step is blocked by missing context, missing assets, or
unclear spec, stop and ask. Don't guess.
```

---

## After Sonnet runs

1. Read Sonnet's report.
2. `npm run dev` and review at desktop and mobile.
3. Verify each pass:
   - Pass 1: Section headlines have italic light-weight canyon emphasis
   - Pass 2: Hero eyebrow has pulsing dot
   - Pass 3: Grid visible on hero (subtle) and final CTA (more visible)
   - Pass 4: Stats strip in hero — four numbers with dividers
   - Pass 5: Dashboard cards look more like real product mockups
   - Pass 6: FAQ appears before final CTA, click to expand works
   - Pass 7: Logo wall (if F-09 ready) or unchanged with TODO
4. If any pass fails, send back to Sonnet with specific feedback.
5. If all pass, commit:
   ```
   P-01: ERPCV style polish — italic emphasis, grid texture, pulse dot, stats, FAQ
   ```
6. Push. Vercel rebuilds. Verify on the deployed URL.
7. Update PRD.md — add a "Polish passes" section, mark P-01 `done`.

## What's next after P-01

Real backlog (in priority order):
1. Remove consultant card from Services.tsx (homepage = CEO-only)
2. Add "What I believe" section per BRAND.md (the differentiator)
3. F-09 logo sourcing (if not done during P-01)
4. Real YouTube thumbnails in YouTubeSection
5. "Featured on" press strip in Credentials
6. Then secondary pages: /for-consultants, /about
