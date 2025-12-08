"use client";
import { useEffect, useState, useRef, useCallback, use, useMemo } from "react";
import { db } from "../../../../lib/firebase";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- Interfaces et Utilitaires ---------- */
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

/** Convertit Timestamp en Date standard. */
const parseFirestoreDate = (val: FirestoreDate): Date => {
  if (val instanceof Date) return val;
  if (
    typeof val === "object" &&
    val !== null &&
    "toDate" in val &&
    typeof (val as { toDate: () => Date }).toDate === "function"
  ) {
    return (val as { toDate: () => Date }).toDate();
  }
  return new Date(0);
};

/* ---------- Composant de carte de photo progressive ---------- */

interface ProgressivePhotoProps {
  photo: Photo;
  onSelect: () => void;
}

/**
 * Utilise la stratégie de chargement progressif : Miniature (floue) -> Moyenne résolution -> Haute résolution.
 * Le composant original était déjà très bien conçu pour cela.
 */
function ProgressivePhoto({ photo, onSelect }: ProgressivePhotoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [mediumLoaded, setMediumLoaded] = useState(false);
  const [fullLoaded, setFullLoaded] = useState(false);

  // Intersection Observer pour ne charger que lorsque visible (Lazy Loading)
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
      className="break-inside-avoid relative cursor-pointer overflow-hidden bg-gray-100 group hover:scale-[1.02] transition-transform duration-300 hover:shadow-xl"
    >
      {/* Fallback/Thumbnail */}
      <Image
        width={800} // Ajusté pour des tailles communes
        height={600}
        src={photo.thumbnailUrl || photo.mediumUrl || photo.url}
        alt={photo.description}
        className="w-full h-auto transition-opacity duration-700"
        style={{
          opacity: visible ? (mediumLoaded ? 0 : 1) : 0,
          filter: "blur(10px)",
          transform: "scale(1.05)",
        }}
        loading="lazy"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />

      {/* Medium version */}
      {visible && (
        <Image
          width={800}
          height={600}
          src={photo.mediumUrl || photo.url}
          alt={photo.description}
          className="w-full h-auto absolute inset-0 transition-opacity duration-700"
          onLoad={() => setMediumLoaded(true)}
          style={{
            opacity: mediumLoaded ? (fullLoaded ? 0 : 1) : 0,
            filter: mediumLoaded ? "blur(0px)" : "blur(4px)",
          }}
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      )}

      {/* Full HD version */}
      {visible && (
        <Image
          width={1600}
          height={1200}
          src={photo.url}
          alt={photo.description}
          className="w-full h-auto absolute inset-0 transition-opacity duration-700"
          onLoad={() => setFullLoaded(true)}
          style={{
            opacity: fullLoaded ? 1 : 0,
            filter: fullLoaded ? "blur(0px)" : "blur(2px)",
          }}
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      )}
      {/* Overlay au survol */}
      <div className="absolute inset-0 bg-black/10 transition-colors duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center">
      </div>
    </div>
  );
}


/* ---------- Composants de la Lightbox (Carrousel Amélioré) ---------- */

interface AdjacentPhotoProps {
    photo: Photo;
    position: 'prev' | 'next';
}

/** Composant pour les photos adjacentes, optimisé pour l'aperçu. */
const AdjacentPhoto: React.FC<AdjacentPhotoProps> = ({ photo, position }) => (
    <div
        className={`absolute hidden lg:flex items-center justify-center ${
            position === 'prev' ? 'left-0' : 'right-0'
        } w-[15vw] h-full transition-opacity duration-300`}
    >
      <Image
          width={400}
          height={400}
          src={photo.thumbnailUrl || photo.mediumUrl || photo.url}
          alt={`Aperçu de la photo ${position}`}
          className="object-contain"
          style={{ maxHeight: "60vh" }}
          draggable={false}
          priority={false}
      />
    </div>
);

interface LightboxPhotoProps {
    photo: Photo;
    zoom: number;
    description: string;
}

/** Composant pour la photo principale de la Lightbox. */
const LightboxPhoto: React.FC<LightboxPhotoProps> = ({ photo, zoom, description }) => (
    <Image
        width={1920}
        height={1080}
        src={photo.url} // Utiliser l'URL complète
        alt={description}
        className="object-contain cursor-grab transition-transform duration-300 ease-out z-10"
        style={{
            transform: `scale(${zoom})`,
            maxWidth: "90vw",
            maxHeight: "90vh",
            width: "auto",
            height: "auto",
        }}
        draggable={false}
        priority={true} // Prioriser l'image affichée
        sizes="90vw"
    />
);


/* ---------- Page principale ---------- */
export default function PhotosByTagPage({ params }: PageProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tagTextData, setTagTextData] = useState<TagText | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null;

  const [zoom, setZoom] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Utilisation de useMemo pour décoder le tag une seule fois
  const { tag: rawTag } = use(params);
  const tag = useMemo(() => decodeURIComponent(rawTag), [rawTag]);

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

        // Tri optionnel des photos ici si nécessaire (ex: par date de création)
        setPhotos(filteredPhotos);

        if (!textSnap.empty) {
          const doc = textSnap.docs[0];
          const data = doc.data() as Record<string, any>;
          
          setTagTextData({
            id: doc.id,
            tag: data.tag ?? tag,
            title: (data.title as string) ?? tag.replaceAll("-", " "),
            content: (data.content as string) ?? "",
            createdAt: parseFirestoreDate(data.createdAt as FirestoreDate),
            updatedAt: parseFirestoreDate(data.updatedAt as FirestoreDate),
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

  /* ---------- Navigation lightbox (Memoized) ---------- */
  const handleNavigate = useCallback((direction: 1 | -1) => {
    if (selectedIndex === null || photos.length === 0) return;
    setDirection(direction);
    setSelectedIndex((i) => {
      const newIndex = ((i! + direction) + photos.length) % photos.length;
      return newIndex;
    });
    setZoom(1); // Reset zoom at each slide change
  }, [selectedIndex, photos.length]);

  const handlePrevPhoto = useCallback(() => handleNavigate(-1), [handleNavigate]);
  const handleNextPhoto = useCallback(() => handleNavigate(1), [handleNavigate]);


  /* ---------- Raccourcis clavier (Amélioré) ---------- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      e.preventDefault(); // Empêche le défilement du navigateur pour les touches de navigation
      
      switch (e.key) {
        case "ArrowLeft":
          handlePrevPhoto();
          break;
        case "ArrowRight":
          handleNextPhoto();
          break;
        case "Escape":
          setSelectedIndex(null);
          setZoom(1);
          break;
        case "+":
        case "=":
          setZoom((z) => Math.min(z + 0.3, 3));
          break;
        case "-":
        case "_":
          setZoom((z) => Math.max(z - 0.3, 1));
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handlePrevPhoto, handleNextPhoto]);

  /* ---------- Skeleton de chargement ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-white px-6 py-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  /* ---------- Variants d’animation (Simplifiés) ---------- */
  const slideVariants = {
    enter: (dir: 1 | -1) => ({ opacity: 0, x: dir > 0 ? 50 : -50 }),
    center: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: (dir: 1 | -1) => ({ opacity: 0, x: dir < 0 ? 50 : -50, transition: { duration: 0.2 } }),
  };

  /* ---------- Rendu principal ---------- */
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="pt-24 pb-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/photo"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black uppercase tracking-wider transition-colors font-light mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Collections
          </Link>
        </div>
      </header>

      {/* Grille Masonry */}
      <div className="px-4 md:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
            </div>
          )}
          {photos.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {photos.map((photo, i) => (
                <ProgressivePhoto key={photo.id} photo={photo} onSelect={() => setSelectedIndex(i)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24">
              <p className="text-gray-400 text-lg uppercase tracking-wider font-light">Aucune photo trouvée pour cette collection</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modale */}
      <AnimatePresence>
        {selectedPhoto && selectedIndex !== null && (
          <motion.div
            className="fixed inset-0 bg-white/95 backdrop-blur-md z-[60] flex items-center justify-center p-2 lg:p-4 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => { setSelectedIndex(null); setZoom(1); }}
          >
            {/* Conteneur principal du carrousel */}
            <div
              className="relative flex items-center justify-center w-full h-full"
              onClick={(e) => e.stopPropagation()} // Empêche la fermeture au clic sur la zone de l'image
            >
              {/* Le conteneur animé de Framer Motion */}
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={selectedIndex}
                  className="flex items-center justify-center w-full h-full relative"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <LightboxPhoto photo={selectedPhoto} zoom={zoom} description={selectedPhoto.description} />
                </motion.div>
              </AnimatePresence>

              {/* Photos Adjacentes (Optimisé) */}
              {photos.length > 1 && (
                  <>
                      <AdjacentPhoto
                          photo={photos[(selectedIndex - 1 + photos.length) % photos.length]}
                          position="prev"
                      />
                      <AdjacentPhoto
                          photo={photos[(selectedIndex + 1) % photos.length]}
                          position="next"
                      />
                  </>
              )}
            </div>

            {/* Navigation (Positionnement fixe pour les flèches) */}
            <button
              onClick={(e) => { e.stopPropagation(); handlePrevPhoto(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-gray-500 hover:text-black transition-colors z-50 rounded-full bg-white/80 hover:bg-white"
              aria-label="Photo précédente"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); handleNextPhoto(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-gray-500 hover:text-black transition-colors z-50 rounded-full bg-white/80 hover:bg-white"
              aria-label="Photo suivante"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* Bouton fermer */}
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); setZoom(1); }}
              className="absolute top-4 right-4 p-3 text-gray-500 hover:text-black transition-colors z-[70] rounded-full bg-white/80 hover:bg-white"
              aria-label="Fermer la Lightbox"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            {/* Infos / Commandes de Zoom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[70] bg-black/70 text-white text-xs p-2 rounded-full flex items-center space-x-4">
                <span className="text-gray-300 hidden sm:inline">Photo {selectedIndex + 1} / {photos.length}</span>
                <span className="text-gray-300">Zoom: {(zoom * 100).toFixed(0)}%</span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}