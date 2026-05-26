import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";
import BookSection from "@/components/books/BookSection";
import BooksHeroIntro from "@/components/books/BooksHeroIntro";
import { getAllBooks, coverExists } from "@/lib/books";
import { SITE_URL, SITE_NAME, AUTHOR } from "@/lib/seo";

/**
 * /books — full rebuild.
 *
 * Sections:
 *   1. Nav (unchanged)
 *   2. Hero (unchanged — H1 + framed photo of Noel)
 *   3. Trust strip (unchanged)
 *   4. Free books section (3 cards today, scales to more)
 *   5. Paid books section (1 card today, scales to more)
 *   6. CTA banner (existing Calendly pattern)
 *   7. Footer
 *
 * Server component. Two interactive client islands per books section:
 * BookSection (which owns the modal + cards) and BookAccordion (single-open
 * state inside each card).
 *
 * JSON-LD:
 *   - ItemList of Books
 *   - One Book schema per title
 *   - FAQPage combining all card accordion Q&A pairs (3 per book)
 */

export async function generateMetadata(): Promise<Metadata> {
  const url = `${SITE_URL}/books/`;
  const title = "Books by Noel D'Costa | SAP, ERP and Enterprise AI";
  const description =
    "Practical books for SAP consultants, CIOs, CFOs, and ERP programme leaders covering SAP careers, enterprise AI, autonomous agents, and the SAP career playbook for the AI era.";
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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

      {/* 1. HERO — left text + right framed photo. Wrapped in a client
          island for a subtle fade-up on mount. */}
      <section
        className="bg-bone pt-28 pb-12"
        style={{ padding: "7rem clamp(1.5rem,5vw,4rem) 4rem" }}
      >
        <BooksHeroIntro />
      </section>

      {/* 2. TRUST STRIP — unchanged from the previous build. */}
      <section
        className="bg-bone"
        style={{ padding: "3rem clamp(1.5rem,5vw,4rem)" }}
      >
        <div className="max-w-[1200px] mx-auto">
          <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-eyebrow mb-6">
            Writing and commentary featured in
          </p>
          <ul className="flex flex-wrap items-center justify-between gap-x-12 gap-y-6 list-none p-0 m-0">
            {PRESS.map((p) => (
              <li key={p.name} className="flex items-center">
                <Image
                  src={p.src}
                  alt={p.name}
                  width={140}
                  height={28}
                  className="object-contain opacity-55 grayscale transition-all duration-200 hover:opacity-90"
                  style={{ height: 28, width: "auto" }}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. FREE BOOKS */}
      {freeBooks.length > 0 && (
        <BookSection
          sectionId="free-books"
          eyebrow="[ 02 · Free books ]"
          heading="Free reading. Sent by email."
          intro="Three field guides from active SAP and AI work. Drop an email, the PDF arrives."
          books={freeBooks}
        />
      )}

      {/* 4. PAID BOOKS */}
      {paidBooks.length > 0 && (
        <BookSection
          sectionId="paid-books"
          eyebrow="[ 03 · Paid books ]"
          heading="The deep one. Paid."
          intro="Practical execution, not theory. $12.99 ebook, ships the day you buy."
          books={paidBooks}
        />
      )}

      {/* 5. CTA banner — reuses the existing component. */}
      <CTABanner />

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
