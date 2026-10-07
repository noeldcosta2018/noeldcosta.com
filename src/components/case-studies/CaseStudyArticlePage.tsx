import { notFound } from "next/navigation";
import Link from "next/link";
import MdxBody from "@/components/mdx/MdxBody";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SideRail from "@/components/site/SideRail";
import { CloseBand } from "@/components/home/HomeSections";
import KeyTakeaways from "@/components/article/KeyTakeaways";
import PullQuote from "@/components/article/PullQuote";
import ProductPromoCard from "@/components/article/ProductPromoCard";
import AuthorBox from "@/components/article/AuthorBox";
import MobileContents from "@/components/article/MobileContents";
import { getPost } from "@/lib/content";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  SITE_URL,
} from "@/lib/seo";
import { buildLanguageAlternates } from "@/lib/seo-graph";
import { extractHeadings } from "@/lib/article-headings";
import { splitAtMidH2 } from "@/lib/article-split";
import { headingsBySegment } from "@/lib/article-heading-ids";
import { cleanWordPressArtifacts } from "@/lib/wp-cleanup";
import { repairLinks } from "@/lib/link-repair";
import { CASE_STUDIES, type CaseStudy } from "@/lib/case-studies";
import { CLIENT_WORK, CONTACT } from "@/data/site-menu";
import CaseStudyArticleHero from "./CaseStudyArticleHero";
import RelatedCaseStudies from "./RelatedCaseStudies";

/**
 * Individual case-study article page.
 *
 * Same frame as the article template (banner, sticky side rail with numbered
 * sections, reading column) with case-study pieces swapped in:
 *   - CaseStudyArticleHero: cover behind the scrim, split headline as H1 and a
 *     fact strip (headline stat, client, industry, region, duration, role)
 *   - RelatedCaseStudies: two sibling case studies
 *
 * The MDX body is rendered as-is. JSON-LD (Article, Breadcrumb, FAQPage) is
 * unchanged.
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

  const body = repairLinks(cleanWordPressArtifacts(post.body));
  const headings = extractHeadings(body);
  const [bodyTop, bodyBottom] = splitAtMidH2(body);
  const [headingsTop, headingsBottom] = headingsBySegment(headings, [bodyTop, bodyBottom]);
  const tocIds = headings.map((h) => h.id);
  const hasSplit = bodyBottom.length > 0;
  const hasToc = headings.length >= 3;

  const railItems = hasToc
    ? headings.filter((h) => h.level === 2).map((h) => ({ id: h.id, label: h.text }))
    : [];
  const headingNumbers = Object.fromEntries(
    railItems.map((item, i) => [item.id, String(i + 1).padStart(2, "0")]),
  );

  const faqItems = extractFaqItems(post.body);

  // Same hreflang map as the route metadata, for the Nav language menu.
  const languages = buildLanguageAlternates("post", post);

  const breadcrumbs: { name: string; url: string }[] = [
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Case Studies", url: `${SITE_URL}/case-studies` },
    { name: fm.title, url: `${SITE_URL}/${fm.slug}` },
  ];

  return (
    <>
      <Nav languages={languages} />

      <main id="main-content" className="nd-main nda-print">
        <article className="nd-article">
          <CaseStudyArticleHero c={study as CaseStudy} />

          <div className="nd-frame nd-article-frame">
            <SideRail
              back={{ label: "All case studies", href: CLIENT_WORK }}
              label="Contents"
              items={railItems}
              footer={
                <div className="nd-rail-cta">
                  <span className="nd-label">Work with me</span>
                  <p>Facing a programme like this one? Tell me where it stands and I will tell you straight if I can help.</p>
                  <Link className="nd-btn nd-btn-primary" href={CONTACT}>
                    Discuss your project <span aria-hidden="true">→</span>
                  </Link>
                </div>
              }
            />

            <div className="nd-article-body nd-article-main">
              <div className="nd-article-col">
                {fm.keyTakeaways && fm.keyTakeaways.length > 0 && <KeyTakeaways items={fm.keyTakeaways} />}

                {hasToc && <MobileContents headings={headings} label="Contents" />}

                {/* Article body, first half */}
                <div className="prose-noel">
                  <MdxBody
                    source={bodyTop}
                    headings={headingsTop}
                    reservedHeadingIds={tocIds}
                    headingNumbers={headingNumbers}
                  />
                </div>

                {/* Mid-article Command Centre reference */}
                {hasSplit && (
                  <ProductPromoCard
                    tone="dark"
                    kicker="Built by Noel"
                    title="Command Centre"
                    description="Executive visibility, risk posture and decision governance for ERP and SAP programmes. See where delivery is slipping before it reaches the steering committee."
                    href="https://commandcc.io"
                    cta="Try Command Centre free"
                    external
                    image="/images/wp/2025/02/dashboard.webp"
                  />
                )}

                {hasSplit && fm.pullQuote && (
                  <PullQuote attribution={fm.pullQuoteAttribution}>{fm.pullQuote}</PullQuote>
                )}

                {/* Article body, second half */}
                {hasSplit && (
                  <div className="prose-noel">
                    <MdxBody
                      source={bodyBottom}
                      headings={headingsBottom}
                      reservedHeadingIds={tocIds}
                      headingNumbers={headingNumbers}
                    />
                  </div>
                )}

                <AuthorBox />
              </div>
            </div>
          </div>
        </article>

        {/* Other programmes: two sibling case studies */}
        <RelatedCaseStudies current={study as CaseStudy} />
        <CloseBand />
      </main>

      <Footer />

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
