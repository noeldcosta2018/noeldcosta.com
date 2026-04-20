import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import {
  CATEGORIES,
  getPostsByCategory,
  type Category,
  type Locale,
} from "@/lib/content";
import { breadcrumbJsonLd, SITE_URL } from "@/lib/seo";

export default function CategoryPage({
  category,
  locale,
}: {
  category: string;
  locale: Locale;
}) {
  if (!(category in CATEGORIES)) notFound();
  const meta = CATEGORIES[category as keyof typeof CATEGORIES];
  const posts = getPostsByCategory(category as Category, locale);
  const localePrefix = locale === "en" ? "" : `/${locale}`;

  const crumbs = [
    { name: "Home", url: `${SITE_URL}${localePrefix}/` },
    { name: meta.label, url: `${SITE_URL}${localePrefix}/category/${meta.slug}` },
  ];

  return (
    <>
      <Nav />
      <section className="bg-bone pt-28 pb-16">
        <div className="max-w-[1100px] mx-auto px-6">
          <p className="font-mono text-[0.68rem] font-medium tracking-[2.5px] uppercase text-papaya mb-3">
            Category
          </p>
          <h1 className="font-display font-black text-corbeau tracking-[-0.03em] leading-[1.06] text-4xl md:text-5xl mb-4">
            {meta.label}
          </h1>
          <p className="text-night text-lg leading-[1.6] max-w-[620px] mb-12">
            {meta.description}
          </p>
          {posts.length === 0 ? (
            <p className="text-night/70">No posts yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((p) => (
                <Link
                  key={p.frontmatter.slug}
                  href={`${localePrefix}/${p.frontmatter.slug}`}
                  className="block bg-paper border border-corbeau/[0.06] rounded-[14px] p-6 hover:border-corbeau/20 transition-colors"
                >
                  <p className="font-mono text-[0.62rem] tracking-[2px] uppercase text-papaya mb-3">
                    {new Date(p.frontmatter.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })}
                  </p>
                  <h2 className="font-display font-bold text-corbeau text-lg leading-snug mb-2">
                    {p.frontmatter.title}
                  </h2>
                  {p.frontmatter.excerpt && (
                    <p className="text-night/85 text-[0.9rem] leading-[1.55] line-clamp-3">
                      {p.frontmatter.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }}
      />
    </>
  );
}
