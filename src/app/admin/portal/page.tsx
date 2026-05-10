// app/admin/portal/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { db, storage } from "../../../../lib/firebase";
import {
  collection, getDocs, doc, updateDoc,
  arrayUnion, arrayRemove, deleteDoc, Timestamp,
} from "firebase/firestore";
import {
  ref, uploadBytes, getDownloadURL,
  deleteObject, listAll,
} from "firebase/storage";
import Image from "next/image";
import Link from "next/link";

interface PortalFile {
  id: string; url: string; name: string;
  type: "image" | "video" | "file"; size: number;
}

interface Portal {
  id: string; clientName: string; clientEmail: string;
  projectName: string; files: PortalFile[];
  createdAt: Timestamp; expiresAt?: Timestamp;
  portalCode: string; price?: number;
  paymentRequired?: boolean; paid?: boolean; paidAt?: Timestamp | null;
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Geist:wght@300;400;500&display=swap');

  .p-root * { box-sizing: border-box; }
  .p-root h1,.p-root h2,.p-root h3,.p-root p { margin:0; padding:0; }
  .font-serif { font-family: 'Cormorant Garamond', serif; }
  .font-geist { font-family: 'Geist', sans-serif; }

  @keyframes spin-p { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .spin-p { animation: spin-p 0.8s linear infinite; }

  /* ── Sidebar ── */
  .p-sidebar {
    position:fixed; top:0; left:0; height:100%; width:220px;
    background:#fff; border-right:1px solid #EAE6E1;
    display:flex; flex-direction:column; z-index:50;
    transition:transform 0.2s ease;
  }
  .p-sidebar.closed { transform:translateX(-100%); }
  @media(min-width:1024px){ .p-sidebar{ transform:translateX(0)!important; } }

  .p-sidebar-header { padding:28px 22px 20px; border-bottom:1px solid #EAE6E1; flex-shrink:0; }
  .p-sidebar-logo { font-family:'Cormorant Garamond',serif; font-size:17px; font-weight:300; color:#1A1816; letter-spacing:0.04em; line-height:1.2; }
  .p-sidebar-logo em { font-style:italic; color:#8A7D6E; }
  .p-sidebar-sub { font-family:'Geist',sans-serif; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:#C8BFB5; margin-top:4px; display:block; }

  .p-nav { flex:1; padding:16px 10px; display:flex; flex-direction:column; gap:2px; overflow-y:auto; }
  .p-nav-label { font-family:'Geist',sans-serif; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:#D4CFC9; padding:8px 12px 6px; display:block; }
  .p-nav-link { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:7px; font-family:'Geist',sans-serif; font-size:13px; color:#9E9890; text-decoration:none; transition:all 0.15s; white-space:nowrap; }
  .p-nav-link:hover { background:#F4F1ED; color:#3D3830; }
  .p-nav-link.active { background:#1A1816; color:#F9F7F4; }
  .p-nav-link.active svg { stroke:#F9F7F4; }

  .p-sidebar-footer { padding:16px 22px; border-top:1px solid #EAE6E1; flex-shrink:0; display:flex; align-items:center; gap:8px; }
  .p-status-dot { width:6px; height:6px; border-radius:50%; background:#5DBF8A; flex-shrink:0; }
  .p-status-text { font-family:'Geist',sans-serif; font-size:11px; color:#C8BFB5; letter-spacing:0.04em; }

  .p-overlay { position:fixed; inset:0; background:rgba(26,24,22,0.25); z-index:40; backdrop-filter:blur(2px); }

  /* ── Topbar ── */
  .p-topbar { position:sticky; top:0; z-index:30; height:60px; background:#fff; border-bottom:1px solid #EAE6E1; padding:0 24px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
  .p-breadcrumb { display:flex; align-items:center; gap:8px; font-family:'Geist',sans-serif; font-size:12px; color:#C8BFB5; letter-spacing:0.04em; }
  .p-breadcrumb-sep { color:#E2DDD8; }
  .p-breadcrumb-current { color:#3D3830; font-weight:500; }
  .p-badge-count { font-family:'Geist',sans-serif; font-size:11px; color:#9E9890; letter-spacing:0.05em; padding:4px 12px; border:1px solid #EAE6E1; border-radius:100px; background:#F9F7F4; }
  .p-hamburger { display:flex; flex-direction:column; justify-content:center; gap:5px; padding:4px; cursor:pointer; background:none; border:none; }
  .p-hamburger span { width:18px; height:1px; background:#9E9890; display:block; }
  @media(min-width:1024px){ .p-hamburger{ display:none; } }

  /* ── Content ── */
  .p-content { padding:36px 24px 80px; width:100%; }
  @media(min-width:640px){ .p-content{ padding:40px 32px 80px; } }
  @media(min-width:1024px){ .p-content{ padding:48px 40px 80px; } }

  .p-page-title { font-family:'Cormorant Garamond',serif; font-size:34px; font-weight:300; color:#1A1816; letter-spacing:-0.01em; line-height:1.1; margin-bottom:6px; }
  .p-page-title em { font-style:italic; color:#8A7D6E; }
  .p-page-sub { font-family:'Geist',sans-serif; font-size:11px; color:#C8BFB5; letter-spacing:0.14em; text-transform:uppercase; margin-bottom:36px; }

  /* ── Portal list ── */
  .p-list-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
  .p-list-count { font-family:'Geist',sans-serif; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:#C8BFB5; }

  .p-btn-new { display:flex; align-items:center; gap:6px; background:#1A1816; color:#F9F7F4; border:none; border-radius:8px; padding:9px 14px; font-family:'Geist',sans-serif; font-size:11px; font-weight:400; letter-spacing:0.08em; text-transform:uppercase; cursor:pointer; transition:background 0.15s; }
  .p-btn-new:hover { background:#2D2A26; }

  .p-portal-card { background:#fff; border:1.5px solid #EAE6E1; border-radius:10px; overflow:hidden; cursor:pointer; transition:all 0.15s; }
  .p-portal-card:hover { border-color:#C8BFB5; }
  .p-portal-card.selected { border-color:#1A1816; }

  .p-portal-card-body { padding:16px 18px; }
  .p-portal-name { font-family:'Geist',sans-serif; font-size:13px; font-weight:500; color:#1A1816; margin-bottom:2px; }
  .p-portal-project { font-family:'Geist',sans-serif; font-size:11px; color:#8A7D6E; letter-spacing:0.03em; margin-bottom:2px; }
  .p-portal-email { font-family:'Geist',sans-serif; font-size:11px; color:#C8BFB5; }
  .p-portal-badges { display:flex; align-items:center; flex-wrap:wrap; gap:6px; margin-top:10px; }

  .p-portal-card-footer { display:flex; border-top:1px solid #EAE6E1; }
  .p-portal-action { flex:1; padding:10px; font-family:'Geist',sans-serif; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#9E9890; background:transparent; border:none; cursor:pointer; transition:all 0.15s; }
  .p-portal-action:hover { background:#F9F7F4; color:#3D3830; }
  .p-portal-action.danger:hover { background:#FDF5F5; color:#B85050; }
  .p-portal-action + .p-portal-action { border-left:1px solid #EAE6E1; }

  /* ── Badges ── */
  .badge { font-family:'Geist',sans-serif; font-size:10px; letter-spacing:0.06em; padding:3px 8px; border-radius:4px; border:1px solid; }
  .badge-files { background:#F9F7F4; color:#9E9890; border-color:#EAE6E1; }
  .badge-price { background:#F4F1ED; color:#8A7D6E; border-color:#E2DDD8; }
  .badge-paid { background:rgba(93,191,138,0.1); color:#3D9E6E; border-color:rgba(93,191,138,0.25); }
  .badge-pending { background:rgba(200,184,154,0.15); color:#8A7D6E; border-color:rgba(200,184,154,0.3); }

  /* ── Empty state ── */
  .p-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; height:320px; background:#fff; border:1.5px dashed #EAE6E1; border-radius:12px; color:#C8BFB5; }
  .p-empty-text { font-family:'Geist',sans-serif; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#D4CFC9; }

  /* ── Detail panel ── */
  .p-detail-title { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:300; color:#1A1816; margin-bottom:4px; }
  .p-detail-meta { font-family:'Geist',sans-serif; font-size:12px; color:#9E9890; letter-spacing:0.03em; }
  .p-detail-sep { color:#D4CFC9; margin:0 8px; }

  /* ── Dropzone ── */
  .p-dropzone { border:1.5px dashed #DDD9D3; border-radius:8px; padding:36px 20px; text-align:center; cursor:pointer; transition:all 0.15s; outline:none; user-select:none; background:#FAFAF8; margin-bottom:20px; }
  .p-dropzone:hover, .p-dropzone.uploading-active { border-color:#9E9890; background:#F4F1ED; }
  .p-dropzone-title { font-family:'Geist',sans-serif; font-size:13px; color:#9E9890; margin-bottom:4px; }
  .p-dropzone-hint { font-family:'Geist',sans-serif; font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:#C8BFB5; }

  /* ── Progress log ── */
  .p-progress-log { background:#fff; border:1px solid #EAE6E1; border-radius:8px; padding:14px 18px; margin-bottom:20px; }
  .p-progress-msg { font-family:'Geist',sans-serif; font-size:11px; letter-spacing:0.04em; padding:2px 0; color:#C8BFB5; }
  .p-progress-msg.done { color:#5DBF8A; }

  /* ── File grid ── */
  .p-section-label { font-family:'Geist',sans-serif; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:#C8BFB5; margin-bottom:14px; display:block; }
  .p-file-card { border:1.5px solid #EAE6E1; border-radius:8px; overflow:hidden; cursor:pointer; background:#F9F7F4; transition:border-color 0.15s; }
  .p-file-card:hover { border-color:#C8BFB5; }
  .p-file-name { padding:8px 10px; font-family:'Geist',sans-serif; font-size:10px; color:#9E9890; letter-spacing:0.03em; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; border-top:1px solid #EAE6E1; background:#fff; }

  /* ── Mark paid btn ── */
  .p-mark-paid { padding:5px 12px; font-family:'Geist',sans-serif; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; background:transparent; border:1px solid #EAE6E1; border-radius:6px; color:#9E9890; cursor:pointer; transition:all 0.15s; }
  .p-mark-paid:hover { border-color:#5DBF8A; color:#3D9E6E; }

  /* ── Back button ── */
  .p-back { display:flex; align-items:center; gap:8px; font-family:'Geist',sans-serif; font-size:11px; color:#9E9890; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:24px; cursor:pointer; background:transparent; border:none; transition:color 0.15s; }
  .p-back:hover { color:#3D3830; }

  /* ── Modals ── */
  .p-modal-backdrop { position:fixed; inset:0; background:rgba(26,24,22,0.5); display:flex; align-items:center; justify-content:center; z-index:50; padding:20px; backdrop-filter:blur(6px); }
  .p-modal { background:#fff; border:1px solid #EAE6E1; border-radius:12px; width:100%; max-width:480px; overflow:hidden; }
  .p-modal-header { padding:28px 28px 0; }
  .p-modal-title { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:300; color:#1A1816; margin-bottom:6px; }
  .p-modal-sub { font-family:'Geist',sans-serif; font-size:12px; color:#C8BFB5; letter-spacing:0.04em; margin-bottom:24px; }
  .p-modal-body { padding:0 28px 28px; }
  .p-modal-body-inner { padding:28px; }

  /* ── Form elements in modal ── */
  .p-label { font-family:'Geist',sans-serif; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:#C8BFB5; margin-bottom:8px; display:block; }
  .p-label em { font-style:normal; color:#E2DDD8; }
  .p-input { width:100%; background:#F9F7F4; border:1.5px solid #EAE6E1; border-radius:8px; padding:12px 16px; color:#1A1816; font-size:13px; font-family:'Geist',sans-serif; font-weight:300; outline:none; transition:border-color 0.15s, box-shadow 0.15s; }
  .p-input::placeholder { color:#D4CFC9; }
  .p-input:focus { border-color:#9E9890; background:#fff; box-shadow:0 0 0 3px rgba(158,152,144,0.08); }
  .p-field { margin-bottom:16px; }

  /* ── Checkbox toggle ── */
  .p-toggle { display:flex; align-items:center; gap:10px; cursor:pointer; padding:14px 0; border-top:1px solid #EAE6E1; margin-top:4px; }
  .p-checkbox { width:16px; height:16px; border-radius:4px; border:1.5px solid; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.15s; }
  .p-checkbox.on { background:#1A1816; border-color:#1A1816; }
  .p-checkbox.off { background:#F9F7F4; border-color:#DDD9D3; }
  .p-toggle-label { font-family:'Geist',sans-serif; font-size:13px; color:#8A7D6E; }

  /* ── Modal buttons ── */
  .p-modal-actions { display:flex; gap:10px; margin-top:24px; }
  .p-btn-primary { flex:1; background:#1A1816; color:#F9F7F4; border:none; border-radius:8px; padding:13px 16px; font-family:'Geist',sans-serif; font-size:11px; font-weight:400; letter-spacing:0.08em; text-transform:uppercase; cursor:pointer; transition:background 0.15s; }
  .p-btn-primary:hover { background:#2D2A26; }
  .p-btn-primary:disabled { opacity:0.35; cursor:not-allowed; }
  .p-btn-ghost { flex:1; background:transparent; color:#9E9890; border:1.5px solid #EAE6E1; border-radius:8px; padding:13px 16px; font-family:'Geist',sans-serif; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; cursor:pointer; transition:all 0.15s; }
  .p-btn-ghost:hover { border-color:#C8BFB5; color:#5C5752; }
  .p-btn-ghost:disabled { opacity:0.35; cursor:not-allowed; }
  .p-btn-danger { flex:1; background:transparent; color:#B85050; border:1.5px solid rgba(184,80,80,0.3); border-radius:8px; padding:13px 16px; font-family:'Geist',sans-serif; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; cursor:pointer; transition:all 0.15s; }
  .p-btn-danger:hover { background:#FDF5F5; border-color:#B85050; }
  .p-btn-danger:disabled { opacity:0.35; cursor:not-allowed; }

  /* ── File preview modal ── */
  .p-preview-backdrop { position:fixed; inset:0; background:rgba(26,24,22,0.75); display:flex; align-items:center; justify-content:center; z-index:60; padding:20px; backdrop-filter:blur(8px); }
  .p-preview-close { position:absolute; top:24px; right:28px; background:none; border:none; color:#9E9890; font-size:28px; cursor:pointer; line-height:1; transition:color 0.15s; }
  .p-preview-close:hover { color:#1A1816; }
  .p-preview-meta { font-family:'Geist',sans-serif; font-size:11px; color:#9E9890; letter-spacing:0.08em; text-transform:uppercase; }
  .p-preview-actions { display:flex; gap:8px; }
  .p-preview-btn { padding:9px 16px; font-family:'Geist',sans-serif; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; border-radius:7px; cursor:pointer; transition:all 0.15s; }
  .p-preview-btn-ghost { background:transparent; color:#9E9890; border:1.5px solid #EAE6E1; }
  .p-preview-btn-ghost:hover { border-color:#C8BFB5; color:#5C5752; }
  .p-preview-btn-danger { background:transparent; color:#B85050; border:1.5px solid rgba(184,80,80,0.3); }
  .p-preview-btn-danger:hover { background:#FDF5F5; border-color:#B85050; }

  /* ── Delete warning ── */
  .p-delete-warn { font-family:'Geist',sans-serif; font-size:12px; color:#B85050; margin-top:8px; }
  .p-delete-body { font-family:'Geist',sans-serif; font-size:13px; color:#8A7D6E; line-height:1.6; }
  .p-delete-name { color:#1A1816; font-weight:500; }

  /* ── Loading spinner ── */
  .p-spinner { width:28px; height:28px; border:1.5px solid #EAE6E1; border-top-color:#1A1816; border-radius:50%; }
`;

export default function AdminPortalPage() {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [selectedPortal, setSelectedPortal] = useState<Portal | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<PortalFile | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<PortalFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showCreatePortal, setShowCreatePortal] = useState(false);
  const [newPortalName, setNewPortalName] = useState("");
  const [newPortalEmail, setNewPortalEmail] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [enablePrice, setEnablePrice] = useState(false);
  const [newPortalPrice, setNewPortalPrice] = useState<number | undefined>(undefined);
  const [showDeletePortalConfirm, setShowDeletePortalConfirm] = useState(false);
  const [portalToDelete, setPortalToDelete] = useState<Portal | null>(null);
  const [deletingPortal, setDeletingPortal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchPortals(); }, []);

  const fetchPortals = async () => {
    try {
      const snapshot = await getDocs(collection(db, "portals"));
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Portal[];
      setPortals(data.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const refreshPortalData = async () => {
    if (!selectedPortal) return;
    try {
      const snapshot = await getDocs(collection(db, "portals"));
      const portal = snapshot.docs.find((d) => d.id === selectedPortal.id)?.data() as Portal | undefined;
      if (portal) setSelectedPortal({ ...portal, id: selectedPortal.id });
      await fetchPortals();
    } catch (e) { console.error(e); }
  };

  const handleCreatePortal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortalName || !newPortalEmail || !newProjectName) { alert("Veuillez remplir tous les champs requis"); return; }
    setCreating(true);
    try {
      const bodyData: { clientName: string; clientEmail: string; projectName: string; expiresInDays: number; delayEmailMs: number; price?: number } = {
        clientName: newPortalName, clientEmail: newPortalEmail,
        projectName: newProjectName, expiresInDays: 30, delayEmailMs: 300000,
      };
      if (enablePrice && newPortalPrice !== undefined && newPortalPrice > 0) bodyData.price = newPortalPrice;
      const response = await fetch("/api/portal/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bodyData) });
      const data = await response.json();
      if (data.success) {
        alert(`Portal créé !\nCode : ${data.portalCode}\nEmail envoyé dans 5 min.\nURL : ${data.portalUrl}`);
        setNewPortalName(""); setNewPortalEmail(""); setNewProjectName("");
        setEnablePrice(false); setNewPortalPrice(undefined);
        setShowCreatePortal(false); await fetchPortals();
      } else { alert(`Erreur : ${data.error || "Impossible de créer le portal"}`); }
    } catch (e) { console.error(e); alert("Erreur lors de la création."); }
    finally { setCreating(false); }
  };

  const handleDeletePortal = async (portal: Portal) => {
    setDeletingPortal(true);
    try {
      if (portal.files?.length > 0) {
        for (const file of portal.files) {
          try { const url = new URL(file.url); const encodedPath = url.pathname.split("/o/")[1]; await deleteObject(ref(storage, decodeURIComponent(encodedPath))); }
          catch (err) { console.warn(err); }
        }
      }
      const folderRef = ref(storage, `portals/${portal.id}`);
      const fileList = await listAll(folderRef);
      await Promise.all(fileList.items.map((item) => deleteObject(item)));
      await deleteDoc(doc(db, "portals", portal.id));
      if (selectedPortal?.id === portal.id) { setSelectedPortal(null); setShowDetail(false); }
      await fetchPortals();
    } catch (e) { console.error(e); alert("Erreur lors de la suppression."); }
    finally { setDeletingPortal(false); setShowDeletePortalConfirm(false); setPortalToDelete(null); }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !selectedPortal) return;
    const files = Array.from(event.target.files);
    setUploading(true); setUploadProgress([]);
    try {
      for (const file of files) {
        const fileName = `${selectedPortal.id}/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, `portals/${fileName}`);
        setUploadProgress((prev) => [...prev, `Upload de ${file.name}...`]);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        const fileType: "image" | "video" | "file" = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file";
        await updateDoc(doc(db, "portals", selectedPortal.id), { files: arrayUnion({ id: Date.now().toString(), url: downloadURL, name: file.name, type: fileType, size: file.size }) });
        setUploadProgress((prev) => [...prev, `✓ ${file.name}`]);
      }
      await refreshPortalData();
    } catch (e) { console.error(e); alert("Erreur lors de l'upload."); }
    finally { setUploading(false); setUploadProgress([]); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const handleDeleteFile = async (file: PortalFile) => {
    if (!selectedPortal) return;
    setDeleting(true);
    try {
      const url = new URL(file.url); const encodedPath = url.pathname.split("/o/")[1];
      await deleteObject(ref(storage, decodeURIComponent(encodedPath)));
      await updateDoc(doc(db, "portals", selectedPortal.id), { files: arrayRemove(file) });
      await refreshPortalData();
    } catch (e) { console.error(e); alert("Erreur lors de la suppression."); }
    finally { setDeleting(false); setShowDeleteConfirm(false); setFileToDelete(null); }
  };

  const handleRenameFile = async (file: PortalFile) => {
    if (!selectedPortal) return;
    const newName = prompt("Nouveau nom :", file.name);
    if (!newName || newName === file.name) return;
    try {
      await updateDoc(doc(db, "portals", selectedPortal.id), { files: selectedPortal.files.map((f) => f.id === file.id ? { ...f, name: newName } : f) });
      await refreshPortalData();
    } catch (e) { console.error(e); alert("Erreur lors du renommage."); }
  };

  const navLinks = [
    { href: "/admin", label: "Upload", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> },
    { href: "/admin/texts", label: "Textes", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
    { href: "/admin/tag-cover", label: "Tag Cover", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg> },
    { href: "/admin/home-image", label: "Page d'accueil", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  ];

  const Badge = ({ variant, children }: { variant: "files" | "price" | "paid" | "pending"; children: React.ReactNode }) => (
    <span className={`badge badge-${variant}`}>{children}</span>
  );

  return (
    <>
      <style>{globalStyles}</style>

      <div className="p-root font-geist" style={{ background: "#F9F7F4", minHeight: "100vh", color: "#1A1816" }}>

        {/* Mobile overlay */}
        {sidebarOpen && <div className="p-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* ── Sidebar ── */}
        <aside className={`p-sidebar${sidebarOpen ? "" : " closed"}`}>
          <div className="p-sidebar-header">
            <div className="p-sidebar-logo">Vadim <em>Thevelin</em></div>
            <span className="p-sidebar-sub">Administration</span>
          </div>
          <nav className="p-nav">
            <span className="p-nav-label">Navigation</span>
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setSidebarOpen(false)} className="p-nav-link">
                {l.icon}{l.label}
              </Link>
            ))}
            <Link href="/admin/portal" onClick={() => setSidebarOpen(false)} className="p-nav-link active">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
              Portails
            </Link>
          </nav>
          <div className="p-sidebar-footer">
            <span className="p-status-dot" />
            <span className="p-status-text">Système opérationnel</span>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="lg:ml-[220px] min-h-screen flex flex-col">

          {/* Topbar */}
          <div className="p-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="p-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
                <span /><span /><span />
              </button>
              <div className="p-breadcrumb">
                <span>Admin</span>
                <span className="p-breadcrumb-sep">/</span>
                <span className="p-breadcrumb-current">Portails clients</span>
              </div>
            </div>
            <span className="p-badge-count">{portals.length} portal{portals.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Content */}
          <div className="p-content">
            <h1 className="p-page-title">Portails <em>clients</em></h1>
            <p className="p-page-sub">Créer · Gérer · Supprimer</p>

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
                <div className="p-spinner spin-p" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">

                {/* ── Portal list ── */}
                <div className={showDetail ? "hidden lg:block" : "block"}>
                  <div className="p-list-header">
                    <span className="p-list-count">{portals.length} portal{portals.length !== 1 ? "s" : ""}</span>
                    <button className="p-btn-new" onClick={() => setShowCreatePortal(true)}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Nouveau
                    </button>
                  </div>

                  {portals.length === 0 ? (
                    <p style={{ textAlign: "center", padding: "40px 0", fontFamily: "'Geist',sans-serif", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#D4CFC9" }}>
                      Aucun portal
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {portals.map((portal) => (
                        <div
                          key={portal.id}
                          className={`p-portal-card${selectedPortal?.id === portal.id ? " selected" : ""}`}
                        >
                          <div className="p-portal-card-body" onClick={() => { setSelectedPortal(portal); setShowDetail(true); }}>
                            <p className="p-portal-name">{portal.clientName}</p>
                            <p className="p-portal-project">{portal.projectName}</p>
                            <p className="p-portal-email">{portal.clientEmail}</p>
                            <div className="p-portal-badges">
                              <Badge variant="files">{portal.files?.length || 0} fichier{(portal.files?.length || 0) !== 1 ? "s" : ""}</Badge>
                              {portal.price && (
                                <>
                                  <Badge variant="price">{portal.price.toFixed(2)} €</Badge>
                                  <Badge variant={portal.paid ? "paid" : "pending"}>{portal.paid ? "payé" : "en attente"}</Badge>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="p-portal-card-footer">
                            <button
                              className="p-portal-action"
                              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/portal/${portal.id}`)}
                            >Copier lien</button>
                            <button
                              className="p-portal-action danger"
                              onClick={() => { setPortalToDelete(portal); setShowDeletePortalConfirm(true); }}
                            >Supprimer</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Detail panel ── */}
                <div className={`min-w-0 ${showDetail ? "block" : "hidden lg:block"}`}>

                  {showDetail && selectedPortal && (
                    <button className="p-back lg:hidden" onClick={() => { setShowDetail(false); setSelectedPortal(null); }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      Retour aux portails
                    </button>
                  )}

                  {!selectedPortal ? (
                    <div className="p-empty hidden lg:flex">
                      <svg style={{ width: 36, height: 36, stroke: "#D4CFC9", marginBottom: 12 }} fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <p className="p-empty-text">Sélectionnez un portal</p>
                    </div>
                  ) : (
                    <>
                      {/* Detail header */}
                      <div style={{ marginBottom: 24 }}>
                        <h2 className="p-detail-title">{selectedPortal.projectName}</h2>
                        <p className="p-detail-meta">
                          {selectedPortal.clientName}
                          <span className="p-detail-sep">·</span>
                          {selectedPortal.clientEmail}
                        </p>
                        {selectedPortal.price && (
                          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                            <Badge variant="price">{selectedPortal.price.toFixed(2)} €</Badge>
                            <Badge variant={selectedPortal.paid ? "paid" : "pending"}>{selectedPortal.paid ? "payé" : "en attente"}</Badge>
                            {!selectedPortal.paid && (
                              <button
                                className="p-mark-paid"
                                onClick={async () => {
                                  try {
                                    const res = await fetch("/api/portal/mark-paid", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ portalId: selectedPortal.id }) });
                                    const data = await res.json();
                                    if (!data.success && !data.alreadyPaid) throw new Error(data.error || "Failed");
                                    await refreshPortalData();
                                  } catch (e) { console.error(e); alert("Impossible de marquer payé."); }
                                }}
                              >Marquer payé & envoyer code</button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Upload zone */}
                      <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} disabled={uploading} className="sr-only" tabIndex={-1} aria-hidden="true" />
                      <div
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        role="button" tabIndex={0}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !uploading && fileInputRef.current?.click()}
                        className={`p-dropzone${uploading ? " uploading-active" : ""}`}
                        style={{ cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.65 : 1 }}
                      >
                        {uploading ? (
                          <>
                            <div className="p-spinner spin-p" style={{ margin: "0 auto 12px" }} />
                            <p className="p-dropzone-title">Upload en cours...</p>
                          </>
                        ) : (
                          <>
                            <svg style={{ width: 28, height: 28, stroke: "#D4CFC9", margin: "0 auto 12px", display: "block" }} fill="none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="p-dropzone-title">Cliquez pour uploader des fichiers</p>
                            <p className="p-dropzone-hint" style={{ marginTop: 4 }}>Images · Vidéos · Documents</p>
                          </>
                        )}
                      </div>

                      {/* Progress log */}
                      {uploadProgress.length > 0 && (
                        <div className="p-progress-log">
                          {uploadProgress.map((msg, i) => (
                            <p key={i} className={`p-progress-msg${msg.startsWith("✓") ? " done" : ""}`}>{msg}</p>
                          ))}
                        </div>
                      )}

                      {/* Files grid */}
                      {selectedPortal.files?.length > 0 && (
                        <div>
                          <span className="p-section-label">
                            {selectedPortal.files.length} fichier{selectedPortal.files.length !== 1 ? "s" : ""}
                          </span>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                            {selectedPortal.files.map((file) => (
                              <div key={file.id} className="p-file-card" onClick={() => setSelectedFile(file)}>
                                {file.type === "image" ? (
                                  <div style={{ position: "relative", aspectRatio: "1", background: "#F4F1ED" }}>
                                    <Image src={file.url} alt={file.name} fill sizes="200px" style={{ objectFit: "cover" }} />
                                  </div>
                                ) : (
                                  <div style={{ aspectRatio: "1", background: "#F4F1ED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                                    {file.type === "video" ? "🎥" : "📄"}
                                  </div>
                                )}
                                <p className="p-file-name">{file.name}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Create Portal Modal ── */}
      {showCreatePortal && (
        <div className="p-modal-backdrop" onClick={() => setShowCreatePortal(false)}>
          <div className="p-modal" onClick={(e) => e.stopPropagation()}>
            <div className="p-modal-header">
              <h3 className="p-modal-title">Nouveau <em style={{ fontStyle: "italic", color: "#8A7D6E" }}>portal</em></h3>
              <p className="p-modal-sub">Les informations seront envoyées au client par email.</p>
            </div>
            <div className="p-modal-body">
              <form onSubmit={handleCreatePortal}>
                <div className="p-field">
                  <span className="p-label">Nom du client <em>*</em></span>
                  <input type="text" value={newPortalName} onChange={(e) => setNewPortalName(e.target.value)} className="p-input" placeholder="Jean Dupont" required />
                </div>
                <div className="p-field">
                  <span className="p-label">Email du client <em>*</em></span>
                  <input type="email" value={newPortalEmail} onChange={(e) => setNewPortalEmail(e.target.value)} className="p-input" placeholder="jean@exemple.com" required />
                </div>
                <div className="p-field">
                  <span className="p-label">Nom du projet <em>*</em></span>
                  <input type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="p-input" placeholder="Shooting Mariage 2024" required />
                </div>

                <div
                  className="p-toggle"
                  onClick={() => { setEnablePrice(!enablePrice); if (enablePrice) setNewPortalPrice(undefined); }}
                >
                  <div className={`p-checkbox${enablePrice ? " on" : " off"}`}>
                    {enablePrice && (
                      <svg width="9" height="9" fill="none" stroke="#F9F7F4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    )}
                  </div>
                  <span className="p-toggle-label">Ajouter un prix pour ce portal</span>
                </div>

                {enablePrice && (
                  <div className="p-field" style={{ marginTop: 12 }}>
                    <span className="p-label">Prix (€)</span>
                    <input type="number" min={0} step="0.01" value={newPortalPrice ?? ""} onChange={(e) => setNewPortalPrice(e.target.value ? Number(e.target.value) : undefined)} className="p-input" placeholder="0.00" />
                  </div>
                )}

                <div className="p-modal-actions">
                  <button type="button" disabled={creating} onClick={() => { setShowCreatePortal(false); setNewPortalName(""); setNewPortalEmail(""); setNewProjectName(""); setEnablePrice(false); setNewPortalPrice(undefined); }} className="p-btn-ghost">Annuler</button>
                  <button type="submit" disabled={creating} className="p-btn-primary">{creating ? "Création..." : "Créer le portal"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Portal Modal ── */}
      {showDeletePortalConfirm && portalToDelete && (
        <div className="p-modal-backdrop" onClick={() => { setShowDeletePortalConfirm(false); setPortalToDelete(null); }}>
          <div className="p-modal" onClick={(e) => e.stopPropagation()}>
            <div className="p-modal-body-inner">
              <h3 className="p-modal-title" style={{ marginBottom: 20 }}>Supprimer le portal</h3>
              <p className="p-delete-body">
                Supprimer le portal de <span className="p-delete-name">{portalToDelete.clientName}</span> — <em>{portalToDelete.projectName}</em> ?
              </p>
              <p className="p-delete-warn">
                {portalToDelete.files?.length || 0} fichier{(portalToDelete.files?.length || 0) !== 1 ? "s" : ""} seront définitivement supprimés.
              </p>
              <div className="p-modal-actions">
                <button disabled={deletingPortal} onClick={() => { setShowDeletePortalConfirm(false); setPortalToDelete(null); }} className="p-btn-ghost">Annuler</button>
                <button disabled={deletingPortal} onClick={() => handleDeletePortal(portalToDelete)} className="p-btn-danger">{deletingPortal ? "Suppression..." : "Supprimer"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── File Preview Modal ── */}
      {selectedFile && (
        <div className="p-preview-backdrop" onClick={() => setSelectedFile(null)}>
          <button className="p-preview-close" onClick={() => setSelectedFile(null)}>×</button>
          <div style={{ width: "100%", maxWidth: 1100 }} onClick={(e) => e.stopPropagation()}>
            {selectedFile.type === "image" ? (
              <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
                <Image src={selectedFile.url} alt={selectedFile.name} fill style={{ objectFit: "contain" }} sizes="100vw" />
              </div>
            ) : selectedFile.type === "video" ? (
              <video src={selectedFile.url} controls style={{ width: "100%", aspectRatio: "16/9", background: "#F4F1ED", borderRadius: 8 }} />
            ) : (
              <div style={{ width: "100%", aspectRatio: "16/9", background: "#fff", border: "1px solid #EAE6E1", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                <span style={{ fontSize: 52 }}>📄</span>
                <p style={{ fontFamily: "'Geist',sans-serif", fontSize: 13, color: "#9E9890" }}>{selectedFile.name}</p>
                <a href={selectedFile.url} target="_blank" rel="noopener noreferrer"
                  style={{ padding: "9px 20px", border: "1.5px solid #EAE6E1", borderRadius: 7, fontFamily: "'Geist',sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9E9890", textDecoration: "none" }}>
                  Télécharger
                </a>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, flexWrap: "wrap", gap: 12 }}>
              <p className="p-preview-meta">{selectedFile.name}</p>
              <div className="p-preview-actions">
                <button
                  className="p-preview-btn p-preview-btn-ghost"
                  onClick={() => { handleRenameFile(selectedFile); setSelectedFile(null); }}
                >Renommer</button>
                <button
                  className="p-preview-btn p-preview-btn-danger"
                  onClick={() => { setFileToDelete(selectedFile); setShowDeleteConfirm(true); setSelectedFile(null); }}
                >Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete File Modal ── */}
      {showDeleteConfirm && fileToDelete && (
        <div className="p-modal-backdrop" onClick={() => { setShowDeleteConfirm(false); setFileToDelete(null); }}>
          <div className="p-modal" onClick={(e) => e.stopPropagation()}>
            <div className="p-modal-body-inner">
              <h3 className="p-modal-title" style={{ marginBottom: 20 }}>Supprimer le fichier</h3>
              <p className="p-delete-body">
                Supprimer <span className="p-delete-name">{fileToDelete.name}</span> ? Cette action est irréversible.
              </p>
              <div className="p-modal-actions">
                <button disabled={deleting} onClick={() => { setShowDeleteConfirm(false); setFileToDelete(null); }} className="p-btn-ghost">Annuler</button>
                <button disabled={deleting} onClick={() => handleDeleteFile(fileToDelete)} className="p-btn-danger">{deleting ? "Suppression..." : "Supprimer"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}