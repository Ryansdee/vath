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
}

interface TagSticker {
  tag: string;
  count: number;
  randomPhoto: string;
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
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
        setPhotos(data);

        const tagMap = new Map<string, Photo[]>();
        data.forEach(photo => {
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
        console.error("Erreur lors du chargement des photos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
        {/* Background blobs animés */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl animate-blob animate-slow"></div>
          <div className="absolute top-40 right-20 w-60 h-60 bg-purple-200 rounded-full blur-3xl animate-blob animate-slow animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-50 h-50 bg-pink-200 rounded-full blur-3xl animate-blob animate-slow animation-delay-4000"></div>
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-cyan-200 rounded-full blur-3xl animate-blob animate-slow animation-delay-1000"></div>
        </div>

        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-zinc-200"></div>
            <div className="absolute inset-0 border-4 border-black border-t-transparent animate-spin"></div>
            <div
              className="absolute inset-2 border-2 border-zinc-300 border-b-transparent animate-spin"
              style={{ animationDuration: "1.5s", animationDirection: "reverse" }}
            />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-black text-sm font-black uppercase tracking-wider">
              Loading
            </p>
            <span className="flex gap-1">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-1 h-1 bg-black rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background animé */}
      <div className="fixed inset-0 pointer-events-none">
        {[
          { top: "-20%", left: "-10%", w: "w-96", h: "h-96", color: "bg-black/30", delay: 0 },
          { top: "40%", right: "20%", w: "w-96", h: "h-96", color: "bg-black/30", delay: 2000 },
          { bottom: "-20%", left: "80%", w: "w-96", h: "h-96", color: "bg-black/30", delay: 4000 },
          { top: "50%", right: "30%", w: "w-32", h: "h-32", color: "bg-black/30", delay: 1000 },
        ].map((blob, i) => (
          <div
            key={i}
            className={`absolute ${blob.top ? `top-[${blob.top}]` : ""} ${blob.left ? `left-[${blob.left}]` : ""} ${blob.right ? `right-[${blob.right}]` : ""} ${blob.w} ${blob.h} ${blob.color} rounded-full blur-3xl animate-blob animate-slow`}
            style={{ animationDelay: `${blob.delay}ms` }}
          ></div>
        ))}
      </div>

      {/* Header */}
      <header className="pt-24 pb-12 md:pt-32 md:pb-16 px-4 md:px-6 relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl text-black font-black uppercase tracking-tighter mb-4 animate-in slide-in-from-top-4 fade-in duration-700">
          Photos
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
                  href={`/photo/${sticker.tag}`}
                  className="group relative aspect-square overflow-hidden bg-black border-4 border-black hover:border-zinc-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/20 animate-in fade-in zoom-in-95 duration-500"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <Image
                    src={sticker.randomPhoto}
                    alt={sticker.tag}
                    fill
                    className="object-cover group-hover:scale-110 group-hover:rotate-2 transition-all duration-700 ease-out"
                    quality={85}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <h3 className="text-2xl md:text-3xl font-black uppercase text-white mb-2 tracking-tight transform group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300 drop-shadow-lg">
                      {sticker.tag}
                    </h3>
                    <p className="text-xs md:text-sm text-zinc-300 uppercase tracking-wider opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                      {sticker.count} {sticker.count > 1 ? "Photos" : "Photo"}
                    </p>
                  </div>
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0"></div>
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-700">
              <div className="w-20 h-20 border-4 border-zinc-300 flex items-center justify-center mb-8 animate-pulse">
                <span className="text-3xl text-zinc-400 font-black">∅</span>
              </div>
              <p className="text-zinc-600 text-base uppercase tracking-wider text-center">
                Aucune photo disponible
              </p>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-slow {
          animation-duration: 10s !important;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}
