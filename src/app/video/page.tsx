"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "../../../lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  tags: string[];
  createdAt: Date | Timestamp;
}

interface ScrapedVideo {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnail?: string | null;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // --- Étape 1 : Charger depuis Firestore
        const snapshot = await getDocs(collection(db, "videos"));
        const localData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Video)
        );

        const sortedLocal = localData.sort((a, b) => {
          const da = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
          const dbb = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
          return dbb.getTime() - da.getTime();
        });

        setVideos(sortedLocal);

        // --- Étape 2 : Scraper YouTube
        const res = await fetch(
          `/api/scrape?channelUrl=https://www.youtube.com/@maindoeuvre.productions`
        );
        const data = await res.json();

        if (Array.isArray(data.videos)) {
          const youtubeVideos: Video[] = data.videos.map((v: ScrapedVideo) => ({
            id: v.id,
            title: v.title,
            description: v.description ?? "",
            url: v.url,
            thumbnail: v.thumbnail ?? undefined,
            tags: [],
            createdAt: new Date(), // → peut être remplacé plus tard par la vraie date publiée
          }));

          // Fusion locale + YouTube sans doublons
          const merged: Video[] = [
            ...youtubeVideos,
            ...sortedLocal.filter(
              (local) => !youtubeVideos.some((yt) => yt.id === local.id)
            ),
          ];

          const sortedMerged = merged.sort((a, b) => {
            const da = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
            const dbb = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
            return dbb.getTime() - da.getTime();
          });

          setVideos(sortedMerged);
        } else {
          console.warn("No videos found in scraper response", data);
        }
      } catch (error) {
        console.error("Error loading videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const isExternalVideo = (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname.includes("youtube") || u.hostname.includes("vimeo");
    } catch {
      return false;
    }
  };

  const getVideoPreview = (video: Video) => {
    if (video.thumbnail) {
      return (
        <Image
          src={video.thumbnail}
          alt={video.title || "Video thumbnail"}
          fill
          className="object-cover collection-image"
          quality={85}
        />
      );
    }

    try {
      const u = new URL(video.url);
      if (u.hostname.includes("youtube") || u.hostname.includes("youtu.be")) {
        const id = u.searchParams.get("v") || u.pathname.replace("/", "");
        return (
          <Image
            src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
            alt={video.title}
            fill
            className="object-cover collection-image"
          />
        );
      }
    } catch {}

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white text-3xl">
        🎥
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-black text-sm font-light uppercase tracking-wider">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.cdnfonts.com/css/acid-grotesk");
        * { font-family: "Acid Grotesk", sans-serif; }
      `}</style>

      <div className="min-h-screen bg-white pt-24 pb-16">
        <main className="px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {videos.map((video, index) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="collection-card cursor-pointer"
                    style={{ animationDelay: `${index * 0.08}s`, aspectRatio: "16/9" }}
                  >
                    <div className="relative w-full h-full bg-black">
                      {getVideoPreview(video)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center py-24 text-gray-400 uppercase tracking-wider">
                No videos available
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <button
            className="absolute top-8 right-8 text-white text-3xl hover:text-gray-400"
            onClick={() => setSelectedVideo(null)}
          >
            ×
          </button>

          <div className="w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video bg-black">
              {isExternalVideo(selectedVideo.url) ? (
                <>
                  {getVideoPreview(selectedVideo)}
                  <a
                    href={selectedVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition"
                  >
                    <span className="px-6 py-3 bg-white text-black text-xs uppercase rounded">
                      Regarder sur YouTube
                    </span>
                  </a>
                </>
              ) : (
                <video src={selectedVideo.url} controls className="w-full h-full" />
              )}
            </div>

            <div className="text-center mt-8 text-white">
              <h3 className="text-xl font-light uppercase">{selectedVideo.title}</h3>
              <p className="text-gray-400 text-sm mt-2">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
