"use client";

import { useEffect, useState, use, useCallback } from "react";
import { db } from "../../../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

interface Photo {
  id: string;
  url: string;
  description: string;
  tags: string[];
}

interface TagText {
  id: string;
  tag: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PageProps {
  params: Promise<{
    tag: string;
  }>;
}

export default function PhotosByTagPage({ params }: PageProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tagText, setTagText] = useState<TagText | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showFullText, setShowFullText] = useState(false);
  const { tag: rawTag } = use(params);
  const tag = decodeURIComponent(rawTag);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les photos
        const photosSnapshot = await getDocs(collection(db, "photos"));
        const allPhotos = photosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as Photo));

        const filteredPhotos = allPhotos.filter(photo => 
          photo.tags.includes(tag)
        );

        setPhotos(filteredPhotos);

        // Charger le texte associé au tag
        const textsQuery = query(
          collection(db, "tagTexts"),
          where("tag", "==", tag)
        );
        const textsSnapshot = await getDocs(textsQuery);
        
        if (!textsSnapshot.empty) {
          const textDoc = textsSnapshot.docs[0];
          setTagText({
            id: textDoc.id,
            ...textDoc.data(),
            createdAt: textDoc.data().createdAt?.toDate() || new Date(),
            updatedAt: textDoc.data().updatedAt?.toDate() || new Date()
          } as TagText);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tag]);

  // Navigation entre photos
  const handlePrevPhoto = useCallback(() => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
    setSelectedPhoto(photos[prevIndex]);
  }, [selectedPhoto, photos]);

  const handleNextPhoto = useCallback(() => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
    setSelectedPhoto(photos[nextIndex]);
  }, [selectedPhoto, photos]);

  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      if (e.key === "ArrowLeft") handlePrevPhoto();
      if (e.key === "ArrowRight") handleNextPhoto();
      if (e.key === "Escape") setSelectedPhoto(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, handlePrevPhoto, handleNextPhoto]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-zinc-300 border-t-black rounded-full animate-spin"></div>
          <p className="text-zinc-600 text-sm uppercase tracking-wider font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  const isTextLong = tagText && tagText.content.length > 400;

  return (
    <div className="min-h-screen bg-white">
      {/* Header amélioré */}
      <div className="pt-24 pb-8 md:pt-32 md:pb-12 px-4 md:px-6 border-b border-zinc-100">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb stylisé */}
          <div className="mb-6 md:mb-8">
            <Link 
              href="/photo" 
              className="group inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-black uppercase tracking-wider transition-all duration-200 font-medium"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Collections
            </Link>
          </div>

          {/* Titre avec animation */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-black mb-2 animate-fade-in">
              {tag}
            </h1>

            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-black/20"></div>
              <p className="text-zinc-500 text-xs md:text-sm uppercase tracking-[0.2em] font-semibold">
                {photos.length} {photos.length > 1 ? 'Photos' : 'Photo'}
              </p>
              <div className="h-px w-12 bg-black/20"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Section texte d'introspection optimisée */}
      {tagText && (
        <div className="px-4 md:px-6 py-12 md:py-16 bg-gradient-to-b from-zinc-50/50 to-white">
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              {/* Décoration d'angle */}
              <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-black/20"></div>
              <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-black/20"></div>
              
              <div className="bg-white border-l-4 border-black p-8 md:p-12 shadow-sm hover:shadow-md transition-shadow duration-300">
                {tagText.title && (
                  <div className="mb-6">
                    <div className="inline-block">
                      <h2 className="text-2xl md:text-4xl font-black text-black tracking-tight mb-2">
                        {tagText.title}
                      </h2>
                      <div className="h-1 w-16 bg-black"></div>
                    </div>
                  </div>
                )}
                
                <div className="prose prose-lg prose-zinc max-w-none">
                  <div className={`text-zinc-700 leading-[1.8] text-base md:text-lg ${!showFullText && isTextLong ? 'line-clamp-6' : ''}`}>
                    {tagText.content.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-4 last:mb-0">
                        {paragraph.split(/(@[\w.]+)/).map((part, j) => {
                          if (part.startsWith('@')) {
                            const username = part.slice(1);
                            return (
                              <a
                                key={j}
                                href={`https://www.instagram.com/${username}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-black font-bold hover:text-zinc-600 underline decoration-2 underline-offset-2 transition-colors"
                              >
                                {part}
                              </a>
                            );
                          }
                          return <span key={j}>{part}</span>;
                        })}
                      </p>
                    ))}
                  </div>
                </div>

                {isTextLong && (
                  <button
                    onClick={() => setShowFullText(!showFullText)}
                    className="mt-6 text-sm font-semibold text-black hover:text-zinc-600 uppercase tracking-wider flex items-center gap-2 group/btn transition-colors"
                  >
                    {showFullText ? 'Réduire' : 'Lire plus'}
                    <svg 
                      className={`w-4 h-4 transition-transform ${showFullText ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}

                {/* Date discrète */}
                <div className="mt-8 pt-6 border-t border-zinc-100">
                  <p className="text-xs text-zinc-400 uppercase tracking-widest">
                    Mis à jour le {tagText.updatedAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grille photos optimisée */}
      <div className="px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          {photos.length > 0 ? (
            <>
              {/* Titre de section si texte présent */}
              {tagText && (
                <div className="mb-12 text-center">
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
                    Galerie
                  </h3>
                  <div className="mt-4 h-px w-24 bg-black mx-auto"></div>
                </div>
              )}
              
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="break-inside-avoid group relative cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <div className="relative overflow-hidden bg-zinc-100 border-4 border-black hover:border-zinc-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                      <Image
                        src={photo.url}
                        alt={photo.description}
                        width={800}
                        height={600}
                        className="w-full h-auto transition-all duration-700 group-hover:scale-110"
                        quality={95}
                        loading={index < 6 ? "eager" : "lazy"}
                      />
                      
                      {/* Overlay amélioré */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-white text-base font-semibold mb-3 line-clamp-2">
                            {photo.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {photo.tags.filter(t => t !== tag).slice(0, 3).map((t, i) => (
                              <span
                                key={i}
                                className="text-xs bg-white/30 backdrop-blur-sm text-white px-3 py-1 uppercase tracking-wider font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Badge numéro */}
                      <div className="absolute top-4 left-4 w-8 h-8 bg-black text-white flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-24 h-24 border-4 border-zinc-200 flex items-center justify-center mb-8 rounded-full">
                <svg className="w-12 h-12 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-zinc-500 text-lg uppercase tracking-wider font-semibold text-center">
                Aucune photo dans cette collection
              </p>
              <Link 
                href="/photo"
                className="mt-6 px-6 py-3 bg-black text-white text-sm uppercase tracking-wider font-semibold hover:bg-zinc-800 transition-colors"
              >
                Voir toutes les collections
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox amélioré */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Boutons de navigation */}
          <button 
            onClick={(e) => { e.stopPropagation(); handlePrevPhoto(); }}
            className="hidden md:block absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 hover:scale-110 z-30"
            aria-label="Photo précédente"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); handleNextPhoto(); }}
            className="hidden md:block absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 hover:scale-110 z-30"
            aria-label="Photo suivante"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Bouton fermeture */}
          <button 
            className="absolute top-4 md:top-6 right-4 md:right-6 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 hover:rotate-90 z-30 group"
            onClick={() => setSelectedPhoto(null)}
            aria-label="Fermer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Compteur */}
          <div className="absolute top-4 md:top-6 left-4 md:left-6 px-4 py-2 bg-white/10 backdrop-blur-md text-white text-sm font-semibold uppercase tracking-wider z-30">
            {photos.findIndex(p => p.id === selectedPhoto.id) + 1} / {photos.length}
          </div>

          {/* Image */}
          <div className="relative max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedPhoto.url}
              alt={selectedPhoto.description}
              width={1600}
              height={1200}
              className="max-h-[80vh] max-w-[85vw] w-auto h-auto object-contain"
              quality={100}
              priority
            />
            
            {/* Bordure élégante */}
            <div className="absolute inset-0 border-2 border-white/30 pointer-events-none"></div>

            {/* Info en bas */}
            <div className="absolute -bottom-24 md:-bottom-28 left-0 right-0 text-center px-4">
              <p className="text-white text-sm md:text-base font-medium mb-3 line-clamp-2">
                {selectedPhoto.description}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedPhoto.tags.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs text-white/70 uppercase tracking-wider bg-white/10 px-3 py-1 backdrop-blur-sm"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Aide navigation clavier */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs uppercase tracking-widest font-medium hidden md:block">
            ← → pour naviguer • ESC pour fermer
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}