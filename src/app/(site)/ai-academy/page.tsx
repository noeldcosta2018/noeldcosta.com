import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageBanner from "@/components/site/PageBanner";
import SideRail from "@/components/site/SideRail";
import StepNav from "@/components/site/StepNav";
import { SITE_URL, breadcrumbJsonLd, buildArchiveMetadata } from "@/lib/seo";
import { CONTACT } from "@/data/site-menu";

const PAGE_URL = `${SITE_URL}/ai-academy/`;
const TITLE = "AI Academy: AI Automation Practitioner | Noel D'Costa";
const DESCRIPTION =
  "An AI academy for consultants. The first programme, AI Automation Practitioner: build and deploy three working business automations in 30 days.";

export function generateMetadata(): Metadata {
  return buildArchiveMetadata({ title: TITLE, description: DESCRIPTION, canonical: PAGE_URL });
}

const STEPS = [
  { id: "who", label: "Who it is for" },
  { id: "finish", label: "The finish line" },
  { id: "build", label: "What you would build" },
  { id: "how", label: "How it works" },
  { id: "why", label: "Why I'm running it" },
  { id: "status", label: "Launching soon" },
];

function Meta({ n }: { n: number }) {
  return (
    <div className="nd-step-meta">
      <span>AI Automation Practitioner</span>
      <span aria-hidden="true">·</span>
      <span className="n">{String(n).padStart(2, "0")}</span>
    </div>
  );
}

function stepNav(i: number) {
  const prev = STEPS[i - 1];
  const next = STEPS[i + 1];
  return {
    prev: prev ? { href: `#${prev.id}`, label: prev.label } : undefined,
    next: next ? { href: `#${next.id}`, label: next.label } : { href: "/#articles", label: "Articles & tools" },
    label: `Step navigation, ${STEPS[i].label.toLowerCase()}`,
  };
}

function Card({ num, title, text, loop }: { num: string; title: string; text: string; loop?: boolean }) {
  return (
    <div className="nd-card nd-glow" style={loop ? { borderColor: "rgba(var(--accent-rgb), 0.55)" } : undefined}>
      <span className="num">{num}</span>
      <h3 style={{ marginTop: 8 }}>{title}</h3>
      <p className="text">{text}</p>
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
    name: "AI Automation Practitioner",
    description:
      "Build and deploy three working business automations in 30 days. Learn, build, submit, feedback, fix, complete, certify.",
    url: PAGE_URL,
    provider: { "@type": "Person", name: "Noel D'Costa", url: `${SITE_URL}/` },
    inLanguage: "en",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(course) }} />
      <Nav />
      <main id="main-content" className="nd-main">
        <PageBanner
          label="AI Academy"
          crumbs={[{ label: "AI Academy" }, { label: "For consultants" }]}
          title="Bring AI into"
          highlight="the way you consult."
          lede="I am developing an academy for consultants who want to use AI, automate repetitive work and build practical tools for their work. The focus is on applying what you learn, with a clear piece of work to complete."
          video={{ src: "/media/video/academy-loop.mp4", poster: "/media/video/academy-loop-poster.jpg" }}
          portrait={{ src: "/media/noel-academy.webp", width: 1122, height: 1402 }}
        >
          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            <span className="nd-pill">Launching soon</span>
            <span style={{ color: "var(--ink-soft)", fontSize: 14 }}>First programme: AI Automation Practitioner</span>
          </div>
        </PageBanner>

        <div className="nd-frame">
          <SideRail back={{ label: "Home", href: "/" }} label="AI Academy" current="AI Automation Practitioner" items={STEPS} />
          <div className="nd-steps-main">
            <section className="nd-step" id="who" aria-labelledby="who-title">
              <Meta n={1} />
              <h2 id="who-title" className="nd-display">
                Who it is for
              </h2>
              <div className="content nd-prose">
                <p>
                  Consultants who already deliver for clients and want AI to take on part of the work. SAP, Oracle and
                  Microsoft consultants, functional or technical. Finance and process consultants. Independent
                  consultants who run their own delivery.
                </p>
                <p>
                  It is not a course to collect a certificate without building anything. You finish by showing working
                  automations.
                </p>
              </div>
              <StepNav {...stepNav(0)} />
            </section>

            <section className="nd-step" id="finish" aria-labelledby="finish-title">
              <Meta n={2} />
              <h2 id="finish-title" className="nd-display">
                The finish line
              </h2>
              <div className="content">
                <div className="nd-band">
                  <span className="star" aria-hidden="true">
                    ★
                  </span>
                  <p>Build and deploy three working business automations in 30 days.</p>
                </div>
                <div className="nd-callout" style={{ marginTop: 16 }}>
                  The programme is built around that goal. <b>The pace is yours:</b> what you build depends on the time
                  you commit and the work you bring.
                </div>
              </div>
              <StepNav {...stepNav(1)} />
            </section>

            <section className="nd-step" id="build" aria-labelledby="build-title">
              <Meta n={3} />
              <h2 id="build-title" className="nd-display">
                What you would build
              </h2>
              <div className="content">
                <p className="nd-prose">A taste of the work you will ship. Each one is a real automation you can use on Monday.</p>
                <ul className="nd-grid-2" style={{ marginTop: 24 }}>
                  <li>
                    <Card num="01" title="Workshop notes to requirements" text="Turn raw workshop notes into a structured requirements log." />
                  </li>
                  <li>
                    <Card num="02" title="Specification first draft" text="Draft a functional specification from a process description, then check it against a template." />
                  </li>
                  <li>
                    <Card num="03" title="Data comparison" text="Compare two data extracts and flag the differences for review." />
                  </li>
                  <li>
                    <Card num="04" title="Test scripts" text="Generate test scripts from a process flow." />
                  </li>
                </ul>
              </div>
              <StepNav {...stepNav(2)} />
            </section>

            <section className="nd-step" id="how" aria-labelledby="how-title">
              <Meta n={4} />
              <h2 id="how-title" className="nd-display">
                How it works
              </h2>
              <div className="content">
                <ol className="nd-grid-2" style={{ marginTop: 0 }}>
                  <li>
                    <Card num="01" title="Learn" text="Short lessons on one technique at a time." />
                  </li>
                  <li>
                    <Card num="02" title="Build" text="Apply it to a real piece of your own work." />
                  </li>
                  <li>
                    <Card num="03" title="Submit" text="Hand in the working automation, not a quiz answer." />
                  </li>
                  <li>
                    <Card num="04 · 05" title="Feedback and fix" text="Specific review of what works and what doesn't. Revise and resubmit until it works." loop />
                  </li>
                  <li>
                    <Card num="06" title="Complete" text="Three automations accepted." />
                  </li>
                  <li>
                    <Card num="07" title="Certify" text="Earn the AI Automation Practitioner certificate for three accepted automations." />
                  </li>
                </ol>
              </div>
              <StepNav {...stepNav(3)} />
            </section>

            <section className="nd-step" id="why" aria-labelledby="why-title">
              <Meta n={5} />
              <h2 id="why-title" className="nd-display">
                Why I&apos;m running it
              </h2>
              <div className="content nd-prose">
                <p>
                  I&apos;m a chief technology officer, I have spent 25 years in ERP delivery, and I have
                  built and led consulting teams across SAP, Oracle and Microsoft.
                </p>
                <p>
                  The consultants who will do well over the next few years are the ones who use AI on their own
                  delivery work first. That is what this programme is for.
                </p>
              </div>
              <StepNav {...stepNav(4)} />
            </section>

            <section className="nd-step" id="status" aria-labelledby="status-title">
              <Meta n={6} />
              <h2 id="status-title" className="nd-display">
                Launching soon
              </h2>
              <div className="content">
                <div className="nd-band">
                  <span className="star" aria-hidden="true">
                    ★
                  </span>
                  <p>
                    The first cohort of AI Automation Practitioner opens soon. Stay tuned for the launch date, the
                    curriculum and enrolment.
                  </p>
                </div>
                <ul className="nd-grid-2" style={{ marginTop: 16 }}>
                  <li>
                    <Card num="Curriculum" title="Published at launch" text="Lessons, projects and the review process, in full." />
                  </li>
                  <li>
                    <Card num="Enrolment" title="Opening soon" text="The first cohort is deliberately small, so every submission gets real feedback." />
                  </li>
                </ul>
                <div className="nd-callout" style={{ marginTop: 16 }}>
                  <b>Want to hear first?</b>{" "}
                  <Link className="nd-textlink" href={CONTACT}>
                    Get in touch <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
              <StepNav {...stepNav(5)} />
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
