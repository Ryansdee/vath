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
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Geist:wght@300;400;500&display=swap');

  .upload-root * { box-sizing: border-box; }
  .upload-root h1, .upload-root h2, .upload-root h3,
  .upload-root p { margin: 0; padding: 0; }

  .font-serif  { font-family: 'Cormorant Garamond', serif; }
  .font-geist  { font-family: 'Geist', sans-serif; }

  @keyframes spin-u { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spin-u { animation: spin-u 0.85s linear infinite; }

  /* Sidebar */
  .u-sidebar {
    position: fixed; top: 0; left: 0; height: 100%;
    width: 220px;
    background: #fff;
    border-right: 1px solid #EAE6E1;
    display: flex; flex-direction: column;
    z-index: 50;
    transition: transform 0.2s ease;
  }
  .u-sidebar.closed { transform: translateX(-100%); }
  @media (min-width: 1024px) { .u-sidebar { transform: translateX(0) !important; } }

  .u-sidebar-header {
    padding: 28px 22px 20px;
    border-bottom: 1px solid #EAE6E1;
    flex-shrink: 0;
  }

  .u-sidebar-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px;
    font-weight: 300;
    color: #1A1816;
    letter-spacing: 0.04em;
    line-height: 1.2;
  }
  .u-sidebar-logo em { font-style: italic; color: #8A7D6E; }

  .u-sidebar-sub {
    font-family: 'Geist', sans-serif;
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #C8BFB5;
    margin-top: 4px;
    display: block;
  }

  .u-nav {
    flex: 1;
    padding: 16px 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
  }

  .u-nav-label {
    font-family: 'Geist', sans-serif;
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #D4CFC9;
    padding: 8px 12px 6px;
    display: block;
  }

  .u-nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 7px;
    font-family: 'Geist', sans-serif;
    font-size: 13px;
    color: #9E9890;
    text-decoration: none;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .u-nav-link:hover { background: #F4F1ED; color: #3D3830; }
  .u-nav-link.active {
    background: #1A1816;
    color: #F9F7F4;
  }
  .u-nav-link.active svg { stroke: #F9F7F4; }

  .u-sidebar-footer {
    padding: 16px 22px;
    border-top: 1px solid #EAE6E1;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .u-status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #5DBF8A;
    flex-shrink: 0;
  }

  .u-status-text {
    font-family: 'Geist', sans-serif;
    font-size: 11px;
    color: #C8BFB5;
    letter-spacing: 0.04em;
  }

  /* Overlay mobile */
  .u-overlay {
    position: fixed; inset: 0;
    background: rgba(26,24,22,0.25);
    z-index: 40;
    backdrop-filter: blur(2px);
  }

  /* Top bar */
  .u-topbar {
    position: sticky; top: 0; z-index: 30;
    height: 60px;
    background: #fff;
    border-bottom: 1px solid #EAE6E1;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .u-breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Geist', sans-serif;
    font-size: 12px;
    color: #C8BFB5;
    letter-spacing: 0.04em;
  }
  .u-breadcrumb-sep { color: #E2DDD8; }
  .u-breadcrumb-current { color: #3D3830; font-weight: 500; }

  .u-file-badge {
    font-family: 'Geist', sans-serif;
    font-size: 11px;
    color: #9E9890;
    letter-spacing: 0.05em;
    padding: 4px 12px;
    border: 1px solid #EAE6E1;
    border-radius: 100px;
    background: #F9F7F4;
  }

  .u-hamburger {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    padding: 4px;
    cursor: pointer;
    background: none;
    border: none;
  }
  .u-hamburger span {
    width: 18px; height: 1px;
    background: #9E9890;
    display: block;
  }
  @media (min-width: 1024px) { .u-hamburger { display: none; } }

  /* Content area */
  .u-content {
    padding: 36px 24px 80px;
    width: 100%;
    max-width: 860px;
    margin: 0 auto;
  }
  @media (min-width: 640px) { .u-content { padding: 40px 32px 80px; } }
  @media (min-width: 1024px) { .u-content { padding: 48px 40px 80px; } }

  .u-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 34px;
    font-weight: 300;
    color: #1A1816;
    letter-spacing: -0.01em;
    line-height: 1.1;
    margin-bottom: 6px;
  }
  .u-page-title em { font-style: italic; color: #8A7D6E; }

  .u-page-sub {
    font-family: 'Geist', sans-serif;
    font-size: 11px;
    color: #C8BFB5;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 36px;
  }

  /* Cards */
  .u-card {
    background: #fff;
    border: 1px solid #EAE6E1;
    border-radius: 10px;
    padding: 22px;
    margin-bottom: 16px;
  }

  .u-section-label {
    font-family: 'Geist', sans-serif;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #C8BFB5;
    margin-bottom: 14px;
    display: block;
  }

  /* Category buttons */
  .u-cat-btn {
    border-radius: 8px;
    padding: 14px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-family: 'Geist', sans-serif;
    font-size: 12px;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition: all 0.15s;
    line-height: 1;
    background: none;
  }
  .u-cat-btn.inactive {
    border: 1.5px solid #EAE6E1;
    color: #C8BFB5;
  }
  .u-cat-btn.inactive svg { stroke: #D4CFC9; }
  .u-cat-btn.inactive:hover {
    border-color: #C8BFB5;
    color: #8A7D6E;
    background: #F9F7F4;
  }
  .u-cat-btn.inactive:hover svg { stroke: #8A7D6E; }
  .u-cat-btn.active {
    border: 1.5px solid #1A1816;
    color: #1A1816;
    background: #F4F1ED;
  }
  .u-cat-btn.active svg { stroke: #1A1816; }

  /* Inputs */
  .u-input {
    width: 100%;
    background: #F9F7F4;
    border: 1.5px solid #EAE6E1;
    border-radius: 8px;
    padding: 12px 16px;
    color: #1A1816;
    font-size: 13px;
    font-family: 'Geist', sans-serif;
    font-weight: 300;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .u-input::placeholder { color: #D4CFC9; }
  .u-input:focus {
    border-color: #9E9890;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(158,152,144,0.08);
  }

  /* Drop zone */
  .u-dropzone {
    border-radius: 8px;
    padding: 44px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.15s;
    outline: none;
    user-select: none;
    border: 1.5px dashed #DDD9D3;
    background: #FAFAF8;
  }
  .u-dropzone:hover, .u-dropzone.drag { border-color: #9E9890; background: #F4F1ED; }

  .u-dropzone-title {
    font-family: 'Geist', sans-serif;
    font-size: 13px;
    color: #9E9890;
    margin-bottom: 4px;
  }
  .u-dropzone-hint {
    font-family: 'Geist', sans-serif;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #C8BFB5;
  }

  /* Tag pills */
  .u-tag {
    font-family: 'Geist', sans-serif;
    font-size: 10px;
    letter-spacing: 0.08em;
    color: #8A7D6E;
    background: #F4F1ED;
    border: 1px solid #EAE6E1;
    border-radius: 4px;
    padding: 3px 8px;
  }

  /* Sub-label inside cards */
  .u-sub-label {
    font-family: 'Geist', sans-serif;
    font-size: 10px;
    color: #C8BFB5;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 8px;
    display: block;
  }
  .u-sub-label em { font-style: normal; color: #DDD9D3; }

  /* Divider */
  .u-divider {
    height: 1px;
    background: #EAE6E1;
    margin: 18px 0;
  }

  /* Progress bar */
  .u-progress-track {
    background: #EAE6E1;
    border-radius: 2px;
    height: 2px;
    overflow: hidden;
    margin-bottom: 6px;
  }
  .u-progress-fill {
    height: 100%;
    background: #1A1816;
    border-radius: 2px;
    transition: width 0.3s;
  }
  .u-progress-pct {
    font-family: 'Geist', sans-serif;
    font-size: 11px;
    color: #C8BFB5;
    letter-spacing: 0.1em;
    text-align: right;
  }

  /* Submit btn */
  .u-submit {
    width: 100%;
    background: #1A1816;
    color: #F9F7F4;
    border: none;
    border-radius: 8px;
    padding: 15px 24px;
    font-family: 'Geist', sans-serif;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: background 0.15s;
  }
  .u-submit:hover { background: #2D2A26; }
  .u-submit:disabled { opacity: 0.35; cursor: not-allowed; }

  /* Modal */
  .u-modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(26,24,22,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 20px;
    backdrop-filter: blur(6px);
  }
  .u-modal {
    background: #fff;
    border: 1px solid #EAE6E1;
    border-radius: 12px;
    width: 100%;
    max-width: 820px;
    overflow: hidden;
  }
  .u-modal-footer {
    padding: 14px 18px;
    border-top: 1px solid #EAE6E1;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .u-modal-btn-primary {
    flex: 1;
    background: #1A1816;
    color: #F9F7F4;
    border: none;
    border-radius: 7px;
    padding: 11px 16px;
    font-family: 'Geist', sans-serif;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.15s;
  }
  .u-modal-btn-primary:hover { background: #2D2A26; }
  .u-modal-btn-ghost {
    background: transparent;
    color: #9E9890;
    border: 1.5px solid #EAE6E1;
    border-radius: 7px;
    padding: 11px 16px;
    font-family: 'Geist', sans-serif;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.15s;
  }
  .u-modal-btn-ghost:hover { border-color: #C8BFB5; color: #5C5752; }
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
    {
      value: "photo", label: "Photo",
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      value: "video", label: "Vidéo",
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    },
    {
      value: "diary", label: "Diary",
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    },
    {
      value: "blog", label: "Blog",
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    },
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

  return (
    <>
      <style>{globalStyles}</style>

      <div className="upload-root font-geist" style={{ background: "#F9F7F4", minHeight: "100vh", color: "#1A1816" }}>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="u-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Sidebar ── */}
        <aside className={`u-sidebar${sidebarOpen ? "" : " closed"}`}>
          <div className="u-sidebar-header">
            <div className="u-sidebar-logo">
              Vadim <em>Thevelin</em>
            </div>
            <span className="u-sidebar-sub">Administration</span>
          </div>

          <nav className="u-nav">
            <span className="u-nav-label">Navigation</span>

            <Link href="/admin" onClick={() => setSidebarOpen(false)} className="u-nav-link active">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload
            </Link>

            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setSidebarOpen(false)} className="u-nav-link">
                {l.icon}{l.label}
              </Link>
            ))}
          </nav>

          <div className="u-sidebar-footer">
            <span className="u-status-dot" />
            <span className="u-status-text">Système opérationnel</span>
          </div>
        </aside>

        {/* ── Main ── */}
        <div style={{ marginLeft: 0 }} className="lg:ml-[220px] min-h-screen flex flex-col">

          {/* Top bar */}
          <div className="u-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="u-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
                <span /><span /><span />
              </button>
              <div className="u-breadcrumb">
                <span>Admin</span>
                <span className="u-breadcrumb-sep">/</span>
                <span className="u-breadcrumb-current">Upload</span>
              </div>
            </div>
            <span className="u-file-badge">
              {files.length} fichier{files.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Content */}
          <div className="u-content">
            <h1 className="u-page-title">
              Nouveau <em>contenu</em>
            </h1>
            <p className="u-page-sub">Upload · Compression auto · Prévisualisation</p>

            <form onSubmit={handleUpload}>

              {/* Type */}
              <div className="u-card">
                <span className="u-section-label" style={{ color: "black" }}>Type de contenu</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {categories.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className={`u-cat-btn ${category === c.value ? "active" : "inactive"}`}
                      style={{color: "black"}}
                    >
                      {c.icon}
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video URL */}
              {category === "video" && (
                <div className="u-card">
                  <span className="u-section-label" style={{ color: "black" }}>Lien vidéo</span>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="u-input"
                     style={{ color: "black" }}
                  />
                  {videoUrl && (
                    <div style={{ marginTop: 14, borderRadius: 8, overflow: "hidden", border: "1px solid #EAE6E1" }}>
                      <iframe style={{ width: "100%", aspectRatio: "16/9", border: "none", display: "block" }} src={normalizeVideoUrl(videoUrl)} allowFullScreen />
                    </div>
                  )}

                  <div className="u-divider" />

                  <span className="u-sub-label" style={{ color: "black" }}>
                    Thumbnail personnalisé <em style={{ color: "gray" }}>· optionnel</em>
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
                    <div
                      style={{ position: "relative", aspectRatio: "16/9", maxWidth: 280, borderRadius: 8, overflow: "hidden", border: "1px solid #EAE6E1", cursor: "pointer" }}
                      className="group"
                      onClick={() => thumbInputRef.current?.click()}
                    >
                      <Image src={videoThumbnail.preview} alt="Thumbnail" fill style={{ objectFit: "cover" }} className="group-hover:opacity-60 transition-opacity" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setVideoThumbnail(null); }}
                        style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "1px solid #EAE6E1", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#5C5752" }}
                      >×</button>
                    </div>
                  ) : (
                    <div
                      onClick={() => thumbInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && thumbInputRef.current?.click()}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: "1.5px dashed #DDD9D3", borderRadius: 8, background: "#FAFAF8", cursor: "pointer", transition: "all 0.15s", outline: "none" }}
                      className="group hover:border-[#9E9890] hover:bg-[#F4F1ED]"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ stroke: "#D4CFC9", flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span style={{ fontSize: 12, color: "#C8BFB5" }}>Ajouter un thumbnail personnalisé</span>
                      <span style={{ marginLeft: "auto", fontSize: 10, color: "#D4CFC9", letterSpacing: "0.08em", textTransform: "uppercase" }}>JPG · PNG</span>
                    </div>
                  )}
                </div>
              )}

              {/* Files */}
              <div className="u-card">
                <span className="u-section-label" style={{ color: "black" }}>Fichiers</span>

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
                  className={`u-dropzone${dragOver ? " drag" : ""}`}
                  style={{ color: "black" }}
                >
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" style={{ margin: "0 auto 12px", display: "block", stroke: dragOver ? "#9E9890" : "#D4CFC9" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="u-dropzone-title">Glissez vos fichiers ici ou cliquez pour parcourir</p>
                  <p className="u-dropzone-hint" style={{ marginTop: 4 }}>JPG · PNG · WEBP · Compression automatique</p>
                </div>

                {files.length > 0 && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: 16, color: "black" }}>
                      {files.map((f, i) => (
                        <div
                          key={i}
                          style={{ position: "relative", aspectRatio: "1", borderRadius: 8, overflow: "hidden", cursor: "pointer", border: "1px solid #EAE6E1", background: "#F4F1ED" }}
                          className="group"
                          onClick={() => setPreviewModal({ src: f.preview, index: i })}
                        >
                          <Image src={f.preview} alt="" fill sizes="160px" style={{ objectFit: "cover" }} className="group-hover:opacity-70 transition-opacity duration-150" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                            aria-label="Supprimer"
                            style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, background: "rgba(255,255,255,0.95)", border: "1px solid #EAE6E1", borderRadius: "50%", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, cursor: "pointer", color: "#5C5752", transition: "opacity 0.15s" }}
                            className="group-hover:opacity-100"
                          >×</button>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: "#C8BFB5", marginTop: 10, letterSpacing: "0.06em" }}>
                      {files.length} image{files.length > 1 ? "s" : ""} prête{files.length > 1 ? "s" : ""} à uploader
                    </p>
                  </>
                )}
              </div>

              {/* Meta */}
              <div className="u-card">
                <span className="u-section-label" style={{ color: "black" }}>Métadonnées</span>

                <div style={{ marginBottom: 16 }}>
                  <span className="u-sub-label" style={{ color: "black" }}>Description</span>
                  <input
                    type="text"
                    placeholder="Décrivez ce contenu..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="u-input" style={{ color: "black" }}
                  />
                </div>

                <div>
                  <span className="u-sub-label" style={{ color: "black" }}>
                    Tags <em style={{ color: "black" }}>· séparés par des virgules</em>
                  </span>
                  <input
                    type="text"
                    placeholder="portrait, fashion, editorial..."
                    value={tags.replaceAll(" ", "-")}
                    onChange={(e) => setTags(e.target.value)}
                    className="u-input"
                    required
                  />
                  {tags && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                      {tags.split(",").map((t, i) =>
                        t.trim() ? (
                          <span key={i} className="u-tag">#{t.trim().replaceAll(" ", "-")}</span>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress */}
              {uploading && (
                <div style={{ marginBottom: 16 }}>
                  <div className="u-progress-track">
                    <div className="u-progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="u-progress-pct">{uploadProgress}%</p>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={uploading} className="u-submit">
                {uploading ? (
                  <>
                    <svg className="spin-u" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="u-modal-backdrop" onClick={() => setPreviewModal(null)}>
          <div className="u-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ background: "#F4F1ED", maxHeight: "68vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Image
                src={previewModal.src}
                alt="Prévisualisation"
                width={1600}
                height={900}
                style={{ width: "100%", height: "auto", display: "block", objectFit: "contain", maxHeight: "68vh" }}
              />
            </div>
            <div className="u-modal-footer">
              <button
                type="button"
                onClick={() => setAsMainImage(files[previewModal.index]?.uploadedUrl || "")}
                className="u-modal-btn-primary"
              >
                Définir comme image principale
              </button>
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="u-modal-btn-ghost"
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