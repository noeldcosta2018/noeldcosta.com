import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import {
  AcademyChapter,
  ArticlesAndTools,
  ClientWork,
  CloseBand,
  Ecosystem,
  Expertise,
  HomeHero,
  HowIHelp,
  SignupBand,
  WorkingWithMe,
} from "@/components/home/HomeSections";
import VideoMarquee from "@/components/home/VideoMarquee";
import { translator } from "@/i18n";
import type { Locale } from "@/lib/locales";
import { homeAlternates } from "@/lib/home-meta";
import { SITE_URL, blogJsonLd, professionalServiceJsonLd } from "@/lib/seo";

/** The homepage, in English (/) or a translated locale (/de/ and so on). */
export default function HomePage({ locale = "en" }: { locale?: Locale }) {
  const tr = translator(locale);
  // Person + WebSite are emitted sitewide from the root layouts; the homepage adds
  // ProfessionalService (it doubles as the service hub) and Blog.
  const serviceLd = professionalServiceJsonLd({
    url: SITE_URL,
    name: "Noel D'Costa: enterprise applications, data and AI",
    description: tr(
      "I help leadership teams choose the right SAP, Oracle and Microsoft platforms, deliver programmes, fix reporting and put AI to work where it solves a real problem.",
    ),
    serviceType: "Enterprise applications (SAP, Oracle, Microsoft, ServiceNow), data and analytics, enterprise AI",
  });
  const blogLd = blogJsonLd();
  const languages = homeAlternates();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }} />
      <Nav locale={locale} languages={Object.keys(languages).length > 2 ? languages : undefined} />
      <main id="main-content" className="nd-main nd-home">
        <HomeHero locale={locale} />
        <HowIHelp locale={locale} />
        <Expertise locale={locale} />
        <ClientWork locale={locale} />
        <VideoMarquee locale={locale} />
        <AcademyChapter locale={locale} />
        <ArticlesAndTools locale={locale} />
        <WorkingWithMe locale={locale} />
        <Ecosystem locale={locale} />
        <SignupBand locale={locale} />
        <CloseBand locale={locale} />
      </main>
      <Footer locale={locale} signup={false} />
    </>
  );
}
