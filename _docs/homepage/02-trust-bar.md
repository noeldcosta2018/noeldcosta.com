# H-02 — Trust bar brief

A thin marquee strip of client names that sits directly under the hero. The CEO scanning the page hits this within the first two seconds of scrolling. The job is one question: do the names match my world.

---

## Purpose

- Show 12 named clients without the buyer having to scroll to a case studies section.
- Anchor the credibility claim made in the hero (EDGE, Etihad, ADNOC, PIF, UAE Government) with extra names around it.
- Stay quiet. The strip is presence, not feature.
- Pause when the cursor lands on it so the buyer can actually read a name they recognise.
- Hold the spot for real logos (F-09) when they ship.

---

## Buyer alignment

Per BUYER-CEO.md, the first thing the CEO scans is "logos of companies their size." This strip is the only place that question gets answered until they reach the case studies block deeper down. If the names don't match their world (defence, aviation, energy, sovereign wealth, government), they bounce in under twenty seconds.

The marquee format is deliberately understated. A static logo grid forces a layout decision (which logo goes where). A scrolling strip says "there are more than fit; here are some." It also lets us ship the section before the real SVG logos are sourced — names today, logos when F-09 completes.

---

## Acceptance criteria

- [ ] Renders 12 client names from the `LOGOS` array, doubled, in a single horizontal marquee row.
- [ ] Eyebrow line above the strip reads "Delivered for companies including".
- [ ] Marquee auto-scrolls via the `animate-logo-scroll` keyframe.
- [ ] Hovering anywhere on the strip pauses the animation (`group-hover:[animation-play-state:paused]`).
- [ ] Individual names brighten on hover (opacity 0.35 → 0.7).
- [ ] Left and right edges fade out via a CSS mask gradient, no hard clip.
- [ ] Background uses `bg-cream`, with hairline borders top and bottom at `corbeau/[0.04]`.
- [ ] Section padding is `2.5rem` vertical, `clamp(1.5rem,5vw,4rem)` horizontal.

---

## Copy specification

### Eyebrow

```
Delivered for companies including
```

Style: mono, 0.72rem, eyebrow color, uppercase, 2.5px tracking, centred, 5px of vertical breathing room below.

### Client names (in order)

```
EDGE Group
Etihad Airways
DXC Technology
Dept. of Gov. Enablement
Technology Innovation Institute
Protiviti
ADNOC
PIF Entities
Pepsi
P&G
United Arab Bank
Etoile Group
```

Doubled in the DOM so the marquee loops seamlessly.

### Out of scope as copy

No "click for case study" affordance on individual names. The strip is read-only. Case study links live in H-05.

---

## Layout

### Desktop

Full-width strip. Names sit on one row, gap of `3.5rem` (Tailwind `gap-14`). Mask fade at the outer 8% of either side. The strip is short (one row), not tall.

### Tablet and mobile

Same layout. The marquee is one-row at every breakpoint. Names that don't fit are off-screen by design (mask hides them). Pause-on-hover works on touch as a tap interaction by default (no special mobile handling in the current code).

---

## Design tokens used

| Element | Token / class |
|---|---|
| Section background | `bg-cream` |
| Top and bottom hairline | `border-corbeau/[0.04]` |
| Eyebrow color | `text-eyebrow` |
| Name color | `text-night` |
| Name opacity (rest / hover) | `opacity-35` / `hover:opacity-70` |
| Animation keyframe | `animate-logo-scroll` (defined in globals) |
| Mask gradient | inline `linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)` |

Fonts: `font-display` (Epilogue) bold for names, `font-mono` for the eyebrow.

---

## Known gaps

- F-09 is open: `/public/logos/` is empty. The `LOGOS` array carries a `// TODO F-09` comment at the top of `LogoScroll.tsx`. Real black-and-white SVG logos replace the text names once the assets land. Until then, name-text is the shipped form.
- No accessibility label on the marquee wrapper. A future pass should add `role="list"` plus `aria-label="Selected client list"` for screen readers, and `aria-hidden` on the duplicated half.
- No `prefers-reduced-motion` handling on the marquee. Belongs in the animation refactor, not this backfill.

---

## Out of scope

- Case study links on individual names.
- A "view all clients" CTA.
- Logo licensing badges or fine print.
- Filtering by industry.
- Press logos (SAP Press, MSN, LinkedIn) — those live in H-11.

---

## Component reference

File: `src/components/LogoScroll.tsx`

Key classes and identifiers:
- Root: `bg-cream border-t border-b border-corbeau/[0.04]`
- Marquee wrapper: `overflow-hidden group` with inline `maskImage`
- Animated row: `flex w-max gap-14 animate-logo-scroll items-center group-hover:[animation-play-state:paused]`
- Item: `font-display font-bold text-[0.95rem] text-night opacity-35 hover:opacity-70`

`Ticker.tsx` is a sibling marquee component used elsewhere — not currently consumed by the homepage trust bar.
