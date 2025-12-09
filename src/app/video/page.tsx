"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { db } from "../../../lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";

// ############################
// 1. INTERFACES & TYPES
// ############################

// Normalisation du type de date pour simplifier le tri
type VideoDate = Date | Timestamp;

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  tags: string[];
  createdAt: VideoDate;
}

interface ScrapedVideo {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnail?: string | null;
}

// ############################
// 2. UTILITAIRES DE DONNÉES
// ############################

/** Convertit Timestamp en Date, ou retourne la Date si elle l'est déjà. */
const normalizeDate = (date: VideoDate): Date =>
  date instanceof Timestamp ? date.toDate() : date;

/** Trie les vidéos par date de création (du plus récent au plus ancien). */
const sortVideos = (videos: Video[]): Video[] => {
  return videos.sort((a, b) => {
    const dateA = normalizeDate(a.createdAt);
    const dateB = normalizeDate(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });
};

/** Extrait l'ID de la vidéo YouTube d'une URL. */
const getYoutubeVideoId = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v");
    }
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "");
    }
  } catch {}
  return null;
};

/** Vérifie si l'URL est une vidéo externe (YouTube, Vimeo). */
const isExternalVideoUrl = (url: string): boolean => {
  try {
    const u = new URL(url);
    return u.hostname.includes("youtube") || u.hostname.includes("youtu.be") || u.hostname.includes("vimeo");
  } catch {
    return false;
  }
};

// ############################
// 3. SOUS-COMPOSANTS
// ############################

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-16 h-16">
        {/* Le spinner a une meilleure animation Tailwind native */}
        <div className="border-4 border-gray-100 rounded-full w-full h-full"></div>
        <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-black text-sm font-light uppercase tracking-wider">
        Chargement des vidéos...
      </p>
    </div>
  </div>
);

const getThumbnailComponent = (video: Video) => {
  // 1. Utiliser la miniature fournie par la BDD ou le scraper
  if (video.thumbnail) {
    return (
      <Image
        src={video.thumbnail}
        alt={video.title || "Video thumbnail"}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition duration-300 group-hover:scale-105"
        quality={80}
      />
    );
  }

  // 2. Tenter de générer une miniature YouTube
  const youtubeId = getYoutubeVideoId(video.url);
  if (youtubeId) {
    return (
      <Image
        src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.webp`}
        alt={video.title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition duration-300 group-hover:scale-105"
        quality={80}
      />
    );
  }

  // 3. Fallback (pour les vidéos internes ou non reconnues)
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white text-3xl">
      🎥
    </div>
  );
};

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
  index: number;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick, index }) => (
  <div
    key={video.id}
    onClick={() => onClick(video)}
    className="group cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition transform hover:scale-[1.01]"
    style={{ animationDelay: `${index * 0.05}s`, aspectRatio: "16/9" }}
  >
    <div className="relative w-full h-full bg-black">
      {getThumbnailComponent(video)}
      
      {/* Overlay d'effet au survol */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <svg className="w-12 h-12 text-white/90" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path>
        </svg>
      </div>
    </div>
  </div>
);

interface VideoModalProps {
  video: Video;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  const youtubeId = getYoutubeVideoId(video.url);
  const isExternal = isExternalVideoUrl(video.url);

  // Gérer la fermeture avec la touche ESC
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 text-white text-3xl sm:text-4xl hover:text-gray-400 z-50 w-10 h-10 flex items-center justify-center transition"
        onClick={onClose}
        aria-label="Fermer la vidéo"
      >
        ×
      </button>

      {/* Conteneur de la modale pour stopper la propagation du clic de fermeture */}
      <div
        className="w-full max-w-6xl shadow-2xl rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-video bg-black relative">
          {isExternal && youtubeId ? (
            // EMBED YouTube pour une meilleure intégration
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0"
            ></iframe>
          ) : isExternal ? (
            // Fallback pour Vimeo ou autre externe sans embed facile
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-900">
                <p className="text-white mb-4 text-center">Cette vidéo est externe et nécessite une lecture directe.</p>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white text-black text-sm uppercase font-semibold rounded hover:bg-gray-200 transition"
                >
                  Regarder la vidéo
                </a>
            </div>
          ) : (
            // Vidéo interne (fichier hébergé)
            <video
              src={video.url}
              controls
              autoPlay
              className="w-full h-full absolute inset-0"
              poster={video.thumbnail} // Affiche la miniature comme poster si elle existe
            />
          )}
        </div>

        <div className="bg-gray-900 text-center py-4 sm:py-6 md:py-8 text-white px-4">
          <h3 id="modal-title" className="text-base sm:text-lg md:text-xl font-light uppercase tracking-wide">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-3xl mx-auto font-light">
              {video.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ############################
// 4. COMPOSANT PRINCIPAL
// ############################

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    setVideos([]); // Vider les vidéos avant le chargement

    try {
      // --- CHARGEMENT CONCURRENT : Firestore et Scraper YouTube
      const [firestoreSnapshot, scraperResponse] = await Promise.all([
        getDocs(collection(db, "videos")),
        fetch(`/api/scrape?channelUrl=https://www.youtube.com/@maindoeuvre.productions`).then(res => {
            if (!res.ok) throw new Error("Scraper failed with status: " + res.status);
            return res.json();
        }),
      ]);

      // 1. Traitement des données Firestore
      const localVideos: Video[] = firestoreSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Video)
      );

      // 2. Traitement des données YouTube
      const youtubeData = scraperResponse.videos;
      let youtubeVideos: Video[] = [];

      if (Array.isArray(youtubeData)) {
        youtubeVideos = youtubeData.map((v: ScrapedVideo) => ({
          id: v.id,
          title: v.title,
          description: v.description ?? "",
          url: v.url,
          thumbnail: v.thumbnail ?? undefined,
          tags: [],
          // Attribuer la date du jour aux vidéos scrapées (le scraper doit idéalement fournir la date de publication)
          createdAt: Timestamp.fromDate(new Date()),
        }));
      } else {
        console.warn("L'API de scraping n'a pas retourné de tableau de vidéos.");
      }
      
      // 3. Fusion et Déduplication :
      // On utilise un Map pour que les vidéos YouTube (plus fraîches) remplacent les doublons Firestore.
      const mergedVideosMap = new Map<string, Video>();

      // Ajouter d'abord les vidéos locales (pour conserver les tags/descriptions personnalisées)
      localVideos.forEach(v => mergedVideosMap.set(v.id, v));

      // Ajouter/Écraser avec les vidéos YouTube (pour avoir les dernières vidéos de la chaîne)
      youtubeVideos.forEach(v => mergedVideosMap.set(v.id, v));

      const mergedArray = Array.from(mergedVideosMap.values());

      // 4. Tri final
      const sortedMerged = sortVideos(mergedArray);

      setVideos(sortedMerged);

    } catch (e) {
      console.error("Erreur lors du chargement des vidéos:", e);
      setError("Désolé, une erreur est survenue lors du chargement des vidéos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.cdnfonts.com/css/acid-grotesk");
        * { font-family: "Acid Grotesk", sans-serif; }
      `}</style>

      <div className="min-h-screen bg-white pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 md:pb-16">
        <main className="px-3 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            {error && (
                <div className="text-center bg-red-100 text-red-700 p-4 rounded-lg mb-8">
                    {error}
                </div>
            )}
            
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {videos.map((video, index) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onClick={setSelectedVideo}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="flex justify-center py-12 sm:py-16 md:py-24 text-gray-400 text-sm uppercase tracking-wider border-t border-b border-gray-100">
                Aucune vidéo disponible pour le moment
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal vidéo */}
      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </>
  );
}