# P-02 Hero match — Sonnet prompt

Copy block below, paste into Claude Code in `noeldcosta-web/`.

---

```
Read _docs/polish/02-hero-match.md in full. Then read AGENTS.md.

Apply the eight changes specified in the brief, in order. Each change has:
- The current code (wrong)
- The replacement code (exact)
- Filenames

Use the inline styles in the brief verbatim. Do not "improve" them.
Do not add Tailwind classes back. Do not change values like "32px to 24px".

Files you will touch:
1. src/components/Hero.tsx — changes 1, 2, 3, 4, 5, 6, 7
2. src/components/Nav.tsx — change 8
3. src/app/globals.css — add cc-pulse-dot keyframes and class if missing

Files you will NOT touch:
- Anything else
- BookCallButton.tsx (its internals stay)
- Any section component below the hero
- _docs/, BRAND.md, VOICE.md, BUYER-CEO.md, DESIGN_SYSTEM.md, PRD.md, CLAUDE.md

Constraints:
- Inline styles only on h1, sub, CTAs, eyebrow, headshot card, nav links.
  Do not mix with Tailwind text size or color classes on these elements.
- Calendly popup: keep BookCallButton wrapper. The brief shows a plain
  <a> tag for the primary CTA — wrap it in BookCallButton if the
  popup behavior is required, OR keep as plain <a> if the brief's
  intent is direct external link. Read the existing Hero.tsx to see
  current pattern, match it. If unsure, ask.
- prefers-reduced-motion respected.
- No new dependencies.

When done:
1. npm run build — must succeed.
2. Self-check the acceptance criteria from the brief, item by item.
3. Report back:
   - Files changed with line counts
   - Build output
   - Acceptance criteria pass/fail
   - One screenshot description: "On 1280px viewport, the hero h1
     wraps onto X lines, the headshot card is on the right, the
     italic emphasis renders in canyon color"
   - Any deviation from the brief and the reason

Do not commit. Do not push. Stop at the report.

If a current file pattern conflicts with a brief instruction, stop
and ask which to follow.
```

---

## After Sonnet runs

1. Open noeldcosta-com.vercel.app side by side with erpcv.com
2. Compare hero typography
3. If h1 weight, size, line-height, italic emphasis match — done
4. If not — tell me what's still off, I revise the brief
5. Commit message: `P-02: hero match ERPCV — h1, eyebrow, CTAs, nav, headshot`
