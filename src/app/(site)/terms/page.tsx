import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageBanner from "@/components/site/PageBanner";
import SideRail from "@/components/site/SideRail";
import { buildStaticPageMetadata, SITE_URL } from "@/lib/seo";
import { ABOUT, CONTACT } from "@/data/site-menu";

/**
 * /terms: plain-English terms of use for the site and its free / paid
 * book downloads. Linked from the LeadCaptureModal consent checkboxes.
 * Banner, numbered side rail and a single reading column.
 */

export async function generateMetadata(): Promise<Metadata> {
  const url = `${SITE_URL}/terms/`;
  const title = "Terms of use | Noel D'Costa";
  const description =
    "Plain-English terms covering use of noeldcosta.com, the books, and the site's content.";
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
  { id: "not-professional-advice", label: "Informational, not professional advice" },
  { id: "books-downloads-refunds", label: "Books, downloads, and refunds" },
  { id: "no-warranty", label: "No warranty" },
  { id: "copyright", label: "Copyright" },
  { id: "law-and-contact", label: "Applicable law and contact" },
];

export default async function TermsPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="nd-main">
        <PageBanner
          label="Terms of use"
          compact
          crumbs={[{ label: "About", href: ABOUT }, { label: "Terms" }]}
          title="Terms of use"
          lede="Short version: this is my personal site. The books and posts are my opinion, drawn from real programmes. Useful as perspective, not as a substitute for advice on your specific situation."
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
            label="Terms"
            items={SECTIONS}
            footer={
              <div className="nd-rail-cta">
                <p>Want my involvement on a specific programme? Let&apos;s talk it through.</p>
                <Link className="nd-btn nd-btn-primary" href={CONTACT} style={{ padding: "9px 14px", fontSize: 13 }}>
                  Discuss your project <span aria-hidden="true">→</span>
                </Link>
              </div>
            }
          />
          <div className="nd-article-body">
            <div className="nda-legal">
              <h2 id="not-professional-advice">Informational, not professional advice</h2>
              <p>
                The content here is published for general information. Nothing on the site or in the books is
                professional, legal, tax, accounting, audit, or engineering advice. Decisions on your ERP, AI, or
                finance estate should go through your own advisors who know your facts. If you want my involvement on
                a specific programme, book a call.
              </p>

              <h2 id="books-downloads-refunds">Books, downloads, and refunds</h2>
              <p>
                Free books are exactly that. Paid books are sold as a one-time digital download for personal use. You
                can read them on your devices, print a copy for yourself, and share passages with attribution. Bulk
                redistribution, reselling, or reposting the PDF is not permitted. Refunds on paid books are available
                within 14 days of purchase. Email me.
              </p>

              <h2 id="no-warranty">No warranty</h2>
              <p>
                The site and the books are provided as-is. I make no warranty that any approach described will fit
                your context. To the maximum extent allowed by law, I am not liable for indirect or consequential loss
                arising from your use of the content.
              </p>

              <h2 id="copyright">Copyright</h2>
              <p>
                All copy, code samples, diagrams, and book content on this site are copyright Noel D&apos;Costa unless
                stated otherwise. Quote with attribution and a link back. Do not republish wholesale.
              </p>

              <h2 id="law-and-contact">Applicable law and contact</h2>
              <p>
                These terms are governed by the laws of the United Arab Emirates, where I am based. Questions, takedown
                notices, or issues with a purchase, email me at{" "}
                <a href="mailto:noel@noeldcosta.com">noel@noeldcosta.com</a>.
              </p>

              <p className="foot">
                See also: <Link href="/privacy/">Privacy</Link> · <Link href={CONTACT}>Contact</Link> · Updated{" "}
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
