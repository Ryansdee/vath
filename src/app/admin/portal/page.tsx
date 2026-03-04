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
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
  .font-serif-display { font-family: 'DM Serif Display', serif; }
  .font-dm { font-family: 'DM Sans', sans-serif; }
  @keyframes spin-portal { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spin-portal { animation: spin-portal 0.8s linear infinite; }
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
  const [showDetail, setShowDetail] = useState(false); // mobile: show detail panel
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

  /* ── Shared input class ── */
  const inputCls = "w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-md px-4 py-[11px] text-[#e8e4dc] text-[13px] font-dm outline-none transition-colors focus:border-[#3a3a3a] placeholder:text-[#333]";

  /* ── Badge helper ── */
  const Badge = ({ variant, children }: { variant: "files" | "price" | "paid" | "pending"; children: React.ReactNode }) => {
    const cls = {
      files: "bg-[#161616] text-[#555] border-[#222]",
      price: "bg-[#161616] text-[#888] border-[#222]",
      paid: "bg-[rgba(74,222,128,0.1)] text-[#4ade80] border-[rgba(74,222,128,0.2)]",
      pending: "bg-[rgba(251,191,36,0.1)] text-[#fbbf24] border-[rgba(251,191,36,0.2)]",
    }[variant];
    return <span className={`text-[10px] tracking-[0.06em] px-2 py-0.5 rounded-[3px] border ${cls}`}>{children}</span>;
  };

  /* ── Button helpers ── */
  const btnPrimary = "flex-1 bg-[#e8e4dc] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-[#0a0a0a] border-none rounded-md py-3 px-4 text-[11px] font-medium tracking-[0.08em] uppercase cursor-pointer transition-colors font-dm";
  const btnGhost = "flex-1 bg-transparent hover:border-[#444] hover:text-[#aaa] disabled:opacity-30 disabled:cursor-not-allowed text-[#666] border border-[#222] rounded-md py-3 px-4 text-[11px] tracking-[0.08em] uppercase cursor-pointer transition-colors font-dm";
  const btnDanger = "flex-1 bg-transparent hover:bg-[rgba(239,68,68,0.08)] hover:border-[#ef4444] disabled:opacity-30 disabled:cursor-not-allowed text-[#ef4444] border border-[rgba(239,68,68,0.3)] rounded-md py-3 px-4 text-[11px] tracking-[0.08em] uppercase cursor-pointer transition-colors font-dm";

  return (
    <>
      <style>{globalStyles}</style>

      <div className="font-dm bg-[#0a0a0a] min-h-screen text-[#e8e4dc]">

        {/* ── Mobile sidebar overlay ── */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Sidebar ── */}
        <aside className={`fixed top-0 left-0 h-full w-[220px] bg-[#111] border-r border-[#1e1e1e] flex flex-col z-50 transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
          <div className="px-5 pt-7 pb-5 border-b border-[#1e1e1e] flex-shrink-0">
            <p className="font-serif-display text-[17px] tracking-[0.04em] text-white leading-tight">Vadim Thevelin</p>
            <span className="text-[9px] tracking-[0.18em] uppercase text-[#444] mt-1 block">Administration</span>
          </div>
          <nav className="flex-1 px-2.5 py-4 flex flex-col gap-0.5 overflow-y-auto">
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#3a3a3a] px-2.5 mt-2 mb-1.5">Navigation</p>
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-[9px] rounded-md text-[13px] text-[#666] tracking-[0.01em] hover:bg-[#181818] hover:text-[#ccc] transition-colors whitespace-nowrap">
                {l.icon}{l.label}
              </Link>
            ))}
            <Link href="/admin/portal" onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-[9px] rounded-md text-[13px] tracking-[0.01em] bg-white text-black [&_svg]:stroke-black whitespace-nowrap">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
              Portails
            </Link>
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
              <button className="lg:hidden flex flex-col justify-center gap-[5px] p-1 cursor-pointer" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
                <span className="w-5 h-px bg-[#666] block" /><span className="w-5 h-px bg-[#666] block" /><span className="w-5 h-px bg-[#666] block" />
              </button>
              <div className="flex items-center gap-2 text-[12px] text-[#444] tracking-[0.04em]">
                <span>Admin</span><span className="text-[#2a2a2a]">/</span>
                <span className="text-[#ccc] font-medium">Portails clients</span>
              </div>
            </div>
            <span className="text-[11px] text-[#555] tracking-[0.05em] px-3 py-1 border border-[#1e1e1e] rounded-full bg-[#111]">
              {portals.length} portal{portals.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 lg:px-10 py-8 pb-16 w-full">
            <h1 className="font-serif-display text-[26px] sm:text-[30px] text-white tracking-[0.01em] leading-tight mb-1">Portails clients</h1>
            <p className="text-[11px] text-[#444] tracking-[0.12em] uppercase mb-8">Créer · Gérer · Supprimer</p>

            {loading ? (
              <div className="flex justify-center pt-20">
                <div className="w-8 h-8 border border-[#1e1e1e] border-t-[#e8e4dc] rounded-full spin-portal" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">

                {/* ── Portal list ── */}
                <div className={`${showDetail ? "hidden lg:block" : "block"}`}>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-[#444]">{portals.length} portal{portals.length !== 1 ? "s" : ""}</span>
                    <button
                      onClick={() => setShowCreatePortal(true)}
                      className="flex items-center gap-1.5 bg-[#e8e4dc] hover:bg-white text-[#0a0a0a] border-none rounded-md px-3.5 py-2 text-[11px] font-medium tracking-[0.08em] uppercase cursor-pointer transition-colors font-dm"
                    >
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Nouveau
                    </button>
                  </div>

                  {portals.length === 0 ? (
                    <p className="text-center py-10 text-[12px] tracking-[0.08em] uppercase text-[#333]">Aucun portal</p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {portals.map((portal) => (
                        <div
                          key={portal.id}
                          className={`bg-[#111] border rounded-[7px] overflow-hidden transition-colors ${selectedPortal?.id === portal.id ? "border-[#e8e4dc]" : "border-[#1e1e1e] hover:border-[#2e2e2e]"}`}
                        >
                          <div
                            className="px-4 py-3.5 cursor-pointer"
                            onClick={() => { setSelectedPortal(portal); setShowDetail(true); }}
                          >
                            <p className="text-[13px] text-[#e8e4dc] mb-0.5">{portal.clientName}</p>
                            <p className="text-[11px] text-[#666] tracking-[0.03em] mb-0.5">{portal.projectName}</p>
                            <p className="text-[11px] text-[#3e3e3e]">{portal.clientEmail}</p>
                            <div className="flex items-center flex-wrap gap-2 mt-2">
                              <Badge variant="files">{portal.files?.length || 0} fichier{(portal.files?.length || 0) !== 1 ? "s" : ""}</Badge>
                              {portal.price && (
                                <>
                                  <Badge variant="price">{portal.price.toFixed(2)} €</Badge>
                                  <Badge variant={portal.paid ? "paid" : "pending"}>{portal.paid ? "payé" : "en attente"}</Badge>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex border-t border-[#1a1a1a]">
                            <button
                              className="flex-1 py-2.5 text-[10px] tracking-[0.1em] uppercase text-[#555] hover:bg-[#181818] hover:text-[#ccc] transition-colors cursor-pointer font-dm bg-transparent border-none"
                              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/portal/${portal.id}`); }}
                            >Copier lien</button>
                            <button
                              className="flex-1 py-2.5 text-[10px] tracking-[0.1em] uppercase text-[#555] hover:bg-[rgba(239,68,68,0.08)] hover:text-[#ef4444] transition-colors cursor-pointer font-dm bg-transparent border-none border-l border-[#1a1a1a]"
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

                  {/* Mobile back button */}
                  {showDetail && selectedPortal && (
                    <button
                      className="lg:hidden flex items-center gap-2 text-[11px] text-[#555] tracking-[0.08em] uppercase mb-5 cursor-pointer bg-transparent border-none font-dm hover:text-[#aaa] transition-colors"
                      onClick={() => { setShowDetail(false); setSelectedPortal(null); }}
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      Retour aux portails
                    </button>
                  )}

                  {!selectedPortal ? (
                    <div className="hidden lg:flex flex-col items-center justify-center h-[360px] bg-[#111] border border-dashed border-[#1e1e1e] rounded-lg text-[#333]">
                      <svg className="w-10 h-10 mb-3.5 stroke-[#2a2a2a]" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <p className="text-[12px] tracking-[0.08em] uppercase">Sélectionnez un portal</p>
                    </div>
                  ) : (
                    <>
                      {/* Detail header */}
                      <div className="mb-5">
                        <h2 className="font-serif-display text-[22px] text-white mb-1">{selectedPortal.projectName}</h2>
                        <p className="text-[12px] text-[#555] tracking-[0.03em]">
                          {selectedPortal.clientName} <span className="text-[#3a3a3a] mx-1.5">·</span> {selectedPortal.clientEmail}
                        </p>
                        {selectedPortal.price && (
                          <div className="flex items-center flex-wrap gap-2.5 mt-2.5">
                            <Badge variant="price">{selectedPortal.price.toFixed(2)} €</Badge>
                            <Badge variant={selectedPortal.paid ? "paid" : "pending"}>{selectedPortal.paid ? "payé" : "en attente"}</Badge>
                            {!selectedPortal.paid && (
                              <button
                                className="px-3.5 py-1.5 text-[10px] tracking-[0.1em] uppercase bg-transparent border border-[#2a2a2a] rounded text-[#888] hover:border-[#4ade80] hover:text-[#4ade80] transition-colors cursor-pointer font-dm"
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
                        className={`border border-dashed rounded-lg py-8 px-5 text-center mb-5 outline-none select-none transition-colors ${uploading ? "opacity-50 cursor-not-allowed border-[#222] bg-[#0d0d0d]" : "border-[#222] bg-[#0d0d0d] hover:border-[#3a3a3a] hover:bg-[#111] cursor-pointer"}`}
                      >
                        {uploading ? (
                          <>
                            <svg className="w-7 h-7 mx-auto mb-2.5 stroke-[#2a2a2a] spin-portal" fill="none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <p className="text-[12px] text-[#4a4a4a]">Upload en cours...</p>
                          </>
                        ) : (
                          <>
                            <svg className="w-7 h-7 mx-auto mb-2.5 stroke-[#2a2a2a] transition-colors" fill="none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-[12px] text-[#4a4a4a] mb-1">Cliquez pour uploader des fichiers</p>
                            <p className="text-[10px] text-[#2e2e2e] tracking-[0.1em] uppercase">Images · Vidéos · Documents</p>
                          </>
                        )}
                      </div>

                      {/* Progress log */}
                      {uploadProgress.length > 0 && (
                        <div className="bg-[#111] border border-[#1e1e1e] rounded-md px-4 py-3.5 mb-5">
                          {uploadProgress.map((msg, i) => (
                            <p key={i} className={`text-[11px] tracking-[0.04em] py-0.5 ${msg.startsWith("✓") ? "text-[#4ade80]" : "text-[#666]"}`}>{msg}</p>
                          ))}
                        </div>
                      )}

                      {/* Files grid */}
                      {selectedPortal.files?.length > 0 && (
                        <div>
                          <p className="text-[10px] tracking-[0.2em] uppercase text-[#444] mb-3.5">
                            {selectedPortal.files.length} fichier{selectedPortal.files.length !== 1 ? "s" : ""}
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {selectedPortal.files.map((file) => (
                              <div
                                key={file.id}
                                className="border border-[#1e1e1e] hover:border-[#3a3a3a] rounded-md overflow-hidden cursor-pointer bg-[#0d0d0d] transition-colors group"
                                onClick={() => setSelectedFile(file)}
                              >
                                {file.type === "image" ? (
                                  <div className="relative aspect-square bg-[#111]">
                                    <Image src={file.url} alt={file.name} fill sizes="(max-width:640px) 33vw, 200px" style={{ objectFit: "cover" }} className="group-hover:opacity-75 transition-opacity" />
                                  </div>
                                ) : (
                                  <div className="aspect-square bg-[#111] flex items-center justify-center text-[28px]">
                                    {file.type === "video" ? "🎥" : "📄"}
                                  </div>
                                )}
                                <p className="px-2.5 py-2 text-[10px] text-[#555] tracking-[0.03em] truncate border-t border-[#1a1a1a]">{file.name}</p>
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
        <div className="fixed inset-0 bg-black/88 flex items-center justify-center z-50 p-4 sm:p-6 backdrop-blur-md" onClick={() => setShowCreatePortal(false)}>
          <div className="bg-[#111] border border-[#252525] rounded-lg w-full max-w-[480px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-0">
              <h3 className="font-serif-display text-[22px] text-white mb-1">Nouveau portal</h3>
              <p className="text-[12px] text-[#555] tracking-[0.04em] mb-5">Les informations seront envoyées au client par email</p>
            </div>
            <div className="px-6 pb-6">
              <form onSubmit={handleCreatePortal}>
                <div className="mb-3.5">
                  <span className="text-[10px] text-[#444] tracking-[0.15em] uppercase mb-2 block">Nom du client <span className="text-[#2e2e2e]">*</span></span>
                  <input type="text" value={newPortalName} onChange={(e) => setNewPortalName(e.target.value)} className={inputCls} placeholder="Jean Dupont" required />
                </div>
                <div className="mb-3.5">
                  <span className="text-[10px] text-[#444] tracking-[0.15em] uppercase mb-2 block">Email du client <span className="text-[#2e2e2e]">*</span></span>
                  <input type="email" value={newPortalEmail} onChange={(e) => setNewPortalEmail(e.target.value)} className={inputCls} placeholder="jean@exemple.com" required />
                </div>
                <div className="mb-3.5">
                  <span className="text-[10px] text-[#444] tracking-[0.15em] uppercase mb-2 block">Nom du projet <span className="text-[#2e2e2e]">*</span></span>
                  <input type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className={inputCls} placeholder="Shooting Mariage 2024" required />
                </div>

                {/* Toggle price */}
                <div
                  className="flex items-center gap-2.5 cursor-pointer py-3 border-t border-[#1a1a1a] mt-1"
                  onClick={() => { setEnablePrice(!enablePrice); if (enablePrice) setNewPortalPrice(undefined); }}
                >
                  <div className={`w-4 h-4 border rounded-[3px] flex items-center justify-center flex-shrink-0 transition-colors ${enablePrice ? "bg-[#e8e4dc] border-[#e8e4dc]" : "bg-[#0d0d0d] border-[#333]"}`}>
                    {enablePrice && <svg width="10" height="10" fill="none" stroke="#000" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-[12px] text-[#666] tracking-[0.04em]">Ajouter un prix pour ce portal</span>
                </div>
                {enablePrice && (
                  <div className="mt-3">
                    <span className="text-[10px] text-[#444] tracking-[0.15em] uppercase mb-2 block">Prix (€)</span>
                    <input type="number" min={0} step="0.01" value={newPortalPrice ?? ""} onChange={(e) => setNewPortalPrice(e.target.value ? Number(e.target.value) : undefined)} className={inputCls} placeholder="0.00" />
                  </div>
                )}

                <div className="flex gap-2.5 mt-5">
                  <button type="button" disabled={creating} onClick={() => { setShowCreatePortal(false); setNewPortalName(""); setNewPortalEmail(""); setNewProjectName(""); setEnablePrice(false); setNewPortalPrice(undefined); }} className={btnGhost}>Annuler</button>
                  <button type="submit" disabled={creating} className={btnPrimary}>{creating ? "Création..." : "Créer le portal"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Portal Modal ── */}
      {showDeletePortalConfirm && portalToDelete && (
        <div className="fixed inset-0 bg-black/88 flex items-center justify-center z-50 p-4 sm:p-6 backdrop-blur-md" onClick={() => { setShowDeletePortalConfirm(false); setPortalToDelete(null); }}>
          <div className="bg-[#111] border border-[#252525] rounded-lg w-full max-w-[480px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-0">
              <h3 className="font-serif-display text-[22px] text-white mb-5">Supprimer le portal</h3>
            </div>
            <div className="px-6 pb-6">
              <p className="text-[13px] text-[#888] leading-relaxed">
                Supprimer le portal de <span className="text-[#e8e4dc]">{portalToDelete.clientName}</span> — <em>{portalToDelete.projectName}</em> ?
              </p>
              <p className="text-[12px] text-[#ef4444] opacity-70 mt-2">
                {portalToDelete.files?.length || 0} fichier{(portalToDelete.files?.length || 0) !== 1 ? "s" : ""} seront définitivement supprimés.
              </p>
              <div className="flex gap-2.5 mt-5">
                <button disabled={deletingPortal} onClick={() => { setShowDeletePortalConfirm(false); setPortalToDelete(null); }} className={btnGhost}>Annuler</button>
                <button disabled={deletingPortal} onClick={() => handleDeletePortal(portalToDelete)} className={btnDanger}>{deletingPortal ? "Suppression..." : "Supprimer"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── File Preview Modal ── */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4 sm:p-6 backdrop-blur-lg" onClick={() => setSelectedFile(null)}>
          <button className="absolute top-6 right-7 bg-none border-none text-[#555] hover:text-[#ccc] text-[28px] cursor-pointer leading-none transition-colors" onClick={() => setSelectedFile(null)}>×</button>
          <div className="w-full max-w-[1100px]" onClick={(e) => e.stopPropagation()}>
            {selectedFile.type === "image" ? (
              <div className="relative w-full aspect-video">
                <Image src={selectedFile.url} alt={selectedFile.name} fill style={{ objectFit: "contain" }} sizes="100vw" />
              </div>
            ) : selectedFile.type === "video" ? (
              <video src={selectedFile.url} controls className="w-full aspect-video bg-black" />
            ) : (
              <div className="w-full aspect-video bg-[#111] flex flex-col items-center justify-center gap-4 border border-[#1e1e1e] rounded-lg">
                <span className="text-[56px]">📄</span>
                <p className="text-[13px] text-[#666]">{selectedFile.name}</p>
                <a href={selectedFile.url} target="_blank" rel="noopener noreferrer"
                  className="px-5 py-2 border border-[#2a2a2a] rounded text-[#aaa] text-[11px] tracking-[0.1em] uppercase no-underline hover:border-[#555] hover:text-[#ccc] transition-colors">
                  Télécharger
                </a>
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-5">
              <p className="text-[11px] text-[#555] tracking-[0.08em] uppercase">{selectedFile.name}</p>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 text-[10px] tracking-[0.1em] uppercase rounded bg-transparent text-[#888] border border-[#2a2a2a] hover:border-[#555] hover:text-[#ccc] transition-colors cursor-pointer font-dm"
                  onClick={() => { handleRenameFile(selectedFile); setSelectedFile(null); }}
                >Renommer</button>
                <button
                  className="px-4 py-2 text-[10px] tracking-[0.1em] uppercase rounded bg-transparent text-[#ef4444] border border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.08)] hover:border-[#ef4444] transition-colors cursor-pointer font-dm"
                  onClick={() => { setFileToDelete(selectedFile); setShowDeleteConfirm(true); setSelectedFile(null); }}
                >Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete File Modal ── */}
      {showDeleteConfirm && fileToDelete && (
        <div className="fixed inset-0 bg-black/88 flex items-center justify-center z-50 p-4 sm:p-6 backdrop-blur-md" onClick={() => { setShowDeleteConfirm(false); setFileToDelete(null); }}>
          <div className="bg-[#111] border border-[#252525] rounded-lg w-full max-w-[480px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-0">
              <h3 className="font-serif-display text-[22px] text-white mb-5">Supprimer le fichier</h3>
            </div>
            <div className="px-6 pb-6">
              <p className="text-[13px] text-[#888] leading-relaxed">
                Supprimer <span className="text-[#e8e4dc]">{fileToDelete.name}</span> ? Cette action est irréversible.
              </p>
              <div className="flex gap-2.5 mt-5">
                <button disabled={deleting} onClick={() => { setShowDeleteConfirm(false); setFileToDelete(null); }} className={btnGhost}>Annuler</button>
                <button disabled={deleting} onClick={() => handleDeleteFile(fileToDelete)} className={btnDanger}>{deleting ? "Suppression..." : "Supprimer"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}