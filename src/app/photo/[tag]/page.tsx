"use client";
import { useEffect, useState, useRef, useCallback, use } from "react";
import { db } from "../../../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- Types ---------- */
interface Photo {
  id: string;
  url: string;
  mediumUrl?: string;
  thumbnailUrl?: string;
  description: string;
  tags: string[];
  blurDataURL?: string;
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
  params: Promise<{ tag: string }>;
}

/* ---------- Page principale ---------- */
export default function PhotosByTagPage({ params }: PageProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [, setTagText] = useState<TagText | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null;

  const [zoom, setZoom] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);

  const { tag: rawTag } = use(params);
  const tag = decodeURIComponent(rawTag);

  /* ---------- Charger données Firestore ---------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [photosSnap, textSnap] = await Promise.all([
          getDocs(query(collection(db, "photos"), where("tags", "array-contains", tag))),
          getDocs(query(collection(db, "tagTexts"), where("tag", "==", tag))),
        ]);

const filteredPhotos: Photo[] = photosSnap.docs.map((doc) => {
  const data = doc.data() as Partial<Photo>;
  const url = data.url || data.mediumUrl || data.thumbnailUrl || "/default-placeholder.jpg";

  return {
    id: doc.id,
    url,
    mediumUrl: data.mediumUrl || url,
    thumbnailUrl: data.thumbnailUrl || url,
    description: data.description ?? "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    blurDataURL: data.blurDataURL,
  };
});

setPhotos(filteredPhotos);

if (!textSnap.empty) {
  const doc = textSnap.docs[0];
  const data = doc.data() as Partial<TagText>;

  const toDate = (val: unknown): Date => {
    if (!val) return new Date();
    if (val instanceof Date) return val;
    if (typeof val === "object" && val !== null && "toDate" in val) {
      return (val as { toDate: () => Date }).toDate();
    }
    if (typeof val === "string" || typeof val === "number") {
      return new Date(val);
    }
    return new Date();
  };

  setTagText({
    id: doc.id,
    tag: data.tag ?? tag,
    title: data.title ?? tag.replaceAll("-", " "),
    content: data.content ?? "",
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  });
}
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tag]);

  /* ---------- Navigation lightbox ---------- */
  const handlePrevPhoto = useCallback(() => {
    if (selectedIndex === null || photos.length === 0) return;
    setDirection(-1);
    setSelectedIndex((i) => ((i! - 1 + photos.length) % photos.length));
    setZoom(1);
  }, [selectedIndex, photos.length]);

  const handleNextPhoto = useCallback(() => {
    if (selectedIndex === null || photos.length === 0) return;
    setDirection(1);
    setSelectedIndex((i) => ((i! + 1) % photos.length));
    setZoom(1);
  }, [selectedIndex, photos.length]);

  /* ---------- Raccourcis clavier ---------- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowLeft") handlePrevPhoto();
      if (e.key === "ArrowRight") handleNextPhoto();
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.5, 3));
      if (e.key === "-" || e.key === "_") setZoom((z) => Math.max(z - 0.5, 1));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handlePrevPhoto, handleNextPhoto]);

  /* ---------- Skeleton de chargement ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-white px-6 py-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] bg-gray-200 rounded" />
        ))}
      </div>
    );
  }

  /* ---------- Variants d’animation ---------- */
  const slideVariants = {
    enter: (dir: 1 | -1) => ({ x: dir * 150, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 1 | -1) => ({ x: -dir * 150, opacity: 0 }),
  };

  /* ---------- Rendu principal ---------- */
  return (
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
            Back
          </Link>
        </div>
      </div>

      {/* Grille */}
      <div className="px-4 md:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {photos.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {photos.map((photo, i) => (
                <ProgressivePhoto key={photo.id} photo={photo} onSelect={() => setSelectedIndex(i)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24">
              <p className="text-gray-400 text-lg uppercase tracking-wider font-light">No photos found</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {selectedPhoto && selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-white z-50 flex items-center justify-center overflow-hidden"
          onClick={() => setSelectedIndex(null)}
        >
          {/* bouton précédent */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevPhoto();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black transition-colors z-20"
            aria-label="Previous photo"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* bouton suivant */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextPhoto();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black transition-colors z-20"
            aria-label="Next photo"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div
            className="relative flex items-center justify-center gap-6 w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={selectedIndex}
                className="flex items-center justify-center gap-8 w-full"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                {(() => {
                  const prevIndex = (selectedIndex - 1 + photos.length) % photos.length;
                  const nextIndex = (selectedIndex + 1) % photos.length;
                  const prevPhoto = photos[prevIndex];
                  const nextPhoto = photos[nextIndex];

                  return (
                    <>
                      {/* gauche */}
                      {prevPhoto && (
                        <Image
                          width={400}
                          height={400}
                          src={prevPhoto.mediumUrl || prevPhoto.url}
                          alt={prevPhoto.description}
                          className="object-contain opacity-40"
                          style={{
                            maxWidth: "22vw",
                            maxHeight: "60vh",
                            filter: "blur(2px)",
                            transform: "scale(0.9)",
                          }}
                          draggable={false}
                        />
                      )}

                      {/* centre */}
                      <Image
                        width={400}
                        height={400}
                        src={selectedPhoto.url}
                        alt={selectedPhoto.description}
                        className="object-contain"
                        style={{
                          transform: `scale(${zoom})`,
                          maxWidth: "55vw",
                          maxHeight: "85vh",
                          width: "auto",
                          height: "auto",
                          zIndex: 10,
                        }}
                        draggable={false}
                      />

                      {/* droite */}
                      {nextPhoto && (
                        <Image
                          width={400}
                          height={400}
                          src={nextPhoto.mediumUrl || nextPhoto.url}
                          alt={nextPhoto.description}
                          className="object-contain opacity-40"
                          style={{
                            maxWidth: "22vw",
                            maxHeight: "60vh",
                            filter: "blur(2px)",
                            transform: "scale(0.9)",
                          }}
                          draggable={false}
                        />
                      )}
                    </>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* bouton fermer */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(null);
              setZoom(1);
            }}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Composant progressif natif ---------- */
function ProgressivePhoto({ photo, onSelect }: { photo: Photo; onSelect: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [mediumLoaded, setMediumLoaded] = useState(false);
  const [fullLoaded, setFullLoaded] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className="break-inside-avoid relative cursor-pointer overflow-hidden bg-gray-100 group hover:scale-[1.02] transition-transform duration-300 hover:rounded-md transition-radius duration-300 hover:shadow-lg transition-shadow duration-300 "
    >
      {/* miniature floue */}
      <Image
        width={400}
        height={400}
        src={photo.thumbnailUrl || photo.mediumUrl || photo.url}
        alt={photo.description}
        className="w-full h-auto transition-opacity duration-700"
        style={{
          opacity: visible ? (mediumLoaded ? 0 : 1) : 0,
          filter: "blur(10px)",
          transform: "scale(1.05)",
        }}
        loading="lazy"
      />

      {/* version moyenne */}
      {visible && (
        <Image
          width={400}
          height={400}
          src={photo.mediumUrl || photo.url}
          alt={photo.description}
          className="w-full h-auto absolute inset-0 transition-opacity duration-700"
          onLoad={() => setMediumLoaded(true)}
          style={{
            opacity: mediumLoaded ? (fullLoaded ? 0 : 1) : 0,
            filter: mediumLoaded ? "blur(0px)" : "blur(8px)",
          }}
          loading="lazy"
        />
      )}

      {/* version HD */}
      {visible && (
        <Image
          width={400}
          height={400}
          src={photo.url}
          alt={photo.description}
          className="w-full h-auto absolute inset-0 transition-opacity duration-700"
          onLoad={() => setFullLoaded(true)}
          style={{
            opacity: fullLoaded ? 1 : 0,
            filter: fullLoaded ? "blur(0px)" : "blur(4px)",
          }}
          loading="lazy"
        />
      )}
    </div>
  );
}
