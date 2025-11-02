"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  category?: string;
}

export default function AdminHomeImagePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<string[]>([]);

  // Charger les photos et la configuration actuelle
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const [snap, settingDoc] = await Promise.all([
          getDocs(collection(db, "photos")),
          getDoc(doc(db, "settings", "homePage")),
        ]);

        const data = snap.docs.map((doc) => ({
          ...(doc.data() as Photo),
          id: doc.id,
        }));

        // Filtrer les catégories inutiles
        const filtered = data.filter(
          (p) =>
            !["blog", "about", "personal-project"].includes(
              p.category?.toLowerCase() || ""
            )
        );

        setPhotos(filtered);

        if (settingDoc.exists()) {
          const homeData = settingDoc.data();
          const saved = Array.isArray(homeData.featuredImages)
            ? homeData.featuredImages
            : homeData.featuredImage
            ? [homeData.featuredImage]
            : [];

          setCurrent(saved);
          setSelected(saved);
        }
      } catch (e) {
        console.error("Erreur de chargement:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  // Gérer la sélection/désélection
  const toggleSelect = (url: string) => {
    setSelected((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  // Sauvegarder la sélection multiple
  const saveSelectedImages = async () => {
    if (selected.length === 0) return alert("❌ Aucune image sélectionnée !");
    try {
      setSaving(true);
      await setDoc(doc(db, "settings", "homePage"), {
        featuredImages: selected,
        updatedAt: new Date(),
      });
      setCurrent(selected);
      alert("✅ Images d’accueil mises à jour !");
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Chargement des images...
      </div>
    );

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-light">🏠 Images d’accueil</h1>
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-black transition"
          >
            ← Retour
          </Link>
        </div>

        {/* Images actuellement affichées */}
        {current.length > 0 && (
          <div className="mb-10">
            <p className="text-gray-600 text-sm mb-2">Images actuellement utilisées :</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {current.map((url, i) => (
                <div key={i} className="relative aspect-[16/9] rounded-lg overflow-hidden border">
                  <Image
                    src={url}
                    alt={`Image actuelle ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Liste des images sélectionnables */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo) => {
            const displayUrl = photo.thumbnailUrl || photo.url;
            const isSelected = selected.includes(photo.url);

            return (
              <div
                key={photo.id}
                onClick={() => toggleSelect(photo.url)}
                className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                  isSelected
                    ? "border-black scale-[1.03]"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <Image
                  src={displayUrl}
                  alt={photo.description || ""}
                  width={400}
                  height={300}
                  className="object-cover w-full h-auto"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center text-xs uppercase">
                    Sélectionnée
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bouton de sauvegarde */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={saveSelectedImages}
            disabled={saving}
            className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition disabled:opacity-50"
          >
            {saving ? "Sauvegarde..." : "Sauvegarder la sélection"}
          </button>
        </div>
      </div>

      {/* Overlay de sauvegarde */}
      {saving && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center text-white text-lg">
          Sauvegarde en cours...
        </div>
      )}
    </div>
  );
}
