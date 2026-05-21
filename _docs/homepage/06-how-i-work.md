# H-06 — How I work brief

Four cards in a 2x2 grid. Each card is one step in the engagement flow: discovery call, scoping, delivery, retainer. The section answers the CEO question "what does month one look like" before they have to ask.

---

## Purpose

- Make the engagement model legible. Not "we partner with you" — actual steps with time-boxes and outputs.
- Mark which steps are free, which are paid, which are optional.
- Repeat the "direct involvement, no junior team" promise from the hero in the place a CIO would look for it.
- Let the buyer stop after any step. The section explicitly says so.

---

## Buyer alignment

Per BUYER-CEO.md, "an opaque engagement model is one of the bounce reasons." This section is the direct answer. Four steps map onto a CIO's normal procurement workflow: discovery → scoping → delivery → hypercare/retainer. Each step lists a duration ("30 minutes", "1 to 2 weeks", "3 to 12 months", "Optional · monthly") and an explicit output ("clear yes or no", "diagnostic report and engagement proposal", "programme that lands", "documented stabilisation actions").

The "who" line under each title repeats the senior-involvement claim ("Direct with me", "Direct involvement throughout"). This is the line the CEO is scanning for after being burned by a Big 4 bait-and-switch.

The component docstring flags one open call: "Flag this for Noel's review if the time-boxes need adjusting." Confirm time-boxes before locking copy.

---

## Acceptance criteria

- [ ] Eyebrow reads "[ 04 · How I work ]".
- [ ] Headline reads "Four steps. No opaque engagement model." with the second sentence in papaya emphasis.
- [ ] Sub reads "Each step has a clear output. You can stop after any of them. The first one is free."
- [ ] Renders four step cards in source order: Discovery call, Scoping engagement, Delivery engagement, Hypercare or advisory retainer.
- [ ] Each card carries: big papaya number (`01` to `04`), mono duration line, title, mono "who" line, body paragraph, output line in semibold with a top hairline divider.
- [ ] Cards hover-lift (`-translate-y-1`) and pick up a papaya border tint.
- [ ] Two-column grid on `lg+`, single column on smaller screens.
- [ ] Section background is `bg-cream`, card background is `bg-bone`.
- [ ] Component is a server component. No `'use client'`.

---

## Copy specification

### Eyebrow

```
[ 04 · How I work ]
```

### Headline

```
Four steps. No opaque engagement model.
```

"No opaque engagement model." sits in a `<em class="not-italic text-papaya font-extrabold">`.

### Sub

```
Each step has a clear output. You can stop after any of them. The first one is free.
```

### Step 01 — Discovery call

Duration: `30 minutes · free`
Who: `Direct with me`
Body:
```
We talk about your programme. The state it is in, the decisions on your desk, the things keeping you up. I tell you whether I can actually help and where I would start. No deck, no pre-read, no follow-up sales loop.
```
Output:
```
Output: clear yes or no on whether to scope a paid engagement.
```

### Step 02 — Scoping engagement

Duration: `1 to 2 weeks · day rate or fixed`
Who: `Direct with me plus your nominated lead`
Body:
```
I review your current state. Existing artefacts, recent SteerCo reports, the SI's plan, your finance close cycle, the risk log. I run targeted conversations with the people who actually do the work. The output is a written diagnostic and a recommended engagement shape.
```
Output:
```
Output: diagnostic report and engagement proposal. You can take both elsewhere.
```

### Step 03 — Delivery engagement

Duration: `3 to 12 months · fee structure varies`
Who: `Direct involvement throughout`
Body:
```
I work alongside your team and the SI on the agreed scope. Programme recovery, S/4HANA migration oversight, AI on SAP design, vendor governance, business case validation. No junior team learning on your budget. I limit client load on purpose, so the senior in the pitch is the senior in the room.
```
Output:
```
Output: programme that lands. Weekly written updates. Honest escalation when something is off.
```

### Step 04 — Hypercare or advisory retainer

Duration: `Optional · monthly`
Who: `Lighter touch, named contact`
Body:
```
Post-go-live stabilisation, or ongoing board-level advisory for the next phase. Most clients take this for the first three months after a major go-live. Some keep it as standing capacity for the next big decision.
```
Output:
```
Output: documented stabilisation actions or quarterly advisory notes to the SteerCo.
```

---

## Layout

### Desktop (≥ 1024px)

2x2 grid. `grid-cols-2 gap-6`. Card padding is `p-8`. Number sits inline with the duration on one baseline. Title, who line, body, then a hairline separator before the output line.

### Tablet / mobile (< 1024px)

`max-lg:grid-cols-1` stacks all four cards. Padding inside the card stays at `p-8`. Section padding is the standard `clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)`.

---

## Design tokens used

| Element | Token / class |
|---|---|
| Section background | `bg-cream` |
| Card background | `bg-bone` |
| Card border | `border-corbeau/[0.08]`, hover `border-papaya/30` |
| Card hover shadow | `shadow-[0_12px_36px_rgba(14,16,32,0.08)]` |
| Step number | `text-papaya`, `font-display font-black` |
| Duration / who line | `text-eyebrow` / `text-canyon`, `font-mono` |
| Title | `text-corbeau`, `font-display font-extrabold` |
| Body | `text-night` |
| Output line | `text-corbeau`, `font-semibold`, top border `border-corbeau/[0.08]` |

---

## Out of scope

- A pricing table. Day rates and fee structure are deliberately not on the homepage — see CLAUDE.md ("DO NOT sell day-rate consulting at fixed price online").
- A booking form inline in this section. The discovery-call CTA lives in H-07 and H-13.
- A flow diagram replacing the four cards. The card grid is the chosen format.
- Animated step-through. Static cards.
- A fifth step. Four is the chosen count.

---

## Component reference

File: `src/components/HowIWork.tsx`

Top-of-file docstring lays out the engagement model and notes the time-boxes are open for Noel's review.

Key bits:
- Data: `STEPS` array of objects `{ num, title, duration, who, body, output }`
- Wrapper: `<section id="how-i-work" className="bg-cream">`
- Card root: `<article className="bg-bone border border-corbeau/[0.08] rounded-2xl p-8">`
- Section is a pure server component (no client hooks).
