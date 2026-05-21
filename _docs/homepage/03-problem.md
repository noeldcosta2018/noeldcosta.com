# H-03 — Problem section brief

Three stats that name the problem the CEO already knows they have. Sits after the trust bar, before any pitch. The job is to agree with the buyer, not sell to them.

---

## Purpose

- Open with a headline the buyer has likely thought themselves: most ERP programmes fail.
- Back it with three sourced numbers, not assertions.
- Avoid any solution language in this section. Pitch comes later.
- Keep it short. Three stats, one row on desktop.

---

## Buyer alignment

The CEO buyer has either lived through a failed programme or has a peer who has. Per BUYER-CEO.md: "A peer at another company just had their CIO fired after a failed S/4HANA cutover." This section confirms that what they fear is real and statistically normal. That confirmation is what earns the next scroll.

Each stat carries its source (Panorama, Resulting IT, Gartner). Real sources matter to this buyer. They are used to vendor decks that quote "studies" without citing anyone. Naming the firm and year passes their first sniff test.

---

## Acceptance criteria

- [ ] Eyebrow reads "[ The problem ]".
- [ ] Headline reads "Most ERP projects fail. Yours doesn't have to." with the second sentence in `cc-emphasis-italic`.
- [ ] Sub reads "You already know this. The numbers just confirm it."
- [ ] Three stat columns render with a hairline vertical divider between them on desktop.
- [ ] Each stat shows the big number, a unit suffix at 55% size, a body line under it, and a source line in mono.
- [ ] First stat number colour is papaya, second is corbeau, third is canyon.
- [ ] On mobile, columns stack and the dividers move from left-border to bottom-border.
- [ ] Section uses `bg-bone` and the standard fluid padding.
- [ ] No CTA in this section.

---

## Copy specification

### Eyebrow

```
[ The problem ]
```

### Headline

```
Most ERP projects fail. Yours doesn't have to.
```

The second sentence wraps in `cc-emphasis-italic`. The full sentence is in the `aria-label` for screen readers; the on-screen markup splits with `aria-hidden`.

### Sub

```
You already know this. The numbers just confirm it.
```

### Stat 1 — papaya

```
70%
of ERP projects go over budget or miss their deadline.
Panorama Consulting, 2024
```

### Stat 2 — corbeau

```
$4.5M
average cost overrun on mid-market S/4HANA migrations.
Resulting IT, 2024
```

### Stat 3 — canyon

```
53%
of companies say ERP failed to deliver expected business value.
Gartner Research, 2023
```

---

## Layout

### Desktop (≥ 768px)

Three equal columns inside `max-w-[1200px]`. Vertical hairline divider (`border-corbeau/[0.1]`) sits to the left of columns 2 and 3, with `clamp(1rem,3vw,2.5rem)` of left padding. The first column has no left padding. Big numbers are `clamp(3rem,6vw,4.5rem)` font size.

### Mobile (< 768px)

Single column. Bottom border on each stat (except the last) replaces the side dividers (`border-b border-corbeau/[0.08]`). `gap-8` between stats. Numbers shrink fluidly with the `clamp()`.

---

## Design tokens used

| Element | Token / class |
|---|---|
| Section background | `bg-bone` |
| Eyebrow color | `text-papaya` |
| Headline color | `text-corbeau` |
| Headline emphasis | `cc-emphasis-italic` |
| Body / sub color | `text-night` |
| Stat 1 colour | `text-papaya` |
| Stat 2 colour | `text-corbeau` |
| Stat 3 colour | `text-canyon` |
| Source line | `text-eyebrow`, `font-mono` |
| Divider | `border-corbeau/[0.1]` desktop, `border-corbeau/[0.08]` mobile |

Fonts: `font-display` `font-black` for numbers and headline (Epilogue), Inter for body, `font-mono` for eyebrow and source.

---

## Out of scope

- A CTA. The buyer is still in the "agree with the diagnosis" phase.
- Animated count-up on the numbers. Static gravitas — same rule as the hero.
- A fourth stat. Three is the right number for this row.
- Industry-specific stats. Section is for the broad market truth.
- Footnotes or expandable detail per stat. Source line is the full citation.

---

## Component reference

File: `src/components/ProblemStats.tsx`

Data: top-of-file `STATS` array. Each entry has `num`, `unit`, `color` (Tailwind class), `text`, `src`.

Key classes:
- Section: `bg-bone` with fluid padding
- Inner: `max-w-[1200px] mx-auto`
- Stat number: `font-display font-black leading-none tracking-[-0.04em]` + per-stat color class
- Unit suffix: inline span at `0.55em`, `fontWeight: 700`
- Grid: `grid grid-cols-3 mt-14 max-md:grid-cols-1 max-md:gap-8`
