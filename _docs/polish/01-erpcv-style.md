# P-01 — ERPCV style polish pass (v2)

This is a cross-cutting visual upgrade of the homepage to match
the ERPCV editorial style. Not a rebuild. A polish pass.

This brief is based on Noel's actual ERPCV source code (the
`MarketingLayout.tsx` and landing page files he shared). Patterns
should be copied directly from there. ERPCV is the canonical
sibling site — same designer, same hand.

The site already works structurally. The voice is right. Section
eyebrows, dark/light alternation, dashboard mockups, heavy
Epilogue, papaya accent — all in.

What's missing is the editorial layer that makes ERPCV feel
distinctive.

---

## Goal

Apply the visual signatures of erpcv.com to noeldcosta-com.vercel.app
so the two properties read as siblings — same designer, same hand.

Reference: erpcv.com home page, and Noel's `erpcv3` repo source code
for the exact patterns.

---

## Out of scope

- Site structure or section order
- Section copy (except FAQ which is new)
- Component architecture
- Color tokens
- The hero copy (only adding to it, not rewriting)
- Navigation, footer
- The "Who I help" section (separate task)

---

## What you're touching

Six discrete passes, in this order:

1. Italic emphasis on section headlines (correct font treatment)
2. Pulse-dot eyebrow on the hero
3. Grid texture backgrounds (hero faint, final CTA visible)
4. Stats strip in the hero
5. Polish device chrome on agent.erp and programme.dashboard cards
6. Add FAQ section before final CTA

Plus optional pass 7: logo wall (depends on F-09)

---

## Pass 1 — Italic emphasis (the signature move)

**This was wrong in the previous brief. Correct treatment below.**

The ERPCV italic emphasis is NOT a separate serif font. It's the
**same display font** (Epilogue), in **italic style** at **weight
300** (light), in **canyon color**. The combination of italic +
light weight in a heavy display sans is what creates the flowing
editorial feel.

### From ERPCV source — exact pattern

In every section headline that uses two-clause emphasis, the
emphasized clause is wrapped:

```tsx
<h2 className="cc-display" style={{ fontWeight: 700, fontSize: 'clamp(32px, 5vw, 44px)', lineHeight: 1.05, color: C.corbeau }}>
  Your experience is a 10.{' '}
  <span style={{ fontStyle: 'italic', fontWeight: 300, color: C.canyon }}>Your CV is a 3.</span>
</h2>
```

Three things make it work:
- `fontStyle: 'italic'`
- `fontWeight: 300` (NOT bold, NOT regular — light)
- `color: C.canyon` (the coral pink, ~#f08577)

The rest of the headline stays at normal display weight (700-900)
in corbeau.

### Implementation as a CSS utility class

In `src/app/globals.css`, add:

```css
.cc-emphasis-italic {
  font-style: italic;
  font-weight: 300;
  color: var(--cc-canyon);
}
```

Then use as:

```tsx
<h2 className="cc-display ...">
  Most ERP projects fail.{' '}
  <span className="cc-emphasis-italic">Yours doesn't have to.</span>
</h2>
```

### Where to apply

Find every section headline that currently uses two-color emphasis
(black first clause, canyon-coral second clause) and wrap the
emphasized clause with `<span className="cc-emphasis-italic">`.

| Section | Headline | Wrap in italic span |
|---|---|---|
| ProblemStats | "Most ERP projects fail. Yours doesn't have to." | `Yours doesn't have to.` |
| AICapabilities | "AI on top of your ERP. Not buzzwords. Real systems." | `Not buzzwords. Real systems.` |
| TrackRecord | "Programmes I've led. Not advised on. Led." | `Not advised on. Led.` |
| Tools | "Tools I build for the ERP world." | `for the ERP world.` |
| Credentials | "Not just a tech guy. I understand the numbers." | `I understand the numbers.` |
| Testimonials | "They'll tell you what it's like." | `what it's like.` |
| YouTubeSection | "Videos from the field. Not theory. Real projects." | `Not theory. Real projects.` |

### Do NOT apply

- H-01 hero headline (`I run ERP transformations the board can defend.`)
  — single-clause power statement, stays pure
- Final CTA (`Your next transformation starts with a conversation.`)
  — already strong, no italic needed
- Section eyebrows (`[ 02 · AI CAPABILITIES ]`)
- Card titles, body copy

### Why

It's ERPCV's editorial signature. Without it, noeldcosta reads as
a competent template. With it, it reads as the sibling of a
designed product.

---

## Pass 2 — Pulse-dot eyebrow on the hero

ERPCV's hero opens with a pulsing dot + monospace caps label, not
just a label. Add this pattern.

### From ERPCV source — exact pattern

```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
  <span className="cc-pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cc-accent)' }} />
  <span className="cc-mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--cc-text-muted)', textTransform: 'uppercase' }}>
    ERP · AI · 25 YEARS
  </span>
</div>
```

### Implementation

In `Hero.tsx`, replace the current eyebrow:

```tsx
<p className="text-sm font-medium tracking-wider text-[var(--cc-accent)] mb-4">
  ERP · AI · 25 years
</p>
```

with the pulse-dot pattern above.

The `cc-pulse-dot` class should already exist in globals.css. If
it doesn't, add:

```css
@keyframes cc-pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.3); }
}

.cc-pulse-dot {
  animation: cc-pulse-dot 2s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .cc-pulse-dot { animation: none; }
}
```

### Why

Adds life to the eyebrow. ERPCV's hero feels active because of
this. Static labels feel templated.

---

## Pass 3 — Grid texture backgrounds

ERPCV uses grid texture on the BeforeAfter section (dark bg) and
the FinalCTA (orange bg). For noeldcosta, we want it on the hero
(light bg) and the final CTA (orange bg).

### From ERPCV source — exact pattern

For dark backgrounds (white grid lines):

```tsx
<div style={{
  position: 'absolute', inset: 0, opacity: 0.03,
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
  backgroundSize: '40px 40px'
}} />
```

For light backgrounds, invert: corbeau lines at low opacity.

### Hero grid (faint)

Add to `globals.css`:

```css
.cc-grid-faint {
  background-image:
    linear-gradient(to right, rgba(14, 16, 32, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(14, 16, 32, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
}
```

In `Hero.tsx`, add to the section wrapper:

```tsx
<section className="relative bg-[var(--cc-page-bg)] cc-grid-faint py-16 md:py-24 lg:py-32 overflow-hidden">
```

It sits beneath the existing `cc-glow-warm` decorative layer.

### Final CTA grid (more visible)

In `CTABanner.tsx` — copy the inline pattern from ERPCV's FinalCTA:

```tsx
<div style={{
  position: 'absolute', inset: 0, opacity: 0.1,
  backgroundImage: 'linear-gradient(rgba(14,16,32,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(14,16,32,0.5) 1px, transparent 1px)',
  backgroundSize: '40px 40px'
}} />
```

Place inside the orange gradient block, before the content.

---

## Pass 4 — Stats strip in the hero

Below the existing credibility line + LinkedIn icon, add a four-stat
horizontal strip with hard delivery numbers.

ERPCV's equivalent: "2,560+ career packs delivered" + avatars.
For a CEO buyer, the equivalent is hard programme numbers.

### Content

```
$700M+              84               25                 5
DELIVERED           ENTITIES         YEARS              CONTINENTS
ACROSS PROGRAMMES   CONSOLIDATED     IN ERP             OF DELIVERY
```

### Layout

Inline-styled to match ERPCV's pattern (not Tailwind-only). New row
below the existing flex of credibility + LinkedIn:

```tsx
<div style={{
  marginTop: 32,
  display: 'flex',
  alignItems: 'center',
  gap: 32,
  flexWrap: 'wrap',
}}>
  {[
    { num: '$700M+', label: 'delivered across programmes' },
    { num: '84', label: 'entities consolidated' },
    { num: '25', label: 'years in ERP' },
    { num: '5', label: 'continents of delivery' },
  ].map((s, i) => (
    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
      <div>
        <div className="cc-display" style={{
          fontWeight: 800,
          fontSize: 28,
          color: 'var(--cc-text-primary)',
          lineHeight: 1,
        }}>
          {s.num}
        </div>
        <div className="cc-mono" style={{
          marginTop: 6,
          fontSize: 10,
          color: 'var(--cc-text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          {s.label}
        </div>
      </div>
      {i < 3 && (
        <div style={{
          width: 1,
          height: 40,
          background: 'var(--cc-card-border)',
        }} />
      )}
    </div>
  ))}
</div>
```

### Mobile

The dividers will wrap and look odd on narrow screens. Add a
media query or use `flex-wrap` with `gap` so stats stack into
a 2x2 grid below 768px. The dividers can be hidden on mobile via
a class like `hidden md:block`.

### Why

CEO buyer sees: dollar delivered, entities consolidated, years,
geographic reach. Four numbers, four different proofs. Pairs with
the named clients in the sub.

---

## Pass 5 — Device chrome on dashboard cards

The agent.erp and programme.dashboard cards already have decent
chrome (macOS dots, mono labels). Polish them to match ERPCV's
treatment.

### From ERPCV source — exact pattern

ERPCV's CapabilityATS and CapabilityInterview cards use:

```tsx
<div className="cc-card" style={{
  borderRadius: 16,
  padding: 24,
  position: 'relative',
  overflow: 'hidden'
}}>
  <div className="cc-scan-line" />

  {/* macOS dots + label header */}
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => (
          <span key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: 'rgba(14,16,32,0.15)'
          }} />
        ))}
      </div>
      <span className="cc-mono" style={{
        fontSize: 10,
        color: 'var(--cc-text-muted)',
        letterSpacing: '0.05em',
        marginLeft: 12
      }}>
        agent.erp · agentic pipeline<span className="cc-cursor" />
      </span>
    </div>
  </div>

  {/* content rows with cc-fade-row + staggered animation-delay */}

  {/* footer with score and gap badge */}
  <div style={{
    marginTop: 24,
    paddingTop: 16,
    borderTop: '1px solid rgba(14,16,32,0.1)'
  }}>
    {/* footer content */}
  </div>
</div>
```

### Changes to noeldcosta cards

`AICapabilities.tsx` (agent.erp) and `TrackRecord.tsx`
(programme.dashboard):

1. **Confirm `cc-card` class is applied** to the outer card.
2. **Confirm border-radius is 16px** (not less).
3. **Confirm the mono label has `cc-cursor`** at the end (the
   blinking cursor element). If missing, add it.
4. **Confirm there's a `border-top` divider** before the footer
   row. If missing, add it.
5. **Confirm `cc-scan-line` element exists** at the top of the
   card for the scanning animation. Add if missing.
6. **Outer shadow** — add a stronger box-shadow to make the cards
   read as elevated:
   ```css
   box-shadow: 0 24px 48px -12px rgba(14, 16, 32, 0.15);
   ```

Don't change the card content. Only the chrome.

---

## Pass 6 — Add FAQ section

New section between Testimonials and CTABanner.

ERPCV uses a state-based toggle pattern (NOT `<details>`/`<summary>`).
Match that.

### From ERPCV source — exact pattern

```tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function FAQ() {
  const faqs = [
    { q: '...', a: '...' },
    // ...
  ];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <section style={{ position: 'relative' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="cc-mono" style={{
            fontSize: 13, fontWeight: 700, letterSpacing: '0.18em',
            color: 'var(--cc-accent)', textTransform: 'uppercase'
          }}>
            [ FAQ ]
          </span>
          <h2 className="cc-display" style={{
            marginTop: 16, fontWeight: 700,
            fontSize: 'clamp(28px, 4vw, 36px)',
            lineHeight: 1.1, color: 'var(--cc-text-primary)'
          }}>
            Common questions.
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid rgba(14,16,32,0.08)' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%', padding: '20px 0',
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 16, textAlign: 'left',
                }}
              >
                <span className="cc-display" style={{
                  fontSize: 15, fontWeight: 700,
                  color: 'var(--cc-text-primary)'
                }}>
                  {faq.q}
                </span>
                {open === i
                  ? <ChevronUp size={18} color="var(--cc-text-muted)" />
                  : <ChevronDown size={18} color="var(--cc-text-muted)" />}
              </button>
              {open === i && (
                <div style={{ paddingBottom: 20 }}>
                  <p style={{
                    fontSize: 14,
                    color: 'var(--cc-text-body)',
                    lineHeight: 1.65,
                    margin: 0
                  }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

This is a `'use client'` component because of `useState`. Copy the
pattern exactly. Adjust paths for noeldcosta's token system.

### File to create

`src/components/FAQ.tsx`

### Wire into homepage

In `src/app/[lang]/page.tsx`, place between `<Testimonials />` and
`<CTABanner />`.

### FAQ items (exact copy, in this order)

1. **Q:** What does an engagement actually look like?

   **A:** Depends on what you need. If you're pre-implementation, I run a 4 to 6 week diagnostic — current state, vendor selection, business case, programme structure. If you're mid-implementation and things are off, I step in for 90 days as Programme Director or Senior Advisor to the CIO. If you're post-go-live and AI is the next wave, I scope and lead 8 to 16 week AI builds on SAP BTP. Always direct involvement. I don't disappear after the kickoff.

2. **Q:** Are you available right now?

   **A:** Usually 4 to 8 weeks out. I take on two or three programmes at a time, max. If you have a hard deadline I can't meet, I'll tell you on the first call and either point you to someone else or we plan for the next window.

3. **Q:** How do you charge?

   **A:** Day rate or fixed-fee programme. Day rate for advisory and diagnostics. Fixed-fee for delivery work where the scope is clear. Numbers depend on the engagement. We discuss it on the first call. No surprises in writing later.

4. **Q:** Do you replace my SI partner or work alongside them?

   **A:** Either. Most often I sit on the client side as Programme Director and hold the SI accountable. Sometimes I replace a struggling SI mid-stream. Sometimes I'm there to make sure the SI doesn't oversell what they can deliver. Depends on what's already in place.

5. **Q:** Will you sign an NDA?

   **A:** Yes. Standard practice on day one. I work with regulated entities and government clients regularly. Confidentiality isn't a line item, it's the default.

6. **Q:** How is this different from McKinsey, BCG, or the Big 4?

   **A:** I'm one person, not a pyramid. The senior partner you meet is the senior partner who runs your programme. I have CIMA and AICPA, so I read your finances the same way your CFO does. And I've actually delivered the systems, not just produced slide decks about them. Big firms have their place. For ERP and AI delivery, you usually want the human who's done it before.

7. **Q:** Why personal brand and not a firm?

   **A:** I run Quantinoid LLC as the trading entity. The personal brand is intentional. My value is judgement and direct involvement, not a logo on a deck. If you hire a firm, you get whoever they assign. If you hire me, you get me.

---

## Pass 7 — Logo wall (depends on F-09)

If `/public/logos/` contains client logo SVGs, replace the text
trust bar with real logos. ERPCV pattern:

```tsx
<img
  src={client.src}
  alt={client.name}
  style={{
    height: 32,
    width: 'auto',
    opacity: 0.8,
    transition: 'opacity 0.2s'
  }}
  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
  onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
/>
```

If logos are not yet sourced, **skip this pass** and add a TODO
comment in `LogoScroll.tsx` referencing F-09 in PRD.md.

---

## Acceptance criteria

The polish pass is `done` when:

- [ ] All seven section headlines listed in Pass 1 use
      `<span className="cc-emphasis-italic">` on the emphasized
      clause
- [ ] `.cc-emphasis-italic` class exists in globals.css with
      italic + weight 300 + canyon color
- [ ] Hero eyebrow uses pulse-dot + mono caps label pattern
- [ ] `cc-pulse-dot` animation exists and respects reduced-motion
- [ ] Hero has a faint grid background visible on light bg
- [ ] Final CTA orange block has a more visible grid pattern
- [ ] Hero stats strip renders below credibility line, four stats
      with vertical dividers, wraps to 2x2 on mobile
- [ ] agent.erp and programme.dashboard cards have proper
      cc-card class, border-radius 16px, mono labels with
      cc-cursor, top divider before footer, stronger shadow
- [ ] FAQ section exists at `/components/FAQ.tsx` as a
      `'use client'` component using the state-toggle pattern
- [ ] All seven FAQ items render with click-to-expand
- [ ] FAQ chevron switches between Up and Down on toggle
- [ ] Trust bar shows real logos OR is unchanged with TODO comment
- [ ] No regressions on hero copy, no regressions on existing sections
- [ ] `npm run build` succeeds with zero errors
- [ ] Lighthouse mobile performance still ≥ 90
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Tested at 375, 768, 1024, 1280, 1920 px

---

## Definition of done

1. All acceptance criteria pass.
2. Build succeeds.
3. Visually matches the ERPCV editorial polish.
4. Noel has reviewed in browser.
5. Committed and pushed.
6. PRD.md updated — add P-01 to a new "Polish passes" section,
   mark `done`.

---

## Sonnet execution prompt

The prompt to copy-paste is in:
`_docs/polish/01-erpcv-style.PROMPT.md`
