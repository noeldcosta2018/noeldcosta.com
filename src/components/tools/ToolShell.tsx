import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MdxBody from "@/components/mdx/MdxBody";
import PageBanner from "@/components/site/PageBanner";
import { CloseBand } from "@/components/home/HomeSections";
import { getPage, type Locale, type PageRecord } from "@/lib/content";
import {
  SITE_URL,
  breadcrumbJsonLd,
  buildPageMetadata,
  documentTitle,
  extractFaqItems,
  faqPageJsonLd,
  stripBrandSuffix,
} from "@/lib/seo";
import { translator } from "@/i18n";
import { localizeHref, repairLinks } from "@/lib/link-repair";
import { normalizeHeadingLevels } from "@/lib/md-repair";
import { hasExpectedLocaleScript } from "@/lib/localized-article-routing";
import { cleanWordPressArtifacts } from "@/lib/wp-cleanup";
import { contentLocaleFromPublicPrefix, publicPrefixFromContentLocale } from "@/lib/locale-url";
import {
  hasLocalizedInterfacePage,
  interfaceAlternates,
  interfaceMetadata,
  interfaceRouteLocales,
  interfaceUrl,
  toolPath,
} from "@/lib/localized-interface-routes";
import { ARTICLE_GROUPS, CONTACT } from "@/data/site-menu";

const TOOLS_HUB = "/simplify-your-business-with-erp-ai-tools/";

/** Page text of one free tool (each route folder's tool.ts). */
export interface ToolDef {
  slug: string;
  label: string;
  description: string;
  /** Banner title split; together they read as the label. */
  title: string;
  highlight: string;
  /** Menu group for the crumbs (Calculators, Estimators, Generators, Builders). */
  group: string;
}

interface ToolShellProps {
  slug: string;
  label: string;
  description: string;
  /** Defaults to slug. Override if the MDX page slug differs. */
  mdxSlug?: string;
  /** Banner title split; together they read as the label. Defaults to the label. */
  title?: string;
  highlight?: string;
  /** Menu group for the crumbs (Calculators, Estimators, Generators, Builders). */
  group?: string;
  /** Page locale. Interface text is translated; the tool itself receives its own props. */
  locale?: Locale;
  /** The tool widget has no translation: mark it lang="en" on translated pages. */
  toolInEnglish?: boolean;
  children: ReactNode;
}

const H1_LINE = /^\s*# [^\n]*\n+/;
const SPLIT_MARKER = /<!--\s*@calculator\s*-->/;

/**
 * The tool's MDX page in a translated locale, when a real translation exists
 * (never the English fallback).
 */
export function translatedToolPage(slug: string, locale: Locale): PageRecord | null {
  if (locale === "en") return null;
  const page = getPage(slug, locale);
  if (!page || page.isFallback || page.locale !== locale || !page.body.trim()) return null;
  // Old Simplified Chinese tool pages are English text under Chinese metadata.
  if (!hasExpectedLocaleScript(page.body, locale)) return null;
  return page;
}

/** Static params of a translated tool route: the ready locales that have it. */
export function localizedToolParams(slug: string): { locale: string }[] {
  return interfaceRouteLocales(toolPath(slug)).map((locale) => ({ locale }));
}

/** Content locale of a translated tool route, or null when that page is not generated. */
export function localizedToolLocale(publicLocale: string, slug: string): Locale | null {
  const content = contentLocaleFromPublicPrefix(publicLocale);
  if (!content || content === "en" || !hasLocalizedInterfacePage(publicLocale, toolPath(slug))) return null;
  return content;
}

/**
 * Tool page metadata. English is unchanged (the MDX page's metadata) apart
 * from hreflang alternates once translated tool pages exist. Translated pages
 * keep the title and description of their translated MDX page (the URL's
 * existing title in search) and fall back to the dictionary.
 */
export function toolMetadata(tool: ToolDef, locale: Locale = "en"): Metadata {
  const path = toolPath(tool.slug);
  if (locale === "en") {
    const page = getPage(tool.slug, "en");
    const base: Metadata = page
      ? buildPageMetadata(page)
      : {
          title: tool.label,
          description: tool.description,
          alternates: { canonical: `${SITE_URL}/${tool.slug}/` },
        };
    const languages = interfaceAlternates(path);
    return languages ? { ...base, alternates: { ...base.alternates, languages } } : base;
  }
  const tr = translator(locale);
  const fm = translatedToolPage(tool.slug, locale)?.frontmatter;
  return interfaceMetadata({
    locale,
    englishPath: path,
    // The migrated page's translated meta title (the URL's existing title in
    // search) without its brand tail, otherwise the translated tool name.
    title: documentTitle(fm?.metaTitle ? stripBrandSuffix(fm.metaTitle) : tr(tool.label)).absolute,
    description: fm?.metaDescription || fm?.excerpt || tr(tool.description),
  });
}

/**
 * Shell for the free tools: banner, intro copy from the page MDX, the tool in
 * a banded panel with a side column (second opinion + other tools), reference
 * copy below and the closing band. Form controls inside `.nda-tool` get
 * theme-aware borders, fills and focus rings from nd-archives.css, and
 * `.nda-print` switches the page to paper colours when a result is printed.
 *
 * Translated pages (locale set): interface text through the dictionary, links
 * to translated pages where published, the translated MDX page as copy.
 */
export default function ToolShell({
  slug,
  label,
  description,
  mdxSlug,
  title,
  highlight,
  group = "Free tools",
  locale = "en",
  toolInEnglish = false,
  children,
}: ToolShellProps) {
  const tr = translator(locale);
  const prefix = publicPrefixFromContentLocale(locale);
  const href = (h: string) => localizeHref(prefix, h);
  const isEnglish = locale === "en";
  const path = toolPath(slug);

  const resolvedMdxSlug = mdxSlug ?? slug;
  const page = isEnglish ? getPage(resolvedMdxSlug, "en") : translatedToolPage(resolvedMdxSlug, locale);

  // Authors split tool content with `<!-- @calculator -->` to place
  // reference depth (cost breakdowns, FAQ, etc.) BELOW the interactive
  // tool. Without the marker the whole body renders above, preserving
  // older pages' behaviour. Translated bodies (older WordPress copy, no
  // marker) lose their H1 (the banner has it) and sit below the tool.
  let aboveMdx = "";
  let belowMdx = "";
  if (page && isEnglish) {
    [aboveMdx = "", belowMdx = ""] = page.body.split(SPLIT_MARKER);
  } else if (page) {
    const body = normalizeHeadingLevels(repairLinks(cleanWordPressArtifacts(page.body.replace(H1_LINE, ""))));
    if (SPLIT_MARKER.test(body)) [aboveMdx = "", belowMdx = ""] = body.split(SPLIT_MARKER);
    else belowMdx = body;
  }

  // Tool MDX bodies carry the same `<details>/<summary>` FAQ blocks as blog
  // posts. Extract and emit FAQPage JSON-LD when present so the cost
  // calculator pages don't regress vs. Yoast's automatic FAQ schema.
  const faqItems = page ? extractFaqItems(page.body) : [];

  const name = tr(label);
  const pageUrl = isEnglish ? `${SITE_URL}/${slug}` : interfaceUrl(locale, path);
  const breadcrumbs = [
    { name: tr("Home"), url: `${SITE_URL}${href("/")}` },
    { name: tr("Tools"), url: `${SITE_URL}${href("/")}#tools` },
    { name, url: pageUrl },
  ];

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "Noel D'Costa",
      url: "https://noeldcosta.com/about",
    },
    url: isEnglish ? `https://noeldcosta.com/${slug}` : pageUrl,
    ...(prefix ? { inLanguage: prefix } : {}),
  };

  const otherTools = (ARTICLE_GROUPS.find((g) => g.title === "Free tools")?.links ?? []).filter(
    (l) => !l.href.includes(`/${slug}/`),
  );

  return (
    <>
      <Nav locale={locale} languages={interfaceAlternates(path)} />
      <main id="main-content" className="nd-main nda-print">
        <PageBanner
          label={name}
          crumbs={[{ label: tr("Tools"), href: href(TOOLS_HUB) }, { label: tr(group) }]}
          title={title ? tr(title) : name}
          highlight={title && highlight ? tr(highlight) : undefined}
          lede={tr(description)}
          video={{ src: "/media/video/hero-loop.mp4", poster: "/media/video/hero-loop-poster.jpg" }}
        >
          <div className="nda-banner-actions nda-noprint">
            <a className="nd-btn nd-btn-primary magnetic" href="#tool">
              {tr("Open the tool")} <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="nda-banner-meta">
            <span className="nd-pill">{tr("Free tool")}</span>
            <span>{tr(group)}</span>
          </div>
        </PageBanner>

        {/* MDX content is split on the `<!-- @calculator -->` marker: the intro
            sits above the tool, the reference depth below it. */}
        {aboveMdx.trim() && (
          <section
            className="nda-section tight flush nda-tool-intro"
            aria-label={tr("About the {label}").replace("{label}", name)}
          >
            <div className="nda-wrap">
              <div className="prose-noel">
                <MdxBody source={aboveMdx} locale={locale} />
              </div>
            </div>
          </section>
        )}

        <section
          id="tool"
          className={aboveMdx.trim() ? "nda-section nda-tool" : "nda-section tight flush nda-tool"}
          aria-label={name}
          style={{ scrollMarginTop: "var(--nav)" }}
        >
          <div className="nda-wrap nda-tool-grid">
            <div className="nda-tool-panel" lang={!isEnglish && toolInEnglish ? "en" : undefined}>
              <span className="band" aria-hidden="true" />
              {children}
            </div>
            <aside className="nda-tool-aside" aria-label={tr("More help")}>
              <div className="nd-card">
                <div className="nd-label">{tr("Second opinion")}</div>
                <p>
                  {tr(
                    "The tool gives you a starting point. If you want the number checked against your programme, talk it through with me.",
                  )}
                </p>
                <Link className="nd-btn nd-btn-primary" href={href(CONTACT)} style={{ marginTop: 14, padding: "10px 16px", fontSize: 13.5 }}>
                  {tr("Discuss your project")} <span aria-hidden="true">→</span>
                </Link>
              </div>
              {otherTools.length > 0 && (
                <nav className="nd-card" aria-label={tr("More free tools")}>
                  <div className="nd-label">{tr("More free tools")}</div>
                  <ul style={{ display: "grid", gap: 2, marginTop: 10 }}>
                    {otherTools.map((t) => (
                      <li key={t.href}>
                        <Link className="nd-textlink" href={href(t.href)} style={{ fontSize: 14, padding: "4px 0" }}>
                          {tr(t.label)} <span aria-hidden="true">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </aside>
          </div>
        </section>

        {belowMdx.trim() && (
          <section
            className="nda-section nda-tool-ref"
            aria-label={tr("{label}: reference").replace("{label}", name)}
          >
            <div className="nda-wrap">
              <div className="prose-noel">
                <MdxBody source={belowMdx} locale={locale} />
              </div>
            </div>
          </section>
        )}

        <div className="nda-noprint">
          <CloseBand locale={locale} />
        </div>
      </main>
      <Footer locale={locale} />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
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
            __html: JSON.stringify(faqPageJsonLd(faqItems)),
          }}
        />
      )}
    </>
  );
}
