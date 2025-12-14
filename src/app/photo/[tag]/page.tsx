"use client";

import { useEffect, useState, useRef, useCallback, use, useMemo } from "react";
import type { Variants } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../../../lib/firebase";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

/* =========================
   TYPES
========================= */

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

type FirestoreDate = Date | Timestamp | null | undefined;

interface TagTextDataFromFirestore {
  tag?: string;
  title?: string;
  content?: string;
  createdAt?: FirestoreDate;
  updatedAt?: FirestoreDate;
}

/* =========================
   UTILS
========================= */

const normalizeToWebp = (url?: string): string =>
  url ? url.replace(/\.jpg|\.jpeg|\.png/gi, ".webp") : "/default-placeholder.jpg";

const parseFirestoreDate = (val: FirestoreDate): Date => {
  if (val instanceof Date) return val;
  if (val && typeof val === "object" && "toDate" in val) {
    return (val as Timestamp).toDate();
  }
  return new Date(0);
};

/* =========================
   PROGRESSIVE PHOTO CARD
   Chargement progressif : Thumbnail → Medium → Full
========================= */

function ProgressivePhoto({
  photo,
  onSelect,
}: {
  photo: Photo;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [mediumLoaded, setMediumLoaded] = useState(false);
  const [fullLoaded, setFullLoaded] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "100px" }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const thumbnailSrc = normalizeToWebp(photo.thumbnailUrl || photo.mediumUrl || photo.url);
  const mediumSrc = normalizeToWebp(photo.mediumUrl || photo.url);
  const fullSrc = normalizeToWebp(photo.url);

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className="relative cursor-pointer overflow-hidden bg-gray-100 rounded-lg shadow-sm group hover:shadow-xl transition-all duration-300 aspect-[3/2]"
    >
      {/* Thumbnail (blur) */}
      {visible && (
        <Image
          src={thumbnailSrc}
          alt={photo.description}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-opacity duration-500"
          style={{
            opacity: mediumLoaded ? 0 : 1,
            filter: "blur(8px)",
            transform: "scale(1.05)",
          }}
          loading="lazy"
        />
      )}

      {/* Medium resolution */}
      {visible && (
        <Image
          src={mediumSrc}
          alt={photo.description}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-all duration-500"
          onLoad={() => setMediumLoaded(true)}
          style={{
            opacity: mediumLoaded ? (fullLoaded ? 0 : 1) : 0,
            filter: mediumLoaded ? "blur(0px)" : "blur(4px)",
          }}
          loading="lazy"
        />
      )}

      {/* Full resolution */}
      {visible && (
        <Image
          src={fullSrc}
          alt={photo.description}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-all duration-500 group-hover:scale-105"
          onLoad={() => setFullLoaded(true)}
          style={{ opacity: fullLoaded ? 1 : 0 }}
          loading="lazy"
        />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
    </div>
  );
}

/* =========================
   LIGHTBOX COMPONENTS
========================= */

const MainFrame = ({ photo, zoom }: { photo: Photo; zoom: number }) => (
  <div className="relative w-[60vw] h-[70vh] max-w-[1200px] max-h-[800px] mx-4">
    <Image
      src={normalizeToWebp(photo.url)}
      alt={photo.description}
      fill
      className="object-contain transition-transform duration-300 ease-out"
      style={{ transform: `scale(${zoom})`, zIndex: 1 }}
      priority
      sizes="(max-width: 1024px) 90vw, 60vw"
      quality={90}
      draggable={false}
    />
  </div>
);

const SideFrame = ({ photo, onClick }: { photo: Photo; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="hidden lg:block relative w-[30vw] max-w-[560px] aspect-[3/2] opacity-40 hover:opacity-70 cursor-pointer transition-all duration-300"
    style={{ filter: "blur(1px)", zIndex: 0, marginLeft: -20 }}
  >
    <Image
      src={normalizeToWebp(photo.mediumUrl || photo.url)}
      alt={photo.description}
      fill
      className="object-cover rounded-sm"
      sizes="15vw"
      draggable={false}
    />
  </div>
);

/* =========================
   SLIDE VARIANTS
========================= */

const slideVariants: Variants = {
  enter: (d: number) => ({
    x: d > 0 ? 120 : -120,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 32,
    },
  },
  exit: (d: number) => ({
    x: d < 0 ? 120 : -120,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

/* =========================
   PAGE PRINCIPALE
========================= */

export default function PhotosByTagPage({ params }: PageProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tagText, setTagText] = useState<TagText | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [zoom, setZoom] = useState(1);

  const { tag: rawTag } = use(params);
  const tag = useMemo(() => decodeURIComponent(rawTag), [rawTag]);

  const selected = selectedIndex !== null ? photos[selectedIndex] : null;

  /* ===== FETCH ===== */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [photosSnap, textSnap] = await Promise.all([
          getDocs(query(collection(db, "photos"), where("tags", "array-contains", tag))),
          getDocs(query(collection(db, "tagTexts"), where("tag", "==", tag))),
        ]);

        const filteredPhotos: Photo[] = photosSnap.docs.map((doc) => {
          const data = doc.data() as Partial<Photo>;
          const fallbackUrl = data.url || data.mediumUrl || data.thumbnailUrl || "/default-placeholder.jpg";

          return {
            id: doc.id,
            url: data.url || fallbackUrl,
            mediumUrl: data.mediumUrl || fallbackUrl,
            thumbnailUrl: data.thumbnailUrl || fallbackUrl,
            description: data.description ?? `Photo de la collection ${tag}`,
            tags: Array.isArray(data.tags) ? data.tags : [],
            blurDataURL: data.blurDataURL,
          };
        });

        setPhotos(filteredPhotos);

        if (!textSnap.empty) {
          const doc = textSnap.docs[0];
          const data = doc.data() as TagTextDataFromFirestore;

          setTagText({
            id: doc.id,
            tag: data.tag ?? tag,
            title: data.title ?? tag.replaceAll("-", " "),
            content: data.content ?? "",
            createdAt: parseFirestoreDate(data.createdAt),
            updatedAt: parseFirestoreDate(data.updatedAt),
          });
        }
      } catch (e) {
        console.error("Erreur lors du chargement des données:", e);
        setError("Impossible de charger la collection de photos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tag]);

  /* ===== NAVIGATION ===== */

  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (selectedIndex === null || photos.length === 0) return;
      setDirection(dir);
      setSelectedIndex((selectedIndex + dir + photos.length) % photos.length);
      setZoom(1);
    },
    [selectedIndex, photos.length]
  );

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
    setZoom(1);
  }, []);

  /* ===== KEYBOARD ===== */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          navigate(-1);
          break;
        case "ArrowRight":
          e.preventDefault();
          navigate(1);
          break;
        case "Escape":
          closeLightbox();
          break;
        case "+":
        case "=":
          e.preventDefault();
          setZoom((z) => Math.min(z + 0.25, 3));
          break;
        case "-":
        case "_":
          e.preventDefault();
          setZoom((z) => Math.max(z - 0.25, 1));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, navigate, closeLightbox]);

  /* ===== LOADING STATE ===== */

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-6 py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg aspect-[3/2] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  /* ===== RENDER ===== */

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="pt-24 pb-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/photo"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black uppercase tracking-wider transition-colors font-light"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Collections
          </Link>
        </div>
      </header>

      {/* Photo Grid */}
      <main className="px-4 md:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg mb-8">
              {error}
            </div>
          )}

          {photos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo, i) => (
                <ProgressivePhoto
                  key={photo.id}
                  photo={photo}
                  onSelect={() => setSelectedIndex(i)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24">
              <p className="text-gray-400 text-lg uppercase tracking-wider font-light">
                Aucune photo trouvée pour cette collection
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && selectedIndex !== null && (
          <motion.div
            className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeLightbox}
          >
            {/* Carousel container */}
            <div
              className="relative flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous preview */}
              {photos.length > 1 && (
                <SideFrame
                  photo={photos[(selectedIndex - 1 + photos.length) % photos.length]}
                  onClick={() => navigate(-1)}
                />
              )}

              {/* Current photo */}
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={selectedIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <MainFrame photo={selected} zoom={zoom} />
                </motion.div>
              </AnimatePresence>

              {/* Next preview */}
              {photos.length > 1 && (
                <SideFrame
                  photo={photos[(selectedIndex + 1) % photos.length]}
                  onClick={() => navigate(1)}
                />
              )}
            </div>

            {/* Navigation buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(-1);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-gray-500 hover:text-black transition-colors rounded-full bg-white/80 hover:bg-white shadow-sm"
              aria-label="Photo précédente"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-gray-500 hover:text-black transition-colors rounded-full bg-white/80 hover:bg-white shadow-sm"
              aria-label="Photo suivante"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              className="absolute top-4 right-4 p-3 text-gray-500 hover:text-black transition-colors rounded-full bg-white/80 hover:bg-white shadow-sm"
              aria-label="Fermer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Zoom controls */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom((z) => Math.max(z - 0.25, 1));
                }}
                disabled={zoom <= 1}
                className="p-2 text-gray-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-full bg-white/80 hover:bg-white shadow-sm"
                aria-label="Zoom arrière"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>

              <span className="text-sm text-gray-600 bg-white/80 px-3 py-1 rounded-full min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom((z) => Math.min(z + 0.25, 3));
                }}
                disabled={zoom >= 3}
                className="p-2 text-gray-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-full bg-white/80 hover:bg-white shadow-sm"
                aria-label="Zoom avant"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Info bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-4 py-2 rounded-full flex items-center gap-4 z-10">
              <span>
                {selectedIndex + 1} / {photos.length}
              </span>
              <span className="text-gray-400 hidden sm:inline">← → naviguer • +/- zoom • Esc fermer</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}