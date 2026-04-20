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
} from "@/lib/content";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  SITE_URL,
} from "@/lib/seo";
import { extractHeadings } from "@/lib/article-headings";
import { splitAtMidH2 } from "@/lib/article-split";

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

  // ── ToC, body split, related picks are derived once at render time ────
  const headings = extractHeadings(post.body);
  const [bodyTop, bodyBottom] = splitAtMidH2(post.body);
  const hasSplit = bodyBottom.length > 0;

  const pool = getAllPosts(locale);
  const midRelated = pickRelated(post, pool, 3);
  const endRelated = pickRelated(post, pool, 4);

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

      <article className="bg-bone pt-24 pb-16">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap gap-1.5 items-center font-mono text-[0.68rem] tracking-[1.5px] uppercase text-night/70">
              <li>
                <Link
                  href={`${localePrefix}/`}
                  className="hover:text-papaya transition-colors"
                >
                  Home
                </Link>
              </li>
              {catMeta && (
                <>
                  <li aria-hidden className="text-corbeau/30">/</li>
                  <li>
                    <Link
                      href={`${localePrefix}/category/${catMeta.slug}`}
                      className="hover:text-papaya transition-colors"
                    >
                      {catMeta.label}
                    </Link>
                  </li>
                </>
              )}
            </ol>
          </nav>

          {/* Two-column editorial layout: sticky ToC on the left, article on
              the right. Stacks into a single column under 1024px; the ToC is
              rendered first in DOM order but visually placed via grid columns
              so the H1 is still the first thing you see on mobile. */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] xl:grid-cols-[240px_minmax(0,1fr)_260px] gap-x-10 gap-y-8">
            {/* Left: Table of contents (desktop only, xl up) */}
            <aside className="hidden xl:block order-2 xl:order-1">
              <div className="sticky top-24">
                <TableOfContents headings={headings} />
              </div>
            </aside>

            {/* Center: article body */}
            <div className="min-w-0 order-1 xl:order-2 max-w-[760px] mx-auto lg:mx-0 lg:ml-auto xl:ml-0 w-full">
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

              {/* Mobile ToC: collapsed to a details/summary block, visible only
                  under xl where the sticky sidebar disappears. */}
              {headings.length > 0 && (
                <details className="xl:hidden mb-8 rounded-[12px] border border-corbeau/10 bg-paper p-5 group">
                  <summary className="cursor-pointer font-mono text-[0.62rem] font-semibold tracking-[2.5px] uppercase text-papaya list-none flex items-center justify-between">
                    <span>On this page</span>
                    <span
                      aria-hidden
                      className="text-corbeau/40 group-open:rotate-180 transition-transform"
                    >
                      ▾
                    </span>
                  </summary>
                  <ul className="mt-4 space-y-1 border-l border-corbeau/10">
                    {headings.map((h) => (
                      <li key={h.id} className={h.level === 3 ? "ml-3" : ""}>
                        <a
                          href={`#${h.id}`}
                          className={[
                            "block py-1.5 pl-4 text-night/90 hover:text-corbeau transition-colors",
                            h.level === 3
                              ? "text-[0.82rem] text-night/70"
                              : "text-[0.92rem]",
                          ].join(" ")}
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              {/* Article body — first half (or the whole thing if the piece
                  is too short to warrant a mid-article promo). */}
              <div className="prose-noel">
                <MdxBody source={bodyTop} />
              </div>

              {/* Mid-article: Command Centre promo (dark, high-contrast).
                  Keep it out of very short pieces by checking hasSplit. */}
              {hasSplit && (
                <ProductPromoCard
                  tone="dark"
                  kicker="Built by Noel"
                  title="Command Centre — run the programme, not the project plan"
                  description="Executive visibility, risk posture, and decision governance for ERP and SAP programmes. See where delivery is actually bleeding, before it hits the steering committee."
                  href="https://commandcentre.noeldcosta.com"
                  cta="See Command Centre"
                  external
                />
              )}

              {hasSplit && fm.pullQuote && (
                <PullQuote attribution={fm.pullQuoteAttribution}>
                  {fm.pullQuote}
                </PullQuote>
              )}

              {hasSplit && midRelated.length >= 3 && (
                <RelatedArticles
                  label="Recommended for IT leaders"
                  items={midRelated}
                  localePrefix={localePrefix}
                  columns={3}
                />
              )}

              {/* Article body — second half */}
              {hasSplit && (
                <div className="prose-noel">
                  <MdxBody source={bodyBottom} />
                </div>
              )}

              {/* ERPCV promo (light) — always renders, regardless of split */}
              <ProductPromoCard
                tone="light"
                kicker="Tool"
                title="ERPCV — an evaluation framework for picking the right ERP"
                description="A structured scorecard for comparing SAP, Oracle, and Microsoft shortlists against the criteria that actually matter to your programme — not the vendor's deck."
                href="https://erpcv.noeldcosta.com"
                cta="Open ERPCV"
                external
              />

              {/* Author credibility */}
              <AuthorBox localePrefix={localePrefix} />

              {/* Final CTA */}
              <CTASection localePrefix={localePrefix} />

              {/* End-of-article related reading */}
              <RelatedArticles
                label="Continue reading"
                items={endRelated}
                localePrefix={localePrefix}
                columns={4}
              />
            </div>

            {/* Right: mini advisory rail, desktop-only. Intentionally sparse —
                a single compact service block so the reading column stays the
                visual focus. */}
            <aside className="hidden lg:block order-3">
              <div className="sticky top-24 space-y-5">
                <div className="rounded-[12px] bg-paper border border-corbeau/[0.06] p-5">
                  <p className="font-mono text-[0.6rem] font-semibold tracking-[2.5px] uppercase text-papaya mb-3">
                    Advisory
                  </p>
                  <h4 className="font-display font-bold text-corbeau text-[0.98rem] leading-[1.25] tracking-[-0.01em] mb-2">
                    Stuck on an ERP or SAP programme?
                  </h4>
                  <p className="text-night/80 text-[0.85rem] leading-[1.55] mb-4">
                    Programme recovery, modernisation, and implementation
                    support — from someone who has sat in the room.
                  </p>
                  <Link
                    href={`${localePrefix}/about`}
                    className="inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[1.6px] font-semibold text-corbeau hover:text-papaya group"
                  >
                    <span className="border-b border-current pb-0.5">
                      Work with Noel
                    </span>
                    <span
                      aria-hidden
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </Link>
                </div>

                <div className="rounded-[12px] bg-cream border border-corbeau/[0.06] p-5">
                  <p className="font-mono text-[0.6rem] font-semibold tracking-[2.5px] uppercase text-papaya mb-3">
                    You may also need
                  </p>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        href={`${localePrefix}/sap-implementation-cost-calculator`}
                        className="block font-display font-bold text-corbeau text-[0.9rem] leading-[1.3] tracking-[-0.01em] hover:text-canyon transition-colors"
                      >
                        SAP cost calculator →
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={`${localePrefix}/free-data-migration-estimator-sap-oracle-microsoft`}
                        className="block font-display font-bold text-corbeau text-[0.9rem] leading-[1.3] tracking-[-0.01em] hover:text-canyon transition-colors"
                      >
                        Data migration estimator →
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={`${localePrefix}/sap-solution-builder`}
                        className="block font-display font-bold text-corbeau text-[0.9rem] leading-[1.3] tracking-[-0.01em] hover:text-canyon transition-colors"
                      >
                        Solution builder →
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <Footer />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(post)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)),
        }}
      />
    </>
  );
}
