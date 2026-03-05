"use client";

import { JSX, useState, useRef } from "react";
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

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
  .font-serif-display { font-family: 'DM Serif Display', serif; }
  .font-dm { font-family: 'DM Sans', sans-serif; }
  @keyframes spin-admin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spin-admin { animation: spin-admin 0.9s linear infinite; }
`;

export default function AdminUploadPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState<Category>("photo");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [previewModal, setPreviewModal] = useState<{ src: string; index: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState<{ file: File; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const categories: { value: Category; label: string; icon: JSX.Element }[] = [
    { value: "photo", label: "Photo", icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { value: "video", label: "Vidéo", icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
    { value: "diary", label: "Diary", icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
    { value: "blog", label: "Blog", icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
  ];

  const navLinks = [
    { href: "/admin/portal", label: "Portails", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg> },
    { href: "/admin/texts", label: "Textes", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
    { href: "/admin/tag-cover", label: "Tag Cover", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg> },
    { href: "/admin/home-image", label: "Page d'accueil", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  ];

  /* ── File handlers ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = "";
    selected.forEach((file) => {
      if (file.type.startsWith("video/")) {
        setFiles([{ file, preview: URL.createObjectURL(file) }]);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => setFiles((prev) => [...prev, { file, preview: reader.result as string }]);
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
    Array.from(e.dataTransfer.files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setFiles((prev) => [...prev, { file, preview: reader.result as string }]);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (i: number) => setFiles((p) => p.filter((_, idx) => idx !== i));

  const generateCompressedImage = async (file: File, max: number, quality: number) =>
    imageCompression(file, { maxWidthOrHeight: max, initialQuality: quality, useWebWorker: true });

  const normalizeVideoUrl = (url: string) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube") || u.hostname.includes("youtu.be")) {
        const id = u.searchParams.get("v") || u.pathname.split("/").pop();
        return `https://www.youtube.com/embed/${id}`;
      }
      if (u.hostname.includes("vimeo")) return `https://player.vimeo.com/video/${u.pathname.split("/").pop()}`;
    } catch {} return url;
  };

  const getYoutubeThumbnail = (url: string) => {
    try {
      const u = new URL(url);
      return `https://img.youtube.com/vi/${u.searchParams.get("v") || u.pathname.replace("/", "")}/hqdefault.jpg`;
    } catch {} return "";
  };

  /* ── Upload ── */
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault(); setUploading(true); setUploadProgress(0);
    const tagList = tags.split(",").map((t) => t.trim().replaceAll(" ", "-")).filter(Boolean);

    if (category === "video" && videoUrl) {
      let thumbnailUrl = getYoutubeThumbnail(videoUrl);
      // Upload custom thumbnail if provided
      if (videoThumbnail) {
        const thumbName = `${Date.now()}_thumb_${videoThumbnail.file.name.replace(/\s+/g, "_")}`;
        const thumbRef = ref(storage, `thumbnails/${thumbName}`);
        await uploadBytes(thumbRef, videoThumbnail.file);
        thumbnailUrl = await getDownloadURL(thumbRef);
      }
      await addDoc(collection(db, "videos"), { url: normalizeVideoUrl(videoUrl), thumbnail: thumbnailUrl, description, tags: tagList, createdAt: new Date(), type: "youtube" });
      alert("✅ Lien vidéo ajouté !"); setVideoUrl(""); setDescription(""); setTags(""); setVideoThumbnail(null); setUploading(false); return;
    }
    if (category === "video" && files.length === 1 && files[0].file?.type.startsWith("video/")) {
      const file = files[0].file!;
      const name = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const videoRef = ref(storage, `videos/${name}`);
      await uploadBytes(videoRef, file);
      const url = await getDownloadURL(videoRef);
      let thumbnailUrl = "";
      if (videoThumbnail) {
        const thumbName = `${Date.now()}_thumb_${videoThumbnail.file.name.replace(/\s+/g, "_")}`;
        const thumbRef = ref(storage, `thumbnails/${thumbName}`);
        await uploadBytes(thumbRef, videoThumbnail.file);
        thumbnailUrl = await getDownloadURL(thumbRef);
      }
      await addDoc(collection(db, "videos"), { url, thumbnail: thumbnailUrl || undefined, description, tags: tagList, createdAt: new Date(), type: "mp4" });
      alert("✅ Vidéo uploadée !"); setFiles([]); setVideoThumbnail(null); setDescription(""); setTags(""); setUploading(false); return;
    }
    if (files.length === 0) { alert("Ajoutez des fichiers d'abord."); setUploading(false); return; }

    let uploaded = 0;
    const updatedFiles: FileWithPreview[] = [...files];
    for (let i = 0; i < files.length; i++) {
      const { file } = files[i]; if (!file) continue;
      const name = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const originalRef = ref(storage, `photos/${name}`);
      await uploadBytes(originalRef, file);
      const url = await getDownloadURL(originalRef);
      const thumb = await generateCompressedImage(file, 200, 0.6);
      const medium = await generateCompressedImage(file, 800, 0.75);
      const thumbRef = ref(storage, `thumbnails/${name}`);
      const mediumRef = ref(storage, `medium/${name}`);
      await uploadBytes(thumbRef, thumb); await uploadBytes(mediumRef, medium);
      const thumbnailUrl = await getDownloadURL(thumbRef);
      const mediumUrl = await getDownloadURL(mediumRef);
      updatedFiles[i] = { ...updatedFiles[i], uploadedUrl: url, thumbnailUrl, mediumUrl };
      await addDoc(collection(db, "photos"), { url, thumbnailUrl, mediumUrl, description, tags: tagList, category, createdAt: new Date() });
      uploaded++; setUploadProgress(Math.round((uploaded / files.length) * 100));
    }
    setFiles(updatedFiles); alert("✅ Upload terminé !"); setUploading(false);
  };

  const setAsMainImage = async (url: string) => {
    if (!url) { alert("⚠️ Uploadez l'image d'abord !"); return; }
    const tagList = tags.split(",").map((t) => t.trim().replaceAll(" ", "-")).filter(Boolean);
    for (const tag of tagList) {
      const refDoc = doc(db, "tagTexts", tag);
      const existing = await getDoc(refDoc);
      await setDoc(refDoc, { ...(existing.exists() ? existing.data() : {}), mainImage: url, updatedAt: new Date() });
    }
    alert("✅ Image principale mise à jour !");
  };

  /* ── Reusable classes ── */
  const inputCls = "w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-md px-4 py-[11px] text-[#e8e4dc] text-[13px] font-dm outline-none transition-colors focus:border-[#3a3a3a] placeholder:text-[#333]";
  const cardCls = "bg-[#111] border border-[#1e1e1e] rounded-lg p-5 mb-4";
  const sectionLabelCls = "text-[10px] tracking-[0.2em] uppercase text-[#444] mb-3.5 block";

  return (
    <>
      <style>{globalStyles}</style>

      <div className="font-dm bg-[#0a0a0a] min-h-screen text-[#e8e4dc]">

        {/* ── Mobile sidebar overlay ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside className={`
          fixed top-0 left-0 h-full w-[220px] bg-[#111] border-r border-[#1e1e1e]
          flex flex-col z-50 transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}>
          <div className="px-5 pt-7 pb-5 border-b border-[#1e1e1e] flex-shrink-0">
            <p className="font-serif-display text-[17px] tracking-[0.04em] text-white leading-tight">Vadim Thevelin</p>
            <span className="text-[9px] tracking-[0.18em] uppercase text-[#444] mt-1 block">Administration</span>
          </div>

          <nav className="flex-1 px-2.5 py-4 flex flex-col gap-0.5 overflow-y-auto">
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#3a3a3a] px-2.5 mt-2 mb-1.5">Navigation</p>

            {/* Active item */}
            <Link href="/admin" onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-[9px] rounded-md text-[13px] tracking-[0.01em] bg-white text-black [&_svg]:stroke-black whitespace-nowrap">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Upload
            </Link>

            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-[9px] rounded-md text-[13px] text-[#666] tracking-[0.01em] hover:bg-[#181818] hover:text-[#ccc] transition-colors whitespace-nowrap">
                {l.icon}{l.label}
              </Link>
            ))}
          </nav>

          <div className="px-5 py-4 border-t border-[#1e1e1e] flex-shrink-0 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full flex-shrink-0" />
            <span className="text-[11px] text-[#444] tracking-[0.04em]">Système opérationnel</span>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="lg:ml-[220px] min-h-screen flex flex-col">

          {/* Top bar */}
          <div className="bg-[#0d0d0d] border-b border-[#1a1a1a] px-5 lg:px-10 h-[60px] flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Hamburger */}
              <button
                className="lg:hidden flex flex-col justify-center gap-[5px] p-1 cursor-pointer"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Ouvrir le menu"
              >
                <span className="w-5 h-px bg-[#666] block" />
                <span className="w-5 h-px bg-[#666] block" />
                <span className="w-5 h-px bg-[#666] block" />
              </button>
              <div className="flex items-center gap-2 text-[12px] text-[#444] tracking-[0.04em]">
                <span>Admin</span>
                <span className="text-[#2a2a2a]">/</span>
                <span className="text-[#ccc] font-medium">Upload</span>
              </div>
            </div>
            <span className="text-[11px] text-[#555] tracking-[0.05em] px-3 py-1 border border-[#1e1e1e] rounded-full bg-[#111]">
              {files.length} fichier{files.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 lg:px-10 py-8 pb-16 w-full max-w-[860px] mx-auto">
            <h1 className="font-serif-display text-[26px] sm:text-[30px] text-white tracking-[0.01em] leading-tight mb-1">
              Nouveau contenu
            </h1>
            <p className="text-[11px] text-[#444] tracking-[0.12em] uppercase mb-8">
              Upload · Compression auto · Prévisualisation
            </p>

            <form onSubmit={handleUpload}>

              {/* Type */}
              <div className={cardCls}>
                <span className={sectionLabelCls}>Type de contenu</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className={`border rounded-md px-2 py-3.5 flex flex-col items-center gap-2 text-[12px] tracking-[0.03em] transition-colors cursor-pointer font-dm leading-none ${
                        category === c.value
                          ? "border-[#e8e4dc] text-[#e8e4dc] bg-[#161616]"
                          : "border-[#1e1e1e] text-[#555] hover:border-[#333] hover:text-[#999] hover:bg-[#161616]"
                      }`}
                    >
                      {c.icon}{c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video URL */}
              {category === "video" && (
                <div className={cardCls}>
                  <span className={sectionLabelCls}>Lien vidéo</span>
                  <input type="url" placeholder="https://www.youtube.com/watch?v=..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className={inputCls} />
                  {videoUrl && (
                    <div className="mt-3.5 rounded-md overflow-hidden border border-[#1e1e1e]">
                      <iframe style={{ width: "100%", aspectRatio: "16/9", border: "none", display: "block" }} src={normalizeVideoUrl(videoUrl)} allowFullScreen />
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
                    <span className="text-[10px] text-[#444] tracking-[0.15em] uppercase mb-3 block">
                      Thumbnail personnalisé <span className="text-[#2e2e2e]">· optionnel</span>
                    </span>
                    <input
                      ref={thumbInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      tabIndex={-1}
                      aria-hidden="true"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = () => setVideoThumbnail({ file, preview: reader.result as string });
                        reader.readAsDataURL(file);
                        e.target.value = "";
                      }}
                    />
                    {videoThumbnail ? (
                      <div className="relative aspect-video max-w-xs rounded-md overflow-hidden border border-[#1e1e1e] group cursor-pointer" onClick={() => thumbInputRef.current?.click()}>
                        <Image src={videoThumbnail.preview} alt="Thumbnail" fill style={{ objectFit: "cover" }} className="group-hover:opacity-60 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] tracking-[0.1em] uppercase text-[#ccc] bg-black/70 px-3 py-1.5 rounded">Changer</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setVideoThumbnail(null); }}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/80 border border-[#3a3a3a] rounded-full text-[#bbb] text-[15px] flex items-center justify-center cursor-pointer font-sans leading-none p-0 border-none"
                        >×</button>
                      </div>
                    ) : (
                      <div
                        onClick={() => thumbInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && thumbInputRef.current?.click()}
                        className="flex items-center gap-3 px-4 py-3 border border-dashed border-[#222] rounded-md bg-[#0d0d0d] hover:border-[#3a3a3a] hover:bg-[#111] cursor-pointer transition-colors outline-none group"
                      >
                        <svg width="16" height="16" className="stroke-[#333] group-hover:stroke-[#555] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-[12px] text-[#3a3a3a] group-hover:text-[#666] transition-colors">
                          Ajouter un thumbnail personnalisé
                        </span>
                        <span className="ml-auto text-[10px] text-[#2a2a2a] tracking-[0.08em] uppercase group-hover:text-[#444] transition-colors">
                          JPG · PNG · WEBP
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Files */}
              <div className={cardCls}>
                <span className={sectionLabelCls}>Fichiers</span>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={category !== "video"}
                  accept={category === "video" ? "video/mp4,video/webm" : "image/*"}
                  onChange={handleFileChange}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
                  onDrop={handleDrop}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
                  aria-label="Zone de dépôt de fichiers"
                  className={`rounded-lg py-10 sm:py-12 px-5 text-center cursor-pointer transition-colors outline-none select-none border ${
                    dragOver
                      ? "border-[#555] bg-[#141414]"
                      : "border-dashed border-[#252525] bg-[#0d0d0d] hover:border-[#3a3a3a] hover:bg-[#121212]"
                  }`}
                >
                  <svg
                    width="36" height="36"
                    className={`mx-auto mb-3.5 transition-colors ${dragOver ? "stroke-[#555]" : "stroke-[#282828]"}`}
                    fill="none" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className={`text-[13px] mb-1 transition-colors ${dragOver ? "text-[#777]" : "text-[#4a4a4a]"}`}>
                    Glissez vos fichiers ici ou cliquez pour parcourir
                  </p>
                  <p className={`text-[10px] tracking-[0.1em] uppercase transition-colors ${dragOver ? "text-[#444]" : "text-[#2e2e2e]"}`}>
                    JPG · PNG · WEBP · Compression automatique
                  </p>
                </div>

                {files.length > 0 && (
                  <>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-4">
                      {files.map((f, i) => (
                        <div
                          key={i}
                          className="relative aspect-square rounded-md overflow-hidden cursor-pointer border border-[#1e1e1e] bg-[#0d0d0d] group"
                          onClick={() => setPreviewModal({ src: f.preview, index: i })}
                        >
                          <Image src={f.preview} alt="" fill sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 160px" style={{ objectFit: "cover" }} className="group-hover:opacity-60 transition-opacity duration-150" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                            aria-label="Supprimer"
                            className="absolute top-1 right-1 w-5 h-5 bg-black/80 border border-[#3a3a3a] rounded-full text-[#bbb] text-[14px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity leading-none cursor-pointer font-sans p-0"
                          >×</button>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#444] mt-3 tracking-[0.06em]">
                      {files.length} image{files.length > 1 ? "s" : ""} prête{files.length > 1 ? "s" : ""} à uploader
                    </p>
                  </>
                )}
              </div>

              {/* Meta */}
              <div className={cardCls}>
                <span className={sectionLabelCls}>Métadonnées</span>
                <div className="mb-4">
                  <span className="text-[10px] text-[#444] tracking-[0.15em] uppercase mb-2 block">Description</span>
                  <input type="text" placeholder="Décrivez ce contenu..." value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <span className="text-[10px] text-[#444] tracking-[0.15em] uppercase mb-2 block">
                    Tags <span className="text-[#2e2e2e]">· séparés par des virgules</span>
                  </span>
                  <input
                    type="text"
                    placeholder="portrait, fashion, editorial..."
                    value={tags.replaceAll(" ", "-")}
                    onChange={(e) => setTags(e.target.value)}
                    className={inputCls}
                    required
                  />
                  {tags && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {tags.split(",").map((t, i) =>
                        t.trim() ? (
                          <span key={i} className="text-[10px] tracking-[0.08em] text-[#555] bg-[#141414] border border-[#222] rounded px-2 py-0.5">
                            #{t.trim().replaceAll(" ", "-")}
                          </span>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress */}
              {uploading && (
                <div className="mb-4">
                  <div className="bg-[#1a1a1a] rounded h-0.5 overflow-hidden mb-1.5">
                    <div className="h-full bg-[#e8e4dc] rounded transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-[11px] text-[#444] tracking-[0.1em] text-right">{uploadProgress}%</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-[#e8e4dc] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-[#0a0a0a] rounded-md py-[14px] px-6 text-[12px] font-medium tracking-[0.1em] uppercase flex items-center justify-center gap-2.5 transition-colors cursor-pointer font-dm"
              >
                {uploading ? (
                  <>
                    <svg className="spin-admin" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Uploader le contenu
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Preview Modal ── */}
      {previewModal && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6 backdrop-blur-md"
          onClick={() => setPreviewModal(null)}
        >
          <div
            className="bg-[#111] border border-[#252525] rounded-lg w-full max-w-4xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0a0a0a] max-h-[65vh] sm:max-h-[72vh] overflow-hidden flex items-center justify-center">
              <Image
                src={previewModal.src}
                alt="Prévisualisation"
                width={1600}
                height={900}
                style={{ width: "100%", height: "auto", display: "block", objectFit: "contain", maxHeight: "72vh" }}
              />
            </div>
            <div className="p-3.5 flex flex-col sm:flex-row gap-2.5 border-t border-[#1e1e1e]">
              <button
                type="button"
                onClick={() => setAsMainImage(files[previewModal.index]?.uploadedUrl || "")}
                className="flex-1 bg-[#e8e4dc] hover:bg-white text-[#0a0a0a] border-none rounded px-4 py-2.5 text-[11px] font-medium tracking-[0.08em] uppercase cursor-pointer transition-colors font-dm"
              >
                Définir comme image principale
              </button>
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="sm:flex-none bg-transparent text-[#555] hover:text-[#999] border border-[#222] hover:border-[#444] rounded px-4 py-2.5 text-[11px] tracking-[0.08em] uppercase cursor-pointer transition-colors font-dm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}