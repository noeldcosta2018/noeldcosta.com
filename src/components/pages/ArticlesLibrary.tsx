import { existsSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { getAllPostSlugs, getPost, readingTime, type Locale, type PostRecord } from "@/lib/content";
import { buildLocalizedPath, isPublishedTranslatedLocale } from "@/lib/locale-url";
import { getArticleMessages } from "@/lib/article-localization";
import imageDimensions from "@/data/image-dimensions.json";
import { translator } from "@/i18n";
import sections from "@/data/page-sections.json";

type SectionEntry = { section: string; group: string };
const SECTIONS = sections as Record<string, SectionEntry>;
const DIMENSIONS = imageDimensions as Record<string, { width: number; height: number }>;

export const LIBRARY_GROUPS = [
  { id: "enterprise-applications", title: "Enterprise applications", area: "var(--area-apps)", match: (s: SectionEntry) => s.section === "Articles" && s.group === "Enterprise Applications" },
  { id: "data-analytics", title: "Data & analytics", area: "var(--area-data)", match: (s: SectionEntry) => s.section === "Articles" && s.group === "Data & Analytics" },
  { id: "ai", title: "AI", area: "var(--area-ai)", match: (s: SectionEntry) => s.section === "Articles" && s.group === "AI" },
  { id: "consulting-practice", title: "Consulting practice", area: "var(--accent2)", match: (s: SectionEntry) => s.section === "Articles" && s.group === "Consulting practice" },
  { id: "case-studies", title: "Case studies", area: "var(--accent)", match: (s: SectionEntry) => s.section === "Client work" },
  { id: "academy", title: "Consulting careers and learning", area: "var(--mut2)", match: (s: SectionEntry) => s.section === "AI Academy" },
] as const;

/** Local hero images are checked on disk so a missing file never shows as a broken image. */
function heroAvailable(src: string | undefined): boolean {
  if (!src) return false;
  if (/^https?:\/\//.test(src)) return true;
  return existsSync(join(process.cwd(), "public", decodeURI(src)));
}

type LibraryItem = { post: PostRecord; href: string; localized: boolean };

/** Every article, grouped by the menu areas, in the reader's language where a translation is published. */
export function getLibrary(locale: Locale) {
  const groups = LIBRARY_GROUPS.map((g) => ({ ...g, items: [] as LibraryItem[] }));
  for (const slug of getAllPostSlugs()) {
    const entry = SECTIONS[`/${slug}/`];
    if (!entry) continue;
    const group = groups.find((g) => g.match(entry));
    if (!group) continue;
    const english = getPost(slug, "en");
    if (!english || english.frontmatter.noindex) continue;
    let post = english;
    let localized = false;
    if (locale !== "en" && isPublishedTranslatedLocale(locale)) {
      const translated = getPost(slug, locale);
      if (translated && !translated.isFallback && translated.locale === locale) {
        post = translated;
        localized = true;
      }
    }
    const href = localized ? buildLocalizedPath(locale, `/${slug}/`) : `/${slug}/`;
    group.items.push({ post, href, localized });
  }
  for (const g of groups) {
    g.items.sort(
      (a, b) =>
        new Date(b.post.frontmatter.updated || b.post.frontmatter.date).getTime() -
        new Date(a.post.frontmatter.updated || a.post.frontmatter.date).getTime(),
    );
  }
  return groups.filter((g) => g.items.length > 0);
}

function formatDate(value: string | undefined, dateLocale: string) {
  if (!value) return null;
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(dateLocale, { year: "numeric", month: "short" });
}

export function PostCard({ item, dateLocale, readSuffix, area }: { item: LibraryItem; dateLocale: string; readSuffix: string; area?: string }) {
  const fm = item.post.frontmatter;
  const dims = fm.hero ? DIMENSIONS[fm.hero] : undefined;
  const lang = item.localized ? undefined : "en";
  return (
    <li>
      <Link className="nd-card nd-post-card nd-glow" href={item.href} hrefLang={lang} lang={lang}>
        {area && <span className="nd-card-band" style={{ background: area }} aria-hidden="true" />}
        <div className="thumb">
          {heroAvailable(fm.hero) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fm.hero} alt={fm.h1 || fm.title} aria-hidden="true" loading="lazy" decoding="async" width={dims?.width} height={dims?.height} />
          ) : (
            <span className="nd-thumb-fallback" style={area ? { ["--area" as string]: area } : undefined} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="nd-on-dark" src="/brand/nd-monogram-on-dark.svg" alt="Noel D'Costa" width={72} height={44} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="nd-on-light" src="/brand/nd-monogram.svg" alt="Noel D'Costa" width={72} height={44} />
            </span>
          )}
        </div>
        <div className="inner">
          <h3>{fm.h1 || fm.title}</h3>
          {(fm.excerpt || fm.deck) && <p className="text">{fm.excerpt || fm.deck}</p>}
          <div className="foot">
            <span>{formatDate(fm.updated || fm.date, dateLocale)}</span>
            <span>
              {readingTime(item.post.body)} {readSuffix}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

export default function ArticlesLibrary({ locale }: { locale: Locale }) {
  const groups = getLibrary(locale);
  const messages = getArticleMessages(locale);
  const tr = translator(locale);
  return (
    <div className="nd-library">
      {groups.map((g) => (
        <section key={g.id} id={g.id} className="nd-library-group" aria-labelledby={`${g.id}-title`}>
          <div className="nd-library-head">
            <h2 id={`${g.id}-title`} className="nd-display">
              <i style={{ background: g.area }} aria-hidden="true" />
              {tr(g.title)}
            </h2>
            <span className="nd-label">{g.items.length}</span>
          </div>
          <ul className="nd-list">
            {g.items.map((item) => (
              <PostCard key={item.href} item={item} dateLocale={messages.dateLocale} readSuffix={messages.readingTimeSuffix} area={g.area} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
