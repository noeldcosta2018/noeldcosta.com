import { getAllPosts } from "@/lib/content";
import { localizedArchivePosts } from "@/lib/localized-interface-routes";
import { PUBLISHED_TRANSLATED_LOCALES, buildLocalizedPath, contentLocaleFromPublicPrefix } from "@/lib/locale-url";

// Article list for the navigation's Explore search: one small static JSON per
// language, fetched only when a visitor opens search.
export const dynamic = "force-static";

export function generateStaticParams() {
  return ["en", ...PUBLISHED_TRANSLATED_LOCALES].map((lang) => ({ lang }));
}

type Item = { t: string; d: string; h: string };

const short = (text: string | undefined) => {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  return clean.length > 150 ? `${clean.slice(0, 147).replace(/\s+\S*$/, "")}…` : clean;
};

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const content = lang === "en" ? "en" : contentLocaleFromPublicPrefix(lang);
  if (!content) return Response.json([], { status: 404 });
  const posts = content === "en" ? getAllPosts("en").filter((p) => !p.isFallback) : localizedArchivePosts(lang);
  const items: Item[] = posts.map((p) => ({
    t: p.frontmatter.title,
    d: short(p.frontmatter.excerpt || p.frontmatter.metaDescription),
    h: buildLocalizedPath(content, p.frontmatter.slug),
  }));
  return Response.json(items);
}
