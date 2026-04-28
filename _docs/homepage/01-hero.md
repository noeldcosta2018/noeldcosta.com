# H-01 — Hero section brief

This is the brief Sonnet executes against to refactor
`src/components/Hero.tsx`. Read this file plus CLAUDE.md (which
imports BRAND.md, VOICE.md, BUYER-CEO.md, DESIGN_SYSTEM.md)
before starting.

The hero is the keystone of the homepage. Every other section
inherits its container width, vertical rhythm, type scale,
animation language, and CTA pattern. Get this right first.

---

## Purpose

The hero exists to do three things in under 8 seconds for a CEO
buyer who's never heard of Noel:

1. Tell them what this site is. (Senior ERP/AI advisor. Personal
   brand, not a firm.)
2. Show them why this site is different. (Names. Numbers. Finance
   depth. Not subcontracted.)
3. Give them one obvious next step. (Book a 30-min call — without
   leaving the page.)

If the buyer scrolls past the hero, the hero worked. If they bounce,
the hero didn't.

---

## Buyer alignment

Reference: `BUYER-CEO.md`.

The CEO buyer is scanning for: senior credibility (CIMA, AICPA),
named clients at scale, independence (personal brand not a firm),
direct involvement, and a clear next step.

What they're NOT looking for in the hero: product features, career
advice, AI capability detail, tool product cards.

---

## Acceptance criteria

The hero is `done` when all of the below pass:

- [ ] Headline reads in under 2 seconds. Max 1 line on desktop,
      max 2 lines on mobile.
- [ ] Subhead surfaces ≥ 2 named clients and ≥ 1 hard number.
- [ ] Primary CTA opens a Calendly popup widget in-page (not a
      new tab) when clicked. The widget loads on click, not on
      page load (lazy).
- [ ] Secondary CTA links to `/{lang}/case-studies/`.
- [ ] LinkedIn icon link present in hero (small, near credibility
      line) → `https://www.linkedin.com/in/noeldcosta/`.
- [ ] Headshot present on desktop only (right side, ~360px).
      Hidden on mobile.
- [ ] Quiet credibility line below CTAs (CIMA · AICPA · 25+ years).
- [ ] No achievement ticker in the hero. (Removed from current build.)
- [ ] Section uses `--cc-page-bg`.
- [ ] All copy passes VOICE.md (sentence-case, first person, no
      em-dash drama, no banned buzzwords).
- [ ] All colors use `--cc-*` tokens. No hardcoded hex.
- [ ] Page-level SEO meta is present (title, description, OG, Twitter,
      canonical, hreflang).
- [ ] Schema.org Person + ProfessionalService JSON-LD is rendered
      in the page head.
- [ ] Renders correctly at 375, 768, 1024, 1280, 1920 px widths.
- [ ] Lighthouse mobile performance ≥ 90 with this hero in place.
- [ ] CLS < 0.1 (no layout shift on load).
- [ ] Headshot uses `next/image` with `priority` and explicit
      width/height.
- [ ] No `'use client'` on Hero component itself. Only the Calendly
      popup wrapper is client (small, isolated).
- [ ] All animations respect `prefers-reduced-motion: reduce`.
- [ ] Keyboard navigable. CTAs focusable in tab order. Focus rings
      visible and on-brand.
- [ ] 8-second test: a non-Noel reviewer can answer "what does this
      site do?" within 8 seconds of first paint.

---

## Copy specification

Use exact words. Edits to wording come back to Opus, not at execution.

### Eyebrow / kicker

```
ERP · AI · 25 years
```

Style: small, sentence-case, papaya color, letter-spacing 0.05em.
~12px above headline.

### Headline (h1)

```
I run ERP transformations the board can defend.
```

### Sub-headline

```
ECC to S/4HANA. AI on SAP. 25 years delivering for EDGE Group ($60M saved), Etihad Airways ($400M+ impact), ADNOC, PIF entities, and the UAE Government. CIMA-qualified. I lead the engagement. I don't subcontract.
```

Bold the five client names: EDGE Group, Etihad Airways, ADNOC,
PIF entities, UAE Government.

### Primary CTA

```
Book a 30-min call
```

Behaviour: opens Calendly inline popup. URL backing the widget:
`https://calendly.com/noeldcosta/30min`

### Secondary CTA

```
See case studies
```

Links to: `/{lang}/case-studies/`

### Credibility line

```
CIMA · AICPA · Masters in Accounting · 25+ years across EDGE Group, Etihad, ADNOC, PIF entities, DXC, and the UAE Government
```

The "·" separators in papaya. Body text muted (`--cc-text-muted`).

### LinkedIn icon link

Small Lucide `Linkedin` icon, 18px, in `--cc-text-muted`.
Hover: `--cc-accent`. Sits inline at end of credibility line.

Aria label: "Noel D'Costa on LinkedIn"
Href: `https://www.linkedin.com/in/noeldcosta/`
target="_blank" rel="noopener noreferrer"

### What does NOT go in the hero

- Achievement ticker (current strip rotating "$60M SAVED · 25 Entities → 1 ERP")
- Client logo wall — H-02
- "Featured on SAP Press / MSN / LinkedIn" press strip — moves to
  H-11 (Credentials)
- AI capability cards — H-08
- Stat blocks (70% / $4.5M / 53%) — H-03
- Newsletter signup
- Tool/product cards (ERPCV, Command Central) — H-09
- Scroll-down arrow / "scroll to explore" cue

---

## Note on the "Featured on" press strip

The current WordPress site has a "Noel's been featured on" strip
showing SAP Press, MSN, LinkedIn, IPS, Techbullion, The Next
Disruption logos.

That strip is NOT in the hero. It belongs in **H-11 (Credentials /
About section)** as a quiet credibility row. Putting it in the
hero would clutter the 8-second scan and dilute the primary CTA.
Keep the hero clean.

When H-11 is briefed, the press strip gets a dedicated treatment.

---

## Layout — desktop (≥ 1024px)

```
┌─────────────────────────────────────────────────────────────┐
│  [Nav — H-14]                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   max-w-7xl, px-8, py-32                                    │
│   ┌──────────────────────────────┬──────────────────┐       │
│   │ ERP · AI · 25 years          │   ┌──────────┐   │       │
│   │ (eyebrow, papaya)            │   │          │   │       │
│   │                              │   │ HEADSHOT │   │       │
│   │ I run ERP transformations    │   │          │   │       │
│   │ the board can defend.        │   │  ~360px  │   │       │
│   │ (h1)                         │   │  square  │   │       │
│   │                              │   │ rounded- │   │       │
│   │ ECC to S/4HANA...            │   │ 2xl      │   │       │
│   │ (sub)                        │   │          │   │       │
│   │                              │   └──────────┘   │       │
│   │ [Book 30-min call] [Cases]   │                  │       │
│   │ (primary)        (secondary) │                  │       │
│   │                              │                  │       │
│   │ CIMA · AICPA · ... [in]      │                  │       │
│   │ (credibility + linkedin)     │                  │       │
│   └──────────────────────────────┴──────────────────┘       │
│                                                             │
│   12-col grid: content cols 1-7, gutter 8, headshot 9-12    │
└─────────────────────────────────────────────────────────────┘
```

Vertical rhythm:
- `py-32` desktop (128px top/bottom)
- Eyebrow → headline: 16px
- Headline → sub: 24px
- Sub → CTAs: 32px
- CTAs → credibility line: 24px

Decorative layer: `cc-glow-warm` radial gradient behind the content
column at low opacity (~0.5). Pseudo-element on the section, position
absolute, pointer-events none.

---

## Layout — tablet (768–1023px)

Same structure. Headshot scales to ~280px. Headline drops to
`text-5xl`. `py-24` instead of `py-32`.

---

## Layout — mobile (< 768px)

```
┌────────────────────────────┐
│  [Nav]                     │
├────────────────────────────┤
│  px-6, py-16               │
│                            │
│  ERP · AI · 25 years       │
│                            │
│  I run ERP                 │
│  transformations the       │
│  board can defend.         │
│  (text-4xl)                │
│                            │
│  ECC to S/4HANA...         │
│  (text-base)               │
│                            │
│  [Book a 30-min call]      │
│  (full-width)              │
│                            │
│  See case studies →        │
│  (text link)               │
│                            │
│  CIMA · AICPA · ...        │
│  [in] LinkedIn             │
└────────────────────────────┘
```

Mobile rules:
- Hide headshot. Don't stack.
- Primary CTA full-width.
- Secondary becomes text link.
- LinkedIn link as labelled item below credibility.
- Calendly popup still works on mobile (overlay full-screen).

---

## Animation specification

Motion design must be **subtle and considered**. CEO buyers see
flashy as untrustworthy. The hero should feel like a senior
person speaking, not a SaaS landing page.

Honour `prefers-reduced-motion: reduce` everywhere. When the user
has reduced motion enabled, all entry animations are skipped and
all hover transitions become instant.

### Entry animations (on first paint only — not on scroll)

Stagger reveal of the left content stack. 80ms between items.

```
0ms:    eyebrow fades up (opacity 0 → 1, translate-y 8px → 0,
        600ms ease-out)
80ms:   headline fades up
160ms:  sub fades up
240ms:  CTA pair fades up
320ms:  credibility line fades up
400ms:  headshot card fades in (opacity only, no movement, 500ms)
```

Use the existing `cc-fade-in` keyframe in globals.css with
`animation-delay` per item.

CSS to add to globals.css (or as a styled wrapper):

```css
.hero-stagger > * {
  opacity: 0;
  animation: cc-fade-in 0.6s ease-out forwards;
}
.hero-stagger > *:nth-child(1) { animation-delay: 0ms; }
.hero-stagger > *:nth-child(2) { animation-delay: 80ms; }
.hero-stagger > *:nth-child(3) { animation-delay: 160ms; }
.hero-stagger > *:nth-child(4) { animation-delay: 240ms; }
.hero-stagger > *:nth-child(5) { animation-delay: 320ms; }

@media (prefers-reduced-motion: reduce) {
  .hero-stagger > * {
    opacity: 1;
    animation: none;
  }
}
```

Reserve layout space first to prevent CLS — set min-height on
elements before they animate in if needed.

### Hover and focus microinteractions

**Primary CTA ("Book a 30-min call"):**
- Background: `--cc-accent` → `--cc-accent-hover` (200ms ease-out)
- Subtle lift: `transform: translateY(-1px)` on hover
- Inner arrow nudges right 2px on hover (200ms ease-out)
- Box-shadow on hover: `0 6px 16px rgba(252, 152, 90, 0.25)`
- Focus state: 3px papaya ring (use `--cc-accent-soft-2`)
- Active (mousedown): scale 0.98 for 100ms (click confirmation)

**Secondary CTA ("See case studies"):**
- Background: transparent → `--cc-surface` (200ms)
- Border-color: `--cc-card-border` → `--cc-text-primary` (200ms)
- Trailing arrow nudges right 2px on hover
- Focus: 3px papaya ring

**LinkedIn icon link:**
- Color: `--cc-text-muted` → `--cc-accent` on hover (150ms)
- Slight scale: 1.0 → 1.1 on hover (150ms ease-out)

**Headshot card:**
- No hover effect. The hero card is presence, not interaction.
  Don't make it tilt, lift, or shimmer.

### Decorative motion

- `cc-glow-warm` behind content: **static, not animated.**
- No mouse-follow gradients.
- No parallax on scroll.
- No auto-advancing tickers in the hero.
- No animated count-up on dollar figures. Static gravitas.

---

## Calendly integration

The primary CTA opens an inline Calendly popup. The user does not
leave the site to book.

### Approach: Calendly's official `react-calendly` PopupModal

Install: `npm install react-calendly` (~6KB gzipped).

Create a small client component wrapper at
`src/components/BookCallButton.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { PopupModal } from 'react-calendly';

interface Props {
  className?: string;
  children: React.ReactNode;
}

export default function BookCallButton({ className, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className}
        aria-haspopup="dialog"
      >
        {children}
      </button>
      {typeof document !== 'undefined' && (
        <PopupModal
          url="https://calendly.com/noeldcosta/30min"
          rootElement={document.body}
          open={isOpen}
          onModalClose={() => setIsOpen(false)}
          pageSettings={{
            backgroundColor: 'fffdf9',
            primaryColor: 'fc985a',
            textColor: '0e1020',
            hideEventTypeDetails: false,
            hideLandingPageDetails: false,
          }}
        />
      )}
    </>
  );
}
```

Notes:
- `'use client'` is required for the popup component (state +
  portal). This is the ONLY client component in the hero.
- Hero.tsx itself stays a server component. It imports
  BookCallButton.
- Calendly's iframe loads on first open, not on page load. Zero
  cost to performance until clicked.
- Brand the popup with our actual hex codes (papaya, paper, corbeau).

### Why popup over inline embed
Inline embed adds 200KB+ to first paint. Popup loads only on click.

### Why popup over a plain link
A plain link sends users to a third-party site. Popup keeps them
on noeldcosta.com mentally and visually. Pattern used by senior
advisory sites (April Dunford, Justin Welsh).

### Fallback
Implement progressive enhancement. If JS fails, the button can
fall back to the direct Calendly URL via a hidden anchor pattern
or noscript block.

---

## Component refactor spec

### File to refactor
`src/components/Hero.tsx`

### New file to create
`src/components/BookCallButton.tsx` (client component)

### Imports needed in Hero.tsx
- `Image` from `next/image`
- `Link` from `next/link`
- `Linkedin` from `lucide-react`
- `BookCallButton` from `./BookCallButton`

### Props
```tsx
interface HeroProps {
  lang: string;
}
```

### Component structure (server component)

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { Linkedin } from 'lucide-react';
import BookCallButton from './BookCallButton';

export default function Hero({ lang }: { lang: string }) {
  return (
    <section className="relative bg-[var(--cc-page-bg)] py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Decorative glow */}
      <div
        className="absolute inset-0 cc-glow-warm pointer-events-none opacity-50"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left content */}
          <div className="lg:col-span-7 hero-stagger">
            <p className="text-sm font-medium tracking-wider text-[var(--cc-accent)] mb-4">
              ERP · AI · 25 years
            </p>

            <h1 className="cc-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-[var(--cc-text-primary)] leading-tight mb-6">
              I run ERP transformations the board can defend.
            </h1>

            <p className="text-base md:text-lg text-[var(--cc-text-body)] leading-relaxed max-w-2xl mb-8">
              ECC to S/4HANA. AI on SAP. 25 years delivering for{' '}
              <strong className="font-semibold text-[var(--cc-text-primary)]">EDGE Group</strong> ($60M saved),{' '}
              <strong className="font-semibold text-[var(--cc-text-primary)]">Etihad Airways</strong> ($400M+ impact),{' '}
              <strong className="font-semibold text-[var(--cc-text-primary)]">ADNOC</strong>,{' '}
              <strong className="font-semibold text-[var(--cc-text-primary)]">PIF entities</strong>, and the{' '}
              <strong className="font-semibold text-[var(--cc-text-primary)]">UAE Government</strong>. CIMA-qualified. I lead the engagement. I don't subcontract.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <BookCallButton className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[var(--cc-accent)] text-white font-medium hover:bg-[var(--cc-accent-hover)] hover:-translate-y-px transition-all duration-200 shadow-sm hover:shadow-[0_6px_16px_rgba(252,152,90,0.25)] focus:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--cc-accent-soft-2)]">
                Book a 30-min call
                <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
              </BookCallButton>

              <Link
                href={`/${lang}/case-studies`}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-transparent text-[var(--cc-text-primary)] border border-[var(--cc-card-border)] font-medium hover:bg-[var(--cc-surface)] hover:border-[var(--cc-text-primary)] transition-all duration-200 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--cc-accent-soft-2)]"
              >
                See case studies
                <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-sm text-[var(--cc-text-muted)] leading-relaxed">
                CIMA <span className="text-[var(--cc-accent)]">·</span> AICPA{' '}
                <span className="text-[var(--cc-accent)]">·</span> Masters in Accounting{' '}
                <span className="text-[var(--cc-accent)]">·</span> 25+ years across EDGE Group, Etihad, ADNOC, PIF entities, DXC, and the UAE Government
              </p>
              <a
                href="https://www.linkedin.com/in/noeldcosta/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Noel D'Costa on LinkedIn"
                className="text-[var(--cc-text-muted)] hover:text-[var(--cc-accent)] hover:scale-110 transition-all duration-150"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Headshot — desktop only */}
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

This is the canonical structure. Match existing codebase patterns
where they conflict, but the shape stays.

---

## SEO and metadata

The hero is the page above the fold. Page-level metadata is set in
`src/app/[lang]/page.tsx` via Next.js `generateMetadata`. Sonnet
must add or update this.

### Title
```
Noel D'Costa | ERP, AI & S/4HANA Advisor
```

### Meta description
```
Senior ERP and AI advisor. ECC to S/4HANA migrations and Joule on SAP for enterprise clients across the GCC. 25 years. CIMA-qualified. Direct involvement, not subcontracted.
```

### Open Graph
- og:title — same as title
- og:description — same as meta description
- og:type — "profile"
- og:url — canonical site URL per lang
- og:image — `/og-image.png` (1200×630, **TODO: create**)
- og:locale — based on lang param

### Twitter card
- twitter:card — "summary_large_image"
- twitter:site — `@noeldcosta2018`
- twitter:title — same as og
- twitter:description — same as og
- twitter:image — same as og:image

### Canonical
- Canonical URL set per lang segment

### hreflang
- Language alternates per `src/lib/locales.ts`
- x-default → English

### robots
- `index, follow`

### Implementation
Use Next.js `generateMetadata` async function. Don't use legacy
`<Head>`. Respect lang param.

---

## Schema.org structured data (JSON-LD)

Render two JSON-LD blocks in the page head — Person and
ProfessionalService. This belongs in `src/app/[lang]/page.tsx`,
not Hero.tsx.

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: "Noel D'Costa",
      jobTitle: 'ERP and AI Advisor',
      url: 'https://noeldcosta.com',
      image: 'https://noeldcosta.com/headshot.png',
      sameAs: [
        'https://www.linkedin.com/in/noeldcosta/',
        'https://x.com/noeldcosta2018',
        'https://www.youtube.com/@NoelDCostaERPAI',
      ],
      hasCredential: [
        { '@type': 'EducationalOccupationalCredential', name: 'CIMA' },
        { '@type': 'EducationalOccupationalCredential', name: 'AICPA' },
        { '@type': 'EducationalOccupationalCredential', name: 'Masters in Accounting' },
      ],
      worksFor: {
        '@type': 'Organization',
        name: 'Quantinoid LLC',
      },
    }),
  }}
/>

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: "Noel D'Costa — ERP and AI Advisory",
      description: 'Senior advisory on SAP S/4HANA migrations and AI on ERP for enterprise clients.',
      url: 'https://noeldcosta.com',
      areaServed: ['AE', 'SA', 'GB', 'GCC', 'Europe'],
      serviceType: ['ERP advisory', 'SAP S/4HANA migration', 'AI on SAP'],
    }),
  }}
/>
```

---

## Design tokens used

| Element | Token |
|---|---|
| Section background | `--cc-page-bg` |
| Headline color | `--cc-text-primary` |
| Body color | `--cc-text-body` |
| Eyebrow color | `--cc-accent` |
| Bold names in sub | `--cc-text-primary` (font-weight 600) |
| Primary CTA bg | `--cc-accent` |
| Primary CTA hover bg | `--cc-accent-hover` |
| Primary CTA text | `#fff` |
| Secondary CTA border | `--cc-card-border` |
| Secondary CTA hover bg | `--cc-surface` |
| Secondary CTA hover border | `--cc-text-primary` |
| Credibility line | `--cc-text-muted` |
| Credibility separator dots | `--cc-accent` |
| LinkedIn icon | `--cc-text-muted` (default), `--cc-accent` (hover) |
| Focus ring | `--cc-accent-soft-2` |
| Headshot card shadow | `cc-hero-card` class |

Fonts:
- Eyebrow, body, CTAs: `var(--font-sans)` (Inter)
- Headline: `var(--font-display)` via `.cc-display` (Epilogue)

---

## Assets

- `/public/headshot.png` — already in repo. Reuse.
- `/public/og-image.png` — **TODO: create**. 1200×630. Headshot,
  name, one-line tagline. Required for social shares. Don't ship
  the page without it.
- LinkedIn icon via lucide-react (already installed).

---

## Out of scope for H-01

- Client logo wall (H-02)
- Achievement ticker (removed)
- "Featured on" press strip (H-11)
- AI capability cards (H-08)
- Stat blocks (H-03)
- Newsletter signup
- Tool/product cards (H-09)
- Scroll cue arrow
- Light/dark mode toggle (single-mode site)
- Cookie banner (root layout, not Hero)

---

## What this section unlocks

Once H-01 is `done`:
- H-02 to H-15 can begin
- Container width pattern locked (`max-w-7xl mx-auto px-6 md:px-8`)
- Eyebrow style locked
- CTA button styles locked and reused
- Vertical rhythm locked (`py-16 md:py-24 lg:py-32`)
- Animation language locked (cc-fade-in stagger pattern)
- Headshot pattern locked for About page reuse
- Calendly popup pattern locked for any other CTA on site

---

## Definition of done

H-01 is `done` when:

1. All acceptance criteria pass.
2. `npm run build` succeeds with no errors.
3. Calendly popup opens and books successfully on test click.
4. Lighthouse mobile performance ≥ 90 with hero in place.
5. Tested at 375, 768, 1024, 1280, 1920 px widths.
6. `prefers-reduced-motion` respected (test in DevTools).
7. Keyboard navigation tested (Tab through CTAs, Enter activates).
8. Noel has reviewed in browser at desktop and mobile.
9. Change committed and pushed.
10. PRD.md updated to mark H-01 status as `done`.

---

## Sonnet execution prompt

The prompt to run in Claude Code is in:
`_docs/homepage/01-hero.PROMPT.md`

Open that file, copy the prompt block, paste into Claude Code.
