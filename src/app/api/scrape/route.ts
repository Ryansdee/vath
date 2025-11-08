import axios from "axios";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // nécessaire pour parsing lourd HTML

interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string | null;
  publishedText: string | null;
  description: string;
}

/** 🔍 Extraction du JSON ytInitialData depuis le HTML */
function extractYtInitialData(html: string): unknown | null {
  const initDataRegex = /ytInitialData\s*=\s*(\{.*?\});/s;
  const altRegex = /window\['ytInitialData'\]\s*=\s*(\{.*?\});/s;
  const match = html.match(initDataRegex) || html.match(altRegex);

  let json: string | null = null;

  if (match) {
    json = match[1];
  } else {
    const idx = html.indexOf("ytInitialData");
    if (idx === -1) return null;
    const start = html.indexOf("{", idx);
    if (start === -1) return null;

    let depth = 0;
    let end = start;

    for (let i = start; i < html.length; i++) {
      if (html[i] === "{") depth++;
      else if (html[i] === "}") {
        depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }

    json = html.slice(start, end);
  }

  try {
    return JSON.parse(json!);
  } catch {
    return null;
  }
}

/** 🧭 Accès sécurisé à une propriété profondément imbriquée */
function walk(obj: unknown, path: string): unknown {
  return path.split(".").reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return null;
  }, obj);
}

/** 🎥 Extraction des vidéos depuis le JSON */
function parseVideosFromInitialData(initialData: unknown): YouTubeVideo[] {
  const contents =
    (walk(initialData, "contents.twoColumnBrowseResultsRenderer.tabs") as unknown[]) || [];

  let videosTab = contents.find((t) => {
    const titleValue = walk(t, "tabRenderer.title");
    const title = typeof titleValue === "string" ? titleValue : null;
    return title ? /vidéos|videos/i.test(title) : false;
  });

  if (!videosTab) {
    videosTab = contents.find((t) => walk(t, "tabRenderer.content.richGridRenderer") !== null);
  }

  const grid =
    (walk(videosTab, "tabRenderer.content.richGridRenderer.contents") as unknown[]) ||
    (walk(videosTab, "tabRenderer.content.sectionListRenderer.contents") as unknown[]) ||
    [];

  const videoItems: YouTubeVideo[] = [];

  for (const item of grid) {
    const vr =
      walk(item, "richItemRenderer.content.videoRenderer") ||
      walk(item, "gridVideoRenderer") ||
      walk(item, "videoRenderer");

    if (!vr || typeof vr !== "object") continue;

    const v = vr as Record<string, unknown>;
    const videoId = v.videoId as string | undefined;
    if (!videoId) continue;

    const titleSimple = walk(v, "title.simpleText") as string | null;

    const titleRuns = walk(v, "title.runs") as { text: string }[] | null;
    const title =
      titleSimple || (titleRuns ? titleRuns.map((r) => r.text).join("") : "");

    const publishedSimple = walk(v, "publishedTimeText.simpleText") as string | null;
    const publishedRuns = walk(v, "publishedTimeText.runs") as { text: string }[] | null;
    const publishedText =
      publishedSimple || (publishedRuns ? publishedRuns.map((r) => r.text).join("") : null);

    const thumbs = walk(v, "thumbnail.thumbnails") as { url: string }[] | null;
    const thumbnail = thumbs ? thumbs.slice(-1)[0]?.url ?? null : null;

    const descRuns = walk(v, "descriptionSnippet.runs") as { text: string }[] | null;
    const description = descRuns ? descRuns.map((r) => r.text).join("") : "";

    videoItems.push({
      id: videoId,
      title,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail,
      publishedText,
      description,
    });
  }

  return videoItems;
}

/** 🚀 Handler Next.js API route */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const channelUrl = searchParams.get("channelUrl");

  if (!channelUrl) {
    return NextResponse.json({ error: "channelUrl required" }, { status: 400 });
  }

  try {
    const target = channelUrl.replace(/\/$/, "") + "/videos";
    const resp = await axios.get(target, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      timeout: 15000,
    });

    const html = resp.data;
    const initialData = extractYtInitialData(html);

    if (!initialData) {
      return NextResponse.json(
        { error: "Could not extract ytInitialData" },
        { status: 500 }
      );
    }

    const videos = parseVideosFromInitialData(initialData);

    return NextResponse.json({
      source: target,
      count: videos.length,
      videos,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("scrape error:", message);
    return NextResponse.json(
      { error: "Scrape failed", detail: message },
      { status: 500 }
    );
  }
}
