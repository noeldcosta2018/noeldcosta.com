import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MdxBody from "@/components/mdx/MdxBody";
import { getPage } from "@/lib/content";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/seo";
import Link from "next/link";

interface ToolShellProps {
  slug: string;
  label: string;
  description: string;
  /** Defaults to slug. Override if the MDX page slug differs. */
  mdxSlug?: string;
  children: ReactNode;
}

export default function ToolShell({
  slug,
  label,
  description,
  mdxSlug,
  children,
}: ToolShellProps) {
  const resolvedMdxSlug = mdxSlug ?? slug;
  const page = getPage(resolvedMdxSlug, "en");

  const breadcrumbs = [
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Tools", url: `${SITE_URL}/#tools` },
    { name: label, url: `${SITE_URL}/${slug}` },
  ];

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: label,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "Noel D'Costa",
      url: "https://noeldcosta.com/about",
    },
    url: `https://noeldcosta.com/${slug}`,
  };

  return (
    <>
      <Nav />

      {/* Hero */}
      <section className="bg-corbeau text-bone" style={{ paddingTop: "clamp(4rem,8vw,6rem)", paddingBottom: "clamp(3rem,6vw,4rem)", paddingLeft: "clamp(1.5rem,5vw,4rem)", paddingRight: "clamp(1.5rem,5vw,4rem)" }}>
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap gap-1.5 items-center font-mono text-[0.65rem] tracking-[1.5px] uppercase text-moon/60">
              <li>
                <Link href="/" className="hover:text-papaya transition-colors">Home</Link>
              </li>
              <li aria-hidden className="text-moon/30">/</li>
              <li>
                <span className="text-moon/40">Tools</span>
              </li>
              <li aria-hidden className="text-moon/30">/</li>
              <li>
                <span className="text-bone/70">{label}</span>
              </li>
            </ol>
          </nav>

          <p className="font-mono text-[0.68rem] font-semibold tracking-[2.5px] uppercase text-papaya mb-3">
            [ Free Tool ]
          </p>
          <h1
            className="font-display font-black tracking-[-0.04em] leading-[1.06] text-bone mb-4"
            style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)" }}
          >
            {label}
          </h1>
          <p className="text-moon text-[1rem] max-w-[560px] leading-[1.7]">
            {description}
          </p>
        </div>
      </section>

      {/* MDX intro (SEO copy from content/pages/<slug>/en.mdx) */}
      {page && (
        <section className="bg-bone border-b border-corbeau/10" style={{ padding: "clamp(2.5rem,5vw,4rem) clamp(1.5rem,5vw,4rem)" }}>
          <div className="max-w-[760px] mx-auto prose-noel">
            <MdxBody source={page.body} />
          </div>
        </section>
      )}

      {/* Interactive tool */}
      <section className="bg-paper" style={{ padding: "clamp(2.5rem,5vw,4rem) clamp(1.5rem,5vw,4rem)" }}>
        <div className="max-w-[860px] mx-auto">
          {children}
        </div>
      </section>

      <Footer />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)),
        }}
      />
    </>
  );
}
