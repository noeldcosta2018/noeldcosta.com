import type { Metadata } from "next";
import { SAPOPEDIA_BOOKS } from "@/data/site-menu";
import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageBanner from "@/components/site/PageBanner";
import { CloseBand } from "@/components/home/HomeSections";
import BookSection from "@/components/books/BookSection";
import { getAllBooks, coverExists } from "@/lib/books";
import { SITE_URL, SITE_NAME, AUTHOR, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { ARTICLES_INDEX } from "@/data/site-menu";

/**
 * /books
 *
 * Sections:
 *   1. Banner: H1, lede, Noel with the book, jump links
 *   2. Trust strip: publications that carried the writing
 *   3. Free books (3 cards today, scales to more)
 *   4. Paid books (1 card today, paid editions coming soon)
 *   5. Closing band
 *
 * Server component. Client islands: BookSection (cards + the shared lead
 * capture modal) and BookAccordion (single-open state inside each card).
 *
 * JSON-LD:
 *   - ItemList of Books
 *   - One Book schema per title
 *   - FAQPage combining all card accordion Q&A pairs (3 per book)
 */

export async function generateMetadata(): Promise<Metadata> {
  const url = `${SITE_URL}/books/`;
  const title = "Books by Noel D'Costa | SAP, ERP and enterprise AI";
  const description =
    "Practical books for SAP consultants, CIOs, CFOs and ERP programme leaders: SAP careers, enterprise AI, autonomous agents and the SAP career playbook.";
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

const PRESS: { name: string; src: string }[] = [
  { name: "SAP Press", src: "/press/sap-press.webp" },
  { name: "MSN", src: "/press/msn.webp" },
  { name: "LinkedIn", src: "/press/linkedin.webp" },
  { name: "IPS", src: "/press/ips.webp" },
  { name: "Techbullion", src: "/press/techbullion.webp" },
];

const ACCORDION_QUESTIONS = [
  "Who is this for?",
  "What will you get from this book?",
  "How do I access this?",
] as const;

export default async function BooksPage() {
  const pageUrl = `${SITE_URL}/books`;

  const allBooks = getAllBooks();
  const frontmatters = allBooks.map((b) => b.frontmatter);

  const enriched = frontmatters.map((fm) => ({
    fm,
    hasCoverImage: coverExists(fm.coverImage ?? undefined),
  }));

  const freeBooks = enriched.filter((b) => b.fm.kind === "free");
  const paidBooks = enriched.filter((b) => b.fm.kind === "paid");

  // ItemList of all books
  const bookListLd =
    frontmatters.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Books by Noel D'Costa",
          itemListElement: frontmatters.map((fm, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${pageUrl}#book-card-${fm.slug}`,
            name: fm.title,
          })),
        }
      : null;

  // Per-book Book schema.
  const bookSchemas = frontmatters.map((fm) => {
    const price = fm.kind === "paid" && typeof fm.price === "number" ? fm.price : 0;
    return {
      "@context": "https://schema.org",
      "@type": "Book",
      name: fm.title,
      description: fm.subtitle || fm.summary,
      url: `${pageUrl}#book-card-${fm.slug}`,
      author: {
        "@type": "Person",
        name: AUTHOR.name,
        url: AUTHOR.url,
      },
      offers: {
        "@type": "Offer",
        price,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    };
  });

  // FAQPage combining all card accordion items.
  const faqMainEntity = frontmatters
    .filter((fm) => fm.details)
    .flatMap((fm) => {
      const d = fm.details!;
      const answers = [d.whoFor, d.whatYouGet, d.howToAccess];
      return ACCORDION_QUESTIONS.map((q, i) => ({
        "@type": "Question",
        name: `${fm.title}: ${q}`,
        acceptedAnswer: { "@type": "Answer", text: answers[i] },
      }));
    });

  const faqLd =
    faqMainEntity.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqMainEntity,
        }
      : null;

  return (
    <>
      <Nav />
      <main id="main-content" className="nd-main">
        <PageBanner
          label="Books"
          crumbs={[{ label: "Articles", href: ARTICLES_INDEX }, { label: "Books" }]}
          title="Books for teams building, fixing, or surviving"
          highlight="ERP and AI programmes."
          long
          lede="I write for SAP consultants, CIOs, CFOs and programme leaders who need clear answers. The things I wish more teams knew before they spent millions getting it wrong."
          portrait={{ src: "/media/noel-with-book.webp", width: 1139, height: 1128 }}
        >
          <div className="nda-banner-actions">
            <a className="nd-btn nd-btn-primary magnetic" href={SAPOPEDIA_BOOKS} target="_blank" rel="noopener">
              Get the books on SAPopedia <span aria-hidden="true">↗</span>
            </a>
            <a className="nd-btn nd-btn-secondary" href="#free-books">
              Browse the books <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="nda-banner-meta">
            <span className="nd-pill">
              {freeBooks.length + paidBooks.length} books
            </span>
            <span>Available on SAPopedia</span>
          </div>
        </PageBanner>

        <section className="nda-section tight flush" aria-label="Writing and commentary featured in">
          <div className="nda-wrap">
            <div className="nda-press">
              <p className="nd-label">Writing and commentary featured in</p>
              <ul>
                {PRESS.map((p) => (
                  <li key={p.name}>
                    <Image src={p.src} alt={p.name} width={140} height={28} style={{ height: 26, width: "auto" }} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {freeBooks.length > 0 && (
          <BookSection
            sectionId="free-books"
            eyebrow="Free books"
            heading="Free reading."
            highlight="On SAPopedia."
            intro="Three field guides from active SAP and AI work. Get them on SAPopedia, where all my books live."
            books={freeBooks}
          />
        )}

        {paidBooks.length > 0 && (
          <BookSection
            sectionId="paid-books"
            eyebrow="Paid books"
            heading="The deep one."
            highlight="On SAPopedia."
            intro="The full book is on SAPopedia."
            books={paidBooks}
          />
        )}

        <CloseBand />
      </main>
      <Footer />

      {bookListLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(bookListLd) }}
        />
      )}
      {bookSchemas.map((s, i) => (
        <script
          key={`book-schema-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
    </>
  );
}
