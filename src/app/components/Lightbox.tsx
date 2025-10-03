"use client";

import { useState } from "react";
import Image from "next/image";

interface LightboxProps {
  images: { src: string; alt: string }[];
}

export default function Lightbox({ images }: LightboxProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selected !== null) {
      setSelected((selected + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selected !== null) {
      setSelected((selected - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="p-8">
      {/* Grid des images avec style street */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className="group relative cursor-pointer overflow-hidden bg-black"
            onClick={() => setSelected(idx)}
          >
            {/* Numéro street style */}
            <div className="absolute top-4 left-4 z-10 text-white font-black text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="relative">
                {String(idx + 1).padStart(2, '0')}
                <span className="absolute top-0.5 left-0.5 text-zinc-700 -z-10">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </span>
            </div>

            {/* Image */}
            <Image
              src={img.src}
              alt={img.alt}
              width={600}
              height={400}
              className="object-cover w-full h-64 transition-all duration-500 group-hover:scale-110 group-hover:brightness-75"
            />

            {/* Overlay avec effet de grille */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white"></div>
            </div>

            {/* Bordure animée */}
            <div className="absolute inset-0 border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* Overlay Lightbox avec style épuré */}
      {selected !== null && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={() => setSelected(null)}
        >
          {/* Fermeture */}
          <button 
            className="absolute top-8 right-8 text-white text-4xl font-light hover:rotate-90 transition-transform duration-300 z-20"
            onClick={() => setSelected(null)}
          >
            ×
          </button>

          {/* Compteur */}
          <div className="absolute top-8 left-8 text-white font-black text-xl z-20">
            <span className="relative">
              {String(selected + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
              <span className="absolute top-0.5 left-0.5 text-zinc-800 -z-10">
                {String(selected + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
              </span>
            </span>
          </div>

          {/* Navigation précédent */}
          <button
            onClick={prevImage}
            className="absolute left-8 text-white text-6xl font-light hover:scale-110 transition-transform duration-300 z-20 hover:text-zinc-300"
          >
            ‹
          </button>

          {/* Image principale */}
          <div className="relative max-w-[85vw] max-h-[85vh]">
            <Image
              src={images[selected].src}
              alt={images[selected].alt}
              width={1000}
              height={800}
              className="max-h-[85vh] max-w-[85vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Bordure blanche minimaliste */}
            <div className="absolute inset-0 border-4 border-white pointer-events-none"></div>
            
            {/* Coins décoratifs street style */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-white"></div>
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-white"></div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-white"></div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-white"></div>
          </div>

          {/* Navigation suivant */}
          <button
            onClick={nextImage}
            className="absolute right-8 text-white text-6xl font-light hover:scale-110 transition-transform duration-300 z-20 hover:text-zinc-300"
          >
            ›
          </button>

          {/* Ligne décorative en bas */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-1 bg-white"></div>
        </div>
      )}
    </div>
  );
}