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

export async function getYouTubeVideos(count = 3): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    return FALLBACK_VIDEOS.slice(0, count);
  }

  try {
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
  } catch (err) {
    console.error("YouTube fetch failed, using fallback:", err);
    return FALLBACK_VIDEOS.slice(0, count);
  }
}
