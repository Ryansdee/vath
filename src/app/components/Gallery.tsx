"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";

interface Photo {
  url: string;
  description: string;
  tags: string[];
}

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const snapshot = await getDocs(collection(db, "photos"));
        const data = snapshot.docs.map((doc) => doc.data() as Photo);
        setPhotos(data);
      } catch (error) {
        console.error("Erreur lors du chargement des photos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  const filteredPhotos = selectedTag
    ? photos.filter((p) => p.tags.includes(selectedTag))
    : photos;

  const allTags = Array.from(new Set(photos.flatMap((p) => p.tags)));

  return (
    <div className="min-h-screen bg-black px-4 md:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 md:gap-4 mb-4">
            <div className="h-px w-8 md:w-12 bg-white opacity-20"></div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white">
              <span className="relative">
                Filtres
                <span className="absolute top-0.5 left-0.5 text-zinc-800 -z-10">Filtres</span>
              </span>
            </h2>
          </div>

          {/* Filtres responsive */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            <button
              onClick={() => setSelectedTag(null)}
              className={`relative px-3 md:px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                selectedTag === null
                  ? "bg-white text-black shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)]"
                  : "bg-transparent text-zinc-500 border-2 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
              }`}
            >
              Tous
              {selectedTag === null && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-black"></span>
              )}
            </button>
            
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`relative px-3 md:px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  selectedTag === tag
                    ? "bg-white text-black shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)]"
                    : "bg-transparent text-zinc-500 border-2 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
                }`}
              >
                {tag}
                {selectedTag === tag && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-black"></span>
                )}
              </button>
            ))}
          </div>

          {/* Compteur */}
          <div className="mt-4 md:mt-6 flex items-center gap-3">
            <div className="h-px w-12 md:w-16 bg-zinc-800"></div>
            <p className="text-zinc-600 text-xs uppercase tracking-wider">
              {filteredPhotos.length} {filteredPhotos.length > 1 ? 'Photos' : 'Photo'}
            </p>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 md:py-24">
            <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-zinc-800 border-t-white animate-spin"></div>
            <p className="text-zinc-600 text-sm uppercase tracking-wider mt-4">Chargement...</p>
          </div>
        )}

        {/* Galerie responsive */}
        {!loading && filteredPhotos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredPhotos.map((photo, idx) => (
              <div 
                key={idx} 
                className="group relative bg-zinc-900 overflow-hidden transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]"
              >
                {/* Numéro */}
                <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 text-white font-black text-lg md:text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="relative">
                    {String(idx + 1).padStart(2, '0')}
                    <span className="absolute top-0.5 left-0.5 text-zinc-700 -z-10">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </span>
                </div>

                {/* Image */}
                <div className="relative h-48 md:h-64 overflow-hidden">
                  <Image
                    src={photo.url}
                    alt={photo.description}
                    width={600}
                    height={400}
                    className="object-cover w-full h-full transition-all duration-500 group-hover:scale-110 group-hover:brightness-75"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                  
                  {/* Bordure au hover */}
                  <div className="absolute inset-0 border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Contenu */}
                <div className="p-3 md:p-4 bg-black border-t-2 border-zinc-900">
                  <p className="text-zinc-400 text-xs md:text-sm mb-3 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
                    {photo.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {photo.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] md:text-xs bg-zinc-900 text-zinc-500 px-2 py-1 uppercase tracking-wider border border-zinc-800 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Coin décoratif */}
                <div className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 border-r-2 border-b-2 border-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredPhotos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 md:py-24">
            <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-zinc-800 flex items-center justify-center mb-6 md:mb-8">
              <span className="text-2xl md:text-3xl text-zinc-700 font-black">∅</span>
            </div>
            <p className="text-zinc-600 text-sm md:text-base uppercase tracking-wider text-center px-4">
              Aucune photo trouvée
            </p>
            <div className="flex items-center gap-3 md:gap-4 mt-8 md:mt-12">
              <div className="h-px w-8 md:w-12 bg-zinc-800"></div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-zinc-800"></div>
              <div className="h-px w-8 md:w-12 bg-zinc-800"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}