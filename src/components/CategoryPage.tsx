import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageBanner from "@/components/site/PageBanner";
import { CloseBand } from "@/components/home/HomeSections";
import {
  CATEGORIES,
  getPostsByCategory,
  readingTime,
  type Category,
  type Locale,
  type PostRecord,
} from "@/lib/content";
import { breadcrumbJsonLd, collectionPageJsonLd, SITE_URL } from "@/lib/seo";
import { plural, translator } from "@/i18n";
import { localizeHref } from "@/lib/link-repair";
import { publicPrefixFromContentLocale } from "@/lib/locale-url";
import { getArticleMessages } from "@/lib/article-localization";
import {
  categoryPath,
  interfaceAlternates,
  interfaceMetadata,
  interfaceUrl,
  localizedCategoryPosts,
} from "@/lib/localized-interface-routes";
import { tagDisplayName } from "@/components/tagMeta";
import { ABOUT, ARTICLES_INDEX } from "@/data/site-menu";

// Category archive (/category/<slug>/, the root aliases and the translated
// /<locale>/category/<slug>/). Banner, a short "start here" list, topic chips,
// then every article as nd-post-card tiles. Interface text goes through the
// i18n dictionary; translated archives list only articles with a published
// translation and link to it.

// Menu area per category (docs/claude/site-inventory.md). The colour carries
// meaning: it is the same area colour used in the nav and on the homepage.
const AREA_BY_CATEGORY: Record<string, { label: string; color: string; anchor: string }> = {
  "erp-consulting-guide": { label: "Consulting practice", color: "var(--accent)", anchor: "#consulting-practice" },
  "sap-modules": { label: "Enterprise applications", color: "var(--area-apps)", anchor: "#enterprise-applications" },
  "erp-strategy": { label: "Enterprise applications", color: "var(--area-apps)", anchor: "#enterprise-applications" },
  "ai-governance": { label: "AI", color: "var(--area-ai)", anchor: "#ai" },
  "agentic-ai": { label: "AI", color: "var(--area-ai)", anchor: "#ai" },
  "sap-case-studies": { label: "Client work", color: "var(--accent)", anchor: "#case-studies" },
};

export const CATEGORY_TAGLINES: Record<string, string> = {
  "erp-consulting-guide": "From the field, not the slides.",
  "sap-modules": "Deep technical. Real projects.",
  "erp-strategy": "Real numbers. Not estimates.",
  "ai-governance": "Grounded. Not hype.",
  "agentic-ai": "What works now.",
  "sap-case-studies": "Real programmes. Real outcomes.",
};

const ALL_CATEGORIES = [
  { slug: "erp-consulting-guide", label: "ERP Consulting Guide" },
  { slug: "sap-modules", label: "SAP Modules" },
  { slug: "erp-strategy", label: "ERP Strategy & Cost" },
  { slug: "ai-governance", label: "AI Governance" },
  { slug: "agentic-ai", label: "Agentic AI" },
  { slug: "sap-case-studies", label: "SAP Case Studies" },
];

// Tags that only restate the category ("sap-industry-topics" is merged into
// the WordPress "sap-erp-modernization" archive, as before).
function topicKey(tag: string): string {
  return tag === "sap-industry-topics" ? "sap-erp-modernization" : tag;
}

// A few migrated posts point at hero files that were never copied into
// /public. Those cards get the typographic placeholder instead of a broken image.
const heroCache = new Map<string, boolean>();
function heroAvailable(src?: string): src is string {
  if (!src) return false;
  if (/^https?:\/\//.test(src)) return true;
  let ok = heroCache.get(src);
  if (ok === undefined) {
    ok = existsSync(join(process.cwd(), "public", src));
    heroCache.set(src, ok);
  }
  return ok;
}

export function formatPostDate(iso?: string, dateLocale = "en-GB"): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function isoDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

/** Interface helpers for one page locale: translator, link localizer, date format. */
export function archiveTools(locale: Locale) {
  const tr = translator(locale);
  const prefix = publicPrefixFromContentLocale(locale);
  const href = (h: string) => localizeHref(prefix, h);
  const dateLocale = locale === "en" ? "en-GB" : getArticleMessages(locale).dateLocale;
  /** "1 article" / "12 articles", with the plural form each language needs. */
  const count = (n: number, one: string, many: string) => `${n} ${plural(locale, n, one, many)}`;
  return { tr, prefix, href, dateLocale, count };
}

/** Article tile used by category and tag archives. */
export function PostCard({
  post,
  priority,
  feature,
  label,
  locale = "en",
}: {
  post: PostRecord;
  priority?: boolean;
  feature?: boolean;
  /** Override the eyebrow label (defaults to the post's first tag). */
  label?: string;
  locale?: Locale;
}) {
  const { tr, href, dateLocale } = archiveTools(locale);
  const fm = post.frontmatter;
  const mins = readingTime(post.body);
  const eyebrow = label ?? (fm.tags?.[0] ? tr(tagDisplayName(topicKey(fm.tags[0]))) : undefined);

  return (
    <li className={feature ? "feature" : undefined}>
      <Link
        href={href(`/${fm.slug}/`)}
        className={feature ? "nda-post feature nd-card nd-post-card nd-glow" : "nda-post nd-card nd-post-card nd-glow"}
      >
        <div className="thumb">
          {heroAvailable(fm.hero) ? (
            <Image
              src={fm.hero}
              alt={fm.title}
              fill
              priority={priority}
              sizes={feature ? "(min-width: 1100px) 640px, (min-width: 700px) 50vw, 100vw" : "(min-width: 1100px) 400px, (min-width: 700px) 50vw, 100vw"}
            />
          ) : (
            <div className="ph" aria-hidden="true">
              <span>{eyebrow ?? tr("Article")}</span>
            </div>
          )}
        </div>
        <div className="inner">
          {eyebrow && (
            <div className="nd-label">
              <i aria-hidden="true" />
              {eyebrow}
            </div>
          )}
          <h3>{fm.title}</h3>
          {fm.excerpt && <p className="text">{fm.excerpt}</p>}
          <div className="foot">
            <span>
              {fm.date && <time dateTime={isoDate(fm.date)}>{formatPostDate(fm.date, dateLocale)}</time>}
              {fm.date ? " · " : ""}
              {mins} {tr("min read")}
            </span>
            <span className="read" aria-hidden="true">
              {tr("Read")} <span>→</span>
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

/** Short author strip shared by the archives. */
export function AuthorStrip({ locale = "en" }: { locale?: Locale }) {
  const { tr, href } = archiveTools(locale);
  return (
    <div className="nda-author">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/media/noel-headshot.webp" alt="Noel D'Costa" width={72} height={72} loading="lazy" />
      <div>
        <h3>{tr("Written by Noel D'Costa")}</h3>
        <p>
          {tr(
            "25 years in ERP delivery across SAP, Oracle and Microsoft, now a chief technology officer. I write from the programmes I have run, for the people making these decisions.",
          )}
        </p>
      </div>
      <Link className="nd-textlink" href={href(ABOUT)}>
        {tr("My story")} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

/** Title and description for a category archive in any locale. */
export function categoryMetadata(category: string, locale: Locale = "en"): Metadata {
  const meta = CATEGORIES[category as keyof typeof CATEGORIES];
  if (!meta) return {};
  const { tr } = archiveTools(locale);
  return interfaceMetadata({
    locale,
    englishPath: categoryPath(meta.slug),
    title: `${tr(meta.label)} | Noel D'Costa`,
    description: tr(meta.description),
  });
}

export default function CategoryPage({ category, locale = "en" }: { category: string; locale?: Locale }) {
  if (!(category in CATEGORIES)) notFound();

  const { tr, prefix, href, dateLocale, count } = archiveTools(locale);
  const meta = CATEGORIES[category as keyof typeof CATEGORIES];
  const posts: PostRecord[] =
    locale === "en" ? getPostsByCategory(category as Category, "en") : prefix ? localizedCategoryPosts(prefix, category) : [];
  if (locale !== "en" && posts.length === 0) notFound();
  const area = AREA_BY_CATEGORY[category] ?? { label: "Articles", color: "var(--accent)", anchor: "" };
  const label = tr(meta.label);

  const englishPath = categoryPath(meta.slug);
  const categoryUrl = interfaceUrl(locale, englishPath);
  const crumbs = [
    { name: tr("Home"), url: `${SITE_URL}${href("/")}` },
    { name: label, url: categoryUrl },
  ];

  // CollectionPage JSON-LD: declares this URL as a category index that
  // contains the listed posts. Helps Google understand the taxonomy.
  const collectionLd = collectionPageJsonLd({
    url: categoryUrl,
    name: label,
    description: tr(meta.description),
    posts: posts.map((p) => ({
      slug: p.frontmatter.slug,
      title: p.frontmatter.title,
      locale,
    })),
  });
  const collection = prefix ? { ...collectionLd, inLanguage: prefix } : collectionLd;

  // Shortest three reads make the "start here" list.
  const startHere = [...posts].sort((a, b) => readingTime(a.body) - readingTime(b.body)).slice(0, 3);
  const startMax = startHere.reduce((m, p) => Math.max(m, readingTime(p.body)), 0);

  // Topic chips: the tags used most in this category.
  const tagCounts: Record<string, number> = {};
  for (const post of posts) {
    for (const tag of post.frontmatter.tags ?? []) {
      const key = topicKey(tag);
      tagCounts[key] = (tagCounts[key] ?? 0) + 1;
    }
  }
  const topicTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const otherCategories = ALL_CATEGORIES.filter((c) => c.slug !== category);
  const tagline = tr(CATEGORY_TAGLINES[category] ?? "Practical. Not theoretical.");
  const latest = posts[0]?.frontmatter.date;

  return (
    <>
      <Nav locale={locale} languages={interfaceAlternates(englishPath)} />
      <main id="main-content" className="nd-main">
        <PageBanner
          label={label}
          crumbs={[{ label: tr("Articles"), href: href(ARTICLES_INDEX) }, { label: tr("Category") }]}
          title={`${label}.`}
          highlight={tagline}
          long={label.length + tagline.length > 40}
          lede={tr(meta.description)}
          video={{ src: "/media/video/hero-loop.mp4", poster: "/media/video/hero-loop-poster.jpg" }}
        >
          <div className="nda-banner-meta">
            <Link className="nd-chip" href={`${href(ARTICLES_INDEX)}${area.anchor}`} style={{ textDecoration: "none" }}>
              <i style={{ background: area.color }} aria-hidden="true" />
              {tr(area.label)}
            </Link>
            <span className="nd-pill">{count(posts.length, "article", "articles")}</span>
            {latest && (
              <>
                <span className="sep" aria-hidden="true" />
                <span>
                  {tr("Latest")} <time dateTime={isoDate(latest)}>{formatPostDate(latest, dateLocale)}</time>
                </span>
              </>
            )}
          </div>
        </PageBanner>

        {startHere.length > 0 && (
          <section className="nda-section tight flush" aria-labelledby="start-title">
            <div className="nda-wrap">
              <div className="nda-start">
                <div>
                  <div className="nd-eyebrow">{tr("Start here")}</div>
                  <h2 id="start-title" className="nd-display nd-h2">
                    {tr("The quickest")} <span className="nd-hl">{tr("way in.")}</span>
                  </h2>
                  <p className="nd-lede">
                    {tr(
                      "Three short reads from this category, none longer than {count} minutes. Then browse by topic or work through the full list below.",
                    ).replace("{count}", String(startMax))}
                  </p>
                </div>
                <ol>
                  {startHere.map((p, i) => (
                    <li key={p.frontmatter.slug}>
                      <Link href={href(`/${p.frontmatter.slug}/`)}>
                        <span className="n">{String(i + 1).padStart(2, "0")}</span>
                        <span className="t">
                          {p.frontmatter.title}
                          <small>
                            {readingTime(p.body)} {tr("min read")}
                          </small>
                        </span>
                        <span className="go" aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
              {topicTags.length > 0 && (
                <nav className="nda-chips" aria-label={tr("Browse by topic")} style={{ marginTop: 40 }}>
                  <span className="nd-label">{tr("Browse by topic")}</span>
                  {topicTags.map(([tag, n]) => (
                    <Link key={tag} href={href(`/tag/${tag}/`)}>
                      {tr(tagDisplayName(tag))}
                      <span className="c">{n}</span>
                    </Link>
                  ))}
                </nav>
              )}
            </div>
          </section>
        )}

        <section className="nda-section" aria-labelledby="all-title">
          <div className="nda-wrap">
            <div className="nda-head">
              <div>
                <div className="nd-eyebrow">{label}</div>
                <h2 id="all-title" className="nd-display nd-h2">
                  {tr("Every article")} <span className="nd-hl">{tr("in this category.")}</span>
                </h2>
              </div>
              <p className="nda-kicker">
                <b>{posts.length}</b> {plural(locale, posts.length, "article, newest first", "articles, newest first")}
              </p>
            </div>
            <ul className="nd-list nda-list">
              {posts.map((p, i) => (
                <PostCard
                  key={p.frontmatter.slug}
                  post={p}
                  priority={i === 0}
                  feature={i === 0 && posts.length > 3}
                  locale={locale}
                />
              ))}
            </ul>
          </div>
        </section>

        <section className="nda-section tight" aria-label={tr("About the author and other categories")}>
          <div className="nda-wrap" style={{ display: "grid", gap: 24 }}>
            <AuthorStrip locale={locale} />
            <nav className="nda-chips" aria-label={tr("Other categories")}>
              <span className="nd-label">{tr("Other categories")}</span>
              {otherCategories.map((c) => (
                <Link key={c.slug} href={href(`/category/${c.slug}/`)}>
                  {tr(c.label)}
                </Link>
              ))}
              <Link href={href(ARTICLES_INDEX)}>
                {tr("All articles")} <span aria-hidden="true">→</span>
              </Link>
            </nav>
          </div>
        </section>

        <CloseBand locale={locale} />
      </main>
      <Footer locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collection) }} />
    </>
  );
}
