import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import {
  CATEGORIES,
  getPostsByCategory,
  readingTime,
  type Category,
  type Locale,
  type PostRecord,
} from "@/lib/content";
import { breadcrumbJsonLd, SITE_URL } from "@/lib/seo";

const SIDEBAR_TOOLS = [
  { label: "SAP Cost Calculator", slug: "sap-implementation-cost-calculator" },
  { label: "Migration Estimator", slug: "free-data-migration-estimator-sap-oracle-microsoft" },
  { label: "JD Generator", slug: "sap-job-description-generator" },
  { label: "Solution Builder", slug: "sap-solution-builder" },
];

const ALL_CATEGORIES = [
  { slug: "erp-implementation", label: "ERP Implementation" },
  { slug: "platforms-modules", label: "Platforms & Modules" },
  { slug: "erp-strategy", label: "ERP Strategy & Cost" },
  { slug: "ai-governance", label: "AI Governance" },
  { slug: "agentic-ai", label: "Agentic AI" },
  { slug: "case-studies", label: "Case Studies" },
];

function PostCard({
  post,
  locale,
  index,
}: {
  post: PostRecord;
  locale: string;
  index: number;
}) {
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const mins = readingTime(post.body);
  const dateStr = new Date(post.frontmatter.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
  const delay = Math.min(index, 8) * 70;

  return (
    <Link
      href={`${localePrefix}/${post.frontmatter.slug}`}
      className="block bg-paper border border-corbeau/[0.06] rounded-[14px] overflow-hidden hover:border-papaya/40 hover:shadow-lg transition-all duration-300 group"
      style={{
        animation: index < 9 ? `cc-fade-in 0.5s ease-out ${delay}ms both` : undefined,
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          position: "relative",
          aspectRatio: "16/9",
          background: "rgba(252,152,90,0.06)",
          overflow: "hidden",
        }}
      >
        {post.frontmatter.hero ? (
          <Image
            src={post.frontmatter.hero}
            alt={post.frontmatter.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(14,16,32,0.04) 0%, rgba(252,152,90,0.10) 100%)",
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="font-mono text-[0.6rem] tracking-[2px] uppercase text-papaya">
            {dateStr}
          </span>
          <span style={{ color: "rgba(14,16,32,0.18)", fontSize: 10 }}>·</span>
          <span className="flex items-center gap-1 font-mono text-[0.6rem] tracking-[1px] text-silver">
            <Clock size={9} />
            {mins} min
          </span>
        </div>
        <h2 className="font-display font-bold text-corbeau text-[0.98rem] leading-snug mb-2 group-hover:text-papaya transition-colors duration-200 line-clamp-2">
          {post.frontmatter.title}
        </h2>
        {post.frontmatter.excerpt && (
          <p className="text-night/75 text-[0.83rem] leading-[1.55] line-clamp-2 mb-3">
            {post.frontmatter.excerpt}
          </p>
        )}
        <span className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-papaya">
          Read article <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}

export default function CategoryPage({
  category,
  locale,
}: {
  category: string;
  locale: Locale;
}) {
  if (!(category in CATEGORIES)) notFound();
  const meta = CATEGORIES[category as keyof typeof CATEGORIES];
  const posts = getPostsByCategory(category as Category, locale);
  const localePrefix = locale === "en" ? "" : `/${locale}`;

  const crumbs = [
    { name: "Home", url: `${SITE_URL}${localePrefix}/` },
    { name: meta.label, url: `${SITE_URL}${localePrefix}/category/${meta.slug}` },
  ];

  const [featured, ...rest] = posts;
  const beforeCta = rest.slice(0, 6);
  const afterCta = rest.slice(6);

  const otherCategories = ALL_CATEGORIES.filter((c) => c.slug !== category);

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 64 }}>

        {/* ── Category Header ── */}
        <section
          className="relative overflow-hidden"
          style={{ background: "var(--cc-page-bg)", borderBottom: "1px solid rgba(14,16,32,0.07)" }}
        >
          <div className="cc-grid-faint absolute inset-0 pointer-events-none" style={{ opacity: 0.5 }} />
          <div className="cc-glow-warm absolute inset-0 pointer-events-none" />
          <div
            style={{
              position: "relative",
              maxWidth: 1200,
              margin: "0 auto",
              padding:
                "clamp(2.5rem,5vw,4.5rem) clamp(1.5rem,5vw,3rem) clamp(2rem,4vw,3.5rem)",
            }}
          >
            {/* Breadcrumb */}
            <nav
              className="flex items-center gap-2 mb-7"
              aria-label="Breadcrumb"
            >
              <Link
                href="/"
                className="font-mono text-[0.62rem] tracking-widest uppercase text-silver hover:text-papaya transition-colors"
              >
                Home
              </Link>
              <span className="font-mono text-[0.6rem] text-silver/40">/</span>
              <span className="font-mono text-[0.62rem] tracking-widest uppercase text-papaya">
                {meta.label}
              </span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <p className="font-mono text-[0.68rem] font-semibold tracking-[2.5px] uppercase text-papaya mb-3">
                  Category
                </p>
                <h1
                  className="font-display font-black text-corbeau tracking-[-0.03em] leading-[1.05]"
                  style={{ fontSize: "clamp(2.5rem,6vw,4rem)" }}
                >
                  {meta.label}
                </h1>
                <p className="text-night text-lg leading-[1.65] max-w-[580px] mt-4">
                  {meta.description}
                </p>
              </div>

              {/* Article count badge */}
              <div
                className="flex-shrink-0 bg-paper border border-corbeau/[0.07] rounded-2xl px-7 py-5 text-center"
                style={{ minWidth: 130 }}
              >
                <div
                  className="font-display font-black text-corbeau leading-none mb-1"
                  style={{ fontSize: "clamp(2.2rem,4vw,3rem)" }}
                >
                  {posts.length}
                </div>
                <div className="font-mono text-[0.6rem] tracking-[2px] uppercase text-silver">
                  {posts.length === 1 ? "article" : "articles"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main content area ── */}
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding:
              "clamp(2rem,4vw,3.5rem) clamp(1.5rem,5vw,3rem) clamp(3rem,6vw,5rem)",
          }}
        >
          {posts.length === 0 ? (
            <p className="text-night/60 py-16 text-center">No posts yet in this category.</p>
          ) : (
            <div className="flex flex-col lg:flex-row gap-10">

              {/* ── Left: article list ── */}
              <div className="flex-1 min-w-0">

                {/* Featured post */}
                {featured && (
                  <Link
                    href={`${localePrefix}/${featured.frontmatter.slug}`}
                    className="block mb-10 bg-paper border border-corbeau/[0.06] rounded-[18px] overflow-hidden hover:border-papaya/30 hover:shadow-xl transition-all duration-300 group"
                    style={{ animation: "cc-fade-in 0.5s ease-out 0ms both" }}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div
                        className="relative md:w-[45%] flex-shrink-0 overflow-hidden"
                        style={{ aspectRatio: "4/3", minHeight: 220 }}
                      >
                        {featured.frontmatter.hero ? (
                          <Image
                            src={featured.frontmatter.hero}
                            alt={featured.frontmatter.title}
                            fill
                            priority
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            sizes="(min-width: 768px) 45vw, 100vw"
                          />
                        ) : (
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(14,16,32,0.05), rgba(252,152,90,0.12))",
                            }}
                          />
                        )}
                        {/* Featured badge */}
                        <div
                          className="absolute top-4 left-4 px-3 py-1 rounded-full font-mono text-[0.6rem] tracking-widest uppercase font-bold"
                          style={{
                            background: "var(--cc-papaya)",
                            color: "var(--cc-corbeau)",
                          }}
                        >
                          Latest
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-7 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <span className="font-mono text-[0.62rem] tracking-[2px] uppercase text-papaya">
                              {new Date(featured.frontmatter.date).toLocaleDateString(
                                "en-US",
                                { year: "numeric", month: "long", day: "numeric" }
                              )}
                            </span>
                            <span style={{ color: "rgba(14,16,32,0.2)", fontSize: 10 }}>
                              ·
                            </span>
                            <span className="flex items-center gap-1 font-mono text-[0.62rem] tracking-[1px] text-silver">
                              <Clock size={10} />
                              {readingTime(featured.body)} min read
                            </span>
                          </div>
                          <h2
                            className="font-display font-black text-corbeau leading-tight mb-3 group-hover:text-papaya transition-colors duration-200"
                            style={{ fontSize: "clamp(1.3rem,2.5vw,1.65rem)" }}
                          >
                            {featured.frontmatter.title}
                          </h2>
                          {featured.frontmatter.excerpt && (
                            <p className="text-night/75 leading-[1.65] line-clamp-3 text-[0.95rem]">
                              {featured.frontmatter.excerpt}
                            </p>
                          )}
                        </div>
                        <div className="mt-5">
                          <span
                            className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full"
                            style={{
                              background: "var(--cc-corbeau)",
                              color: "var(--cc-bone)",
                            }}
                          >
                            Read article <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Divider before grid */}
                {rest.length > 0 && (
                  <div className="flex items-center gap-4 mb-7">
                    <span className="font-mono text-[0.62rem] tracking-[2.5px] uppercase text-silver">
                      All articles
                    </span>
                    <div className="flex-1 border-t border-corbeau/[0.08]" />
                    <span className="font-mono text-[0.62rem] tracking-[1px] text-silver/70">
                      {rest.length} {rest.length === 1 ? "post" : "posts"}
                    </span>
                  </div>
                )}

                {/* First 6 cards */}
                {beforeCta.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                    {beforeCta.map((p, i) => (
                      <PostCard
                        key={p.frontmatter.slug}
                        post={p}
                        locale={locale}
                        index={i + 1}
                      />
                    ))}
                  </div>
                )}

                {/* Mid-list CTA strip — only when there are enough articles */}
                {rest.length >= 4 && (
                  <div
                    className="rounded-2xl p-7 mb-8 flex flex-col sm:flex-row items-center justify-between gap-5"
                    style={{
                      background: "var(--cc-corbeau)",
                      animation: "cc-fade-in 0.5s ease-out 200ms both",
                    }}
                  >
                    <div>
                      <p
                        className="font-mono text-[0.62rem] tracking-[2.5px] uppercase mb-2"
                        style={{ color: "rgba(252,152,90,0.85)" }}
                      >
                        Senior ERP advisory
                      </p>
                      <p
                        className="font-display font-black text-xl leading-snug"
                        style={{ color: "var(--cc-bone)" }}
                      >
                        Running an ERP programme?
                      </p>
                      <p
                        className="text-[0.88rem] mt-1.5 leading-relaxed"
                        style={{ color: "rgba(244,237,228,0.65)" }}
                      >
                        25 years. $700M+ delivered. I lead the engagement — no junior team.
                      </p>
                    </div>
                    <a
                      href="https://calendly.com/noeldcosta/30min"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-full whitespace-nowrap"
                      style={{
                        background: "var(--cc-papaya)",
                        color: "var(--cc-corbeau)",
                      }}
                    >
                      Book a 30-min call <ArrowUpRight size={14} />
                    </a>
                  </div>
                )}

                {/* Remaining articles */}
                {afterCta.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {afterCta.map((p, i) => (
                      <PostCard
                        key={p.frontmatter.slug}
                        post={p}
                        locale={locale}
                        index={i + 7}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ── Sidebar ── */}
              <aside
                className="lg:w-[280px] xl:w-[300px] flex-shrink-0 flex flex-col gap-5"
                style={{ alignSelf: "flex-start", position: "sticky", top: 88 }}
              >
                {/* Book a call CTA */}
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "var(--cc-corbeau)" }}
                >
                  <span
                    className="cc-pulse-dot mb-3 block"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--cc-papaya)",
                    }}
                  />
                  <p
                    className="font-mono text-[0.62rem] tracking-[2.5px] uppercase mb-2"
                    style={{ color: "rgba(252,152,90,0.85)" }}
                  >
                    Available for engagements
                  </p>
                  <h3
                    className="font-display font-black text-xl leading-snug mb-3"
                    style={{ color: "var(--cc-bone)" }}
                  >
                    Talk to Noel directly.
                  </h3>
                  <p
                    className="text-[0.85rem] leading-relaxed mb-5"
                    style={{ color: "rgba(244,237,228,0.65)" }}
                  >
                    ECC to S/4HANA. AI on SAP. CIMA-qualified. I lead every engagement.
                  </p>
                  <a
                    href="https://calendly.com/noeldcosta/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full text-sm font-bold py-3 rounded-full"
                    style={{
                      background: "var(--cc-papaya)",
                      color: "var(--cc-corbeau)",
                    }}
                  >
                    Book a 30-min call <ArrowUpRight size={13} />
                  </a>
                </div>

                {/* About the author */}
                <div className="bg-paper border border-corbeau/[0.07] rounded-2xl p-6">
                  <p className="font-mono text-[0.62rem] tracking-[2.5px] uppercase text-papaya mb-3">
                    About the author
                  </p>
                  <p className="font-display font-black text-corbeau text-lg mb-2">
                    Noel D&apos;Costa
                  </p>
                  <p className="text-night/75 text-[0.85rem] leading-relaxed mb-4">
                    Senior ERP and AI advisor. 25 years across EDGE Group, Etihad
                    Airways, ADNOC, PIF entities, and the UAE Government. CIMA,
                    AICPA, Masters in Accounting.
                  </p>
                  <Link
                    href="/sap-erp-consultant-my-story-noel-dcosta"
                    className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-papaya hover:underline"
                  >
                    Full bio <ArrowRight size={12} />
                  </Link>
                </div>

                {/* Free tools */}
                <div className="bg-paper border border-corbeau/[0.07] rounded-2xl p-6">
                  <p className="font-mono text-[0.62rem] tracking-[2.5px] uppercase text-papaya mb-4">
                    Free tools
                  </p>
                  <div className="flex flex-col">
                    {SIDEBAR_TOOLS.map((t, i) => (
                      <Link
                        key={t.slug}
                        href={`/${t.slug}`}
                        className="flex items-center justify-between text-[0.85rem] text-corbeau font-medium hover:text-papaya transition-colors py-2.5"
                        style={{
                          borderBottom:
                            i < SIDEBAR_TOOLS.length - 1
                              ? "1px solid rgba(14,16,32,0.06)"
                              : undefined,
                        }}
                      >
                        {t.label}
                        <ArrowRight
                          size={12}
                          style={{ color: "var(--cc-papaya)", flexShrink: 0 }}
                        />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Browse categories */}
                <div className="bg-paper border border-corbeau/[0.07] rounded-2xl p-6">
                  <p className="font-mono text-[0.62rem] tracking-[2.5px] uppercase text-papaya mb-4">
                    Browse topics
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {otherCategories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/category/${c.slug}`}
                        className={`text-[0.85rem] py-2 transition-colors ${
                          c.slug === category
                            ? "text-papaya font-semibold"
                            : "text-night hover:text-papaya"
                        }`}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>

        {/* ── Bottom CTA ── */}
        <section
          style={{
            background: "var(--cc-corbeau)",
            borderTop: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding:
                "clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,3rem)",
              textAlign: "center",
            }}
          >
            <p
              className="font-mono text-[0.62rem] tracking-[2.5px] uppercase mb-4"
              style={{ color: "rgba(252,152,90,0.85)" }}
            >
              Senior advisory
            </p>
            <h2
              className="font-display font-black text-bone tracking-[-0.03em] leading-tight mb-4"
              style={{ fontSize: "clamp(1.75rem,4vw,2.75rem)" }}
            >
              Reading about ERP isn&apos;t enough.
            </h2>
            <p
              className="text-lg max-w-[480px] mx-auto mb-8 leading-relaxed"
              style={{ color: "rgba(244,237,228,0.7)" }}
            >
              If you&apos;re planning a migration or mid-programme, a 30-min call saves months.
            </p>
            <a
              href="https://calendly.com/noeldcosta/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold px-7 py-3.5 rounded-full"
              style={{
                background: "var(--cc-papaya)",
                color: "var(--cc-corbeau)",
              }}
            >
              Book a 30-min call <ArrowUpRight size={15} />
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }}
      />
    </>
  );
}
