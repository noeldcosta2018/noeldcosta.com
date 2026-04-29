# P-02 — Match ERPCV hero exactly

Single goal: make noeldcosta hero typography, weight, gradients,
and menu styles identical to erpcv.com.

Source of truth: Noel's `erpcv3` repo. Every spec below is a
direct copy from `MarketingLayout.tsx` and the landing page file
he shared.

No interpretation. No judgement calls. Copy the exact values.

---

## CHANGE 1 — Hero h1

### File
`src/components/Hero.tsx`

### Current (wrong)
```tsx
<h1 className="cc-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-[var(--cc-text-primary)] leading-tight mb-6">
  I run ERP transformations the board can defend.
</h1>
```

### Replace with (exact ERPCV pattern)
```tsx
<h1 className="cc-display" style={{
  fontWeight: 900,
  fontSize: 'clamp(36px, 5.5vw, 64px)',
  lineHeight: 0.95,
  color: 'var(--cc-text-primary)',
  margin: 0,
  letterSpacing: '-0.02em'
}}>
  I run ERP transformations{' '}
  <span style={{
    fontStyle: 'italic',
    fontWeight: 300,
    color: 'var(--cc-canyon)'
  }}>
    the board can defend.
  </span>
</h1>
```

Three things changed:
1. `fontWeight: 900` (was 800)
2. `fontSize: 'clamp(36px, 5.5vw, 64px)'` (was Tailwind text-7xl = 72px)
3. `lineHeight: 0.95` (was Tailwind leading-tight = 1.25)
4. The italic emphasis added on `the board can defend.`

Remove all Tailwind text size classes from the h1. Use only the
inline style above.

---

## CHANGE 2 — Hero subhead

### Current
```tsx
<p className="text-base md:text-lg text-[var(--cc-text-body)] leading-relaxed max-w-2xl mb-8">
```

### Replace with (exact ERPCV pattern)
```tsx
<p style={{
  marginTop: 24,
  fontSize: 16,
  color: 'var(--cc-text-body)',
  maxWidth: 500,
  lineHeight: 1.65
}}>
```

Note: maxWidth is 500px in ERPCV, not the Tailwind max-w-2xl
(672px) we had.

---

## CHANGE 3 — CTAs to ERPCV pill style

### Current primary CTA
Pill-shaped button with custom hover shadow, the chunky
"Book a 30-min call" with arrow.

### Replace with (exact ERPCV pattern from Hero)

Primary (dark pill):
```tsx
<a
  href="https://calendly.com/noeldcosta/30min"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    background: 'var(--cc-corbeau)',
    color: 'var(--cc-bone)',
    fontSize: 14,
    fontWeight: 600,
    padding: '12px 22px',
    borderRadius: 999,
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 8
  }}
>
  Book a 30-min call <ArrowUpRight size={16} />
</a>
```

Secondary (papaya pill):
```tsx
<Link
  href={`/${lang}/case-studies`}
  style={{
    color: 'var(--cc-corbeau)',
    fontWeight: 600,
    fontSize: 14,
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
    background: 'var(--cc-papaya)',
    borderRadius: 999
  }}
>
  See case studies <ArrowRight size={16} />
</Link>
```

CTA wrapper:
```tsx
<div style={{
  marginTop: 28,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 12
}}>
```

Replace the existing CTA block entirely. Remove all Tailwind
classes on these buttons. Use the inline styles only.

Imports needed: `ArrowUpRight`, `ArrowRight` from `lucide-react`.

---

## CHANGE 4 — Hero eyebrow with pulse dot

### Current
```tsx
<p className="text-sm font-medium tracking-wider text-[var(--cc-accent)] mb-4">
  ERP · AI · 25 years
</p>
```

### Replace with (exact ERPCV pattern)
```tsx
<div style={{
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 24
}}>
  <span className="cc-pulse-dot" style={{
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--cc-papaya)'
  }} />
  <span className="cc-mono" style={{
    fontSize: 11,
    letterSpacing: '0.2em',
    color: 'var(--cc-night)',
    textTransform: 'uppercase'
  }}>
    ERP · AI · 25 years
  </span>
</div>
```

If `cc-pulse-dot` and `cc-mono` classes don't exist in
`globals.css`, add them:

```css
.cc-mono {
  font-family: var(--font-mono);
  letter-spacing: 0.02em;
}

@keyframes cc-pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.6; transform: scale(1.3); }
}

.cc-pulse-dot {
  animation: cc-pulse-dot 2s ease-in-out infinite;
  display: inline-block;
  flex-shrink: 0;
}

@media (prefers-reduced-motion: reduce) {
  .cc-pulse-dot { animation: none; }
}
```

---

## CHANGE 5 — Hero outer wrapper padding

### Current
`py-16 md:py-24 lg:py-32` Tailwind classes.

### Replace with (exact ERPCV pattern)
```tsx
<section style={{ position: 'relative', overflow: 'hidden' }}>
  <div className="cc-glow-warm" style={{
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none'
  }} />
  <div className="cc-grid-lines" style={{
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    opacity: 0.6
  }} />
  <div style={{
    position: 'relative',
    maxWidth: 1480,
    margin: '0 auto',
    padding: '40px 24px 48px'
  }}>
    {/* hero content here */}
  </div>
</section>
```

ERPCV uses 40px top, 48px bottom. Tighter than what we have.
Hero is meant to feel dense, not airy.

`cc-glow-warm` and `cc-grid-lines` classes — verify they exist
in `globals.css`. If `cc-grid-lines` doesn't exist, copy from
ERPCV's globals (or use the `.cc-grid-faint` we already added).

---

## CHANGE 6 — Hero grid layout

### Current
12-column grid with content in 7 cols, headshot in 4 cols.

### Replace with (exact ERPCV pattern)
```tsx
<div className="grid lg:grid-cols-12" style={{
  gap: 32,
  alignItems: 'center'
}}>
  <div className="lg:col-span-6">
    {/* eyebrow, h1, sub, CTAs, credibility */}
  </div>
  <div className="lg:col-span-6">
    {/* headshot card */}
  </div>
</div>
```

ERPCV uses 6/6 split, not 7/5. Equal columns. Gap 32px (not 48).

---

## CHANGE 7 — Headshot card (right side)

### Current
Headshot in a card with rounded-2xl and `cc-hero-card` class.

### Replace with (use the same `HeroCarousel` pattern wrapper)
```tsx
<div style={{ position: 'relative' }}>
  <div style={{
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    background: 'var(--cc-paper)',
    border: '1px solid var(--cc-card-border)',
    boxShadow: '0 20px 40px rgba(252,152,90,0.12), 0 8px 16px rgba(14,16,32,0.08)',
    aspectRatio: '4/5',
    maxWidth: 480,
    marginLeft: 'auto'
  }}>
    <Image
      src="/headshot.png"
      alt="Noel D'Costa"
      fill
      priority
      sizes="(min-width: 1024px) 480px, 0px"
      className="object-cover"
    />
  </div>
</div>
```

Aspect 4:5 (portrait), borderRadius 20px (not 16, not 24).
Shadow uses papaya tint at 0.12 opacity. Max width 480px.

---

## CHANGE 8 — Nav menu styles

### File
`src/components/Nav.tsx`

### Current
Tailwind-based nav with text links.

### Replace nav links with (exact ERPCV pattern)
```tsx
<Link
  href="/"
  className="cc-link"
  style={{
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--cc-text-primary)',
    textDecoration: 'none',
    fontFamily: 'var(--font-display)'
  }}
>
  Home
</Link>
```

Three things differ from current:
1. `fontWeight: 700` (heavy, not regular/medium)
2. `fontFamily: var(--font-display)` (Epilogue, not Inter)
3. `fontSize: 14`

The display font on nav links is what gives ERPCV that distinctive
nav feel. Currently noeldcosta's nav uses body font.

### Contact button (right side)
```tsx
<Link
  href="/contact"
  style={{
    background: 'var(--cc-papaya)',
    color: 'var(--cc-corbeau)',
    fontSize: 13,
    fontWeight: 700,
    padding: '10px 20px',
    borderRadius: 8,
    textDecoration: 'none'
  }}
>
  Contact
</Link>
```

borderRadius 8px (rectangular pill), papaya bg, corbeau text,
weight 700.

### Nav background
```tsx
<nav style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 50,
  background: 'rgba(244, 237, 228, 0.92)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(14, 16, 32, 0.1)'
}}>
```

The frosted-glass blur on cream is the signature.
`rgba(244, 237, 228, 0.92)` is bone at 92% alpha.

---

## Acceptance criteria

After Sonnet runs:

- [ ] Hero h1 weight is 900, size clamp 36-64px, line-height 0.95
- [ ] Hero h1 has italic emphasis on `the board can defend.`
- [ ] Hero h1 italic clause is `fontStyle: italic, fontWeight: 300, color: var(--cc-canyon)`
- [ ] Eyebrow has animated pulse dot + mono caps text
- [ ] CTAs are 12px 22px padding, fontSize 14, fontWeight 600
- [ ] Primary CTA is corbeau bg, bone text — secondary is papaya bg, corbeau text
- [ ] Hero outer padding is `40px 24px 48px`
- [ ] Hero grid is 6/6 columns with 32px gap
- [ ] Headshot card aspect 4:5, borderRadius 20px, papaya-tinted shadow
- [ ] Nav links use display font weight 700
- [ ] Nav uses backdrop-blur 20px on bone at 92%
- [ ] Contact button is papaya pill with borderRadius 8px
- [ ] No Tailwind text size classes on the h1 — pure inline style
- [ ] Build succeeds with no errors
- [ ] Lighthouse mobile ≥ 90

---

## What NOT to change

- The hero copy (eyebrow, h1 plain words, sub, CTA labels) — only the styling
- Component architecture (Hero.tsx stays server component, BookCallButton stays client)
- Section ordering on the homepage
- Any other section below the hero
- File paths

---

## Definition of done

1. Side-by-side compare with erpcv.com/ home — hero typography
   reads as identical.
2. Build succeeds.
3. Pushed to Vercel.
4. PRD.md updated, P-02 marked done.
