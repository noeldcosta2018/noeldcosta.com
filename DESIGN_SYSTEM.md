# Design System

Single source of truth for visual tokens.

This site inherits the **Command Center design system** — the same
token architecture used by commandcc.io and erpcv.com. Same variable
names. Same surface hierarchy. Same components.

Three properties. One design language. Built once, used three times.

## Source

The canonical CSS lives in `src/app/globals.css`. All tokens, utilities,
and animations come from that file. Don't recreate them in components —
reference them directly.

## Brand palette

The named colors. Use the semantic tokens (next section) in code,
not these directly.

```css
--brand-corbeau:    #0e1020;  /* near-black with blue undertone */
--brand-corbeau-2:  #0f1121;  /* slightly lighter corbeau */
--brand-haiti:      #282937;  /* dark slate */
--brand-night:      #4c4d59;  /* mid-gray for body text */
--brand-silver:     #7e7e87;  /* muted gray */
--brand-moon:       #a6a6ac;  /* faint gray */
--brand-papaya:     #fc985a;  /* PRIMARY ACCENT — warm orange */
--brand-canyon:     #e2826b;  /* secondary warm — coral */
--brand-bone:       #f4ede4;  /* page background — cream */
--brand-cream:      #faf6f0;  /* surface — lighter cream */
--brand-paper:      #fffdf9;  /* card background — almost white */
```

Names matter. "Papaya" is the brand. Don't refer to it as "the orange" —
refer to it as papaya.

## Semantic tokens (use these in code)

These are what components reference. They map to brand colors.

### Surface
```css
--cc-page-bg:        var(--brand-bone);     /* main page background */
--cc-surface:        var(--brand-cream);    /* section backgrounds */
--cc-card-bg:        var(--brand-paper);    /* card surfaces */
--cc-card-bg-hover:  #fffaf3;               /* card hover state */
--cc-card-border:    rgba(14, 16, 32, 0.08);
--cc-divider:        rgba(14, 16, 32, 0.10);
```

### Text
```css
--cc-text-primary:    var(--brand-corbeau);  /* headings, emphasis */
--cc-text-body:       var(--brand-night);    /* body copy */
--cc-text-secondary:  var(--brand-night);    /* secondary copy */
--cc-text-muted:      var(--brand-silver);   /* metadata, captions */
--cc-text-faint:      var(--brand-moon);     /* very muted */
```

### Accent
```css
--cc-accent:         var(--brand-papaya);             /* primary CTA, links, dots */
--cc-accent-hover:   #fb8843;                          /* darker on hover */
--cc-accent-soft:    rgba(252, 152, 90, 0.12);        /* tints, soft backgrounds */
--cc-accent-soft-2:  rgba(252, 152, 90, 0.20);        /* selection highlights */
```

### Status
Use sparingly. Only when status semantics matter (alerts, badges, etc).

```css
--cc-green:        #2D8A4E;  /* success */
--cc-red:          var(--brand-canyon);  /* error / negative */
--cc-amber:        #d97706;  /* warning */
--cc-blue:         #2C6FBF;  /* info */
--cc-purple:       #7B61A8;  /* category accent */
--cc-teal:         #0D9488;  /* category accent */
```

Each has a `--cc-{color}-soft` variant at 12% opacity for backgrounds.

### Inputs
```css
--cc-input-bg:            var(--brand-paper);
--cc-input-border:        rgba(14, 16, 32, 0.15);
--cc-input-border-focus:  var(--brand-papaya);
--cc-input-shadow-focus:  0 0 0 3px rgba(252, 152, 90, 0.10);
```

### Shadows
```css
--cc-shadow-sm:  0 1px 2px rgba(14, 16, 32, 0.04);
--cc-shadow-md:  0 1px 2px rgba(14, 16, 32, 0.04),
                 0 8px 24px rgba(14, 16, 32, 0.04);
--cc-shadow-lg:  0 2px 4px rgba(14, 16, 32, 0.04),
                 0 12px 28px rgba(252, 152, 90, 0.12),
                 0 32px 64px rgba(14, 16, 32, 0.08);
```

The `--cc-shadow-lg` has a papaya glow baked in. Used on hero cards
and the most important elevated surfaces.

## Typography

```css
--font-sans:     'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display:  'Epilogue', -apple-system, sans-serif;
--font-mono:     'JetBrains Mono', ui-monospace, monospace;
```

### Where each is used
- **Inter** (sans) — body copy, navigation, buttons, UI labels
- **Epilogue** (display) — all headings (h1-h6). Distinctive, geometric,
  slightly tighter letter-spacing
- **JetBrains Mono** — numbers in stats, code, tabular data

### Heading rules
All headings use `var(--font-display)` automatically (set globally
in `globals.css`).

Letter-spacing on headings: `-0.02em` (default)
For oversized display headings: use `.cc-display` class →
`-0.04em` letter-spacing.

### Body sizing
Body default is `14px / 1.5 line-height`. Slightly compact, intentional.
Don't push to 16px without reason.

### Tabular numbers
For stats and money, use the `.cc-num` class. Numbers line up vertically.
Critical for stat blocks like "70% / $4.5M / 53%".

## Type scale

Use Tailwind's default scale. Don't define custom sizes.

```
text-xs   12px    meta, labels
text-sm   14px    body default, secondary
text-base 16px    lead paragraphs, larger body
text-lg   18px    small headings, intro
text-xl   20px    h4
text-2xl  24px    h3, section sub-heads
text-3xl  30px    h2 small
text-4xl  36px    h2
text-5xl  48px    h1 sections
text-6xl  60px    hero secondary
text-7xl  72px    hero primary
```

Mobile: drop hero sizes by ~40% (text-7xl on desktop → text-4xl on mobile).

## Spacing & section padding

Use Tailwind defaults. Standard section rhythm:

```
Mobile sections:    py-16  (64px)
Tablet sections:    py-20  (80px)
Desktop sections:   py-24  (96px)
Desktop hero:       py-32  (128px)
```

Container widths:
```
narrow:   max-w-2xl   (672px)  — long-form text, blog
default:  max-w-5xl   (1024px) — most sections
wide:     max-w-7xl   (1280px) — logo walls, wide grids
```

## Border radius

```
rounded-sm   2px    minor elements
rounded      4px    inputs
rounded-md   6px    buttons, small cards
rounded-lg   8px    cards
rounded-xl   12px   large feature cards
rounded-2xl  16px   hero cards, feature blocks
rounded-full        pills, dots, profile images
```

## Component patterns (utility classes from globals.css)

These are pre-built. Use them directly. Don't recreate.

### `.cc-card`
Standard elevated card. Paper background, subtle border, medium shadow.

### `.cc-hero-card`
Hero section card with the warm papaya glow shadow.

### `.cc-feature-card`
Cards that lift on hover. Used in services grids, tool grids.
Hover: lifts 4px, border becomes papaya, shadow expands.

### `.cc-link`
Underline-grow link effect. The underline animates from 0 to 100%
width on hover.

### `.cc-mask`
Mask gradient on left/right edges. Used on horizontal tickers so
they fade in/out instead of cutting hard.

### `.cc-glow-warm` and `.cc-glow-canyon`
Radial gradient backgrounds. Used as decorative layers behind hero
sections or section openers.

### `.cc-grid-lines`
80×80 grid pattern in subtle corbeau. Used as decorative background
on sections that need texture (e.g. AI capabilities).

### `.cc-grain`
A fixed-position grain overlay across the whole viewport.
6% opacity, multiply blend. Adds analog texture. Optional.
Place once near the root layout if used.

### `.cc-mono`, `.cc-display`, `.cc-num`
Font family overrides. Apply when needed.

## Buttons

### Primary button
Background `--cc-accent`, white text, `--radius-md`, hover `--cc-accent-hover`.

### Secondary button
Transparent background, primary text, border `--cc-card-border`,
hover background `--cc-surface`.

### Tertiary / link button
Use `.cc-link` on a plain anchor.

## Animations

Pre-defined keyframes. Don't write custom unless absolutely necessary.

```
.cc-ticker      → horizontal scroll, 30s loop. Logo walls, achievement strips.
.cc-pulse-dot   → live indicator pulse. Green dot on case studies.
.cc-bar         → bar grow-in for charts and progress.
.cc-scan-line   → horizontal scan line. Used on dashboard mockups.
.cc-fade-row    → 0.6s fade-up. Use on staggered list items.
.cc-cursor      → blinking cursor. For terminal-style displays.
```

Hover transitions: 150-300ms ease-out. No spring physics. No bouncing.
Page transitions: none (Next.js default).
Scroll-triggered animations: use sparingly. The site reads on scan,
not on scroll.

## Selection style
Highlighting text shows papaya tint. Brand reinforcement.

## Mobile considerations

- Reduce hero font sizes by ~40% (text-7xl → text-4xl)
- Stack horizontal grids vertically
- Reduce section padding by one step (py-24 → py-16)
- Hide tickers on mobile (cc-mask doesn't render well on narrow screens)
- Lift `.cc-grain` on mobile — too noisy on small screens

## What NOT to do

- Don't introduce new colors. Every color you need is already a token.
- Don't use Tailwind's default colors (blue-500, red-600, gray-400)
  unless you have a specific reason. Use the brand tokens.
- Don't add new fonts. Three families is enough.
- Don't write custom shadows. Use --cc-shadow-* tokens.
- Don't add scroll animations beyond the pre-defined keyframes.
- Don't use border-radius greater than 16px on cards.
- Don't reduce contrast below WCAG AA on text.
