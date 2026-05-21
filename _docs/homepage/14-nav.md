# H-14 — Nav (global) brief

The site-wide top navigation. Fixed glass bar, brand wordmark, Solutions and Tools dropdowns, two flat links (Case Studies, About), and a papaya Contact button. Full-screen drawer on mobile.

---

## Purpose

- Get the buyer to the four pages they actually need: a category, a tool, case studies, about.
- Surface the six content pillars and the five LLM tools without burying them three clicks deep.
- Keep the Contact CTA visible at all times.
- On mobile, give a full-screen drawer with staggered link reveal — feels like a curtain, not a popup.

---

## Buyer alignment

Per BUYER-CEO.md, the buyer spends under 90 seconds on first visit. The nav has to land them on either case studies, about, or contact within one click without making them think. Two flat links and one accented Contact button do that.

The Solutions dropdown is for the buyer who arrived on a category page from search and wants to see related content. The Tools dropdown is for the consultant audience that came from YouTube or a newsletter — per CLAUDE.md these audiences must not be mixed in body copy, but the nav can route them both via discrete menu items.

"Consulting Career" is deliberately footer-only per CLAUDE.md. Not in the Solutions dropdown.

---

## Acceptance criteria

- [ ] Fixed to the top of the viewport (`position: fixed`), 64px tall, `z-index: 50`.
- [ ] Background is the glass wash `rgba(244, 237, 228, 0.92)` with 20px `backdropFilter` blur, plus a 1px corbeau/[0.1] bottom border.
- [ ] Brand wordmark on the left links to `/`, uses the `BrandWordmark` component (variant `on-light`, height 28).
- [ ] Desktop (`md+`) shows a flat link row: Solutions ▾, Tools ▾, Case Studies, About, Contact.
- [ ] Solutions dropdown lists six pillars in source order: ERP Implementation, Platforms & Modules, ERP Strategy, AI Governance, Agentic AI, Case Studies.
- [ ] Tools dropdown lists five tools in source order: ERP Cost Calculator, SAP Cost Calculator, Migration Estimator, JD Generator, Solution Builder.
- [ ] Each dropdown item has a bold label and a one-line muted blurb.
- [ ] Contact link is the only papaya button in the bar.
- [ ] Dropdowns close on outside click and on route change (`usePathname`).
- [ ] On scroll past 10px, `scrolled` state flips (not currently visible-state — placeholder for a future shadow).
- [ ] Mobile (`<md`) shows a 44px hamburger button (`☰` / `×`) instead of the link row.
- [ ] Mobile drawer is a full-screen overlay starting at `top: 64px`, fades in at 300ms.
- [ ] Drawer body locks page scroll via `MobileDrawerScrollLock` while open.
- [ ] Drawer items reveal with a 60ms stagger using the `cubic-bezier(0.22, 1, 0.36, 1)` easing.
- [ ] Drawer carries three section headings — Solutions, Tools, Company — followed by their respective links plus About and Contact under Company.
- [ ] All interactive elements meet the 44px touch target (`min-h-[44px]`).
- [ ] `'use client'` directive present — the nav needs state, route detection, and scroll listeners.

---

## Copy specification

### Brand

```
noeldcosta — home
```

Used as the `aria-label` on the home link.

### Desktop link labels

- `Solutions`
- `Tools`
- `Case Studies`
- `About`
- `Contact` (papaya button)

### Solutions dropdown items (label + blurb)

1. `ERP Implementation` — `Delivery playbooks, programme recovery, go-live readiness.` → `/category/erp-implementation`
2. `Platforms & Modules` — `SAP S/4HANA, Oracle, Dynamics — module-level deep dives.` → `/category/platforms-modules`
3. `ERP Strategy` — `Roadmaps, TCO, vendor selection, transformation design.` → `/category/erp-strategy`
4. `AI Governance` — `Policy, risk, controls, model oversight on ERP data.` → `/category/ai-governance`
5. `Agentic AI` — `Autonomous agents in the ERP stack — what actually works.` → `/category/agentic-ai`
6. `Case Studies` — `Real programme outcomes — aviation, government, retail.` → `/category/case-studies`

Note: blurbs 2 and 5 use the em-dash pattern that VOICE.md flags. Worth revisiting in a future copy pass — but they are blurbs not body copy, so the priority is lower.

### Tools dropdown items

1. `ERP Cost Calculator` — `LLM-estimated cost band for any ERP programme.` → `/erp-implementation-cost-calculator`
2. `SAP Cost Calculator` — `SAP-specific cost, licence, and resourcing estimate.` → `/sap-implementation-cost-calculator`
3. `Migration Estimator` — `Data migration effort — SAP, Oracle, Microsoft.` → `/free-data-migration-estimator-sap-oracle-microsoft`
4. `JD Generator` — `Role-accurate SAP job descriptions in seconds.` → `/sap-job-description-generator`
5. `Solution Builder` — `Sketch a solution architecture from a plain-English brief.` → `/sap-solution-builder`

### Mobile drawer section headings

```
Solutions
Tools
Company
```

Company section contains: `About` → `/about`, `Contact` → `/contact-noel-erp-support`.

### Other routes used

- `Case Studies` flat link → `/category/case-studies`
- `About` flat link → `/about`
- `Contact` button → `/contact-noel-erp-support`

---

## Layout

### Desktop (≥ 768px)

Fixed bar, 64px tall. Inner container `maxWidth: 1480, padding: 0 24px`. Brand left, link `ul` right with `gap-6`. Dropdowns position `absolute left-0 top-full mt-1 w-[360px]`.

### Mobile (< 768px)

Bar shrinks to brand + hamburger. Drawer covers the full viewport below the bar (`top: 64`). Items in a `flex flex-col gap-1`, each at `text-[1.05rem] py-3 min-h-[44px]`.

---

## Design tokens used

| Element | Token / class |
|---|---|
| Bar background | `rgba(244, 237, 228, 0.92)` (cream with alpha) |
| Bar bottom border | `rgba(14, 16, 32, 0.1)` |
| Link colour | `var(--cc-text-primary)` |
| Link font | `var(--font-display)` (Epilogue) |
| Contact button bg | `var(--cc-papaya)` |
| Contact button text | `var(--cc-corbeau)` |
| Dropdown card | `bg-bone border border-corbeau/[0.08] rounded-lg shadow-xl` |
| Dropdown item hover | `bg-corbeau/[0.04]` |
| Mobile drawer bg | `rgba(244, 237, 228, 0.96)` + 20px blur |
| Drawer headings | `text-eyebrow`, `font-mono` |
| Drawer easing | `cubic-bezier(0.22, 1, 0.36, 1)` |

Note: large parts of the desktop link styling are inline-style objects rather than Tailwind classes. Worth tokenising in a polish pass — flagged but not fixed.

---

## Out of scope

- A search bar in the nav.
- A language switcher (multi-language is deferred per PRD Out of scope).
- A theme toggle. Single-mode site.
- A "Book a call" CTA in the nav. Contact is the only nav-level conversion ask; Calendly lives inside H-07 and H-13.
- A sticky shadow on scroll (the `scrolled` state is wired but currently unused).
- An "Industries" or "About" mega-menu. About is a flat link.

---

## Component reference

File: `src/components/Nav.tsx`

Companion: `src/components/BrandWordmark.tsx` (renders the wordmark in `on-light` or `on-dark` variants).

Key bits:
- Data: `PILLARS` (6) and `TOOLS` (5) arrays at top of file
- State: `scrolled`, `mobileOpen`, `openMenu`
- Hooks: `usePathname`, three `useEffect`s for scroll listener, outside-click, route-change cleanup
- `MobileDrawerScrollLock` sub-component for body scroll lock
- `'use client'` required.
