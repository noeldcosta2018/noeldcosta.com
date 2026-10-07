import PageBanner, { type Crumb } from "@/components/site/PageBanner";
import type { Locale } from "@/lib/content";
import { getArticleMessages } from "@/lib/article-localization";

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
}

const DISPLAY_AUTHOR = "Noel D'Costa";
const AUTHOR_AVATAR = "/media/noel-headshot.webp";

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
}: ArticleHeroProps) {
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
      cover={coverImage ? { src: coverImage } : undefined}
    >
      <div className="nd-meta nd-article-meta">
        <span className="who">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={AUTHOR_AVATAR} alt="" width={32} height={32} />
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
    </PageBanner>
  );
}
