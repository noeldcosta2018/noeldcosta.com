import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

// Locale constants live in a standalone module so middleware can import them
// without pulling content.ts (and its readdirSync content-tree scan) into
// its serverless bundle. Imported here so the rest of content.ts can use
// `Locale` locally, and re-exported for backwards compatibility with
// existing importers throughout the app.
import { LOCALES, TIER_1_LOCALES, RTL_LOCALES, type Locale } from "./locales";
export { LOCALES, TIER_1_LOCALES, RTL_LOCALES, type Locale };

export type Category =
  | "erp-implementation"
  | "platforms-modules"
  | "erp-strategy"
  | "ai-governance"
  | "agentic-ai"
  | "case-studies"
  | "consulting-career";

export const CATEGORIES: Record<Exclude<Category, "consulting-career">, { label: string; slug: string; description: string }> = {
  "erp-implementation": {
    label: "ERP Implementation",
    slug: "erp-implementation",
    description: "Planning, cost, risk, and delivery of ERP implementations.",
  },
  "platforms-modules": {
    label: "Platforms & Modules",
    slug: "platforms-modules",
    description: "Deep technical coverage of SAP and ERP modules.",
  },
  "erp-strategy": {
    label: "ERP Strategy & Cost",
    slug: "erp-strategy",
    description: "Vendor selection, licensing, modernization, and ERP economics.",
  },
  "ai-governance": {
    label: "AI Governance",
    slug: "ai-governance",
    description: "Responsible AI frameworks, risk management, and compliance.",
  },
  "agentic-ai": {
    label: "Agentic AI",
    slug: "agentic-ai",
    description: "Generative and agentic AI in enterprise ERP contexts.",
  },
  "case-studies": {
    label: "Case Studies",
    slug: "case-studies",
    description: "Real programmes, outcomes, and lessons.",
  },
};

export interface PostFrontmatter {
  title: string;
  slug: string;
  date: string;
  updated?: string;
  excerpt?: string;
  deck?: string; // one-line standfirst shown below the H1; falls back to excerpt
  hero?: string;
  heroAlt?: string;
  category: Category;
  tags?: string[];
  author?: string;
  originalUrl?: string;
  excludeFromNav?: boolean;
  keyTakeaways?: string[]; // renders the "Key takeaways" card near the top
  pullQuote?: string; // optional pull quote body (surfaces mid-article)
  pullQuoteAttribution?: string;
  // SEO overrides
  metaTitle?: string;
  metaDescription?: string;
  h1?: string;
  primaryKeyword?: string;
  canonical?: string;
  noindex?: boolean;
}

export interface PageFrontmatter {
  title: string;
  slug: string;
  date: string;
  updated?: string;
  excerpt?: string;
  hero?: string;
  originalUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  h1?: string;
  canonical?: string;
  noindex?: boolean;
}

export interface PostRecord {
  frontmatter: PostFrontmatter;
  body: string;
  locale: Locale;
}

export interface PageRecord {
  frontmatter: PageFrontmatter;
  body: string;
  locale: Locale;
}

const CONTENT_ROOT = join(process.cwd(), "content");

function safeRead(path: string): string | null {
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf8");
}

function listSlugs(kind: "posts" | "pages"): string[] {
  const dir = join(CONTENT_ROOT, kind);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory();
  });
}

/**
 * Drop <style>/<script> and their orphan CSS/JS content so they don't render
 * inline. react-markdown + rehype-raw handles the rest of the HTML safely.
 */
function sanitizeMdxBody(body: string): string {
  return body
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

function loadMdx<T>(path: string, locale: Locale): { frontmatter: T; body: string; locale: Locale } | null {
  const raw = safeRead(path);
  if (!raw) return null;
  const { data, content } = matter(raw);
  return { frontmatter: data as T, body: sanitizeMdxBody(content), locale };
}

function resolveWithFallback<T>(kind: "posts" | "pages", slug: string, locale: Locale):
  | { frontmatter: T; body: string; locale: Locale; isFallback: boolean }
  | null {
  const primary = join(CONTENT_ROOT, kind, slug, `${locale}.mdx`);
  const hit = loadMdx<T>(primary, locale);
  if (hit) return { ...hit, isFallback: false };
  if (locale === "en") return null;
  const fallback = join(CONTENT_ROOT, kind, slug, "en.mdx");
  const en = loadMdx<T>(fallback, "en");
  return en ? { ...en, locale, isFallback: true } : null;
}

export function getPost(slug: string, locale: Locale = "en"): PostRecord | null {
  const r = resolveWithFallback<PostFrontmatter>("posts", slug, locale);
  if (!r) return null;
  return { frontmatter: r.frontmatter, body: r.body, locale: r.locale };
}

export function getPage(slug: string, locale: Locale = "en"): PageRecord | null {
  const r = resolveWithFallback<PageFrontmatter>("pages", slug, locale);
  if (!r) return null;
  return { frontmatter: r.frontmatter, body: r.body, locale: r.locale };
}

export function getAllPostSlugs(): string[] {
  return listSlugs("posts");
}

export function getAllPageSlugs(): string[] {
  return listSlugs("pages");
}

export function getAllPosts(locale: Locale = "en"): PostRecord[] {
  const out: PostRecord[] = [];
  for (const slug of getAllPostSlugs()) {
    const p = getPost(slug, locale);
    if (p) out.push(p);
  }
  return out.sort(
    (a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  );
}

export function getPostsByCategory(category: Category, locale: Locale = "en"): PostRecord[] {
  return getAllPosts(locale).filter((p) => p.frontmatter.category === category);
}

/**
 * Which locales have first-class content for a given post slug?
 * Used to emit hreflang only for locales that actually have an MDX file.
 */
export function getAvailableLocales(kind: "posts" | "pages", slug: string): Locale[] {
  const dir = join(CONTENT_ROOT, kind, slug);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, "") as Locale)
    .filter((l) => LOCALES.includes(l));
}

/**
 * Estimate reading time from markdown body.
 */
export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 225));
}
