/**
 * Book — typed shape for every entry in /content/books/*.mdx.
 *
 * Reduced to the three-section detail model. The /books page renders two
 * sections: Free and Paid. Free books emit a Supabase lead via /api/books/leads.
 * Paid books include a `price` (USD) and an optional `stripeId` for the
 * eventual Stripe wiring.
 *
 * Fields are intentionally minimal. Anything not needed by the new
 * BookCard / LeadCaptureModal / admin flow has been removed.
 */

export type BookStatus = "available";
export type BookKind = "free" | "paid";

export interface BookDetails {
  /** "Who is this for?" — one plain line. */
  whoFor: string;
  /** "What will you get from this book?" — one plain line. */
  whatYouGet: string;
  /** "How do I access this?" — one plain line. */
  howToAccess: string;
}

export interface BookFrontmatter {
  /** Filesystem-friendly slug. Matches the .mdx filename without extension. */
  slug: string;

  /** Book title in sentence case. */
  title: string;

  /** Short sub-title shown under the title. */
  subtitle?: string;

  /** 1-2 sentence short summary. Plain English. */
  summary?: string;

  /** Always "available" in the new model. Coming-soon is banned. */
  status: BookStatus;

  /** "free" → lead capture + signed-URL download. "paid" → checkout. */
  kind: BookKind;

  /** True for the one book that gets larger treatment if needed. */
  featured?: boolean;

  /** Sort order on the /books index. Lowest first. */
  order: number;

  /** Three short bullets shown on the card. Always exactly 3 items. */
  bullets?: string[];

  /** Per-book accordion content. Exactly three keys. */
  details?: BookDetails;

  /** Path to cover image under /public. If absent, typographic placeholder renders. */
  coverImage?: string | null;

  /** Hex background for the typographic placeholder cover. */
  coverColor: string;

  /** Hex foreground for the typographic placeholder cover + accent. */
  accentColor: string;

  /** Paid only — USD price. */
  price?: number;

  /** Paid only — Stripe price ID. Null until wired. */
  stripeId?: string | null;

  /** Object path inside the Supabase Storage bucket (e.g. "<slug>.pdf"). */
  storagePath?: string;

  /** SEO overrides. */
  metaTitle?: string;
  metaDescription?: string;
}

export interface BookRecord {
  frontmatter: BookFrontmatter;
  body: string;
}
