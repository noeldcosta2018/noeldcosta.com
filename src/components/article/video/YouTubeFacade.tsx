"use client";

import { useState } from "react";

/**
 * Click-to-load YouTube player. Renders a poster button first; the
 * youtube-nocookie iframe is only created after the reader presses play,
 * so no player script, cookie or tracking request runs on page load.
 */
export default function YouTubeFacade({
  id,
  title,
  thumbnail,
  playLabel,
}: {
  id: string;
  title: string;
  thumbnail: string;
  playLabel: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="nd-video-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="nd-video-frame nd-video-poster"
      onClick={() => setPlaying(true)}
      aria-label={`${playLabel}: ${title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumbnail} alt="" loading="lazy" decoding="async" width={480} height={360} />
      <span className="nd-video-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" focusable="false">
          <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
        </svg>
      </span>
    </button>
  );
}
