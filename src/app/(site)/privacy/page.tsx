import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageBanner from "@/components/site/PageBanner";
import SideRail from "@/components/site/SideRail";
import { buildStaticPageMetadata, SITE_URL } from "@/lib/seo";
import { ABOUT, CONTACT } from "@/data/site-menu";

/**
 * /privacy: plain-English privacy notice for /books leads and the rest
 * of the site. Linked from the LeadCaptureModal consent checkboxes.
 * Banner, numbered side rail and a single reading column.
 */

export async function generateMetadata(): Promise<Metadata> {
  const url = `${SITE_URL}/privacy/`;
  const title = "Privacy | Noel D'Costa";
  const description =
    "How noeldcosta.com handles your name, email, and request data. Plain English, written by Noel.";
  return buildStaticPageMetadata({
    title,
    description,
    canonical: url,
    robots: "index, follow",
  });
}

const UPDATED = "2026-05-23";
const UPDATED_LABEL = new Date(UPDATED).toLocaleDateString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const SECTIONS = [
  { id: "what-i-collect", label: "What I collect" },
  { id: "why-i-collect-it", label: "Why I collect it" },
  { id: "how-long-it-stays", label: "How long it stays" },
  { id: "your-rights", label: "Your rights" },
  { id: "cookies-and-analytics", label: "Cookies and analytics" },
];

export default async function PrivacyPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="nd-main">
        <PageBanner
          label="Privacy"
          compact
          crumbs={[{ label: "About", href: ABOUT }, { label: "Privacy" }]}
          title="Privacy"
          lede="This is a personal site. I run it. I read the leads. There is no marketing team behind the curtain. The note below covers what I collect, why, and what you can ask me to do about it."
        >
          <div className="nda-banner-meta">
            <span className="nd-pill">Plain English</span>
            <span>
              Updated <time dateTime={UPDATED}>{UPDATED_LABEL}</time>
            </span>
          </div>
        </PageBanner>

        <div className="nd-frame">
          <SideRail
            back={{ label: "About", href: ABOUT }}
            label="Privacy"
            items={SECTIONS}
            footer={
              <div className="nd-rail-cta">
                <p>Questions about your data? Email me and I will action it.</p>
                <a className="nd-btn nd-btn-secondary" href="mailto:noel@noeldcosta.com" style={{ padding: "9px 14px", fontSize: 13 }}>
                  Email Noel
                </a>
              </div>
            }
          />
          <div className="nd-article-body">
            <div className="nda-legal">
              <h2 id="what-i-collect">What I collect</h2>
              <p>
                When you request a book, I store your name, your email, the title you asked for, the time you asked,
                your IP address, and your browser user agent. The IP and user agent are kept for basic abuse
                prevention. That is the lot.
              </p>

              <h2 id="why-i-collect-it">Why I collect it</h2>
              <p>
                The name and email are used to deliver the book you asked for and to answer if you reply. If you
                ticked the marketing checkbox, I will also send the occasional email when new SAP, ERP, or AI
                resources are published. If you did not tick it, I will not. The legal basis under GDPR is consent
                for marketing and legitimate interest plus contract performance for delivery of the requested book.
              </p>

              <h2 id="how-long-it-stays">How long it stays</h2>
              <p>
                Records are kept until you ask me to delete them, or until I archive a cohort I no longer need. Email
                me and I will remove your row the same day, usually inside an hour during working hours in Dubai.
              </p>

              <h2 id="your-rights">Your rights</h2>
              <p>
                Under GDPR and similar regimes you can ask for access to your data, correction of anything wrong,
                erasure, or a copy you can take elsewhere (portability). You can also withdraw consent at any time.
                Reach me at <a href="mailto:noel@noeldcosta.com">noel@noeldcosta.com</a> and I will action it.
              </p>

              <h2 id="cookies-and-analytics">Cookies and analytics</h2>
              <p>
                The site only stores what it needs to work, in your own browser: your light or dark theme, your
                language, your cookie choice and, if you use it, the list of articles you save for later. The admin
                pages use a sign-in cookie for me. There is no third-party advertising. Analytics cookies are only
                set if you accept them in the cookie bar; none are in use yet, and any added later will be listed
                here before they go live. You can change your choice at any time under Cookie settings at the
                bottom of every page.
              </p>

              <p className="foot">
                See also: <Link href="/terms/">Terms of use</Link> · <Link href={CONTACT}>Contact</Link> · Updated{" "}
                <time dateTime={UPDATED}>{UPDATED_LABEL}</time>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
