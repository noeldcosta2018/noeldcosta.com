import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import LogoScroll from "@/components/LogoScroll";
import ProblemStats from "@/components/ProblemStats";
import Services from "@/components/Services";
import AICapabilities from "@/components/AICapabilities";
import TrackRecord from "@/components/TrackRecord";
import Tools from "@/components/Tools";
import YouTubeSection from "@/components/YouTubeSection";
import Credentials from "@/components/Credentials";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";
import { LOCALES, type Locale } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

const TITLE = "Noel D'Costa | ERP, AI & S/4HANA Advisor";
const DESCRIPTION =
  "Senior ERP and AI advisor. ECC to S/4HANA migrations and Joule on SAP for enterprise clients across the GCC. 25 years. CIMA-qualified. Direct involvement, not subcontracted.";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await props.params;
  const locale = lang as Locale;

  const canonical = locale === "en" ? SITE_URL : `${SITE_URL}/${locale}`;

  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[loc] = loc === "en" ? SITE_URL : `${SITE_URL}/${loc}`;
  }
  languages["x-default"] = SITE_URL;

  return {
    title: TITLE,
    description: DESCRIPTION,
    robots: "index, follow",
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      type: "profile",
      url: canonical,
      locale,
      siteName: "Noel D'Costa",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: TITLE }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@noeldcosta2018",
      title: TITLE,
      description: DESCRIPTION,
      images: ["/og-image.png"],
    },
  };
}

export default async function Home(props: { params: Promise<{ lang: string }> }) {
  const { lang } = await props.params;
  if (!LOCALES.includes(lang as Locale)) notFound();

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Noel D'Costa",
    jobTitle: "ERP and AI Advisor",
    url: "https://noeldcosta.com",
    image: "https://noeldcosta.com/headshot.png",
    sameAs: [
      "https://www.linkedin.com/in/noeldcosta/",
      "https://x.com/noeldcosta2018",
      "https://www.youtube.com/@NoelDCostaERPAI",
    ],
    hasCredential: [
      { "@type": "EducationalOccupationalCredential", name: "CIMA" },
      { "@type": "EducationalOccupationalCredential", name: "AICPA" },
      { "@type": "EducationalOccupationalCredential", name: "Masters in Accounting" },
    ],
    worksFor: {
      "@type": "Organization",
      name: "Quantinoid LLC",
    },
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Noel D'Costa — ERP and AI Advisory",
    description:
      "Senior advisory on SAP S/4HANA migrations and AI on ERP for enterprise clients.",
    url: "https://noeldcosta.com",
    areaServed: ["AE", "SA", "GB", "GCC", "Europe"],
    serviceType: ["ERP advisory", "SAP S/4HANA migration", "AI on SAP"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <Nav />
      <main style={{ paddingTop: 64 }}>
        <Hero lang={lang} />
        <LogoScroll />
        <ProblemStats />
        <Services />
        <AICapabilities />
        <TrackRecord />
        <Tools />
        <Suspense
          fallback={
            <section
              className="bg-cream"
              style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
            >
              <div className="max-w-[1200px] mx-auto">
                <div className="h-48 rounded-2xl animate-pulse" style={{ background: "rgba(14,16,32,0.06)" }} />
              </div>
            </section>
          }
        >
          <YouTubeSection />
        </Suspense>
        <Credentials />
        <Testimonials />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
