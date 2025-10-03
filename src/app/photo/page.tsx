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
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as Photo));
        setPhotos(data);

        // Créer les stickers par tag
        const tagMap = new Map<string, Photo[]>();
        
        data.forEach(photo => {
          photo.tags.forEach(tag => {
            if (!tagMap.has(tag)) {
              tagMap.set(tag, []);
            }
            tagMap.get(tag)?.push(photo);
          });
        });

        // Créer les stickers avec une photo aléatoire pour chaque tag
        const stickers: TagSticker[] = Array.from(tagMap.entries()).map(([tag, photos]) => {
          const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
          return {
            tag,
            count: photos.length,
            randomPhoto: randomPhoto.url
          };
        });

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
            Photos
          </h1>

          <p className="text-center text-zinc-500 text-sm md:text-base uppercase tracking-wider mb-6">
            {tagStickers.length} {tagStickers.length > 1 ? 'Collections' : 'Collection'}
          </p>

          <div className="flex items-center justify-center gap-3 md:gap-4">
            <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-black to-transparent opacity-20"></div>
          </div>
        </div>
      </div>

      {/* Stickers Grid */}
      <div className="px-4 md:px-6 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto">
          {tagStickers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {tagStickers.map((sticker) => (
                <Link
                  key={sticker.tag}
                  href={`/photo/${sticker.tag}`}
                  className="group relative aspect-square overflow-hidden bg-black border-4 border-black hover:border-zinc-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  {/* Image de fond */}
                  <Image
                    src={sticker.randomPhoto}
                    alt={sticker.tag}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    quality={85}
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-black/90 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                  {/* Contenu du sticker */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <h3 className="text-2xl md:text-3xl font-black uppercase text-white mb-2 tracking-tight transform group-hover:scale-110 transition-transform duration-300">
                      {sticker.tag}
                    </h3>
                    <p className="text-xs md:text-sm text-zinc-300 uppercase tracking-wider">
                      {sticker.count} {sticker.count > 1 ? 'Photos' : 'Photo'}
                    </p>
                  </div>

                  {/* Coin décoratif */}
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-20 h-20 border-4 border-zinc-300 flex items-center justify-center mb-8">
                <span className="text-3xl text-zinc-400 font-black">∅</span>
              </div>
              <p className="text-zinc-600 text-base uppercase tracking-wider text-center">
                Aucune photo disponible
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}