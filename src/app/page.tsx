"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

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

  // Charger les images Firestore
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const snapshot = await getDocs(collection(db, "photos"));
        const data: Photo[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Photo, "id">),
        }));
        
        const urls = data.map(photo => photo.url);
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

  // Changer l’image toutes les 7 secondes
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
            <div className="absolute inset-0 bg-black/60" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
        )}
      </div>

      {/* Texte d’intro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 text-center text-white max-w-3xl px-6"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Capturing the Essence of Every Moment
        </h1>

        <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-10">
          I’m a visual creator passionate about capturing the essence of moments through
          <span className="font-semibold text-white"> photography</span>,{" "}
          <span className="font-semibold text-white">direction</span> and{" "}
          <span className="font-semibold text-white">videography</span>.  
          Each project is an opportunity to tell a unique story and create images that
          resonate with authenticity and emotion.
        </p>

        <Link
          href="/photo"
          className="inline-block px-8 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition-all"
        >
          Discover My Work
        </Link>
      </motion.div>
    </section>
  );
}
