import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";
import BookSection from "@/components/books/BookSection";
import { getAllBooks, coverExists } from "@/lib/books";
import { LOCALES, type Locale } from "@/lib/content";
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

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export async function generateMetadata(props: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await props.params;
  if (!LOCALES.includes(lang as Locale)) return {};
  const locale = lang as Locale;
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const url = `${SITE_URL}${localePrefix}/books`;
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
      locale,
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

export default async function BooksPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const locale = lang as Locale;
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const pageUrl = `${SITE_URL}${localePrefix}/books`;

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

      {/* 1. HERO — left text + right framed photo. Kept verbatim aside from the
          anchor hrefs which now point to the new section IDs. */}
      <section
        className="bg-bone pt-28 pb-12"
        style={{ padding: "7rem clamp(1.5rem,5vw,4rem) 4rem" }}
      >
        <div className="max-w-[1200px] mx-auto grid grid-cols-[1.1fr_1fr] gap-12 items-center max-md:grid-cols-1 max-md:gap-10">
          <div>
            <p className="font-mono text-[0.72rem] tracking-[2px] uppercase text-eyebrow mb-4">
              [ 01 · Books ]
            </p>
            <h1
              className="font-display font-black tracking-[-0.04em] leading-[1.05] text-corbeau mb-5 max-w-[640px]"
              style={{ fontSize: "clamp(2.2rem,4.5vw,3.4rem)" }}
            >
              Books for teams building, fixing, or surviving ERP and AI programmes.
            </h1>
            <p className="text-night text-[1.02rem] leading-[1.65] max-w-[560px] mb-6">
              I write for SAP consultants, CIOs, CFOs, and programme leaders
              who need clear answers. The stuff I wish more teams knew before
              they spent millions getting it wrong.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <a
                href="#free-books"
                className="inline-flex items-center justify-center bg-papaya text-corbeau font-bold text-[0.95rem] px-6 py-3 min-h-[44px] rounded-[10px] no-underline transition-all hover:bg-[#fb8843] hover:-translate-y-px"
              >
                Browse free books
              </a>
              <a
                href="#paid-books"
                className="inline-flex items-center justify-center bg-transparent text-corbeau font-bold text-[0.95rem] px-6 py-3 min-h-[44px] rounded-[10px] border border-corbeau transition-all hover:bg-corbeau hover:text-bone"
              >
                Browse paid books
              </a>
            </div>
            <p className="font-mono text-[0.72rem] tracking-[2px] uppercase text-eyebrow mt-6">
              25 years in ERP · CIMA &amp; AICPA · $700M+ delivered
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <div
              className="relative w-full max-w-[360px] md:max-w-[420px] aspect-[4/5] rounded-[14px] bg-paper p-3 md:p-4"
              style={{
                boxShadow:
                  "0 1px 2px rgba(14,16,32,0.06), 0 12px 36px rgba(252,152,90,0.12), 0 36px 64px rgba(14,16,32,0.18)",
                outline: "1px solid rgba(14,16,32,0.12)",
                outlineOffset: "-1px",
              }}
            >
              <div className="relative w-full h-full overflow-hidden rounded-[8px]">
                <Image
                  src="/books/noel-with-book.webp"
                  alt="Noel D'Costa speaking, holding the SAP Careers in the $200K AI Era book"
                  fill
                  sizes="(min-width: 768px) 420px, 360px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
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
