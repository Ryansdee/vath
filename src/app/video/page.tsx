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
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-black text-sm font-light uppercase tracking-wider">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/acid-grotesk');
        
        * {
          font-family: 'Acid Grotesk', sans-serif;
        }
        
        .collection-card {
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .collection-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            transparent 0%,
            rgba(0, 0, 0, 0.1) 50%,
            rgba(0, 0, 0, 0.3) 100%
          );
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 1;
        }
        
        .collection-card:hover::before {
          opacity: 1;
        }
        
        .collection-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        .collection-image {
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .collection-card:hover .collection-image {
          transform: scale(1.08);
        }
        
        .collection-text {
          transform: translateY(8px);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .collection-card:hover .collection-text {
          transform: translateY(0);
          opacity: 1;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-in {
          animation: fadeInUp 0.6s ease-out forwards;
        }
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
                    className="collection-card fade-in cursor-pointer"
                    style={{ 
                      animationDelay: `${index * 0.08}s`,
                      aspectRatio: '16/9'
                    }}
                  >
                    <div className="relative w-full h-full bg-black">
                      {/* Image */}
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="collection-image object-cover"
                        quality={85}
                        priority={index < 8}
                      />
                      
                      {/* Overlay with text and play button */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center hover:bg-black/60 z-10 p-4 transition-colors duration-300">
                        <div className="collection-text text-center">
                          {/* Play button */}
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-white flex items-center justify-center mx-auto mb-4 backdrop-blur-sm bg-white/10">
                            <div className="w-0 h-0 border-t-[8px] md:border-t-[10px] border-t-transparent border-l-[12px] md:border-l-[16px] border-l-white border-b-[8px] md:border-b-[10px] border-b-transparent ml-1"></div>
                          </div>
                          
                          <h3 
                            className="text-sm md:text-base font-light uppercase text-white mb-1 tracking-tight"
                            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                          >
                            {video.title}
                          </h3>
                          
                          {video.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center">
                              {video.tags.slice(0, 2).map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] text-white/80 uppercase tracking-wider font-light"
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
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24">
                <p className="text-gray-400 text-base uppercase tracking-wider text-center font-light">
                  No videos available
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Video */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <button
            className="absolute top-8 right-8 text-white text-3xl font-light hover:text-gray-400 transition-colors z-10"
            onClick={() => setSelectedVideo(null)}
            aria-label="Close"
          >
            ×
          </button>
          <div className="w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video bg-black overflow-hidden">
              <iframe
                src={selectedVideo.url}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                title={selectedVideo.title}
              />
            </div>
            <div className="mt-8 text-center px-4">
              <h3 className="text-xl font-light uppercase text-white mb-3 tracking-tight">
                {selectedVideo.title}
              </h3>
              <p className="text-gray-400 text-sm font-light max-w-3xl mx-auto">
                {selectedVideo.description}
              </p>
              {selectedVideo.tags.length > 0 && (
                <div className="flex flex-wrap gap-3 justify-center mt-6">
                  {selectedVideo.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-gray-500 uppercase tracking-wider font-light"
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
    </>
  );
}