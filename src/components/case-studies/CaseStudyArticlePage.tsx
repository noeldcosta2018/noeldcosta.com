import { notFound } from "next/navigation";
import MdxBody from "@/components/mdx/MdxBody";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ReadingProgress from "@/components/article/ReadingProgress";
import TableOfContents from "@/components/article/TableOfContents";
import KeyTakeaways from "@/components/article/KeyTakeaways";
import PullQuote from "@/components/article/PullQuote";
import ProductPromoCard from "@/components/article/ProductPromoCard";
import AuthorBox from "@/components/article/AuthorBox";
import FadeUp from "@/components/article/FadeUp";
import { getPost } from "@/lib/content";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  SITE_URL,
} from "@/lib/seo";
import { extractHeadings } from "@/lib/article-headings";
import { splitAtMidH2 } from "@/lib/article-split";
import { CASE_STUDIES, type CaseStudy } from "@/lib/case-studies";
import CaseStudyArticleHero from "./CaseStudyArticleHero";
import RelatedCaseStudies from "./RelatedCaseStudies";

/**
 * Individual case-study article page.
 *
 * Mirrors PostPage's overall composition (sticky ToC, KeyTakeaways,
 * mid-article PullQuote, ProductPromoCard, AuthorBox, JSON-LD) but
 * swaps:
 *   - ArticleHero  → CaseStudyArticleHero (full-width cover, headline
 *                    overlay, floating glass stat card, meta strip)
 *   - RelatedArticles → RelatedCaseStudies (2 sibling case studies)
 *
 * The MDX body is rendered as-is — no restructuring of existing copy.
 * Sticky narrative pattern comes from the existing TableOfContents
 * component (already a sticky right-rail with current-section highlight
 * via scroll spy).
 *
 * View Transitions: the hero image inside CaseStudyArticleHero carries
 * `view-transition-name: case-<slug>` matching the card on the index
 * page, so Chrome 126+ animates the card into the hero on click.
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

export default function CaseStudyArticlePage({
  slug,
}: {
  slug: string;
}) {
  const post = getPost(slug, "en");
  const study = CASE_STUDIES.find((c) => c.slug === slug);
  if (!post || !study) notFound();

  const fm = post.frontmatter;

  const headings = extractHeadings(post.body);
  const [bodyTop, bodyBottom] = splitAtMidH2(post.body);
  const hasSplit = bodyBottom.length > 0;
  const hasToc = headings.length >= 3;

  const faqItems = extractFaqItems(post.body);

  const breadcrumbs: { name: string; url: string }[] = [
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Case Studies", url: `${SITE_URL}/case-studies` },
    { name: fm.title, url: `${SITE_URL}/${fm.slug}` },
  ];

  return (
    <>
      <Nav />
      <ReadingProgress />

      <main className="pt-16">
        <CaseStudyArticleHero c={study as CaseStudy} />

        <article className="bg-paper pb-16">
          <div className="max-w-[1200px] mx-auto px-[clamp(1.5rem,5vw,4rem)] pt-12">
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
                {fm.keyTakeaways && fm.keyTakeaways.length > 0 && (
                  <KeyTakeaways items={fm.keyTakeaways} />
                )}

                {/* Mobile ToC collapses inline */}
                {hasToc && (() => {
                  let mh2 = 0;
                  const numbered = headings.map((h) => ({
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
                        {numbered.map((h) => {
                          const isH3 = h.level === 3;
                          return (
                            <li key={h.id}>
                              <a
                                href={`#${h.id}`}
                                className={[
                                  "flex items-start gap-3 py-3 leading-[1.4]",
                                  isH3 ? "pl-8 min-h-[40px]" : "min-h-[44px]",
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

                {/* Mid-article Command Centre reference */}
                {hasSplit && (
                  <ProductPromoCard
                    tone="dark"
                    kicker="Built by Noel"
                    title="Command Centre"
                    description="Executive visibility, risk posture, and decision governance for ERP and SAP programmes. See where delivery is actually bleeding — before it hits the steering committee."
                    href="https://commandcc.io"
                    cta="Try Command Centre free"
                    external
                    image="/images/wp/2025/02/dashboard.webp"
                  />
                )}

                {hasSplit && fm.pullQuote && (
                  <FadeUp>
                    <PullQuote attribution={fm.pullQuoteAttribution}>
                      {fm.pullQuote}
                    </PullQuote>
                  </FadeUp>
                )}

                {/* Article body — second half */}
                {hasSplit && (
                  <div className="prose-noel">
                    <MdxBody source={bodyBottom} />
                  </div>
                )}

                {/* Combined author + advisory CTA card */}
                <FadeUp>
                  <AuthorBox />
                </FadeUp>
              </div>

              {/* Right rail — sticky narrative ToC */}
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

        {/* Other programmes — 2 sibling case studies */}
        <RelatedCaseStudies current={study as CaseStudy} />
      </main>

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
                acceptedAnswer: { "@type": "Answer", text: item.answer },
              })),
            }),
          }}
        />
      )}
    </>
  );
}
