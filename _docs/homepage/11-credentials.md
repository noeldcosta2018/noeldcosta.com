# H-11 — Credentials / About brief

A short credentials strip. Four small tiles in a row, each with an icon, a credential name, and a one-line subtitle. The section answers "why this person, specifically" without turning into an About page.

---

## Purpose

- Repeat the four key credentials (CIMA & AICPA, Masters in Accounting, SAP Certified PM, Solution Architect) in iconified card form.
- Pair each with a one-line "what this means for you" subtitle.
- Stay short. This is a strip, not a biography.
- Set up the differentiation message: "Most SAP consultants understand the system. Few understand the business. I have both."

---

## Buyer alignment

Per BUYER-CEO.md, "senior credibility (CIMA, AICPA)" sits sixth in the scan priority — important but secondary to logos and outcomes. The same credentials appear in the hero credibility line; this section is the visual reinforcement after the buyer has already absorbed the case studies.

The headline "Not just a tech guy. I understand the numbers." is the section's job in one sentence. It maps directly to the BUYER-CEO line: "Most consultants understand the system. Few understand the close cycle, working capital, dual-ledger reporting." Two of the four tiles (CIMA & AICPA, Masters in Accounting) carry that signal explicitly.

---

## Acceptance criteria

- [ ] Eyebrow reads "[ 06 · Why this works ]".
- [ ] Headline reads "Not just a tech guy. I understand the numbers." with the second sentence in `cc-emphasis-italic`.
- [ ] Sub reads "Most SAP consultants understand the system. Few understand the business. I have both."
- [ ] Renders four credential tiles in source order.
- [ ] Each tile is centred: 44px icon tile (papaya tint), credential title, mono subtitle.
- [ ] Four-column grid on `lg+`, two-column on smaller.
- [ ] Tiles hover: border darkens, soft shadow appears.
- [ ] Section uses `bg-bone`, tile uses `bg-paper`.
- [ ] No CTA. No press strip (yet — see Known gaps).
- [ ] Server component. No `'use client'`.

---

## Copy specification

### Eyebrow

```
[ 06 · Why this works ]
```

### Headline

```
Not just a tech guy. I understand the numbers.
```

Split: `Not just a tech guy.` normal, `I understand the numbers.` in `cc-emphasis-italic`.

### Sub

```
Most SAP consultants understand the system. Few understand the business. I have both.
```

### Tile 1

Title: `CIMA & AICPA`
Sub: `Management Accounting`

### Tile 2

Title: `Masters in Accounting`
Sub: `Finance depth, not surface`

### Tile 3

Title: `SAP Certified PM`
Sub: `Activate · SAFe · ITIL`

### Tile 4

Title: `Solution Architect`
Sub: `End-to-end system design`

Note: tile 4 sub uses "End-to-end" which VOICE.md flags as overused. Worth revisiting in a copy pass — possibly "Full programme design" or similar.

---

## Layout

### Desktop (≥ 1024px)

`grid-cols-4 gap-3.5`. Each tile is centre-aligned, `bg-paper border border-corbeau/[0.06] rounded-xl px-5 py-6`. Icon tile sits centred at the top.

### Tablet (≥ 640px, < 1024px)

`max-lg:grid-cols-2` — two-by-two grid.

### Mobile (< 640px)

`max-sm:grid-cols-2` — still two columns even on small screens. Tiles are narrow enough to work at this width.

---

## Design tokens used

| Element | Token / class |
|---|---|
| Section background | `bg-bone` |
| Tile background | `bg-paper` |
| Tile border | `border-corbeau/[0.06]`, hover `border-corbeau/[0.12]` |
| Tile hover shadow | `shadow-[0_4px_20px_rgba(14,16,32,0.04)]` |
| Eyebrow | `text-papaya`, `font-mono` |
| Headline | `text-corbeau` |
| Headline emphasis | `cc-emphasis-italic` |
| Sub body | `text-night` |
| Icon colour | `text-papaya` on `rgba(252,152,90,0.08)` |
| Tile title | `font-display font-bold` |
| Tile sub | `text-eyebrow`, `font-mono` |

---

## Out of scope

- A "view full CV" link. About-page detail lives at `/sap-erp-consultant-my-story-noel-dcosta/` (S-01).
- Year badges per credential.
- A timeline of the credentials.
- A fifth tile. Four is the chosen count.
- Inline LinkedIn link. LinkedIn icon already appears in the hero and footer.

---

## Known gaps

The "Featured on" press strip (SAP Press, MSN, LinkedIn, IPS, Techbullion, The Next Disruption) is supposed to live in this section per the H-01 brief, but is not yet implemented in `Credentials.tsx`. When it lands it sits below the credential tile row as a quiet logo strip, mirroring H-02 in form but with media logos. Flagging as a known gap rather than building it ad hoc.

---

## Component reference

File: `src/components/Credentials.tsx`

Data: top-of-file `CREDS` array with `title`, `sub`, `icon` (inline SVG).

Key classes:
- Section: `bg-bone` with fluid padding
- Tile root: `bg-paper border border-corbeau/[0.06] rounded-xl px-5 py-6 text-center`
- Icon container: `w-11 h-11 rounded-[10px]`
- Server component.
