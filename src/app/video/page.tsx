"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface Video {
  id: string;
  title: string;
  description: string;
  url: string; // URL YouTube/Vimeo
  thumbnail: string;
  tags: string[];
  createdAt: Date;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const snapshot = await getDocs(collection(db, "videos"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as Video));
        setVideos(data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      } catch (error) {
        console.error("Erreur lors du chargement des vidéos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-zinc-300 border-t-black animate-spin"></div>
          <p className="text-zinc-600 text-sm uppercase tracking-wider">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="pt-24 pb-12 md:pt-32 md:pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-center text-black mb-4">
            Videos
          </h1>
          <p className="text-center text-zinc-500 text-sm md:text-base uppercase tracking-wider mb-6">
            {videos.length} {videos.length > 1 ? 'Vidéos' : 'Vidéo'}
          </p>
          <div className="flex items-center justify-center gap-3 md:gap-4">
            <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-black to-transparent opacity-20"></div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 md:px-6 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto">
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-video bg-black border-4 border-black hover:border-zinc-400 transition-all duration-300 overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 border-4 border-white flex items-center justify-center">
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-black mb-2">
                      {video.title}
                    </h3>
                    <p className="text-sm text-zinc-600 line-clamp-2">{video.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {video.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs text-zinc-500 uppercase tracking-wider">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-20 h-20 border-4 border-zinc-300 flex items-center justify-center mb-8">
                <span className="text-3xl text-zinc-400 font-black">∅</span>
              </div>
              <p className="text-zinc-600 text-base uppercase tracking-wider">Aucune vidéo disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Video */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <button
            className="absolute top-6 right-6 text-white text-4xl font-light hover:rotate-90 transition-transform duration-300"
            onClick={() => setSelectedVideo(null)}
          >
            ×
          </button>
          <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video border-4 border-white">
              <iframe
                src={selectedVideo.url}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-black text-white uppercase mb-2">{selectedVideo.title}</h3>
              <p className="text-zinc-400 text-sm">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}