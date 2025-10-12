"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function AboutPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Images de vous au travail
  const workImages = [
    "/work-1.jpg",
    "/logo.jpg",
    "/work-2.jpg"
  ];

  // Changer d'image toutes les 4 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % workImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [workImages.length]);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/acid-grotesk');
        
        * {
          font-family: 'Acid Grotesk', sans-serif;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>

      <div className="min-h-screen bg-white">
        {/* Hero Section with Images */}
        <section className="pt-20 md:pt-24 pb-12 md:pb-16 px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            
            {/* Mobile: Single Image Carousel */}
            <div className="md:hidden mb-12">
              <div className="relative aspect-[3/4] bg-black overflow-hidden">
                {workImages.map((img, index) => (
                  <Image
                    key={index}
                    src={img}
                    alt={`Vadim Thevelin at work ${index + 1}`}
                    fill
                    className={`object-cover transition-opacity duration-1000 ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    sizes="100vw"
                    quality={90}
                    priority={index === 0}
                  />
                ))}
                
                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {workImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-white w-6' 
                          : 'bg-white/50'
                      }`}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop: Image Grid */}
            <div className="hidden md:grid grid-cols-3 gap-4 mb-16 animate-fadeIn">
              {workImages.map((img, index) => (
                <div 
                  key={index}
                  className="relative aspect-[3/4] bg-black overflow-hidden"
                >
                  <Image
                    src={img}
                    alt={`Vadim Thevelin at work ${index + 1}`}
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    sizes="33vw"
                    quality={90}
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>

            {/* Text Content */}
            <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">
              
              {/* Name & Title */}
              <div className="text-center mb-8 md:mb-12">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-light uppercase tracking-[0.15em] md:tracking-[0.2em] text-black mb-3 md:mb-4">
                  Vadim Thevelin
                </h1>
                <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] md:tracking-[0.3em] text-gray-500">
                  Photographer • Videographer • Director
                </p>
              </div>

              {/* Bio Text */}
              <div className="text-center space-y-4 md:space-y-6 px-2">
                <p className="text-xs md:text-sm lg:text-base leading-relaxed text-gray-700 font-light">
                  I'm Vadim Thevelin, a photographer, videographer, and director based in Brussels, 
                  available for projects worldwide. My work is driven by a passion for creating bold, 
                  meaningful visuals that connect people and ideas.
                </p>

                <p className="text-xs md:text-sm lg:text-base leading-relaxed text-gray-700 font-light">
                  I believe every project is a collaboration — a space where vision, trust, and 
                  creativity come together. Whether I'm behind the camera or leading a team, my goal 
                  is always the same: to craft images and films that inspire, empower, and leave a 
                  lasting impression.
                </p>
              </div>

              {/* Social Links */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 pt-6 md:pt-8">
                <a
                  href="https://www.instagram.com/vadimthevelin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] text-black hover:text-gray-500 transition-colors font-light"
                >
                  Instagram
                </a>
                <span className="hidden sm:inline text-gray-300">|</span>
                <a
                  href="https://www.instagram.com/maindoeuvre.productions/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] text-black hover:text-gray-500 transition-colors font-light"
                >
                  Main d'Oeuvre
                </a>
                <span className="hidden sm:inline text-gray-300">|</span>
                <Link
                  href="/contact"
                  className="text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] text-black hover:text-gray-500 transition-colors font-light"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-12 md:py-16 px-4 md:px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-light uppercase tracking-[0.15em] md:tracking-[0.2em] text-black mb-8 md:mb-12 text-center">
              Services
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center group p-4 md:p-0">
                <h3 className="text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.2em] font-light text-black mb-2 md:mb-3 group-hover:text-gray-500 transition-colors">
                  Photography
                </h3>
                <p className="text-[11px] md:text-xs text-gray-600 font-light leading-relaxed">
                  Portraits, events, products and custom creative projects
                </p>
              </div>

              <div className="text-center group p-4 md:p-0">
                <h3 className="text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.2em] font-light text-black mb-2 md:mb-3 group-hover:text-gray-500 transition-colors">
                  Videography
                </h3>
                <p className="text-[11px] md:text-xs text-gray-600 font-light leading-relaxed">
                  Video production, editing and professional post-production
                </p>
              </div>

              <div className="text-center group p-4 md:p-0">
                <h3 className="text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.2em] font-light text-black mb-2 md:mb-3 group-hover:text-gray-500 transition-colors">
                  Direction
                </h3>
                <p className="text-[11px] md:text-xs text-gray-600 font-light leading-relaxed">
                  Artistic direction and visual design for audiovisual projects
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-light uppercase tracking-[0.15em] md:tracking-[0.2em] text-black mb-4 md:mb-6">
              Let's Work Together
            </h2>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.2em] text-gray-500 mb-6 md:mb-8 font-light">
              Available for projects worldwide
            </p>
            <Link
              href="/contact"
              className="inline-block px-6 md:px-8 py-2.5 md:py-3 border border-black text-black text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300 font-light"
            >
              Get in Touch
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}