import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  Target,
  Layers,
  Settings,
  RefreshCw,
  AlertCircle,
  Globe,
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
  CATEGORIES,
  getPostsByCategory,
  readingTime,
  type Category,
  type Locale,
  type PostRecord,
} from "@/lib/content";
import { breadcrumbJsonLd, SITE_URL } from "@/lib/seo";

// ─── Tag display config ──────────────────────────────────────────────────────

const TAG_META: Record<
  string,
  { label: string; description: string; icon: React.ElementType }
> = {
  "sap-planning-and-selection": {
    label: "Planning & Selection",
    description: "Vendor shortlisting, readiness, and programme setup.",
    icon: Target,
  },
  "sap-implementation-strategies": {
    label: "Strategy",
    description: "Delivery frameworks, governance, and go-live planning.",
    icon: Layers,
  },
  "sap-technical-decisions": {
    label: "Technical",
    description: "Architecture, integration, and technical risk decisions.",
    icon: Settings,
  },
  "sap-erp-modernization": {
    label: "Modernization & Industry",
    description: "Cloud migration, clean core, sector-specific patterns, and ERP transformation.",
    icon: RefreshCw,
  },
  "sap-crisis-management": {
    label: "Crisis & Recovery",
    description: "Programme recovery, risk mitigation, and escalation.",
    icon: AlertCircle,
  },
};

const TAG_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(TAG_META).map(([k, v]) => [k, v.label])
);

// ─── Per-category taglines for the hero H1 italic emphasis ──────────────────

const CATEGORY_TAGLINES: Record<string, string> = {
  "erp-implementation": "From the field, not the slides.",
  "platforms-modules":  "Deep technical. Real projects.",
  "erp-strategy":       "Real numbers. Not estimates.",
  "ai-governance":      "Grounded. Not hype.",
  "agentic-ai":         "What works now.",
  "case-studies":       "Named clients. Real outcomes.",
};

// ─── Other categories for navigation ────────────────────────────────────────

const ALL_CATEGORIES = [
  { slug: "erp-implementation", label: "ERP Implementation" },
  { slug: "platforms-modules", label: "Platforms & Modules" },
  { slug: "erp-strategy", label: "ERP Strategy & Cost" },
  { slug: "ai-governance", label: "AI Governance" },
  { slug: "agentic-ai", label: "Agentic AI" },
  { slug: "case-studies", label: "Case Studies" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tagLabel(tag: string) {
  return (
    TAG_LABEL[tag] ??
    tag
      .split("-")
      .slice(0, 2)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ")
  );
}

// ─── PostCard ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  locale,
  priority,
}: {
  post: PostRecord;
  locale: string;
  priority?: boolean;
}) {
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const mins = readingTime(post.body);
  const tags = (post.frontmatter.tags ?? []).slice(0, 1);

  return (
    <Link
      href={`${localePrefix}/${post.frontmatter.slug}`}
      className="group flex flex-col bg-paper rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{
        border: "1px solid rgba(14,16,32,0.07)",
        boxShadow: "0 1px 3px rgba(14,16,32,0.04)",
      }}
    >
      {/* Image */}
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

      {/* Body */}
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
            <Clock size={9} /> {mins} min read
          </span>
          <span
            className="inline-flex items-center gap-1 text-[0.78rem] font-semibold"
            style={{ color: "var(--cc-papaya)" }}
          >
            Read article <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── StartHereRow ────────────────────────────────────────────────────────────

function StartHereRow({ post, locale }: { post: PostRecord; locale: string }) {
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const mins = readingTime(post.body);
  return (
    <Link
      href={`${localePrefix}/${post.frontmatter.slug}`}
      className="flex items-center gap-3 group py-3"
      style={{ borderBottom: "1px solid rgba(252,152,90,0.15)" }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: "rgba(252,152,90,0.1)" }}
      >
        <BookOpen size={14} style={{ color: "var(--cc-papaya)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-corbeau text-[0.85rem] leading-snug group-hover:text-papaya transition-colors line-clamp-1">
          {post.frontmatter.title}
        </p>
        <p className="font-mono text-[0.6rem] tracking-[1px] mt-0.5" style={{ color: "var(--cc-silver)" }}>
          {mins} min read
        </p>
      </div>
      <ArrowRight size={13} className="flex-shrink-0 text-silver group-hover:text-papaya transition-colors" />
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

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

  // Partition posts
  const byReadTime = [...posts].sort(
    (a, b) => readingTime(a.body) - readingTime(b.body)
  );
  const startHerePosts = byReadTime.slice(0, 3);
  const featured = posts.slice(0, 3);
  const latest = posts.slice(3);

  // Tag counts for "Browse by topic"
  const tagCounts: Record<string, number> = {};
  for (const post of posts) {
    for (const tag of post.frontmatter.tags ?? []) {
      // Merge sap-industry-topics into sap-erp-modernization
      const key = tag === "sap-industry-topics" ? "sap-erp-modernization" : tag;
      tagCounts[key] = (tagCounts[key] ?? 0) + 1;
    }
  }
  const topicTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const otherCategories = ALL_CATEGORIES.filter((c) => c.slug !== category);
  const heroTagline = CATEGORY_TAGLINES[category] ?? "Practical. Not theoretical.";

  return (
    <>
      <Nav />
      {/* ── Ticker strip — directly below nav, same as homepage ── */}
      <div style={{ marginTop: 64 }}>
        <Ticker />
      </div>
      <StickyCTA />
      <main>

        {/* ── 1. Category Hero ── */}
        <section
          className="relative overflow-hidden"
          style={{ background: "var(--cc-page-bg)", borderBottom: "1px solid rgba(14,16,32,0.07)" }}
        >
          <div className="cc-grid-faint absolute inset-0 pointer-events-none" style={{ opacity: 0.5 }} />
          <div className="cc-glow-warm absolute inset-0 pointer-events-none" />

          <div
            className="relative"
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "clamp(2.5rem,5vw,4rem) clamp(1.5rem,5vw,3rem)",
            }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 mb-6">
              <Link
                href="/"
                className="font-mono text-[0.6rem] tracking-widest uppercase text-silver hover:text-papaya transition-colors"
              >
                Home
              </Link>
              <span className="font-mono text-[0.58rem] text-silver/40">/</span>
              <span
                className="font-mono text-[0.6rem] tracking-widest uppercase font-semibold"
                style={{ color: "var(--cc-papaya)" }}
              >
                {meta.label}
              </span>
            </nav>

            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Left — headline */}
              <div className="lg:col-span-7">
                <p
                  className="font-mono text-[0.65rem] tracking-[3px] uppercase font-semibold mb-4"
                  style={{ color: "var(--cc-papaya)" }}
                >
                  Category
                </p>
                <h1
                  className="font-display font-black text-corbeau tracking-[-0.03em] leading-[1.04] mb-4"
                  style={{ fontSize: "clamp(2rem,5.5vw,3.5rem)" }}
                >
                  {meta.label}.{" "}
                  <span className="cc-emphasis-italic">{heroTagline}</span>
                </h1>
                <p
                  className="text-night leading-[1.65] mb-6"
                  style={{ fontSize: "clamp(1rem,1.5vw,1.15rem)", maxWidth: 520 }}
                >
                  {meta.description}
                </p>

                {/* Feature badges */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: BookOpen, text: "Senior advisory" },
                    { icon: ShieldCheck, text: "25 years field experience" },
                    { icon: Users, text: `${posts.length} articles` },
                  ].map((b) => (
                    <span
                      key={b.text}
                      className="inline-flex items-center gap-2 text-[0.82rem] font-medium px-3.5 py-1.5 rounded-full"
                      style={{
                        background: "rgba(14,16,32,0.05)",
                        color: "var(--cc-night)",
                        border: "1px solid rgba(14,16,32,0.08)",
                      }}
                    >
                      <b.icon size={12} style={{ color: "var(--cc-papaya)" }} />
                      {b.text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — Start Here panel (orange border) */}
              {startHerePosts.length > 0 && (
                <div className="lg:col-span-5">
                  <div
                    className="rounded-2xl p-6 h-full"
                    style={{
                      background: "var(--cc-paper)",
                      border: "4px solid var(--cc-papaya)",
                      boxShadow: "0 4px 28px rgba(252,152,90,0.2)",
                    }}
                  >
                    <p
                      className="font-mono text-[0.62rem] tracking-[2.5px] uppercase font-bold mb-4"
                      style={{ color: "var(--cc-papaya)" }}
                    >
                      Start here
                    </p>
                    <div>
                      {startHerePosts.map((p) => (
                        <StartHereRow
                          key={p.frontmatter.slug}
                          post={p}
                          locale={locale}
                        />
                      ))}
                    </div>
                    <Link
                      href={`/category/${meta.slug}`}
                      className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold mt-4 hover:underline"
                      style={{ color: "var(--cc-papaya)" }}
                    >
                      View all {posts.length} articles <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 2. Browse by topic (dark — mirrors Services "Two types of people" section) ── */}
        {topicTags.length > 0 && (
          <section
            className="bg-corbeau text-bone"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div
              style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,3rem)",
              }}
            >
              <p className="font-mono text-[0.68rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
                [ Browse by topic ]
              </p>
              <h2
                className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-bone"
                style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)" }}
              >
                Find what matters to you.{" "}
                <span className="cc-emphasis-italic">Pick your topic.</span>
              </h2>
              <p className="text-moon text-[1rem] max-w-[480px] leading-[1.7] mb-10">
                Every article is tagged by subject. Start where your problem is.
              </p>

              <div
                className="grid gap-5"
                style={{
                  gridTemplateColumns: `repeat(auto-fill, minmax(200px, 1fr))`,
                }}
              >
                {topicTags.map(([tag, count]) => {
                  const tagInfo = TAG_META[tag];
                  const Icon = tagInfo?.icon ?? Globe;
                  const label = tagInfo?.label ?? tagLabel(tag);
                  const desc = tagInfo?.description ?? "";
                  return (
                    <div
                      key={tag}
                      className="relative bg-haiti border border-white/[0.06] rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:border-papaya/20 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]"
                    >
                      {/* Top accent line */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-papaya to-canyon" />
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                        style={{ background: "rgba(252,152,90,0.12)" }}
                      >
                        <Icon size={18} style={{ color: "var(--cc-papaya)" }} />
                      </div>
                      <p className="font-display font-extrabold text-bone text-[1rem] tracking-[-0.02em] mb-1">
                        {label}
                      </p>
                      <p className="text-moon text-[0.8rem] leading-[1.5] mb-3 line-clamp-2">
                        {desc}
                      </p>
                      <p
                        className="font-mono text-[0.62rem] tracking-[1px] font-semibold"
                        style={{ color: "var(--cc-papaya)" }}
                      >
                        {count} {count === 1 ? "article" : "articles"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── 3. Featured insights ── */}
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
                padding: "clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,3rem)",
              }}
            >
              {/* Header — TrackRecord style */}
              <p className="font-mono text-[0.68rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
                [ Featured insights ]
              </p>
              <h2
                className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
                style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
              >
                Reads worth your time.{" "}
                <span className="cc-emphasis-italic">Start with these.</span>
              </h2>
              <p className="text-night text-[1rem] max-w-[520px] leading-[1.7] mb-10">
                The guides I wish existed when I started. Drawn from 25 years of ERP delivery.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.map((p, i) => (
                  <PostCard
                    key={p.frontmatter.slug}
                    post={p}
                    locale={locale}
                    priority={i === 0}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 4. Latest articles ── */}
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
                padding: "clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,3rem)",
              }}
            >
              {/* Header — TrackRecord style */}
              <p className="font-mono text-[0.68rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
                [ Latest articles ]
              </p>
              <h2
                className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
                style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
              >
                The full archive.{" "}
                <span className="cc-emphasis-italic">Field notes, not theory.</span>
              </h2>
              <p className="text-night text-[1rem] max-w-[520px] leading-[1.7] mb-10">
                Every article in this category. Written from delivery experience, not vendor decks.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {latest.map((p) => (
                  <PostCard key={p.frontmatter.slug} post={p} locale={locale} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 5. Videos from the field ── */}
        <YouTubeSection />

        {/* ── 6. About Noel strip ── */}
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
              padding: "clamp(2rem,4vw,3rem) clamp(1.5rem,5vw,3rem)",
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Headshot */}
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

              {/* Bio */}
              <div className="flex-1 min-w-0">
                <p className="font-display font-black text-corbeau text-lg mb-1">
                  Noel D&apos;Costa
                </p>
                <p className="text-night/75 text-[0.88rem] leading-relaxed max-w-lg">
                  Senior ERP and AI advisor. 25 years delivering for EDGE Group, Etihad Airways, ADNOC, PIF entities, and the UAE Government. CIMA, AICPA, Masters in Accounting.
                </p>
              </div>

              {/* Credentials */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {[
                  { icon: ShieldCheck, text: "Board-level perspective" },
                  { icon: Users, text: "Independent advice" },
                  { icon: BookOpen, text: "Enterprise delivery experience" },
                ].map((item) => (
                  <span
                    key={item.text}
                    className="flex items-center gap-2 text-[0.82rem] font-medium"
                    style={{ color: "var(--cc-night)" }}
                  >
                    <item.icon size={13} style={{ color: "var(--cc-papaya)", flexShrink: 0 }} />
                    {item.text}
                  </span>
                ))}
              </div>

              <Link
                href="/sap-erp-consultant-my-story-noel-dcosta"
                className="flex-shrink-0 text-[0.82rem] font-semibold hover:underline"
                style={{ color: "var(--cc-papaya)" }}
              >
                Full bio →
              </Link>
            </div>
          </div>
        </section>

        {/* ── 7. End CTA — same as homepage ── */}
        <CTABanner />

      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }}
      />
    </>
  );
}
