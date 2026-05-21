# H-04 — Services / Who I help brief

Two cards on a dark background. The first names enterprise buyers, the second names consultants. The section sets the audience boundary up front so the CEO knows they are in the right place and the consultant knows where to go.

---

## Purpose

- Tell the CEO buyer the first card is for them.
- Tell the consultant audience the second card is for them, and that the deeper consultant content lives elsewhere.
- Lay out concretely what each engagement looks like — module-by-module bullets, not adjectives.
- Avoid the "two audiences in one paragraph" failure mode called out in CLAUDE.md by giving each audience its own card.

---

## Buyer alignment

Per BUYER-CEO.md the CEO is scanning for "engagement model — what does month one look like." The first card lists five concrete workstreams (ECC to S/4HANA migration, AI strategy on BTP, programme recovery, vendor selection, solution architecture with finance depth). Each one is a real engagement the CEO can imagine commissioning.

The second card is deliberately for the consultant audience and links forward to ERPCV and the tools section. Per CLAUDE.md "consultant content stays separate from CEO content on the homepage" — this is the one place they sit side by side, but they sit in physically separate cards with distinct headings ("Company Executives & Sponsors" vs "ERP & SAP Consultants") so the CEO never reads the consultant copy by accident.

---

## Acceptance criteria

- [ ] Eyebrow reads "[ 01 · Who I help ]".
- [ ] Headline reads "Two types of people find me useful. Maybe you're one." with the closing phrase in papaya italic-style emphasis.
- [ ] Two equal-width cards on desktop (`grid-cols-2`), stacking on `<lg`.
- [ ] Section background is `bg-corbeau` with `text-bone` body. This is the first dark section after the hero.
- [ ] Each card has the spotlight hover effect (`cc-spotlight`, cursor-tracked `--spotlight-x/y` CSS vars).
- [ ] Each card has a top accent line with a per-card gradient (`from-papaya to-canyon` for client card, reversed for consultant card).
- [ ] Each card carries: card number (`CLIENT · 01`), title, role line, two paragraphs of body, five-item bullet list with papaya square markers, single text CTA.
- [ ] Cards hover-lift (`-translate-y-1`) and add a 16/48 black shadow.
- [ ] First card CTA reads "Talk about your project →" and anchors to `#cta`.
- [ ] Second card CTA reads "Check out my tools →" and anchors to `#tools`.
- [ ] Component is `'use client'` because of the mousemove spotlight handler.

---

## Copy specification

### Eyebrow

```
[ 01 · Who I help ]
```

### Headline

```
Two types of people find me useful. Maybe you're one.
```

"Maybe you're one." sits in a `<em class="not-italic text-papaya font-extrabold">` — it reads as emphasis without italic styling.

### Sub

```
Companies that need ERP and AI done right. Consultants who need straight advice on their career.
```

### Card 1 — Company Executives & Sponsors

Number: `CLIENT · 01`
Title: `Company Executives & Sponsors`
Who: `CIOs · CFOs · Programme Directors`

Body paragraph 1:
```
You have an ECC to S/4HANA migration coming up. Or you're mid-implementation and things aren't going well. Maybe you want AI on top of your ERP but nobody's giving you a straight answer.
```

Body paragraph 2:
```
I step in and get things moving. Direct involvement. No junior team learning on your budget.
```

Bullets (five items):
- ECC to S/4HANA migration planning and delivery
- AI and Agentic AI strategy on SAP BTP
- Programme recovery when things go sideways
- Vendor selection and contract negotiation
- Solution architecture with finance depth

CTA: `Talk about your project →` → `#cta`

### Card 2 — ERP & SAP Consultants

Number: `CLIENT · 02`
Title: `ERP & SAP Consultants`
Who: `Independent Consultants · Career Changers`

Body paragraph 1:
```
You're trying to break into ERP consulting. Or you're already in the game and need guidance. Which certifications matter. How to position yourself. What clients actually want.
```

Body paragraph 2:
```
25 years of experience. Happy to share what I know.
```

Bullets:
- Career path guidance for ERP consulting
- Which certifications actually get you hired
- How to build your personal brand
- Use ERPCV to build recruiter-ready CVs
- Real talk on the consulting business

CTA: `Check out my tools →` → `#tools`

---

## Layout

### Desktop (≥ 1024px)

Two cards in a `grid-cols-2` with `gap-6`. Inside each: `bg-haiti` card on the dark section background, `rounded-2xl`, `p-10`. Top accent bar (`h-0.5`) runs full-width across the card top.

### Tablet and mobile

`max-lg:grid-cols-1` stacks the cards. Padding holds at `p-10` inside the card. Section padding is the standard `clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)`.

---

## Design tokens used

| Element | Token / class |
|---|---|
| Section background | `bg-corbeau` |
| Section text | `text-bone` |
| Card background | `bg-haiti` |
| Card border | `border-white/[0.06]`, hover `border-papaya/20` |
| Card 1 accent gradient | `from-papaya to-canyon` |
| Card 2 accent gradient | `from-canyon to-papaya` |
| Number / who line | `text-silver` / `text-canyon`, `font-mono` |
| Title | `text-bone`, `font-display font-extrabold` |
| Body | `text-moon` |
| Bullet marker | `border-papaya`, `background: rgba(252,152,90,0.2)` |
| CTA | `text-papaya`, hover `text-[#fdaa78]` |
| Spotlight | `cc-spotlight` (uses `--spotlight-x/y` from globals) |

---

## Out of scope

- A third card. The section is the binary audience split.
- A pricing table inside the card. Engagements are scoped — see CLAUDE.md.
- An inline contact form. CTA points to `#cta` (H-13) for the form/Calendly.
- Industry-specific cards. Industry breakdowns live on `/sap-implementation/for-aviation/` etc.

---

## Component reference

File: `src/components/Services.tsx`

Contains a local `ServiceCard` sub-component and the parent `Services` export. Card data is inline in the JSX (not a top-of-file array) — two `<ServiceCard …/>` calls.

Key classes:
- Section: `bg-corbeau text-bone`, id `services`
- Card: `cc-spotlight relative bg-haiti border border-white/[0.06] rounded-2xl p-10`
- Accent top bar: `absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient}`
- Bullet: `pl-[22px]` with absolutely positioned square marker
- CTA: `font-mono text-papaya min-h-[44px]` (44px is the WCAG touch target)
