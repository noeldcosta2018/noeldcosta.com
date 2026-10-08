"use client";

import { useEffect, useRef } from "react";

/**
 * Muted background loop. Nothing is downloaded until the video is actually on
 * screen (it is display:none on phones, so phones never fetch it). Plays only
 * while visible and never under reduced motion. Decorative: hidden from
 * assistive tech.
 */
export default function LoopVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      video.pause();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!video.dataset.loaded) {
              video.dataset.loaded = "1";
              video.preload = "auto";
              video.load();
            }
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    // The still frame is a CSS background that only applies where the video is
    // shown (1024 px and up, nd-theme.css). A poster attribute would be
    // downloaded on phones too, where every loop is display:none.
    <video
      ref={ref}
      className={`nd-loop ${className ?? ""}`}
      style={{ ["--poster" as string]: `url(${poster})` }}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
