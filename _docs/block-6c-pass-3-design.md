# Block 6c Pass 3 — `scripts/translate-ui-strings.mjs` design sketch

**Status:** Design proposal, awaiting review.
**Author context:** Sketch produced after Block 6c Pass 2 shipped (1,301 MESSAGES.en keys on commit `6f43075`).
**Target script:** `scripts/translate-ui-strings.mjs`
**Sibling script:** `scripts/translate-content.mjs` (existing, mature; this design heavily reuses its patterns).

---

## 1. Overall architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  scripts/translate-ui-strings.mjs                                   │
│                                                                     │
│  ┌─ Phase 1: LOAD ─────────────────────────────────────────────┐   │
│  │  • Read MESSAGES.en from src/lib/i18n/messages.ts via         │   │
│  │    static import (esbuild/tsx loader OR a dedicated           │   │
│  │    JS-extractable mirror — see §6 output decision)            │   │
│  │  • Flatten to (dotPath, value) pairs via walkLeaves()         │   │
│  │  • Filter: skip undefined / "" / "_todo" placeholders         │   │
│  │  • Result: ordered list of ~1,300 (path, source) leaves       │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                ▼                                    │
│  ┌─ Phase 2: CHUNK ────────────────────────────────────────────┐   │
│  │  • Group leaves into chunks bounded by both:                  │   │
│  │      - max 60 strings per chunk                               │   │
│  │      - max 4,000 source chars per chunk                       │   │
│  │  • Respect sub-namespace boundaries (don't split mid-record)  │   │
│  │  • Produce ~30 chunks total                                   │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                ▼                                    │
│  ┌─ Phase 3: TRANSLATE (per locale × per chunk) ──────────────┐   │
│  │  for each locale in [ar, de, el, es, fr, it, ja, nl, pt, ru]:│   │
│  │    for each chunk:                                            │   │
│  │      • Check resume cache (.cache/translate-ui/<loc>.json)    │   │
│  │      • If hit → use cached output, skip API call              │   │
│  │      • Else: call GPT-5.4 with JSON-mode + system prompt      │   │
│  │              (reuses callJsonTranslate + withRetry from       │   │
│  │              translate-content.mjs)                           │   │
│  │      • Validate response: same count, markers preserved,      │   │
│  │              {tokens} preserved                               │   │
│  │      • Persist to resume cache immediately                    │   │
│  │      • Reconstruct flat (path → translated) map               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                ▼                                    │
│  ┌─ Phase 4: ASSEMBLE ─────────────────────────────────────────┐   │
│  │  • For each locale: unflatten (path → translated) back into   │   │
│  │    a nested object structurally identical to MESSAGES.en      │   │
│  │  • Cross-locale validation: every EN key present in every     │   │
│  │    locale; no leaked _todo / unfilled values                  │   │
│  │  • Emit src/lib/i18n/messages.<locale>.ts (one file per loc)  │   │
│  │    each typed `: Messages` so tsc enforces structural match   │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                ▼                                    │
│  ┌─ Phase 5: WIRE ─────────────────────────────────────────────┐   │
│  │  • Update src/lib/i18n/messages.ts to import the 10 new files │   │
│  │    and bind MESSAGES = { en: EN, ja: jaMessages, ... }        │   │
│  │  • (One-time wiring step; subsequent runs only regenerate     │   │
│  │    the per-locale files)                                      │   │
│  └───────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Per-question design decisions

### Q1. Source pattern

**Walking strategy:** recursive `walkLeaves(obj, prefix)` that yields `[dotPath, value]` for every leaf string. Same shape as the dot-path resolver already in `useTranslation.ts` (`resolveDotPath`), so the script can use the existing helper as a sanity oracle.

```
walkLeaves(MESSAGES.en) → 
  [
    ["nav.solutionsDropdown", "Solutions"],
    ["nav.toolsDropdown", "Tools"],
    ...
    ["sapModules.modules.fi-gl.label", "Financial Accounting"],
    ["sapModules.modules.fi-gl.description", "General Ledger, statutory reporting foundation"],
    ...
    ["solutionBuilder.phases.phase1.focusAreas.0", "Core ERP configuration"],
    ["solutionBuilder.phases.phase1.focusAreas.1", "Financial accounting"],
    ...
  ]
```

Array entries get numeric path segments (`.0`, `.1`), preserving order. The unflattener (Phase 4) reassembles arrays from contiguous numeric-keyed entries.

**Skip rules:**
- Empty strings (`""`) → skip
- The literal `"_todo"` value → skip (none should remain after Pass 2b-2d, but defensive)
- `null` / `undefined` → skip (shouldn't occur in EN; TS would have failed)

**Reuse from `translate-content.mjs`:**
- `<noTranslate>...</noTranslate>` extract/restore pattern — but **simpler** here: in MDX, markers wrap content that contains markdown / HTML / MDX components, requiring careful storage. In MESSAGES strings, markers wrap inline proper nouns. A simpler regex-based extract-stash-restore is enough.
- `withRetry()` helper for backoff
- `callJsonTranslate()` for JSON-mode API calls
- `LANG_NAMES`, `LANG_REGISTER` per-locale tonal hints
- `loadApiKey()`, `loadOpenAiClient()`
- `calcCost()`, rate-limit-header capture

**Recommended:** extract the shared helpers from `translate-content.mjs` into `scripts/lib/openai-shared.mjs` so both scripts import from one place. ~150 lines of shared code. **Or** import directly from `translate-content.mjs` if we treat it as a side-effect-free library. Recommend the extraction route — keeps the existing script untouched and gives the new script a clean import surface.

### Q2. Chunking

**Approach: bounded by both string count AND source char count, with namespace-boundary preference.**

| Parameter | Value | Rationale |
|---|---|---|
| Max strings per chunk | 60 | GPT-5.4 handles JSON-mode arrays of this size reliably; balances per-call latency with throughput |
| Max source chars per chunk | 4,000 | ~1,200 input tokens for source; safe under context limits with prompt overhead |
| Break preference | sub-namespace | Keep semantically related strings together so GPT sees context (e.g. all `sapCostCalculator.sectorOptions.*` in one chunk) |
| Min chunk size | 1 | A single long string (e.g. a 3KB disclaimer body) gets its own chunk |

**Why not chunk by sub-namespace alone:** `sapModules.modules.*` is 164 strings (82 labels + 82 descriptions). One chunk would exceed both bounds. Splitting by character budget within a sub-namespace is fine — GPT doesn't need to see all 164 modules at once, just the ones in the current chunk plus the system prompt's domain context.

**Estimated total chunks for 1,301 strings:** ~28-32 chunks (multi-locale total = chunks × 10 locales = ~300 API calls).

### Q3. Context provision

**System prompt structure** (built per-(locale, chunk) by reusing `buildJsonSystemPrompt(lang, kind)` with a new `kind: "messages-ui"` mode):

```
You translate short UI strings for a senior SAP consultant's personal
brand website (noeldcosta.com) from English into natural, native-quality
{LANG_NAME}.

Tone: professional, direct, first-person where the source uses first
person. {LANG_REGISTER hint}

Audience: enterprise CIO / CFO / Programme Director, age 45-58, fluent
business English speakers reading in their native language by preference.
Read like a senior consultant, not like marketing copy.

Avoid marketing buzzwords. SAP product names stay in Latin script.

The strings come from a calculator / form / wizard UI. Many are very
short (button labels, field labels, option values). Treat each string
independently — do not invent context.

STRICT preservation rules (violations break the build):
1. Preserve every <noTranslate>...</noTranslate> tag exactly. Do NOT
   translate the inner text, do NOT remove the wrapper.
2. Preserve every {placeholder} token (curly-brace identifier) exactly.
   These are runtime interpolation slots — translating them breaks the
   site. Examples: {count}, {months}, {industry}, {n}, {status}.
3. Numbers and currency amounts ($150K, $2M, 22%) stay numeric. The "$"
   sign stays for USD. Currency stays in dollars unless the source
   explicitly converts.
4. SAP module codes (FI-GL, EWM, TM, S/4HANA, BTP, etc.), regulatory
   acronyms (IFRS 16, GDPR, ViDA), and proper nouns are wrapped in
   <noTranslate> already — keep them wrapped.
5. Em dashes (—) and en dashes (–) stay as-is; do not substitute hyphens.

Input format: JSON object {"strings": [...]} of English source strings.
Output format: JSON object {"translations": [...]} same length, same
order. Return JSON only.
```

**Per-chunk USER prompt** (minimal — JSON only, no narrative wrapping since the system prompt sets context):

```json
{"strings": ["Cost breakdown", "Implementation timeline", "{n} months", ...]}
```

**Why not include surrounding-key context for short strings:** Adding "this is a button" / "this is a select option" per-string would balloon prompt size 3x for marginal quality gain. The system prompt's domain context ("calculator / form / wizard UI") is enough — GPT-5.4 handles short ambiguous strings well when told they're UI elements. We'll review quality on a representative chunk before committing to the full run.

### Q4. Marker preservation

**Pre-call:** strings are sent verbatim with markers and tokens in place. The system prompt's rules #1 and #2 instruct GPT to preserve them.

**Post-call validation per chunk:**

For each `(source, translated)` pair:
1. Count `<noTranslate>...</noTranslate>` regions in source. Must equal count in translated. If not → reject the chunk, retry with a stronger reminder prompt (one re-attempt max), then fail the run on second miss.
2. Extract the set of `{placeholder}` tokens via `/\{(\w+)\}/g`. The set must be identical between source and translated (same tokens, same multiplicity). Order can differ — GPT may reorder for grammar.
3. If either check fails for any string in the chunk, the chunk is bad — retry the WHOLE chunk (don't try to patch individual strings).

**Why whole-chunk retry:** GPT-5.4's JSON mode returns the whole batch or nothing. Patching individual strings means a second API call for one item — more expensive per character than a clean retry.

**Failure handling after retry:**
- Log the offending source string, its translation, and the validation reason
- Write a `.cache/translate-ui/<locale>.errors.json` with details
- Continue the run for other chunks (don't fail the whole locale on one chunk)
- Final assembly step skips locales with any errors, surfaces them in the summary

### Q5. Glossary

**Reuse the GLOSSARY array from `translate-content.mjs`** (29 entries: SAP, S/4HANA, RISE, GROW, BTP, Fiori, Ariba, SuccessFactors, Concur, NetSuite, etc.).

**Two-layer approach** matches what `translate-content.mjs` does:
1. **Inline `<noTranslate>` markers** in MESSAGES.en — the primary mechanism for proper nouns embedded in translatable strings. Already done across Block 6c Pass 2.
2. **Glossary as a defensive backstop** — if a proper noun slipped through without a marker, the glossary wrapper auto-protects it before the API call.

Implementation: reuse `wrapGlossary()` from `translate-content.mjs`. Wraps unmarked glossary terms in `<span translate="no">...</span>` before sending, unwraps before storing. Both wrappers (`<noTranslate>` and `<span translate="no">`) are stripped at render via the existing `stripMarkers` helper.

**Decision:** the new script's STRICT rule #1 prompt should be permissive of both wrapper styles, since auto-wrapping may apply `<span translate="no">` to a string that already has `<noTranslate>` somewhere else.

### Q6. Output format

**Decision: write per-locale `.ts` files.** Each file exports a typed `: Messages` constant. `messages.ts` imports them.

**Why .ts not .json:**
- TS compile-time validation: each generated file must structurally satisfy the `Messages` interface. If translation introduced an extra key or missed a key, tsc fails the build before deployment.
- JSON import assertions (`import x from './a.json' assert { type: 'json' }`) are not standardized across all build tools yet (Turbopack handling has varied across Next.js versions per AGENTS.md). TS imports are deterministic.
- No runtime parsing cost — the .ts file is part of the bundle.

**Why not write back into `messages.ts`:**
- Mutating a TS source file via AST manipulation (ts-morph, recast) is fragile — comments and formatting get rearranged. With 1,301 keys × 10 locales = 13,010 string literals to splice in, the diff is unreadable.
- Per-file separation makes per-locale diffs reviewable. After a translation refresh, `git diff src/lib/i18n/messages.ja.ts` shows exactly what changed for Japanese.

**File layout:**

```
src/lib/i18n/
├── messages.ts              (existing — defines Messages type + EN const + MESSAGES record)
├── messages.ar.ts           (NEW — exports `const arMessages: Messages = { ... }`)
├── messages.de.ts           (NEW)
├── messages.el.ts           (NEW)
├── messages.es.ts           (NEW)
├── messages.fr.ts           (NEW)
├── messages.it.ts           (NEW)
├── messages.ja.ts           (NEW)
├── messages.nl.ts           (NEW)
├── messages.pt.ts           (NEW)
├── messages.ru.ts           (NEW)
└── useTranslation.ts        (unchanged)
```

**messages.ts wiring change:**

```ts
// Before (current state)
export const MESSAGES: Record<Locale, Messages> = {
  en: EN, ja: EN, es: EN, /* ... all 10 alias EN ... */
};

// After
import { jaMessages } from './messages.ja';
import { arMessages } from './messages.ar';
/* ...8 more imports... */

export const MESSAGES: Record<Locale, Messages> = {
  en: EN,
  ja: jaMessages,
  ar: arMessages,
  /* ... */
};
```

This is a ~15-line one-time edit in `messages.ts`. The script can apply it automatically on first successful full-locale run (idempotent — does nothing if imports are already there).

### Q7. Per-locale execution

**CLI surface** (mirrors `translate-content.mjs` for consistency):

```
node scripts/translate-ui-strings.mjs [options]

  --dry-run                Estimate cost; no API calls; no writes
  --lang <code>            Only specified locale (default: all 10)
  --force                  Ignore resume cache; re-translate everything
  --verbose                Per-chunk progress logging
  --concurrency <n>        Parallel chunk requests per locale (default: 3)
  -h, --help
```

**Cost reporting per locale** (printed after each locale completes):

```
de: 1,247 strings translated in 28 chunks
    input: 47,200 tokens × $2.50/M = $0.118
    output: 53,800 tokens × $15.00/M = $0.807
    locale total: $0.925
    elapsed: 4m 12s
```

**Final summary:**

```
TOTAL: 12,470 strings across 10 locales
    total input tokens:  472,000
    total output tokens: 538,000
    total cost: $9.25
    total elapsed: 38m
```

**Resumability via cache:**

- Cache file: `.cache/translate-ui/<locale>.json`
- Shape: `{ "<dotPath>": "<translated>", ... }` — flat path → translated string
- Written incrementally as each chunk completes (single chunk = single fs write of the merged map)
- On start: load existing cache, mark already-translated leaves, only chunk and call API for remaining leaves
- `--force` clears the cache for the targeted locale(s) before running
- Crash recovery: re-run with no flags resumes from wherever the cache stopped

**Cache structure rationale:**
- Flat dot-path map is the same shape as the script's working set. No nested-structure reassembly during a resume.
- One file per locale isolates failures. If `ja` cache corrupts, `de` is unaffected.
- The cache is the ground-truth between runs — the .ts file is regenerated from it on each Phase 4 pass.

### Q8. Rate limiting / retries

**Concurrency:**
- Within a locale: 3 chunks in flight at a time (configurable via `--concurrency`)
- Across locales: sequential by default (one locale at a time)
- Why sequential across locales: easier to read logs, easier to abort, and the cost-vs-time tradeoff is fine for a one-time-per-content-change run
- Optional `--parallel-locales` flag could later enable parallel locale execution for follow-on runs

**Retry strategy** — reuse `withRetry()` from `translate-content.mjs`:
- Timeout retry: 1 escalation from `DEFAULT_TIMEOUT_MS` (10 min) to `EXTENDED_TIMEOUT_MS` (20 min)
- Transient retry: 3 attempts with exponential backoff for 429/5xx/network errors
- After 3 attempts on a chunk: log error, mark chunk failed for this run, continue with next chunk
- After all chunks for a locale complete (with or without errors): summary lists failed-chunk paths; locale is still emitted if ≥99% succeeded, otherwise the locale's .ts file is NOT overwritten

**Rate-limit awareness:**
- Capture `x-ratelimit-*` headers from the first successful response (the existing helper already does this)
- If `x-ratelimit-remaining-requests` drops below 10% of `x-ratelimit-limit-requests`, throttle next batch: wait `x-ratelimit-reset-requests` ms before the next API call

### Q9. Validation

**Per-chunk** (during translation, see Q4):
- Response is valid JSON
- Response array length matches input length
- Marker preservation
- Placeholder token preservation

**Per-locale** (after all chunks complete):
- Every EN dot-path present in the locale's flat result map
- No `"_todo"` literal values
- No empty strings (translation removed a string entirely)

**Cross-locale** (after all 10 locales complete):
- Every EN dot-path present in every locale's result map
- Quick structural diff: locale.json paths === EN.json paths (set equality)

**Per-file** (after Phase 4 .ts generation):
- `npx tsc --noEmit` runs as a final gate. If any messages.<locale>.ts doesn't structurally satisfy `Messages`, the script aborts before touching messages.ts.

**Failure response:**
- Validation failures are written to `.cache/translate-ui/<locale>.errors.json` with full context (source string, attempted translation, validation rule violated)
- Final exit code: 1 if any locale has any error; 0 only on clean completion
- The .ts file for a failed locale is NOT overwritten (existing translations preserved)

### Q10. Estimated costs

**Input tokens per locale:** ~47,000
- Source chars: ~1,301 strings × ~30 chars avg = ~40,000 chars
- Input ratio (from translate-content.mjs benchmark): 0.30 tokens / char → ~12,000 source tokens
- System prompt overhead: ~250 tokens × 30 chunks = ~7,500 tokens
- JSON structure overhead: ~15 tokens × 1,301 strings = ~20,000 tokens (the `{"strings":[...,"...",...]}` framing)
- Total: ~40,000 input tokens per locale (rounded up to ~47K for safety margin)

**Output tokens per locale:** ~25,000-55,000 (varies by locale)
- High-density langs (ar/el/ja/ru): 0.34 tokens / source char → ~14,000 output tokens (raw translation) + ~20,000 JSON framing = ~34,000
- Normal langs (de/es/fr/it/nl/pt): 0.20 tokens / source char → ~8,000 + ~20,000 = ~28,000
- Wide margin for safety: budget 55K output per locale

**Cost per locale:**
- Input: 47K × $2.50/M = **$0.12**
- Output (high-density): 34K × $15.00/M = **$0.51**
- Output (normal): 28K × $15.00/M = **$0.42**
- Per high-density locale: **~$0.63**
- Per normal locale: **~$0.54**

**Total for 10 locales:**
- 4 high-density (ar, el, ja, ru): 4 × $0.63 = **$2.52**
- 6 normal (de, es, fr, it, nl, pt): 6 × $0.54 = **$3.24**
- **Grand total: ~$5.80 per full run**

**These are conservative estimates.** The translate-content.mjs benchmark gave $0.09 to translate a ~15KB MDX file into Japanese. MESSAGES at 40KB English → Japanese should be ~$0.25 by char-volume scaling, but JSON-framing inflation and the 30-chunk overhead push it to ~$0.60.

**`--dry-run` will print this estimate** with the actual character counts before any API call. Reviewer signs off on the cost before the real run kicks off.

**Runtime estimate:**
- ~30 chunks per locale × ~10 seconds per chunk = ~5 minutes per locale (sequential within locale, with concurrency=3)
- 10 locales sequential = ~50 minutes total wall time
- With `--parallel-locales` future flag: ~10 minutes wall time

---

## 3. Open questions for review

1. **`--parallel-locales`?** Default sequential reads cleaner; parallel cuts wall time by 5x. Recommend shipping sequential first, adding parallel later if a re-translation cadence demands it.

2. **Where do glossary updates live?** Currently in `translate-content.mjs`. If we extract `scripts/lib/openai-shared.mjs`, the glossary moves there. Both scripts then share one definition — easier to keep consistent.

3. **Do we need a `--key <dotPath>` flag** for re-translating a single key across all 10 locales? Useful when a single string changes in EN — current design re-translates everything in the resume cache that's marked stale. Adding `--key` is +5 lines, low-risk.

4. **Should we add a quality-check sub-command?** E.g., `node scripts/translate-ui-strings.mjs --check ja` re-reads the .ts file and re-runs Phase 4 validation without API calls. Useful for catching drift if someone hand-edits a translation. Recommend yes — cheap to add.

5. **Where do the per-locale .ts files live in CI?** The translations are committed (1,301 keys × 10 locales = ~13K strings, mostly short — file size will be ~150-200 KB total). Recommend committing them — they're product output, not generated artifacts. The `.cache/` directory stays gitignored.

6. **Cost approval threshold?** ~$5.80 per full run is cheap enough that we don't need a confirm prompt. But for `--force` on all 10 locales (which would double-charge the existing cache), recommend a `--yes` flag to skip confirmation, otherwise prompt with the cost estimate.

---

## 4. Estimated build effort

**Script implementation:** 4-6 hours
- 2-3h: extract shared helpers from translate-content.mjs into `scripts/lib/openai-shared.mjs`
- 1h: walk + chunk + cache infrastructure
- 1h: prompt builder for UI strings (adapt from `buildJsonSystemPrompt`)
- 1h: per-locale .ts file emitter with proper TS formatting (use a small AST-aware printer like `prettier` or hand-write a deterministic formatter)
- 30m: CLI surface + dry-run estimator
- 30m: validation passes

**One-time `messages.ts` wiring change:** 15 minutes (apply the 10 imports + bind to MESSAGES record)

**Dry-run cost-estimate validation:** 1 hour — run `--dry-run` against current EN, verify the estimate matches the back-of-envelope math above

**Actual translation run:** ~50 minutes wall time, ~$5.80 cost

**Native-speaker spot-check** (deferred to Block 8, not part of Pass 3): 1-2 hours coordination + reviewer time per locale, 3 locales (ar, ja, de) per PRD L-09.

---

## 5. What this design does NOT cover

- **RTL CSS** (Block 7). The translations themselves are agnostic. RTL handling is a separate Tailwind logical-properties pass.
- **MDX content re-translation.** That's `translate-content.mjs`'s job. This script translates UI strings only.
- **Translation memory across runs.** The resume cache is per-run, not cross-run. If EN changes a string, the next run re-translates it. No glossary-of-prior-translations to nudge for consistency. Block 6c scope didn't ask for it; adding TM is a Block 9+ enhancement.
- **A/B testing translations.** Out of scope. Single source of translation per locale.

---

## 6. Recommendation

Build it. The design reuses ~150 lines of proven code from `translate-content.mjs`, adds ~400 lines of new logic, and produces 10 typed .ts files. Cost is trivial (~$6/run). Wall time fits inside a single human review window. Resume-on-failure means no all-or-nothing risk.

When you approve the sketch, I'll:
1. Extract `scripts/lib/openai-shared.mjs` (shared helpers from translate-content.mjs)
2. Build `scripts/translate-ui-strings.mjs` per this design
3. Run `--dry-run` and show the actual cost estimate
4. Pause for your go-ahead before the real API run
