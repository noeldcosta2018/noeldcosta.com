#!/usr/bin/env node
/**
 * scripts/test-no-translate.mjs
 *
 * Smoke test for the <noTranslate>...</noTranslate> marker mechanism in
 * scripts/translate-content.mjs. Proves that wrapped content survives the
 * extract → "translate" → restore round-trip byte-for-byte, regardless of
 * what the simulated translation step does to surrounding text.
 *
 * The test does NOT invoke the OpenAI API. It mimics the extract/restore
 * placeholder pattern (the same regex and `<!--NO_TRANSLATE_${idx}-->`
 * comment format used by translate-content.mjs) and verifies the
 * mechanism works against synthetic input. Doing the real API call would
 * cost ~$0.90 (one file × 10 target locales), need credentials, and
 * introduce non-determinism — none of which is needed to prove the
 * placeholder substitution is correct.
 *
 * What this test verifies:
 *   1. Multiple <noTranslate> blocks in one body all extract and restore.
 *   2. Wrapped content with nested code, special chars, multi-line, and
 *      non-Latin characters round-trips intact.
 *   3. The simulated "translation" pass (which mangles surrounding text)
 *      does not touch the placeholder comments — so the restored output
 *      contains the original wrapped content verbatim.
 *   4. The wrapper tags themselves are preserved in the output, so the
 *      file is idempotent under repeated translation runs.
 *
 * Run:
 *   node scripts/test-no-translate.mjs
 *
 * Exit code 0 = all assertions pass. Non-zero = at least one failure.
 */

// Mirror the regex and placeholder format used in scripts/translate-content.mjs.
// If those constants drift, this test should be updated to match.
const NO_TRANSLATE_RE = /<noTranslate>([\s\S]*?)<\/noTranslate>/g;

function extractNoTranslate(body) {
  const store = [];
  const out = body.replace(NO_TRANSLATE_RE, (match) => {
    const idx = store.length;
    store.push(match);
    return `<!--NO_TRANSLATE_${idx}-->`;
  });
  return { out, store };
}

function restoreNoTranslate(body, store) {
  return body.replace(/<!--NO_TRANSLATE_(\d+)-->/g,
    (_m, idx) => store[Number(idx)] ?? _m);
}

// Simulate what an LLM translation pass does: uppercase the body, which
// mangles every translatable token but should leave HTML comments alone.
// (Real LLM output would replace English text with the target language's
// equivalent; uppercasing is a deterministic stand-in that's just as
// destructive to the surrounding prose.)
function simulateTranslation(body) {
  return body
    .split(/(<!--[\s\S]*?-->)/) // split on HTML comments (placeholders)
    .map((part) => (part.startsWith('<!--') ? part : part.toUpperCase()))
    .join('');
}

let failures = 0;
function assert(cond, label) {
  if (cond) {
    console.log(`PASS: ${label}`);
  } else {
    console.error(`FAIL: ${label}`);
    failures++;
  }
}

function runCase(name, source) {
  console.log(`\n--- ${name} ---`);
  const { out: extracted, store } = extractNoTranslate(source);

  // No <noTranslate> markers should survive extraction.
  assert(
    !/<noTranslate>/.test(extracted) && !/<\/noTranslate>/.test(extracted),
    'no <noTranslate> tags remain after extraction',
  );

  // Every wrapped block ended up in the store.
  const expectedCount = (source.match(/<noTranslate>/g) || []).length;
  assert(
    store.length === expectedCount,
    `${expectedCount} block(s) stored (got ${store.length})`,
  );

  // Placeholder comments should appear in the extracted output.
  assert(
    new RegExp(`<!--NO_TRANSLATE_\\d+-->`).test(extracted) ===
      (expectedCount > 0),
    'placeholder comments present iff blocks were extracted',
  );

  // Simulate translation: uppercase the surrounding prose. Placeholders
  // (HTML comments) must survive intact.
  const translated = simulateTranslation(extracted);
  assert(
    (translated.match(/<!--NO_TRANSLATE_\d+-->/g) || []).length ===
      expectedCount,
    'placeholder comments survive the simulated translation pass',
  );

  // Restore: the placeholders should be replaced with the original blocks
  // (including the wrapper tags themselves, for idempotency).
  const restored = restoreNoTranslate(translated, store);

  for (let i = 0; i < store.length; i++) {
    assert(
      restored.includes(store[i]),
      `block ${i} restored byte-for-byte`,
    );
  }

  // No leftover placeholders.
  assert(
    !/<!--NO_TRANSLATE_\d+-->/.test(restored),
    'no orphan placeholder comments after restoration',
  );

  // The wrapper tags survive in the output — re-running the pipeline on
  // the translated file would find them again and protect them again.
  assert(
    (restored.match(/<noTranslate>/g) || []).length === expectedCount,
    `wrapper tags preserved for idempotency (${expectedCount} expected)`,
  );

  return restored;
}

// ── Test cases ─────────────────────────────────────────────────────────────

// Case 1: single testimonial-style quote with attribution.
runCase(
  'single testimonial block',
  `
Some surrounding prose that should get translated.

<noTranslate>
"Working with Noel on the Etihad SAP Centre of Excellence reset our
delivery pace by months. Senior, direct, no PowerPoint theatre."
— Mike Papamichael, Ex-CIO, Etihad Aviation Group
</noTranslate>

More prose afterwards that should also get translated.
`.trim(),
);

// Case 2: multiple wrapped blocks in one body.
runCase(
  'multiple wrapped blocks',
  `
First paragraph in English.

<noTranslate>Block one — verbatim.</noTranslate>

Middle paragraph.

<noTranslate>Block two — also verbatim.</noTranslate>

<noTranslate>
Block three — multi-line.
With more content inside.
</noTranslate>

End paragraph.
`.trim(),
);

// Case 3: wrapped block containing code, MDX-ish tags, special chars,
// and non-Latin characters. The whole region must round-trip intact.
runCase(
  'wrapped block with nested structures',
  `
Intro text.

<noTranslate>
"Etihad" / "اتحاد" stays unchanged. The S/4HANA module name stays in Latin script.

Code reference: \`SELECT * FROM /BIC/AZSALES00\` — DO NOT translate.

<Quote attribution="Andrew MacFarlane">
  This stays exactly as written.
</Quote>

Special characters: $700M+, 25 years, 81% automation.
</noTranslate>

Outro text.
`.trim(),
);

// Case 4: body with no markers — should pass through unchanged.
const passThrough = 'Plain English body with no markers anywhere.';
const { out: passOut, store: passStore } = extractNoTranslate(passThrough);
assert(passStore.length === 0, 'pass-through: no blocks extracted');
assert(passOut === passThrough, 'pass-through: body unchanged by extraction');
assert(
  restoreNoTranslate(passOut, passStore) === passThrough,
  'pass-through: body unchanged by restoration',
);
console.log('PASS: pass-through case');

// Case 5: idempotency — translating the already-translated file should
// re-protect the wrapper tags (this is what makes incremental re-translation
// safe).
console.log(`\n--- idempotency: re-process a translated file ---`);
const firstPass = runCase(
  'first pass',
  `<noTranslate>"Quote stays verbatim."</noTranslate>\n\nProse around it.`,
);
const secondPassResult = runCase('second pass on first-pass output', firstPass);
assert(
  secondPassResult.includes('"Quote stays verbatim."'),
  'idempotent: the verbatim string survives a second pass',
);

console.log('');
if (failures === 0) {
  console.log(`✓ All assertions passed.`);
  process.exit(0);
} else {
  console.error(`✗ ${failures} assertion(s) failed.`);
  process.exit(1);
}
