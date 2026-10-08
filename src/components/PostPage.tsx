import Link from "next/link";
import { notFound } from "next/navigation";
import MdxBody from "@/components/mdx/MdxBody";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SideRail from "@/components/site/SideRail";
import type { Crumb } from "@/components/site/PageBanner";
import ArticleHero from "@/components/article/ArticleHero";
import MobileContents from "@/components/article/MobileContents";
import KeyTakeaways from "@/components/article/KeyTakeaways";
import PullQuote from "@/components/article/PullQuote";
import ProductPromoCard from "@/components/article/ProductPromoCard";
import AuthorBox from "@/components/article/AuthorBox";
import CTASection from "@/components/article/CTASection";
import RelatedArticles, {
  pickRelated,
} from "@/components/article/RelatedArticles";
import {
  CATEGORIES,
  getAllPosts,
  getPost,
  readingTime,
  type Locale,
  type PostRecord,
} from "@/lib/content";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  SITE_URL,
} from "@/lib/seo";
import { buildLanguageAlternates } from "@/lib/seo-graph";
import { extractHeadings } from "@/lib/article-headings";
import { headingsBySegment } from "@/lib/article-heading-ids";
import { splitAtMidH2 } from "@/lib/article-split";
import { buildLocalizedPath, publicPrefixFromContentLocale } from "@/lib/locale-url";
import { getImageDimensions } from "@/lib/image-dimensions";
import { cleanWordPressArtifacts } from "@/lib/wp-cleanup";
import { localizeHref, repairLinks } from "@/lib/link-repair";
import { normalizeHeadingLevels } from "@/lib/md-repair";
import { imageAvailable } from "@/components/article/image-available";
import {
  getArticleCategoryLabel,
  getArticleMessages,
} from "@/lib/article-localization";
import { hasTranslation, translator } from "@/i18n";
import { readyLocales } from "@/i18n/ready";
import { localizedArchivePosts } from "@/lib/localized-interface-routes";
import { CONTACT } from "@/data/site-menu";
import pageSections from "@/data/page-sections.json";

/**
 * Extract question/answer pairs from HTML <details>/<summary> blocks in the
 * article body. Used to generate FAQPage JSON-LD when an article has FAQs.
 * Strips inner HTML tags so schema.org receives plain text answers.
 */
function extractFaqItems(body: string): { question: string; answer: string }[] {
  const items: { question: string; answer: string }[] = [];
  const re = /<details[^>]*>[\s\S]*?<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const q = m[1].trim().replace(/<[^>]+>/g, "").trim();
    const a = m[2].trim().replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (q) items.push({ question: q, answer: a.slice(0, 600) });
  }
  return items;
}

const ARTICLES_INDEX = "/best-sap-articles-for-implementation-noel-dcosta/";

const SECTION_HREF: Record<string, string> = {
  Articles: ARTICLES_INDEX,
  "AI Academy": "/ai-academy/",
  "Client work": "/case-studies/",
};

// Group anchors on the articles index page.
const GROUP_ANCHOR: Record<string, string> = {
  "Enterprise Applications": "enterprise-applications",
  "Data & Analytics": "data-analytics",
  AI: "ai",
  "Consulting practice": "consulting-practice",
  "Case studies": "case-studies",
};

type PageSection = { section: string; group: string };
const SECTIONS = pageSections as Record<string, PageSection>;

/** "Data & Analytics" -> "Data & analytics"; acronyms such as "AI" stay. */
function sentenceCase(label: string): string {
  return label
    .split(" ")
    .map((word, i) =>
      i === 0 || /^[A-Z0-9/]{2,}$/.test(word) ? word : word.toLowerCase(),
    )
    .join(" ");
}

/**
 * Visible banner breadcrumb. English articles use the site section and group
 * from page-sections.json (Articles / Enterprise applications), linking to the
 * group on the articles index. Translated articles keep localized labels: the
 * localized "Articles" label and the translated category.
 */
function bannerCrumbs({
  locale,
  slug,
  sectionsLabel,
  category,
  href,
}: {
  locale: Locale;
  slug: string;
  sectionsLabel: string;
  category: { label: string; slug: string } | null;
  /** Points a link at the translated page when it is published. */
  href: (path: string) => string;
}): Crumb[] {
  const entry = locale === "en" ? SECTIONS[`/${slug}/`] : undefined;
  if (entry && entry.section !== "Index (all articles)") {
    const anchor =
      entry.section === "AI Academy" ? "academy" : GROUP_ANCHOR[entry.group];
    return [
      { label: entry.section, href: SECTION_HREF[entry.section] ?? ARTICLES_INDEX },
      {
        label: sentenceCase(entry.group),
        href: anchor ? `${ARTICLES_INDEX}#${anchor}` : ARTICLES_INDEX,
      },
    ];
  }
  const crumbs: Crumb[] = [{ label: sectionsLabel, href: href(ARTICLES_INDEX) }];
  if (category) {
    crumbs.push({ label: category.label, href: href(`/category/${category.slug}/`) });
  }
  return crumbs;
}

/**
 * Article page shell (2026 design system):
 *
 * - Banner: breadcrumb, H1 in the display face, standfirst, author meta row.
 * - Frame: sticky side rail on lg+ (back link, numbered H2 contents tracked
 *   on scroll, contact card) beside a single reading column. Under 1024px
 *   the rail collapses and an inline <details> contents block takes over.
 * - Reading column capped at 760px so line length stays readable.
 *
 * SEO behaviour is unchanged: metadata comes from the route, and this
 * component emits the same Article, BreadcrumbList and FAQPage JSON-LD.
 */
export default function PostPage({
  slug,
  locale = "en",
  post: suppliedPost,
}: {
  slug: string;
  locale?: Locale;
  post?: PostRecord & { localizedCategoryLabel?: string };
}) {
  const post: (PostRecord & { localizedCategoryLabel?: string }) | null =
    suppliedPost ?? getPost(slug, locale);
  if (!post || post.isFallback) notFound();

  const fm = post.frontmatter;
  const messages = getArticleMessages(locale);
  const tr = translator(locale);
  const prefix = publicPrefixFromContentLocale(locale);
  const lhref = (h: string) => localizeHref(prefix, h);
  // The end-of-article modules (author, related reading, product cards, call
  // to action) show on English articles, and on translated articles once the
  // locale's interface dictionary is ready (then translated).
  const showEnglishModules =
    messages.showEnglishArticleModules ||
    (prefix !== null && (readyLocales() as readonly string[]).includes(prefix));
  const catMeta = CATEGORIES[fm.category as keyof typeof CATEGORIES];
  // Category name from the interface dictionary when the locale has it.
  const categoryLabel =
    catMeta && hasTranslation(locale, catMeta.label)
      ? tr(catMeta.label)
      : getArticleCategoryLabel(locale, catMeta?.label ?? fm.category, post.localizedCategoryLabel);
  const rt = readingTime(post.body);

  // WordPress export artefacts (icon-font glyphs, plugin shortcodes, slider
  // clones) are removed before anything reads the body, so the ToC, the
  // segments and the rendered headings all see the same text. Heading ids
  // are unaffected: no heading contains those artefacts.
  const body = normalizeHeadingLevels(repairLinks(cleanWordPressArtifacts(post.body)));

  // ToC ids come from one slug pass over the full body; each rendered
  // segment is handed its slice so heading ids match the ToC hrefs.
  const headings = extractHeadings(body);
  const [bodyTop, bodyBottom] = splitAtMidH2(body);
  const [headingsTop, headingsBottom] = headingsBySegment(headings, [bodyTop, bodyBottom]);
  const tocIds = headings.map((h) => h.id);
  const hasSplit = bodyBottom.length > 0;
  const hasToc = headings.length >= 3;

  // Rail entries are the H2s; the body shows the same number above each H2.
  const railItems = hasToc
    ? headings
        .filter((h) => h.level === 2)
        .map((h) => ({ id: h.id, label: h.text }))
    : [];
  const headingNumbers = Object.fromEntries(
    railItems.map((item, i) => [item.id, String(i + 1).padStart(2, "0")]),
  );

  const pool = !showEnglishModules
    ? []
    : locale === "en"
      ? getAllPosts(locale).filter((candidate) => !candidate.isFallback)
      : localizedArchivePosts(prefix ?? "");
  const endRelated = showEnglishModules ? pickRelated(post, pool, 4) : [];
  const faqItems = extractFaqItems(post.body);

  // Same hreflang map as the route metadata, for the Nav language menu.
  const languages = buildLanguageAlternates("post", post);

  const breadcrumbs = [
    { name: messages.home, url: `${SITE_URL}${lhref("/")}` },
    catMeta
      ? {
          name: categoryLabel,
          url: `${SITE_URL}${lhref(`/category/${catMeta.slug}/`)}`,
        }
      : null,
    { name: fm.title, url: `${SITE_URL}${buildLocalizedPath(locale, fm.slug)}` },
  ].filter(Boolean) as { name: string; url: string }[];

  // Translated pages label their English-destination links with the
  // localized "Articles" string.
  const sectionsLabel = locale === "en" ? "Articles" : messages.category;
  const crumbs = bannerCrumbs({
    locale,
    slug: fm.slug,
    sectionsLabel,
    category: catMeta ? { label: categoryLabel, slug: catMeta.slug } : null,
    href: lhref,
  });

  const deck = fm.deck || fm.excerpt;
  const hero = imageAvailable(fm.hero) ? fm.hero : undefined;
  const heroDimensions = getImageDimensions(hero);

  return (
    <>
      <Nav locale={locale} languages={languages} />

      <main id="main-content" className="nd-main">
        <article className="nd-article">
          <ArticleHero
            crumbs={crumbs}
            title={fm.h1 || fm.title}
            deck={deck}
            date={fm.date}
            updated={fm.updated}
            lastReviewed={fm.lastReviewed}
            readingMinutes={rt}
            coverImage={hero}
            locale={locale}
            url={`${SITE_URL}${buildLocalizedPath(locale, fm.slug)}`}
          />

          <div className="nd-frame nd-article-frame">
            <SideRail
              back={{
                label: locale === "en" ? "All articles" : messages.category,
                href: lhref(ARTICLES_INDEX),
              }}
              label={messages.desktopContents}
              items={railItems}
              footer={
                showEnglishModules ? (
                  <div className="nd-rail-cta">
                    <span className="nd-label">{tr("Work with me")}</span>
                    <p>
                      {tr(
                        "Tell me what is going on with your ERP or AI programme. I will tell you straight if I can help.",
                      )}
                    </p>
                    <Link className="nd-btn nd-btn-primary" href={lhref(CONTACT)}>
                      {tr("Discuss your project")} <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                ) : undefined
              }
            />

            <div className="nd-article-body nd-article-main">
              <div className="nd-article-col">
                {hero && (
                  <figure className="nd-figure-hero">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={hero}
                      alt={fm.heroAlt || fm.h1 || fm.title}
                      width={heroDimensions?.width}
                      height={heroDimensions?.height}
                      fetchPriority="high"
                      decoding="async"
                    />
                  </figure>
                )}

                {fm.keyTakeaways && fm.keyTakeaways.length > 0 && (
                  <KeyTakeaways title={tr("Key takeaways")} items={fm.keyTakeaways} />
                )}

                {hasToc && (
                  <MobileContents headings={headings} label={messages.contents} />
                )}

                {/* Article body, first half */}
                <div className="prose-noel">
                  <MdxBody
                    source={bodyTop}
                    headings={headingsTop}
                    reservedHeadingIds={tocIds}
                    headingNumbers={headingNumbers}
                    isImageAvailable={imageAvailable}
                    locale={locale}
                  />
                </div>

                {/* Mid-article Command Centre reference */}
                {hasSplit && showEnglishModules && (
                  <ProductPromoCard
                    tone="dark"
                    kicker={tr("Built by Noel")}
                    title="Command Centre"
                    description={tr(
                      "Executive visibility, risk posture, and decision governance for ERP and SAP programmes. See where delivery is actually bleeding before it hits the steering committee.",
                    )}
                    href="https://commandcc.io"
                    cta={tr("Try Command Centre free")}
                    external
                  />
                )}

                {hasSplit && fm.pullQuote && (
                  <PullQuote attribution={fm.pullQuoteAttribution}>
                    {fm.pullQuote}
                  </PullQuote>
                )}

                {/* Article body, second half */}
                {hasSplit && (
                  <div className="prose-noel">
                    <MdxBody
                      source={bodyBottom}
                      headings={headingsBottom}
                      reservedHeadingIds={tocIds}
                      headingNumbers={headingNumbers}
                      isImageAvailable={imageAvailable}
                      locale={locale}
                    />
                  </div>
                )}

                {/* ERPCV reference */}
                {showEnglishModules && (
                  <ProductPromoCard
                    tone="light"
                    kicker={tr("Tool · Free to start")}
                    title={tr("Build a professional ERP CV in minutes")}
                    description={tr(
                      "Turn years of SAP, Oracle, and Microsoft programme work into a polished CV structured by role, modules, and outcomes. Used by senior ERP consultants across the Middle East, Europe, and North America.",
                    )}
                    href="https://erpcv.com"
                    cta={tr("Generate your ERP CV")}
                    external
                  />
                )}

                {showEnglishModules && <AuthorBox locale={locale} />}

                {showEnglishModules && (
                  <RelatedArticles label="Continue reading" items={endRelated} locale={locale} />
                )}

                {showEnglishModules && <CTASection locale={locale} />}
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer locale={locale} />

      {/* JSON-LD: Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(post)),
        }}
      />
      {/* JSON-LD: Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)),
        }}
      />
      {/* JSON-LD: FAQPage (only when article contains <details>/<summary> blocks) */}
      {faqItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqItems.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.answer,
                },
              })),
            }),
          }}
        />
      )}
    </>
  );
}
