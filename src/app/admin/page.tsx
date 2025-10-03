"use client";

import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import Image from "next/image";

interface FileWithPreview {
  file: File;
  preview: string;
}

export default function AdminPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles(prev => [...prev, {
          file,
          preview: reader.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return alert("Choisissez au moins une image");

    setUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = files.length;
      let uploadedCount = 0;

      for (const { file } of files) {
        // Upload dans Firebase Storage
        const storageRef = ref(storage, `photos/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        // Enregistrement dans Firestore
        await addDoc(collection(db, "photos"), {
          url,
          description,
          tags: tags.split(",").map((t) => t.trim()),
          createdAt: new Date(),
        });

        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
      }

      alert(`✓ ${totalFiles} image(s) uploadée(s) avec succès !`);
      setFiles([]);
      setDescription("");
      setTags("");
    } catch (err) {
      console.error(err);
      alert("✗ Erreur lors de l'upload");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <section className="min-h-screen bg-black py-8 md:py-12 lg:py-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
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
            Upload de photos multiples
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleUpload} className="space-y-6 md:space-y-8">
          {/* Upload file avec preview */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-white font-bold uppercase tracking-wider text-sm md:text-base mb-2 block flex items-center gap-2">
                <span className="w-6 h-6 md:w-8 md:h-8 border-2 border-white flex items-center justify-center text-xs md:text-sm">1</span>
                Images ({files.length})
              </span>
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                  multiple
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full p-6 md:p-8 border-2 border-dashed border-zinc-700 hover:border-white transition-colors duration-300 cursor-pointer bg-zinc-900 hover:bg-zinc-800"
                >
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl text-zinc-600 mb-2">+</div>
                    <p className="text-zinc-500 text-xs md:text-sm uppercase tracking-wider">
                      Choisir des images
                    </p>
                    <p className="text-zinc-700 text-[10px] mt-1">
                      Sélection multiple possible
                    </p>
                  </div>
                </label>
              </div>
            </label>

            {/* Previews Grid */}
            {files.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((item, index) => (
                  <div key={index} className="relative border-2 border-white overflow-hidden group">
                    <Image 
                      src={item.preview} 
                      alt={`Preview ${index + 1}`}
                      width={300}
                      height={300}
                      className="w-full h-32 md:h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-white text-black text-sm font-bold hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1">
                      <p className="text-white text-[10px] truncate">{item.file.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block">
              <span className="text-white font-bold uppercase tracking-wider text-sm md:text-base mb-2 block flex items-center gap-2">
                <span className="w-6 h-6 md:w-8 md:h-8 border-2 border-white flex items-center justify-center text-xs md:text-sm">2</span>
                Description (commune à toutes)
              </span>
              <input
                type="text"
                placeholder="Décrivez vos photos... (facultatif)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black border-2 border-zinc-800 p-3 md:p-4 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors text-sm md:text-base"
                disabled={uploading}
              />
            </label>
          </div>

          {/* Tags */}
          <div>
            <label className="block">
              <span className="text-white font-bold uppercase tracking-wider text-sm md:text-base mb-2 block flex items-center gap-2">
                <span className="w-6 h-6 md:w-8 md:h-8 border-2 border-white flex items-center justify-center text-xs md:text-sm">3</span>
                Tags (communs à toutes)
              </span>
              <input
                type="text"
                placeholder="FWP, DAMSO, portrait..."
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

          {/* Progress bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="w-full h-2 bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-zinc-500 text-xs text-center uppercase tracking-wider">
                {uploadProgress}% - Upload en cours...
              </p>
            </div>
          )}

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={uploading || files.length === 0}
            className="relative w-full bg-white text-black py-4 md:py-5 text-sm md:text-base font-black uppercase tracking-wider transition-all duration-300 hover:bg-zinc-200 hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-black border-t-transparent animate-spin rounded-full"></span>
                Upload en cours...
              </span>
            ) : (
              `Uploader ${files.length} photo${files.length > 1 ? 's' : ''}`
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