"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface Photo {
  id: string;
  url: string;
  description?: string;
  tags?: string[];
}

export default function HomePage() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Récupérer les images depuis Firestore
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const snapshot = await getDocs(collection(db, "photos"));
        const data: Photo[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Photo, "id">),
        }));
        
        const imageUrls = data.map(photo => photo.url);
        setImages(imageUrls);
        
        if (imageUrls.length > 0) {
          setCurrentImage(imageUrls[Math.floor(Math.random() * imageUrls.length)]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Changer l'image toutes les 10 secondes
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * images.length);
      setCurrentImage(images[randomIndex]);
    }, 15000);

    return () => clearInterval(interval);
  }, [images]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          {/* Loader bleu circulaire */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          {/* Texte de chargement */}
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Images de background avec transition */}
      <div className="absolute inset-0 z-0">
        {currentImage ? (
          <div className="relative w-full h-full">
            <img
              src={currentImage}
              alt="Background artistique"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
              loading="eager"
            />
            {/* Overlay sombre pour la lisibilité */}
            <div className="absolute inset-0 bg-black/70"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
        )}
      </div>
    </section>
  );
}