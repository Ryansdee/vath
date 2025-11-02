"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  tags: string[];
}

interface TagInfo {
  tag: string;
  count: number;
}

export default function AdminTagCoverPage() {
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentCover, setCurrentCover] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [saving, setSaving] = useState(false);

  // Charger tous les tags disponibles
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const snapshot = await getDocs(collection(db, "photos"));
        const photosData = snapshot.docs.map((doc) => doc.data() as Photo);
        const tagCount = new Map<string, number>();

        photosData.forEach((photo) => {
          photo.tags.forEach((tag) => {
            tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
          });
        });

        const tagList: TagInfo[] = Array.from(tagCount.entries()).map(
          ([tag, count]) => ({ tag, count })
        );

        setTags(tagList.sort((a, b) => a.tag.localeCompare(b.tag)));
      } catch (err) {
        console.error("Erreur lors du chargement des tags:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  // Charger les images d’un tag sélectionné
  const loadPhotosForTag = async (tag: string) => {
    setSelectedTag(tag);
    setPhotos([]);
    setLoadingPhotos(true);
    setSelectedImage(null);
    try {
      const q = query(collection(db, "photos"), where("tags", "array-contains", tag));
      const snapshot = await getDocs(q);
      const photoList: Photo[] = snapshot.docs.map((doc) => {
        const data = doc.data() as Photo;
        return {
          ...data,
          id: doc.id,
        };
      });
      setPhotos(photoList);

      // Charger la cover actuelle
      const tagDoc = await getDoc(doc(db, "tagTexts", tag));
      if (tagDoc.exists()) {
        setCurrentCover(tagDoc.data().mainImage || null);
      } else setCurrentCover(null);
    } catch (err) {
      console.error("Erreur lors du chargement des images du tag:", err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  // Sauvegarde de la nouvelle image principale
  const handleSave = async () => {
    if (!selectedImage || !selectedTag) return alert("Choisis une image !");
    setSaving(true);
    try {
      const tagRef = doc(db, "tagTexts", selectedTag);
      const oldDoc = await getDoc(tagRef);
      const oldData = oldDoc.exists() ? oldDoc.data() : {};
      await setDoc(tagRef, {
        ...oldData,
        tag: selectedTag,
        title: selectedTag.replaceAll("-", " "),
        mainImage: selectedImage,
        updatedAt: new Date(),
      });
      setCurrentCover(selectedImage);
      setSelectedImage(null);
    } catch (err) {
      console.error("Erreur de sauvegarde:", err);
      alert("❌ Erreur de sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Chargement des tags...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 flex flex-col items-center py-16">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-300">
        {/* Barre macOS */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b border-gray-200">
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
          </div>
          <h1 className="text-sm text-gray-600 font-medium">
            Admin • Tag Cover Manager
          </h1>
          <div className="w-12" />
        </div>

        {/* Contenu principal */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/admin"
              className="text-sm text-gray-500 hover:text-black transition"
            >
              ← Retour
            </Link>
          </div>

          {/* Étape 1 : Liste des tags */}
          {!selectedTag && (
            <>
              <h2 className="text-lg text-gray-800 font-semibold mb-6">
                Choisir un tag pour définir son image principale
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {tags.map((t) => (
                  <button
                    key={t.tag}
                    onClick={() => loadPhotosForTag(t.tag)}
                    className="bg-gray-50 border border-gray-200 hover:border-black rounded-xl p-6 text-center shadow-sm hover:cursor-pointer hover:shadow-md transition-all"
                  >
                    <p className="font-medium text-gray-800 capitalize">
                      {t.tag.replaceAll("-", " ")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{t.count} photos</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Étape 2 : Sélection d’une image */}
          {selectedTag && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-black capitalize">
                    {selectedTag.replaceAll("-", " ")}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Choisis une image pour ce tag
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTag(null);
                    setPhotos([]);
                  }}
                  className="text-sm text-gray-500 hover:text-black transition"
                >
                  ← Retour aux tags
                </button>
              </div>

              {/* Image actuelle */}
              {currentCover && (
                <div className="mb-8">
                  <p className="text-gray-600 text-sm mb-2">
                    Image principale actuelle :
                  </p>
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                    <Image
                      src={currentCover}
                      alt="Image principale"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Liste d’images disponibles */}
              {loadingPhotos ? (
                <p className="text-center text-gray-500 mt-10">
                  Chargement des images...
                </p>
              ) : photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedImage(photo.url)}
                      className={`relative aspect-[4/3] overflow-hidden rounded-xl border-4 cursor-pointer transition-all duration-200 ${
                        selectedImage === photo.url
                          ? "border-black scale-[1.02]"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={photo.thumbnailUrl || photo.url}
                        alt={photo.description || ""}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 mt-10">
                  Aucune image trouvée pour ce tag.
                </p>
              )}

              {/* Bouton de sauvegarde */}
              {photos.length > 0 && (
                <div className="flex justify-end mt-8">
                  <button
                    onClick={handleSave}
                    disabled={!selectedImage || saving}
                    className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
                  >
                    {saving
                      ? "Sauvegarde..."
                      : "Définir comme image principale"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
