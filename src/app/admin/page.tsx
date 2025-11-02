"use client";

import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../../../lib/firebase";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import imageCompression from "browser-image-compression";

interface FileWithPreview {
  file: File;
  preview: string;
  uploadedUrl?: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
}

type Category = "photo" | "video" | "diary" | "blog";

export default function AdminUploadPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState<Category>("photo");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Modale de prévisualisation
  const [previewModal, setPreviewModal] = useState<{ src: string; index: number } | null>(null);

  const categories: { value: Category; label: string; icon: string }[] = [
    { value: "photo", label: "Photo", icon: "📸" },
    { value: "video", label: "Video", icon: "🎥" },
    { value: "diary", label: "Diary", icon: "🚀" },
    { value: "blog", label: "Blog", icon: "✍️" },
  ];

  // Gérer sélection fichiers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles((prev) => [...prev, { file, preview: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  // Générer miniatures client-side
  const generateCompressedImage = async (file: File, maxWidth: number, quality: number) => {
    const options = { maxWidthOrHeight: maxWidth, initialQuality: quality, useWebWorker: true };
    return await imageCompression(file, options);
  };

  // Upload principal
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return alert("Choose at least one image");

    setUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = files.length;
      let uploadedCount = 0;
      const newFiles: FileWithPreview[] = [];

      for (const { file } of files) {
        const timestamp = Date.now();
        const baseName = `${timestamp}_${file.name.replace(/\s+/g, "_")}`;

        // Original
        const originalRef = ref(storage, `photos/${baseName}`);
        await uploadBytes(originalRef, file);
        const url = await getDownloadURL(originalRef);

        // Thumbnail + medium
        const thumbBlob = await generateCompressedImage(file, 200, 0.6);
        const mediumBlob = await generateCompressedImage(file, 800, 0.75);

        const thumbRef = ref(storage, `thumbnails/${baseName}`);
        await uploadBytes(thumbRef, thumbBlob);
        const thumbnailUrl = await getDownloadURL(thumbRef);

        const mediumRef = ref(storage, `medium/${baseName}`);
        await uploadBytes(mediumRef, mediumBlob);
        const mediumUrl = await getDownloadURL(mediumRef);

        // Firestore
        await addDoc(collection(db, "photos"), {
          url,
          thumbnailUrl,
          mediumUrl,
          description,
          tags: tags
            .split(",")
            .map((t) => t.trim().replaceAll(" ", "-"))
            .filter(Boolean),
          category,
          createdAt: new Date(),
        });

        newFiles.push({
          file,
          preview: URL.createObjectURL(file),
          uploadedUrl: url,
          thumbnailUrl,
          mediumUrl,
        });

        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
      }

      setFiles(newFiles);
      alert(`✅ ${totalFiles} image(s) uploaded successfully!`);
    } catch (err) {
      console.error(err);
      alert("❌ Upload error");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Définir comme mainImage
  const setAsMainImage = async (imageUrl: string) => {
    const tagList = tags
      .split(",")
      .map((t) => t.trim().replaceAll(" ", "-"))
      .filter(Boolean);

    if (tagList.length === 0) return alert("❌ Aucun tag défini pour cette image !");

    try {
      for (const tag of tagList) {
        const tagRef = doc(db, "tagTexts", tag);
        const existing = await getDoc(tagRef);
        const baseData = existing.exists() ? existing.data() : { tag, title: tag.replaceAll("-", " ") };
        await setDoc(tagRef, {
          ...baseData,
          mainImage: imageUrl,
          updatedAt: new Date(),
        });
      }
      alert(`✅ Image définie comme mainImage pour ${tagList.join(", ")}`);
    } catch (err) {
      console.error("Erreur:", err);
      alert("❌ Erreur lors de la mise à jour du mainImage");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="pt-32 pb-16 px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto animate-fade-in text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-3 tracking-tight">
            Upload Content
          </h1>
          <p className="text-gray-500 text-sm">High quality upload • Auto thumbnails</p>

          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <Link
              href="/admin/portal"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium hover:border-black transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              Client Portals
            </Link>

            <Link
              href="/admin/texts"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium hover:border-black transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Manage Texts
            </Link>

            <Link
              href="/admin/tag-cover"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium hover:border-black transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9.75L12 4l9 5.75V20a2 2 0 01-2 2H5a2 2 0 01-2-2V9.75z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 22V12h6v10"
                />
              </svg>
              Tag Cover
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleUpload} className="space-y-8">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Category *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    disabled={uploading}
                    className={`relative p-4 border-2 transition-all duration-200 ${
                      category === cat.value
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    <div className="text-2xl mb-2">{cat.icon}</div>
                    <div className="text-sm font-semibold uppercase tracking-wide">
                      {cat.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Files */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Files ({files.length})
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                multiple
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full p-12 border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <p className="text-gray-600 text-sm mb-1">Click to upload or drag and drop</p>
                <p className="text-gray-400 text-xs">JPG, PNG • Auto thumbnails</p>
              </label>

              {/* Preview grid */}
              {files.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {files.map((item, index) => (
                    <div key={index} className="relative group">
                      <div
                        className="aspect-square bg-gray-100 overflow-hidden rounded-lg cursor-pointer"
                        onClick={() => setPreviewModal({ src: item.preview, index })}
                      >
                        <Image
                          src={item.preview}
                          alt={`Preview ${index + 1}`}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {item.uploadedUrl && (
                        <button
                          type="button"
                          onClick={() => setAsMainImage(item.uploadedUrl!)}
                          className="absolute bottom-2 left-2 right-2 bg-black/80 text-white text-xs py-1 rounded hover:bg-black transition"
                        >
                          Set as Main Image
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-black text-white text-sm font-bold hover:bg-red-600 transition opacity-0 group-hover:opacity-100 rounded-full"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description + Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <input
                type="text"
                placeholder="Describe your content..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:border-black outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags *</label>
              <input
                type="text"
                placeholder="portrait, fashion..."
                value={tags.replaceAll(" ", "-")}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:border-black outline-none"
                required
              />
              <p className="text-gray-500 text-xs mt-2">Separate with commas</p>
            </div>

            {/* Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="w-full h-2 bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-black transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-gray-600 text-sm text-center">
                  {uploadProgress}% - Uploading...
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={uploading || files.length === 0}
              className="w-full bg-black text-white py-4 font-semibold hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>
      </main>

      {/* --- MODALE DE PRÉVISUALISATION --- */}
      {previewModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setPreviewModal(null)}
        >
          <div
            className="relative max-w-5xl w-full mx-4 bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-[16/9] bg-black">
              <Image
                src={files[previewModal.index]?.mediumUrl || previewModal.src}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
            <div className="p-4 flex justify-between items-center bg-gray-100 border-t">
              <button
                onClick={() => setAsMainImage(files[previewModal.index]?.uploadedUrl || "")}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Définir comme mainImage
              </button>
              <button
                onClick={() => setPreviewModal(null)}
                className="text-gray-600 hover:text-black transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
