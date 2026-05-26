import { notFound } from "next/navigation";
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
import { TARGET_LANGUAGES, isTargetLanguage } from "@/lib/locales";

// Locale-scoped homepage. The English homepage stays at /, served by
// (site)/page.tsx; this route mirrors the same composition for /ja/, /ar/,
// /de/, etc. Translated copy is wired in a later block — Block 3 just
// proves the routing serves the right URLs.

export function generateStaticParams() {
  return TARGET_LANGUAGES.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export default async function LocaleHome(
  props: { params: Promise<{ lang: string }> },
) {
  const { lang } = await props.params;
  if (!isTargetLanguage(lang)) notFound();

  return (
    <>
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
