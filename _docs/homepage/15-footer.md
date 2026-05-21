# H-15 — Footer (global) brief

The site-wide footer. Brand block plus three link columns (Solutions, Free Tools, Company), then a bottom row with copyright and two utility links.

---

## Purpose

- Give every page a sitemap-grade list of the seven content pillars and five tools.
- Hold the "Consulting Career" pillar that is deliberately not in the top nav.
- Surface the social links (LinkedIn, YouTube, email) in icon-button form.
- Restate the Quantinoid LLC line for legal attribution.
- Keep the bottom row narrow: copyright on the left, Privacy and Support on the right.

---

## Buyer alignment

Per BUYER-CEO.md the buyer rarely scrolls into the footer in their first 90 seconds. It does the job for the buyer who comes back later, the SEO crawler that needs the full internal link map, and the consultant who landed on the homepage and is looking for the "Consulting Career" pillar that doesn't appear in the nav.

The brand description in the footer ("ERP, Data & AI consulting. 25+ years helping companies get real value from SAP, Oracle, and AI systems.") is the only place on the homepage that uses "consulting" as a self-label rather than "advisory." Worth tightening to match the senior-advisor positioning, but lower priority than the body copy.

---

## Acceptance criteria

- [ ] Section background is `bg-corbeau`, text colour `text-moon`.
- [ ] Outer padding: `clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem) 2rem`.
- [ ] Inner container is `max-w-[1200px] mx-auto`.
- [ ] Top grid is four-column on `lg+` (`grid-cols-[1.5fr_1fr_1fr_1fr]`), two-column on `<lg`, one-column on `<sm`.
- [ ] First column: brand wordmark (variant `on-dark`, height 32), brand blurb, three social icon buttons.
- [ ] Second column: Solutions heading + seven links.
- [ ] Third column: Free Tools heading + five links.
- [ ] Fourth column: Company heading + four links (About, Case Studies, YouTube, Contact).
- [ ] Bottom row carries the copyright line on the left and Privacy + Support on the right.
- [ ] External links (YouTube) carry `target="_blank" rel="noopener noreferrer"`; internal links use Next.js `Link`.
- [ ] Section headings render in mono uppercase silver.
- [ ] All link hovers darken to `text-bone`.
- [ ] Server component. No `'use client'`.

---

## Copy specification

### Brand blurb

```
ERP, Data & AI consulting. 25+ years helping companies get real value from SAP, Oracle, and AI systems.
```

Max width 280px so it doesn't fight the link columns.

### Solutions column (seven links)

1. `ERP Implementation` → `/category/erp-implementation`
2. `Platforms & Modules` → `/category/platforms-modules`
3. `ERP Strategy` → `/category/erp-strategy`
4. `AI Governance` → `/category/ai-governance`
5. `Agentic AI` → `/category/agentic-ai`
6. `Case Studies` → `/category/case-studies`
7. `Consulting Career` → `/category/consulting-career` (footer-only — not in Nav)

Column heading: `Solutions`

### Free Tools column (five links)

1. `ERP Cost Calculator` → `/erp-implementation-cost-calculator`
2. `SAP Cost Calculator` → `/sap-implementation-cost-calculator`
3. `Migration Estimator` → `/free-data-migration-estimator-sap-oracle-microsoft`
4. `JD Generator` → `/sap-job-description-generator`
5. `Solution Builder` → `/sap-solution-builder`

Column heading: `Free Tools`

### Company column (four links)

1. `About` → `/about`
2. `Case Studies` → `/category/case-studies`
3. `YouTube` → `https://www.youtube.com/@NoelDCostaERPAI` (external)
4. `Contact` → `/contact-noel-erp-support`

Column heading: `Company`

### Social icon buttons

1. LinkedIn → `https://www.linkedin.com/in/noeldcosta/`
2. YouTube → `https://www.youtube.com/@NoelDCostaERPAI`
3. Email → `mailto:solutions@noeldcosta.com`

Each is a 36px (`w-9 h-9`) square with the `bg-haiti` background and a moon-colored stroke icon.

### Bottom row

Copyright:
```
© 2026 Noel D'Costa · Quantinoid LLC
```

Utility links (right side):
- `Privacy` → `/privacy-policy-noeldcosta`
- `Support` → `/contact-noel-erp-support`

---

## Layout

### Desktop (≥ 1024px)

Four-column grid `grid-cols-[1.5fr_1fr_1fr_1fr] gap-8`. Bottom row is `flex justify-between items-center pt-8 flex-wrap gap-4` with a top divider `border-t border-white/[0.06]`.

### Tablet (< 1024px)

`max-lg:grid-cols-2`. Brand block and one link column share row 1, two more link columns share row 2.

### Mobile (< 640px)

`max-sm:grid-cols-1`. Everything stacks. Bottom row stays as `flex-wrap` so copyright and utility links wrap cleanly.

---

## Design tokens used

| Element | Token / class |
|---|---|
| Section background | `bg-corbeau` |
| Default text colour | `text-moon` |
| Brand blurb | `text-silver` |
| Social button bg | `bg-haiti` |
| Social button hover | `bg-white/10`, text `text-bone` |
| Column heading | `text-silver`, `font-mono` |
| Link rest | `text-moon` |
| Link hover | `text-bone` |
| Top divider | `border-white/[0.06]` |
| Copyright | `text-silver`, `font-mono` |
| Utility links | `text-silver`, hover `text-moon` |

---

## Out of scope

- A newsletter signup. Per PRD this is deferred (`for-consultants` phase 2).
- A site search.
- A locale picker.
- A "sitemap" page link. The footer is the sitemap for users.
- A Terms of Service link — deliberately removed per inline comment in the component until the page exists (no WordPress equivalent in PRD).
- A blog or RSS link in the Company column.

---

## Component reference

File: `src/components/Footer.tsx`

Companion: `src/components/BrandWordmark.tsx` (`on-dark` variant here).

Key bits:
- Three local arrays inside the component body: `solutions`, `tools`, `company`
- Inline SVGs for the three social icons (no lucide here for these specific glyphs)
- Inline comment near the bottom explaining the missing Terms link
- Pure server component.
