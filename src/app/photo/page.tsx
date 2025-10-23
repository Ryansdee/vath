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

export default function PhotosPage() {
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
        
        const filteredData = data.filter(
          (photo) => photo.category === "photo" || !photo.category
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
        console.error("Erreur lors du chargement des photos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  if (loading) {
    return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-blue-700 text-sm font-light uppercase tracking-wider">
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
            {tagStickers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {tagStickers.map((sticker, index) => (
                  <Link
                    key={sticker.tag}
                    href={`/photo/${(sticker.tag).replace(' ', '-')}`}
                    className="collection-card fade-in"
                    style={{ 
                      animationDelay: `${index * 0.08}s`,
                      aspectRatio: '16/9'
                    }}
                  >
                    <div className="relative w-full h-full bg-black">
                      {/* Image */}
                      <Image
                        src={sticker.randomPhoto}
                        alt={sticker.tag}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="collection-image object-cover"
                        quality={85}
                        priority={index < 8}
                      />
                      
                      {/* Overlay with text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center hover:bg-black/60 z-10 p-4 transition-colors duration-300">
                        <div className="collection-text text-center">
                          <h3 
                            className="text-sm md:text-base font-light uppercase text-white mb-1 tracking-tight"
                            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                          >
                            {(sticker.tag).replace(' ', '-')}
                          </h3>
                          <p className="text-[10px] text-white/80 uppercase tracking-wider font-light">
                            {sticker.count}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24">
                <p className="text-gray-400 text-base uppercase tracking-wider text-center font-light">
                  Aucune photo disponible
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}