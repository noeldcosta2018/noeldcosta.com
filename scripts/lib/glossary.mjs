/**
 * scripts/lib/glossary.mjs
 *
 * Shared SAP / ERP glossary used by both `scripts/translate-content.mjs` and
 * `scripts/translate-ui-strings.mjs` to protect proper nouns from translation.
 *
 * The wrapper wraps unmarked glossary terms in `<span translate="no">…</span>`
 * before sending source text to the API, and respects any pre-existing
 * `<span translate="no">` regions to avoid nesting.
 *
 * Whole-word, case-sensitive matches. Wrapped with <span translate="no">
 * before sending to the API, then unwrapped after translation so the term
 * renders unchanged in the target language. GPT respects the marker when
 * instructed to leave inner text unchanged.
 *
 * Note: deliberately excludes "FI", "CO", "MM", "SD", "PP", "QM", "PM" —
 * they are common English fragments (co-founder, if I, summer, ...) that
 * cause false positives. FICO / S/4HANA already cover the SAP context.
 *
 * Entries ending with "(?s)" allow an optional trailing 's' so plural forms
 * (P-Users, S-Users) are also protected. The marker is stripped before the
 * final regex is built.
 */

export const GLOSSARY = [
  'SAP Business Technology Platform',
  'Business Technology Platform',
  'Rise with SAP',
  'Grow with SAP',
  'SAP Business One',
  'SAP Activate',
  'Universal ID',
  'SuccessFactors',
  'NetSuite',
  'Salesforce',
  'Business One',
  'Workday',
  'S/4HANA',
  'S4HANA',
  'Concur',
  'Ariba',
  'Oracle',
  'Fiori',
  'S-User(?s)',
  'P-User(?s)',
  'RISE',
  'FICO',
  'ABAP',
  'BAPI',
  'BADI',
  'IDOC',
  'HANA',
  'ECC',
  'BTP',
  'SAP',
];

/**
 * Wrap unmarked glossary terms in `<span translate="no">…</span>` so the
 * model leaves them in Latin script. Skips wrapping inside existing
 * `<span translate="no">…</span>` regions to avoid nesting.
 */
export function wrapGlossary(body) {
  // Build one regex matching any glossary term, longest-first. Terms ending
  // with the literal marker "(?s)" become "term(?:s)?" so the plural form is
  // also protected (e.g. P-User → P-User and P-Users).
  const terms = [...GLOSSARY].sort((a, b) => b.length - a.length);
  const escaped = terms.map((t) => {
    const pluralOpt = t.endsWith('(?s)');
    const base = pluralOpt ? t.slice(0, -4) : t;
    const escapedBase = base.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
    return pluralOpt ? `${escapedBase}(?:s)?` : escapedBase;
  });
  const re = new RegExp(`(?<![A-Za-z0-9])(?:${escaped.join('|')})(?![A-Za-z0-9])`, 'g');

  // Split body by existing <span translate="no">…</span> so we don't nest.
  const spanRe = /<span translate="no">[\s\S]*?<\/span>/g;
  const parts = [];
  let last = 0;
  let m;
  while ((m = spanRe.exec(body)) !== null) {
    if (m.index > last) parts.push({ kind: 'text', s: body.slice(last, m.index) });
    parts.push({ kind: 'span', s: m[0] });
    last = m.index + m[0].length;
  }
  if (last < body.length) parts.push({ kind: 'text', s: body.slice(last) });

  return parts
    .map((p) => p.kind === 'text'
      ? p.s.replace(re, (t) => `<span translate="no">${t}</span>`)
      : p.s)
    .join('');
}
