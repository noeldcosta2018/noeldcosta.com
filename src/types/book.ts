/**
 * Book — typed shape for every entry in /content/books/*.mdx.
 *
 * The /books page renders this catalogue. Frontmatter is parsed with
 * gray-matter (same as posts/pages) and cast through this interface in
 * src/lib/books.ts. Keep fields in sync with the README in
 * content/books/README.md so future books pass type-check on first try.
 */

export type BookStatus = "available" | "coming-soon";
export type BookKind = "free" | "paid";
export type ExperienceLevel = "1-3" | "4-7" | "8-15" | "15+";

export interface BookPricing {
  /** Stripe price ID for the ebook tier — null until Stripe is wired. */
  ebook?: { stripeId: string | null; amount: number; label: string };
  paperback?: { stripeId: string | null; amount: number; label: string };
  hardcoverBundle?: { stripeId: string | null; amount: number; label: string };
}

export interface BookFrontmatter {
  /** Filesystem-friendly slug. Matches the .mdx filename without extension. */
  slug: string;

  /** Book title in sentence case. Used in cards and as the H2 in cover placeholders. */
  title: string;

  /** Short sub-title shown under the title on the featured book card. */
  subtitle?: string;

  /** 1-2 sentence summary shown on cards and at the top of the book detail card. */
  summary: string;

  /** Who the book is for. One sentence. */
  audience: string;

  /** Bullet list of what is inside. Empty array is fine for coming-soon. */
  whatsInside: string[];

  /** One-line teaser of the topics covered. Used on coming-soon cards
   *  where `whatsInside` is empty so the card still tells the reader
   *  what the book is about. Optional. */
  topics?: string;

  /** "available" → render download/email-capture. "coming-soon" → render waitlist. */
  status: BookStatus;

  /** "free" → email capture flow. "paid" → Stripe checkout flow. */
  kind: BookKind;

  /** True for the one book that gets the larger FeaturedBook treatment on /books. */
  featured?: boolean;

  /** Sort order on the /books index. Lowest first. */
  order: number;

  /** Path to cover image under /public. If absent (or file missing), placeholder renders. */
  coverImage?: string;

  /** Hex background for the typographic placeholder cover. */
  coverColor: string;

  /** Hex foreground for the typographic placeholder cover. */
  accentColor: string;

  /** Page count for the printed/published version. Optional for coming-soon. */
  pages?: number;

  /** Estimated reading time in minutes. Optional for coming-soon. */
  readingTimeMinutes?: number;

  /** Formats the book ships in, for the metadata strip. */
  formats?: ("PDF" | "EPUB" | "Paperback" | "Hardcover")[];

  /** Public-facing date (ISO) the book launched, or is expected to launch. */
  publishedAt?: string;
  expectedAt?: string;

  /** Download URL for free books once email is captured. Stub for now. */
  downloadUrl?: string;

  /** Stripe pricing tiers for paid books. */
  pricing?: BookPricing;

  /** SEO overrides. */
  metaTitle?: string;
  metaDescription?: string;
}

export interface BookRecord {
  frontmatter: BookFrontmatter;
  body: string;
}
