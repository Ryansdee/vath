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
  type?: string;
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

const formatDate = (date: VideoDate): string => {
  const d = normalizeDate(date);
  if (d.getTime() === 0) return "";
  
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return d.toLocaleDateString('en-EN', options);
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
        Loading videos...
      </p>
    </div>
  </div>
);

const Thumbnail = ({ video }: { video: Video }) => {
  if (video.thumbnail) {
    return (
      <Image
        src={video.thumbnail}
        alt={video.title?.trim() || "Video Thumbnail"}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-black text-white text-4xl">
      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    </div>
  );
};

const VideoCard = ({
  video,
  onClick,
}: {
  video: Video;
  onClick: (v: Video) => void;
}) => {
  const date = formatDate(video.createdAt);
  const hasDescription = video.description && video.description.trim().length > 0;
  
  return (
    <div
      onClick={() => onClick(video)}
      className="group cursor-pointer bg-white rounded-sm overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-video bg-black overflow-hidden">
        <Thumbnail video={video} />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Tags Badge */}
        {video.tags && video.tags.length > 0 && (
          <div className="absolute top-3 right-3 flex gap-1.5">
            {video.tags.slice(0, 2).map((tag, idx) => (
              <span 
                key={idx}
                className="px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4 space-y-2">
        {/* Title */}
        <h3 className="font-medium text-black text-base line-clamp-2 leading-snug group-hover:text-gray-600 transition-colors">
          {video.title}
        </h3>

        {/* Description */}
        {hasDescription && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{date || "Data no avaible"}</span>
          </div>
          
          {video.type && (
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              {video.type}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const VideoModal = ({
  video,
  onClose,
}: {
  video: Video;
  onClose: () => void;
}) => {
  const youtubeId = getYoutubeVideoId(video.url);
  const isExternal = isExternalVideoUrl(video.url);
  const date = formatDate(video.createdAt);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handler);
    
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors"
        aria-label="Fermer"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        className="w-full max-w-6xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video Player */}
        <div className="w-full aspect-video bg-black rounded-sm overflow-hidden shadow-2xl mb-4">
          {isExternal && youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              allowFullScreen
              className="w-full h-full"
            />
          ) : isExternal ? (
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full h-full text-white hover:text-gray-300 transition-colors"
            >
              <div className="text-center space-y-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="text-lg">Open video on extern link</span>
              </div>
            </a>
          ) : (
            <video
              src={video.url}
              controls
              autoPlay
              className="w-full h-full"
              poster={video.thumbnail}
            />
          )}
        </div>

        {/* Video Details */}
        <div className="bg-white/5 backdrop-blur-sm rounded-sm p-6 max-h-48 overflow-y-auto">
          <h2 className="text-2xl font-medium text-white mb-3">
            {video.title}
          </h2>

          {video.description && video.description.trim().length > 0 && (
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {video.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            {date && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{date}</span>
              </div>
            )}

            {video.type && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <span className="uppercase">{video.type}</span>
              </div>
            )}

            {video.tags && video.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {video.tags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-1 bg-white/10 text-white text-xs rounded-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
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
      <div className="min-h-screen bg-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-sm">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Videos Grid */}
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
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400 text-sm uppercase tracking-wide">
               No video available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  );
}