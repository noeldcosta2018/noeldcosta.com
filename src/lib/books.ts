import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import type { BookFrontmatter, BookRecord } from "@/types/book";

/**
 * Books loader. Mirrors the gray-matter + filesystem pattern in
 * src/lib/content.ts (getPage / getPost) so the codebase has one way to
 * load MDX. Books live as a single .mdx file per book under
 * /content/books/{slug}.mdx — no locale subdirectories yet. When
 * translations land, copy the pages/posts structure (subdir per slug,
 * one .mdx per locale).
 */

const CONTENT_ROOT = join(process.cwd(), "content", "books");

function readBookFile(slug: string): BookRecord | null {
  const file = join(CONTENT_ROOT, `${slug}.mdx`);
  if (!existsSync(file)) return null;
  const raw = readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const fm = data as BookFrontmatter;
  // Hard-fallback the slug to the filename if frontmatter omitted it. Keeps
  // the URL contract single-sourced even if a future author forgets.
  if (!fm.slug) fm.slug = slug;
  return { frontmatter: fm, body: content.trim() };
}

export function getAllBookSlugs(): string[] {
  if (!existsSync(CONTENT_ROOT)) return [];
  return readdirSync(CONTENT_ROOT)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getBook(slug: string): BookRecord | null {
  return readBookFile(slug);
}

/**
 * Sorted by the `order` field ascending. Books with no order go last,
 * which keeps a half-typed draft from landing at the top of the index.
 */
export function getAllBooks(): BookRecord[] {
  const out: BookRecord[] = [];
  for (const slug of getAllBookSlugs()) {
    const b = readBookFile(slug);
    if (b) out.push(b);
  }
  return out.sort((a, b) => {
    const ao = a.frontmatter.order ?? 999;
    const bo = b.frontmatter.order ?? 999;
    return ao - bo;
  });
}

/**
 * Does the cover image actually exist on disk? Used by FeaturedBook /
 * PaidBook / BookCard to decide whether to render the photographic cover
 * or fall through to the typographic placeholder.
 */
export function coverExists(coverImage?: string): boolean {
  if (!coverImage) return false;
  const rel = coverImage.startsWith("/") ? coverImage.slice(1) : coverImage;
  const abs = join(process.cwd(), "public", rel);
  return existsSync(abs);
}
