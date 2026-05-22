import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FeaturedBook from "@/components/books/FeaturedBook";
import BookCard from "@/components/books/BookCard";
import PaidBook from "@/components/books/PaidBook";
import MobileStickyCTA from "@/components/books/MobileStickyCTA";
import { getAllBooks } from "@/lib/books";
import { LOCALES, type Locale } from "@/lib/content";
import { SITE_URL, SITE_NAME, AUTHOR } from "@/lib/seo";

/**
 * /books index — catalogue of Noel's books.
 *
 * Server component. The only client islands are EmailCaptureForm,
 * CheckoutButton, and the MobileStickyCTA inside the card components
 * and at the page tail.
 *
 * Sections (eyebrows restart at 01 because /books is its own page,
 * separate from the homepage 01-09 numbering):
 *   H1: page title + headshot + credibility line + teaser
 *   Trust strip (publisher logos, no eyebrow)
 *   [ 01 · Featured ]                   → FeaturedBook (no section H2)
 *   [ 02 · Free reading ]               → BookCard list
 *   [ 03 · Why I wrote these ]          → first-person from Noel
 *   [ 04 · The full playbook ]          → PaidBook
 *   [ 05 · Frequently asked questions ] → native details/summary
 *   Calendly CTA banner
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

/**
 * Five FAQs, reordered so the strongest value-led question runs first.
 * The Oracle/Microsoft item was dropped per the polish brief (the topic
 * doesn't earn a slot once the book set is SAP-weighted).
 */
const FAQS: { q: string; a: string }[] = [
  {
    q: "What do I get if I drop my email?",
    a: "The PDF of whichever free book you asked for, sent once. No paywall, no upsell sequence. If you want the paid playbook later, you can buy it. If you do not, you keep the free book either way.",
  },
  {
    q: "Why is the playbook paid?",
    a: "The free careers guide is a 75-page field note I update twice a year. The playbook is 250 pages, with data and templates that took months to compile. Charging for it lets me keep updating it without turning the rest of the site into a funnel.",
  },
  {
    q: "When does the paid playbook ship?",
    a: "Target is March 2027. The waitlist gets the launch email a week before public release, plus an early-bird discount on the hardcover bundle.",
  },
  {
    q: "Will you put me on a marketing list?",
    a: "You get one email with the download link. If I send anything else later it will be a clear opt-in, not a default. Unsubscribe is one click. I run two or three engagements at a time, not a content machine.",
  },
  {
    q: "Can I share with my team?",
    a: "Yes. Forward the PDF to colleagues, send the link, print it for a workshop. The only thing I ask is that you do not strip the cover or republish chapters under a different name.",
  },
];

const PRESS: { name: string; src: string }[] = [
  { name: "SAP Press", src: "/press/sap-press.webp" },
  { name: "MSN", src: "/press/msn.webp" },
  { name: "LinkedIn", src: "/press/linkedin.webp" },
  { name: "IPS", src: "/press/ips.webp" },
  { name: "Techbullion", src: "/press/techbullion.webp" },
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

      {/* Hero — H1 + headshot + credibility line + teaser. The headshot
          is desktop-only (quiet presence, matches the homepage hero
          treatment). Padding tracks the other top-of-page sections. */}
      <section
        className="bg-bone pt-28 pb-12"
        style={{ padding: "7rem clamp(1.5rem,5vw,4rem) 3rem" }}
      >
        <div className="max-w-[1200px] mx-auto grid grid-cols-[1fr_auto] gap-10 items-start max-md:grid-cols-1">
          <div>
            <h1
              className="font-display font-black tracking-[-0.04em] leading-[1.05] text-corbeau mb-4 max-w-[820px]"
              style={{ fontSize: "clamp(2.4rem,5vw,3.8rem)" }}
            >
              Books.{" "}
              <span className="cc-emphasis-italic">
                Written from inside live programmes.
              </span>
            </h1>
            <p className="text-night text-[1.05rem] leading-[1.65] max-w-[620px] mb-4">
              Field guides on SAP careers, enterprise AI, and what the next two
              years of agentic systems do to the ERP stack. Three are free. One
              is the longer playbook.
            </p>
            <p className="font-mono text-[0.72rem] tracking-[2px] uppercase text-eyebrow mb-2">
              25 years in ERP · CIMA &amp; AICPA · $700M+ in transformations
            </p>
            <p className="font-mono text-[0.72rem] tracking-[2px] uppercase text-papaya">
              Four titles. Three free. One paid (March 2027).
            </p>
          </div>
          <div className="max-md:hidden">
            <Image
              src="/images/headshot.png"
              alt="Noel D'Costa"
              width={112}
              height={112}
              priority
              className="rounded-2xl border-2 border-papaya/60 shadow-[0_6px_18px_rgba(14,16,32,0.12)] object-cover"
              style={{ width: 112, height: 112 }}
            />
          </div>
        </div>
      </section>

      {/* Publisher trust strip. Mirrors the "Featured On" treatment in
          src/components/Credentials.tsx (cream tile per logo, h-14 px-5,
          32px logo height, mono eyebrow above). */}
      <section
        className="bg-bone"
        style={{ padding: "3rem clamp(1.5rem,5vw,4rem)" }}
      >
        <div className="max-w-[1200px] mx-auto">
          <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-eyebrow mb-5">
            Featured in
          </p>
          <ul className="flex flex-wrap items-center gap-3 list-none p-0 m-0">
            {PRESS.map((p) => (
              <li
                key={p.name}
                className="bg-cream border border-corbeau/[0.06] rounded-md h-14 px-5 flex items-center transition-colors hover:border-corbeau/[0.15]"
              >
                <Image
                  src={p.src}
                  alt={p.name}
                  width={160}
                  height={32}
                  className="object-contain max-w-[150px]"
                  style={{ height: 32, width: "auto" }}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 01 · Featured — no section H2; the FeaturedBook's own H3 is the
          headline. Eyebrow only. */}
      {featured && (
        <section
          className="bg-bone"
          style={{ padding: "clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)" }}
        >
          <div className="max-w-[1200px] mx-auto">
            <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-6">
              [ 01 · Featured ]
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

      {/* 03 · Why I wrote these — first-person from Noel. Placeholder
          comment for the owner to fill in by hand; do not generate. */}
      <section
        className="bg-bone"
        style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
      >
        <div className="max-w-[760px] mx-auto">
          <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
            [ 03 · Why I wrote these ]
          </p>
          <h2
            className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-6 text-corbeau"
            style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
          >
            Notes from the inside.{" "}
            <span className="cc-emphasis-italic">Not from the outside looking in.</span>
          </h2>
          {/* TODO: Noel to write 2 paragraphs in first person.
              Why these books exist. Who they're for. Keep it specific —
              a named programme, a moment, a judgment. Do not generate. */}
          <p className="text-night text-[1rem] leading-[1.7] mb-4">
            [TODO: Noel to write 2 paragraphs in first person. Why these
            books exist. Who they&apos;re for.]
          </p>
        </div>
      </section>

      {/* 04 · The full playbook (the paid one) */}
      {paidBooks.length > 0 && (
        <section
          className="bg-bone"
          style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
        >
          <div className="max-w-[1200px] mx-auto">
            <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
              [ 04 · The full playbook ]
            </p>
            <h2
              className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
              style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
            >
              The deep one.{" "}
              <span className="cc-emphasis-italic">Paid.</span>
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

      {/* 05 · Frequently asked questions — identical Tailwind treatment
          to the homepage FAQ.tsx so the visual contract holds across
          the site. The "+" icon gets min-w-[22px] and mt-1 so it sits
          aligned with the first line of multi-line questions. */}
      <section
        id="faq"
        className="bg-cream"
        style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
      >
        <div className="max-w-[760px] mx-auto">
          <div className="mb-12">
            <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
              [ 05 · Frequently asked questions ]
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
                    className="mt-1 min-w-[22px] flex-shrink-0 w-[22px] h-[22px] rounded-full border border-current flex items-center justify-center opacity-60 text-[0.85rem] leading-none transition-all duration-200 group-open:rotate-45 group-open:opacity-90"
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

      {/* Calendly CTA. Reuses the structure and gradient styling of
          src/components/CTABanner.tsx but with /books-specific copy. */}
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
              Need a steer before you buy?{" "}
              <span className="cc-emphasis-italic">Talk to me first.</span>
            </h2>
            <p className="text-corbeau/70 text-[1rem] max-w-[520px] leading-[1.65] mb-8">
              30 minutes. No sales pitch. If the playbook isn&apos;t the right tool
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

      {/* Mobile-only sticky CTA. Appears after the visitor scrolls past
          the Featured book without converting. Smooth-scrolls back to
          the Featured form's anchor. Dismissable; dismissal sticks for
          the session. */}
      {featured && (
        <MobileStickyCTA
          anchorId={`book-${featured.frontmatter.slug}`}
        />
      )}

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
