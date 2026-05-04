import Link from "next/link";
import { notFound } from "next/navigation";
import MdxBody from "@/components/mdx/MdxBody";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getPage, type Locale } from "@/lib/content";
import { breadcrumbJsonLd, contactPageJsonLd, SITE_URL } from "@/lib/seo";

export default function MdxPageLayout({ slug, locale }: { slug: string; locale: Locale }) {
  const page = getPage(slug, locale);
  if (!page) notFound();
  const fm = page.frontmatter;
  const localePrefix = locale === "en" ? "" : `/${locale}`;

  const pageUrl = `${SITE_URL}${localePrefix}/${fm.slug}`;
  const breadcrumbs = [
    { name: "Home", url: `${SITE_URL}${localePrefix}/` },
    { name: fm.title, url: pageUrl },
  ];

  // Heuristic: if the page slug starts with `contact`, emit ContactPage
  // schema in addition to breadcrumbs. Covers contact-noel-erp-support
  // and any future contact variants without hard-coding the slug.
  const isContact = /^contact[-_]/i.test(fm.slug) || fm.slug === "contact";

  return (
    <>
      <Nav />
      <section className="bg-bone pt-28 pb-16">
        <div className="max-w-[760px] mx-auto px-6">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap gap-1.5 items-center font-mono text-[0.68rem] tracking-[1.5px] uppercase text-night/70">
              <li>
                <Link href={`${localePrefix}/`} className="hover:text-papaya">Home</Link>
              </li>
            </ol>
          </nav>
          <h1 className="font-display font-black text-corbeau tracking-[-0.03em] leading-[1.08] text-3xl md:text-5xl mb-4">
            {fm.h1 || fm.title}
          </h1>
          {fm.excerpt && (
            <p className="text-night leading-[1.6] text-lg mb-8">{fm.excerpt}</p>
          )}
          {fm.hero && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fm.hero} alt={fm.title} className="w-full h-auto rounded-2xl mb-10" />
          )}
          <div className="prose-noel">
            <MdxBody source={page.body} />
          </div>
        </div>
      </section>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />
      {isContact && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(contactPageJsonLd(pageUrl)),
          }}
        />
      )}
    </>
  );
}
