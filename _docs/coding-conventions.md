# Coding conventions

Sister doc to CLAUDE.md / AGENTS.md / VOICE.md. Captures conventions
that aren't about voice (VOICE.md), brand (BRAND.md), or stack rules
(AGENTS.md). Mostly fine-grained patterns that come up during code
review and would be tedious to repeat each time.

## RTL — logical Tailwind properties

The site serves Arabic (`ar`) under `<html dir="rtl">`. New components
and changes to existing components MUST use Tailwind's logical-property
utilities so the layout flips correctly under RTL without bespoke
overrides. Tailwind v3.3+ ships these natively; no plugin needed.

### Use logical, not physical

| Physical (do not use) | Logical (use this) |
|---|---|
| `ml-*` | `ms-*` (margin-inline-start) |
| `mr-*` | `me-*` (margin-inline-end) |
| `pl-*` | `ps-*` (padding-inline-start) |
| `pr-*` | `pe-*` (padding-inline-end) |
| `text-left` | `text-start` |
| `text-right` | `text-end` |
| `left-*` | `start-*` (position) |
| `right-*` | `end-*` (position) |
| `border-l`, `border-l-*` | `border-s`, `border-s-*` |
| `border-r`, `border-r-*` | `border-e`, `border-e-*` |
| `rounded-l-*` | `rounded-s-*` |
| `rounded-r-*` | `rounded-e-*` |
| `rounded-tl-*` / `rounded-bl-*` | `rounded-ss-*` / `rounded-es-*` |
| `rounded-tr-*` / `rounded-br-*` | `rounded-se-*` / `rounded-ee-*` |

A logical property resolves to the same physical position in LTR. So
the English site is byte-identical pre- and post-migration; only RTL
behaviour changes.

### Inline styles

Inline `style={{ marginLeft: 12 }}` does NOT flip under RTL. When you
need an inline style for a direction-sensitive property, use the
logical CSS property name:

```tsx
// Bad — pinned to physical right, breaks under RTL
<div style={{ position: 'fixed', right: 28 }} />

// Good — pinned to inline-end (right in LTR, left in RTL)
<div style={{ position: 'fixed', insetInlineEnd: 28 }} />
```

The CSS properties to use are: `marginInlineStart`, `marginInlineEnd`,
`paddingInlineStart`, `paddingInlineEnd`, `insetInlineStart`,
`insetInlineEnd`, `borderInlineStartWidth`, `borderInlineEndWidth`,
`borderStartStartRadius`, etc.

### Forward / backward indicators

Arrows that mean "next / forward / read more" point in the direction
the reader's eye moves — RIGHT in LTR, LEFT in RTL. They need to flip.

Use one consistent pattern across the codebase: **`rtl:-scale-x-100`**
applied directly to the icon (or its wrapping span). It mirrors the
icon horizontally only under `<html dir="rtl">`.

```tsx
// Lucide icon — forward indicator
import { ArrowRight } from 'lucide-react';

<button>
  Continue
  <ArrowRight className="rtl:-scale-x-100" size={16} aria-hidden />
</button>
```

For literal arrow characters inside text (legacy from pre-Block-7):

```tsx
// Replace literal "→" with Lucide + class
// Bad
<span aria-hidden>→</span>

// Good
<ArrowRight className="rtl:-scale-x-100 inline-block" size={14} aria-hidden />
```

Or, when keeping the character (e.g. inside a translated string where
the arrow is part of the copy and not a stand-alone affordance):

```tsx
<span aria-hidden className="inline-block rtl:rotate-180">→</span>
```

`rtl:rotate-180` is a valid alternative; pick whichever reads cleaner in
context. Both produce the same visual.

### Directional gradients

`bg-gradient-to-r` is also LTR-biased. For accent bars and similar
decorative gradients that should follow the reading direction, use the
`rtl:` variant explicitly:

```tsx
<div className="rtl:bg-gradient-to-l ltr:bg-gradient-to-r" />
```

Tailwind doesn't (yet) ship a `bg-gradient-to-e` logical variant, so
the explicit `rtl:` / `ltr:` pair is the canonical pattern.

### When NOT to flip

Some visual relationships are SEMANTIC, not directional. The
`<CompareSplit>` diagram (`src/components/article/diagrams/CompareSplit.tsx`)
shows two options side-by-side; the left column is "primary option",
the right is "comparison". Under RTL the columns naturally flip, and
the reading flow stays "first option then second option" — that's the
expected behaviour. Do not force the original visual order via
`flex-row-reverse`. See `_docs/post-launch-backlog.md` "RTL flow
reversal — design decisions" for the full rationale.

### Verifying

Run the RTL audit before committing:

```bash
node scripts/check-rtl-properties.mjs
```

Warn-only by default (exits 0). Add `--strict` to fail on any hit when
wiring into CI post-launch.

The script scans `className=` attributes in all `.tsx` under `src/`.
Inline `style={{...}}` props are not scanned (smaller surface, caught
in code review).

### Block 7 background

Block 7 (Phase 4 of the i18n migration) migrated ~27 high/medium
severity physical usages to logical across 14 components covering the
6 audited Arabic URLs (homepage, articles, category, tag, about,
books). See the Block 7 commit messages for the exhaustive list.

A few low-severity / English-only / admin-tool usages stayed physical
intentionally — they don't render under Arabic. The audit script
catches them too, but the report tags `[English-only]` and `[admin]`
so they sort to the bottom.

The flip from warn-only to strict will happen post-launch once the
remaining items are migrated (tracked in `_docs/post-launch-backlog.md`).
