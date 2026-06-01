/**
 * Inline books registry — the minimal subset of `BookFrontmatter` that
 * runtime serverless code needs to look up a book by slug.
 *
 * Why a static registry instead of reading the MDX at runtime:
 *
 *   `next.config.ts` sets `outputFileTracingExcludes: { "/*": ["content/**"] }`
 *   which strips `/content/` from every serverless function bundle on Vercel.
 *   That is correct for build-time-static prerendering (where content is
 *   available in the build phase) but breaks any API route that calls
 *   `getBook(slug)` → `readFileSync(content/books/{slug}.mdx)` at runtime.
 *
 *   Pre-Block-8 the breakage was invisible because no prior verification
 *   exercised the `/api/books/leads` POST end-to-end. Block 8 Pass 8-4 caught
 *   it: every valid slug returned 400 "Unknown book" because the
 *   `existsSync(content/books/...)` filesystem check failed in the function
 *   bundle. The fix mirrors `src/lib/tools/registry.ts`, which has worked
 *   correctly all along for the same architectural reason — its book/tool
 *   metadata lives inside `src/` and ships with every bundle.
 *
 * What the API actually reads from each entry:
 *
 *   `kind` — gates the free-vs-paid response branch in /api/books/leads.
 *   `title` — written into the `book_leads.book_title` Supabase column.
 *   `slug` — written into `book_leads.book_slug` and used as fallback for
 *            the storage path when `storagePath` is absent.
 *   `storagePath` — object path inside the Supabase Storage bucket for the
 *                   signed-URL download (free books only). Falls back to
 *                   `${slug}.pdf` when omitted (matches the historic loader).
 *
 * Build-time rendering still uses `getBook()` / `getAllBooks()` in
 * src/lib/books.ts to read full MDX frontmatter + body for the /books page.
 * That code path is unchanged and works because content/ IS available in the
 * build phase. Keep the registry in sync with the .mdx frontmatter — there
 * is no automated check today (see _docs/post-launch-backlog.md for a
 * follow-up to generate this file at build time).
 */

import type { BookKind } from "@/types/book";

export interface BookRegistryEntry {
  slug: string;
  kind: BookKind;
  title: string;
  storagePath: string;
}

// Keep this list in sync with /content/books/*.mdx frontmatter.
// Sorted in the same `order` as the MDX files.
export const BOOK_REGISTRY: readonly BookRegistryEntry[] = [
  {
    slug: "sap-careers-200k-ai-era",
    kind: "free",
    title: "SAP Careers in the $200K AI Era",
    storagePath: "sap-careers-200k-ai-era.pdf",
  },
  {
    slug: "enterprise-ai-what-works",
    kind: "free",
    title: "10 Areas That Burn Costs in Enterprise AI with SAP",
    storagePath: "enterprise-ai-what-works.pdf",
  },
  {
    slug: "autonomous-agents-enterprise",
    kind: "free",
    title: "Autonomous Agents in the SAP Enterprise",
    storagePath: "autonomous-agents-enterprise.pdf",
  },
  {
    slug: "sap-career-playbook-ai-era",
    kind: "paid",
    title: "The SAP Career Playbook for the AI Era",
    storagePath: "sap-career-playbook-ai-era.pdf",
  },
] as const;

/** Look up a book by slug in the runtime-safe registry. */
export function getBookBySlug(slug: string): BookRegistryEntry | null {
  return BOOK_REGISTRY.find((b) => b.slug === slug) ?? null;
}

/** Read-only list of all registered slugs. */
export function getRegisteredBookSlugs(): string[] {
  return BOOK_REGISTRY.map((b) => b.slug);
}
