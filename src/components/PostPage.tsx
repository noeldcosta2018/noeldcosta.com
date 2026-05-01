import Link from "next/link";
import { notFound } from "next/navigation";
import MdxBody from "@/components/mdx/MdxBody";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ReadingProgress from "@/components/article/ReadingProgress";
import TableOfContents from "@/components/article/TableOfContents";
import ArticleHero from "@/components/article/ArticleHero";
import KeyTakeaways from "@/components/article/KeyTakeaways";
import PullQuote from "@/components/article/PullQuote";
import ProductPromoCard from "@/components/article/ProductPromoCard";
import CTASection from "@/components/article/CTASection";
import AuthorBox from "@/components/article/AuthorBox";
import RelatedArticles, {
  pickRelated,
} from "@/components/article/RelatedArticles";
import {
  CATEGORIES,
  getAllPosts,
  getPost,
  readingTime,
  type Locale,
} from "@/lib/content";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  SITE_URL,
} from "@/lib/seo";
import { extractHeadings } from "@/lib/article-headings";
import { splitAtMidH2 } from "@/lib/article-split";

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

/**
 * Article page shell. Layout is deliberately restrained:
 *
 * - Two-column on lg+ (ToC rail + reading column) — NOT a three-column
 *   magazine with competing sidebars. The reading column is the focus.
 * - Single column under lg, with the ToC collapsed into a <details> block
 *   inline with the content.
 * - Breadcrumb is a single line, mono eyebrow style (matches Hero).
 * - Body width capped ~720px so line length stays readable.
 */
export default function PostPage({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const post = getPost(slug, locale);
  if (!post) notFound();

  const fm = post.frontmatter;
  const catMeta = CATEGORIES[fm.category as keyof typeof CATEGORIES];
  const rt = readingTime(post.body);
  const localePrefix = locale === "en" ? "" : `/${locale}`;

  const headings = extractHeadings(post.body);
  const [bodyTop, bodyBottom] = splitAtMidH2(post.body);
  const hasSplit = bodyBottom.length > 0;
  const hasToc = headings.length >= 3;

  const pool = getAllPosts(locale);
  const endRelated = pickRelated(post, pool, 4);
  const faqItems = extractFaqItems(post.body);

  const breadcrumbs = [
    { name: "Home", url: `${SITE_URL}${localePrefix}/` },
    catMeta
      ? {
          name: catMeta.label,
          url: `${SITE_URL}${localePrefix}/category/${catMeta.slug}`,
        }
      : null,
    { name: fm.title, url: `${SITE_URL}${localePrefix}/${fm.slug}` },
  ].filter(Boolean) as { name: string; url: string }[];

  const deck = fm.deck || fm.excerpt;

  return (
    <>
      <Nav />
      <ReadingProgress />

      <article className="bg-paper pt-24 md:pt-28 pb-16">
        <div className="max-w-[1200px] mx-auto px-[clamp(1.5rem,5vw,4rem)]">
          {/* Breadcrumb — single-line mono eyebrow, matches Hero pattern */}
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex flex-wrap gap-x-2 gap-y-1 items-center font-mono text-[0.68rem] font-medium tracking-[2px] uppercase">
              <li>
                <Link
                  href={`${localePrefix}/`}
                  className="text-silver hover:text-papaya transition-colors"
                >
                  Home
                </Link>
              </li>
              {catMeta && (
                <>
                  <li aria-hidden className="text-silver/40">/</li>
                  <li>
                    <Link
                      href={`${localePrefix}/category/${catMeta.slug}`}
                      className="text-silver hover:text-papaya transition-colors"
                    >
                      {catMeta.label}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden className="text-silver/40">/</li>
              <li
                aria-current="page"
                className="text-corbeau/60 truncate max-w-[200px] md:max-w-[360px] normal-case tracking-normal text-[0.68rem]"
              >
                {fm.title}
              </li>
            </ol>
          </nav>

          {/*
            Two-column grid: reading column + sticky ToC rail on the right.
            On < lg we collapse to a single column; the mobile ToC appears
            inline inside the content column as a <details> element so users
            never hit a section without a map.
          */}
          <div
            className={[
              "grid gap-x-14 gap-y-0",
              hasToc
                ? "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_248px]"
                : "grid-cols-1",
            ].join(" ")}
          >
            {/* Reading column */}
            <div className="min-w-0 max-w-[720px] w-full mx-auto lg:mx-0">
              <ArticleHero
                category={
                  catMeta
                    ? { label: catMeta.label, slug: catMeta.slug }
                    : undefined
                }
                title={fm.h1 || fm.title}
                deck={deck}
                author={fm.author || "Noel D'Costa"}
                date={fm.date}
                updated={fm.updated}
                readingMinutes={rt}
                heroImage={fm.hero}
                heroAlt={fm.heroAlt}
                localePrefix={localePrefix}
              />

              {fm.keyTakeaways && fm.keyTakeaways.length > 0 && (
                <KeyTakeaways items={fm.keyTakeaways} />
              )}

              {/* Inline ToC for < lg — single disclosure block, not a second
                  persistent sidebar. Mirrors the desktop numbered spine. */}
              {hasToc && (() => {
                let mh2 = 0;
                const mobileNumbered = headings.map((h) => ({
                  ...h,
                  number: h.level === 2 ? String(++mh2).padStart(2, "0") : null,
                }));
                return (
                  <details className="lg:hidden mb-10 rounded-xl border border-corbeau/[0.08] bg-paper p-5 group">
                    <summary className="cursor-pointer font-mono text-[0.62rem] font-medium tracking-[2.4px] uppercase text-corbeau/60 list-none flex items-center justify-between">
                      <span>Contents</span>
                      <span
                        aria-hidden
                        className="text-corbeau/40 group-open:rotate-180 transition-transform"
                      >
                        ▾
                      </span>
                    </summary>
                    <ul className="mt-5 space-y-0.5">
                      {mobileNumbered.map((h) => {
                        const isH3 = h.level === 3;
                        return (
                          <li key={h.id}>
                            <a
                              href={`#${h.id}`}
                              className={[
                                "flex items-start gap-3 py-1.5 leading-[1.4]",
                                isH3 ? "pl-8" : "",
                              ].join(" ")}
                            >
                              {!isH3 && (
                                <span
                                  aria-hidden
                                  className="font-mono text-[0.68rem] tabular-nums pt-[0.18rem] text-corbeau/30 flex-shrink-0 w-5"
                                >
                                  {h.number}
                                </span>
                              )}
                              {isH3 && (
                                <span
                                  aria-hidden
                                  className="mt-[0.65rem] w-1 h-1 rounded-full bg-corbeau/20 flex-shrink-0"
                                />
                              )}
                              <span
                                className={
                                  isH3
                                    ? "text-[0.82rem] text-night/60"
                                    : "text-[0.9rem] text-night/80"
                                }
                              >
                                {h.text}
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                );
              })()}

              {/* Article body — first half */}
              <div className="prose-noel">
                <MdxBody source={bodyTop} />
              </div>

              {/* Mid-article Command Centre reference. Slim dark block now —
                  editorial sidebar, not a banner. */}
              {hasSplit && (
                <ProductPromoCard
                  tone="dark"
                  kicker="Built by Noel"
                  title="Command Centre"
                  description="Executive visibility, risk posture, and decision governance for ERP and SAP programmes. See where delivery is actually bleeding — before it hits the steering committee."
                  href="https://commandcc.io"
                  cta="Try Command Centre free"
                  external
                />
              )}

              {hasSplit && fm.pullQuote && (
                <PullQuote attribution={fm.pullQuoteAttribution}>
                  {fm.pullQuote}
                </PullQuote>
              )}

              {/* Article body — second half */}
              {hasSplit && (
                <div className="prose-noel">
                  <MdxBody source={bodyBottom} />
                </div>
              )}

              {/* ERPCV reference — light tone with papaya side-rule */}
              <ProductPromoCard
                tone="light"
                kicker="Tool · Free to start"
                title="Build a professional ERP CV in minutes"
                description="Turn years of SAP, Oracle, and Microsoft programme work into a polished CV structured by role, modules, and outcomes. Used by senior ERP consultants across the Middle East, Europe, and North America."
                href="https://erpcv.com"
                cta="Generate your ERP CV"
                external
              />

              <AuthorBox localePrefix={localePrefix} />

              <CTASection
                title="Running an ERP programme right now?"
                body="If this article touched on a programme you are live in right now, a 30-minute conversation usually gets further than another week of internal analysis."
                primaryCta="Book a 30-min call"
                primaryHref="https://calendly.com/noeldcosta/30min"
                secondaryCta="See case studies"
                secondaryHref={`${localePrefix}/category/case-studies`}
                localePrefix={localePrefix}
              />

              <RelatedArticles
                label="Continue reading"
                items={endRelated}
                localePrefix={localePrefix}
                columns={2}
              />
            </div>

            {/* Right rail — sticky ToC only. We deliberately do NOT render a
                second "advisory" card here: the end-of-article CTA already
                makes the advisory offer, and a persistent sidebar CTA while
                reading feels needy. */}
            {hasToc && (
              <aside className="hidden lg:block">
                <div className="sticky top-24 pt-2">
                  <TableOfContents headings={headings} />
                </div>
              </aside>
            )}
          </div>
        </div>
      </article>

      <Footer />

      {/* JSON-LD — Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(post)),
        }}
      />
      {/* JSON-LD — Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)),
        }}
      />
      {/* JSON-LD — FAQPage (only when article contains <details>/<summary> blocks) */}
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
