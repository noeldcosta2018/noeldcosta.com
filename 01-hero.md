# H-01 — Hero section brief

This is the brief Sonnet executes against to refactor
`src/components/Hero.tsx`. Read this file plus CLAUDE.md (which
imports BRAND.md, VOICE.md, BUYER-CEO.md, DESIGN_SYSTEM.md)
before starting.

The hero is the keystone of the homepage. Every other section
inherits its container width, vertical rhythm, type scale, and
CTA pattern. Get this right first.

---

## Purpose

The hero exists to do three things in under 8 seconds for a CEO
buyer who's never heard of Noel:

1. Tell them what this site is. (Senior ERP/AI advisor. Personal
   brand, not a firm.)
2. Show them why this site is different. (Names. Numbers. Finance
   depth. Not subcontracted.)
3. Give them one obvious next step. (Book a 30-min call.)

If the buyer scrolls past the hero, the hero worked. If they bounce,
the hero didn't.

---

## Buyer alignment

Reference: `BUYER-CEO.md`.

The CEO buyer is scanning for:
- Logos / scale (handled by H-02 trust bar, but hinted in hero
  via named clients in the sub)
- Senior credibility (CIMA, AICPA, 25 years)
- Independence (personal brand, not a firm)
- Direct involvement ("I lead. I don't subcontract.")
- A clear next step (one primary CTA)

What they're NOT looking for in the hero:
- Product features (this isn't a SaaS site)
- Career advice (wrong audience)
- AI capability detail (comes later at H-08)
- Tools (comes later at H-09)

---

## Acceptance criteria

The hero is `done` when all of the below are true:

- [ ] Headline reads in under 2 seconds. One line on desktop,
      max two lines on mobile.
- [ ] Subhead surfaces at least 2 named clients and 1 hard number.
- [ ] Primary CTA is "Book a 30-min call" → links to
      `https://calendly.com/noeldcosta/30min`.
- [ ] Secondary CTA is "See case studies" → links to
      `/case-studies/`.
- [ ] Headshot present on desktop (right side, medium size).
      Hidden on mobile or moved below fold.
- [ ] Below the headline+sub block, a single quiet credibility
      line: "CIMA · AICPA · Masters in Accounting · 25+ years"
      (or close variant per copy spec).
- [ ] No ticker animation in the hero itself (the achievement
      ticker that's currently above the headline gets removed —
      tickers belong in H-02, not H-01).
- [ ] Section uses page background (`--cc-page-bg` /
      `var(--brand-bone)`).
- [ ] All copy passes VOICE.md checklist (sentence-case, first
      person, no em-dash drama patterns, no banned buzzwords).
- [ ] All colors use `--cc-*` tokens. No hardcoded hex.
- [ ] Renders correctly at 375px, 768px, 1024px, 1280px, 1920px.
- [ ] Lighthouse mobile performance score ≥ 90 for the homepage
      with this hero in place.
- [ ] No layout shift on load (CLS < 0.1).
- [ ] Headshot loads with `next/image` and proper width/height,
      with `priority` set since it's above the fold.
- [ ] No `'use client'` on the Hero component itself. It's static.
- [ ] The 8-second test: a non-Noel reviewer can answer "what does
      this site do?" within 8 seconds of first paint.

---

## Copy specification

Use these exact words. Don't paraphrase. Edits to wording must come
back to Opus, not happen at execution time.

### Eyebrow / kicker (small label above headline)

```
ERP · AI · 25 years
```

Style: small, uppercase or sentence-case, papaya accent color,
letter-spacing 0.05em. Sits ~12px above the headline.

### Headline (h1)

```
I run ERP transformations the board can defend.
```

One sentence. No em-dash. No buzzwords. First person. Direct.

Why this works:
- "I run" — first person, ownership signal
- "ERP transformations" — exactly what the buyer is buying
- "the board can defend" — the buyer's actual fear (career risk)
  surfaced in the headline

### Sub-headline

```
ECC to S/4HANA. AI on SAP. 25 years delivering for EDGE Group ($60M saved), Etihad Airways ($400M+ impact), ADNOC, PIF entities, and the UAE Government. CIMA-qualified. I lead the engagement. I don't subcontract.
```

Length: ~45 words. Slightly longer than typical because it's doing
heavy lifting for a CEO buyer who scans.

Why this works:
- "ECC to S/4HANA. AI on SAP." — names exactly what they're buying
- "$60M saved" and "$400M+ impact" — hard numbers, specific clients
- "EDGE Group, Etihad Airways, ADNOC, PIF entities, UAE Government"
  — five named clients in the GCC public/enterprise sphere
- "CIMA-qualified" — the finance differentiator
- "I lead the engagement. I don't subcontract." — directly addresses
  the "we got the senior partner in the pitch then never again"
  fear from BUYER-CEO.md

### Primary CTA

```
Book a 30-min call
```

Links to: `https://calendly.com/noeldcosta/30min`
External link. `target="_blank"` and `rel="noopener noreferrer"`.

### Secondary CTA

```
See case studies
```

Links to: `/{lang}/case-studies/` (use the lang segment from
the URL).

### Credibility line (below CTAs)

```
CIMA · AICPA · Masters in Accounting · 25+ years across EDGE Group, Etihad, ADNOC, PIF entities, DXC, and the UAE Government
```

Smaller text. Muted color (`--cc-text-muted`). The "·" separators
in papaya (`--cc-accent`).

### What does NOT go in the hero

Not in scope for H-01:
- The achievement ticker ("SAP S/4HANA · ECC Migration LIVE · EDGE
  Group · 25 Entities → 1 ERP · $60M SAVED · ..." rotating strip)
  — moves to H-02 area or is removed entirely
- Client logo wall — that's H-02
- "Featured on SAP Press, MSN, LinkedIn, IPS" badges — that's
  H-11 (Credentials) or footer
- AI capability cards — that's H-08
- Stats blocks — that's H-03
- A scroll cue arrow / "scroll to explore" — unnecessary

---

## Layout — desktop (≥ 1024px)

```
┌──────────────────────────────────────────────────────────────┐
│  [Nav — handled by H-14]                                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   max-w-7xl container, px-8, py-32                           │
│   ┌─────────────────────────────────┬──────────────────┐     │
│   │                                 │                  │     │
│   │  ERP · AI · 25 YEARS            │   ┌──────────┐   │     │
│   │  (eyebrow, papaya, sm)          │   │          │   │     │
│   │                                 │   │   HEAD-  │   │     │
│   │  I run ERP transformations      │   │   SHOT   │   │     │
│   │  the board can defend.          │   │          │   │     │
│   │  (h1, text-6xl/7xl, display)    │   │  ~360px  │   │     │
│   │                                 │   │   square │   │     │
│   │  ECC to S/4HANA. AI on SAP.     │   │          │   │     │
│   │  25 years delivering for...     │   │ rounded- │   │     │
│   │  (sub, text-lg, text-body)      │   │ 2xl      │   │     │
│   │                                 │   │          │   │     │
│   │  [Book a 30-min call] [Cases]   │   └──────────┘   │     │
│   │  (primary)         (secondary)  │                  │     │
│   │                                 │                  │     │
│   │  CIMA · AICPA · 25+ years...    │                  │     │
│   │  (credibility line, sm, muted)  │                  │     │
│   │                                 │                  │     │
│   └─────────────────────────────────┴──────────────────┘     │
│                                                              │
│   12-column grid:                                            │
│   - Left content: cols 1-7  (7 of 12)                        │
│   - Right headshot: cols 9-12 (4 of 12, with col 8 as gutter)│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Vertical rhythm:
- `py-32` on desktop (128px top and bottom)
- Eyebrow → headline: 16px gap
- Headline → sub: 24px gap
- Sub → CTAs: 32px gap
- CTAs → credibility line: 24px gap

Optional decorative layer:
- `.cc-glow-warm` radial gradient behind the eyebrow/headline
  (subtle papaya glow). Pseudo-element or absolute-positioned div
  with `pointer-events: none` and low opacity.

---

## Layout — tablet (768px – 1023px)

Same structure as desktop but headshot scales down to ~280px
square. Headline drops to `text-5xl`. `py-24` instead of `py-32`.

---

## Layout — mobile (< 768px)

```
┌────────────────────────────┐
│  [Nav — H-14, hamburger]   │
├────────────────────────────┤
│                            │
│  px-6, py-16               │
│                            │
│  ERP · AI · 25 YEARS       │
│  (eyebrow)                 │
│                            │
│  I run ERP                 │
│  transformations the       │
│  board can defend.         │
│  (h1, text-4xl)            │
│                            │
│  ECC to S/4HANA. AI on...  │
│  (sub, text-base)          │
│                            │
│  [Book a 30-min call]      │
│  (full-width primary)      │
│                            │
│  See case studies →        │
│  (text link, secondary)    │
│                            │
│  CIMA · AICPA · ...        │
│  (credibility, text-xs)    │
│                            │
└────────────────────────────┘
```

Mobile rules:
- Hide the headshot. Don't stack it above or below — just hide.
  The hero needs to be tight on mobile and the headshot adds
  vertical noise.
- Primary CTA becomes full-width.
- Secondary CTA becomes a text link (no border).
- Credibility line wraps to multiple lines. Acceptable.
- Headline drops to `text-4xl` (about 36px). May need to wrap to
  3 lines — that's OK.

---

## Component refactor spec

### File to refactor
`src/components/Hero.tsx`

### Imports needed
- `Image` from `next/image`
- `Link` from `next/link`
- Possibly nothing else. Keep dependencies minimal.

### Props
The hero is a static component with hardcoded copy (per the copy
spec above). Don't add props. Don't make it configurable. If we
need a variant later we can refactor.

### Component structure (pseudo-code)

```tsx
export default function Hero({ lang }: { lang: string }) {
  return (
    <section className="relative bg-[var(--cc-page-bg)] py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Optional: decorative glow */}
      <div className="absolute inset-0 cc-glow-warm pointer-events-none opacity-50" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Content — left 7 cols */}
          <div className="lg:col-span-7">
            {/* Eyebrow */}
            <p className="text-sm font-medium tracking-wider text-[var(--cc-accent)] mb-4">
              ERP · AI · 25 years
            </p>

            {/* Headline */}
            <h1 className="cc-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-[var(--cc-text-primary)] leading-tight mb-6">
              I run ERP transformations the board can defend.
            </h1>

            {/* Sub */}
            <p className="text-base md:text-lg text-[var(--cc-text-body)] leading-relaxed max-w-2xl mb-8">
              ECC to S/4HANA. AI on SAP. 25 years delivering for{' '}
              <strong className="font-semibold text-[var(--cc-text-primary)]">EDGE Group</strong>{' '}($60M saved),{' '}
              <strong className="font-semibold text-[var(--cc-text-primary)]">Etihad Airways</strong>{' '}($400M+ impact),{' '}
              <strong className="font-semibold text-[var(--cc-text-primary)]">ADNOC</strong>,{' '}
              <strong className="font-semibold text-[var(--cc-text-primary)]">PIF entities</strong>, and the{' '}
              <strong className="font-semibold text-[var(--cc-text-primary)]">UAE Government</strong>. CIMA-qualified. I lead the engagement. I don't subcontract.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <a
                href="https://calendly.com/noeldcosta/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-[var(--cc-accent)] text-white font-medium hover:bg-[var(--cc-accent-hover)] transition-colors"
              >
                Book a 30-min call
              </a>
              <Link
                href={`/${lang}/case-studies`}
                className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-transparent text-[var(--cc-text-primary)] border border-[var(--cc-card-border)] font-medium hover:bg-[var(--cc-surface)] transition-colors"
              >
                See case studies
              </Link>
            </div>

            {/* Credibility line */}
            <p className="text-sm text-[var(--cc-text-muted)] leading-relaxed">
              CIMA <span className="text-[var(--cc-accent)]">·</span> AICPA{' '}
              <span className="text-[var(--cc-accent)]">·</span> Masters in Accounting{' '}
              <span className="text-[var(--cc-accent)]">·</span> 25+ years across EDGE Group, Etihad, ADNOC, PIF entities, DXC, and the UAE Government
            </p>
          </div>

          {/* Headshot — right 4 cols, hidden on mobile */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="relative aspect-square max-w-md ml-auto rounded-2xl overflow-hidden cc-hero-card">
              <Image
                src="/headshot.png"
                alt="Noel D'Costa"
                fill
                priority
                sizes="(min-width: 1024px) 360px, 0px"
                className="object-cover"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
```

This is pseudo-code, not literal. Sonnet should match the existing
codebase patterns (existing Hero.tsx may already have a different
structure, imports, helpers — match those). The key is:

- Section wrapper with page bg
- Grid: content left, headshot right
- Static rendering, no client-side hooks needed
- All colors via `--cc-*` tokens

### Lang prop

The `[lang]` segment in the URL means components in
`src/app/[lang]/page.tsx` receive a `lang` param. The Hero needs
that prop to build the case studies link correctly.

If the existing Hero.tsx doesn't take a lang prop, refactor
`src/app/[lang]/page.tsx` to pass it down, OR have Hero pull it
from `usePathname()` (would require `'use client'`, which we want
to avoid). Pass it as a prop.

---

## Design tokens used

All colors via `--cc-*` tokens, no hardcoded hex:

- Background: `--cc-page-bg`
- Headline color: `--cc-text-primary`
- Body color: `--cc-text-body`
- Eyebrow color: `--cc-accent`
- Bold names in sub: `--cc-text-primary` (font-weight 600)
- Primary CTA bg: `--cc-accent`, hover `--cc-accent-hover`
- Primary CTA text: white
- Secondary CTA border: `--cc-card-border`
- Secondary CTA hover bg: `--cc-surface`
- Credibility line: `--cc-text-muted`
- Separator dots in credibility: `--cc-accent`
- Headshot card shadow: `cc-hero-card` class (the papaya glow shadow)

Fonts:
- Eyebrow: `var(--font-sans)` (Inter), font-weight 500
- Headline: `var(--font-display)` (Epilogue) via `.cc-display` class
- Sub: `var(--font-sans)` (Inter), font-weight 400
- CTAs: `var(--font-sans)`, font-weight 500
- Credibility: `var(--font-sans)`, font-weight 400

---

## Assets needed

- `/public/headshot.png` — already exists in the current build
  (referenced in current Hero.tsx as `/headshot.png`). Reuse.
  Don't replace unless Noel provides a new one.

If the existing headshot isn't optimized, Sonnet can flag it.
Don't auto-replace.

---

## Animations

The hero should be quiet. No scroll-triggered animations. No
auto-play tickers. No typewriter effects.

The only allowed motion:
- CTA hover transitions (background color, 150ms ease-out)
- Optional subtle entry: `cc-fade-row` on the content stack
  (single 0.6s fade-up on first paint). Only if it doesn't
  cause CLS.
- `cc-glow-warm` is static, not animated.

---

## Out of scope for H-01

Do not include in this section:
- Client logos or trust bar (that's H-02)
- The achievement ticker that currently sits above the headline
  on the live Vercel build (remove it; it goes elsewhere or
  not at all)
- Stats blocks ("70% of ERP projects fail" — that's H-03)
- "Featured on" press logos (that's footer or H-11)
- AI capability mentions beyond the headline reference
- Newsletter signup
- Language switcher (that's nav)

---

## What this section unlocks

Once H-01 is `done`:

- H-02 through H-15 can begin (they all depend on H-01)
- The container width pattern (`max-w-7xl mx-auto px-6 md:px-8`)
  is locked for all subsequent sections
- The eyebrow style for "[ 02 · The problem ]" labels is locked
- The CTA button styles are locked and reused everywhere
- The vertical rhythm (`py-16 md:py-24 lg:py-32`) is locked
- The headshot pattern is reused on About page

If something feels wrong about the hero, fix it now. Every section
that follows inherits.

---

## Sonnet execution prompt template

When ready to execute, run this prompt in Claude Code:

> Read PRD.md task H-01. Read `_docs/homepage/01-hero.md` in full.
> Refactor `src/components/Hero.tsx` per the spec.
>
> Match the existing codebase patterns (check current imports,
> styling approach, use of next/image, lang prop pattern).
>
> Use exact copy from the brief. Do not paraphrase.
>
> When done:
> 1. Run `npm run build` and confirm it builds.
> 2. Self-check against the acceptance criteria in the brief.
> 3. Report back with:
>    - The diff (what you changed)
>    - Build output (success or errors)
>    - Acceptance criteria pass/fail per item
>    - Anything you flagged or had to deviate from
>
> Do not change architecture or routing. Do not modify other
> components. Do not change CLAUDE.md, BRAND.md, VOICE.md, or
> DESIGN_SYSTEM.md. If something blocks you, stop and ask.

---

## Definition of done

H-01 is `done` when:

1. All acceptance criteria above pass.
2. The component builds and renders with no console errors.
3. Noel has reviewed in browser at desktop and mobile widths.
4. The change is committed and pushed.
5. PRD.md is updated to mark H-01 status as `done`.
