import type { Metadata } from "next";
import { Suspense } from "react";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import LogoScroll from "@/components/LogoScroll";
import ProblemStats from "@/components/ProblemStats";
import Services from "@/components/Services";
import AICapabilities from "@/components/AICapabilities";
import TrackRecord from "@/components/TrackRecord";
import HowIWork from "@/components/HowIWork";
import WhatIBelieve from "@/components/WhatIBelieve";
import Tools from "@/components/Tools";
import YouTubeSection from "@/components/YouTubeSection";
import Credentials from "@/components/Credentials";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";
import { SITE_URL, blogJsonLd, professionalServiceJsonLd } from "@/lib/seo";

const TITLE = "Noel D'Costa | ERP, AI & S/4HANA Advisor";
const DESCRIPTION =
  "Senior ERP and AI advisor. ECC to S/4HANA migrations and Joule on SAP for enterprise clients across the GCC. 25 years. CIMA-qualified. Direct involvement, not subcontracted.";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: TITLE,
    description: DESCRIPTION,
    robots: "index, follow",
    alternates: {
      canonical: `${SITE_URL}/`,
    },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      type: "profile",
      url: SITE_URL,
      locale: "en",
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

export default async function Home() {
  // Person + WebSite are emitted sitewide from the root layout; here we add
  // ProfessionalService (homepage doubles as the service offering hub) and
  // Blog (declares the corpus of posts so they're linked back to a parent).
  const serviceLd = professionalServiceJsonLd({
    url: SITE_URL,
    name: "Noel D'Costa — ERP and AI Advisory",
    description:
      "Senior advisory on SAP S/4HANA migrations and AI on ERP for enterprise clients across the GCC, UK, and Europe.",
    serviceType: "ERP advisory, SAP S/4HANA migration, AI on SAP",
  });
  const blogLd = blogJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }}
      />
      <Nav />
      <main style={{ paddingTop: 64 }}>
        <Hero />
        <LogoScroll />
        <ProblemStats />
        <Services />
        <AICapabilities />
        <TrackRecord />
        <HowIWork />
        <WhatIBelieve />
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
