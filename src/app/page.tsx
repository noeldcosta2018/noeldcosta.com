import { Suspense } from "react";
import Ticker from "@/components/Ticker";
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
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Ticker />
      <Nav />
      <main>
        <Hero />
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
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
