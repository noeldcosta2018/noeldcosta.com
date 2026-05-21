# H-07 — What I believe brief

Five numbered opinions, each with a title and a body paragraph, presented as a bordered list. The section ends with the homepage's first inline Calendly CTA. This is the conversion section.

---

## Purpose

- Surface five real opinions that pre-qualify the buyer. Agreement on any one of them is grounds for a call.
- Take a position the Big 4 sites won't — directness is the differentiator.
- Hold the same five opinions verbatim from BRAND.md, so the homepage, blog, and pitch deck all say the same things.
- Place the primary "Book a 30-min call" CTA at the end of the section, with a "Direct with me. No SDR layer." line beside it.

---

## Buyer alignment

Per BUYER-CEO.md, the line that books the call is: "One opinion in 'What I believe' matched something they've thought themselves but couldn't say out loud." Each of the five beliefs is built for that. They are not soft "we believe in collaboration" lines — they are positions with consequences. "Walk if a vendor proposes a 3-year roadmap before understanding your finance close" is the kind of sentence that gets read out in a SteerCo.

Per the component docstring: "Do not soften these — the directness is what differentiates this section from the equivalent page on every Big 4 site." Treat the body copy as locked. Edits go back to Opus.

---

## Acceptance criteria

- [ ] Eyebrow reads "[ 05 · What I believe ]".
- [ ] Headline reads "Five positions. All defensible in print." with the second sentence in papaya emphasis.
- [ ] Sub reads "These are the opinions I will hold in a SteerCo. If one of them matches something you have already thought but could not say out loud, we should talk."
- [ ] Renders the five `BELIEFS` entries as an ordered list, in source order.
- [ ] Each item is a two-column grid (`auto_1fr`): big papaya number on the left, title and body stacked on the right.
- [ ] Each item has a 4px left border in `papaya/70`, brightening to full papaya on hover.
- [ ] On mobile (`<md`) the grid collapses to a single column and the number sits above the title.
- [ ] Section ends with a "Book a 30-min call" button linking to `https://calendly.com/noeldcosta/30min`, opening in a new tab.
- [ ] A "Direct with me. No SDR layer." caption sits next to the CTA in mono type.
- [ ] All five body strings match BRAND.md verbatim.
- [ ] Server component. No `'use client'`.

---

## Copy specification

### Eyebrow

```
[ 05 · What I believe ]
```

### Headline

```
Five positions. All defensible in print.
```

"All defensible in print." in papaya emphasis.

### Sub

```
These are the opinions I will hold in a SteerCo. If one of them matches something you have already thought but could not say out loud, we should talk.
```

### Belief 01

Title:
```
Start with processes, not systems.
```
Body:
```
Most ERP failures begin in the wrong order. Buy the system, then try to fit your business into it. The conversation should run the other way. Map your processes first. Decide what is broken, what is worth keeping, what needs to change. Then talk about systems. Every greenfield-vs-brownfield debate I have watched go sideways started without this step.
```

### Belief 02

Title:
```
Your SI should not be the one writing your business case.
```
Body:
```
You need an expert who is not selling the implementation to write the case for it. That is how $40M programmes become $90M without anyone noticing. The SI incentive is to start. Yours is to finish. Different jobs.
```

### Belief 03

Title:
```
AI on ERP is real now, and it is moving fast.
```
Body:
```
Joule is growing by the day. The agentic use cases on BTP are no longer slideware. If your last look at AI-on-SAP was 12 months ago, look again. The board-deck version is over. The shipping version is here. Ignore it and you are on the wrong side of the next two years.
```

### Belief 04

Title:
```
The cheapest consultant is the most expensive one.
```
Body:
```
Day rate is the smallest variable in total programme cost. A senior advisor at $2,500 per day who saves you a six-month overrun is cheaper than a $900 per day team that does not. Most CFOs work this out only after the second post-mortem.
```

### Belief 05

Title:
```
Walk if a vendor proposes a 3-year roadmap before understanding your finance close.
```
Body:
```
The close is where the real complexity lives. Vendors who skip it are selling a roadmap, not solving a problem. Anyone serious wants to see your close cycle, your reconciliations, and your manual workarounds before they propose anything.
```

### CTA

```
Book a 30-min call →
```
Href: `https://calendly.com/noeldcosta/30min`, `target="_blank"`, `rel="noopener noreferrer"`.

### CTA caption

```
Direct with me. No SDR layer.
```

---

## Layout

### Desktop (≥ 768px)

`ol` with `flex flex-col gap-5`. Each `li` is `grid-cols-[auto_1fr] gap-x-6 gap-y-2`, with the number spanning two rows and the title and body stacking. `border-l-4 border-papaya/70 pl-6 py-2`. CTA row sits below the list with `mt-14`.

### Mobile (< 768px)

`max-md:grid-cols-1`. Number sits above the title rather than to its left. Padding stays the same. Body wraps full-width.

---

## Design tokens used

| Element | Token / class |
|---|---|
| Section background | `bg-bone` |
| Eyebrow | `text-papaya`, `font-mono` |
| Headline | `text-corbeau` |
| Headline emphasis | `not-italic text-papaya font-extrabold` |
| Left border | `border-papaya/70`, hover `border-papaya` |
| Number | `text-papaya`, `font-display font-black` |
| Title | `text-corbeau`, `font-display font-extrabold` |
| Body | `text-night` |
| CTA bg | `bg-papaya`, hover `bg-[#fdaa78]` |
| CTA text | `text-corbeau`, `font-semibold` |
| CTA caption | `text-eyebrow`, `font-mono` |

---

## Out of scope

- A sixth belief. The set is five.
- Soft caveats ("of course, every business is different"). Banned by the docstring and by VOICE.md.
- Reordering the beliefs. The 01-to-05 order is the BRAND.md order.
- Linking each belief to a blog post. Inline link decoration would dilute the punch. (A future "read more" treatment is a separate brief.)
- A secondary CTA. The single Calendly CTA is the whole conversion ask.

---

## Component reference

File: `src/components/WhatIBelieve.tsx`

Top-of-file docstring spells out the "BUYER-CEO line that converts" and the "do not soften" rule.

Key bits:
- Data: `BELIEFS` array with `num`, `title`, `body`
- Wrapper: `<section id="what-i-believe" className="bg-bone">`
- List: `<ol className="flex flex-col gap-5 list-none p-0 m-0">`
- CTA row: `<div className="mt-14 flex flex-wrap items-center gap-4">`
- Server component.
