import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageBanner from "@/components/site/PageBanner";
import { CloseBand } from "@/components/home/HomeSections";
import { AuthorStrip, PostCard, archiveTools } from "@/components/CategoryPage";
import { getPostsByAnyTag, type Locale, type PostRecord } from "@/lib/content";
import { breadcrumbJsonLd, collectionPageJsonLd, SITE_URL } from "@/lib/seo";
import {
  interfaceAlternates,
  interfaceMetadata,
  interfaceUrl,
  localizedTagPosts,
  tagPath,
} from "@/lib/localized-interface-routes";
import {
  tagDisplayName,
  tagInfo,
  tagSynonyms,
  WORDPRESS_TAG_SLUGS,
} from "@/components/tagMeta";
import { ARTICLES_INDEX } from "@/data/site-menu";
import { plural } from "@/i18n";

// Tag archive (/tag/<slug>/ and, for the six WordPress topics, the translated
// /<locale>/tag/<slug>/): banner, every tagged article as nd-post-card tiles,
// related topics and the six main WordPress topics. Translated archives list
// only articles with a published translation and are not generated empty.

export const LIBRARY_LINKS = [
  { label: "Enterprise applications", href: `${ARTICLES_INDEX}#enterprise-applications` },
  { label: "Data & analytics", href: `${ARTICLES_INDEX}#data-analytics` },
  { label: "AI", href: `${ARTICLES_INDEX}#ai` },
  { label: "Consulting practice", href: `${ARTICLES_INDEX}#consulting-practice` },
  { label: "Case studies", href: `${ARTICLES_INDEX}#case-studies` },
];

/** Title and description for a tag archive in any locale. */
export function tagMetadata(tag: string, locale: Locale = "en"): Metadata {
  const { tr } = archiveTools(locale);
  const info = tagInfo(tag);
  const description = info.description
    ? tr(info.description)
    : `Articles tagged ${info.label} from Noel D'Costa: field-tested ERP and AI advisory.`;
  return interfaceMetadata({
    locale,
    englishPath: tagPath(tag),
    title: `${tr(info.label)} | Noel D'Costa`,
    description,
  });
}

export default function TagPage({ tag, locale = "en" }: { tag: string; locale?: Locale }) {
  const { tr, prefix, href, count } = archiveTools(locale);
  const info = tagInfo(tag);
  const name = tr(tagDisplayName(tag));
  const synonyms = tagSynonyms(tag);
  const posts: PostRecord[] =
    locale === "en" ? getPostsByAnyTag(synonyms, "en") : prefix ? localizedTagPosts(prefix, tag) : [];
  if (locale !== "en" && posts.length === 0) notFound();

  const englishPath = tagPath(tag);
  const tagUrl = interfaceUrl(locale, englishPath);
  const crumbs = [
    { name: tr("Home"), url: `${SITE_URL}${href("/")}` },
    { name: tr(info.label), url: tagUrl },
  ];

  const collectionLd = collectionPageJsonLd({
    url: tagUrl,
    name: tr(info.label),
    description: info.description ? tr(info.description) : `Articles tagged ${info.label} by Noel D'Costa.`,
    posts: posts.map((p) => ({
      slug: p.frontmatter.slug,
      title: p.frontmatter.title,
      locale,
    })),
  });
  const collection = prefix ? { ...collectionLd, inLanguage: prefix } : collectionLd;

  // Related topics: tags that appear alongside this one, most frequent first.
  const related: Record<string, number> = {};
  const skip = new Set([...synonyms, "sap-industry-topics"]);
  for (const p of posts) {
    for (const t of p.frontmatter.tags ?? []) {
      if (skip.has(t)) continue;
      related[t] = (related[t] ?? 0) + 1;
    }
  }
  const relatedTags = Object.entries(related)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12);

  // The six WordPress topic archives, without the page itself or its alias.
  const mainTopics = WORDPRESS_TAG_SLUGS.filter((t) => t !== "sap-industry-topics" && !synonyms.includes(t));

  const lede = info.description
    ? tr(info.description)
    : `Articles on ${name}, newest first. Field notes from SAP, ERP and AI programmes.`;

  return (
    <>
      <Nav locale={locale} languages={interfaceAlternates(englishPath)} />
      <main id="main-content" className="nd-main">
        <PageBanner
          label={name}
          crumbs={[{ label: tr("Articles"), href: href(ARTICLES_INDEX) }, { label: tr("Topic") }]}
          title={name}
          long={name.length > 28}
          lede={lede}
          video={{ src: "/media/video/hero-loop.mp4", poster: "/media/video/hero-loop-poster.jpg" }}
        >
          <div className="nda-banner-meta">
            {posts.length > 0 ? (
              <span className="nd-pill">{count(posts.length, "article", "articles")}</span>
            ) : (
              <span className="nd-pill">{tr("Coming soon")}</span>
            )}
            <span>{tr("Topic archive")}</span>
          </div>
        </PageBanner>

        {posts.length === 0 ? (
          <section className="nda-section tight flush" aria-labelledby="soon-title">
            <div className="nda-wrap nda-soon">
              <div>
                <div className="nd-eyebrow">{tr("On the way")}</div>
                <h2 id="soon-title" className="nd-display nd-h2">
                  {tr("New articles")} <span className="nd-hl">{tr("are coming.")}</span>
                </h2>
              </div>
              <div className="nd-band">
                <span className="star" aria-hidden="true">
                  ★
                </span>
                <p>{tr("New articles on this topic are on the way. Stay tuned.")}</p>
              </div>
              <nav className="nda-chips" aria-label={tr("Browse the library")}>
                <span className="nd-label">{tr("Meanwhile, browse the library")}</span>
                {LIBRARY_LINKS.map((l) => (
                  <Link key={l.href} href={href(l.href)}>
                    {tr(l.label)}
                  </Link>
                ))}
                <Link href={href(ARTICLES_INDEX)}>
                  {tr("All articles")} <span aria-hidden="true">→</span>
                </Link>
              </nav>
            </div>
          </section>
        ) : (
          <section className="nda-section tight flush" aria-labelledby="all-title">
            <div className="nda-wrap">
              <div className="nda-head">
                <div>
                  <div className="nd-eyebrow">{name}</div>
                  <h2 id="all-title" className="nd-display nd-h2">
                    {tr("Every article")} <span className="nd-hl">{tr("on this topic.")}</span>
                  </h2>
                </div>
                <p className="nda-kicker">
                  <b>{posts.length}</b>{" "}
                  {plural(locale, posts.length, "article, newest first", "articles, newest first")}
                </p>
              </div>
              <ul className="nd-list nda-list">
                {posts.map((p, i) => {
                  // Label each card with its next topic, not the one this page is about.
                  const other = (p.frontmatter.tags ?? []).find((t) => !skip.has(t));
                  return (
                    <PostCard
                      key={p.frontmatter.slug}
                      post={p}
                      priority={i === 0}
                      feature={i === 0 && posts.length > 3}
                      label={other ? tr(tagDisplayName(other)) : name}
                      locale={locale}
                    />
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        <section className="nda-section tight" aria-label={tr("Related topics and the author")}>
          <div className="nda-wrap" style={{ display: "grid", gap: 16 }}>
            {relatedTags.length > 0 && (
              <nav className="nda-chips" aria-label={tr("Related topics")}>
                <span className="nd-label">{tr("Related topics")}</span>
                {relatedTags.map(([t, n]) => (
                  <Link key={t} href={href(`/tag/${t}/`)}>
                    {tr(tagDisplayName(t))}
                    <span className="c">{n}</span>
                  </Link>
                ))}
              </nav>
            )}
            <nav className="nda-chips" aria-label={tr("Main topics")}>
              <span className="nd-label">{tr("Main topics")}</span>
              {mainTopics.map((t) => (
                <Link key={t} href={href(`/tag/${t}/`)}>
                  {tr(tagDisplayName(t))}
                </Link>
              ))}
              <Link href={href(ARTICLES_INDEX)}>
                {tr("All articles")} <span aria-hidden="true">→</span>
              </Link>
            </nav>
            <div style={{ marginTop: 8 }}>
              <AuthorStrip locale={locale} />
            </div>
          </div>
        </section>

        <CloseBand locale={locale} />
      </main>
      <Footer locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(crumbs)),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collection) }} />
    </>
  );
}
