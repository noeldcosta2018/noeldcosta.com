import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageBanner from "@/components/site/PageBanner";
import { ACADEMY, ARTICLES_INDEX, CONTACT, EXPERTISE } from "@/data/site-menu";

export default function NotFoundView() {
  return (
    <>
      <Nav />
      <main id="main-content" className="nd-main">
        <PageBanner
          label="Page not found"
          crumbs={[{ label: "404" }]}
          title="This page has"
          highlight="moved on."
          lede="The address may have changed, or the page is being refreshed. Everything I have written is in the library, and the rest of the site is one click away."
          video={{ src: "/media/video/close-loop.mp4", poster: "/media/video/close-loop-poster.jpg" }}
        >
          <div className="nd-actions">
            <Link className="nd-btn nd-btn-primary magnetic" href={ARTICLES_INDEX}>
              Browse the library <span aria-hidden="true">→</span>
            </Link>
            <Link className="nd-btn nd-btn-secondary" href="/">
              Back to home
            </Link>
          </div>
        </PageBanner>
        <section className="nd-section">
          <div className="nd-container">
            <div className="nd-tools" style={{ marginTop: 0 }}>
              <span className="nd-label">Popular</span>
              <Link href={EXPERTISE}>Expertise</Link>
              <Link href="/case-studies/">Client work</Link>
              <Link href={ACADEMY}>AI Academy</Link>
              <Link href="/sap-implementation-cost-calculator/">SAP cost calculator</Link>
              <Link href={CONTACT}>
                Discuss your project <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
