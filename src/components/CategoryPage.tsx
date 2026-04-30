import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Clock, BookOpen, Star, Zap, BarChart2 } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import StickyCTA from "@/components/StickyCTA";
import {
  CATEGORIES,
  getPostsByCategory,
  readingTime,
  type Category,
  type Locale,
  type PostRecord,
} from "@/lib/content";
import { breadcrumbJsonLd, SITE_URL } from "@/lib/seo";

// ─── Authority data ─────────────────────────────────────────────────────────

const CLIENTS = ["EDGE Group", "Etihad Airways", "ADNOC", "PIF entities", "UAE Government", "DXC"];

const CREDENTIALS = ["CIMA", "AICPA", "Masters in Accounting"];

const TESTIMONIALS = [
  {
    quote: "The programme delivered on time, on budget, and with no major issues. A very substantial undertaking and it is huge credit to Noel.",
    name: "Andrew MacFarlane",
    role: "Ex-CIO, Etihad / Managing Partner, Cumbrae",
  },
  {
    quote: "His functional expertise combined with his financial and accounting knowledge are invaluable tools that Noel uses to drive business change.",
    name: "Mike Papamichael",
    role: "Ex-CIO, Etihad Aviation Group",
  },
];

// ─── Tag config ─────────────────────────────────────────────────────────────

const TAG_LABELS: Record<string, string> = {
  "sap-planning-and-selection": "Planning",
  "sap-implementation-strategies": "Strategy",
  "sap-technical-decisions": "Technical",
  "sap-erp-modernization": "Modernization",
  "sap-crisis-management": "Crisis",
  "sap-industry-topics": "Industry",
};

type SectionKey = "start-here" | "important" | "advanced" | "case-study";

const TAG_TO_SECTION: Record<string, SectionKey> = {
  "sap-planning-and-selection": "start-here",
  "sap-industry-topics": "start-here",
  "sap-implementation-strategies": "important",
  "sap-erp-modernization": "advanced",
  "sap-technical-decisions": "advanced",
  "sap-crisis-management": "case-study",
};

const SECTION_META: Record<
  SectionKey,
  { label: string; sublabel: string; desc: string; color: string }
> = {
  "start-here": {
    label: "Start here",
    sublabel: "01",
    desc: "New to this topic? These cover the essentials before anything else.",
    color: "#22c55e",
  },
  important: {
    label: "Most important guides",
    sublabel: "02",
    desc: "The articles I'd send a CIO on day one of an engagement.",
    color: "var(--cc-papaya)",
  },
  advanced: {
    label: "Advanced topics",
    sublabel: "03",
    desc: "Deep technical content. Requires some implementation context.",
    color: "#e2826b",
  },
  "case-study": {
    label: "Case studies",
    sublabel: "04",
    desc: "Real outcomes. Named clients, hard numbers, honest lessons.",
    color: "var(--cc-night)",
  },
};

// ─── Sidebar tools ───────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSection(post: PostRecord): SectionKey {
  const slug = post.frontmatter.slug;
  if (slug.includes("case-study") || slug.includes("case-studies")) return "case-study";
  const tags = post.frontmatter.tags ?? [];
  for (const tag of tags) {
    const mapped = TAG_TO_SECTION[tag];
    if (mapped) return mapped;
  }
  const mins = readingTime(post.body);
  if (mins <= 8) return "start-here";
  if (mins > 30) return "advanced";
  return "important";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TagChip({ tag }: { tag: string }) {
  const label = TAG_LABELS[tag] ?? tag.split("-").slice(0, 2).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  return (
    <span
      className="inline-block font-mono text-[0.55rem] tracking-[1.5px] uppercase px-2 py-0.5 rounded-full"
      style={{
        background: "rgba(252,152,90,0.12)",
        color: "var(--cc-papaya)",
        border: "1px solid rgba(252,152,90,0.2)",
      }}
    >
      {label}
    </span>
  );
}

function PostCard({
  post,
  locale,
  index,
  badge,
}: {
  post: PostRecord;
  locale: string;
  index: number;
  badge?: string;
}) {
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const mins = readingTime(post.body);
  const dateStr = new Date(post.frontmatter.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
  const tags = (post.frontmatter.tags ?? []).slice(0, 2);
  const delay = Math.min(index, 8) * 70;

  return (
    <Link
      href={`${localePrefix}/${post.frontmatter.slug}`}
      className="block bg-paper rounded-[14px] overflow-hidden group transition-all duration-300 hover:-translate-y-1"
      style={{
        boxShadow: "0 1px 3px rgba(14,16,32,0.06), 0 4px 12px rgba(14,16,32,0.04)",
        border: "1px solid rgba(14,16,32,0.06)",
        animation: index < 9 ? `cc-fade-in 0.5s ease-out ${delay}ms both` : undefined,
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          position: "relative",
          aspectRatio: "16/9",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0e1020 0%, #282937 100%)",
        }}
      >
        {post.frontmatter.hero && (
          <Image
            src={post.frontmatter.hero}
            alt={post.frontmatter.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(14,16,32,0.85) 0%, rgba(14,16,32,0.3) 45%, transparent 75%)",
          }}
        />
        {badge && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full font-mono text-[0.55rem] tracking-widest uppercase font-bold"
            style={{ background: "var(--cc-papaya)", color: "var(--cc-corbeau)" }}
          >
            {badge}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 px-4 pb-3">
          <span
            className="font-mono text-[0.58rem] tracking-[2px] uppercase font-semibold"
            style={{ color: "var(--cc-papaya)" }}
          >
            {dateStr}
          </span>
          <span style={{ color: "rgba(244,237,228,0.3)", fontSize: 9 }}>·</span>
          <span
            className="flex items-center gap-1 font-mono text-[0.58rem]"
            style={{ color: "rgba(244,237,228,0.55)" }}
          >
            <Clock size={9} /> {mins} min
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {tags.map((t) => <TagChip key={t} tag={t} />)}
          </div>
        )}
        <h3 className="font-display font-bold text-corbeau text-[0.97rem] leading-snug mb-2 group-hover:text-papaya transition-colors duration-200 line-clamp-2">
          {post.frontmatter.title}
        </h3>
        {post.frontmatter.excerpt && (
          <p className="text-night/70 text-[0.82rem] leading-[1.55] line-clamp-2 mb-3">
            {post.frontmatter.excerpt}
          </p>
        )}
        <span className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold" style={{ color: "var(--cc-papaya)" }}>
          Read article <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}

function SectionHeader({ sectionKey, count }: { sectionKey: SectionKey; count: number }) {
  const s = SECTION_META[sectionKey];
  const icons: Record<SectionKey, React.ReactNode> = {
    "start-here": <BookOpen size={16} />,
    important: <Star size={16} />,
    advanced: <Zap size={16} />,
    "case-study": <BarChart2 size={16} />,
  };
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6 pb-4"
      style={{ borderBottom: `2px solid ${s.color}` }}
    >
      <div className="flex items-center gap-3 flex-1">
        <span
          className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
          style={{ background: `${s.color}18`, color: s.color }}
        >
          {icons[sectionKey]}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.58rem] tracking-[2px] uppercase" style={{ color: s.color }}>
              {s.sublabel}
            </span>
            <h2 className="font-display font-black text-corbeau text-lg leading-none">
              {s.label}
            </h2>
            <span
              className="font-mono text-[0.6rem] tracking-[1px] px-1.5 py-0.5 rounded"
              style={{ background: "rgba(14,16,32,0.05)", color: "var(--cc-silver)" }}
            >
              {count}
            </span>
          </div>
          <p className="text-[0.8rem] text-night/65 mt-0.5">{s.desc}</p>
        </div>
      </div>
    </div>
  );
}

function InlineCTA({ variant }: { variant: "book" | "checklist" }) {
  if (variant === "checklist") {
    return (
      <div
        className="rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0e1020 0%, #1a1b2e 100%)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div style={{ position: "absolute", top: -30, right: -30, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="flex-1" style={{ position: "relative" }}>
          <p className="font-mono text-[0.6rem] tracking-[2.5px] uppercase mb-1.5 font-semibold" style={{ color: "rgba(34,197,94,0.8)" }}>
            Free resource
          </p>
          <p className="font-display font-black text-lg leading-snug mb-1.5" style={{ color: "#ffffff" }}>
            ERP implementation checklist
          </p>
          <p className="text-[0.84rem] leading-relaxed" style={{ color: "rgba(244,237,228,0.55)" }}>
            47 checkpoints I run through on every programme. Book a call and I&apos;ll share it.
          </p>
        </div>
        <a
          href="https://calendly.com/noeldcosta/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-full whitespace-nowrap"
          style={{ background: "#22c55e", color: "#0e1020", position: "relative" }}
        >
          Get the checklist <ArrowUpRight size={14} />
        </a>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0e1020 0%, #1a1b2e 60%, #1f1a2e 100%)" }}
    >
      <div style={{ position: "absolute", top: -30, right: -30, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(252,152,90,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div className="flex-1" style={{ position: "relative" }}>
        <p className="font-mono text-[0.6rem] tracking-[2.5px] uppercase mb-1.5 font-semibold" style={{ color: "rgba(252,152,90,0.8)" }}>
          Senior ERP advisory
        </p>
        <p className="font-display font-black text-lg leading-snug mb-1.5" style={{ color: "#ffffff" }}>
          Running an ERP programme?
        </p>
        <p className="text-[0.84rem] leading-relaxed" style={{ color: "rgba(244,237,228,0.55)" }}>
          25 years. $700M+ delivered. I lead the engagement — no junior team.
        </p>
      </div>
      <a
        href="https://calendly.com/noeldcosta/30min"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-full whitespace-nowrap"
        style={{ background: "var(--cc-papaya)", color: "var(--cc-corbeau)", position: "relative" }}
      >
        Book a 30-min call <ArrowUpRight size={14} />
      </a>
    </div>
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

  // Bin posts into sections
  const sections: Record<SectionKey, PostRecord[]> = {
    "start-here": [],
    important: [],
    advanced: [],
    "case-study": [],
  };
  const [featured, ...rest] = posts;
  for (const post of rest) {
    sections[getSection(post)].push(post);
  }

  // Tags present in this category (for the topics strip)
  const allTags = [...new Set(posts.flatMap((p) => p.frontmatter.tags ?? []))];
  const otherCategories = ALL_CATEGORIES.filter((c) => c.slug !== category);

  const SECTION_ORDER: SectionKey[] = ["start-here", "important", "advanced", "case-study"];

  return (
    <>
      <Nav />
      <StickyCTA />
      <main style={{ paddingTop: 64 }}>

        {/* ── Dark category header ── */}
        <section
          style={{
            background: "linear-gradient(135deg, #0e1020 0%, #1a1b2e 60%, #1f1a2e 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -60, right: -80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(252,152,90,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 64, background: "linear-gradient(to bottom, transparent, var(--cc-page-bg))", pointerEvents: "none" }} />

          <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "clamp(2.5rem,5vw,4.5rem) clamp(1.5rem,5vw,3rem) clamp(3rem,5vw,4.5rem)" }}>
            <nav className="flex items-center gap-2 mb-8" aria-label="Breadcrumb">
              <Link href="/" className="font-mono text-[0.6rem] tracking-widest uppercase transition-colors" style={{ color: "rgba(244,237,228,0.4)" }}>
                Home
              </Link>
              <span className="font-mono text-[0.58rem]" style={{ color: "rgba(244,237,228,0.2)" }}>/</span>
              <span className="font-mono text-[0.6rem] tracking-widest uppercase font-semibold" style={{ color: "var(--cc-papaya)" }}>
                {meta.label}
              </span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div>
                <p className="font-mono text-[0.65rem] font-semibold tracking-[3px] uppercase mb-4" style={{ color: "rgba(252,152,90,0.7)" }}>
                  Category
                </p>
                <h1
                  className="font-display font-black leading-[1.02] tracking-[-0.03em]"
                  style={{ fontSize: "clamp(2.6rem,7vw,4.5rem)", color: "#ffffff" }}
                >
                  {meta.label}
                </h1>
                <div style={{ width: 56, height: 4, borderRadius: 2, background: "linear-gradient(90deg, var(--cc-papaya), rgba(252,152,90,0.25))", margin: "18px 0" }} />
                <p className="text-lg leading-[1.65] max-w-[560px]" style={{ color: "rgba(244,237,228,0.65)" }}>
                  {meta.description}
                </p>
              </div>

              {/* Stats badges */}
              <div className="flex gap-4 flex-wrap">
                {[
                  { num: posts.length.toString(), label: "articles" },
                  { num: "25", label: "years exp." },
                  { num: "$700M+", label: "delivered" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl px-5 py-4 text-center"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", minWidth: 90 }}
                  >
                    <div
                      className="font-display font-black leading-none mb-1"
                      style={{ fontSize: "clamp(1.4rem,3vw,2rem)", background: "linear-gradient(135deg, #ffffff, var(--cc-papaya))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                    >
                      {s.num}
                    </div>
                    <div className="font-mono text-[0.55rem] tracking-[2px] uppercase" style={{ color: "rgba(244,237,228,0.4)" }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Authority strip ── */}
        <section
          className="bg-paper"
          style={{ borderBottom: "1px solid rgba(14,16,32,0.07)" }}
        >
          <div
            style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(1.5rem,3vw,2.5rem) clamp(1.5rem,5vw,3rem)" }}
          >
            {/* Credentials + clients */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-5">
              <span className="font-mono text-[0.6rem] tracking-[2.5px] uppercase text-silver flex-shrink-0">
                Track record
              </span>
              <div className="flex flex-wrap gap-2">
                {CLIENTS.map((c) => (
                  <span
                    key={c}
                    className="font-mono text-[0.65rem] tracking-[1px] px-3 py-1 rounded-full"
                    style={{ background: "rgba(14,16,32,0.05)", color: "var(--cc-night)", border: "1px solid rgba(14,16,32,0.08)" }}
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 ml-auto">
                {CREDENTIALS.map((c) => (
                  <span
                    key={c}
                    className="font-mono text-[0.65rem] tracking-[1px] px-3 py-1 rounded-full font-semibold"
                    style={{ background: "rgba(252,152,90,0.1)", color: "var(--cc-papaya)", border: "1px solid rgba(252,152,90,0.2)" }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Testimonial strip — one quote */}
            <div
              className="rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ background: "linear-gradient(135deg, rgba(14,16,32,0.03), rgba(252,152,90,0.04))", border: "1px solid rgba(14,16,32,0.06)" }}
            >
              <div className="flex gap-0.5 flex-shrink-0 text-papaya text-[0.75rem]">★★★★★</div>
              <p className="text-[0.85rem] text-night/80 italic leading-relaxed flex-1">
                &ldquo;{TESTIMONIALS[0].quote}&rdquo;
              </p>
              <div className="flex-shrink-0">
                <div className="font-display font-bold text-corbeau text-[0.85rem]">{TESTIMONIALS[0].name}</div>
                <div className="font-mono text-[0.6rem] text-silver tracking-[0.5px]">{TESTIMONIALS[0].role}</div>
              </div>
            </div>

            {/* Topics covered */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="font-mono text-[0.58rem] tracking-[2px] uppercase text-silver">
                  Topics in this category:
                </span>
                {allTags.map((t) => <TagChip key={t} tag={t} />)}
              </div>
            )}
          </div>
        </section>

        {/* ── Main 2-col layout ── */}
        <div
          style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(2rem,4vw,3rem) clamp(1.5rem,5vw,3rem) clamp(3rem,6vw,5rem)" }}
        >
          {posts.length === 0 ? (
            <p className="text-night/60 py-16 text-center">No posts yet in this category.</p>
          ) : (
            <div className="flex flex-col lg:flex-row gap-10">

              {/* ── Left: article content ── */}
              <div className="flex-1 min-w-0">

                {/* Featured hero card */}
                {featured && (
                  <Link
                    href={`${localePrefix}/${featured.frontmatter.slug}`}
                    className="block mb-10 rounded-[18px] overflow-hidden group transition-all duration-300 hover:-translate-y-1"
                    style={{ boxShadow: "0 4px 24px rgba(14,16,32,0.12), 0 1px 4px rgba(14,16,32,0.06)", border: "1px solid rgba(14,16,32,0.07)", animation: "cc-fade-in 0.5s ease-out 0ms both" }}
                  >
                    <div className="flex flex-col md:flex-row bg-paper">
                      <div
                        className="relative md:w-[48%] flex-shrink-0 overflow-hidden"
                        style={{ aspectRatio: "4/3", minHeight: 220, background: "linear-gradient(135deg, #0e1020, #1a1b2e)" }}
                      >
                        {featured.frontmatter.hero && (
                          <Image
                            src={featured.frontmatter.hero}
                            alt={featured.frontmatter.title}
                            fill
                            priority
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            sizes="(min-width: 768px) 48vw, 100vw"
                          />
                        )}
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(14,16,32,0.6) 0%, rgba(14,16,32,0.1) 60%, transparent 100%)" }} />
                        <div
                          className="absolute top-4 left-4 px-3 py-1 rounded-full font-mono text-[0.58rem] tracking-widest uppercase font-bold"
                          style={{ background: "var(--cc-papaya)", color: "var(--cc-corbeau)" }}
                        >
                          Latest
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 px-5 pb-4">
                          <span className="font-mono text-[0.6rem] tracking-[2px] uppercase font-semibold" style={{ color: "var(--cc-papaya)" }}>
                            {new Date(featured.frontmatter.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                          </span>
                          <span style={{ color: "rgba(244,237,228,0.3)", fontSize: 9 }}>·</span>
                          <span className="flex items-center gap-1 font-mono text-[0.6rem]" style={{ color: "rgba(244,237,228,0.55)" }}>
                            <Clock size={10} /> {readingTime(featured.body)} min read
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 p-7 flex flex-col justify-between">
                        <div>
                          {(featured.frontmatter.tags ?? []).slice(0, 2).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {(featured.frontmatter.tags ?? []).slice(0, 2).map((t) => <TagChip key={t} tag={t} />)}
                            </div>
                          )}
                          <h2
                            className="font-display font-black text-corbeau leading-tight mb-3 group-hover:text-papaya transition-colors duration-200"
                            style={{ fontSize: "clamp(1.3rem,2.5vw,1.65rem)" }}
                          >
                            {featured.frontmatter.title}
                          </h2>
                          {featured.frontmatter.excerpt && (
                            <p className="text-night/70 leading-[1.65] line-clamp-3 text-[0.93rem]">
                              {featured.frontmatter.excerpt}
                            </p>
                          )}
                        </div>
                        <div className="mt-5">
                          <span
                            className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full"
                            style={{ background: "var(--cc-corbeau)", color: "var(--cc-bone)" }}
                          >
                            Read article <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Sections */}
                {SECTION_ORDER.map((sKey, si) => {
                  const sectionPosts = sections[sKey];
                  if (sectionPosts.length === 0) return null;

                  // Inject inline CTA every other section
                  const ctaVariant = si % 2 === 0 ? "checklist" : "book";

                  return (
                    <div key={sKey} className="mb-12">
                      <SectionHeader sectionKey={sKey} count={sectionPosts.length} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                        {sectionPosts.map((p, i) => (
                          <PostCard
                            key={p.frontmatter.slug}
                            post={p}
                            locale={locale}
                            index={i + (si * 8)}
                            badge={sKey === "important" && i === 0 ? "Popular" : undefined}
                          />
                        ))}
                      </div>
                      {/* Inline CTA after each section */}
                      <InlineCTA variant={ctaVariant} />
                    </div>
                  );
                })}
              </div>

              {/* ── Sidebar ── */}
              <aside
                className="lg:w-[280px] xl:w-[300px] flex-shrink-0 flex flex-col gap-5"
                style={{ alignSelf: "flex-start", position: "sticky", top: 88 }}
              >
                {/* Book a call */}
                <div
                  className="rounded-2xl p-6 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #0e1020 0%, #1a1b2e 70%, #1f1a2e 100%)" }}
                >
                  <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(252,152,90,0.25) 0%, transparent 70%)", pointerEvents: "none" }} />
                  <span className="cc-pulse-dot block mb-3" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--cc-papaya)", position: "relative" }} />
                  <p className="font-mono text-[0.6rem] tracking-[2.5px] uppercase mb-2 font-semibold" style={{ color: "rgba(252,152,90,0.8)", position: "relative" }}>
                    Available now
                  </p>
                  <h3 className="font-display font-black text-xl leading-snug mb-3" style={{ color: "#ffffff", position: "relative" }}>
                    Talk to Noel directly.
                  </h3>
                  <p className="text-[0.84rem] leading-relaxed mb-5" style={{ color: "rgba(244,237,228,0.55)", position: "relative" }}>
                    ECC to S/4HANA. AI on SAP. CIMA-qualified. I lead every engagement.
                  </p>
                  <a
                    href="https://calendly.com/noeldcosta/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full text-sm font-bold py-3 rounded-full"
                    style={{ background: "var(--cc-papaya)", color: "var(--cc-corbeau)", position: "relative" }}
                  >
                    Book a 30-min call <ArrowUpRight size={13} />
                  </a>
                </div>

                {/* Lead magnet */}
                <div
                  className="rounded-2xl p-6 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.02))", border: "1px solid rgba(34,197,94,0.15)" }}
                >
                  <p className="font-mono text-[0.6rem] tracking-[2.5px] uppercase mb-2 font-semibold" style={{ color: "#22c55e" }}>
                    Free resource
                  </p>
                  <h3 className="font-display font-bold text-corbeau text-base leading-snug mb-2">
                    ERP implementation checklist
                  </h3>
                  <p className="text-[0.82rem] text-night/65 leading-relaxed mb-4">
                    47 checkpoints I run through on every programme. Book a call and I&apos;ll share it.
                  </p>
                  <a
                    href="https://calendly.com/noeldcosta/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full text-[0.82rem] font-bold py-2.5 rounded-full"
                    style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}
                  >
                    Get the checklist <ArrowUpRight size={12} />
                  </a>
                </div>

                {/* Second testimonial */}
                <div
                  className="rounded-2xl p-5"
                  style={{ background: "var(--cc-paper)", border: "1px solid rgba(14,16,32,0.07)" }}
                >
                  <div className="flex gap-0.5 mb-2.5 text-papaya text-[0.72rem]">★★★★★</div>
                  <p className="text-[0.82rem] text-night/75 italic leading-relaxed mb-3">
                    &ldquo;{TESTIMONIALS[1].quote}&rdquo;
                  </p>
                  <div>
                    <span className="font-display font-bold text-corbeau text-[0.85rem] block">{TESTIMONIALS[1].name}</span>
                    <span className="font-mono text-[0.58rem] text-silver tracking-[0.5px]">{TESTIMONIALS[1].role}</span>
                  </div>
                </div>

                {/* About */}
                <div className="bg-paper rounded-2xl p-6" style={{ border: "1px solid rgba(14,16,32,0.07)" }}>
                  <p className="font-mono text-[0.6rem] tracking-[2.5px] uppercase mb-3" style={{ color: "var(--cc-papaya)" }}>
                    About the author
                  </p>
                  <p className="font-display font-black text-corbeau text-lg mb-2">Noel D&apos;Costa</p>
                  <p className="text-night/70 text-[0.84rem] leading-relaxed mb-4">
                    Senior ERP and AI advisor. 25 years across EDGE Group, Etihad Airways, ADNOC, PIF entities, and the UAE Government.
                  </p>
                  <Link href="/sap-erp-consultant-my-story-noel-dcosta" className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold hover:underline" style={{ color: "var(--cc-papaya)" }}>
                    Full bio <ArrowRight size={12} />
                  </Link>
                </div>

                {/* Tools */}
                <div className="bg-paper rounded-2xl p-6" style={{ border: "1px solid rgba(14,16,32,0.07)" }}>
                  <p className="font-mono text-[0.6rem] tracking-[2.5px] uppercase mb-4" style={{ color: "var(--cc-papaya)" }}>
                    Free tools
                  </p>
                  <div className="flex flex-col">
                    {SIDEBAR_TOOLS.map((t, i) => (
                      <Link
                        key={t.slug}
                        href={`/${t.slug}`}
                        className="flex items-center justify-between text-[0.84rem] text-corbeau font-medium hover:text-papaya transition-colors py-2.5"
                        style={{ borderBottom: i < SIDEBAR_TOOLS.length - 1 ? "1px solid rgba(14,16,32,0.06)" : undefined }}
                      >
                        {t.label}
                        <ArrowRight size={12} style={{ color: "var(--cc-papaya)", flexShrink: 0 }} />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Browse topics */}
                <div className="bg-paper rounded-2xl p-6" style={{ border: "1px solid rgba(14,16,32,0.07)" }}>
                  <p className="font-mono text-[0.6rem] tracking-[2.5px] uppercase mb-4" style={{ color: "var(--cc-papaya)" }}>
                    Browse topics
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {otherCategories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/category/${c.slug}`}
                        className="text-[0.84rem] py-2 transition-colors text-night hover:text-papaya"
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
          style={{ background: "linear-gradient(135deg, #0e1020 0%, #1a1b2e 60%, #1f1a2e 100%)", position: "relative", overflow: "hidden" }}
        >
          <div style={{ position: "absolute", bottom: -60, left: "50%", transform: "translateX(-50%)", width: 600, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(252,152,90,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,3rem)", textAlign: "center", position: "relative" }}>
            <p className="font-mono text-[0.62rem] tracking-[2.5px] uppercase mb-4 font-semibold" style={{ color: "rgba(252,152,90,0.75)" }}>
              Senior advisory
            </p>
            <h2
              className="font-display font-black leading-tight mb-4 tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.8rem,4.5vw,3rem)", background: "linear-gradient(135deg, #ffffff 40%, var(--cc-papaya))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              Reading about ERP isn&apos;t enough.
            </h2>
            <p className="text-lg max-w-[440px] mx-auto mb-8 leading-relaxed" style={{ color: "rgba(244,237,228,0.55)" }}>
              If you&apos;re planning a migration or mid-programme, a 30-min call saves months.
            </p>
            <a
              href="https://calendly.com/noeldcosta/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold px-7 py-3.5 rounded-full"
              style={{ background: "var(--cc-papaya)", color: "var(--cc-corbeau)" }}
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
