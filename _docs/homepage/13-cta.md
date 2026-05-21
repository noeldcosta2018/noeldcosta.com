# H-13 — Final CTA banner brief

The single full-width papaya banner that closes the homepage. Big headline, one paragraph, primary Calendly button, secondary email link. Last thing the buyer sees before the footer.

---

## Purpose

- Give the buyer who scrolled all the way down one obvious next step.
- Restate the "30 minutes, no sales pitch" promise made in the hero and in H-07.
- Offer email as a fallback for buyers who don't book via Calendly.
- Stay short. One section, two CTAs, no third option.

---

## Buyer alignment

Per BUYER-CEO.md, "The homepage isn't trying to close a sale. It's trying to win the 30-minute call." This banner is the last call to do that. The line "Tell me what's going on with your ERP or AI project. I'll tell you straight if I can help." is the promise the CEO needs at this point — that the call won't be a sales loop.

The secondary email CTA (`solutions@noeldcosta.com`) is there for the buyer who books on their own cadence and won't pick a Calendly slot from a list. Senior CIOs often prefer to write first.

---

## Acceptance criteria

- [ ] Section is one large rounded papaya gradient block on a `bg-bone` outer wash.
- [ ] Gradient runs `135deg` from papaya (`#fc985a`) to canyon (`#e2826b`).
- [ ] Grid overlay sits over the gradient at 10% opacity (corbeau lines, 40px x 40px grid).
- [ ] Eyebrow reads `READY WHEN YOU ARE` with a small corbeau dot to the left.
- [ ] Headline reads "Your next programme starts with a conversation." in corbeau.
- [ ] Sub reads "30 minutes. No sales pitch. Tell me what's going on with your ERP or AI project. I'll tell you straight if I can help."
- [ ] Primary CTA reads `Book a 30-min call ↗` and links to `https://calendly.com/noeldcosta/30min`.
- [ ] Secondary CTA reads `Email me directly` and uses `mailto:solutions@noeldcosta.com`.
- [ ] On mobile (`<sm`) the two CTAs stack vertically.
- [ ] Section id is `cta` (used by H-04 service card anchors).
- [ ] Server component.

---

## Copy specification

### Eyebrow

```
READY WHEN YOU ARE
```

(uppercase already.) Small corbeau dot precedes the label.

### Headline

```
Your next programme starts with a conversation.
```

### Sub

```
30 minutes. No sales pitch. Tell me what's going on with your ERP or AI project. I'll tell you straight if I can help.
```

### Primary CTA

```
Book a 30-min call ↗
```
Href: `https://calendly.com/noeldcosta/30min`, opens in new tab, `rel="noopener noreferrer"`.

### Secondary CTA

```
Email me directly
```
Href: `mailto:solutions@noeldcosta.com`. Underlined via `border-b-2 border-corbeau`.

---

## Layout

### Desktop / tablet (≥ 640px)

Outer `<section>` is `bg-bone` with `padding: clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)`. The inner block is `max-w-[1200px] mx-auto rounded-3xl` with its own `padding: clamp(3rem,6vw,5rem) clamp(2rem,5vw,4rem)`. Content (eyebrow, headline, sub, CTAs) sits left-aligned on top of the grid overlay. CTAs in a `flex gap-3 flex-wrap`.

### Mobile (< 640px)

CTAs stack via `max-sm:flex-col`. Headline scales down per `clamp(2.2rem,4.5vw,3.5rem)`.

---

## Design tokens used

| Element | Token / class |
|---|---|
| Outer section background | `bg-bone` |
| Inner block gradient | `linear-gradient(135deg,#fc985a 0%,#e2826b 100%)` |
| Grid overlay | inline 40px×40px grid, `rgba(14,16,32,0.5) 1px` lines at 10% opacity |
| Eyebrow | `text-corbeau`, `font-mono` |
| Headline | `text-corbeau`, `font-display font-black` |
| Sub | `color: rgba(14,16,32,0.7)` |
| Primary CTA bg | `bg-corbeau`, hover `bg-[#1a1c30]` |
| Primary CTA text | `text-bone` |
| Secondary CTA | `text-corbeau` with `border-b-2 border-corbeau` |

Note: the inline hex codes (`#fc985a`, `#e2826b`, `#1a1c30`, `#0e1020`) bypass the `--cc-*` tokens. The CLAUDE.md rule says "No new colors outside the DESIGN_SYSTEM.md palette" — these are inside the palette but hard-coded rather than referenced. Worth tokenising in a future polish pass.

---

## Out of scope

- A third CTA (LinkedIn DM, WhatsApp, calendly+phone). Two CTAs by design.
- An inline contact form. Email link suffices.
- A countdown or scarcity element ("3 slots left this month"). Never on this site.
- Social proof inside the banner. Testimonials live in H-10.
- A second banner higher on the page. The "Book a 30-min call" CTA at the end of H-07 plus this banner are the two conversion moments.

---

## Component reference

File: `src/components/CTABanner.tsx`

Key classes:
- Outer: `<section id="cta" className="bg-bone">`
- Inner block: `max-w-[1200px] mx-auto relative rounded-3xl overflow-hidden` with inline gradient + padding
- Grid overlay: `absolute inset-0 pointer-events-none` with inline background-image gradient
- Server component. No client hooks.
