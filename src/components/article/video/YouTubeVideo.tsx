import snapshot from "@/data/youtube-videos.json";
import YouTubeFacade from "./YouTubeFacade";

/**
 * One of Noel's YouTube videos inside an article.
 *
 * MDX usage (one line):
 *
 *   <youtube-video id="ZnpgGotaQcE"></youtube-video>
 *
 * Title, upload date and length come from the channel snapshot in
 * src/data/youtube-videos.json, so the tag only needs the video id. An
 * optional `title` attribute covers a video that is not in the snapshot.
 *
 * Privacy: no YouTube player, script or cookie loads until the reader
 * presses play. The poster is the video thumbnail from i.ytimg.com (an
 * image request only), and the player is youtube-nocookie.com, created on
 * click.
 *
 * SEO: emits a VideoObject so the page can earn a video result.
 */
type Props = {
  id?: string;
  title?: string;
  /** Translated "Play video" label (MdxBody passes it on translated pages). */
  "play-label"?: string;
};

type SnapshotVideo = { id: string; title: string; publishedAt: string; duration?: string };

const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function minutes(iso?: string): string | null {
  const m = iso?.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  const total = Number(m[1] || 0) * 60 + Number(m[2] || 0) + (Number(m[3] || 0) >= 30 ? 1 : 0);
  return total > 0 ? `${total} min` : null;
}

export default function YouTubeVideo(props: Props) {
  const id = props.id?.trim();
  if (!id || !ID_PATTERN.test(id)) return null;

  const meta = (snapshot.videos as SnapshotVideo[]).find((v) => v.id === id);
  const title = props.title || meta?.title;
  if (!title) return null;

  const thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const length = minutes(meta?.duration);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title,
    description: title,
    thumbnailUrl: [thumbnail],
    // Google wants a full datetime with a time zone, not a bare date.
    ...(meta?.publishedAt
      ? { uploadDate: /^\d{4}-\d{2}-\d{2}$/.test(meta.publishedAt) ? `${meta.publishedAt}T00:00:00Z` : meta.publishedAt }
      : {}),
    ...(meta?.duration ? { duration: meta.duration } : {}),
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    contentUrl: `https://www.youtube.com/watch?v=${id}`,
    author: { "@id": "https://noeldcosta.com/#noel-dcosta" },
  };

  return (
    <figure className="not-prose nd-block nd-video">
      <YouTubeFacade id={id} title={title} thumbnail={thumbnail} playLabel={props["play-label"] || "Play video"} />
      <figcaption className="nd-video-cap">
        <span className="t">{title}</span>
        {length && <span className="d">{length}</span>}
      </figcaption>
      <script
        type="application/ld+json"
        // JSON.stringify output escaped for an inline script.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </figure>
  );
}
