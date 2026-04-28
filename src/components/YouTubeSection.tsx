import Image from "next/image";
import { getYouTubeVideos, type YouTubeVideo } from "@/lib/youtube";

function VideoCard({ video }: { video: YouTubeVideo }) {
  const badgeClass =
    video.badgeType === "hot"
      ? "bg-canyon/90 text-white"
      : video.badgeType === "new"
      ? "text-corbeau"
      : "";

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-paper border border-corbeau/[0.06] rounded-[14px] overflow-hidden transition-all duration-[250ms] no-underline text-corbeau hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(14,16,32,0.08)] hover:border-corbeau/[0.12] block"
    >
      {/* Thumbnail */}
      <div className="w-full aspect-video bg-cream flex items-center justify-center relative overflow-hidden">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-papaya flex items-center justify-center shadow-[0_4px_16px_rgba(252,152,90,0.3)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0e1020" style={{ marginLeft: 3 }}>
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        )}
        {video.badge && (
          <span
            className={`absolute top-2.5 right-2.5 font-mono text-[0.6rem] px-2 py-0.5 rounded font-semibold tracking-[0.5px] ${badgeClass}`}
            style={
              video.badgeType === "new"
                ? { background: "rgba(252,152,90,0.9)" }
                : {}
            }
          >
            {video.badge}
          </span>
        )}
      </div>
      {/* Info */}
      <div className="px-[18px] py-4">
        <h4 className="font-display text-[0.95rem] font-bold tracking-[-0.02em] leading-[1.3] mb-1.5">
          {video.title}
        </h4>
        <p className="font-mono text-[0.68rem] text-silver tracking-[0.3px]">
          {video.description}
        </p>
      </div>
    </a>
  );
}

export default async function YouTubeSection() {
  const videos = await getYouTubeVideos(3);

  return (
    <section
      className="bg-cream"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.68rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
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

        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1 max-sm:grid-cols-1">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>

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
