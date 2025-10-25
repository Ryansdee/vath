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
  instagramLink?: string;
  youtubeLink?: string;
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
  const [zoom, setZoom] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const { tag: rawTag } = use(params);
  const tag = decodeURIComponent(rawTag);
  console.log("Tag from URL:", tag);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const photosSnapshot = await getDocs(collection(db, "photos"));
        const allPhotos = photosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as Photo));

        const filteredPhotos = allPhotos.filter(photo => 
          photo.tags.includes(tag)
        );

        setPhotos(filteredPhotos);

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

  const handlePrevPhoto = useCallback(() => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
    setSelectedPhoto(photos[prevIndex]);
    setZoom(1);
    setShowInfo(false);
  }, [selectedPhoto, photos]);

  const handleNextPhoto = useCallback(() => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
    setSelectedPhoto(photos[nextIndex]);
    setZoom(1);
    setShowInfo(false);
  }, [selectedPhoto, photos]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      if (e.key === "ArrowLeft") handlePrevPhoto();
      if (e.key === "ArrowRight") handleNextPhoto();
      if (e.key === "Escape") {
        setSelectedPhoto(null);
        setZoom(1);
        setShowInfo(false);
      }
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-") handleZoomOut();
      if (e.key === "i" || e.key === "I") setShowInfo(prev => !prev);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, handlePrevPhoto, handleNextPhoto]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <p className="text-black text-sm uppercase tracking-wider font-light">Loading...</p>
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
      `}</style>
      
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="pt-24 pb-8 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <Link 
              href="/photo" 
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black uppercase tracking-wider transition-colors font-light mb-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Collections
            </Link>

            <h1 className="text-4xl md:text-6xl font-light uppercase tracking-tight text-black">
              {tag}
            </h1>
            <p className="text-gray-500 text-sm uppercase tracking-wider mt-3 font-light">
              {photos.length} {photos.length > 1 ? 'Photos' : 'Photo'}
            </p>
          </div>
        </div>

        {/* Grille photos */}
        <div className="px-4 md:px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {photos.length > 0 ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="break-inside-avoid group relative cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <div className="relative overflow-hidden bg-gray-100 transition-transform duration-300 hover:scale-[1.02]">
                      <Image
                        src={photo.url}
                        alt={photo.description}
                        width={1400}
                        height={1200}
                        className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                        quality={90}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24">
                <p className="text-gray-400 text-lg uppercase tracking-wider font-light">
                  No photos found
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Lightbox */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 bg-white z-50 flex items-center justify-center"
            onClick={() => {
              setSelectedPhoto(null);
              setZoom(1);
              setShowInfo(false);
            }}
          >
            {/* Navigation buttons */}
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrevPhoto(); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 text-black hover:text-gray-600 transition-colors z-30 flex items-center justify-center"
              aria-label="Previous"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); handleNextPhoto(); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 text-black hover:text-gray-600 transition-colors z-30 flex items-center justify-center"
              aria-label="Next"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Close button */}
            <button 
              className="absolute top-6 right-6 w-12 h-12 text-black hover:text-gray-600 transition-colors z-30 flex items-center justify-center"
              onClick={() => {
                setSelectedPhoto(null);
                setZoom(1);
                setShowInfo(false);
              }}
              aria-label="Close"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Zoom controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-sm px-6 py-3 shadow-lg z-30">
              <button 
                onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                className="text-black hover:text-gray-600 transition-colors"
                disabled={zoom <= 1}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              <span className="text-sm font-light text-black min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                className="text-black hover:text-gray-600 transition-colors"
                disabled={zoom >= 3}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
            </div>

            {/* Info button */}
            <button 
              onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }}
              className="absolute top-6 left-6 text-black hover:text-gray-600 transition-colors z-30 text-sm uppercase tracking-wider font-light"
            >
              {showInfo ? 'Hide Info' : 'Show Info'}
            </button>

            {/* Image container */}
            <div 
              className="relative overflow-auto max-w-[90vw] max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.description}
                width={2030}
                height={2070}
                className="object-contain transition-transform duration-300"
                style={{ 
                  transform: `scale(${zoom})`,
                  maxWidth: '240vw',
                  maxHeight: '240vh',
                  width: 'auto',
                  height: 'auto'
                }}
                quality={100}
                priority
              />
            </div>

            {/* Info panel */}
            {showInfo && (
              <div 
                className="absolute bottom-20 left-6 bg-white/95 backdrop-blur-sm p-6 max-w-md shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-black text-base font-light mb-4">
                  {selectedPhoto.description}
                </p>
                
                {tagText && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <h3 className="text-lg font-light uppercase tracking-tight text-black mb-2">
                      {tagText.title}
                    </h3>
                    <p className="text-sm text-gray-600 font-light leading-relaxed">
                      {tagText.content}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedPhoto.tags.map((t, i) => (
                    <span
                      key={i}
                      className="text-xs text-black uppercase tracking-wider bg-gray-100 px-3 py-1 font-light"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Social links */}
                {(selectedPhoto.instagramLink || selectedPhoto.youtubeLink) && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    {selectedPhoto.instagramLink && (
                      <a
                        href={selectedPhoto.instagramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-black hover:text-gray-600 transition-colors font-light"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        Instagram
                      </a>
                    )}
                    {selectedPhoto.youtubeLink && (
                      <a
                        href={selectedPhoto.youtubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-black hover:text-gray-600 transition-colors font-light"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        YouTube
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}