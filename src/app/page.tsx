"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Image from "next/image";
import Link from "next/link";
import "./globals.css"

interface Photo {
  id: string;
  url: string;
  description?: string;
  tags?: string[];
  category?: string;
}

export default function HomePage() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger uniquement les photos d'oeuvres (photos, video, diary)
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const snapshot = await getDocs(collection(db, "photos"));
        const data: Photo[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Photo, "id">),
        }));
        
        // Filtrer pour exclure les photos de blog et about
        const artworkPhotos = data.filter(photo => {
          const category = photo.category?.toLowerCase() || '';
          return category !== 'blog' && category !== 'about' && category !== 'personal-project';
        });
        
        const urls = artworkPhotos.map(photo => photo.url);
        setImages(urls);
        
        if (urls.length > 0) {
          setCurrentImage(urls[Math.floor(Math.random() * urls.length)]);
        }
      } catch (error) {
        console.error("Erreur de chargement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Changer l'image toutes les 7 secondes
  // Changer l'image toutes les 7 secondes
useEffect(() => {
  if (images.length === 0) return;

  const interval = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * images.length);
    setCurrentImage(images[randomIndex]);
  }, 7000);

  return () => clearInterval(interval);
}, [images]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="uppercase tracking-widest text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @font-face {
          font-family: 'Acid Grotesk';
          src: url('./AcidGrotesk.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        
        * {
          font-family: 'Acid Grotesk', sans-serif;
        }
      `}</style>
      
      <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          {currentImage ? (
            <div className="relative w-full h-full">
              <Image
                src={currentImage}
                alt="Visual background"
                fill
                className="object-cover transition-opacity duration-1000"
                priority
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
          )}
        </div>

        {/* Bulle avec contour uniquement */}
        <div className="relative z-10 flex items-center justify-center">
          <Link
            href="/photo"
            className="px-12 py-4 border-2 border-white text-white rounded-full hover:bg-white hover:text-black transition-all duration-300 text-sm font-light uppercase tracking-[0.15em]"
          >
            Discover My Work
          </Link>
        </div>
      </section>
    </>
  );
}