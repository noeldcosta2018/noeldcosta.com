// Accessor helpers for the typed MESSAGES record in ./messages.ts.
//
// Two entry points, same underlying data:
//
//   getMessages(locale)        — server components and route handlers.
//                                Returns the typed Messages object for
//                                the locale; consumers access fields
//                                directly (`m.nav.solutions`) with full
//                                IDE autocomplete and TypeScript safety.
//
//   useTranslation(locale)     — client components ('use client').
//                                Returns `{ messages, t }`. `messages`
//                                is the same typed object as above; `t`
//                                is a runtime path-resolver helper for
//                                cases where dot-notation reads more
//                                naturally than nested member access.
//
// Despite the `use` prefix `useTranslation` is NOT a React hook — it
// doesn't call useState/useEffect and doesn't depend on render-cycle
// state. The prefix follows convention so client components reading
// translations look syntactically similar to other custom-hook patterns
// in the codebase. Safe to call outside the render tree.
//
// Why a `locale` argument and not a context provider:
//
//   - All public-site routes are statically prerendered. Each locale
//     has its own pre-rendered HTML bundle, so the locale is known at
//     build time per route — no client-side detection needed.
//   - The `(site-en)` and `(site-intl)/intl/[lang]/` root layouts
//     already pass `locale` down to their pages, and components
//     accept it as a prop (Block 3 work). Threading is shallow.
//   - A React context would force every consumer to be inside the
//     provider, complicating server/client interop. Plain function
//     calls avoid that.

import { LOCALES, type Locale } from "@/lib/locales";
import { MESSAGES, type Messages } from "./messages";

// ── Server-side accessor ──────────────────────────────────────────────
//
// For server components and route handlers. Returns the typed Messages
// object directly. Falls back to English when an unexpected locale is
// requested — defensive against bad URL inputs but should never fire in
// production because dynamicParams=false rejects unknown locales at
// the route layer.
export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] ?? MESSAGES.en;
}

// ── Client-side accessor ──────────────────────────────────────────────

export interface TranslationApi {
  /** The typed Messages object for the active locale. Preferred — full
   *  IDE autocomplete and compile-time key validation. Example:
   *    const { messages: m } = useTranslation(locale);
   *    return <h1>{m.hero.headline}</h1>;
   */
  messages: Messages;

  /** Dot-notation lookup helper. Useful when the key is computed at
   *  runtime (e.g. choosing between singular/plural keys based on a
   *  count) or when reading a value through a string-typed config.
   *  Returns the original key when the path doesn't resolve to a leaf
   *  string — so missing keys are visible in the rendered UI rather
   *  than crashing the page.
   *
   *  Type parameter `K extends LeafPath<Messages>` would give compile-
   *  time path validation; left as `string` here so the helper composes
   *  with computed keys. For lookups whose path is fully known at
   *  authoring time, prefer direct field access on `messages` above.
   */
  t: (key: string) => string;
}

export function useTranslation(locale: Locale): TranslationApi {
  const messages = getMessages(locale);
  return {
    messages,
    t: (key) => resolveDotPath(messages, key),
  };
}

// ── Internal: dot-path resolver ───────────────────────────────────────
//
// Walks a nested object by a dot-notation key. Returns the resolved
// string when the path lands on a leaf string; returns the input key
// unchanged on any failure (missing field, non-string leaf, malformed
// path). The "return the key on failure" convention is borrowed from
// other in-house i18n implementations — keeps the page rendering, makes
// the gap visible to a reviewer, and avoids `undefined` showing up in
// the DOM.
function resolveDotPath(obj: unknown, path: string): string {
  if (!path) return path;
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[part];
    if (current === undefined) return path;
  }
  return typeof current === "string" ? current : path;
}

// ── Render-time marker stripper ────────────────────────────────────────
//
// Some MESSAGES strings contain `<noTranslate>...</noTranslate>` markers
// inline — they wrap proper nouns and brand-specific tokens (client
// names, non-glossary acronyms, etc.) so the translation pipeline in
// scripts/translate-content.mjs preserves the wrapped content byte-for-
// byte when generating non-English variants. See
// _docs/audits/i18n-strings-audit-2026-05-26.md "Do-not-translate
// policy" and scripts/test-no-translate.mjs for the policy + smoke test.
//
// The wrapper tags survive in the translated source files (idempotency)
// but should NOT render in the final DOM — they are author-only
// metadata. Strip them at render time when interpolating these strings
// into JSX.
//
// Usage:
//   <p>{stripMarkers(m.trackRecord.project1Desc)}</p>
const NO_TRANSLATE_TAG_RE = /<\/?noTranslate>/g;
export function stripMarkers(s: string): string {
  return s.replace(NO_TRANSLATE_TAG_RE, "");
}

// ── Locale guard ──────────────────────────────────────────────────────
//
// Re-export for components that need to narrow a `string` URL segment
// to a typed `Locale` before calling getMessages. Mirrors the pattern in
// src/lib/locales.ts so consumers don't need two imports.
export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
