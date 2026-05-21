# H-05 — Case studies (track record) brief

A two-column section. Left column is a vertical list of five programmes. Right column is a sticky dashboard mockup that crossfades to match whichever programme is in the viewport. The interaction is the proof — the CEO sees the numbers shift as they scroll.

---

## Purpose

- Name five real programmes with companies the CEO buyer recognises.
- Put a hard number against each one — money saved, scale, scope.
- Use the dashboard mockup to feel like working software, not a brochure.
- Sustain the "I was in the room running these" claim with metrics that come from the same desc string the buyer is reading (no separate metrics-table where numbers can drift).

---

## Buyer alignment

Per BUYER-CEO.md, the buyer's second scan target is "named clients and named programmes," third is "numbers — money, scale, scope." This section is built around both. Five programmes is the right count — enough that the spread shows breadth, few enough that each one is read.

The sticky dashboard is for the buyer who scrolls slowly. As they read about EDGE, the right side shows EDGE's numbers; as they reach Etihad, the panel crossfades to Etihad's. The mechanic mirrors how their own teams present in SteerCo — left side narrative, right side dashboard. It is a deliberate piece of vocabulary-matching.

---

## Acceptance criteria

- [ ] Eyebrow reads "[ 03 · Track record ]".
- [ ] Headline reads "Programmes I've led. Not advised on. Led." with the second sentence in `cc-emphasis-italic`.
- [ ] Sub reads "Real companies. Real numbers. I was in the room running these."
- [ ] Renders all five `PROJECTS` entries in source order: EDGE Group, Etihad Airways, TII, DXC Technology, Govt. Enablement.
- [ ] Each row carries: company kicker, badge (papaya/green/canyon by `badgeType`), title, description.
- [ ] Right panel is a dashboard mockup with macOS traffic-light dots, a live dashboard label, a LIVE indicator, four metric tiles, a five-phase progress bar, and a tag row.
- [ ] Dashboard updates as the user scrolls. Single `IntersectionObserver` at thresholds `[0.5, 0.75, 1]` picks the row with the highest visible ratio.
- [ ] Crossfade duration is 320ms with the `[0.22, 1, 0.36, 1]` (quart-out) easing.
- [ ] When `prefers-reduced-motion: reduce` is set, fade duration drops to 0 and the y-translation is skipped (via `useReducedMotion`).
- [ ] Right panel is sticky at `top-[84px]` on `lg+` so it stays in view as the list scrolls past.
- [ ] On `<lg` the panel stacks under the list (sticky still applies, layout just changes).
- [ ] Active row carries `aria-current="true"`.
- [ ] Phase bar shows the active phase in papaya with a soft pulse, completed phases in brand-green, future phases muted.
- [ ] `AnimatePresence` uses `initial={false}` so first paint matches SSR and there's no hydration mismatch.

---

## Copy specification

### Eyebrow

```
[ 03 · Track record ]
```

### Headline

```
Programmes I've led. Not advised on. Led.
```

Split: `Programmes I've led.` in normal weight, `Not advised on. Led.` in `cc-emphasis-italic`.

### Sub

```
Real companies. Real numbers. I was in the room running these.
```

### Programme 1 — EDGE Group

Kicker: `EDGE Group`
Badge: `$60M saved` (papaya)
Title: `25 Defense Entities → One S/4HANA`
Desc: `Consolidated 8 legacy ERPs onto single S/4HANA core. 126-member team. 81% process automation across the entire defence group.`
Dashboard label: `edge.dashboard`
Metrics: Cost Reduction `$60M`, Automation `81%`, Team Size `126`, Legacy Systems `8 → 1`
Phase: `REALIZE`
Tags: `EDGE HQ`, `NIMR`, `HALCON`, `SIGN4L`, `AL TARIQ`, `+20 more`

### Programme 2 — Etihad Airways

Kicker: `Etihad Airways`
Badge: `$400M+ impact` (green)
Title: `SAP Centre of Excellence — 8 Years`
Desc: `Built route profitability on SAP. Flight-level P&L across 100+ aircraft and 1,000+ weekly flights. $36M in direct benefits.`
Dashboard label: `etihad.dashboard`
Metrics: Total Impact `$400M+`, Direct Benefit `$36M`, Aircraft `100+`, Weekly Flights `1,000+`
Phase: `DEPLOY`
Tags: `Finance`, `SAP COE`, `Route P&L`, `8 years`

### Programme 3 — TII

Kicker: `TII`
Badge: `Greenfield` (canyon)
Title: `S/4HANA Greenfield — 5 Research Entities`
Desc: `Dual-ledger Finance (cash + accrual, IPSAS). Cloud on Azure and AWS. Full lifecycle from blueprint through hypercare.`
Dashboard label: `tii.dashboard`
Metrics: Entities `5`, Architecture `Greenfield`, Ledger `Dual`, Reporting `IPSAS`
Phase: `DEPLOY`
Tags: `S/4HANA`, `Azure`, `AWS`, `Cash + Accrual`, `Hypercare`

### Programme 4 — DXC Technology

Kicker: `DXC Technology`
Badge: `$300M pipeline` (papaya)
Title: `Managing Partner — 800+ Consultants`
Desc: `SAP, Oracle, Microsoft practices across MEA. PIF entities, banking, public sector.`
Dashboard label: `dxc.dashboard`
Metrics: Pipeline `$300M`, Consultants `800+`, Practices `3`, Region `MEA`
Phase: `DEPLOY`
Tags: `SAP`, `Oracle`, `Microsoft`, `PIF`, `Banking`, `Public Sector`

### Programme 5 — Govt. Enablement

Kicker: `Govt. Enablement`
Badge: `84 entities` (canyon)
Title: `Digital Executive Advisor`
Desc: `SAP and Oracle landscape strategy. Oracle EBS to Fusion Cloud migration. Enterprise Architecture (TOGAF).`
Dashboard label: `govt.dashboard`
Metrics: Entities `84`, Migration `EBS → Fusion`, Framework `TOGAF`, Role `Advisor`
Phase: `REALIZE`
Tags: `Oracle EBS`, `Oracle Fusion`, `Enterprise Arch`, `Strategy`

### Phase bar labels (fixed)

```
DISCOVER  PREPARE  EXPLORE  REALIZE  DEPLOY
```

### LIVE indicator

```
LIVE
```

Green pulsing dot to the left of the word.

---

## Layout

### Desktop (≥ 1024px)

Two-column grid (`grid-cols-2 gap-14 items-start`). Left column is the project list; right column is the dashboard card. Card is `sticky top-[84px]`, so it sits ~16px below the fixed 64px nav.

### Tablet / mobile (< 1024px)

`max-lg:grid-cols-1` stacks the panel below the list. Panel max-width clamps to `500px` to avoid stretching on small viewports.

---

## Design tokens used

| Element | Token / class |
|---|---|
| Section background | `bg-bone` |
| Eyebrow | `text-papaya`, `font-mono` |
| Headline | `text-corbeau` |
| Headline emphasis | `cc-emphasis-italic` |
| Row title | `font-display font-bold` |
| Row desc | `text-night` |
| Card chrome | `cc-card`, `cc-scan-line` |
| Card border / divider | `border-corbeau/[0.06]` |
| Metric tile bg | `bg-cream` |
| Metric values | `text-papaya` / `text-brand-green` / `text-corbeau` (per data) |
| Active phase | `bg-papaya text-corbeau animate-soft-pulse` |
| Done phase | `bg-brand-green text-white` |
| Future phase | `text-silver`, `background: rgba(14,16,32,0.06)` |
| LIVE dot | `bg-brand-green animate-pulse-dot` |
| Tag pill | `bg-cream border border-corbeau/[0.06]` |

Badges:
- `p` (papaya): `background: rgba(252,152,90,0.12)`, `color: #fc985a`
- `g` (green): `background: rgba(34,197,94,0.12)`, `color: #22c55e`
- `c` (canyon): `background: rgba(226,130,107,0.12)`, `color: #e2826b`

---

## Out of scope

- A "view full case study" link per row. (Belongs to S-04 to S-08 detail pages.)
- A logo per row. Names only on the homepage block.
- A filter UI (industry, year, scale). Five items doesn't need filtering.
- Auto-rotation of the active row when the page is idle. The trigger is scroll, full stop.
- Real-time data feeds into the dashboard. Numbers are static, sourced from the desc string per the docstring rule.

---

## Component reference

File: `src/components/TrackRecord.tsx`

Top-of-file docstring explains the sticky/crossfade pattern and the "no invented metrics" rule.

Key bits:
- Data: `PROJECTS` array, `ALL_PHASES` constant, `badgeStyle()` helper
- State: `activeIdx` and `rowRefs` array of `HTMLDivElement | null`
- Hook: `useReducedMotion()` from framer-motion
- Single `IntersectionObserver` mounted in `useEffect` with thresholds `[0.5, 0.75, 1]`
- `'use client'` is required for the observer and AnimatePresence

Section id: `track`. Used by anchor links if needed.
