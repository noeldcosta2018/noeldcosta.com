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

// Per-locale homepage metadata. The English copy (the source of truth) is
// in (site)/layout.tsx + (site)/page.tsx; this block carries the translated
// counterparts so /ja/, /ar/, /de/, etc. advertise locale-appropriate
// <title> and <meta description> in the SSR'd <head>. Branded terms
// (SAP, S/4HANA, ECC, Joule, ERP, AI, GCC, CIMA) stay in Latin script in
// every locale — they are the search anchors Noel ranks for and the words
// CIO/CFO buyers in non-English markets actually type into Google. Block 6c
// will likely supersede this with the general UI translation infrastructure;
// for now this is the narrow fix for the metadata bug.
type HomepageMeta = { title: string; description: string };

const HOMEPAGE_META: Record<TargetLanguage, HomepageMeta> = {
  ar: {
    title: "Noel D'Costa | مستشار ERP و AI و S/4HANA",
    description:
      "مستشار أول في ERP و AI. عمليات الترحيل من ECC إلى S/4HANA و Joule على SAP لعملاء المؤسسات في دول مجلس التعاون الخليجي. 25 عاماً من الخبرة. حاصل على شهادة CIMA. مشاركة مباشرة، دون مقاولين من الباطن.",
  },
  de: {
    title: "Noel D'Costa | ERP-, AI- und S/4HANA-Berater",
    description:
      "Senior-Berater für ERP und AI. ECC-zu-S/4HANA-Migrationen und Joule auf SAP für Unternehmenskunden im GCC. 25 Jahre Erfahrung. CIMA-qualifiziert. Direkte Beteiligung, keine Unterauftragsvergabe.",
  },
  el: {
    title: "Noel D'Costa | Σύμβουλος ERP, AI και S/4HANA",
    description:
      "Ανώτερος σύμβουλος ERP και AI. Μεταναστεύσεις από ECC σε S/4HANA και Joule πάνω σε SAP για επιχειρηματικούς πελάτες στον GCC. 25 χρόνια εμπειρίας. Πιστοποιημένος CIMA. Άμεση εμπλοκή, χωρίς υπεργολαβίες.",
  },
  es: {
    title: "Noel D'Costa | Asesor de ERP, IA y S/4HANA",
    description:
      "Asesor sénior de ERP e IA. Migraciones de ECC a S/4HANA y Joule sobre SAP para clientes corporativos en el GCC. 25 años de experiencia. Cualificado por CIMA. Implicación directa, sin subcontratación.",
  },
  fr: {
    title: "Noel D'Costa | Conseiller ERP, IA et S/4HANA",
    description:
      "Conseiller senior en ERP et IA. Migrations d'ECC vers S/4HANA et Joule sur SAP pour les clients grands comptes du CCG. 25 ans d'expérience. Qualifié CIMA. Implication directe, sans sous-traitance.",
  },
  it: {
    title: "Noel D'Costa | Consulente ERP, AI e S/4HANA",
    description:
      "Consulente senior ERP e AI. Migrazioni da ECC a S/4HANA e Joule su SAP per clienti enterprise nel GCC. 25 anni di esperienza. Qualifica CIMA. Coinvolgimento diretto, senza subappalto.",
  },
  ja: {
    title: "Noel D'Costa | ERP・AI・S/4HANA アドバイザー",
    description:
      "シニアERP/AIアドバイザー。ECCからS/4HANAへの移行と、SAP上のJouleを、GCCのエンタープライズ顧客に提供。25年の実績。CIMA資格保有。下請けではなく、直接関与。",
  },
  nl: {
    title: "Noel D'Costa | ERP-, AI- en S/4HANA-adviseur",
    description:
      "Senior ERP- en AI-adviseur. ECC-naar-S/4HANA-migraties en Joule op SAP voor zakelijke klanten in de GCC. 25 jaar ervaring. CIMA-gekwalificeerd. Directe betrokkenheid, geen onderaanneming.",
  },
  pt: {
    title: "Noel D'Costa | Consultor de ERP, IA e S/4HANA",
    description:
      "Consultor sênior de ERP e IA. Migrações de ECC para S/4HANA e Joule sobre SAP para clientes corporativos no GCC. 25 anos de experiência. Certificação CIMA. Envolvimento direto, sem subcontratação.",
  },
  ru: {
    title: "Ноэль Д'Коста | Консультант по ERP, AI и S/4HANA",
    description:
      "Старший консультант по ERP и AI. Миграции с ECC на S/4HANA и Joule на SAP для корпоративных клиентов в странах GCC. 25 лет опыта. Квалификация CIMA. Прямое участие, без субподряда.",
  },
};

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
  const { title, description } = HOMEPAGE_META[locale];
  return {
    // `absolute` bypasses the layout's `title.template` (which appends
    // "| Noel D'Costa") — the homepage title already starts with the brand
    // name, so without absolute the rendered <title> double-brands.
    // Mirrors how the English homepage uses `title.default` at the layout
    // level to skip the template.
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: buildLanguageAlternates("/"),
    },
    openGraph: {
      title,
      description,
      type: "profile",
      url: canonical,
      locale: OG_LOCALE_MAP[locale] ?? "en_US",
      siteName: "Noel D'Costa",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@noeldcosta2018",
      title,
      description,
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
