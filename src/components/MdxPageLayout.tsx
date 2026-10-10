import { notFound } from "next/navigation";
import MdxBody from "@/components/mdx/MdxBody";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageBanner, { type Crumb } from "@/components/site/PageBanner";
import SideRail from "@/components/site/SideRail";
import { CloseBand } from "@/components/home/HomeSections";
import ArticlesLibrary, { getLibrary } from "@/components/pages/ArticlesLibrary";
import AiProjects from "@/components/pages/AiProjects";
import ExpertiseAreas from "@/components/pages/ExpertiseAreas";
import ComingSoon from "@/components/pages/ComingSoon";
import Doodle from "@/components/doodles/Doodle";
import { getPage, type PageRecord } from "@/lib/content";
import { getArticleMessages } from "@/lib/article-localization";
import { extractHeadings } from "@/lib/article-headings";
import { buildLanguageAlternates, resolveCanonicalUrl } from "@/lib/seo-graph";
import { publicPathFromOriginalUrl, publicPrefixFromContentLocale } from "@/lib/locale-url";
import { cleanWordPressArtifacts, replaceTestimonialSliders } from "@/lib/wp-cleanup";
import { localizeHref, repairLinks } from "@/lib/link-repair";
import { normalizeHeadingLevels } from "@/lib/md-repair";
import { translator } from "@/i18n";
import { TESTIMONIALS } from "@/components/article/testimonials/data";
import sections from "@/data/page-sections.json";
import {
  ABOUT,
  ACADEMY,
  ARTICLES_INDEX,
  CLIENT_WORK,
  CONTACT,
  EXPERTISE,
} from "@/data/site-menu";
import {
  PAGE_ARTICLE_WORDCOUNT_THRESHOLD,
  SITE_URL,
  breadcrumbJsonLd,
  contactPageJsonLd,
  countWords,
  extractFaqItems,
  faqPageJsonLd,
  pageArticleJsonLd,
  pageWebPageJsonLd,
} from "@/lib/seo";

type SectionEntry = { section: string; group: string };
const SECTIONS = sections as Record<string, SectionEntry>;

const SECTION_HREF: Record<string, string> = {
  Expertise: EXPERTISE,
  "Client work": CLIENT_WORK,
  "AI Academy": ACADEMY,
  Articles: ARTICLES_INDEX,
  Tools: "/simplify-your-business-with-erp-ai-tools/",
  About: ABOUT,
  Books: "/books/",
};

const LIBRARY_SLUG = "best-sap-articles-for-implementation-noel-dcosta";
const PARTNERS_SLUG = "all-our-partners";
const EXPERTISE_SLUG = "erp-ai-services";

function sentenceCase(label: string): string {
  if (/^(AI|SAP|ERP)\b/.test(label)) return label;
  return label.charAt(0) + label.slice(1).toLowerCase().replace("ai ", "AI ");
}

/** Display width of a title: CJK and Hangul glyphs are about two Latin characters wide. */
function visualLength(text: string): number {
  const wide: [number, number][] = [
    [0x1100, 0x11ff],
    [0x3000, 0x9fff],
    [0xac00, 0xd7af],
    [0xff00, 0xffef],
  ];
  return Array.from(text).reduce((n, ch) => {
    const cp = ch.codePointAt(0) ?? 0;
    return n + (wide.some(([a, b]) => cp >= a && cp <= b) ? 2 : 1);
  }, 0);
}

/** English public path used for menu classification (the translated page shares it). */
function englishPath(page: PageRecord): string {
  const path = publicPathFromOriginalUrl(page.frontmatter.originalUrl, page.frontmatter.slug);
  // Translated frontmatter may carry the prefixed URL; classification is by the English path.
  return path.replace(/^\/(ar|de|es|fr|hi|it|ja|ko|nl|pt|ru|tr|zh-CN|zh-TW|el|hr)\//, "/");
}

/** Banner media by section: B-roll for expertise, the approved portraits for about and contact. */
function bannerMedia(section: SectionEntry | undefined, slug: string) {
  if (/^contact[-_]/.test(slug)) {
    return {
      video: { src: "/media/video/close-loop.mp4", poster: "/media/video/close-loop-poster.jpg" },
      portrait: { src: "/media/noel-academy.webp", width: 1122, height: 1402 },
    };
  }
  if (section?.section === "About" && (section.group === "My story" || section.group === "About")) {
    return { portrait: { src: "/media/noel-hero.webp", width: 1122, height: 1402 } };
  }
  if (section?.section === "Expertise") {
    return { video: { src: "/media/video/hero-loop.mp4", poster: "/media/video/hero-loop-poster.jpg" } };
  }
  if (section?.section === "AI Academy") {
    return { video: { src: "/media/video/academy-loop.mp4", poster: "/media/video/academy-loop-poster.jpg" } };
  }
  return {};
}

export default function MdxPageLayout({
  slug,
  page: suppliedPage,
  publicPath,
}: {
  slug: string;
  page?: PageRecord;
  publicPath?: string;
}) {
  const page = suppliedPage ?? getPage(slug, "en");
  if (!page || page.isFallback) notFound();
  const fm = page.frontmatter;
  const messages = getArticleMessages(page.locale);
  const isEnglish = page.locale === "en";
  const tr = translator(page.locale);
  const prefix = isEnglish ? null : publicPrefixFromContentLocale(page.locale);
  const lhref = (h: string) => localizeHref(prefix, h);

  const pageUrl = resolveCanonicalUrl({
    kind: "page",
    slug: fm.slug,
    locale: page.locale,
    frontmatter: fm,
    publicPath,
  });
  const breadcrumbs = [
    { name: messages.home, url: `${SITE_URL}/` },
    { name: fm.title, url: pageUrl },
  ];
  const languages = buildLanguageAlternates("page", page);

  // Heuristic: if the page slug starts with `contact`, emit ContactPage
  // schema in addition to breadcrumbs. Covers contact-noel-erp-support
  // and any future contact variants without hard-coding the slug.
  const isContact = /^contact[-_]/i.test(fm.slug) || fm.slug === "contact";

  const webPageLd = pageWebPageJsonLd(page, publicPath);
  const isSubstantive = countWords(page.body) > PAGE_ARTICLE_WORDCOUNT_THRESHOLD;
  const articleLd = isSubstantive ? pageArticleJsonLd(page, publicPath) : null;
  const faqItems = extractFaqItems(page.body);

  // Classification for the banner crumbs and media.
  const section = SECTIONS[englishPath(page)];
  const crumbs: Crumb[] = section
    ? [
        { label: tr(section.section), href: lhref(SECTION_HREF[section.section] ?? "/") },
        ...(section.group && section.group !== section.section && !/^Index/.test(section.group)
          ? [{ label: tr(sentenceCase(section.group.replace(/ \(.*\)$/, ""))) }]
          : []),
      ]
    : [{ label: messages.home, href: lhref("/") }];
  const media = bannerMedia(section, fm.slug);

  // Body: strip leftover WordPress shortcodes (they rendered as literal text).
  const cleaned = normalizeHeadingLevels(repairLinks(cleanWordPressArtifacts(page.body), prefix));
  const testimonialLinks = isEnglish
    ? undefined
    : `[${tr("All case studies")}](${lhref("/case-studies/")}) · [${tr("Read the recommendations")}](https://www.linkedin.com/in/noeldcosta/)`;
  const body = replaceTestimonialSliders(cleaned, TESTIMONIALS.map((t) => t.name), testimonialLinks).trim();
  const isLibrary = fm.slug === LIBRARY_SLUG;
  const isCaseStudies = fm.slug === "case-studies";
  const isPartners = fm.slug === PARTNERS_SLUG;
  const isExpertiseHub = fm.slug === EXPERTISE_SLUG && isEnglish;

  const headings = body ? extractHeadings(body) : [];
  const railItems = isLibrary
    ? getLibrary(page.locale).map((g) => ({ id: g.id, label: tr(g.title) }))
    : [
        ...(isExpertiseHub
          ? [
              { id: "enterprise-applications", label: tr("Enterprise applications") },
              { id: "data-and-analytics", label: tr("Data & analytics") },
              { id: "ai", label: tr("AI") },
            ]
          : []),
        ...headings
          .filter((h) => h.level === 2 && !/^[\s\d.):#-]*$/.test(h.text))
          .map((h) => ({ id: h.id, label: h.text })),
      ];
  const libraryCount = isLibrary
    ? getLibrary(page.locale).reduce((n, g) => n + g.items.length, 0)
    : 0;
  const title = fm.h1 || fm.title;
  const lede =
    fm.excerpt ||
    (isLibrary
      ? tr("Every article I have written on enterprise applications, data, AI and running programmes, grouped by area.")
      : undefined);

  return (
    <>
      <Nav locale={page.locale} languages={languages} />
      <main id="main-content" className="nd-main">
        <PageBanner
          label={title}
          crumbs={crumbs}

          title={title}
          lede={lede}
          long={visualLength(title) > 46}
          {...media}
          portraitNote={media.portrait ? tr("That's me") : undefined}
        >
          {isLibrary && (
            <div className="nd-meta">
              <span className="nd-pill">{tr("{count} articles").replace("{count}", String(libraryCount))}</span>
              <span>{tr("Enterprise applications · Data & analytics · AI · Consulting practice")}</span>
            </div>
          )}
        </PageBanner>

        <div className={railItems.length > 1 ? "nd-frame" : "nd-frame nd-frame-single"}>
          {railItems.length > 1 && (
            <SideRail
              back={section ? { label: tr(section.section), href: lhref(SECTION_HREF[section.section] ?? "/") } : { label: messages.home, href: lhref("/") }}
              label={isLibrary ? tr("Library") : messages.contents}
              items={railItems}
              numbered={!isLibrary}
              footer={
                isContact ? undefined : (
                <div className="nd-rail-cta">
                  <p>{tr("Working on a programme, a data platform or an AI decision?")}</p>
                  <a className="nd-btn nd-btn-primary magnetic" href={lhref(CONTACT)} style={{ padding: "9px 14px", fontSize: 13 }}>
                    {tr("Discuss your project")} <span aria-hidden="true">→</span>
                  </a>
                  <Doodle name="arrow-hook" flip className="nd-rail-hook" />
                </div>
                )
              }
            />
          )}
          <div className="nd-article-body">
            {fm.hero && !isLibrary && (
              <figure className="nd-figure-hero">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fm.hero} alt={fm.title} />
              </figure>
            )}
            {isExpertiseHub && <ExpertiseAreas />}
            {isLibrary && <ArticlesLibrary locale={page.locale} />}
            {isCaseStudies && <AiProjects locale={page.locale} level={2} />}
            {isPartners && !body && (
              <ComingSoon
                title={tr("The partner directory is being refreshed.")}
                text={tr("A curated directory of implementation partners and specialists will be published here. Stay tuned.")}
                labels={{ soon: tr("Coming soon"), meanwhile: tr("Meanwhile"), discuss: tr("Discuss your project") }}
                contactHref={lhref(CONTACT)}
                links={[
                  { label: tr("Top SAP implementation partners"), href: lhref("/top-sap-implementation-partners-in-the-usa-2025-by-tier/") },
                  { label: tr("Contributions"), href: lhref("/contributions-sap-experts-industry-professionals/") },
                ]}
              />
            )}
            {body && !isLibrary && (
              <div className="prose-noel nd-page-prose">
                <MdxBody source={body} headings={headings} reservedHeadingIds={headings.map((h) => h.id)} locale={page.locale} />
              </div>
            )}
          </div>
        </div>
        {!isContact && <CloseBand locale={page.locale} />}
      </main>
      <Footer locale={page.locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />
      {articleLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />
      {faqItems.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(faqItems)) }} />
      )}
      {isContact && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              contactPageJsonLd(
                pageUrl,
                page.locale,
                fm.title,
                fm.metaDescription || fm.excerpt || `${fm.title}. Noel D'Costa.`,
              ),
            ),
          }}
        />
      )}
    </>
  );
}
