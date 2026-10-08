import { getAllPosts } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

// RSS 2.0 feed at /feed/, the address WordPress published it at, so feed
// readers and aggregators keep working after the move. Latest 30 English
// articles; built at deploy time like the sitemap.
export const dynamic = "force-static";

const xml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export function GET() {
  const posts = getAllPosts("en")
    .filter((p) => !p.isFallback && !p.frontmatter.noindex)
    .slice(0, 30);
  const updated = posts.reduce((latest, p) => {
    const d = new Date(p.frontmatter.updated ?? p.frontmatter.date).getTime();
    return Number.isFinite(d) && d > latest ? d : latest;
  }, 0);

  const items = posts
    .map(({ frontmatter: fm }) => {
      const url = `${SITE_URL}/${fm.slug}/`;
      const summary = fm.excerpt || fm.metaDescription || "";
      return [
        "    <item>",
        `      <title>${xml(fm.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${new Date(fm.date).toUTCString()}</pubDate>`,
        `      <dc:creator>${xml(fm.author || "Noel D'Costa")}</dc:creator>`,
        `      <category>${xml(fm.category)}</category>`,
        summary ? `      <description>${xml(summary)}</description>` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Noel D'Costa</title>
    <link>${SITE_URL}/</link>
    <atom:link href="${SITE_URL}/feed/" rel="self" type="application/rss+xml" />
    <description>Enterprise applications, data and AI: articles by Noel D'Costa.</description>
    <language>en</language>
    ${updated ? `<lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>` : ""}
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
