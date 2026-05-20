import { getYouTubeVideos } from "@/lib/youtube";
import VideoCarousel from "./VideoCarousel";

export default async function YouTubeSection() {
  // RSS returns up to 15 videos by default; the carousel scrolls
  // horizontally so all of them can fit without crowding the page.
  const videos = await getYouTubeVideos(15);

  return (
    <section
      className="bg-cream"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          [ 05 · Watch &amp; learn ]
        </p>
        <h2
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-corbeau"
          style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
        >
          Videos from the field.{" "}
          <span className="cc-emphasis-italic">Not theory. Real projects.</span>
        </h2>
        <p className="text-night text-[1rem] max-w-[520px] leading-[1.7] mb-12">
          I share what I&apos;ve learned from 25 years of ERP and AI implementations.
          The stuff nobody tells you.
        </p>

        <VideoCarousel videos={videos} />

        <div className="mt-8 flex items-center gap-3">
          <a
            href="https://www.youtube.com/@NoelDCostaERPAI"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-corbeau text-bone px-6 py-3 rounded-[10px] no-underline font-bold text-[0.88rem] transition-all hover:bg-[#1a1c30] hover:-translate-y-px"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8z"/>
              <polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="#0e1020"/>
            </svg>
            Subscribe on YouTube
          </a>
        </div>
      </div>
    </section>
  );
}
