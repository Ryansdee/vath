"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

interface Photo {
  id: string; url: string; thumbnailUrl?: string;
  description?: string; category?: string;
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
  .font-serif-display { font-family: 'DM Serif Display', serif; }
  .font-dm { font-family: 'DM Sans', sans-serif; }
  @keyframes spin-hi { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spin-hi { animation: spin-hi 0.8s linear infinite; }
`;

export default function AdminHomeImagePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const [snap, settingDoc] = await Promise.all([
          getDocs(collection(db, "photos")),
          getDoc(doc(db, "settings", "homePage")),
        ]);
        const filtered = snap.docs
          .map((d) => ({ ...(d.data() as Photo), id: d.id }))
          .filter((p) => !["blog", "about", "personal-project"].includes(p.category?.toLowerCase() || ""));
        setPhotos(filtered);
        if (settingDoc.exists()) {
          const d = settingDoc.data();
          const saved = Array.isArray(d.featuredImages) ? d.featuredImages : d.featuredImage ? [d.featuredImage] : [];
          setCurrent(saved); setSelected(saved);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchPhotos();
  }, []);

  const toggleSelect = (url: string) =>
    setSelected((prev) => prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]);

  const saveSelectedImages = async () => {
    if (selected.length === 0) return alert("Aucune image sélectionnée !");
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "homePage"), { featuredImages: selected, updatedAt: new Date() });
      setCurrent(selected);
    } catch (e) { console.error(e); alert("Erreur lors de la sauvegarde."); }
    finally { setSaving(false); }
  };

  const navLinks = [
    { href: "/admin", label: "Upload", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> },
    { href: "/admin/portal", label: "Portails", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg> },
    { href: "/admin/texts", label: "Textes", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
    { href: "/admin/tag-cover", label: "Tag Cover", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg> },
  ];

  return (
    <>
      <style>{globalStyles}</style>

      <div className="font-dm bg-[#0a0a0a] min-h-screen text-[#e8e4dc]">

        {/* ── Mobile overlay ── */}
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
            <Link href="/admin/home-image" onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-[9px] rounded-md text-[13px] tracking-[0.01em] bg-white text-black [&_svg]:stroke-black whitespace-nowrap">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Page d'accueil
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
                <span className="text-[#ccc] font-medium">Page d'accueil</span>
              </div>
            </div>
            <span className="text-[11px] text-[#555] tracking-[0.05em] px-3 py-1 border border-[#1e1e1e] rounded-full bg-[#111]">
              {selected.length} sélectionnée{selected.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 lg:px-10 py-8 pb-16 w-full max-w-[1100px] mx-auto">

            <h1 className="font-serif-display text-[26px] sm:text-[30px] text-white tracking-[0.01em] leading-tight mb-1">
              Images d'accueil
            </h1>
            <p className="text-[11px] text-[#444] tracking-[0.12em] uppercase mb-8">
              Sélectionner les images affichées sur la page d'accueil
            </p>

            {loading ? (
              <div className="flex justify-center pt-20">
                <div className="w-7 h-7 border border-[#1e1e1e] border-t-[#e8e4dc] rounded-full spin-hi" />
              </div>
            ) : (
              <>
                {/* ── Current images ── */}
                {current.length > 0 && (
                  <div className="mb-8">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#444] mb-3">
                      {current.length} image{current.length !== 1 ? "s" : ""} actuellement affichée{current.length !== 1 ? "s" : ""}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {current.map((url, i) => (
                        <div key={i} className="relative aspect-video rounded-md overflow-hidden border border-[#1e1e1e]">
                          <Image src={url} alt={`Image actuelle ${i + 1}`} fill className="object-cover opacity-70" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <span className="absolute bottom-2 left-3 text-[9px] tracking-[0.08em] uppercase text-white/50">Actuelle</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Divider ── */}
                <div className="flex items-center gap-4 mb-6">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#444] whitespace-nowrap">
                    {photos.length} photo{photos.length !== 1 ? "s" : ""} disponibles
                  </p>
                  <div className="flex-1 h-px bg-[#1a1a1a]" />
                  <p className="text-[10px] tracking-[0.08em] text-[#333] whitespace-nowrap">
                    Cliquez pour sélectionner
                  </p>
                </div>

                {/* ── Photo grid ── */}
                {photos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-[#111] border border-dashed border-[#1e1e1e] rounded-lg text-[#333]">
                    <p className="text-[12px] tracking-[0.08em] uppercase">Aucune photo disponible</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {photos.map((photo) => {
                      const isSelected = selected.includes(photo.url);
                      const isCurrent = current.includes(photo.url) && !isSelected;
                      return (
                        <div
                          key={photo.id}
                          onClick={() => toggleSelect(photo.url)}
                          className={`relative aspect-square overflow-hidden rounded-md cursor-pointer transition-all duration-150 ${
                            isSelected
                              ? "ring-2 ring-[#e8e4dc] ring-offset-1 ring-offset-[#0a0a0a]"
                              : "ring-1 ring-[#1e1e1e] hover:ring-[#3a3a3a]"
                          }`}
                        >
                          <Image
                            src={photo.thumbnailUrl || photo.url}
                            alt={photo.description || ""}
                            fill
                            sizes="(max-width:640px) 50vw, (max-width:768px) 33vw, 200px"
                            className={`object-cover transition-opacity ${isSelected ? "opacity-100" : "opacity-70 hover:opacity-90"}`}
                          />

                          {/* Selected overlay */}
                          {isSelected && (
                            <>
                              <div className="absolute inset-0 bg-black/30" />
                              <div className="absolute top-2 right-2 w-5 h-5 bg-[#e8e4dc] rounded-full flex items-center justify-center">
                                <svg width="10" height="10" fill="none" stroke="#000" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              </div>
                            </>
                          )}

                          {/* Current badge */}
                          {isCurrent && (
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1 px-2">
                              <span className="text-[9px] tracking-[0.08em] uppercase text-white/50">Actuelle</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Save bar ── */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#1a1a1a]">
                  <p className="text-[11px] text-[#444] tracking-[0.04em]">
                    {selected.length === 0
                      ? "Aucune image sélectionnée"
                      : `${selected.length} image${selected.length !== 1 ? "s" : ""} sélectionnée${selected.length !== 1 ? "s" : ""}`}
                  </p>
                  <button
                    onClick={saveSelectedImages}
                    disabled={saving || selected.length === 0}
                    className="flex items-center gap-2 bg-[#e8e4dc] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-[#0a0a0a] border-none rounded-md py-3 px-6 text-[11px] font-medium tracking-[0.1em] uppercase cursor-pointer transition-colors font-dm"
                  >
                    {saving ? (
                      <>
                        <svg className="spin-hi" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Sauvegarder la sélection
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}