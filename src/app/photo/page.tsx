"use client";

import { useEffect, useState, useCallback } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

// ############################
// 1. INTERFACES & TYPES
// ############################

// Utilisez le type Timestamp de Firestore pour la compatibilité
type FirestoreDate = Date | Timestamp | null | undefined;

interface TagData {
  id: string;
  tag: string;
  title: string;
  mainImage: string;
  createdAt: Date;
  updatedAt: Date;
}

// ############################
// 2. UTILITAIRES
// ############################

/**
 * Convertit un Timestamp de Firestore ou autre valeur de date en objet Date standard.
 * @param val La valeur de date potentielle (Timestamp, Date, null, undefined).
 * @returns Un objet Date.
 */
const parseFirestoreDate = (val: FirestoreDate): Date => {
  if (val instanceof Date) return val;
  // Vérifie si l'objet est un Timestamp Firestore
  if (
    typeof val === "object" &&
    val !== null &&
    "toDate" in val &&
    typeof (val as { toDate: () => Date }).toDate === "function"
  ) {
    return (val as { toDate: () => Date }).toDate();
  }
  return new Date(0); // Retourne une date par défaut très ancienne en cas d'échec
};

/**
 * Trie les tags par date de mise à jour (du plus récent au plus ancien).
 */
const sortTags = (tags: TagData[]): TagData[] => {
  return tags.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
};


// ############################
// 3. SOUS-COMPOSANTS
// ############################

interface PhotoCardProps {
  tagItem: TagData;
  index: number;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ tagItem, index }) => (
  <Link
    href={`/photo/${tagItem.tag}`}
    className="group relative block w-full aspect-[4/3] overflow-hidden rounded-lg shadow-lg cursor-pointer transition transform duration-400 ease-in-out hover:shadow-2xl hover:translate-y-[-4px] fade-in"
    style={{ animationDelay: `${index * 0.08}s` }}
  >
    {/* 1. Image principale */}
    <Image
      src={tagItem.mainImage}
      alt={tagItem.title}
      fill
      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      className="object-cover transition-transform duration-600 group-hover:scale-110"
      quality={85}
      priority={index < 8} // Prioriser le chargement des premières images
    />

    {/* 2. Overlay de survol et Texte */}
    <div className="absolute inset-0 z-10 bg-black/50 transition-colors duration-400 group-hover:bg-black/70 flex items-center justify-center p-4">
      {/* Container de texte avec effet de transition */}
      <div className="text-center transition-all duration-400 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
        <h3
          className="text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-wide leading-tight"
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
        >
          {tagItem.title}
        </h3>
        <span className="mt-2 inline-block text-xs sm:text-sm text-gray-300 border border-gray-300 rounded-full px-3 py-1 uppercase font-medium">
          Show Photos
        </span>
      </div>
    </div>
  </Link>
);


const LoadingSpinner: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-black text-sm font-light uppercase tracking-wider">
          Chargement des collections...
        </p>
      </div>
    </div>
  );


// ############################
// 4. COMPOSANT PRINCIPAL
// ############################

export default function PhotosPage() {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, "tagTexts"));
      const rawTags: TagData[] = snapshot.docs.map((doc) => {
        const data = doc.data() as Record<string, any>;
        const tag = (data.tag as string) ?? doc.id;
        const fallbackTitle = tag.replaceAll("-", " ");
        
        const createdAt = parseFirestoreDate(data.createdAt as FirestoreDate);
        // Utiliser updatedAt si présent, sinon createdAt, sinon la date par défaut.
        const updatedAt = parseFirestoreDate(data.updatedAt as FirestoreDate) || createdAt;

        return {
          id: doc.id,
          tag: tag,
          title: (data.title as string) || fallbackTitle,
          mainImage: (data.mainImage as string) || "/default-placeholder.jpg",
          createdAt: createdAt,
          updatedAt: updatedAt,
        };
      });
      
      const sortedTags = sortTags(rawTags);
      setTags(sortedTags);
      
    } catch (error) {
      console.error("Erreur critique lors du chargement des tags:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/acid-grotesk');
        * { font-family: 'Acid Grotesk', sans-serif; }
        
        /* Conserver uniquement l'animation de base d'apparition pour les cartes */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>

      <div className="min-h-screen bg-white pt-24 pb-16">
        <main className="px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="sr-only">Collections de Photos</h1> {/* Ajout d'un titre caché pour l'accessibilité */}
            
            {tags.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {tags.map((tagItem, index) => (
                  <PhotoCard
                    key={tagItem.id}
                    tagItem={tagItem}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24">
                <p className="text-gray-400 text-base uppercase tracking-wider text-center font-light">
                  Aucune collection de photos disponible.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}