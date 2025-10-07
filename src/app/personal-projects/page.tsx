"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

interface Photo {
  id: string;
  url: string;
  description: string;
  tags: string[];
  category?: string;
}

interface TagSticker {
  tag: string;
  count: number;
  randomPhoto: string;
}

export default function PersonalProjectsPage() {
  const [, setPhotos] = useState<Photo[]>([]);
  const [tagStickers, setTagStickers] = useState<TagSticker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const snapshot = await getDocs(collection(db, "photos"));
        const data: Photo[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Photo, "id">),
        }));
        
        // Filtrer uniquement les items avec category "personal-project"
        const filteredData = data.filter(photo => 
          photo.category === "personal-project"
        );
        
        setPhotos(filteredData);

        const tagMap = new Map<string, Photo[]>();
        filteredData.forEach(photo => {
          photo.tags.forEach(tag => {
            if (!tagMap.has(tag)) tagMap.set(tag, []);
            tagMap.get(tag)?.push(photo);
          });
        });

        const stickers: TagSticker[] = Array.from(tagMap.entries()).map(
          ([tag, photos]) => ({
            tag,
            count: photos.length,
            randomPhoto: photos[Math.floor(Math.random() * photos.length)].url,
          })
        );

        setTagStickers(stickers);
      } catch (error) {
        console.error("Erreur lors du chargement des projets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
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
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Header */}
      <header className="pt-24 pb-12 md:pt-32 md:pb-16 px-4 md:px-6 relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl text-black font-black uppercase tracking-tighter mb-4 animate-in slide-in-from-top-4 fade-in duration-700">
          Personal Projects
        </h1>
        <p className="text-zinc-500 text-sm md:text-base uppercase tracking-wider mb-6 animate-in fade-in duration-700 delay-200">
          {tagStickers.length} {tagStickers.length > 1 ? "Collections" : "Collection"}
        </p>
        <div className="flex justify-center">
          <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-black to-transparent opacity-20"></div>
        </div>
      </header>

      {/* Stickers Grid */}
      <main className="px-4 md:px-6 pb-16 md:pb-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          {tagStickers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {tagStickers.map((sticker, index) => (
                <Link
                  key={sticker.tag}
                  href={`/personal-projects/${sticker.tag}`}
                  title={`See collection of "${sticker.tag}" (${sticker.count} items)`}
                  className="group relative aspect-square overflow-hidden bg-gray-100 transition-transform duration-300 hover:scale-[1.02] will-change-transform"
                  style={{ 
                    animationDelay: `${index * 80}ms`,
                  }}
                >
                  <Image
                    src={sticker.randomPhoto}
                    alt={sticker.tag}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    quality={85}
                    priority={index < 4}
                  />
                  
                  {/* Overlay - toujours visible sur mobile, hover sur desktop */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:bg-black/0 md:backdrop-blur-0 md:group-hover:bg-black/60 transition-all duration-400 ease-out" />
                  
                  {/* Texte - toujours visible sur mobile, hover sur desktop */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end md:justify-center pb-4 md:pb-0 opacity-100 translate-y-0 md:opacity-0 md:translate-y-6 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-400 ease-out text-center px-4 pointer-events-none">
                    <h3 className="text-xl md:text-3xl font-black uppercase text-white mb-1 md:mb-2 tracking-tight drop-shadow-2xl">
                      {sticker.tag}
                    </h3>
                    <p className="text-xs md:text-sm text-white/90 uppercase tracking-wider font-medium">
                      {sticker.count} {sticker.count > 1 ? "Items" : "Item"}
                    </p>
                  </div>

                  {/* Barre du bas - visible uniquement au hover sur desktop */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left hidden md:block" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-700">
              <div className="w-20 h-20 border-4 border-zinc-300 flex items-center justify-center mb-8 animate-pulse">
                <span className="text-3xl text-zinc-400 font-black">∅</span>
              </div>
              <p className="text-zinc-600 text-base uppercase tracking-wider text-center">
                No projects available yet
              </p>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}