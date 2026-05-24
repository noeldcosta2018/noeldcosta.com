import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

/**
 * /terms — plain-English terms of use for the site and its free / paid
 * book downloads. Linked from the LeadCaptureModal consent checkboxes.
 */

export async function generateMetadata(): Promise<Metadata> {
  const url = `${SITE_URL}/terms/`;
  const title = "Terms of use | Noel D'Costa";
  const description =
    "Plain-English terms covering use of noeldcosta.com, the books, and the site's content.";
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: "index, follow",
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en",
    },
  };
}

const UPDATED = "2026-05-23";

export default async function TermsPage() {
  return (
    <>
      <Nav />

      <section
        className="bg-bone pt-28 pb-16"
        style={{ padding: "7rem clamp(1.5rem,5vw,4rem) 4rem" }}
      >
        <div className="max-w-[760px] mx-auto">
          <p className="font-mono text-[0.72rem] tracking-[2px] uppercase text-eyebrow mb-3">
            [ Site · Terms ]
          </p>
          <h1
            className="font-display font-black tracking-[-0.04em] leading-[1.05] text-corbeau mb-6"
            style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
          >
            Terms of use
          </h1>

          <div className="text-night text-[1rem] leading-[1.7] flex flex-col gap-5">
            <p>
              Short version: this is my personal site. The books and posts
              are my opinion, drawn from real programmes. Useful as
              perspective, not as a substitute for advice on your specific
              situation.
            </p>

            <h2 className="font-display font-bold text-corbeau text-[1.25rem] mt-3">
              Informational, not professional advice
            </h2>
            <p>
              The content here is published for general information.
              Nothing on the site or in the books is professional, legal,
              tax, accounting, audit, or engineering advice. Decisions on
              your ERP, AI, or finance estate should go through your own
              advisors who know your facts. If you want my involvement on a
              specific programme, book a call.
            </p>

            <h2 className="font-display font-bold text-corbeau text-[1.25rem] mt-3">
              Books, downloads, and refunds
            </h2>
            <p>
              Free books are exactly that. Paid books are sold as a
              one-time digital download for personal use. You can read them
              on your devices, print a copy for yourself, and share
              passages with attribution. Bulk redistribution, reselling, or
              reposting the PDF is not permitted. Refunds on paid books
              are available within 14 days of purchase. Email me.
            </p>

            <h2 className="font-display font-bold text-corbeau text-[1.25rem] mt-3">
              No warranty
            </h2>
            <p>
              The site and the books are provided as-is. I make no
              warranty that any approach described will fit your context.
              To the maximum extent allowed by law, I am not liable for
              indirect or consequential loss arising from your use of the
              content.
            </p>

            <h2 className="font-display font-bold text-corbeau text-[1.25rem] mt-3">
              Copyright
            </h2>
            <p>
              All copy, code samples, diagrams, and book content on this
              site are copyright Noel D&apos;Costa unless stated otherwise.
              Quote with attribution and a link back. Do not republish
              wholesale.
            </p>

            <h2 className="font-display font-bold text-corbeau text-[1.25rem] mt-3">
              Applicable law and contact
            </h2>
            <p>
              These terms are governed by the laws of the United Arab
              Emirates, where I am based. Questions, takedown notices, or
              issues with a purchase, email me at{" "}
              <a
                href="mailto:noel@noeldcosta.com"
                className="text-papaya underline hover:no-underline"
              >
                noel@noeldcosta.com
              </a>
              .
            </p>

            <p className="font-mono text-[0.78rem] text-night/70 mt-6 border-t border-corbeau/[0.08] pt-4">
              See also:{" "}
              <Link
                href="/privacy"
                className="text-papaya underline hover:no-underline"
              >
                Privacy
              </Link>{" "}
              · Updated: {UPDATED}
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
