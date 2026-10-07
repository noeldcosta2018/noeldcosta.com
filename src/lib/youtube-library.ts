import snapshot from "@/data/youtube-videos.json";

// Every long-form video on @NoelDCostaERPAI. A snapshot of the full channel
// ships with the site; the channel RSS feed (latest 15 uploads) is merged in
// at build time and refreshed hourly, so new videos appear without an edit.

export interface ChannelVideo {
  id: string;
  title: string;
  publishedAt: string;
  duration?: string;
}

const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || snapshot.channelId;
export const CHANNEL_URL = "https://www.youtube.com/@NoelDCostaERPAI";

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function fetchLatest(): Promise<ChannelVideo[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`, {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; noeldcosta.com/1.0; +https://noeldcosta.com)",
        Accept: "application/atom+xml,text/xml;q=0.9,*/*;q=0.5",
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
      .map((m) => {
        const entry = m[1];
        const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
        const title = entry.match(/<title>([^<]*)<\/title>/)?.[1];
        const publishedAt = entry.match(/<published>([^<]+)<\/published>/)?.[1];
        if (!id || !title || !publishedAt) return null;
        // Shorts live under /shorts/ links; the scrolling strip is for long-form talks.
        if (/\/shorts\//.test(entry)) return null;
        return { id, title: decode(title), publishedAt: publishedAt.slice(0, 10) };
      })
      .filter((v): v is ChannelVideo => v !== null);
  } catch {
    return [];
  }
}

export async function getChannelVideos(): Promise<ChannelVideo[]> {
  const latest = await fetchLatest();
  const byId = new Map<string, ChannelVideo>();
  for (const v of snapshot.videos as ChannelVideo[]) byId.set(v.id, v);
  for (const v of latest) byId.set(v.id, { ...byId.get(v.id), ...v });
  return [...byId.values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** "PT15M43S" to "15:43". */
export function formatDuration(iso?: string): string | null {
  if (!iso) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = Number(m[1] ?? 0);
  const min = Number(m[2] ?? 0);
  const s = Number(m[3] ?? 0);
  const mm = h ? String(min).padStart(2, "0") : String(min);
  return `${h ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}
