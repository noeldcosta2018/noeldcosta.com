import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FeaturedBook from "@/components/books/FeaturedBook";
import BookCard from "@/components/books/BookCard";
import PaidBook from "@/components/books/PaidBook";
import { getAllBooks } from "@/lib/books";
import { LOCALES, type Locale } from "@/lib/content";
import { SITE_URL, SITE_NAME, AUTHOR } from "@/lib/seo";

/**
 * /books index — catalogue of Noel's books.
 *
 * Server component. The only client islands are EmailCaptureForm and
 * CheckoutButton inside the card components.
 *
 * Sections (eyebrows restart at 01 because /books is its own page,
 * separate from the homepage 01-09 numbering):
 *   H1: page title (no eyebrow)
 *   [ 01 · Featured ]                 → FeaturedBook
 *   [ 02 · Free reading ]             → other free books in BookCard
 *   [ 03 · The full playbook ]        → PaidBook
 *   [ 04 · Frequently asked questions ] → native details/summary
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
  const title = "Books · field guides on ERP, SAP careers, and enterprise AI";
  const description =
    "Free downloads and a paid playbook on SAP careers and enterprise AI by Noel D'Costa. Four titles, written from inside live programmes.";
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

const FAQS: { q: string; a: string }[] = [
  {
    q: "Are the free books actually free?",
    a: "Yes. One email and the PDF lands in your inbox. No paywall, no upsell sequence. If you want the paid playbook later, you can buy it. If you do not, you keep the free book either way.",
  },
  {
    q: "Why is the playbook paid when the careers guide is free?",
    a: "Different books, different jobs. The free careers guide is a 75-page field note I update twice a year. The playbook is 250 pages, with data and templates that took months to compile. Charging for it lets me keep updating it without turning the rest of the site into a funnel.",
  },
  {
    q: "When does the paid playbook ship?",
    a: "Target is March 2027. The waitlist gets the launch email a week before public release, plus an early-bird discount on the hardcover bundle.",
  },
  {
    q: "Will you put me on a marketing list if I download a free book?",
    a: "You get one email with the download link. If I send anything else later it will be a clear opt-in, not a default. Unsubscribe is one click. I run two or three engagements at a time, not a content machine.",
  },
  {
    q: "Can I share the free books with my team?",
    a: "Yes. Forward the PDF to colleagues, send the link, print it for a workshop. The only thing I ask is that you do not strip the cover or republish chapters under a different name.",
  },
  {
    q: "Do the books cover Oracle or Microsoft as well as SAP?",
    a: "The first four titles are SAP-weighted because that is where most of my recent delivery work has been. The enterprise AI book covers patterns that apply across stacks. Oracle and Microsoft will get their own titles later if there is appetite.",
  },
];

export default async function BooksPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const locale = lang as Locale;
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const pageUrl = `${SITE_URL}${localePrefix}/books`;

  const books = getAllBooks();
  const featured = books.find((b) => b.frontmatter.featured);
  const freeBooks = books.filter(
    (b) => b.frontmatter.kind === "free" && !b.frontmatter.featured,
  );
  const paidBooks = books.filter((b) => b.frontmatter.kind === "paid");

  // BookList JSON-LD. Each entry is a Book with author + offers (free
  // when kind is "free", priced when kind is "paid"). Skip the block
  // entirely if there are no books rather than emit an empty list.
  const bookListLd =
    books.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Books by Noel D'Costa",
          itemListElement: books.map((b, i) => {
            const fm = b.frontmatter;
            const isPaid = fm.kind === "paid";
            const cheapest = isPaid && fm.pricing?.ebook?.amount;
            return {
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Book",
                name: fm.title,
                description: fm.summary,
                url: `${pageUrl}#book-${fm.slug}`,
                author: {
                  "@type": "Person",
                  name: AUTHOR.name,
                  url: AUTHOR.url,
                },
                ...(fm.pages ? { numberOfPages: fm.pages } : {}),
                ...(fm.publishedAt
                  ? { datePublished: fm.publishedAt }
                  : {}),
                offers: {
                  "@type": "Offer",
                  price: cheapest ?? 0,
                  priceCurrency: "USD",
                  availability:
                    fm.status === "available"
                      ? "https://schema.org/InStock"
                      : "https://schema.org/PreOrder",
                },
              },
            };
          }),
        }
      : null;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <Nav />

      {/* Hero — H1 only, no eyebrow per the brief. Padding tracks the
          other top-of-page sections (about/page.tsx pt-28). */}
      <section
        className="bg-bone pt-28 pb-12"
        style={{ padding: "7rem clamp(1.5rem,5vw,4rem) 3rem" }}
      >
        <div className="max-w-[1200px] mx-auto">
          <h1
            className="font-display font-black tracking-[-0.04em] leading-[1.05] text-corbeau mb-4 max-w-[820px]"
            style={{ fontSize: "clamp(2.4rem,5vw,3.8rem)" }}
          >
            Books.{" "}
            <span className="cc-emphasis-italic">
              Written from inside live programmes.
            </span>
          </h1>
          <p className="text-night text-[1.05rem] leading-[1.65] max-w-[620px]">
            Field guides on SAP careers, enterprise AI, and what the next two
            years of agentic systems do to the ERP stack. Three are free. One
            is the longer playbook.
          </p>
        </div>
      </section>

      {/* 01 · Featured */}
      {featured && (
        <section
          className="bg-bone"
          style={{ padding: "clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)" }}
        >
          <div className="max-w-[1200px] mx-auto">
            <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
              [ 01 · Featured ]
            </p>
            <h2
              className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
              style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
            >
              Start here.{" "}
              <span className="cc-emphasis-italic">
                The one most readers want first.
              </span>
            </h2>
            <p className="text-night text-[1rem] max-w-[520px] leading-[1.7] mb-12">
              The shorter, faster version of the playbook. Free. Drop an email
              and the PDF arrives.
            </p>
            <FeaturedBook book={featured} />
          </div>
        </section>
      )}

      {/* 02 · Free reading */}
      {freeBooks.length > 0 && (
        <section
          className="bg-cream"
          style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
        >
          <div className="max-w-[1200px] mx-auto">
            <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
              [ 02 · Free reading ]
            </p>
            <h2
              className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
              style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
            >
              More free titles.{" "}
              <span className="cc-emphasis-italic">In flight right now.</span>
            </h2>
            <p className="text-night text-[1rem] max-w-[520px] leading-[1.7] mb-12">
              Two upcoming books on enterprise AI and agentic systems. Join
              the waitlist and you get the launch email the day each ships.
            </p>
            <div className="flex flex-col gap-6">
              {freeBooks.map((b) => (
                <BookCard key={b.frontmatter.slug} book={b} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 03 · The full playbook */}
      {paidBooks.length > 0 && (
        <section
          className="bg-bone"
          style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
        >
          <div className="max-w-[1200px] mx-auto">
            <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
              [ 03 · The full playbook ]
            </p>
            <h2
              className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
              style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
            >
              The deeper book.{" "}
              <span className="cc-emphasis-italic">For people serious about the next five years.</span>
            </h2>
            <p className="text-night text-[1rem] max-w-[520px] leading-[1.7] mb-12">
              250 pages, three formats. Module forecasts, real day-rate data,
              and a 12-month rebuild plan that runs alongside client work.
            </p>
            {paidBooks.map((b) => (
              <PaidBook key={b.frontmatter.slug} book={b} />
            ))}
          </div>
        </section>
      )}

      {/* 04 · Frequently asked questions — identical Tailwind treatment
          to the homepage FAQ.tsx so the visual contract holds across
          the site. */}
      <section
        id="faq"
        className="bg-cream"
        style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
      >
        <div className="max-w-[760px] mx-auto">
          <div className="mb-12">
            <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
              [ 04 · Frequently asked questions ]
            </p>
            <h2
              className="font-display font-black tracking-[-0.04em] leading-[1.08] text-corbeau"
              style={{ fontSize: "clamp(1.75rem,3.5vw,2.25rem)" }}
            >
              Frequently asked questions
            </h2>
          </div>

          <div className="not-prose">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className={`group border-b border-corbeau/[0.08] py-2 ${
                  i === 0 ? "border-t border-corbeau/[0.08]" : ""
                } [&_summary::-webkit-details-marker]:hidden [&_summary]:list-none`}
              >
                <summary
                  role="button"
                  className="flex items-start justify-between gap-4 cursor-pointer font-display font-bold text-corbeau text-[1.02rem] md:text-[1.1rem] tracking-[-0.02em] leading-[1.35] select-none -mx-3 px-3 py-3.5 rounded-lg transition-all duration-150 hover:bg-papaya hover:text-corbeau group-open:bg-papaya group-open:text-corbeau"
                >
                  <span className="flex-1 py-0.5">{faq.q}</span>
                  <span
                    aria-hidden
                    className="mt-[3px] flex-shrink-0 w-[22px] h-[22px] rounded-full border border-current flex items-center justify-center opacity-60 text-[0.85rem] leading-none transition-all duration-200 group-open:rotate-45 group-open:opacity-90"
                  >
                    +
                  </span>
                </summary>
                <p className="text-night text-[0.92rem] leading-[1.7] mt-2 mb-4 px-3">
                  {faq.a}
                </p>
              </details>
            ))}
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </>
  );
}
