/**
 * Attribute parsing for the explainer tags.
 *
 * Article authors write single-line HTML-like tags in MDX. Attributes only
 * carry strings, so every list is pipe-separated and every pair uses the
 * same "=>" arrow the existing <decision-tree> tag uses:
 *
 *   steps="Purchase requisition|Purchase order|Goods receipt"
 *   parts="System integration => 42|Licences => 15"
 *
 * This module has no "use client" directive: MdxBody (a server component)
 * imports `explainerProps` from here to strip the markdown node before the
 * props cross into the client components.
 */

export type ExplainerAttrs = Record<string, string | undefined>;

/**
 * Keeps only the string (and numeric) attributes react-markdown hands to a
 * custom tag. Drops `node` (the hast tree, not serialisable cheaply) and
 * `children`, so nothing heavy crosses the server/client boundary.
 */
export function explainerProps(props: Record<string, unknown>): ExplainerAttrs {
  const out: ExplainerAttrs = {};
  for (const [key, value] of Object.entries(props)) {
    if (key === "node" || key === "children") continue;
    if (typeof value === "string") out[key] = value;
    else if (typeof value === "number" && Number.isFinite(value)) out[key] = String(value);
  }
  return out;
}

/** Trimmed string, or "" when absent. */
export function text(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

/** "A|B|C" to ["A", "B", "C"], empty entries removed. */
export function list(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * "A|B|C" to ["A", "B", "C"] keeping empty slots, for lists that run in
 * parallel with another list (notes under steps). "A||C" leaves step 2
 * without a note.
 */
export function parallel(value: string | undefined, length: number): string[] {
  const parts = value ? value.split("|").map((part) => part.trim()) : [];
  return Array.from({ length }, (_, i) => parts[i] ?? "");
}

export type Pair = { label: string; value: string };

/** "Label => value|Label 2 => value 2". The arrow is optional per entry. */
export function pairs(value: string | undefined): Pair[] {
  return list(value).map((entry) => {
    const at = entry.indexOf("=>");
    if (at === -1) return { label: entry, value: "" };
    return { label: entry.slice(0, at).trim(), value: entry.slice(at + 2).trim() };
  });
}

/** First number in a string ("42", "4.5", "1,200", "$80K" reads as 80). */
export function num(value: string | undefined): number {
  if (!value) return NaN;
  const match = value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : NaN;
}

/** Decimal places used in a list of numeric strings, capped at 2. */
export function decimals(values: string[]): number {
  let max = 0;
  for (const v of values) {
    const match = v.replace(/,/g, "").match(/\.(\d+)/);
    if (match) max = Math.max(max, match[1].length);
  }
  return Math.min(max, 2);
}

/** 1-based index attribute to a 0-based index, or -1 when out of range. */
export function index(value: string | undefined, length: number): number {
  const n = Number.parseInt(text(value), 10);
  return Number.isFinite(n) && n >= 1 && n <= length ? n - 1 : -1;
}

/** "true"/"false"/"yes"/"no" attribute with a default. */
export function flag(value: string | undefined, fallback: boolean): boolean {
  const v = text(value).toLowerCase();
  if (v === "false" || v === "no" || v === "0" || v === "off") return false;
  if (v === "true" || v === "yes" || v === "1" || v === "on") return true;
  return fallback;
}

/** Formats a number with a fixed number of decimals and a thousands separator. */
export function formatNumber(value: number, places: number): string {
  const fixed = value.toFixed(places);
  const [whole, frac] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${grouped}.${frac}` : grouped;
}

/** Rounds for inline style values so server and client strings always match. */
export function round(value: number, places = 3): number {
  const f = 10 ** places;
  return Math.round(value * f) / f;
}
