# H-10 — Testimonials brief

Three quote cards on the cream background. Each carries a five-star row, an italic quote, a name, and a role. Real quotes from real ex-CIOs and senior architects who worked with me.

---

## Purpose

- Put three named, attributable testimonials on the page.
- Stay short. Three cards, one row on desktop. No carousel, no rotator.
- Reinforce the finance-depth claim with the Etihad CIO line.
- Reinforce the cost-and-value claim with the Volkswagen line.
- Keep the section quiet — no headline gymnastics, no big bold pull-quote.

---

## Buyer alignment

Per BUYER-CEO.md, testimonials are not the top three things the CEO scans for, but they sit comfortably alongside the case studies. The buyer reads them once their interest is real. The three quotes here cover three different signals:

1. Mike Papamichael (Etihad ex-CIO) — finance plus functional depth.
2. Andrew MacFarlane (Etihad ex-CIO, now Cumbrae) — on-time, on-budget delivery.
3. Takhliq Hanif (Volkswagen Financial Services) — cost focus and negotiation.

All three are senior, named, and on LinkedIn. CLAUDE.md is explicit: "DO NOT add testimonials, quotes, or attribution that isn't on the reference list. Made-up quotes are an instant fail." These three came from real correspondence and need to stay verbatim.

---

## Acceptance criteria

- [ ] Eyebrow reads "[ 07 · From people I've worked with ]".
- [ ] Headline reads "Don't take my word for it. Read theirs." with the closing phrase in `cc-emphasis-italic`.
- [ ] Renders three testimonial cards in source order.
- [ ] Each card carries: five papaya stars row, italic quote in curly quotes, bold name, role line.
- [ ] No CTA in this section.
- [ ] Three-column grid on `md+`, two-column on `sm/md`, single column on `<sm`.
- [ ] Background is `bg-cream`, card is `bg-paper`.
- [ ] Server component. No animations.

---

## Copy specification

### Eyebrow

```
[ 07 · From people I've worked with ]
```

### Headline

```
Don't take my word for it. Read theirs.
```

`Read theirs.` in `cc-emphasis-italic`.

### Testimonial 1

Quote:
```
His functional expertise combined with his financial and accounting knowledge are invaluable tools that Noel uses to drive business change and deliver amazing results.
```
Name: `Mike Papamichael`
Role: `Ex-CIO, Etihad Aviation Group`

### Testimonial 2

Quote:
```
The programme delivered on time, on budget, and with no major issues. A very substantial undertaking and it is huge credit to Noel.
```
Name: `Andrew MacFarlane`
Role: `Ex-CIO, Etihad / Managing Partner, Cumbrae`

### Testimonial 3

Quote:
```
A very talented negotiator with laser focus on cost and value. Continually challenges his organisation to deliver quicker and more cost effectively.
```
Name: `Takhliq Hanif`
Role: `Head of Architecture, Volkswagen Financial Services`

### Star row

Five solid stars rendered as the literal text `★★★★★` in papaya.

---

## Layout

### Desktop (≥ 768px)

`grid-cols-3 gap-3.5` inside `max-w-[1200px]`. Each card: `bg-paper border border-corbeau/[0.06] rounded-[14px] p-7`. Star row, quote, name + role stacked.

### Tablet (≥ 640px, < 768px)

`max-md:grid-cols-2` — two cards side-by-side, third wraps below.

### Mobile (< 640px)

`max-sm:grid-cols-1`. Cards stack at full width.

---

## Design tokens used

| Element | Token / class |
|---|---|
| Section background | `bg-cream` |
| Card background | `bg-paper` |
| Card border | `border-corbeau/[0.06]` |
| Eyebrow | `text-papaya`, `font-mono` |
| Headline | `text-corbeau` |
| Headline emphasis | `cc-emphasis-italic` |
| Stars | `text-papaya` |
| Quote | `text-night`, italic |
| Name | `font-display font-bold` |
| Role | `text-eyebrow` |

---

## Out of scope

- A carousel or auto-rotator. Three quotes fit on one row, no motion needed.
- Headshots beside the names. CLAUDE.md says "real photos only or none" — until permissioned photos exist, no faces.
- LinkedIn links per testimonial. Adds clutter, can be a later pass once F-08 is settled.
- Star count variation (4.5, 5). Keep all five-star or remove the star row entirely.
- More than three testimonials. The set is fixed at three.

---

## Known gaps

- F-08 (`_docs/references/testimonials.md`) is still `pending` per PRD. The three currently shipped quotes need a quick verification pass against source correspondence (email, LinkedIn message, written reference) before launch. If any one cannot be sourced, it gets pulled — see CLAUDE.md.

---

## Component reference

File: `src/components/Testimonials.tsx`

Data: top-of-file `TESTIMONIALS` array with `quote`, `name`, `role`. Server component, no client hooks.

Key classes:
- Section: `bg-cream` with fluid padding
- Card root: `bg-paper border border-corbeau/[0.06] rounded-[14px] p-7`
- Grid: `grid grid-cols-3 gap-3.5 max-md:grid-cols-2 max-sm:grid-cols-1`
