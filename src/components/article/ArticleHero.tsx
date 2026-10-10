import PageBanner, { type Crumb } from "@/components/site/PageBanner";
import type { Locale } from "@/lib/content";
import { getArticleMessages } from "@/lib/article-localization";
import { translator } from "@/i18n";
import ArticleActions from "@/components/article/ArticleActions";

interface ArticleHeroProps {
  crumbs: Crumb[];
  title: string;
  deck?: string;
  date: string;
  updated?: string;
  lastReviewed?: string;
  readingMinutes: number;
  /** Article hero image, shown faintly behind the banner scrim. */
  coverImage?: string;
  locale?: Locale;
  /** Canonical URL of the article, for share, print and save. */
  url?: string;
}

const DISPLAY_AUTHOR = "Noel D'Costa";
// 96 px wide copy (2 KB) for the 32 px byline avatar; the full portrait is 176 KB
// and loaded ahead of the article's cover image on phones.
const AUTHOR_AVATAR = "/media/noel-headshot-96.webp";

function formatDate(value: string, dateLocale: string): string {
  return new Date(value).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Article banner: breadcrumb trail, the article H1 in the display face, the
 * standfirst, and a meta row (author, published or updated date, reading time,
 * last reviewed). Built on the shared PageBanner so articles match the rest of
 * the site. Server component: dates are formatted once, at render.
 */
export default function ArticleHero({
  crumbs,
  title,
  deck,
  date,
  updated,
  lastReviewed,
  readingMinutes,
  coverImage,
  locale = "en",
  url,
}: ArticleHeroProps) {
  const tr = translator(locale);
  const messages = getArticleMessages(locale);
  const shownDate = updated || date;
  const dateLabel = formatDate(shownDate, messages.dateLocale);
  // E-E-A-T trust signal: only shown when set in frontmatter.
  const reviewedLabel = lastReviewed
    ? formatDate(lastReviewed, messages.dateLocale)
    : null;

  return (
    <PageBanner
      crumbs={crumbs}
      title={title}
      long
      lede={deck}
      cover={coverImage ? { src: coverImage, alt: title } : undefined}
    >
      <div className="nd-meta nd-article-meta">
        <span className="who">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={AUTHOR_AVATAR} alt={DISPLAY_AUTHOR} aria-hidden="true" width={32} height={32} />
          <b>{DISPLAY_AUTHOR}</b>
        </span>
        <span className="dot" aria-hidden="true" />
        <span>
          {updated ? messages.updatedPrefix : ""}
          <time dateTime={shownDate}>{dateLabel}</time>
        </span>
        <span className="dot" aria-hidden="true" />
        <span>
          {readingMinutes} {messages.readingTimeSuffix}
        </span>
        {reviewedLabel && lastReviewed && (
          <>
            <span className="dot" aria-hidden="true" />
            <span>
              {messages.reviewedPrefix}
              <time dateTime={lastReviewed}>{reviewedLabel}</time>
            </span>
          </>
        )}
      </div>
      {url && (
        <ArticleActions
          title={title}
          url={url}
          labels={{
            share: tr("Share"),
            print: tr("Print"),
            pdf: tr("Save as PDF"),
            save: tr("Save for later"),
            saved: tr("Saved"),
            copyLink: tr("Copy link"),
            copied: tr("Link copied"),
            linkedin: tr("Share on LinkedIn"),
            x: tr("Share on X"),
            email: tr("Send by email"),
          }}
        />
      )}
    </PageBanner>
  );
}
