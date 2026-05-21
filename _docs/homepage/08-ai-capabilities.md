# H-08 — AI capabilities brief

A two-column section on the cream background. Left side is a four-item feature list (Agentic AI, Predictive Analytics, Intelligent Automation, Governance). Right side is a terminal mockup that streams agent activity above an "AI Stack" tag row. The section shows the AI work as software, not slideware.

---

## Purpose

- Demonstrate four concrete AI capabilities with one-paragraph descriptions each, not four bullet headings.
- Anchor at least one capability to a real number from the case studies (81% automation at EDGE).
- Show the work as a terminal feed so the buyer reads it as a running system, not a marketing graphic.
- Name the actual stack — SAP Business AI, Joule, BTP, Datasphere, Analytics Cloud, custom agents — so the technical reader can validate.

---

## Buyer alignment

Per BUYER-CEO.md, AI capability detail is "not what they're scanning for on first visit" — it's later in the priority order. But once the buyer has bought the credibility (H-01 to H-05), this section moves them from "this person knows ERP" to "this person actually does the AI work." The terminal feed is the artifact that closes that gap.

The headline language — "Not buzzwords. Real systems." — is for the buyer who has sat through ten SAP keynotes that all sounded the same. The four feature paragraphs deliberately mention specific products (SAP BTP, Datasphere, Analytics Cloud, Joule) so the buyer's CTO can tell whether the work is on-platform or speculative.

---

## Acceptance criteria

- [ ] Eyebrow reads "[ 02 · AI capabilities ]".
- [ ] Headline reads "AI on top of your ERP. Not buzzwords. Real systems." with the second sentence in `cc-emphasis-italic`.
- [ ] Sub reads "I build practical AI that works with your SAP data. Agentic AI, predictive models, intelligent automation. Things that actually move the needle."
- [ ] Renders four features in source order with their inline SVG icons.
- [ ] Right panel is a terminal mockup with macOS dots, `agent.erp — agentic pipeline` label, LIVE indicator, the `TerminalFeed` component streaming the five lines, a divider, and the six-tag AI Stack row.
- [ ] Right panel is sticky at `top-[84px]` on `lg+`.
- [ ] Two-column grid on `lg+` (`grid-cols-2 gap-14`), single column on smaller.
- [ ] Each feature has a 44px icon tile (papaya tint background, papaya stroke).
- [ ] AI Stack label uses `cc-cursor` (terminal blink) animation.
- [ ] Tag pills follow the same three-colour system as H-05 badges (papaya `p`, canyon `c`, green `g`).

---

## Copy specification

### Eyebrow

```
[ 02 · AI capabilities ]
```

### Headline

```
AI on top of your ERP. Not buzzwords. Real systems.
```

Split: `AI on top of your ERP.` normal, `Not buzzwords. Real systems.` in `cc-emphasis-italic`.

### Sub

```
I build practical AI that works with your SAP data. Agentic AI, predictive models, intelligent automation. Things that actually move the needle.
```

### Feature 1 — Agentic AI on SAP BTP

```
Autonomous AI agents that work inside your SAP landscape. Handle approvals, flag anomalies, route decisions. Not chatbots. Agents that take action.
```

### Feature 2 — Predictive Analytics

```
Forecast demand, cash flow, maintenance schedules from your ERP data. Built on SAP Datasphere and Analytics Cloud. Real models, not dashboards.
```

### Feature 3 — Intelligent Automation

```
Invoice matching, PO creation, journal entries. AI handles the repetitive work. Your team handles exceptions. 81% automation at EDGE Group.
```

### Feature 4 — AI Governance & Risk

```
Policies, oversight frameworks, compliance processes. Deploy AI without the legal risk. Satisfy regulators and stakeholders.
```

### Terminal feed lines (in source order)

1. `Anomaly detected: PO-4891 exceeds budget threshold by 23%`
2. `Agent action: Routed to CFO for approval`
3. `Cash flow forecast: Q3 shortfall predicted. Adjusting accruals.`
4. `Invoice matching: 847 of 852 auto-matched (99.4%)`
5. `Maintenance prediction: Asset MX-220 flagged. Schedule by Aug 15.`

Each line uses inline color: papaya/canyon for the actor or label, brand-green for success, corbeau for the bolded warning subject.

### Terminal header

```
agent.erp — agentic pipeline
```

### AI Stack tags (with colour key)

- `SAP Business AI` (papaya)
- `Joule` (canyon)
- `SAP BTP` (green)
- `Datasphere` (papaya)
- `Analytics Cloud` (canyon)
- `Custom Agents` (green)

### Stack label

```
AI Stack
```

---

## Layout

### Desktop (≥ 1024px)

`grid grid-cols-2 gap-14 items-start`. Left column: four `flex gap-4` rows, each with a 44px icon tile and a `<h4>` + `<p>` stack. Right column: terminal card with `cc-card`, `cc-scan-line`, sticky positioning at `top-[84px]`.

### Tablet / mobile (< 1024px)

`max-lg:grid-cols-1`. Terminal card max-width clamps to `500px` so it doesn't stretch.

---

## Design tokens used

| Element | Token / class |
|---|---|
| Section background | `bg-cream` |
| Card chrome | `cc-card`, `cc-scan-line` |
| Feature icon tile | `text-papaya` on `rgba(252,152,90,0.08)` background, papaya/[0.12] border |
| Feature title | `font-display font-bold` |
| Feature body | `text-night` |
| Terminal label | `text-silver`, `font-mono` |
| Terminal feed | `font-mono text-[0.78rem] leading-[1.7]` |
| LIVE dot | `bg-brand-green animate-pulse-dot` |
| Stack label | `text-silver`, `font-mono`, `cc-cursor` |
| Tag pills | three-color helper `tagStyle()` mirroring H-05 |

---

## Out of scope

- A live data feed. The five lines are static fixtures.
- A "Try the agent" demo. No live AI on the marketing page.
- Per-feature deep links. AI service detail pages live at `/ai-insights-shiftgearx-noeldcosta/` (S-30) and `/ai-governance-services/` (S-21).
- Pricing for AI engagements. Engagements are scoped — see CLAUDE.md.
- A fifth feature. Four is the chosen count.

---

## Component reference

File: `src/components/AICapabilities.tsx`

Companion: `src/components/TerminalFeed.tsx` (renders the rolling feed; receives `lines` as React nodes).

Key bits:
- Data: `FEATURES`, `TERMINAL_LINES`, `STACK_TAGS` arrays at top of file
- Helper: `tagStyle(type)` returns inline styles for the three pill colours
- Section id: `ai`
- Pure server component. The terminal feed itself may be client (see `TerminalFeed.tsx`).
