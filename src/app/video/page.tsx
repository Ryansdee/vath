"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
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
        console.error("Error loading videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#090860] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[#090860] text-sm font-semibold uppercase tracking-wider">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="pt-32 pb-16 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold uppercase text-black mb-3 tracking-tight">
            Videos
          </h1>
          <p className="text-gray-500 text-sm">
            {videos.length} {videos.length > 1 ? "videos" : "video"}
          </p>
        </div>
      </header>

      {/* Grid */}
      <main className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className="group cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative aspect-video bg-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      quality={85}
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-[#090860] border-b-[10px] border-b-transparent ml-1"></div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#090860] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg md:text-xl font-bold text-black mb-2 tracking-tight group-hover:text-[#090860] transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {video.description}
                    </p>
                    {video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {video.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32">
              <p className="text-gray-400 text-sm">No videos available</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Video */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedVideo(null)}
        >
          <button
            className="absolute top-6 right-6 text-white text-4xl font-light hover:rotate-90 transition-transform duration-300 z-10"
            onClick={() => setSelectedVideo(null)}
            aria-label="Close"
          >
            ×
          </button>
          <div className="w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video bg-black shadow-2xl overflow-hidden">
              <iframe
                src={selectedVideo.url}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                title={selectedVideo.title}
              />
            </div>
            <div className="mt-6 text-center px-4">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                {selectedVideo.title}
              </h3>
              <p className="text-gray-400 text-sm md:text-base max-w-3xl mx-auto">
                {selectedVideo.description}
              </p>
              {selectedVideo.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {selectedVideo.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs text-gray-400 px-3 py-1 bg-white/10 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}