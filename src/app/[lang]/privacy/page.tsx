import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { LOCALES, type Locale } from "@/lib/content";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

/**
 * /privacy — plain-English privacy notice for /books leads and the rest
 * of the site. Linked from the LeadCaptureModal consent checkboxes.
 *
 * Mirrored shell of /books: Nav + content section on bg-bone + Footer.
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
  const url = `${SITE_URL}${localePrefix}/privacy`;
  const title = "Privacy | Noel D'Costa";
  const description =
    "How noeldcosta.com handles your name, email, and request data. Plain English, written by Noel.";
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
      locale,
    },
  };
}

const UPDATED = "2026-05-23";

export default async function PrivacyPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const locale = lang as Locale;
  const localePrefix = locale === "en" ? "" : `/${locale}`;

  return (
    <>
      <Nav />

      <section
        className="bg-bone pt-28 pb-16"
        style={{ padding: "7rem clamp(1.5rem,5vw,4rem) 4rem" }}
      >
        <div className="max-w-[760px] mx-auto">
          <p className="font-mono text-[0.72rem] tracking-[2px] uppercase text-eyebrow mb-3">
            [ Site · Privacy ]
          </p>
          <h1
            className="font-display font-black tracking-[-0.04em] leading-[1.05] text-corbeau mb-6"
            style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
          >
            Privacy
          </h1>

          <div className="prose-noel text-night text-[1rem] leading-[1.7] flex flex-col gap-5">
            <p>
              This is a personal site. I run it. I read the leads. There is
              no marketing team behind the curtain. The note below covers
              what I collect, why, and what you can ask me to do about it.
            </p>

            <h2 className="font-display font-bold text-corbeau text-[1.25rem] mt-3">
              What I collect
            </h2>
            <p>
              When you request a book, I store your name, your email, the
              title you asked for, the time you asked, your IP address, and
              your browser user agent. The IP and user agent are kept for
              basic abuse prevention. That is the lot.
            </p>

            <h2 className="font-display font-bold text-corbeau text-[1.25rem] mt-3">
              Why I collect it
            </h2>
            <p>
              The name and email are used to deliver the book you asked for
              and to answer if you reply. If you ticked the marketing
              checkbox, I will also send the occasional email when new SAP,
              ERP, or AI resources are published. If you did not tick it, I
              will not. The legal basis under GDPR is consent for marketing
              and legitimate interest plus contract performance for
              delivery of the requested book.
            </p>

            <h2 className="font-display font-bold text-corbeau text-[1.25rem] mt-3">
              How long it stays
            </h2>
            <p>
              Records are kept until you ask me to delete them, or until I
              archive a cohort I no longer need. Email me and I will remove
              your row the same day, usually inside an hour during working
              hours in Dubai.
            </p>

            <h2 className="font-display font-bold text-corbeau text-[1.25rem] mt-3">
              Your rights
            </h2>
            <p>
              Under GDPR and similar regimes you can ask for access to your
              data, correction of anything wrong, erasure, or a copy you
              can take elsewhere (portability). You can also withdraw
              consent at any time. Reach me at{" "}
              <a
                href="mailto:noel@noeldcosta.com"
                className="text-papaya underline hover:no-underline"
              >
                noel@noeldcosta.com
              </a>{" "}
              and I will action it.
            </p>

            <h2 className="font-display font-bold text-corbeau text-[1.25rem] mt-3">
              Cookies and analytics
            </h2>
            <p>
              The site uses minimal first-party cookies for session and
              language preference. There is no third-party advertising
              network. If analytics are added later, I will list them here
              before they go live.
            </p>

            <p className="font-mono text-[0.78rem] text-night/70 mt-6 border-t border-corbeau/[0.08] pt-4">
              See also:{" "}
              <Link
                href={`${localePrefix}/terms`}
                className="text-papaya underline hover:no-underline"
              >
                Terms of use
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
