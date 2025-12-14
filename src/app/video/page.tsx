"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { db } from "../../../lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";

/* ======================================================
   1. TYPES & INTERFACES
====================================================== */

type VideoDate = Date | Timestamp | string | null | undefined;

interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnail?: string;
  tags: string[];
  createdAt: VideoDate;
}

interface ScrapedVideo {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnail?: string | null;
}

/* ======================================================
   2. UTILITAIRES SÛRS (ANTI-CRASH)
====================================================== */

/**
 * Normalise n’importe quel type de date en Date JS.
 * GARANTI : retourne toujours un Date valide.
 */
const normalizeDate = (date: VideoDate): Date => {
  if (!date) return new Date(0);

  if (date instanceof Date) return date;

  if (date instanceof Timestamp) return date.toDate();

  if (typeof date === "string") {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? new Date(0) : parsed;
  }

  return new Date(0);
};

/**
 * Trie les vidéos du plus récent au plus ancien.
 * Clone le tableau pour éviter les effets de bord React.
 */
const sortVideos = (videos: Video[]): Video[] => {
  return [...videos].sort((a, b) => {
    const dateA = normalizeDate(a.createdAt);
    const dateB = normalizeDate(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });
};

const getYoutubeVideoId = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v");
    }
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "");
    }
  } catch {}
  return null;
};

const isExternalVideoUrl = (url: string): boolean => {
  try {
    const u = new URL(url);
    return (
      u.hostname.includes("youtube") ||
      u.hostname.includes("youtu.be") ||
      u.hostname.includes("vimeo")
    );
  } catch {
    return false;
  }
};

/* ======================================================
   3. UI — COMPOSANTS
====================================================== */

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-16 h-16">
        <div className="border-4 border-gray-100 rounded-full w-full h-full"></div>
        <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-black text-sm uppercase tracking-wider">
        Chargement des vidéos…
      </p>
    </div>
  </div>
);

const Thumbnail = ({ video }: { video: Video }) => {
  if (video.thumbnail) {
    return (
      <Image
        src={video.thumbnail}
        alt={video.title?.trim() || "Miniature de la vidéo"}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 33vw"
      />
    );
  }

  const youtubeId = getYoutubeVideoId(video.url);
  if (youtubeId) {
    return (
      <Image
        src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.webp`}
        alt={video.title}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 33vw"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black text-white text-3xl">
      🎥
    </div>
  );
};

const VideoCard = ({
  video,
  onClick,
}: {
  video: Video;
  onClick: (v: Video) => void;
}) => (
  <div
    onClick={() => onClick(video)}
    className="group cursor-pointer rounded-lg overflow-hidden shadow hover:shadow-lg transition aspect-video bg-black"
  >
    <div className="relative w-full h-full">
      <Thumbnail video={video} />
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
        <span className="text-white text-4xl">▶</span>
      </div>
    </div>
  </div>
);

const VideoModal = ({
  video,
  onClose,
}: {
  video: Video;
  onClose: () => void;
}) => {
  const youtubeId = getYoutubeVideoId(video.url);
  const isExternal = isExternalVideoUrl(video.url);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl aspect-video bg-black relative"
        onClick={(e) => e.stopPropagation()}
      >
        {isExternal && youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : isExternal ? (
          <a
            href={video.url}
            target="_blank"
            className="absolute inset-0 flex items-center justify-center text-white"
          >
            Ouvrir la vidéo
          </a>
        ) : (
          <video
            src={video.url}
            controls
            autoPlay
            className="absolute inset-0 w-full h-full"
            poster={video.thumbnail}
          />
        )}
      </div>
    </div>
  );
};

/* ======================================================
   4. PAGE PRINCIPALE
====================================================== */

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [firestoreSnap, scraperRes] = await Promise.all([
        getDocs(collection(db, "videos")),
        fetch(
          "/api/scrape?channelUrl=https://www.youtube.com/@maindoeuvre.productions"
        ).then((r) => {
          if (!r.ok) throw new Error("Scraper failed");
          return r.json();
        }),
      ]);

      const firestoreVideos: Video[] = firestoreSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Video, "id">),
      }));

      const youtubeVideos: Video[] = Array.isArray(scraperRes.videos)
        ? scraperRes.videos.map((v: ScrapedVideo) => ({
            id: v.id,
            title: v.title,
            description: v.description ?? "",
            url: v.url,
            thumbnail: v.thumbnail ?? undefined,
            tags: [],
            createdAt: Timestamp.fromDate(new Date()),
          }))
        : [];

      const merged = new Map<string, Video>();
      firestoreVideos.forEach((v) => merged.set(v.id, v));
      youtubeVideos.forEach((v) => merged.set(v.id, v));

      setVideos(sortVideos(Array.from(merged.values())));
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des vidéos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="min-h-screen bg-white pt-24 px-6">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((v) => (
              <VideoCard
                key={v.id}
                video={v}
                onClick={setSelectedVideo}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 uppercase">
            Aucune vidéo disponible
          </p>
        )}
      </div>

      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  );
}
