# Explainer tags for articles

Ten animated figures that explain a topic visually inside an article. Each one
is a single-line tag in the MDX body. The figure renders fully on the server
(every word is in the HTML for search engines, translation and screen
readers), then animates once when the reader scrolls to it. Readers with
reduced motion switch on see the finished figure with no animation. Every
figure has a small Replay button.

Preview all of them in development at `/dev-explainers/` (the route returns
404 in production).

## Rules that apply to every tag

1. **One line.** The whole opening tag must sit on one line and be closed with
   its own closing tag: `<explainer-flow ...></explainer-flow>`. A tag split
   across lines, or written as `<explainer-flow ... />`, breaks the page.
2. **Own paragraph.** Leave a blank line above and below the tag.
3. **Lists use `|`.** `steps="Plan|Build|Test"`.
4. **Pairs use `=>`.** `parts="Data migration => 8|Licences => 15"`, the same
   arrow `<decision-tree>` uses.
5. **Quotes.** Attribute values are wrapped in double quotes, so do not use a
   double quote inside a value. Apostrophes are fine.
6. **Numbers** are plain: `42`, `4.5`, `64,000`. Put currency and units in
   `prefix`, `suffix` or `unit`, not in the value.
7. **Use figures you can source.** Put the source in `source`. Do not invent
   numbers to fill a figure.
8. **One or two explainers per article.** They are for the idea that is hard
   to get from prose, not decoration.

### Attributes every tag accepts

| Attribute | Required | What it does |
|---|---|---|
| `title` | yes | Visible title, also the figure's accessible name. Sentence case. |
| `caption` | recommended | One line under the title saying what to notice. |
| `source` | optional | Shown under the figure as "Source: ...". |
| `source-label` | optional | Replaces the word "Source" (for translated MDX). `source-label=""` drops it. |
| `replay-label` | optional | Replaces the word "Replay" on the button (for translated MDX). |

### Translated articles

Translate the text inside the attributes (titles, captions, labels, notes).
Keep the structure identical to the English tag: same number of `|` items,
same `=>` pairs, same numbers, same `highlight` index. Set `replay-label`
and `source-label` in the target language, for example
`replay-label="Wiederholen" source-label="Quelle"`.

---

## 1. `explainer-flow`

A process where a pulse travels from step to step. Procure-to-pay,
record-to-report, an approval chain. 2 to 7 steps; up to 6 sit in a row on
wide columns, 7 always use a vertical rail.

**Syntax**

```html
<explainer-flow title="..." caption="..." steps="Step|Step|Step" notes="Note|Note|Note" result="..." source="..."></explainer-flow>
```

| Attribute | Notes |
|---|---|
| `steps` | Required. Step names, in order. |
| `notes` | Optional. One short line per step, same order. Leave a slot empty with `||`. |
| `result` | Optional. The outcome, shown with a tick after the last step. |

**Example**

```html
<explainer-flow title="Procure-to-pay in S/4HANA" caption="Every step posts to the Universal Journal, so the trail from request to payment sits in one table." steps="Purchase requisition|Purchase order|Goods receipt|Invoice receipt|Payment run" notes="ME51N, from MRP or a user|ME21N, approved by release strategy|MIGO posts stock and credits GR/IR|MIRO three-way match clears GR/IR|F110 clears the vendor open item" result="Vendor paid, and every posting traceable in ACDOCA"></explainer-flow>
```

## 2. `explainer-timeline`

Milestones drawn along a line. Dates, deadlines, programme phases. 2 to 7
items; horizontal on wide columns, vertical on phones.

**Syntax**

```html
<explainer-timeline title="..." caption="..." items="When => What|When => What" notes="Note|Note" highlight="1" source="..."></explainer-timeline>
```

| Attribute | Notes |
|---|---|
| `items` | Required. `when => what`. The "when" is shown large (a year, a date, a phase number). |
| `notes` | Optional. One line per item. |
| `highlight` | Optional. 1-based item number shown in accent (the date that matters). |

**Example**

```html
<explainer-timeline title="How long ECC stays supported" caption="2027 is the date that matters for planning. The later dates cost more and come with conditions." items="2027 => Mainstream maintenance ends|2030 => Optional extended maintenance ends|2033 => Private edition transition option ends" notes="31 December, for ECC 6.0 EHP 6 to 8|Extra fee, for customers who sign up|Only for customers moving to RISE with SAP" highlight="1" source="SAP maintenance announcements, February 2020 and February 2025"></explainer-timeline>
```

## 3. `explainer-cost-build`

A total built from its parts. A stacked bar grows part by part while the total
counts up; a legend lists every part with a proportional bar. 2 to 10 parts,
largest first reads best.

**Syntax**

```html
<explainer-cost-build title="..." caption="..." parts="Part => 42|Part => 15" notes="Note|Note" prefix="" suffix="%" total="" total-label="Total" highlight="" source="..."></explainer-cost-build>
```

| Attribute | Notes |
|---|---|
| `parts` | Required. `name => number`. |
| `notes` | Optional. One line under each part's name. |
| `prefix` / `suffix` | Wrap every number. Default suffix is `%`. For money use `prefix="$" suffix="K"`. |
| `total` | Optional. Your own headline instead of the counted sum, for example `total="$6.5M"`. |
| `total-label` | Text beside the total. Default "Total". `total-label=""` hides it. |
| `highlight` | Optional. 1-based part shown in accent. Default: the largest part. |

**Example**

```html
<explainer-cost-build title="Where a mid-market S/4HANA budget goes" caption="Integration work is the biggest line on the budget. The licence is not." parts="System integration and implementation => 43|Licences or subscription => 15|Customisation and BTP development => 10|Data migration => 8|Training and change management => 8|Infrastructure and cloud => 7|Contingency => 5|Hypercare => 4" suffix="%" total-label="of the programme budget" source="Midpoints of 2026 ranges, SAP implementation cost and budget breakdown"></explainer-cost-build>
```

## 4. `explainer-compare`

Two to four options compared criterion by criterion, revealed row by row. A
table on wide columns; on phones each criterion becomes a block listing the
options.

**Syntax**

```html
<explainer-compare title="..." caption="..." options="Option A|Option B|Option C" criteria="Criterion => [3] Value A ; [1] Value B ; [2] Value C|Criterion => Value A ; Value B ; Value C" highlight="" source="..."></explainer-compare>
```

| Attribute | Notes |
|---|---|
| `options` | Required. 2 to 4 option names (column headings). |
| `criteria` | Required. `criterion => value ; value ; value`, one value per option, separated by `;`. |
| `[0]` to `[3]` | Optional at the start of a value: draws a small level meter before the text. Always keep words after it. Use it consistently along a row ("how much"). |
| `highlight` | Optional. 1-based option column shown in accent. |

**Example**

```html
<explainer-compare title="Three ways off ECC" caption="The same five questions boards ask, answered for each path." options="Greenfield|Brownfield|Selective data transition" criteria="Process redesign => [3] Full, against SAP standard ; [1] Largely preserved ; [2] Chosen per unit|Historical data => [1] Open items and balances only ; [3] Fully carried forward ; [2] Selected scope|Technical debt => Removed ; Carried forward ; Reduced for the migrated scope|Change impact => [3] High ; [1] Lower ; [2] Moderate|Best for => Fragmented legacy, major redesign ; Stable, well-kept ECC ; Mergers, carve-outs, phased rollouts" highlight="3"></explainer-compare>
```

## 5. `explainer-cycle`

A loop. The active step travels round once and comes back to step one.
Sprints, plan-do-check-act, model monitoring, the close. 3 to 8 steps; up to
6 draw as a ring on wide columns, otherwise a numbered list with a loop-back
line.

**Syntax**

```html
<explainer-cycle title="..." caption="..." steps="Step|Step|Step" notes="Note|Note|Note" center="..." source="..."></explainer-cycle>
```

| Attribute | Notes |
|---|---|
| `steps` | Required. In loop order, starting at the top. |
| `notes` | Optional. One short line per step (keep under ~6 words for the ring). |
| `center` | Optional. The rule of the loop, shown in the middle (or as the loop-back line on phones). |

**Example**

```html
<explainer-cycle title="The build loop" caption="Each automation goes round this loop until it works. Feedback comes from a practitioner, not a quiz." steps="Learn|Build|Submit|Feedback|Fix" notes="One concept, one short lesson|A working automation|The run log and the output|Reviewed line by line|Ship the corrected version" center="Repeat until all three automations run"></explainer-cycle>
```

## 6. `explainer-layers`

An architecture stack that assembles from the foundation up. Clean core, a
data platform, an AI stack. 2 to 7 layers.

**Syntax**

```html
<explainer-layers title="..." caption="..." layers="Top layer => What lives there|...|Foundation => What lives there" tones="ai|data|apps|accent" source="..."></explainer-layers>
```

| Attribute | Notes |
|---|---|
| `layers` | Required. Top to bottom, `name => what lives there`. The bottom layer is built first. |
| `tones` | Optional, one per layer: `apps`, `data`, `ai` (the site's area colours, only when the colour means something), `accent` (the layer the figure is about), or empty for neutral. |

**Example**

```html
<explainer-layers title="A clean-core landscape, layer by layer" caption="The core stays standard. Everything that changes often lives above it." layers="AI and agents => Joule and agents act on governed data, never on raw tables|Data => Datasphere, one semantic layer for reporting and AI|Integration => Integration Suite and released APIs, no point-to-point code in the core|Extensions => BTP side-by-side apps and key-user extensibility|Core ERP => S/4HANA kept to standard, so every upgrade stays routine" tones="ai|data|apps|apps|accent"></explainer-layers>
```

## 7. `explainer-funnel`

A narrowing funnel with counts and the share that survives each stage. 2 to 7
stages, widest first. The last stage carries the accent.

**Syntax**

```html
<explainer-funnel title="..." caption="..." stages="Stage => 120|Stage => 46" notes="Note|Note" prefix="" suffix="" rates="true" source="..."></explainer-funnel>
```

| Attribute | Notes |
|---|---|
| `stages` | Required. `name => number`, widest first. |
| `notes` | Optional. One line under each stage. |
| `prefix` / `suffix` | Wrap the numbers, for example `prefix="$" suffix="M"`. |
| `rates` | Survival percentage between stages. Default on; `rates="false"` hides it. |

**Example** (illustrative numbers; use your own sourced counts)

```html
<explainer-funnel title="From AI idea to funded use case" caption="Most ideas stop at data readiness, not at the model." stages="Ideas raised by the business => 64|Have usable data today => 27|Pass the risk review => 15|Have a named business owner => 9|Funded for build => 4" source="Portfolio review, Q2 2026"></explainer-funnel>
```

## 8. `explainer-matrix`

A 2x2 to 4x4 grid where items drop into cells one by one. Likelihood by
impact, effort by value. The tint deepens towards the high/high corner.

**Syntax**

```html
<explainer-matrix title="..." caption="..." x-label="..." y-label="..." x-levels="Low|Medium|High" y-levels="Low|Medium|High" items="Item => 3,3|Item => 1,2" zones="Low|Moderate|Critical" source="..."></explainer-matrix>
```

| Attribute | Notes |
|---|---|
| `x-label` / `y-label` | Axis names. |
| `x-levels` / `y-levels` | Required. 2 to 4 levels each, low to high (`y-levels` runs bottom to top). |
| `items` | `name => x,y`, 1-based. `3,3` is the high/high corner of a 3x3. Keep names short (2 to 4 words). |
| `zones` | Optional, 2 or 3 labels low to high. Snaps the tint into bands along the diagonal, adds a legend, and outlines items in the top band in accent. |

**Example**

```html
<explainer-matrix title="Where AI use cases land on a risk heat map" caption="Prioritise by likelihood and business impact. Hiring, credit and access decisions sit in the critical corner." x-label="Likelihood" y-label="Impact" x-levels="Low|Medium|High" y-levels="Low|Medium|High" items="Credit limit approvals => 3,3|CV screening => 3,3|Access provisioning bot => 2,3|Invoice matching agent => 2,2|Demand forecast assistant => 2,1|Internal policy search => 1,2|Meeting summaries => 1,1" zones="Low|Moderate|Critical"></explainer-matrix>
```

## 9. `explainer-before-after`

One metric in two states. It plays "before", then switches to "after"; the
reader can flip between them with the toggle. Both values stay visible as
bars, and the change is shown as an absolute and a percentage.

**Syntax**

```html
<explainer-before-after title="..." caption="..." metric="..." before-label="Before" after-label="After" before-value="12" after-value="5" prefix="" unit="" before-points="Point|Point" after-points="Point|Point" source="..."></explainer-before-after>
```

| Attribute | Notes |
|---|---|
| `metric` | What is measured, shown above the big number. |
| `before-label` / `after-label` | Toggle and bar labels. Default "Before" / "After" (set them in translated MDX). |
| `before-value` / `after-value` | Required numbers. |
| `prefix` / `unit` | `prefix="$"` for money; `unit="days"` is written after the number. |
| `before-points` / `after-points` | Optional. What is true in each state; the toggle swaps them. |

**Example** (month-end close; replace the numbers with a sourced case)

```html
<explainer-before-after title="Month-end close after the Universal Journal" caption="FI and CO stop needing a reconciliation step once they share one journal." metric="Working days to close" before-label="ECC 6.0" after-label="S/4HANA" before-value="12" after-value="5" unit="days" before-points="FI and CO reconciled every period|Aggregate tables rebuilt overnight|Intercompany matched in spreadsheets" after-points="FI and CO share one journal (ACDOCA)|No aggregates to rebuild|Intercompany matched in the system" source="Client programme, 2024"></explainer-before-after>
```

## 10. `explainer-org`

A programme structure that appears role by role: a short reporting chain, the
roles under it, and an optional dashed "side" seat beside the top of the
chain. Up to 4 roles draw as a top-down tree on wide columns; 5 or 6 roles,
and phones, use a left spine.

**Syntax**

```html
<explainer-org title="..." caption="..." chain="Role => Owns|Role => Owns" side="Role => Owns" roles="Role => Owns|Role => Owns" highlight="side" source="..."></explainer-org>
```

| Attribute | Notes |
|---|---|
| `chain` | Required. 1 to 3 nodes, top down, `role => what they own` (the part after `=>` is optional). |
| `side` | Optional. One dashed node attached to the first chain node (independent advisor, design authority, PMO). |
| `roles` | 2 to 6 nodes reporting into the last chain node. |
| `highlight` | Optional. `side`, or a 1-based role number, shown in accent. |

**Example**

```html
<explainer-org title="Who owns what on an S/4HANA programme" caption="The advisor sits beside the sponsor, outside the SI's reporting line." chain="Executive sponsor => CFO, chairs the SteerCo|Programme director => Owns the plan, budget and RAID log" side="Independent advisor => Reports to the sponsor, not the SI" roles="Finance lead => FI/CO design and the close|Supply chain lead => MM, SD and PP processes|Data lead => Migration, cleansing, reconciliation|Integration lead => Interfaces, BTP and cutover" highlight="side"></explainer-org>
```

---

## For developers

- Components: `src/components/article/explainers/Explainer*.tsx` (client
  components). Shared playback, variants and the figure frame live in
  `core.tsx`; attribute parsing in `parse.ts`.
- Registration: `src/components/mdx/MdxBody.tsx` maps each tag name and adds
  it to the block list that stops react-markdown wrapping it in a `<p>`.
  `explainerProps` passes only string attributes to the client components.
- Styles: the `/* explainers */` section at the end of
  `src/app/nd-articles.css`. Theme tokens only (dark default and
  `[data-theme="light"]`); layouts switch on container queries against the
  figure body, and logical properties keep Arabic (RTL) correct.
- Playback contract: server HTML and the first client render are the finished
  figure (no hydration mismatch, nothing hidden for crawlers). After
  hydration a figure below the fold resets to its start state off screen and
  plays once on entering the viewport; a figure already on screen stays
  finished. Segments run 300 to 900 ms on ease `[0.2, 0.8, 0.2, 1]`.
  `prefers-reduced-motion: reduce` keeps the finished state and hides Replay.
