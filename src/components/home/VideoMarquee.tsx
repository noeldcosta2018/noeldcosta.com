import { CHANNEL_URL, formatDuration, getChannelVideos, type ChannelVideo } from "@/lib/youtube-library";
import { translator } from "@/i18n";
import type { Locale } from "@/lib/locales";

// Every video on the channel, moving in two slow rows (opposite directions).
// Pure CSS animation: pauses on hover and keyboard focus, and becomes a
// swipeable static row under reduced motion. Links open the video on YouTube.

// YouTube titles use dashes as separators; the site uses a colon instead.
function plainTitle(title: string): string {
  return title.replace(/\s*[\u{2013}\u{2014}]\s*/gu, ": ");
}

function VideoCard({ video, hidden, titleLang }: { video: ChannelVideo; hidden?: boolean; titleLang?: string }) {
  const length = formatDuration(video.duration);
  return (
    <li className="nd-vcard" aria-hidden={hidden || undefined}>
      <a
        href={`https://www.youtube.com/watch?v=${video.id}`}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={hidden ? -1 : undefined}
        className="nd-glow"
      >
        <span className="thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
            alt={plainTitle(video.title)}
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            width={480}
            height={360}
          />
          <span className="play" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </span>
          {length && <span className="len">{length}</span>}
        </span>
        <span className="title" lang={titleLang}>
          {plainTitle(video.title)}
        </span>
      </a>
    </li>
  );
}

function Row({ videos, reverse, label, titleLang }: { videos: ChannelVideo[]; reverse?: boolean; label: string; titleLang?: string }) {
  return (
    <div className={`nd-marquee${reverse ? " reverse" : ""}`} role="region" aria-label={label}>
      <ul className="track">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} titleLang={titleLang} />
        ))}
        {/* Second copy makes the loop seamless; hidden from assistive tech and keyboard. */}
        {videos.map((v) => (
          <VideoCard key={`${v.id}-copy`} video={v} hidden titleLang={titleLang} />
        ))}
      </ul>
    </div>
  );
}

export default async function VideoMarquee({ locale = "en" }: { locale?: Locale }) {
  const tr = translator(locale);
  const titleLang = locale === "en" ? undefined : "en";
  const videos = await getChannelVideos();
  if (videos.length === 0) return null;
  const half = Math.ceil(videos.length / 2);
  const top = videos.slice(0, half);
  const bottom = videos.slice(half);

  return (
    <section data-tone="light" className="nd-section nd-videos" id="videos" aria-labelledby="videos-title">
      <div className="nd-container">
        <div className="nd-header-row">
          <div>
            <h2 id="videos-title" className="nd-display nd-h2">
              {tr("Watch the")} <span className="nd-hl">{tr("thinking.")}</span>
            </h2>
            <p className="nd-lede">
              {tr("{count} talks on SAP, ERP programmes, data and AI. Straight answers, from the work.").replace("{count}", String(videos.length))}
            </p>
          </div>
          <a className="nd-textlink" href={CHANNEL_URL} target="_blank" rel="noopener noreferrer">
            {tr("Subscribe on YouTube")} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <div className="nd-marquee-wrap">
        <Row videos={top} label={tr("Latest videos")} titleLang={titleLang} />
        {bottom.length > 0 && <Row videos={bottom} reverse label={tr("More videos")} titleLang={titleLang} />}
      </div>
    </section>
  );
}
