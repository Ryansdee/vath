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
  // --- Protection par code ---
  const [accessGranted, setAccessGranted] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const adminCode = process.env.NEXT_PUBLIC_ADMIN_CODE;

  // --- États du formulaire ---
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // --- Vérification du code ---
  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode === adminCode) {
      setAccessGranted(true);
    } else {
      alert("Code incorrect ❌");
    }
  };

  // --- Upload logic ---
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

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return alert("Choose at least one image");

    setUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = files.length;
      let uploadedCount = 0;

      for (const { file } of files) {
        const storageRef = ref(storage, `photos/${Date.now()}_${file.name}`);
        const metadata = {
          contentType: file.type,
          customMetadata: {
            originalSize: file.size.toString(),
            uploadDate: new Date().toISOString(),
          },
          cacheControl: "public, max-age=31536000",
        };

        await uploadBytes(storageRef, file, metadata);
        const url = await getDownloadURL(storageRef);

        await addDoc(collection(db, "photos"), {
          url,
          description,
          tags: tags.split(",").map((t) => t.trim()),
          createdAt: new Date(),
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          },
        });

        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
      }

      alert(`✓ ${totalFiles} image(s) uploaded successfully in high quality!`);
      setFiles([]);
      setDescription("");
      setTags("");
    } catch (err) {
      console.error(err);
      alert("✗ Upload error");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // --- Si le code n’est pas encore validé ---
  if (!accessGranted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form
          onSubmit={handleAccess}
          className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm text-center"
        >
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Admin Access</h1>
          <input
            type="password"
            placeholder="Enter access code"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-black"
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Access
          </button>
        </form>
      </div>
    );
  }

  // --- Page admin complète ---
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="pt-32 pb-16 px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto animate-fade-in text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-3 tracking-tight">
            Admin
          </h1>
          <p className="text-gray-500 text-sm">
            High quality upload • No compression
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleUpload} className="space-y-8">
            
            {/* Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Images ({files.length})
              </label>
              
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
                className="flex flex-col items-center justify-center w-full p-12 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600 text-sm mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-gray-400 text-xs">
                  JPG, PNG • Max quality preserved
                </p>
              </label>

              {/* Previews */}
              {files.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {files.map((item, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 overflow-hidden">
                        <Image 
                          src={item.preview} 
                          alt={`Preview ${index + 1}`}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover"
                          quality={100}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-black text-white text-sm font-bold hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 truncate">{item.file.name}</p>
                        <p className="text-xs text-gray-400">
                          {(item.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <input
                type="text"
                placeholder="Describe your photos..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:border-[#090860] focus:ring-1 focus:ring-[#090860] outline-none transition-colors"
                disabled={uploading}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (required)
              </label>
              <input
                type="text"
                placeholder="FWP, DAMSO, portrait..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:border-[#090860] focus:ring-1 focus:ring-[#090860] outline-none transition-colors"
                required
                disabled={uploading}
              />
              <p className="text-gray-500 text-xs mt-2">
                Separate with commas
              </p>
            </div>

            {/* Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="w-full h-2 bg-gray-200 overflow-hidden">
                  <div 
                    className="h-full bg-[#090860] transition-all duration-300"
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
              className="w-full bg-black text-white py-4 font-semibold transition-all duration-200 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                  Uploading...
                </span>
              ) : (
                `Upload ${files.length} photo${files.length > 1 ? "s" : ""}`
              )}
            </button>
          </form>
        </div>
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
