"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface MediaItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  type: "press" | "interview" | "feature" | "publication";
  source: string;
  date: string;
  createdAt: Date;
}

export default function MediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const snapshot = await getDocs(collection(db, "media"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as MediaItem));
        setMediaItems(data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      } catch (error) {
        console.error("Error loading media:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  const types = ["all", ...Array.from(new Set(mediaItems.map(item => item.type)))];
  const filteredMedia = selectedType === "all" 
    ? mediaItems 
    : mediaItems.filter(item => item.type === selectedType);

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
            Media
          </h1>
          <p className="text-gray-500 text-sm">
            Press, interviews & features
          </p>
        </div>
      </header>

      {/* Filters */}
      {types.length > 1 && (
        <div className="px-6 py-8 border-b border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-3">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    selectedType === type
                      ? "bg-[#090860] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <main className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {filteredMedia.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMedia.map((item, index) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative aspect-video bg-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      quality={85}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                    
                    {/* Type badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm">
                      <span className="text-xs font-semibold text-black uppercase tracking-wider">
                        {item.type}
                      </span>
                    </div>

                    {/* External link icon */}
                    <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#090860] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-gray-500 font-medium">
                        {item.source}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{item.date}</span>
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-black mb-2 tracking-tight group-hover:text-[#090860] transition-colors line-clamp-2">
                      {item.title}
                    </h2>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32">
              <p className="text-gray-400 text-sm">No media available</p>
            </div>
          )}
        </div>
      </main>

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