"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../lib/firebase";
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, query, orderBy,
} from "firebase/firestore";
import Link from "next/link";

interface TagText {
  id: string; tag: string; title: string;
  content: string; createdAt: Date; updatedAt: Date;
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
  .font-serif-display { font-family: 'DM Serif Display', serif; }
  .font-dm { font-family: 'DM Sans', sans-serif; }
  @keyframes spin-texts { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spin-texts { animation: spin-texts 0.8s linear infinite; }
`;

export default function AdminTextsPage() {
  const [tagTexts, setTagTexts] = useState<TagText[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({ tag: "", title: "", content: "" });

  useEffect(() => { fetchTagTexts(); }, []);

  const fetchTagTexts = async () => {
    try {
      const q = query(collection(db, "tagTexts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setTagTexts(snapshot.docs.map((d) => ({
        id: d.id, ...d.data(),
        createdAt: d.data().createdAt?.toDate() || new Date(),
        updatedAt: d.data().updatedAt?.toDate() || new Date(),
      })) as TagText[]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tag.trim() || !formData.content.trim()) { alert("Tag et contenu requis"); return; }
    try {
      if (editingId) {
        await updateDoc(doc(db, "tagTexts", editingId), { ...formData, updatedAt: new Date() });
      } else {
        await addDoc(collection(db, "tagTexts"), { ...formData, createdAt: new Date(), updatedAt: new Date() });
      }
      setFormData({ tag: "", title: "", content: "" });
      setEditingId(null);
      fetchTagTexts();
    } catch (e) { console.error(e); alert("Erreur"); }
  };

  const handleEdit = (text: TagText) => {
    setFormData({ tag: text.tag, title: text.title, content: text.content });
    setEditingId(text.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce texte ?")) return;
    try { await deleteDoc(doc(db, "tagTexts", id)); fetchTagTexts(); }
    catch (e) { console.error(e); alert("Erreur"); }
  };

  const handleCancel = () => { setFormData({ tag: "", title: "", content: "" }); setEditingId(null); };

  const navLinks = [
    { href: "/admin", label: "Upload", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> },
    { href: "/admin/portal", label: "Portails", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg> },
    { href: "/admin/tag-cover", label: "Tag Cover", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg> },
    { href: "/admin/home-image", label: "Page d'accueil", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  ];

  const inputCls = "w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-md px-4 py-[11px] text-[#e8e4dc] text-[13px] font-dm outline-none transition-colors focus:border-[#3a3a3a] placeholder:text-[#333]";
  const labelCls = "text-[10px] text-[#444] tracking-[0.15em] uppercase mb-2 block";

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
            <Link href="/admin/texts" onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-[9px] rounded-md text-[13px] tracking-[0.01em] bg-white text-black [&_svg]:stroke-black whitespace-nowrap">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Textes
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
                <span className="text-[#ccc] font-medium">Textes</span>
              </div>
            </div>
            <span className="text-[11px] text-[#555] tracking-[0.05em] px-3 py-1 border border-[#1e1e1e] rounded-full bg-[#111]">
              {tagTexts.length} texte{tagTexts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 lg:px-10 py-8 pb-16 w-full max-w-[860px] mx-auto">

            <h1 className="font-serif-display text-[26px] sm:text-[30px] text-white tracking-[0.01em] leading-tight mb-1">
              Textes & introspections
            </h1>
            <p className="text-[11px] text-[#444] tracking-[0.12em] uppercase mb-8">
              Associer des textes aux tags
            </p>

            {/* ── Form ── */}
            <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-5 mb-6">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#444] mb-4">
                {editingId ? "Modifier le texte" : "Nouveau texte"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className={labelCls}>Tag <span className="text-[#2e2e2e]">*</span></span>
                    <input
                      type="text"
                      placeholder="FWP, portrait, editorial..."
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      className={inputCls}
                      required
                    />
                  </div>
                  <div>
                    <span className={labelCls}>Titre <span className="text-[#2e2e2e]">· optionnel</span></span>
                    <input
                      type="text"
                      placeholder="Titre de l'introspection..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <span className={labelCls}>Contenu <span className="text-[#2e2e2e]">*</span></span>
                  <textarea
                    placeholder="Écrivez votre texte ou introspection ici..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={7}
                    className={`${inputCls} resize-none leading-relaxed`}
                    required
                  />
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="submit"
                    className="flex-1 bg-[#e8e4dc] hover:bg-white text-[#0a0a0a] border-none rounded-md py-3 px-4 text-[11px] font-medium tracking-[0.1em] uppercase cursor-pointer transition-colors font-dm"
                  >
                    {editingId ? "Mettre à jour" : "Ajouter le texte"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-transparent hover:border-[#444] hover:text-[#aaa] text-[#666] border border-[#222] rounded-md py-3 px-5 text-[11px] tracking-[0.1em] uppercase cursor-pointer transition-colors font-dm"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* ── List ── */}
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#444] mb-4">
                {tagTexts.length} texte{tagTexts.length !== 1 ? "s" : ""} existant{tagTexts.length !== 1 ? "s" : ""}
              </p>

              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-7 h-7 border border-[#1e1e1e] border-t-[#e8e4dc] rounded-full spin-texts" />
                </div>
              ) : tagTexts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-[#111] border border-dashed border-[#1e1e1e] rounded-lg text-[#333]">
                  <svg className="w-9 h-9 mb-3 stroke-[#222]" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-[12px] tracking-[0.08em] uppercase">Aucun texte — ajoutez-en un ci-dessus</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {tagTexts.map((text) => (
                    <div
                      key={text.id}
                      className={`bg-[#111] border rounded-lg overflow-hidden transition-colors ${editingId === text.id ? "border-[#e8e4dc]" : "border-[#1e1e1e] hover:border-[#2e2e2e]"}`}
                    >
                      <div className="px-5 py-4">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <span className="inline-block text-[10px] tracking-[0.1em] uppercase px-2.5 py-1 bg-[#e8e4dc] text-[#0a0a0a] rounded-[3px] mb-2">
                              #{text.tag}
                            </span>
                            {text.title && (
                              <p className="font-serif-display text-[17px] text-white leading-tight mt-1">
                                {text.title}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleEdit(text)}
                              title="Modifier"
                              className="w-8 h-8 flex items-center justify-center rounded-md text-[#444] hover:text-[#ccc] hover:bg-[#181818] transition-colors cursor-pointer bg-transparent border-none"
                            >
                              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(text.id)}
                              title="Supprimer"
                              className="w-8 h-8 flex items-center justify-center rounded-md text-[#444] hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.06)] transition-colors cursor-pointer bg-transparent border-none"
                            >
                              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <p className="text-[13px] text-[#777] leading-relaxed whitespace-pre-wrap">
                          {text.content}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="px-5 py-2.5 border-t border-[#1a1a1a] flex items-center justify-between">
                        <span className="text-[10px] text-[#333] tracking-[0.04em]">
                          Mis à jour le {text.updatedAt.toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                        <button
                          onClick={() => handleEdit(text)}
                          className="text-[10px] tracking-[0.08em] uppercase text-[#444] hover:text-[#ccc] transition-colors cursor-pointer bg-transparent border-none font-dm"
                        >
                          Modifier →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}