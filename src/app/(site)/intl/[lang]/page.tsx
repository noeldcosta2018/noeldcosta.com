import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
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
import {
  OG_LOCALE_MAP,
  TARGET_LANGUAGES,
  isTargetLanguage,
  localizedPath,
  type TargetLanguage,
} from "@/lib/locales";
import { SITE_URL, buildLanguageAlternates } from "@/lib/seo";

// Locale-scoped homepage. The English homepage stays at /, served by
// (site)/page.tsx; this route mirrors the same composition for /ja/, /ar/,
// /de/, etc. Block 4 wires per-locale canonical, hreflang, and og:locale
// — the route itself still renders the same component tree as the English
// homepage (translated copy is layered on top in a later block).

const TITLE = "Noel D'Costa | ERP, AI & S/4HANA Advisor";
const DESCRIPTION =
  "Senior ERP and AI advisor. ECC to S/4HANA migrations and Joule on SAP for enterprise clients across the GCC. 25 years. CIMA-qualified. Direct involvement, not subcontracted.";

export function generateStaticParams() {
  return TARGET_LANGUAGES.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> },
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isTargetLanguage(lang)) return {};
  const locale = lang as TargetLanguage;
  const canonical = `${SITE_URL}${localizedPath(locale, "/")}`;
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
      canonical,
      languages: buildLanguageAlternates("/"),
    },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      type: "profile",
      url: canonical,
      locale: OG_LOCALE_MAP[locale] ?? "en_US",
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
