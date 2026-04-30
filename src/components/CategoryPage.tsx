import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
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
    label: "Modernization",
    description: "Cloud migration, clean core, and ERP transformation.",
    icon: RefreshCw,
  },
  "sap-crisis-management": {
    label: "Crisis & Recovery",
    description: "Programme recovery, risk mitigation, and escalation.",
    icon: AlertCircle,
  },
  "sap-industry-topics": {
    label: "Industry",
    description: "Sector-specific ERP patterns and case examples.",
    icon: Globe,
  },
};

const TAG_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(TAG_META).map(([k, v]) => [k, v.label])
);

// ─── Other categories ────────────────────────────────────────────────────────

const ALL_CATEGORIES = [
  { slug: "erp-implementation", label: "ERP Implementation" },
  { slug: "platforms-modules", label: "Platforms & Modules" },
  { slug: "erp-strategy", label: "ERP Strategy & Cost" },
  { slug: "ai-governance", label: "AI Governance" },
  { slug: "agentic-ai", label: "Agentic AI" },
  { slug: "case-studies", label: "Case Studies" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── StartHereRow ─────────────────────────────────────────────────────────────

function StartHereRow({
  post,
  locale,
  variant = "light",
}: {
  post: PostRecord;
  locale: string;
  variant?: "light" | "orange";
}) {
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const mins = readingTime(post.body);
  const onOrange = variant === "orange";

  return (
    <Link
      href={`${localePrefix}/${post.frontmatter.slug}`}
      className="flex items-center gap-3 group py-3"
      style={{
        borderBottom: `1px solid ${onOrange ? "rgba(14,16,32,0.12)" : "rgba(14,16,32,0.07)"}`,
      }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{
          background: onOrange ? "rgba(14,16,32,0.1)" : "rgba(252,152,90,0.1)",
        }}
      >
        <BookOpen
          size={14}
          style={{ color: onOrange ? "var(--cc-corbeau)" : "var(--cc-papaya)" }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-[0.85rem] leading-snug transition-colors line-clamp-1"
          style={{ color: onOrange ? "var(--cc-corbeau)" : "var(--cc-corbeau)" }}
        >
          {post.frontmatter.title}
        </p>
        <p
          className="font-mono text-[0.6rem] tracking-[1px] mt-0.5"
          style={{
            color: onOrange ? "rgba(14,16,32,0.5)" : "var(--cc-silver)",
          }}
        >
          {mins} min read
        </p>
      </div>
      <ArrowRight
        size={13}
        className="flex-shrink-0 transition-transform group-hover:translate-x-0.5"
        style={{ color: onOrange ? "rgba(14,16,32,0.4)" : "var(--cc-silver)" }}
      />
    </Link>
  );
}

// ─── ArticleRow (TrackRecord style) ──────────────────────────────────────────

function ArticleRow({
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
  const tag = (post.frontmatter.tags ?? [])[0];

  return (
    <Link
      href={`${localePrefix}/${post.frontmatter.slug}`}
      className={`block py-5 border-b border-corbeau/[0.06] group ${index === 0 ? "pt-0" : ""}`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono text-[0.65rem] uppercase tracking-[2px] text-silver">
          {tag ? tagLabel(tag) : "article"}
        </span>
        <span
          className="font-mono text-[0.62rem] px-2 py-0.5 rounded font-semibold"
          style={{ background: "rgba(252,152,90,0.12)", color: "var(--cc-papaya)" }}
        >
          {mins} min read
        </span>
      </div>
      <h4 className="font-display text-[1.05rem] font-bold tracking-[-0.02em] mb-1 text-corbeau group-hover:text-papaya transition-colors duration-200">
        {post.frontmatter.title}
      </h4>
      {post.frontmatter.excerpt && (
        <p className="text-night text-[0.85rem] leading-[1.55] line-clamp-2">
          {post.frontmatter.excerpt}
        </p>
      )}
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
  const featured = posts.slice(0, 4);
  const latest = posts.slice(4);

  // Tag counts
  const tagCounts: Record<string, number> = {};
  for (const post of posts) {
    for (const tag of post.frontmatter.tags ?? []) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const topicTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Ticker items — always use all 6 TAG_META entries (doubled for seamless loop)
  const tickerItems = Object.entries(TAG_META).map(([key, info]) => ({
    key,
    info,
    count: tagCounts[key] ?? 0,
  }));
  const tickerDouble = [...tickerItems, ...tickerItems];

  // Stats for dashboard card
  const avgReadTime =
    posts.length > 0
      ? Math.round(
          posts.reduce((s, p) => s + readingTime(p.body), 0) / posts.length
        )
      : 0;
  const latestDate = posts[0]?.frontmatter.date
    ? new Date(posts[0].frontmatter.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";

  const otherCategories = ALL_CATEGORIES.filter((c) => c.slug !== category);

  return (
    <>
      <Nav />
      <StickyCTA />
      <main style={{ paddingTop: 64 }}>

        {/* ── 1. Category Hero ── */}
        <section
          className="relative overflow-hidden"
          style={{
            background: "var(--cc-page-bg)",
            borderBottom: "1px solid rgba(14,16,32,0.07)",
          }}
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

            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
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
                  {meta.label}
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

              {/* Right — Start Here (papaya gradient like CTABanner) */}
              {startHerePosts.length > 0 && (
                <div className="lg:col-span-5">
                  <div
                    className="relative rounded-2xl overflow-hidden p-6"
                    style={{
                      background: "linear-gradient(135deg,#fc985a 0%,#e2826b 100%)",
                      boxShadow: "0 8px 32px rgba(252,152,90,0.35)",
                    }}
                  >
                    {/* Grid overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        opacity: 0.1,
                        backgroundImage:
                          "linear-gradient(rgba(14,16,32,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(14,16,32,0.5) 1px,transparent 1px)",
                        backgroundSize: "32px 32px",
                      }}
                    />
                    <div className="relative">
                      <p className="font-mono text-[0.6rem] tracking-[2.5px] uppercase font-bold mb-4 flex items-center gap-2 text-corbeau">
                        <span className="w-1.5 h-1.5 rounded-full bg-corbeau" />
                        Start here
                      </p>
                      <div>
                        {startHerePosts.map((p) => (
                          <StartHereRow
                            key={p.frontmatter.slug}
                            post={p}
                            locale={locale}
                            variant="orange"
                          />
                        ))}
                      </div>
                      <Link
                        href={`/category/${meta.slug}`}
                        className="inline-flex items-center gap-1.5 text-[0.8rem] font-bold mt-4 text-corbeau hover:opacity-70 transition-opacity"
                      >
                        View all {posts.length} articles <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 2. Browse by topic (Tools dark style + scrolling ticker) ── */}
        <section
          className="bg-corbeau overflow-hidden"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Section header */}
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "clamp(2.5rem,5vw,4rem) clamp(1.5rem,5vw,3rem) 1.5rem",
            }}
          >
            <p className="font-mono text-[0.68rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
              [ Browse by topic ]
            </p>
            <h2
              className="font-display font-black tracking-[-0.04em] leading-[1.08] text-bone"
              style={{ fontSize: "clamp(1.4rem,3vw,2rem)" }}
            >
              Filter by what matters.{" "}
              <span className="cc-emphasis-italic">Find it fast.</span>
            </h2>
          </div>

          {/* Scrolling ticker */}
          <div className="overflow-hidden pb-8">
            <div
              className="flex w-max animate-tick-scroll"
              style={{ gap: 16, paddingLeft: "clamp(1.5rem,5vw,3rem)" }}
            >
              {tickerDouble.map(({ key, info, count }, i) => {
                const Icon = info.icon;
                return (
                  <div
                    key={`${key}-${i}`}
                    className="flex-shrink-0 rounded-[14px] overflow-hidden"
                    style={{
                      background: "var(--cc-haiti)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      width: 220,
                    }}
                  >
                    {/* Header — mirrors Tools card header */}
                    <div className="px-[14px] py-2.5 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={14} style={{ color: "var(--cc-papaya)" }} />
                        <span className="font-mono text-[0.72rem] font-semibold text-bone">
                          {info.label}
                        </span>
                      </div>
                      <span
                        className="font-mono text-[0.58rem] px-1.5 py-0.5 rounded font-semibold text-papaya"
                        style={{ background: "rgba(252,152,90,0.1)" }}
                      >
                        {count}
                      </span>
                    </div>
                    {/* Body */}
                    <div className="p-4">
                      <p className="text-moon text-[0.82rem] leading-[1.5] line-clamp-2">
                        {info.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 3. Featured insights (TrackRecord style) ── */}
        {featured.length > 0 && (
          <section
            style={{
              background: "var(--cc-bone)",
              borderBottom: "1px solid rgba(14,16,32,0.07)",
              padding: "clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,3rem)",
            }}
          >
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <p className="font-mono text-[0.68rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
                [ Featured insights ]
              </p>
              <h2
                className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
                style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
              >
                The most important reads.{" "}
                <span className="cc-emphasis-italic">Start with these.</span>
              </h2>
              <p className="text-night text-[1rem] max-w-[520px] leading-[1.7] mb-12">
                Curated from 25 years of ERP delivery. The guides I wish existed when I started.
              </p>

              <div className="grid grid-cols-2 gap-14 items-start max-lg:grid-cols-1">
                {/* Left — article list */}
                <div className="flex flex-col">
                  {featured.map((p, i) => (
                    <ArticleRow key={p.frontmatter.slug} post={p} locale={locale} index={i} />
                  ))}
                </div>

                {/* Right — content dashboard card (sticky) */}
                <div
                  className="cc-card relative rounded-2xl overflow-hidden max-lg:max-w-[500px] sticky"
                  style={{
                    top: 84,
                    boxShadow: "0 24px 48px -12px rgba(14,16,32,0.15)",
                  }}
                >
                  <div className="cc-scan-line" />
                  {/* Mac-style header */}
                  <div className="flex items-center justify-between px-[18px] py-3 bg-corbeau/[0.02] border-b border-corbeau/[0.06]">
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                      </div>
                      <span className="font-mono text-[0.7rem] text-silver ml-2.5">
                        content.insights
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] text-papaya font-semibold">
                      <span className="w-[5px] h-[5px] rounded-full bg-papaya animate-pulse-dot" />
                      LIVE
                    </span>
                  </div>
                  {/* Stats */}
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                      {[
                        { lbl: "Articles", val: String(posts.length), color: "text-papaya" },
                        { lbl: "Avg read", val: `${avgReadTime} min`, color: "text-corbeau" },
                        { lbl: "Topics", val: String(Object.keys(tagCounts).length), color: "text-papaya" },
                        { lbl: "Latest", val: latestDate, color: "text-corbeau" },
                      ].map((m) => (
                        <div
                          key={m.lbl}
                          className="bg-cream border border-corbeau/[0.04] rounded-[10px] p-4"
                        >
                          <p className="font-mono text-[0.6rem] text-silver uppercase tracking-[1.5px] mb-1">
                            {m.lbl}
                          </p>
                          <p
                            className={`font-display font-black text-2xl tracking-[-0.03em] ${m.color}`}
                          >
                            {m.val}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Topic proportion bar */}
                    {topicTags.length > 0 && (
                      <div className="mb-3">
                        <p className="font-mono text-[0.6rem] text-silver uppercase tracking-[1.5px] mb-2">
                          Coverage
                        </p>
                        <div className="flex gap-1 h-[28px] rounded-lg overflow-hidden">
                          {topicTags.map(([tag, count], i) => (
                            <div
                              key={tag}
                              className="flex items-center justify-center font-mono text-[0.55rem] font-semibold rounded-[4px]"
                              style={{
                                flex: count,
                                background:
                                  i === 0
                                    ? "var(--cc-papaya)"
                                    : `rgba(252,152,90,${Math.max(0.08, 0.25 - i * 0.04)})`,
                                color: i === 0 ? "var(--cc-corbeau)" : "var(--cc-night)",
                              }}
                            >
                              {tagLabel(tag).split(" ")[0]}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="pt-2 border-t border-corbeau/[0.06]">
                      <a
                        href="https://calendly.com/noeldcosta/30min"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-[0.85rem] font-bold py-3 rounded-xl w-full transition-all hover:-translate-y-px"
                        style={{ background: "var(--cc-papaya)", color: "var(--cc-corbeau)" }}
                      >
                        Book a 30-min call <ArrowUpRight size={13} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 4. Latest articles (TrackRecord style) ── */}
        {latest.length > 0 && (
          <section
            style={{
              background: "var(--cc-cream)",
              borderBottom: "1px solid rgba(14,16,32,0.07)",
              padding: "clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,3rem)",
            }}
          >
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <p className="font-mono text-[0.68rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
                [ Latest articles ]
              </p>
              <h2
                className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
                style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
              >
                Everything I&apos;ve written here.{" "}
                <span className="cc-emphasis-italic">All {latest.length} of them.</span>
              </h2>
              <p className="text-night text-[1rem] max-w-[520px] leading-[1.7] mb-12">
                Real experience. Real numbers. From the projects, not the marketing slides.
              </p>

              <div className="grid grid-cols-2 gap-14 items-start max-lg:grid-cols-1">
                {/* Left — article list */}
                <div className="flex flex-col">
                  {latest.map((p, i) => (
                    <ArticleRow key={p.frontmatter.slug} post={p} locale={locale} index={i} />
                  ))}
                </div>

                {/* Right — CTA card (orange gradient, sticky) */}
                <div
                  className="relative rounded-2xl overflow-hidden max-lg:max-w-[500px] sticky"
                  style={{
                    top: 84,
                    background: "linear-gradient(135deg,#fc985a 0%,#e2826b 100%)",
                    boxShadow: "0 24px 48px -12px rgba(252,152,90,0.3)",
                  }}
                >
                  {/* Grid overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      opacity: 0.1,
                      backgroundImage:
                        "linear-gradient(rgba(14,16,32,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(14,16,32,0.5) 1px,transparent 1px)",
                      backgroundSize: "32px 32px",
                    }}
                  />
                  <div className="relative p-7">
                    <p className="font-mono text-[0.6rem] tracking-[2.5px] uppercase font-bold mb-4 flex items-center gap-2 text-corbeau">
                      <span className="w-1.5 h-1.5 rounded-full bg-corbeau" />
                      Ready when you are
                    </p>
                    <h3
                      className="font-display font-black text-corbeau tracking-[-0.03em] mb-3 leading-tight"
                      style={{ fontSize: "clamp(1.3rem,2.5vw,1.8rem)" }}
                    >
                      30 minutes. No sales pitch.
                    </h3>
                    <p
                      className="text-[0.9rem] leading-relaxed mb-6"
                      style={{ color: "rgba(14,16,32,0.65)" }}
                    >
                      Tell me what&apos;s going on with your ERP programme. I&apos;ll tell you straight if I can help.
                    </p>

                    {/* Checklist */}
                    {[
                      "Programme health check",
                      "Risk identification",
                      "Vendor independence",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2.5 mb-2.5">
                        <div
                          className="w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center"
                          style={{
                            borderColor: "rgba(14,16,32,0.25)",
                            background: "rgba(14,16,32,0.06)",
                          }}
                        >
                          <svg
                            width="8"
                            height="6"
                            viewBox="0 0 10 8"
                            fill="none"
                          >
                            <path
                              d="M1 4L4 7L9 1"
                              stroke="#0e1020"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <span className="text-corbeau text-[0.85rem] font-medium">
                          {item}
                        </span>
                      </div>
                    ))}

                    <a
                      href="https://calendly.com/noeldcosta/30min"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-[0.88rem] font-bold py-3.5 rounded-xl w-full mt-6 transition-all hover:opacity-90"
                      style={{ background: "var(--cc-corbeau)", color: "var(--cc-bone)" }}
                    >
                      Book a free call <ArrowUpRight size={13} />
                    </a>

                    <a
                      href="https://www.linkedin.com/in/noeldcosta/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center text-[0.8rem] font-medium mt-3 hover:underline"
                      style={{ color: "rgba(14,16,32,0.5)" }}
                    >
                      Or message me on LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 5. About Noel strip ── */}
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
                  Senior ERP and AI advisor. 25 years delivering for EDGE Group, Etihad Airways,
                  ADNOC, PIF entities, and the UAE Government. CIMA, AICPA, Masters in Accounting.
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
                    <item.icon
                      size={13}
                      style={{ color: "var(--cc-papaya)", flexShrink: 0 }}
                    />
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

        {/* ── 6. Videos from the field (mirrors YouTubeSection from homepage) ── */}
        <YouTubeSection />

        {/* ── 7. End CTA (matches homepage CTABanner exactly) ── */}
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
