import Link from "next/link";
import LoopVideo from "@/components/site/LoopVideo";
import SignupForm from "@/components/site/SignupForm";
import { signupCopy } from "@/components/site/signup-copy";
import { translator } from "@/i18n";
import { getPost, type Locale } from "@/lib/content";
import { localizeHref } from "@/lib/link-repair";
import { publicPrefixFromContentLocale } from "@/lib/locale-url";
import AiProjects from "@/components/pages/AiProjects";
import { TESTIMONIALS } from "@/components/article/testimonials/data";
import ReferencesMarquee, { type Reference } from "./ReferencesMarquee";
import {
  ABOUT,
  ACADEMY,
  ARTICLES_INDEX,
  CLIENT_WORK,
  CONTACT,
  ERPCV,
  ERPCV_ADVISORY,
  EXPERTISE,
  SAPOPEDIA,
  SAPOPEDIA_BOOKS,
} from "@/data/site-menu";

// Homepage sections. Structure and style follow the MDLBeast reference
// (HomeHero, Section header, Card grid with meaningful bands, DataTable, phase
// cards, "Why" list, closing band). Copy is Noel's, from the approved prototype.
// Every section takes the page locale: interface text goes through the i18n
// dictionary, links point at the translated page when one is published.
// Testimonials stay verbatim in English (lang="en").

type L = { locale?: Locale };

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function tools(locale: Locale | undefined) {
  const tr = translator(locale);
  const prefix = publicPrefixFromContentLocale(locale ?? "en");
  const href = (h: string) => localizeHref(prefix, h);
  return { tr, href, en: locale && locale !== "en" ? "en" : undefined };
}

function SectionHead({
  eyebrow,
  id,
  title,
  highlight,
  lede,
  link,
}: {
  /** Section label. Used sparingly: at most one section in three carries one. */
  eyebrow?: string;
  id: string;
  title: string;
  highlight: string;
  lede?: string;
  link?: { label: string; href: string };
}) {
  return (
    <div className="nd-header-row">
      <div>
        {eyebrow && <div className="nd-eyebrow">{eyebrow}</div>}
        <h2 id={id} className="nd-display nd-h2">
          {title} <span className="nd-hl">{highlight}</span>
        </h2>
        {lede && <p className="nd-lede">{lede}</p>}
      </div>
      {link && (
        <Link className="nd-textlink" href={link.href}>
          {link.label} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

/** " / " in a translated headline marks where the highlighted second line starts. */
function splitHeadline(text: string): [string, string] {
  const at = text.indexOf(" / ");
  return at < 0 ? [text, ""] : [text.slice(0, at).trim(), text.slice(at + 3).trim()];
}

export function HomeHero({ locale }: L) {
  const { tr, href } = tools(locale);
  const [heroLead, heroHighlight] = splitHeadline(tr("I help you build systems / and then make them smart."));
  return (
    <section className="nd-hero" aria-labelledby="hero-title">
      <div className="bg" aria-hidden="true" />
      <LoopVideo className="media loop" src="/media/video/hero-loop.mp4" poster="/media/video/hero-loop-poster.jpg" />
      <div className="scrim" aria-hidden="true" />
      <div className="wash nd-grid-wash" aria-hidden="true" />
      <div className="nd-spotlight" aria-hidden="true" />
      {/* Desktop portrait: Noel in Dubai at sunset, filling the right half and
          fading into the page. Phones get a 1px placeholder from <source>, so the
          38 to 65 KB image is only downloaded where it is shown. Desktop LCP. */}
      <picture>
        <source media="(max-width: 1023px)" srcSet={PIXEL} />
        <img
          className="media hero-photo"
          src="/media/noel-dubai-1100.webp"
          srcSet="/media/noel-dubai-760.webp 760w, /media/noel-dubai-1100.webp 1100w"
          sizes="(min-width: 1024px) 52vw, 1px"
          alt=""
          aria-hidden="true"
          width={1100}
          height={1375}
          fetchPriority="high"
        />
      </picture>
      <div className="nd-hero-inner">
        <div className="nd-reveal nd-hero-copy">
          <h1 id="hero-title" className="nd-display">
            <span className="l1">{heroLead}</span> <span className="nd-hl">{heroHighlight}</span>
          </h1>
          <p className="sub">
            {tr(
              "I help your team pick the right platforms, deliver programmes, improve reporting and use AI where it solves real problems.",
            )}
          </p>
          <div className="nd-actions">
            <Link className="nd-btn nd-btn-primary magnetic" href={href(CONTACT)}>
              {tr("Discuss your project")} <span aria-hidden="true">→</span>
            </Link>
            <a className="nd-btn nd-btn-secondary" href="#expertise">
              {tr("Explore my expertise")}
            </a>
          </div>
        </div>
        <div className="nd-hero-side">
          {/* Phones and tablets: a framed photo beside the numbers instead of the cut-out portrait. */}
          <picture>
            <source media="(min-width: 1024px)" srcSet={PIXEL} />
            {/* Phones show it about 170 px wide: 360/560 px copies (13 and 23 KB). It is the phone LCP, so it loads first. */}
            <img
              className="nd-hero-photo-m"
              src="/media/noel-dubai-560.webp"
              srcSet="/media/noel-dubai-360.webp 360w, /media/noel-dubai-560.webp 560w"
              sizes="(min-width: 640px) 280px, 46vw"
              alt="Noel D'Costa"
              width={560}
              height={700}
              fetchPriority="high"
            />
          </picture>
          <aside className="nd-stats nd-reveal-side" aria-label={tr("Experience in numbers")}>
            <div className="nd-stat">
              <span className="k">{tr("Years in enterprise applications")}</span>
              <span className="v">24+</span>
            </div>
            <div className="nd-stat">
              <span className="k">{tr("Government entities moved to Oracle Fusion")}</span>
              <span className="v">84</span>
            </div>
            <div className="nd-stat">
              <span className="k">{tr("SAP, Oracle and Microsoft consultants led")}</span>
              <span className="v">800+</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function HowIHelp({ locale }: L) {
  const { tr, href, en } = tools(locale);
  return (
    <section className="nd-section" aria-labelledby="how-title">
      <div className="nd-container">
        <div className="nd-split">
          <div>
            <h2 id="how-title" className="nd-display nd-h2">
              {tr("Three areas.")} <span className="nd-hl">{tr("One question.")}</span>
            </h2>
            <p className="nd-lede">
              {tr(
                "Enterprise applications, data and AI are connected parts of the same problem. Whichever one brings you here, the question is the same: will this work for your business, and what does it take to get there?",
              )}
            </p>
          </div>
          <div>
            <blockquote className="nd-punchline" lang={en}>
              &ldquo;Noel led the technical delivery of the SAP Finance Transformation project at Etihad &hellip; the
              programme has delivered on time (18 months), on budget and with no major issues.&rdquo;
              <cite>
                Andrew MacFarlane, Managing Partner, Cumbrae Partners LLP. Previously Chief Investment Officer, Etihad
                Airways
              </cite>
            </blockquote>
            <div style={{ marginTop: 24, paddingLeft: 18 }}>
              <Link className="nd-textlink" href={`${href(ABOUT)}#recommendations`}>
                {tr("Read the recommendations")} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="nd-band" style={{ marginTop: 48 }}>
          <span className="star" aria-hidden="true">
            ★
          </span>
          <p>
            {tr(
              "I start with the business process and the numbers behind it, then decide which system, data or AI work earns its place. Not the other way round.",
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

const AREAS = [
  {
    id: "area-apps",
    num: "01",
    color: "var(--area-apps)",
    chip: "SAP · Oracle · Microsoft · ServiceNow",
    name: "Enterprise applications",
    claim: "Choose the right system. Make the implementation work.",
    text: "I help you work through SAP, Oracle, Microsoft and ServiceNow decisions, connect the work to business processes and keep delivery focused on what the business needs.",
    points: [
      "Selection and business case, before you sign with a vendor or an SI",
      "S/4HANA route: greenfield, brownfield or selective",
      "Oversight of an SI-led programme, blueprint to post-go-live",
      "Recovery when a programme has slipped",
    ],
    products: "SAP S/4HANA, RISE and GROW with SAP · Oracle Fusion · Microsoft Dynamics 365 · ServiceNow",
    link: { label: "SAP implementation", href: "/sap-implementation/" },
  },
  {
    id: "area-data",
    num: "02",
    color: "var(--area-data)",
    chip: "Databricks · Microsoft · SAP Analytics Cloud",
    name: "Data & analytics",
    claim: "Bring your data into the decisions that matter.",
    text: "I help you shape the data and reporting work behind better decisions, on Databricks, Microsoft or SAP. The starting point is what people need to know, not how many dashboards to build.",
    points: [
      "Finance and management reporting that holds up at month-end close",
      "Planning and reporting across your ERP and other systems",
      "A data foundation that joins ERP data with the rest of the business, including Databricks",
      "Data quality for migrations, so the new system starts with numbers people trust",
    ],
    products: "Databricks · Microsoft reporting · SAP Analytics Cloud",
    link: { label: "Data and analytics", href: "/erp-ai-services/#data-and-analytics" },
  },
  {
    id: "area-ai",
    num: "03",
    color: "var(--area-ai)",
    chip: "Enterprise · Private · Joule",
    name: "AI",
    claim: "Decide where AI is useful. Then make it work.",
    text: "I help you assess and put AI to use, from enterprise and private AI to SAP Joule and practical applications for small businesses. Start with the task, the information involved and the controls the business needs.",
    points: [
      "Choosing the few use cases worth funding",
      "Private AI, where company information must stay under your control",
      "SAP Joule: what your licence includes and what it needs",
      "AI for small businesses, without an enterprise budget",
    ],
    products: "Most of my AI work: public sector, aviation, defence and retail",
    link: { label: "Enterprise and private AI", href: "/erp-ai-services/#enterprise-ai" },
  },
];

export function Expertise({ locale }: L) {
  const { tr, href } = tools(locale);
  return (
    <section className="nd-section" id="expertise" aria-labelledby="expertise-title">
      <div className="nd-container">
        <SectionHead
          eyebrow={tr("Expertise")}
          id="expertise-title"
          title={tr("Applications, data and AI.")}
          highlight={tr("Connected.")}
          lede={tr("Each area stands on its own. Most of my work touches at least two of them.")}
          link={{ label: tr("All expertise"), href: href(EXPERTISE) }}
        />
        {/* Typographic index: one promise per area and the work behind it,
            separated by hairlines. No chips, numbers, dots or colour bars. */}
        <div className="nd-practice">
          {AREAS.map((a) => (
            <article key={a.id} className="nd-practice-row" aria-labelledby={a.id} data-inview>
              <header>
                <h3 id={a.id} className="nd-in">
                  {tr(a.name)}
                </h3>
                <p className="nd-in" style={{ ["--d" as string]: 1 }}>
                  {tr(a.claim)}
                </p>
                <Link className="nd-practice-link nd-in" style={{ ["--d" as string]: 2 }} href={href(a.link.href)}>
                  {tr(a.link.label)} <span aria-hidden="true">→</span>
                </Link>
              </header>
              <div>
                <ul>
                  {a.points.map((p, i) => (
                    <li key={p} className="nd-in" style={{ ["--d" as string]: i + 2 }}>
                      {tr(p)}
                    </li>
                  ))}
                </ul>
                <p className="nd-practice-note nd-in" style={{ ["--d" as string]: a.points.length + 2 }}>
                  {/* Each product is its own isolated run, so Latin names keep their order in Arabic. */}
                  {tr(a.products)
                    .split(/\s*·\s*/)
                    .map((item, i) => (
                      <span key={item}>
                        {i > 0 && (locale === "ar" ? "، " : ", ")}
                        <bdi>{item}</bdi>
                      </span>
                    ))}
                </p>
              </div>
            </article>
          ))}
        </div>
        <AiProjects locale={locale} />
        <ReferencesMarquee
          references={REFERENCES}
          title={tr("Recommendations")}
          link={{ label: tr("Read the recommendations"), href: `${href(ABOUT)}#recommendations` }}
          pauseLabel={tr("Pause")}
          playLabel={tr("Play")}
          readLabel={tr("Read the full recommendation")}
          closeLabel={tr("Close")}
          quoteLang={locale && locale !== "en" ? "en" : undefined}
        />
      </div>
    </section>
  );
}

// One verbatim passage per recommendation (src/components/article/testimonials/data.ts),
// the passage that says the most on its own. "…" marks words left out.
const PASSAGE: Record<string, number | string> = {
  "Tareq Ashmawy":
    "Noel is … a go-getter with an unprecedented focus on cost optimisation and over-delivering objectives.",
  "Adam Boukadida": 1,
  "Andrew Stotter Brooks": 0,
  "Andrew MacFarlane": 1,
  "Ruchira Dasanayake": 0,
  "Farouq Al Kabarity": 0,
  "Mike Papamichael": 1,
  "Anubhav Agarwal": 1,
  "Takhliq Hanif": 1,
};

const REFERENCES: Reference[] = TESTIMONIALS.map((t) => {
  const pick = PASSAGE[t.name] ?? 0;
  return {
    name: t.name,
    title: t.title,
    avatarUrl: t.avatarUrl,
    quote: typeof pick === "string" ? pick : t.quote[pick],
    full: t.quote,
  };
});

export function ClientWork({ locale }: L) {
  const { tr, href } = tools(locale);
  return (
    <section className="nd-section" id="client-work" aria-labelledby="work-title">
      <div className="nd-container">
        <SectionHead
          eyebrow={tr("Client work")}
          id="work-title"
          title={tr("Programmes")}
          highlight={tr("I've worked on.")}
          lede={tr(
            "Some of this work was as an employee, some as an adviser. I say which, because it changes what I was responsible for.",
          )}
          link={{ label: tr("All case studies"), href: href(CLIENT_WORK) }}
        />
        <div className="nd-table-wrap" tabIndex={0} role="region" aria-label={tr("Programmes table")}>
          <table>
            <caption className="sr-only">{tr("Programmes, Noel's relationship to each, platforms and what changed")}</caption>
            <thead>
              <tr>
                <th scope="col">{tr("Programme")}</th>
                <th scope="col">{tr("My role")}</th>
                <th scope="col">{tr("Platforms")}</th>
                <th scope="col">{tr("What changed")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{tr("National airline")}</th>
                <td>{tr("In-house, IT leadership team")}</td>
                <td>{tr("SAP, Microsoft reporting, RPA")}</td>
                <td>
                  {tr(
                    "Built and ran the SAP centre of excellence. Technical delivery of the SAP finance transformation: 18 months, on time, on budget.",
                  )}
                </td>
              </tr>
              <tr>
                <th scope="row">{tr("Government department")}</th>
                <td>{tr("Adviser")}</td>
                <td>{tr("Oracle E-Business Suite to Oracle Fusion")}</td>
                <td>{tr("Move to Oracle Fusion across 84 entities.")}</td>
              </tr>
              <tr>
                <th scope="row">{tr("Global IT services firm")}</th>
                <td>{tr("Leadership, now CTO")}</td>
                <td>{tr("SAP, Oracle, Microsoft")}</td>
                <td>{tr("Practices across the Middle East and Africa, 800+ consultants.")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export const JOURNEY = [
  { n: "01", t: "Learn", d: "One technique at a time." },
  { n: "02", t: "Build", d: "On your own work." },
  { n: "03", t: "Submit", d: "A working automation." },
  { n: "04", t: "Feedback", d: "What works, what doesn't.", loop: true },
  { n: "05", t: "Fix", d: "Revise until it works.", loop: true },
  { n: "06", t: "Complete", d: "Three accepted." },
  { n: "07", t: "Certify", d: "Your certificate." },
];

/**
 * The programme as one rail: seven stops on a line that draws itself when the
 * section comes into view, with a dashed loop from Fix back to Feedback.
 * Vertical on phones and tablets.
 */
export function JourneyRail({ locale }: L) {
  const { tr } = tools(locale);
  return (
    <ol className="nd-jrail">
      {JOURNEY.map((s, i) => (
        <li
          key={s.n}
          className={`nd-rail-step nd-in${s.loop ? " loop" : ""}${s.n === "04" ? " loop-start" : ""}`}
          style={{ ["--d" as string]: i + 1 }}
        >
          <span className="node" aria-hidden="true">
            {s.n}
          </span>
          {s.n === "04" && <span className="loop-arc" aria-hidden="true" />}
          <h3>{tr(s.t)}</h3>
          <p>{tr(s.d)}</p>
        </li>
      ))}
    </ol>
  );
}

export function AcademyChapter({ locale }: L) {
  const { tr, href } = tools(locale);
  return (
    <section className="nd-section" id="ai-academy" aria-labelledby="academy-title">
      <div className="nd-container">
        <SectionHead
          eyebrow={tr("AI Academy · for consultants")}
          id="academy-title"
          title={tr("Bring AI into")}
          highlight={tr("the way you consult.")}
          lede={tr(
            "I'm building an academy for consultants who want to use AI in their work, automate the repetitive parts and build practical tools. The first programme is AI Automation Practitioner.",
          )}
          link={{ label: tr("See the programme"), href: href(ACADEMY) }}
        />
        <div className="nd-academy" data-inview>
          <div className="nd-academy-goal nd-in">
            {/* The figures restate the sentence beside them, so screen readers read the sentence only. */}
            <div className="nd-academy-figures" aria-hidden="true">
              <span>
                <b>3</b>
                <small>{tr("working automations")}</small>
              </span>
              <i />
              <span>
                <b>30</b>
                <small>{tr("days")}</small>
              </span>
            </div>
            <div className="nd-academy-goal-text">
              <span className="nd-pill">{tr("Launching soon")}</span>
              <p>{tr("The goal: build and deploy three working business automations in 30 days.")}</p>
            </div>
          </div>
          <JourneyRail locale={locale} />
        </div>
      </div>
    </section>
  );
}

const READS = [
  {
    slug: "sap-clean-core-strategy-what-it-means-for-your-business",
    color: "var(--area-apps)",
    label: "Enterprise applications",
    title: "SAP clean core strategy: what it means and how to apply it",
    text: "SAP's five principles, the A to D extension levels and where to start.",
  },
  {
    slug: "sap-analytics-cloud",
    color: "var(--area-data)",
    label: "Data & analytics",
    title: "SAP Analytics Cloud: strategy, pricing, when it works",
    text: "Why SAC only works when the data feeding it is trusted.",
  },
  {
    slug: "ai-governance-in-sap-implementations-compliance-security",
    color: "var(--area-ai)",
    label: "AI",
    title: "AI governance in SAP: compliance, security, accountability",
    text: "Controls to settle before AI touches your ERP.",
  },
];

// Covers on the homepage shelf: 440 px WebP copies (about 15 KB each) of the
// covers in public/books/covers/. Titles are the books' own (English) titles.
const BOOK_COVERS = [
  { slug: "sap-careers-200k-ai-era", title: "SAP Careers in the $200K AI Era", cover: "/books/covers/sap-careers-200k-ai-era-440.webp" },
  { slug: "enterprise-ai-what-works", title: "10 Areas That Burn Costs in Enterprise AI with SAP", cover: "/books/covers/enterprise-ai-what-works-440.webp" },
  { slug: "autonomous-agents-enterprise", title: "Autonomous Agents in the SAP Enterprise", cover: "/books/covers/autonomous-agents-enterprise-440.webp" },
];

export function ArticlesAndTools({ locale }: L) {
  const { tr, href } = tools(locale);
  // On translated homepages, show the translated article title when one is published.
  const reads = READS.map((r) => {
    const path = `/${r.slug}/`;
    const target = href(path);
    const localized = target !== path && locale && locale !== "en" ? getPost(r.slug, locale) : null;
    const title = localized && !localized.isFallback ? localized.frontmatter.h1 || localized.frontmatter.title : tr(r.title);
    return { ...r, href: target, title };
  });
  return (
    <section className="nd-section" id="articles" aria-labelledby="read-title">
      <div className="nd-container">
        <SectionHead
          id="read-title"
          title={tr("Read before")}
          highlight={tr("you spend.")}
          lede={tr("Articles, calculators and books I wrote for people making these decisions.")}
          link={{ label: tr("All articles"), href: href(ARTICLES_INDEX) }}
        />
        <ul className="nd-grid-3">
          {reads.map((r) => (
            <li key={r.slug}>
              <Link className="nd-card banded nd-glow" href={r.href}>
                <span className="nd-card-band" style={{ background: r.color }} aria-hidden="true" />
                <div className="nd-label">{tr(r.label)}</div>
                <h3 style={{ marginTop: 10 }}>{r.title}</h3>
                <p className="text">{tr(r.text)}</p>
              </Link>
            </li>
          ))}
        </ul>
        <div className="nd-books" data-inview>
          <div className="nd-books-copy nd-in">
            <div className="nd-label">{tr("Books")}</div>
            <h3 className="nd-display">{tr("Books by Noel")}</h3>
            <p>{tr("Short, practical books on SAP careers and enterprise AI, published by SAPopedia Press.")}</p>
            <Link className="nd-btn nd-btn-primary" href={href("/books/")}>
              {tr("See the books")} <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ul className="nd-books-shelf">
            {BOOK_COVERS.map((b, i) => (
              <li key={b.slug} className="nd-in" style={{ ["--d" as string]: i + 1 }}>
                <Link href={`${href("/books/")}#book-card-${b.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.cover} alt={b.title} width={440} height={622} loading="lazy" decoding="async" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="nd-tools">
          <span className="nd-label">{tr("Free tools")}</span>
          <Link href={href("/sap-implementation-cost-calculator/")}>{tr("SAP cost calculator")}</Link>
          <Link href={href("/free-data-migration-estimator-sap-oracle-microsoft/")}>{tr("Data migration estimator")}</Link>
          <Link href={href("/sap-s4hana-migration-strategy-greenfield-vs-brownfield/")}>{tr("S/4HANA migration assessment")}</Link>
          <Link href={href("/simplify-your-business-with-erp-ai-tools/")}>
            {tr("All tools")} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function WorkingWithMe({ locale }: L) {
  const { tr } = tools(locale);
  const points = [
    "I work with your leadership team myself. No junior team learning on your budget.",
    "We start with what the business needs to achieve, then decide what technology gets you there.",
    "If your current system needs adjusting rather than replacing, I'll tell you.",
    "I came to ERP through finance and internal audit, so I look at the close, the controls and the numbers first.",
  ];
  return (
    <section className="nd-section" aria-labelledby="why-title">
      <div className="nd-container nd-why">
        <div>
          <h2 id="why-title" className="nd-display nd-h2">
            {tr("What you")} <span className="nd-hl">{tr("can expect.")}</span>
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="nd-why-photo"
            src="/media/noel-hero-640.webp"
            alt="Noel D'Costa"
            width={640}
            height={800}
            loading="lazy"
            decoding="async"
          />
        </div>
        <ol>
          {points.map((p, i) => (
            <li key={p}>
              <span className="n">{String(i + 1).padStart(2, "0")}</span>
              <span className="t">{tr(p)}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function CloseBand({
  locale,
  eyebrow,
  title = "Tell me what",
  highlight = "you're working on.",
  lede = "A 30-minute call. You describe the programme, the decision or the problem. I'll tell you whether I can help, and if I can't, who might.",
}: L & {
  eyebrow?: string;
  title?: string;
  highlight?: string;
  lede?: string;
}) {
  const { tr, href } = tools(locale);
  return (
    <section className="nd-section nd-close" aria-labelledby="cta-title">
      <LoopVideo className="band-video" src="/media/video/close-loop.mp4" poster="/media/video/close-loop-poster.jpg" />
      <div className="band-scrim" aria-hidden="true" />
      <div className="nd-container nd-cta-row">
        <div>
          {eyebrow && <div className="nd-eyebrow">{tr(eyebrow)}</div>}
          <h2 id="cta-title" className="nd-display nd-h2">
            {tr(title)} <span className="nd-hl">{tr(highlight)}</span>
          </h2>
          <p className="nd-lede">{tr(lede)}</p>
        </div>
        <div style={{ flex: "none" }}>
          <Link className="nd-btn nd-btn-primary magnetic" href={href(CONTACT)}>
            {tr("Discuss your project")} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Ecosystem({ locale }: L) {
  const { tr } = tools(locale);
  return (
    <section className="nd-section" id="also-by-noel" aria-labelledby="eco-title">
      <div className="nd-container">
        <SectionHead
          id="eco-title"
          title={tr("Two more places")}
          highlight={tr("for consultants.")}
          lede={tr(
            "If you are a consultant rather than a buyer, these two are for you: one for your CV and career, one for learning and my books.",
          )}
        />
        <ul className="nd-grid-2">
          <li>
            <article className="nd-card banded nd-glow nd-eco" aria-labelledby="eco-erpcv">
              <span className="nd-card-band" style={{ background: "var(--area-apps)" }} aria-hidden="true" />
              <div className="nd-label">ERPCV</div>
              <h3 id="eco-erpcv" className="nd-area-name">
                {tr("Careers for ERP consultants")}
              </h3>
              <p className="text">
                {tr(
                  "Recruiter-ready career documents for SAP, Oracle and Microsoft consultants: CV, project portfolio, interview preparation and LinkedIn outreach. Start with a free CV diagnosis.",
                )}
              </p>
              <ul className="nd-points">
                <li>{tr("Free CV diagnosis")}</li>
                <li>{tr("Career Evidence Pack")}</li>
                <li>{tr("One-to-one career advice with me (paid)")}</li>
              </ul>
              <div className="nd-eco-links">
                <a className="nd-btn nd-btn-primary" href={ERPCV} target="_blank" rel="noopener">
                  {tr("Visit ERPCV")} <span aria-hidden="true">↗</span>
                </a>
                <a className="nd-textlink" href={ERPCV_ADVISORY} target="_blank" rel="noopener">
                  {tr("Book career advice")} <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          </li>
          <li>
            <article className="nd-card banded nd-glow nd-eco" aria-labelledby="eco-sapopedia">
              <span className="nd-card-band" style={{ background: "var(--area-data)" }} aria-hidden="true" />
              <div className="nd-label">SAPopedia</div>
              <h3 id="eco-sapopedia" className="nd-area-name">
                {tr("Career paths, skills and books")}
              </h3>
              <p className="text">
                {tr(
                  "Career navigation and professional skills for enterprise technology people: SAP career paths, courses, The Authority Code, and my books.",
                )}
              </p>
              <ul className="nd-points">
                <li>{tr("SAP career paths")}</li>
                <li>{tr("Professional skills courses")}</li>
                <li>{tr("Books by Noel")}</li>
              </ul>
              <div className="nd-eco-links">
                <a className="nd-btn nd-btn-primary" href={SAPOPEDIA} target="_blank" rel="noopener">
                  {tr("Visit SAPopedia")} <span aria-hidden="true">↗</span>
                </a>
                <a className="nd-textlink" href={SAPOPEDIA_BOOKS} target="_blank" rel="noopener">
                  {tr("See the books")} <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          </li>
        </ul>
      </div>
    </section>
  );
}

export function SignupBand({ locale }: L) {
  const { tr, href } = tools(locale);
  return (
    <section className="nd-section" id="newsletter" aria-labelledby="signup-title">
      <div className="nd-container nd-split">
        <div>
          <h2 id="signup-title" className="nd-display nd-h2">
            {tr("New articles,")} <span className="nd-hl">{tr("first.")}</span>
          </h2>
          <p className="nd-lede">
            {tr(
              "When I publish a new article, video or AI Academy update, you get it by email. No spam, and you can leave any time.",
            )}
          </p>
        </div>
        <SignupForm source="newsletter" copy={signupCopy(locale)} privacyHref={href("/privacy-policy-noeldcosta/")} />
      </div>
    </section>
  );
}
