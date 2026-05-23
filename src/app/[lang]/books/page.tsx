import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BookCarousel from "@/components/books/BookCarousel";
import { getAllBooks } from "@/lib/books";
import { LOCALES, type Locale } from "@/lib/content";
import { SITE_URL, SITE_NAME, AUTHOR } from "@/lib/seo";

/**
 * /books — full rebuild.
 *
 * Sections:
 *   1. Hero (left text + right book stack, two CTAs)
 *   2. Trust strip (5 publisher logos, transparent backgrounds)
 *   3. Books carousel (4 cards, 3-up on desktop, 1-up on mobile)
 *      + Per-book accordion below the carousel (single-open)
 *   4. CTA banner (Calendly + email)
 *
 * Server component. Client islands: BookCarousel, BookStack3D wrapper
 * (HeroBookCTAs), BookModal, BookAccordion. Everything else is server.
 *
 * JSON-LD:
 *   - ItemList of Books
 *   - One Book schema per title (4 total)
 *   - FAQPage combining all 24 accordion Q&A pairs (4 books × 6 each)
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
    "Practical books for SAP consultants, CIOs, CFOs, and ERP programme leaders covering SAP careers, enterprise AI, autonomous agents, and ERP programme delivery.";
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
  "What problem does it solve?",
  "What is inside?",
  "Is it free or paid?",
  "How will I receive it?",
] as const;

function detailToAnswers(d: NonNullable<import("@/types/book").BookFrontmatter["details"]>) {
  return [
    d.whoFor,
    d.whatYouGet,
    d.problemSolved,
    d.whatIsInside,
    d.freeOrPaid,
    d.howReceived,
  ];
}

export default async function BooksPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const locale = lang as Locale;
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const pageUrl = `${SITE_URL}${localePrefix}/books`;

  const books = getAllBooks();
  const frontmatters = books.map((b) => b.frontmatter);

  // ItemList of Books — kept for backwards compatibility with the previous
  // schema graph on this page.
  const bookListLd =
    frontmatters.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Books by Noel D'Costa",
          itemListElement: frontmatters.map((fm, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${pageUrl}#book-${fm.slug}`,
            name: fm.title,
          })),
        }
      : null;

  // Per-book Book schema. One entity each. `offers.price` is the cheapest
  // tier for paid books and 0 for free ones.
  const bookSchemas = frontmatters.map((fm) => {
    const isPaid = fm.kind === "paid";
    const cheapest = isPaid
      ? Math.min(
          ...[
            fm.pricing?.ebook?.amount,
            fm.pricing?.paperback?.amount,
            fm.pricing?.hardcoverBundle?.amount,
          ].filter((n): n is number => typeof n === "number" && n > 0),
        )
      : 0;
    return {
      "@context": "https://schema.org",
      "@type": "Book",
      name: fm.title,
      description: fm.subtitle || fm.summary,
      url: `${pageUrl}#book-${fm.slug}`,
      author: {
        "@type": "Person",
        name: AUTHOR.name,
        url: AUTHOR.url,
      },
      isbn: null,
      ...(fm.publishedAt ? { datePublished: fm.publishedAt } : {}),
      ...(fm.pages ? { numberOfPages: fm.pages } : {}),
      offers: {
        "@type": "Offer",
        price: Number.isFinite(cheapest) ? cheapest : 0,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    };
  });

  // FAQPage combining all 24 accordion items.
  const faqMainEntity = frontmatters
    .filter((fm) => fm.details)
    .flatMap((fm) => {
      const answers = detailToAnswers(fm.details!);
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

      {/* 1. HERO — left text + right book stack. Mirrors src/components/Hero.tsx
          two-column layout. Stack hidden under md per the brief. */}
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
            {/* Two CTAs: jump into the carousel at the first free book and at
                the paid book. Anchor links resolve to id="book-{slug}" on the
                cards inside BookCarousel, which uses native scrollIntoView so
                the horizontal carousel snaps to the right card on click. */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <a
                href="#book-card-title-sap-careers-200k-ai-era"
                className="inline-flex items-center justify-center bg-papaya text-corbeau font-bold text-[0.95rem] px-6 py-3 min-h-[44px] rounded-[10px] no-underline transition-all hover:bg-[#fb8843] hover:-translate-y-px"
              >
                Browse free books
              </a>
              <a
                href="#book-card-title-erp-programme-playbook"
                className="inline-flex items-center justify-center bg-transparent text-corbeau font-bold text-[0.95rem] px-6 py-3 min-h-[44px] rounded-[10px] border border-corbeau transition-all hover:bg-corbeau hover:text-bone"
              >
                Browse paid books
              </a>
            </div>
            <p className="font-mono text-[0.72rem] tracking-[2px] uppercase text-eyebrow mt-6">
              25 years in ERP · CIMA &amp; AICPA · $700M+ delivered
            </p>
          </div>
          {/* Hero photo — Noel holding the first book at a speaking event.
              Framed treatment: cream matte inside a corbeau outer ring with a
              soft warm shadow. 4:5 portrait matches the source aspect ratio.
              Visible on mobile (smaller) because the photo is the strongest
              proof signal for the page. */}
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

      {/* 2. TRUST STRIP — transparent backgrounds, single row, greyscale + 0.55
          opacity by default, brighter on hover. Smaller than the Credentials
          press strip because there's no tile behind each logo. */}
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

      {/* 3. BOOKS CAROUSEL + per-book accordion (handled inside BookCarousel). */}
      <section
        id="books"
        className="bg-cream"
        style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
      >
        <div className="max-w-[1200px] mx-auto">
          <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
            [ 02 · The books ]
          </p>
          <h2
            className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-3 text-corbeau"
            style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
          >
            Four books. Three free. One paid.
          </h2>
          <p className="text-night text-[1rem] max-w-[560px] leading-[1.7] mb-12">
            Field notes from work I&apos;ve actually done. Each one is short
            enough to read in an evening.
          </p>
          <BookCarousel books={frontmatters} />
        </div>
      </section>

      {/* 4. CTA banner. Same gradient pattern as src/components/CTABanner.tsx. */}
      <section
        id="books-cta"
        className="bg-bone"
        style={{ padding: "clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)" }}
      >
        <div
          className="max-w-[1200px] mx-auto relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#fc985a 0%,#e2826b 100%)",
            padding: "clamp(3rem,6vw,5rem) clamp(2rem,5vw,4rem)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.1,
              backgroundImage:
                "linear-gradient(rgba(14,16,32,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(14,16,32,0.5) 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative">
            <p className="font-mono text-[0.72rem] font-semibold tracking-[2.5px] uppercase text-corbeau mb-3.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-corbeau" />
              READY WHEN YOU ARE
            </p>
            <h2
              className="font-display font-black tracking-[-0.04em] leading-[1.06] text-corbeau mb-3.5 max-w-[640px]"
              style={{ fontSize: "clamp(2.2rem,4.5vw,3.5rem)" }}
            >
              Want a steer before you buy? Talk to me first.
            </h2>
            <p className="text-corbeau/70 text-[1rem] max-w-[520px] leading-[1.65] mb-8">
              30 minutes. No sales pitch. If a book isn&apos;t the right tool
              for your team, I&apos;ll tell you on the call.
            </p>
            <div className="flex gap-3 flex-wrap max-sm:flex-col">
              <a
                href="https://calendly.com/noeldcosta/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-corbeau text-bone px-7 py-3.5 rounded-[10px] no-underline font-bold text-[0.92rem] transition-all hover:bg-haiti hover:-translate-y-px"
              >
                Book a 30-min call ↗
              </a>
              <a
                href="mailto:solutions@noeldcosta.com"
                className="inline-flex items-center text-corbeau px-7 py-3.5 no-underline font-semibold text-[0.92rem] border-b-2 border-corbeau transition-opacity hover:opacity-70"
              >
                Email me directly
              </a>
            </div>
          </div>
        </div>
      </section>

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
