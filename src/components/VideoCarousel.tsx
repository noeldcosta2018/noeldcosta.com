"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { YouTubeVideo } from "@/lib/youtube";

/**
 * Horizontal carousel of YouTube videos. CSS scroll-snap does the
 * heavy lifting — touch swipe + trackpad swipe + keyboard arrows all
 * work natively. Optional prev/next buttons appear on desktop for
 * mouse-only users.
 *
 * Cards are 320 px wide each, with a small gap. Page scrolls one
 * card per arrow click. Edge-mask fades the cards at the sides so
 * the off-screen cards don't clip abruptly.
 */
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
      className="bg-paper border border-corbeau/[0.06] rounded-[14px] overflow-hidden transition-all duration-[250ms] no-underline text-corbeau hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(14,16,32,0.08)] hover:border-corbeau/[0.12] block w-[320px] shrink-0 snap-start"
    >
      <div className="w-full aspect-video bg-cream flex items-center justify-center relative overflow-hidden">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            sizes="320px"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: "var(--cc-corbeau)" }}
          >
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: 52, height: 36, background: "#FF0000" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
            <p
              className="font-mono text-[0.58rem] tracking-[1.5px] uppercase"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              NoelDCostaERPAI
            </p>
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
      <div className="px-[18px] py-4">
        <h4 className="font-display text-[0.95rem] font-bold tracking-[-0.02em] leading-[1.3] mb-1.5 line-clamp-2">
          {video.title}
        </h4>
        {video.description && (
          <p className="font-mono text-[0.72rem] text-eyebrow tracking-[0.3px] line-clamp-2">
            {video.description}
          </p>
        )}
      </div>
    </a>
  );
}

export default function VideoCarousel({ videos }: { videos: YouTubeVideo[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  // Detect scroll position to enable/disable arrows.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanPrev(scrollLeft > 8);
      setCanNext(scrollLeft + clientWidth < scrollWidth - 8);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [videos.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // Scroll by roughly one card width + gap so the snap lands cleanly
    // on the next/prev card.
    el.scrollBy({ left: dir * 336, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Edge mask + horizontal scroller */}
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pr-4 -mr-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{
          scrollPaddingLeft: 0,
        }}
        aria-label="YouTube videos carousel"
      >
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>

      {/* Arrow controls — visible on hover-capable devices only.
          Mobile users get native swipe. */}
      <div className="hidden md:flex absolute -top-14 right-0 gap-2">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          disabled={!canPrev}
          aria-label="Previous videos"
          className="w-10 h-10 rounded-full border border-corbeau/15 bg-paper flex items-center justify-center transition-all duration-200 hover:bg-cream hover:border-corbeau/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-paper disabled:hover:border-corbeau/15"
        >
          <ChevronLeft size={18} className="text-corbeau" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          disabled={!canNext}
          aria-label="Next videos"
          className="w-10 h-10 rounded-full border border-corbeau/15 bg-paper flex items-center justify-center transition-all duration-200 hover:bg-cream hover:border-corbeau/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-paper disabled:hover:border-corbeau/15"
        >
          <ChevronRight size={18} className="text-corbeau" aria-hidden />
        </button>
      </div>
    </div>
  );
}
