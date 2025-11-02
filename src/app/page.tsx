"use client";

import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Charger les images mises en avant depuis Firestore
  useEffect(() => {
    const fetchFeaturedImages = async () => {
      try {
        const settingDoc = await getDoc(doc(db, "settings", "homePage"));
        if (settingDoc.exists()) {
          const data = settingDoc.data();
          const featured = Array.isArray(data.featuredImages)
            ? data.featuredImages
            : data.featuredImage
            ? [data.featuredImage]
            : [];
          setImages(featured);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des images:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedImages();
  }, []);

  // Changer d’image toutes les 7 secondes
  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [images]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="uppercase tracking-widest text-sm text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    );

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Images en rotation */}
      <div className="absolute inset-0 z-0">
        {images.length > 0 ? (
          images.map((src, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={src}
                alt={`Home image ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
        )}
      </div>

      {/* Call to action */}
      <div className="relative z-10 flex items-center justify-center">
        <Link
          href="/photo"
          className="px-12 py-4 border-2 border-white text-white rounded-full hover:bg-white hover:text-black transition-all duration-300 text-sm font-light uppercase tracking-[0.15em]"
        >
          Discover My Work
        </Link>
      </div>
    </section>
  );
}
