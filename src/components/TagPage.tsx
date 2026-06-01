import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Clock,
  BookOpen,
  ShieldCheck,
  Users,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import StickyCTA from "@/components/StickyCTA";
import Ticker from "@/components/Ticker";
import YouTubeSection from "@/components/YouTubeSection";
import CTABanner from "@/components/CTABanner";
import {
  getPostsByAnyTag,
  readingTime,
  type Locale,
  type PostRecord,
} from "@/lib/content";
import { breadcrumbJsonLd, collectionPageJsonLd, SITE_URL } from "@/lib/seo";
import { localePathPrefix, localizedPath } from "@/lib/locales";
import { getMessages } from "@/lib/i18n/useTranslation";
import {
  tagInfo,
  tagLabel,
  tagSynonyms,
  WORDPRESS_TAG_SLUGS,
} from "@/components/tagMeta";

function PostCard({
  post,
  priority,
  locale,
}: {
  post: PostRecord;
  priority?: boolean;
  locale: Locale;
}) {
  const m = getMessages(locale);
  const mins = readingTime(post.body);
  const tags = (post.frontmatter.tags ?? []).slice(0, 1);

  return (
    <Link
      href={`/${post.frontmatter.slug}`}
      className="group flex flex-col bg-paper rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{
        border: "1px solid rgba(14,16,32,0.07)",
        boxShadow: "0 1px 3px rgba(14,16,32,0.04)",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "16/9",
          background: "linear-gradient(135deg, var(--cc-bone), var(--cc-cream))",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {post.frontmatter.hero && (
          <Image
            src={post.frontmatter.hero}
            alt={post.frontmatter.title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          />
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        {tags.length > 0 && (
          <p
            className="font-mono text-[0.6rem] tracking-[2px] uppercase font-semibold mb-2"
            style={{ color: "var(--cc-papaya)" }}
          >
            {tags.map(tagLabel).join(" · ")}
          </p>
        )}
        <h3 className="font-display font-bold text-corbeau text-[1rem] leading-snug mb-2 group-hover:text-papaya transition-colors duration-200 line-clamp-2">
          {post.frontmatter.title}
        </h3>
        {post.frontmatter.excerpt && (
          <p className="text-night/70 text-[0.83rem] leading-[1.55] line-clamp-2 mb-4 flex-1">
            {post.frontmatter.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span
            className="flex items-center gap-1 font-mono text-[0.6rem] tracking-[1px]"
            style={{ color: "var(--cc-silver)" }}
          >
            <Clock size={9} /> {mins} {m.card.minRead}
          </span>
          <span
            className="inline-flex items-center gap-1 text-[0.78rem] font-semibold"
            style={{ color: "var(--cc-papaya)" }}
          >
            {m.card.readArticle} <ArrowRight size={11} className="rtl:-scale-x-100" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function TagPage({
  tag,
  locale = "en",
}: {
  tag: string;
  locale?: Locale;
}) {
  const m = getMessages(locale);
  const info = tagInfo(tag);
  const Icon = info.icon;
  const posts = getPostsByAnyTag(tagSynonyms(tag), locale);

  const langPrefix = localePathPrefix(locale);
  const tagUrl = `${SITE_URL}${langPrefix}/tag/${tag}/`;
  const crumbs = [
    { name: "Home", url: `${SITE_URL}${langPrefix}/` },
    { name: info.label, url: tagUrl },
  ];

  const collectionLd = collectionPageJsonLd({
    url: tagUrl,
    name: info.label,
    description:
      info.description || `Articles tagged ${info.label} by Noel D'Costa.`,
    inLanguage: locale,
    posts: posts.map((p) => ({
      slug: p.frontmatter.slug,
      title: p.frontmatter.title,
      locale,
    })),
  });

  const featured = posts.slice(0, 3);
  const latest = posts.slice(3);

  const otherTags = WORDPRESS_TAG_SLUGS.filter((t) => t !== tag);

  return (
    <>
      <Nav />
      <div style={{ marginTop: 64 }}>
        <Ticker />
      </div>
      <StickyCTA />
      <main>
        {/* ── Hero ── */}
        <section
          className="relative overflow-hidden"
          style={{
            background: "var(--cc-page-bg)",
            borderBottom: "1px solid rgba(14,16,32,0.07)",
          }}
        >
          <div
            className="cc-grid-faint absolute inset-0 pointer-events-none"
            style={{ opacity: 0.5 }}
          />
          <div className="cc-glow-warm absolute inset-0 pointer-events-none" />

          <div
            className="relative"
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "clamp(2.5rem,5vw,4rem) clamp(1.5rem,5vw,3rem)",
            }}
          >
            <nav className="flex items-center gap-2 mb-6">
              <Link
                href={localizedPath(locale, "/")}
                className="font-mono text-[0.72rem] tracking-widest uppercase text-eyebrow hover:text-papaya transition-colors"
              >
                {m.breadcrumb.home}
              </Link>
              <span className="font-mono text-[0.72rem] text-eyebrow/40">/</span>
              <span className="font-mono text-[0.72rem] tracking-widest uppercase text-eyebrow">
                {m.tag.tagKicker}
              </span>
              <span className="font-mono text-[0.72rem] text-eyebrow/40">/</span>
              <span
                className="font-mono text-[0.6rem] tracking-widest uppercase font-semibold"
                style={{ color: "var(--cc-papaya)" }}
              >
                {info.label}
              </span>
            </nav>

            <div className="flex items-center gap-3 mb-4">
              <span
                className="inline-flex items-center justify-center rounded-lg"
                style={{
                  width: 40,
                  height: 40,
                  background: "rgba(252,152,90,0.12)",
                }}
              >
                <Icon size={20} style={{ color: "var(--cc-papaya)" }} />
              </span>
              <p
                className="font-mono text-[0.72rem] tracking-[3px] uppercase font-semibold"
                style={{ color: "var(--cc-papaya)" }}
              >
                {m.tag.tagKicker}
              </p>
            </div>

            <h1
              className="font-display font-black text-corbeau tracking-[-0.03em] leading-[1.04] mb-4"
              style={{ fontSize: "clamp(2rem,5.5vw,3.5rem)" }}
            >
              {info.label}
            </h1>
            {info.description && (
              <p
                className="text-night leading-[1.65] mb-6"
                style={{
                  fontSize: "clamp(1rem,1.5vw,1.15rem)",
                  maxWidth: 620,
                }}
              >
                {info.description}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <span
                className="inline-flex items-center gap-2 text-[0.82rem] font-medium px-3.5 py-1.5 rounded-full"
                style={{
                  background: "rgba(14,16,32,0.05)",
                  color: "var(--cc-night)",
                  border: "1px solid rgba(14,16,32,0.08)",
                }}
              >
                <BookOpen size={12} style={{ color: "var(--cc-papaya)" }} />
                {posts.length}{" "}
                {posts.length === 1 ? m.category.articleSingular : m.category.articlePlural}
              </span>
              <span
                className="inline-flex items-center gap-2 text-[0.82rem] font-medium px-3.5 py-1.5 rounded-full"
                style={{
                  background: "rgba(14,16,32,0.05)",
                  color: "var(--cc-night)",
                  border: "1px solid rgba(14,16,32,0.08)",
                }}
              >
                <ShieldCheck size={12} style={{ color: "var(--cc-papaya)" }} />
                {m.tag.badgeFieldExperience}
              </span>
            </div>
          </div>
        </section>

        {/* ── Posts grid or empty state ── */}
        {posts.length === 0 ? (
          <section
            style={{
              background: "var(--cc-cream)",
              borderBottom: "1px solid rgba(14,16,32,0.07)",
            }}
          >
            <div
              style={{
                maxWidth: 760,
                margin: "0 auto",
                padding: "clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,3rem)",
              }}
            >
              <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
                {m.tag.emptyStateEyebrow}
              </p>
              <h2
                className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-4 text-corbeau"
                style={{ fontSize: "clamp(1.75rem,3.5vw,2.5rem)" }}
              >
                {m.tag.emptyStateTitlePrefix} {info.label}{" "}
                <span className="cc-emphasis-italic">{m.tag.emptyStateTitleSuffix}</span>
              </h2>
              <p className="text-night text-[1rem] max-w-[520px] leading-[1.7] mb-6">
                {m.tag.emptyStateBody}
              </p>
              <div className="flex flex-wrap gap-2">
                {otherTags.map((t) => (
                  <Link
                    key={t}
                    href={`/tag/${t}`}
                    className="inline-flex items-center gap-1.5 text-[0.82rem] font-medium px-3 py-1.5 rounded-full transition-colors hover:bg-[rgba(252,152,90,0.12)]"
                    style={{
                      background: "rgba(14,16,32,0.05)",
                      color: "var(--cc-night)",
                      border: "1px solid rgba(14,16,32,0.08)",
                    }}
                  >
                    {tagLabel(t)}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <>
            {featured.length > 0 && (
              <section
                style={{
                  background: "var(--cc-cream)",
                  borderBottom: "1px solid rgba(14,16,32,0.07)",
                }}
              >
                <div
                  style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    padding:
                      "clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,3rem)",
                  }}
                >
                  <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
                    {m.tag.featuredEyebrow}
                  </p>
                  <h2
                    className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
                    style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
                  >
                    {`${m.tag.featuredH2Lead} `}
                    <span className="cc-emphasis-italic">
                      {m.tag.featuredH2Emphasis}
                    </span>
                  </h2>
                  <p className="text-night text-[1rem] max-w-[520px] leading-[1.7] mb-10">
                    {m.tag.featuredIntro}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {featured.map((p, i) => (
                      <PostCard
                        key={p.frontmatter.slug}
                        post={p}
                        priority={i === 0}
                        locale={locale}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {latest.length > 0 && (
              <section
                style={{
                  background: "var(--cc-page-bg)",
                  borderBottom: "1px solid rgba(14,16,32,0.07)",
                }}
              >
                <div
                  style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    padding:
                      "clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,3rem)",
                  }}
                >
                  <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
                    {m.tag.moreEyebrow}
                  </p>
                  <h2
                    className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
                    style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
                  >
                    {`${m.tag.moreH2Lead} `}
                    <span className="cc-emphasis-italic">
                      {m.tag.moreH2Emphasis}
                    </span>
                  </h2>
                  <p className="text-night text-[1rem] max-w-[520px] leading-[1.7] mb-10">
                    {m.tag.moreIntroPrefix} {info.label}.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {latest.map((p) => (
                      <PostCard
                        key={p.frontmatter.slug}
                        post={p}
                        locale={locale}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* ── Other WP tags strip ── */}
        {posts.length > 0 && otherTags.length > 0 && (
          <section
            className="bg-corbeau text-bone"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div
              style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "clamp(2.5rem,5vw,4rem) clamp(1.5rem,5vw,3rem)",
              }}
            >
              <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
                {m.tag.otherTagsEyebrow}
              </p>
              <h2
                className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-6 text-bone"
                style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)" }}
              >
                {m.tag.otherTagsH2}
              </h2>
              <div className="flex flex-wrap gap-2">
                {otherTags.map((t) => (
                  <Link
                    key={t}
                    href={`/tag/${t}`}
                    className="inline-flex items-center gap-1.5 text-[0.85rem] font-medium px-3.5 py-2 rounded-full transition-colors hover:bg-[rgba(252,152,90,0.2)]"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--cc-bone)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {tagLabel(t)}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <YouTubeSection />

        {/* ── About Noel strip ── */}
        <section
          style={{
            background: "var(--cc-paper)",
            borderBottom: "1px solid rgba(14,16,32,0.07)",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding:
                "clamp(2rem,4vw,3rem) clamp(1.5rem,5vw,3rem)",
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div
                className="flex-shrink-0 rounded-full overflow-hidden"
                style={{
                  width: 72,
                  height: 72,
                  border: "3px solid var(--cc-bone)",
                  boxShadow: "0 2px 12px rgba(14,16,32,0.1)",
                  position: "relative",
                }}
              >
                <Image
                  src="/images/headshot.png"
                  alt="Noel D'Costa"
                  fill
                  className="object-cover object-top"
                  sizes="72px"
                />
              </div>
              <div className="flex-1 min-w-0">
                {/* "Noel D'Costa" stays inline — personal name proper noun. */}
                <p className="font-display font-black text-corbeau text-lg mb-1">
                  Noel D&apos;Costa
                </p>
                <p className="text-night/75 text-[0.88rem] leading-relaxed max-w-lg">
                  {m.category.aboutStripBio}
                </p>
              </div>
              <Link
                href="/sap-erp-consultant-my-story-noel-dcosta"
                className="flex-shrink-0 text-[0.82rem] font-semibold hover:underline"
                style={{ color: "var(--cc-papaya)" }}
              >
                {m.category.fullBioLink}
              </Link>
            </div>
          </div>
        </section>

        <CTABanner locale={locale} />
      </main>
      <Footer locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(crumbs)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
    </>
  );
}
