import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageBanner from "@/components/site/PageBanner";
import CallIntake from "@/components/site/CallIntake";
import { buildStaticPageMetadata, SITE_URL } from "@/lib/seo";
import { CONTACT } from "@/data/site-menu";

/**
 * /book-a-call/: the one place a call with Noel is booked (Noel, 16 November 2026).
 * Visitors say whether the call is for business consulting (free) or career advice
 * (paid on erpcv.com) and write the intent of the meeting before any calendar appears.
 * A utility page, so it is kept out of search.
 */

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata({
    title: "Book a call | Noel D'Costa",
    description: "Book a 30-minute call with Noel D'Costa. Business consulting calls are free; career advice calls are paid and booked on erpcv.com.",
    canonical: `${SITE_URL}/book-a-call/`,
    robots: "noindex, follow",
  });
}

export default function BookACallPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="nd-main">
        <PageBanner
          label="Book a call"
          compact
          crumbs={[{ label: "Contact", href: CONTACT }, { label: "Book a call" }]}
          title="Book a call"
          lede="Tell me what the call is for and what you want from it. Business consulting calls are free. Career advice is a paid call, booked on erpcv.com."
        />
        <div className="nd-frame">
          <div className="nd-article-body">
            <CallIntake />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
