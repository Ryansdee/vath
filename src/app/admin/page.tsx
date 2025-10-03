"use client";

import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import Image from "next/image";

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    // Créer preview
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Choisis une image");

    setUploading(true);
    try {
      // 1. Upload dans Firebase Storage
      const storageRef = ref(storage, `photos/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // 2. Enregistrement dans Firestore
      await addDoc(collection(db, "photos"), {
        url,
        description,
        tags: tags.split(",").map((t) => t.trim()),
        createdAt: new Date(),
      });

      alert("✓ Image uploadée avec succès !");
      setFile(null);
      setDescription("");
      setTags("");
      setPreview(null);
    } catch (err) {
      console.error(err);
      alert("✗ Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="min-h-screen bg-black py-8 md:py-12 lg:py-16 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="h-px w-8 md:w-16 bg-white opacity-20"></div>
            <div className="w-2 h-2 border border-white opacity-40"></div>
            <div className="h-px w-8 md:w-16 bg-white opacity-20"></div>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-center text-white mb-3 md:mb-4">
            <span className="relative inline-block">
              <span className="relative z-10">Admin</span>
              <span className="absolute top-1 left-1 md:top-1.5 md:left-1.5 text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-zinc-800 -z-10">
                Admin
              </span>
            </span>
          </h1>
          
          <p className="text-center text-zinc-500 text-xs md:text-sm uppercase tracking-wider">
            Upload de photos
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleUpload} className="space-y-6 md:space-y-8">
          {/* Upload file avec preview */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-white font-bold uppercase tracking-wider text-sm md:text-base mb-2 block flex items-center gap-2">
                <span className="w-6 h-6 md:w-8 md:h-8 border-2 border-white flex items-center justify-center text-xs md:text-sm">1</span>
                Image
              </span>
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full p-6 md:p-8 border-2 border-dashed border-zinc-700 hover:border-white transition-colors duration-300 cursor-pointer bg-zinc-900 hover:bg-zinc-800"
                >
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl text-zinc-600 mb-2">+</div>
                    <p className="text-zinc-500 text-xs md:text-sm uppercase tracking-wider">
                      {file ? file.name : "Choisir une image"}
                    </p>
                  </div>
                </label>
              </div>
            </label>

            {/* Preview */}
            {preview && (
              <div className="relative border-4 border-white overflow-hidden">
                <img src={preview} alt="Preview" className="w-full h-48 md:h-64 object-cover" />
                <div className="absolute top-2 right-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className="w-8 h-8 bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block">
              <span className="text-white font-bold uppercase tracking-wider text-sm md:text-base mb-2 block flex items-center gap-2">
                <span className="w-6 h-6 md:w-8 md:h-8 border-2 border-white flex items-center justify-center text-xs md:text-sm">2</span>
                Description
              </span>
              <input
                type="text"
                placeholder="Décrivez votre photo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black border-2 border-zinc-800 p-3 md:p-4 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors text-sm md:text-base"
                required
                disabled={uploading}
              />
            </label>
          </div>

          {/* Tags */}
          <div>
            <label className="block">
              <span className="text-white font-bold uppercase tracking-wider text-sm md:text-base mb-2 block flex items-center gap-2">
                <span className="w-6 h-6 md:w-8 md:h-8 border-2 border-white flex items-center justify-center text-xs md:text-sm">3</span>
                Tags
              </span>
              <input
                type="text"
                placeholder="mariage, nature, portrait..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-black border-2 border-zinc-800 p-3 md:p-4 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors text-sm md:text-base"
                required
                disabled={uploading}
              />
              <p className="text-zinc-600 text-xs mt-2 uppercase tracking-wider">
                Séparez par des virgules
              </p>
            </label>
          </div>

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={uploading || !file}
            className="relative w-full bg-white text-black py-4 md:py-5 text-sm md:text-base font-black uppercase tracking-wider transition-all duration-300 hover:bg-zinc-200 hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-black border-t-transparent animate-spin rounded-full"></span>
                Upload en cours...
              </span>
            ) : (
              "Uploader la photo"
            )}
            {!uploading && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-black"></span>
            )}
          </button>
        </form>

        {/* Footer décoratif */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mt-12 md:mt-16">
          <div className="h-px w-12 md:w-16 bg-zinc-800"></div>
          <div className="w-2 h-2 bg-zinc-800"></div>
          <div className="h-px w-12 md:w-16 bg-zinc-800"></div>
        </div>
      </div>
    </section>
  );
}