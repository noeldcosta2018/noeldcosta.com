export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  badge?: string;
  badgeType?: "hot" | "new";
}

const FALLBACK_VIDEOS: YouTubeVideo[] = [
  {
    id: "fallback-1",
    title: "Will AI Kill SAP Functional Consulting?",
    description: "The video that got the SAP community talking",
    thumbnail: "",
    url: "https://www.youtube.com/@NoelDCostaERPAI",
    badge: "VIRAL",
    badgeType: "hot",
  },
  {
    id: "fallback-2",
    title: "ECC to S/4HANA Migration — What Nobody Tells You",
    description: "Timeline, costs, and the traps to avoid",
    thumbnail: "",
    url: "https://www.youtube.com/@NoelDCostaERPAI",
    badge: "NEW",
    badgeType: "new",
  },
  {
    id: "fallback-3",
    title: "Agentic AI in SAP — Practical Use Cases",
    description: "How AI agents work inside your ERP landscape",
    thumbnail: "",
    url: "https://www.youtube.com/@NoelDCostaERPAI",
  },
];

// ── RSS feed fetch (no API key required — just needs YOUTUBE_CHANNEL_ID) ──────
async function fetchViaRSS(
  channelId: string,
  count: number
): Promise<YouTubeVideo[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`RSS ${res.status}`);

  const xml = await res.text();

  // Each <entry> block contains one video
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(
    (m) => m[1]
  );

  return entries.slice(0, count).map((entry, i) => {
    const idMatch = entry.match(/<yt:videoId>([\w-]+)<\/yt:videoId>/);
    const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
    const thumbMatch = entry.match(/<media:thumbnail\s+url="([^"]+)"/);

    const videoId = idMatch?.[1] ?? "";
    const rawTitle = titleMatch?.[1] ?? "Untitled";
    // Unescape common HTML entities
    const title = rawTitle
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");

    const thumbnail =
      thumbMatch?.[1] ??
      (videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : "");

    return {
      id: videoId,
      title,
      description: "",
      thumbnail,
      url: videoId
        ? `https://www.youtube.com/watch?v=${videoId}`
        : "https://www.youtube.com/@NoelDCostaERPAI",
      badge: i === 0 ? "NEW" : undefined,
      badgeType: i === 0 ? ("new" as const) : undefined,
    };
  });
}

// ── YouTube Data API fetch ─────────────────────────────────────────────────────
async function fetchViaAPI(
  apiKey: string,
  channelId: string,
  count: number
): Promise<YouTubeVideo[]> {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${count}&order=date&type=video&key=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`YouTube API ${res.status}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.items.map((item: any, i: number) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: (item.snippet.description as string).slice(0, 100),
    thumbnail:
      item.snippet.thumbnails.high?.url ||
      item.snippet.thumbnails.default?.url ||
      "",
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    badge: i === 0 ? "NEW" : undefined,
    badgeType: i === 0 ? ("new" as const) : undefined,
  }));
}

export async function getYouTubeVideos(count = 3): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  // 1. Full API (best quality + descriptions)
  if (apiKey && channelId) {
    try {
      return await fetchViaAPI(apiKey, channelId, count);
    } catch (err) {
      console.error("YouTube API failed, trying RSS:", err);
    }
  }

  // 2. RSS feed (no API key needed — free, public, has thumbnails)
  if (channelId) {
    try {
      return await fetchViaRSS(channelId, count);
    } catch (err) {
      console.error("YouTube RSS failed, using fallback:", err);
    }
  }

  // 3. Static fallback
  return FALLBACK_VIDEOS.slice(0, count);
}
