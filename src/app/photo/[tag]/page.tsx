"use client";

import { useEffect, useState, use } from "react";
import { db } from "../../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

interface Photo {
  id: string;
  url: string;
  description: string;
  tags: string[];
}

interface PageProps {
  params: Promise<{
    tag: string;
  }>;
}

export default function PhotosByTagPage({ params }: PageProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { tag: rawTag } = use(params);
  const tag = decodeURIComponent(rawTag);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const snapshot = await getDocs(collection(db, "photos"));
        const allPhotos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as Photo));

        // Filtrer les photos par tag
        const filteredPhotos = allPhotos.filter(photo => 
          photo.tags.includes(tag)
        );

        setPhotos(filteredPhotos);
      } catch (error) {
        console.error("Erreur lors du chargement des photos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, [tag]);

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
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link 
              href="/photo" 
              className="text-sm text-zinc-500 hover:text-black uppercase tracking-wider transition-colors duration-200"
            >
              ← Retour aux collections
            </Link>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-center text-black mb-4">
            {tag}
          </h1>

          <p className="text-center text-zinc-500 text-sm md:text-base uppercase tracking-wider mb-6">
            {photos.length} {photos.length > 1 ? 'Photos' : 'Photo'}
          </p>

          <div className="flex items-center justify-center gap-3 md:gap-4">
            <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-black to-transparent opacity-20"></div>
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="px-4 md:px-6 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto">
          {photos.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="break-inside-avoid group relative cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="relative overflow-hidden bg-zinc-100 border-4 border-black hover:border-zinc-400 transition-all duration-300">
                    <Image
                      src={photo.url}
                      alt={photo.description}
                      width={800}
                      height={600}
                      className="w-full h-auto transition-all duration-500 group-hover:scale-105"
                      quality={95}
                    />
                    
                    {/* Overlay au hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                        <p className="text-white text-sm md:text-base font-medium mb-2 line-clamp-2">
                          {photo.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {photo.tags.filter(t => t !== tag).slice(0, 2).map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] md:text-xs bg-white/20 text-white px-2 py-1 uppercase tracking-wider"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
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
              <p className="text-zinc-600 text-base uppercase tracking-wider text-center">
                Aucune photo dans cette collection
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Fermeture */}
          <button 
            className="absolute top-6 right-6 text-white text-4xl font-light hover:rotate-90 transition-transform duration-300 z-20"
            onClick={() => setSelectedPhoto(null)}
          >
            ×
          </button>

          {/* Image */}
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedPhoto.url}
              alt={selectedPhoto.description}
              width={1600}
              height={1200}
              className="max-h-[85vh] max-w-[85vw] w-auto h-auto object-contain"
              quality={100}
            />
            
            {/* Bordure */}
            <div className="absolute inset-0 border-4 border-white pointer-events-none"></div>
            
            {/* Coins décoratifs */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-white"></div>
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-white"></div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-white"></div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-white"></div>

            {/* Info en bas */}
            <div className="absolute -bottom-20 left-0 right-0 text-center">
              <p className="text-zinc-400 text-sm mb-2">{selectedPhoto.description}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedPhoto.tags.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs text-zinc-500 uppercase tracking-wider"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Ligne décorative en bas */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-1 bg-white"></div>
        </div>
      )}
    </div>
  );
}