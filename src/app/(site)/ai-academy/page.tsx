import type { Metadata } from "next";
import Footer from "@/components/Footer";
import LoopVideo from "@/components/site/LoopVideo";
import SignupForm from "@/components/site/SignupForm";
import AcademyChrome from "@/components/academy/AcademyChrome";
import AcademyImage, { ACADEMY_MEDIA, academyImageExists } from "@/components/academy/AcademyImage";
import CountUp from "@/components/academy/CountUp";
import Doodle, { HandNote } from "@/components/doodles/Doodle";
import OutputCards from "@/components/academy/OutputCards";
import WorryCheck from "@/components/academy/WorryCheck";
import { SITE_NAME, SITE_URL, breadcrumbJsonLd } from "@/lib/seo";
import "../../nd-academy.css";

// ─── Launch switch ────────────────────────────────────────────────────────
// "waitlist" (default): every button reads "Join the waitlist" and scrolls to
// the form in section 11. "enrol": every button reads "Enrol now" and goes to
// the checkout link; section 11 shows the button instead of the form.
// startDate, seats, price and cloudTool are empty until they are known. While
// one is empty the page shows neutral wording in its place, never a bracket.
const LAUNCH = {
  mode: "waitlist" as "waitlist" | "enrol",
  waitlist: { label: "Join the waitlist", href: "#waitlist" },
  enrol: { label: "Enrol now", href: "" /* checkout link, added at launch */ },
  startDate: "" as string, // e.g. "3 November 2026"
  seats: "" as string, // e.g. "20"
  price: "" as string, // e.g. "USD 490"
  cloudTool: "" as string, // e.g. "ChatGPT"
  // [WAITLIST FORM ENDPOINT]: the waitlist posts to the site's sign-up handler
  // with source "ai-ready-waitlist" until this is replaced.
  formEndpoint: "/api/subscribe/",
  formSource: "ai-ready-waitlist" as const,
};
const CTA = LAUNCH.mode === "enrol" && LAUNCH.enrol.href ? LAUNCH.enrol : LAUNCH.waitlist;
const SHOW_FORM = CTA === LAUNCH.waitlist;

const STARTS = LAUNCH.startDate ? `Starts ${LAUNCH.startDate}` : "Starting soon";
const HERO_PILLS = [STARTS, LAUNCH.seats ? `${LAUNCH.seats} seats` : "Small cohort"];
const BAR_LINE = `AI Ready in 30 Days · ${STARTS}`;
const PRICE_LINE = LAUNCH.price ? `Founding cohort: ${LAUNCH.price}` : "Founding cohort price goes to the waitlist first.";
const SCARCITY = [
  LAUNCH.seats ? `${LAUNCH.seats} seats.` : "Small founding cohort.",
  LAUNCH.startDate ? `Starts ${LAUNCH.startDate}.` : "Dates go to the waitlist first.",
].join(" ");
const CLOUD_TOOL = LAUNCH.cloudTool || "your cloud AI tool";

const PAGE_URL = `${SITE_URL}/ai-academy/`;
const TITLE = "AI Ready in 30 Days: Taught by a CTO";
const DESCRIPTION =
  "A 30-day programme for professionals with 10+ years of experience. Set up your own AI and use it on your real work. Taught by a CTO.";
const OG_IMAGE = { url: `${SITE_URL}/og-ai-academy.png`, width: 1200, height: 630, alt: "AI Ready in 30 Days. Taught by a CTO." };

export function generateMetadata(): Metadata {
  return {
    title: { absolute: `${TITLE} | ${SITE_NAME}` },
    description: DESCRIPTION,
    alternates: { canonical: PAGE_URL },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: PAGE_URL,
      siteName: SITE_NAME,
      type: "website",
      locale: "en",
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE.url] },
  };
}

const SHOT = { width: 1600, height: 1000 };

const NUMBERS = [
  { value: "30", label: "days, start to finish" },
  { value: "4", label: "pieces of real work, reviewed by me" },
  { value: "3-4", label: "hours a week" },
  { value: "0", label: "lines of code" },
];

const WORRIES = [
  "I tried ChatGPT a few times. Nothing stuck.",
  "I am not sure which tool to use, or what is safe to put into it.",
  "Younger colleagues seem faster with it.",
  "At my level, basic questions are hard to ask.",
];

const DAY_ONE = [
  "A few tries with ChatGPT. Nothing stuck.",
  "Not sure what is safe to share.",
  "Reports, decks and spreadsheets built by hand.",
  "No method. Only tips from other people.",
];

const DAY_THIRTY = [
  { lead: "Your own AI setup.", text: "A private AI on your laptop for confidential work. A cloud tool, configured properly, for the heavy work." },
  { lead: "One clear rule.", text: "You know what goes where, and why." },
  { lead: "Real work, done.", text: "A document, a deck or a spreadsheet, produced with AI in your own format." },
  { lead: "Your first mini app.", text: "Or a recurring task that now runs without you." },
  { lead: "A method.", text: "One you can repeat on any piece of work." },
];

const WEEKS = [
  {
    label: "Week 1",
    title: "Build your setup",
    text: `You install a private AI on your laptop and configure ${CLOUD_TOOL}. You load both with your role, your documents and your templates.`,
    learn: [
      "How to install and run a private AI on your own laptop",
      `How to configure ${CLOUD_TOOL} properly, including the privacy settings`,
      "How to give AI your role, your context and your templates",
      "The rule for what stays on your laptop and what can go to the cloud",
    ],
    finish: "your AI setup, working.",
    bridge: "then it starts writing",
  },
  {
    label: "Week 2",
    title: "It writes",
    text: "Reports, proposals, statements of work. You learn to brief AI the way you would brief a strong junior.",
    learn: [
      "How to brief AI so the first draft is usable",
      "How to turn notes and data into a full report",
      "How to write a proposal or statement of work from a scope discussion",
      "How to get output in your own template and your own voice",
      "How to check AI's work before your name goes on it",
    ],
    finish: "one real document, in your own format.",
    bridge: "then it starts building",
  },
  {
    label: "Week 3",
    title: "It builds",
    text: "PowerPoint and Excel. You turn your own data into a deck and a working spreadsheet.",
    learn: [
      "How to build a deck from a document or an outline",
      "How to produce status and management reports as slides",
      "How to clean data and build formulas in Excel with AI",
      "How to get summaries and charts from raw numbers",
    ],
    finish: "one deck or one spreadsheet you can use on Monday.",
    bridge: "then it runs without you",
  },
  {
    label: "Week 4",
    title: "It runs",
    text: "Mini apps and automation. You build a small tool for a task you repeat, and hand one recurring job to AI.",
    learn: [
      "How to build a mini app without code. A calculator, a tracker, a checklist.",
      "How to automate a recurring task, such as a weekly report",
      "How to decide what to automate next",
      "How to write your own 90-day plan",
    ],
    finish: "one mini app, or one task that runs without you.",
    bridge: "",
  },
];

const OUTPUTS = [
  {
    caption: "Private AI. Answering questions about a document, with the Wi-Fi off.",
    file: "week1-private-ai.webp",
    alt: "A private AI answering a question about a document with Wi-Fi switched off",
    note: "Wi-Fi is off",
  },
  { caption: "A full report, drafted in a house template.", file: "week2-document.webp", alt: "A finished report with headings and a table, drafted with AI" },
  { caption: "A deck and a spreadsheet, built from raw data.", file: "week3-deck-sheet.webp", alt: "A presentation slide and a spreadsheet built from raw data" },
  { caption: "A mini app for a task that used to take an hour.", file: "week4-miniapp.webp", alt: "A small app built without code" },
];

const STEPS = [
  { lead: "Learn.", text: "Short recorded lessons. One topic each." },
  { lead: "Build.", text: "Apply it to a real piece of your own work." },
  { lead: "Submit.", text: "Send in the finished piece." },
  { lead: "Feedback.", text: "I tell you what works and what to fix. You revise until it is accepted." },
];

const INCLUDED = [
  "30 days of short lessons",
  "Four live sessions",
  "My written feedback on each weekly piece of work",
  "Setup guides for Mac and Windows",
  "Sample files, so you never need to use confidential data",
  "A certificate when all four pieces are accepted",
];

const FAQ = [
  { q: "Is this too technical for me?", a: "No. There is no coding. If you can use Word and email, you can do this." },
  { q: "I have never used AI. Is that a problem?", a: "No. Week 1 starts from zero." },
  {
    q: "Is it safe to use with company information?",
    a: "That is the first thing I teach. Confidential work stays on your laptop, on your private AI. You also get sample files, so you can learn without using real data.",
  },
  {
    q: "My company laptop is locked. Can I still join?",
    a: "Yes. You complete the programme on the cloud tool. You can set up the private AI later on a personal laptop.",
  },
  {
    q: "Which tools will I use?",
    a: `A free app for the private AI on your laptop, and ${LAUNCH.cloudTool || "one cloud AI tool"} for the heavy work. I show you how to set up both.`,
  },
  {
    q: "Will the private AI slow my laptop down?",
    a: "Not on a laptop that meets the spec above. I show you which model to pick for your machine.",
  },
  {
    q: "What if I fall behind?",
    a: "Each week has one must-finish piece. Do that one and you are on track. Everything else is optional.",
  },
  { q: "Can my employer pay?", a: "Yes. You get an invoice you can submit." },
];

/** The one action, with a hand-drawn arrow either side pointing in. */
function Cta({ className }: { className?: string }) {
  return (
    <div className={`ar-cta-row${className ? ` ${className}` : ""}`}>
      <Doodle name="arrow-hook" />
      <a className="nd-btn ar-cta" href={CTA.href}>
        {CTA.label}
      </a>
      <Doodle name="arrow-hook" flip />
    </div>
  );
}

export default function AiAcademyPage() {
  const crumbs = breadcrumbJsonLd([
    { name: "Home", url: `${SITE_URL}/` },
    { name: "AI Academy", url: PAGE_URL },
  ]);
  const course = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "AI Ready in 30 Days",
    description: DESCRIPTION,
    url: PAGE_URL,
    provider: { "@type": "Person", name: "Noel D'Costa", url: `${SITE_URL}/` },
    inLanguage: "en",
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(course) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <AcademyChrome line={BAR_LINE} cta={CTA} />
      <main id="main-content" className="nd-main nd-tones ar-page">

        {/* 1. Hero */}
        <section className="ar-hero" id="ar-hero" aria-labelledby="ar-title">
          <Doodle name="scribble" className="ar-edge ar-hero-scribble" />
          <span className="ar-dots ar-hero-dots" aria-hidden="true" />
          <div className="nd-container ar-hero-grid">
            <div className="ar-hero-copy">
              <p className="nd-eyebrow">AI Ready in 30 Days · Taught by a CTO</p>
              <h1 id="ar-title" className="nd-display ar-h1">
                <span className="sm">Get AI ready</span> <span className="xl">in 30 days.</span>{" "}
                <span className="sm">On your own work.</span>
              </h1>
              <p className="ar-sub">
                You set up your own AI. Then you use it to produce your reports, proposals, decks and spreadsheets. I review
                your work every week.
              </p>
              <ul className="ar-strip" aria-label="Programme details">
                {HERO_PILLS.map((pill) => (
                  <li key={pill}>{pill}</li>
                ))}
              </ul>
              <Cta />
            </div>
            <div className="ar-hero-figure">
              <HandNote text="Hi, I'm Noel." className="ar-hero-note">
                <Doodle name="arrow-swoop" />
              </HandNote>
              <div className="ar-hero-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/media/noel-academy.webp" alt="Noel D'Costa" width={1122} height={1402} fetchPriority="high" decoding="async" />
                <LoopVideo className="ar-hero-video" src="/media/video/academy-loop.mp4" poster="/media/noel-academy.webp" />
              </div>
            </div>
          </div>
          <div className="ar-bar">
            <div className="nd-container">
              <p>For professionals with 10+ years behind them.</p>
            </div>
          </div>
        </section>

        {/* 1b. The four numbers */}
        <section data-tone="light" className="nd-section ar-nums" aria-labelledby="ar-nums-title">
          <div className="nd-container">
            <h2 id="ar-nums-title" className="nd-display nd-h2">
              The whole programme, <span className="nd-mark">in four numbers</span>
            </h2>
            <ul className="ar-num-row">
              {NUMBERS.map(({ value, label }) => (
                <li key={label} className="ar-num">
                  <CountUp value={value} /> <span>{label}</span>
                </li>
              ))}
            </ul>
            <HandNote text="None. Really." className="ar-nums-note">
              <Doodle name="arrow-swoop" />
            </HandNote>
          </div>
        </section>

        {/* 2. The quiet worry */}
        <section data-tone="light" className="nd-section ar-worry" aria-labelledby="ar-worry-title">
          <div className="nd-container">
            <div className="ar-narrow">
              <h2 id="ar-worry-title" className="nd-display nd-h2">
                You are good at your job. AI still feels like someone else&apos;s game.
              </h2>
              <p className="ar-worry-intro">
                You have ten or more years behind you. You know your field. Then AI arrived, and now everyone has an opinion on it.
              </p>
            </div>
            <div className="ar-worry-cols">
              <div>
                <h3 className="nd-display ar-sub-head">
                  Sound{" "}
                  <span className="ar-u">
                    familiar?
                    <Doodle name="underline" />
                  </span>
                </h3>
                <p className="ar-tick-intro">Tick what applies to you.</p>
                <WorryCheck items={WORRIES} verdict="Then I built this for you." />
              </div>
              <div className="ar-turn">
                <HandNote text="Read this twice" className="ar-turn-note">
                  <Doodle name="arrow-down" />
                </HandNote>
                <p>This is not about ability. Nobody has shown you a method.</p>
                <p>
                  And your experience is <span className="nd-mark">the one thing AI can&apos;t supply.</span> It needs your judgment to
                  produce good work.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Day 30 */}
        <section data-tone="light" className="nd-section ar-day30" aria-labelledby="ar-day30-title">
          <div className="nd-container">
            <h2 id="ar-day30-title" className="nd-display nd-h2">
              What you have on day 30
            </h2>
            <div className="ar-ba">
              <div className="ar-ba-col ar-ba-before">
                <h3 className="nd-display ar-ba-head">Day 1</h3>
                <ul className="ar-doodle-list">
                  {DAY_ONE.map((item) => (
                    <li key={item}>
                      <Doodle name="cross" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="ar-ba-arrow" aria-hidden="true">
                <span className="nd-hand">30 days</span>
                <Doodle name="arrow-straight" className="ar-wide-only" />
                <Doodle name="arrow-down" className="ar-narrow-only" />
              </div>
              <div className="ar-ba-col ar-ba-after">
                <h3 className="nd-display ar-ba-head">Day 30</h3>
                <ul className="ar-doodle-list">
                  {DAY_THIRTY.map(({ lead, text }) => (
                    <li key={lead}>
                      <Doodle name="tick" />
                      <span>
                        <b>{lead}</b> {text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="ar-day30-shot">
              <AcademyImage file="day30-setup.webp" alt="A private AI and a finished report side by side on a laptop screen" {...SHOT} />
            </div>
            <Cta className="ar-cta-centre" />
          </div>
        </section>

        {/* 3b. One rule. Two lanes. */}
        <section className="nd-section ar-lanes" aria-labelledby="ar-lanes-title">
          <div className="nd-container">
            <h2 id="ar-lanes-title" className="nd-display nd-h2">
              One rule. <span className="nd-mark">Two lanes.</span>
            </h2>
            <p className="ar-lanes-intro">This is the first thing I teach. Every piece of work goes down one of two lanes.</p>
            <div className="ar-diagram">
              <p className="ar-lane-start">Your work</p>
              <ol className="ar-lane-list">
                <li className="ar-lane is-private">
                  <svg className="ar-lane-join" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                    <path d="M0 100 C 55 100, 45 50, 100 50" vectorEffect="non-scaling-stroke" />
                  </svg>
                  <div className="ar-lane-mid">
                    <p className="ar-lane-label">Lane 1 · Confidential</p>
                    <p className="ar-lane-box">Private AI on your laptop</p>
                  </div>
                  <span className="ar-lane-line" aria-hidden="true" />
                  <p className="ar-lane-end">
                    <b>Contracts, client files, numbers.</b> <span>Nothing leaves your machine.</span>
                  </p>
                </li>
                <li className="ar-lane is-cloud">
                  <svg className="ar-lane-join" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                    <path d="M0 0 C 55 0, 45 50, 100 50" vectorEffect="non-scaling-stroke" />
                  </svg>
                  <div className="ar-lane-mid">
                    <p className="ar-lane-label">Lane 2 · Everything else</p>
                    <p className="ar-lane-box">{LAUNCH.cloudTool || "Cloud tool"}, set up properly</p>
                  </div>
                  <span className="ar-lane-line" aria-hidden="true" />
                  <p className="ar-lane-end">
                    <b>Reports, decks, spreadsheets.</b> <span>The heavy lifting.</span>
                  </p>
                </li>
              </ol>
            </div>
            <HandNote text="You decide. I show you how." className="ar-lanes-note" />
          </div>
        </section>

        {/* 4. The four weeks */}
        <section data-tone="light" className="nd-section ar-weeks" aria-labelledby="ar-weeks-title">
          <div className="nd-container ar-narrow-wide">
            <h2 id="ar-weeks-title" className="nd-display nd-h2">
              Four weeks. <span className="nd-mark">One result</span> each week.
            </h2>
            <ol className="ar-timeline">
              {WEEKS.map(({ label, title, text, learn, finish, bridge }, i) => (
                <li key={label} className="ar-week">
                  <span className="ar-week-n" aria-hidden="true">
                    {`0${i + 1}`}
                  </span>
                  <div className="ar-week-body">
                    <p className="ar-week-label">{label}</p>
                    <h3 className="ar-week-title">{title}</h3>
                    <p>{text}</p>
                    <p className="ar-learn-head">You learn:</p>
                    <ul className="ar-learn">
                      {learn.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p className="ar-finish">
                      <Doodle name="tick" />
                      <span>
                        <span className="k">You finish with:</span> <span className="nd-mark">{finish}</span>
                      </span>
                    </p>
                  </div>
                  {bridge && (
                    <HandNote text={bridge} className="ar-bridge">
                      <Doodle name="arrow-down" />
                    </HandNote>
                  )}
                </li>
              ))}
            </ol>
            <p className="nd-display ar-weeks-close">
              <Doodle name="burst" />
              Day 30. You are AI ready.
            </p>
          </div>
        </section>

        {/* 5. What you will have working */}
        <section data-tone="light" className="nd-section ar-outputs-section" aria-labelledby="ar-outputs-title">
          <div className="nd-container">
            <h2 id="ar-outputs-title" className="nd-display nd-h2">
              Real outputs. Not quiz answers.
            </h2>
            <p className="nd-lede">These are examples from my own setup. Yours will be built on your work.</p>
            <OutputCards
              {...SHOT}
              cards={OUTPUTS.map((o) => ({ ...o, src: academyImageExists(o.file) ? `${ACADEMY_MEDIA}/${o.file}` : undefined }))}
            />
          </div>
        </section>

        {/* 6. How it runs */}
        <section className="nd-section ar-how" aria-labelledby="ar-how-title">
          <div className="nd-container">
            <h2 id="ar-how-title" className="nd-display nd-h2">
              How it runs
            </h2>
            <ol className="ar-steps">
              {STEPS.map(({ lead, text }, i) => (
                <li key={lead} className="ar-step">
                  <span className="ar-step-n" aria-hidden="true">
                    {`0${i + 1}`}
                  </span>
                  <p>
                    <b>{lead}</b> {text}
                  </p>
                  {i < STEPS.length - 1 ? (
                    <span className="ar-step-arrow" aria-hidden="true">
                      <Doodle name="arrow-straight" className="ar-wide-only" />
                      <Doodle name="arrow-down" className="ar-narrow-only" />
                    </span>
                  ) : (
                    <HandNote text="This is where it clicks" className="ar-step-note" />
                  )}
                </li>
              ))}
            </ol>
            <div className="ar-how-detail">
              <ul className="ar-doodle-list">
                {["One live session every week.", "3 to 4 hours a week.", "A small cohort, so every submission gets a proper review.", "Setup guides for Mac and Windows."].map(
                  (item) => (
                    <li key={item}>
                      <Doodle name="tick" />
                      <span>{item}</span>
                    </li>
                  ),
                )}
              </ul>
              <AcademyImage file="feedback-sample.webp" alt="Written feedback on a student submission" {...SHOT} />
            </div>
          </div>
        </section>

        {/* 7. For you / not for you */}
        <section data-tone="light" className="nd-section ar-fit" aria-labelledby="ar-fit-title">
          <div className="nd-container">
            <h2 id="ar-fit-title" className="nd-display nd-h2">
              Is this for you?
            </h2>
            <div className="ar-fit-cols">
              <div>
                <h3 className="ar-fit-head">For you if:</h3>
                <ul className="ar-doodle-list ar-fit-list">
                  <li>
                    <Doodle name="tick" />
                    <span>
                      You have{" "}
                      <span className="ar-circled">
                        10 or more years
                        <Doodle name="circle" />
                      </span>{" "}
                      of professional experience.
                    </span>
                  </li>
                  {[
                    "You have used AI a little, or not at all.",
                    "You want to use it on real work, not collect theory.",
                    "You can give it 3 to 4 hours a week for 30 days.",
                  ].map((item) => (
                    <li key={item}>
                      <Doodle name="tick" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="ar-fit-head">Not for you if:</h3>
                <ul className="ar-doodle-list ar-fit-list is-no">
                  {[
                    "You already use AI every day and build your own tools.",
                    "You want a certificate without doing the work.",
                    "You are looking for a coding course.",
                  ].map((item) => (
                    <li key={item}>
                      <Doodle name="cross" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <h3 className="ar-fit-head ar-laptop-head">Your laptop</h3>
            <div className="ar-table-wrap">
              <table className="ar-table">
                <thead>
                  <tr>
                    <th scope="col">Your laptop</th>
                    <th scope="col">What you get</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Mac with an Apple chip and 16GB of memory or more</td>
                    <td>The full programme, private AI included</td>
                  </tr>
                  <tr>
                    <td>Windows with an NVIDIA graphics card and 16GB of memory or more</td>
                    <td>The full programme, private AI included</td>
                  </tr>
                  <tr>
                    <td>Older or company-locked laptop</td>
                    <td>The full programme on the cloud tool. The private AI lesson stays yours for later.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="ar-note">You also need about 20GB of free disk space for the private AI.</p>
          </div>
        </section>

        {/* 8. Why learn it from a CTO */}
        <section className="nd-section ar-why" aria-labelledby="ar-why-title">
          <Doodle name="scribble" className="ar-edge ar-why-scribble" />
          <div className="nd-container ar-why-grid">
            <div className="ar-why-photo">
              <AcademyImage file="noel-cutout.png" alt="Noel D'Costa" width={1200} height={1500} />
              <HandNote text="25 years of this" className="ar-why-note">
                <Doodle name="arrow-swoop" />
              </HandNote>
            </div>
            <div className="ar-why-copy">
              <h2 id="ar-why-title" className="nd-display nd-h2">
                Why learn it from a CTO
              </h2>
              <p>
                I&apos;m a chief technology officer. I have spent 25 years delivering enterprise technology and leading consulting
                teams.
              </p>
              <p>My job is to decide how AI gets used inside real organisations.</p>
              <p className="nd-display ar-stack">
                <span>
                  <span className="nd-mark">What is safe.</span>
                </span>{" "}
                <span>
                  <span className="nd-mark">What is hype.</span>
                </span>{" "}
                <span>
                  <span className="nd-mark">What works.</span>
                </span>
              </p>
              <p>I use everything in this programme in my own work. Every week. That is what I will show you.</p>
            </div>
          </div>
        </section>

        {/* 9. What is included */}
        <section data-tone="light" className="nd-section ar-offer" aria-labelledby="ar-offer-title">
          <div className="nd-container">
            <div className="ar-offer-card">
              <p className="ar-stamp" aria-hidden="true">
                <span>My guarantee: I review until all four are accepted.</span>
              </p>
              <h2 id="ar-offer-title" className="nd-display nd-h2">
                What is included
              </h2>
              <ul className="ar-doodle-list ar-included">
                {INCLUDED.map((item) => (
                  <li key={item}>
                    <Doodle name="tick" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="ar-price">{PRICE_LINE}</p>
              <div className="ar-guarantee">
                <h3>My guarantee</h3>
                <p>Do the work each week and I keep reviewing until all four pieces are accepted.</p>
              </div>
              <p className="ar-scarcity">{SCARCITY}</p>
              <Cta className="ar-cta-centre" />
            </div>
          </div>
        </section>

        {/* 10. Questions */}
        <section data-tone="light" className="nd-section ar-faq" aria-labelledby="ar-faq-title">
          <div className="nd-container ar-narrow">
            <h2 id="ar-faq-title" className="nd-display nd-h2">
              <span className="ar-u">
                Questions
                <Doodle name="underline" />
              </span>
            </h2>
            <div className="ar-accordion">
              {FAQ.map(({ q, a }, i) => (
                <details key={q} open={i === 0}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 11. Final call and waitlist form */}
        <section className="nd-section ar-final" id="waitlist" aria-labelledby="ar-final-title">
          <Doodle name="scribble" className="ar-edge ar-final-scribble" />
          <div className="nd-container ar-final-inner">
            <h2 id="ar-final-title" className="nd-display nd-h2">
              Thirty days from now, <span className="nd-mark">you are AI ready.</span>
            </h2>
            <p className="ar-final-line">{SCARCITY}</p>
            {SHOW_FORM ? (
              <>
                <SignupForm
                  source={LAUNCH.formSource}
                  endpoint={LAUNCH.formEndpoint}
                  serverErrors={false}
                  buttonBefore={<Doodle name="arrow-hook" />}
                  buttonAfter={<Doodle name="arrow-hook" flip />}
                  copy={{
                    name: "Your name",
                    email: "Work email",
                    consent: "I agree to receive emails from Noel D'Costa about AI Ready in 30 Days. I can unsubscribe at any time.",
                    privacy: "Privacy",
                    sending: "Sending…",
                    done: "You are on the list. I will email you when enrolment opens.",
                    network: "That did not go through. Please check your email address and try again.",
                    generic: "That did not go through. Please check your email address and try again.",
                    button: LAUNCH.waitlist.label,
                  }}
                />
                <HandNote text="Takes 20 seconds." className="ar-final-hand" />
                <p className="ar-final-note">I will email you when enrolment opens. Nothing else.</p>
              </>
            ) : (
              <Cta className="ar-cta-centre" />
            )}
          </div>
        </section>
      </main>
      <Footer signup={false} contact={false} />
    </>
  );
}
