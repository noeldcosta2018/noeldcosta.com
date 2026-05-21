# H-09 — Tools brief

Two product cards on a dark background. Command Central (implementation tracker) and ERPCV (consultant career pack). The section says: I don't just advise, I build.

---

## Purpose

- Surface the two commercial products on the homepage without making the buyer hunt for them.
- Reinforce the "personal brand who builds tools" positioning from BRAND.md.
- Keep each card short — name, type, one-line title, one paragraph, one outbound link.
- Let the CEO ignore ERPCV cleanly (it is consultant-facing) while the consultant audience finds it.

---

## Buyer alignment

For the CEO buyer this section is secondary. Per BUYER-CEO.md they don't care about tools on first visit. But the Command Central card reinforces the "in the room running these" claim from H-05 — the buyer's PM tool was built by the same person they are considering hiring. That is a credibility signal even when they don't intend to use the product.

For the consultant audience that landed here from a YouTube link, the ERPCV card is the path into erpcv.com. Per CLAUDE.md these two audiences must not be cross-pollinated in copy — they sit in two physically separate cards on the same dark band, with distinct `type` labels (`Implementation` vs `Career`) so each reader sees their own.

---

## Acceptance criteria

- [ ] Eyebrow reads "[ 04 · Built by me ]".
- [ ] Headline reads "Tools I build for the ERP world." with "for the ERP world." in `cc-emphasis-italic`.
- [ ] Sub reads "I don't just advise. I build products. Used by consultants and companies across 130+ regions."
- [ ] Two cards in a `grid-cols-2 gap-6`, stacking on `<lg`.
- [ ] Each card has a header strip with the product icon, name, and type pill, plus a body block with title, paragraph, and CTA link.
- [ ] Cards have the spotlight hover effect (`cc-spotlight`, mousemove → CSS vars).
- [ ] Cards hover-lift (`-translate-y-[3px]`) and add a 12/40 black shadow.
- [ ] External links open in a new tab with `rel="noopener noreferrer"`.
- [ ] Section uses `bg-corbeau text-bone`.
- [ ] Component is `'use client'` because of the mousemove handler.

---

## Copy specification

### Eyebrow

```
[ 04 · Built by me ]
```

### Headline

```
Tools I build for the ERP world.
```

`Tools I build` in normal weight, `for the ERP world.` in `cc-emphasis-italic`.

### Sub

```
I don't just advise. I build products. Used by consultants and companies across 130+ regions.
```

Note: this sub uses the "I don't just X, I Y" pattern that VOICE.md flags. Keep on the radar for a future copy pass — it likely needs rewriting to comply.

### Card 1 — Command Central

Name: `Command Central`
Type pill: `Implementation`
Title:
```
Track your ERP implementation in one place.
```
Body:
```
Progress, risks, milestones, team performance. Built because every project I walked into had tracking spread across 15 different spreadsheets. Real-time dashboards. Not another status deck.
```
CTA: `Explore Command Central →`
Href: `https://commandcc.io`

### Card 2 — ERPCV

Name: `ERPCV`
Type pill: `Career`
Title:
```
Stop losing interviews you should be winning.
```
Body:
```
6-document career pack. Executive CV, project portfolio, cover letter, interview prep, LinkedIn messages, reference sheet. 1,200+ packs delivered. 89% more interviews. $19.99 one-time.
```
CTA: `Try ERPCV free →`
Href: `https://erpcv3.vercel.app/`

---

## Layout

### Desktop (≥ 1024px)

Two cards side-by-side. Card chrome: header strip (icon + name + type pill) on a 3% white wash, divider, then a `p-6` body block with title, paragraph, and CTA.

### Tablet / mobile (< 1024px)

`max-lg:grid-cols-1`. Cards stack at full width inside the standard container.

---

## Design tokens used

| Element | Token / class |
|---|---|
| Section background | `bg-corbeau` |
| Section text | `text-bone` |
| Card background | `bg-haiti` |
| Card border | `border-white/[0.06]`, hover `border-papaya/20` |
| Header strip background | `bg-white/[0.03]` |
| Icon colour | `text-papaya` |
| Type pill | `text-papaya` on `rgba(252,152,90,0.1)` |
| Card title | `text-bone`, `font-display font-extrabold` |
| Card body | `text-moon` |
| CTA | `text-papaya`, hover `text-[#fdaa78]` |
| Spotlight | `cc-spotlight` |

---

## Out of scope

- Inline product previews or demos.
- A pricing table (ERPCV pricing is one phrase in the body; Command Central is a separate site).
- Comparison cards across other products.
- A third card. The two products are the homepage set.
- Internal anchor scrolls. Both CTAs are outbound to the product sites.

---

## Known gaps

The component carries a top-of-file `// TODO` block flagging that this section currently shows the commercial products, but a future change will repurpose it to list the five LLM tools (ERP Cost Calculator, SAP Cost Calculator, Migration Estimator, JD Generator, Solution Builder). When that change lands, the data array and the eyebrow ("Built by me") will need updating, and this brief should be revised.

This is also why the H-09 section eyebrow currently reads "[ 04 · Built by me ]" while H-06 (How I work) also reads "[ 04 · How I work ]". The kicker numbering across the homepage is inconsistent and should be reconciled in a separate pass once the section list is finalised.

---

## Component reference

File: `src/components/Tools.tsx`

Key bits:
- Data: `TOOLS` array (currently two entries: Command Central and ERPCV)
- Section id: `tools` (linked from H-04 services CTA)
- `'use client'` directive at the top — required for the spotlight mousemove
- TODO comment block at top of file flagging the planned shift to the five LLM tools
