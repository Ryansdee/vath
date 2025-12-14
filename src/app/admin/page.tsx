"use client";

import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../../../lib/firebase";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import imageCompression from "browser-image-compression";

interface FileWithPreview {
  file?: File;
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
  const [videoUrl, setVideoUrl] = useState("");
  const [previewModal, setPreviewModal] = useState<{ src: string; index: number } | null>(null);

  const categories: { value: Category; label: string; icon: string }[] = [
    { value: "photo", label: "Photo", icon: "📸" },
    { value: "video", label: "Video", icon: "🎥" },
    { value: "diary", label: "Diary", icon: "🚀" },
    { value: "blog", label: "Blog", icon: "✍️" },
  ];

  /* ---------------- FILE SELECTION ---------------- */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);

    selected.forEach((file) => {
      if (file.type.startsWith("video/")) {
        setFiles([
          {
            file,
            preview: URL.createObjectURL(file),
          },
        ]);
      } else {
        const reader = new FileReader();
        reader.onloadend = () =>
          setFiles((prev) => [
            ...prev,
            { file, preview: reader.result as string },
          ]);
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFile = (i: number) => setFiles((p) => p.filter((_, index) => index !== i));

  const generateCompressedImage = async (
    file: File,
    max: number,
    quality: number
  ) =>
    imageCompression(file, {
      maxWidthOrHeight: max,
      initialQuality: quality,
      useWebWorker: true,
    });

  const normalizeVideoUrl = (url: string) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube") || u.hostname.includes("youtu.be")) {
        const id = u.searchParams.get("v") || u.pathname.split("/").pop();
        return `https://www.youtube.com/embed/${id}`;
      }
      if (u.hostname.includes("vimeo")) {
        const id = u.pathname.split("/").pop();
        return `https://player.vimeo.com/video/${id}`;
      }
    } catch {}
    return url;
  };

  const getYoutubeThumbnail = (url: string) => {
    try {
      const u = new URL(url);
      const id = u.searchParams.get("v") || u.pathname.replace("/", "");
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    } catch {}
    return "";
  };

  /* ---------------- UPLOAD ---------------- */

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);

    /* --- VIDEO LINK --- */
    if (category === "video" && videoUrl) {
      await addDoc(collection(db, "videos"), {
        url: normalizeVideoUrl(videoUrl),
        thumbnail: getYoutubeThumbnail(videoUrl),
        description,
        tags: tags.split(",").map((t) => t.trim().replaceAll(" ", "-")).filter(Boolean),
        createdAt: new Date(),
        type: "embed",
      });
      alert("✅ Video link added!");
      setVideoUrl("");
      setDescription("");
      setTags("");
      setUploading(false);
      return;
    }

    /* --- MP4 --- */
    if (
      category === "video" &&
      files.length === 1 &&
      files[0].file?.type.startsWith("video/")
    ) {
      const file = files[0].file;
      const name = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const videoRef = ref(storage, `videos/${name}`);
      await uploadBytes(videoRef, file);
      const url = await getDownloadURL(videoRef);

      await addDoc(collection(db, "videos"), {
        url,
        description,
        tags: tags.split(",").map((t) => t.trim().replaceAll(" ", "-")).filter(Boolean),
        createdAt: new Date(),
        type: "mp4",
      });

      alert("✅ Video uploaded!");
      setFiles([]);
      setDescription("");
      setTags("");
      setUploading(false);
      return;
    }

    /* --- IMAGES --- */
    if (files.length === 0) {
      alert("Add files or a video link first.");
      setUploading(false);
      return;
    }

    let uploaded = 0;
    const updatedFiles: FileWithPreview[] = [...files];

    for (let i = 0; i < files.length; i++) {
      const { file } = files[i];
      if (!file) continue;

      const name = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const originalRef = ref(storage, `photos/${name}`);
      await uploadBytes(originalRef, file);
      const url = await getDownloadURL(originalRef);

      const thumb = await generateCompressedImage(file, 200, 0.6);
      const medium = await generateCompressedImage(file, 800, 0.75);

      const thumbRef = ref(storage, `thumbnails/${name}`);
      const mediumRef = ref(storage, `medium/${name}`);

      await uploadBytes(thumbRef, thumb);
      await uploadBytes(mediumRef, medium);

      const thumbnailUrl = await getDownloadURL(thumbRef);
      const mediumUrl = await getDownloadURL(mediumRef);

      updatedFiles[i] = { ...updatedFiles[i], uploadedUrl: url, thumbnailUrl, mediumUrl };

      await addDoc(collection(db, "photos"), {
        url,
        thumbnailUrl,
        mediumUrl,
        description,
        tags: tags.split(",").map((t) => t.trim().replaceAll(" ", "-")).filter(Boolean),
        category,
        createdAt: new Date(),
      });

      uploaded++;
      setUploadProgress(Math.round((uploaded / files.length) * 100));
    }

    setFiles(updatedFiles);
    alert("✅ Upload complete!");
    setUploading(false);
  };

  const setAsMainImage = async (url: string) => {
    if (!url) {
      alert("⚠️ Upload the image first!");
      return;
    }
    const tagList = tags.split(",").map((t) => t.trim().replaceAll(" ", "-")).filter(Boolean);
    for (const tag of tagList) {
      const refDoc = doc(db, "tagTexts", tag);
      const existing = await getDoc(refDoc);
      await setDoc(refDoc, { 
        ...(existing.exists() ? existing.data() : {}), 
        mainImage: url, 
        updatedAt: new Date() 
      });
    }
    alert("✅ Main image updated!");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="pt-32 pb-16 px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-black mb-3 tracking-tight">
            Upload Content
          </h1>
          <p className="text-gray-500 text-sm">Smart upload • Auto thumbnails • Video preview</p>

          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <Link
              href="/admin/portal"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium hover:border-black transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Client Portals
            </Link>

            <Link
              href="/admin/texts"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium hover:border-black transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Manage Texts
            </Link>

            <Link
              href="/admin/tag-cover"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium hover:border-black transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9.75L12 4l9 5.75V20a2 2 0 01-2 2H5a2 2 0 01-2-2V9.75z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 22V12h6v10" />
              </svg>
              Tag Cover
            </Link>

            <Link href="/admin/home-image"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium hover:border-black transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.213L8.25 11.25l4.167 4.166a2 2 0 002.828 0l5.916-5.916a2 2 0 00-1.414-3.414H19a2 2 0 01-2-2V3a2 2 0 00-2-2H5a2 2 0 00-2 2v2z" />
              </svg>
              Home Page Image
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <form onSubmit={handleUpload} className="space-y-8">
          
          {/* Category */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`p-4 border-2 rounded ${
                  category === c.value ? "border-black" : "border-gray-200"
                }`}
              >
                <div className="text-2xl">{c.icon}</div>
                {c.label}
              </button>
            ))}
          </div>

          {/* Video link */}
          {category === "video" && (
            <div>
              <input
                type="url"
                placeholder="YouTube or Vimeo URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full border text-black px-4 py-3"
              />
              {videoUrl && (
                <iframe
                  className="w-full aspect-video mt-4"
                  src={normalizeVideoUrl(videoUrl)}
                  allowFullScreen
                />
              )}
            </div>
          )}

          {/* Upload */}
          <div>
            <input
              type="file"
              multiple={category !== "video"}
              accept={
                category === "video"
                  ? "video/mp4,video/webm"
                  : "image/*"
              }
              onChange={handleFileChange}
              className="hidden"
              id="files"
            />
            <label
              htmlFor="files"
              className="block text-black p-12 border-2 border-dashed text-center cursor-pointer hover:border-black transition-colors"
            >
              Click or drag files here
            </label>

            {files.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {files.map((f, i) => (
                  <div key={i} className="relative group">
                    <Image
                      src={f.preview}
                      alt=""
                      width={300}
                      height={300}
                      onClick={() => setPreviewModal({ src: f.preview, index: i })}
                      className="object-cover aspect-square rounded cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-2 right-2 bg-black text-white w-6 h-6 rounded-full text-sm hover:bg-gray-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-black border px-4 py-3"
          />

          <input
            type="text"
            placeholder="portrait, fashion..."
            value={tags.replaceAll(" ", "-")}
            onChange={(e) => setTags(e.target.value)}
            className="w-full text-black border px-4 py-3"
            required
          />

          {uploading && (
            <div className="text-center text-black font-medium">
              {uploadProgress}%
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-black text-white py-4 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </main>

      {/* Preview modal */}
      {previewModal && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
          onClick={() => setPreviewModal(null)}
        >
          <div
            className="bg-white max-w-4xl w-full p-6 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={previewModal.src}
              alt="preview"
              width={1600}
              height={900}
              className="object-contain w-full h-auto"
            />
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                className="flex-1 bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors"
                onClick={() => setAsMainImage(files[previewModal.index]?.uploadedUrl || "")}
              >
                Set as Main Image
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 hover:border-black transition-colors"
                onClick={() => setPreviewModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}