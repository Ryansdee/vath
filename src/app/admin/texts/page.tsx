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
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Geist:wght@300;400;500&display=swap');

  .t-root * { box-sizing: border-box; }
  .t-root h1,.t-root h2,.t-root h3,.t-root p { margin:0; padding:0; }
  .font-serif { font-family: 'Cormorant Garamond', serif; }
  .font-geist { font-family: 'Geist', sans-serif; }

  @keyframes spin-t { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .spin-t { animation: spin-t 0.8s linear infinite; }

  /* ── Sidebar ── */
  .t-sidebar {
    position:fixed; top:0; left:0; height:100%; width:220px;
    background:#fff; border-right:1px solid #EAE6E1;
    display:flex; flex-direction:column; z-index:50;
    transition:transform 0.2s ease;
  }
  .t-sidebar.closed { transform:translateX(-100%); }
  @media(min-width:1024px){ .t-sidebar{ transform:translateX(0)!important; } }

  .t-sidebar-header { padding:28px 22px 20px; border-bottom:1px solid #EAE6E1; flex-shrink:0; }
  .t-sidebar-logo { font-family:'Cormorant Garamond',serif; font-size:17px; font-weight:300; color:#1A1816; letter-spacing:0.04em; line-height:1.2; }
  .t-sidebar-logo em { font-style:italic; color:#8A7D6E; }
  .t-sidebar-sub { font-family:'Geist',sans-serif; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:#C8BFB5; margin-top:4px; display:block; }

  .t-nav { flex:1; padding:16px 10px; display:flex; flex-direction:column; gap:2px; overflow-y:auto; }
  .t-nav-label { font-family:'Geist',sans-serif; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:#D4CFC9; padding:8px 12px 6px; display:block; }
  .t-nav-link { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:7px; font-family:'Geist',sans-serif; font-size:13px; color:#9E9890; text-decoration:none; transition:all 0.15s; white-space:nowrap; }
  .t-nav-link:hover { background:#F4F1ED; color:#3D3830; }
  .t-nav-link.active { background:#1A1816; color:#F9F7F4; }
  .t-nav-link.active svg { stroke:#F9F7F4; }

  .t-sidebar-footer { padding:16px 22px; border-top:1px solid #EAE6E1; flex-shrink:0; display:flex; align-items:center; gap:8px; }
  .t-status-dot { width:6px; height:6px; border-radius:50%; background:#5DBF8A; flex-shrink:0; }
  .t-status-text { font-family:'Geist',sans-serif; font-size:11px; color:#C8BFB5; letter-spacing:0.04em; }

  .t-overlay { position:fixed; inset:0; background:rgba(26,24,22,0.25); z-index:40; backdrop-filter:blur(2px); }

  /* ── Topbar ── */
  .t-topbar { position:sticky; top:0; z-index:30; height:60px; background:#fff; border-bottom:1px solid #EAE6E1; padding:0 24px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
  .t-breadcrumb { display:flex; align-items:center; gap:8px; font-family:'Geist',sans-serif; font-size:12px; color:#C8BFB5; letter-spacing:0.04em; }
  .t-breadcrumb-sep { color:#E2DDD8; }
  .t-breadcrumb-current { color:#3D3830; font-weight:500; }
  .t-badge-count { font-family:'Geist',sans-serif; font-size:11px; color:#9E9890; letter-spacing:0.05em; padding:4px 12px; border:1px solid #EAE6E1; border-radius:100px; background:#F9F7F4; }
  .t-hamburger { display:flex; flex-direction:column; justify-content:center; gap:5px; padding:4px; cursor:pointer; background:none; border:none; }
  .t-hamburger span { width:18px; height:1px; background:#9E9890; display:block; }
  @media(min-width:1024px){ .t-hamburger{ display:none; } }

  /* ── Content ── */
  .t-content { padding:36px 24px 80px; width:100%; max-width:860px; margin:0 auto; }
  @media(min-width:640px){ .t-content{ padding:40px 32px 80px; } }
  @media(min-width:1024px){ .t-content{ padding:48px 40px 80px; } }

  .t-page-title { font-family:'Cormorant Garamond',serif; font-size:34px; font-weight:300; color:#1A1816; letter-spacing:-0.01em; line-height:1.1; margin-bottom:6px; }
  .t-page-title em { font-style:italic; color:#8A7D6E; }
  .t-page-sub { font-family:'Geist',sans-serif; font-size:11px; color:#C8BFB5; letter-spacing:0.14em; text-transform:uppercase; margin-bottom:36px; }

  /* ── Form card ── */
  .t-card { background:#fff; border:1px solid #EAE6E1; border-radius:10px; padding:22px; margin-bottom:20px; }
  .t-section-label { font-family:'Geist',sans-serif; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:#C8BFB5; margin-bottom:16px; display:block; }

  .t-label { font-family:'Geist',sans-serif; font-size:10px; letter-spacing:0.15em; text-transform:uppercase; color:#C8BFB5; margin-bottom:8px; display:block; }
  .t-label em { font-style:normal; color:#E2DDD8; }

  .t-input { width:100%; background:#F9F7F4; border:1.5px solid #EAE6E1; border-radius:8px; padding:12px 16px; color:#1A1816; font-size:13px; font-family:'Geist',sans-serif; font-weight:300; outline:none; transition:border-color 0.15s, box-shadow 0.15s; }
  .t-input::placeholder { color:#D4CFC9; }
  .t-input:focus { border-color:#9E9890; background:#fff; box-shadow:0 0 0 3px rgba(158,152,144,0.08); }

  .t-textarea { width:100%; background:#F9F7F4; border:1.5px solid #EAE6E1; border-radius:8px; padding:12px 16px; color:#1A1816; font-size:13px; font-family:'Geist',sans-serif; font-weight:300; outline:none; transition:border-color 0.15s, box-shadow 0.15s; resize:none; line-height:1.7; }
  .t-textarea::placeholder { color:#D4CFC9; }
  .t-textarea:focus { border-color:#9E9890; background:#fff; box-shadow:0 0 0 3px rgba(158,152,144,0.08); }

  .t-form-actions { display:flex; gap:10px; padding-top:4px; }
  .t-btn-primary { flex:1; background:#1A1816; color:#F9F7F4; border:none; border-radius:8px; padding:13px 16px; font-family:'Geist',sans-serif; font-size:11px; font-weight:400; letter-spacing:0.1em; text-transform:uppercase; cursor:pointer; transition:background 0.15s; }
  .t-btn-primary:hover { background:#2D2A26; }
  .t-btn-ghost { background:transparent; color:#9E9890; border:1.5px solid #EAE6E1; border-radius:8px; padding:13px 16px; font-family:'Geist',sans-serif; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; cursor:pointer; transition:all 0.15s; }
  .t-btn-ghost:hover { border-color:#C8BFB5; color:#5C5752; }

  /* ── List ── */
  .t-list-label { font-family:'Geist',sans-serif; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:#C8BFB5; margin-bottom:16px; display:block; }

  .t-text-card { background:#fff; border:1.5px solid #EAE6E1; border-radius:10px; overflow:hidden; transition:border-color 0.15s; }
  .t-text-card:hover { border-color:#C8BFB5; }
  .t-text-card.editing { border-color:#1A1816; }

  .t-text-card-body { padding:18px 20px; }

  .t-tag-pill { display:inline-block; font-family:'Geist',sans-serif; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; padding:4px 10px; background:#F4F1ED; color:#8A7D6E; border:1px solid #E2DDD8; border-radius:4px; margin-bottom:10px; }

  .t-text-title { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:300; color:#1A1816; line-height:1.2; margin-top:2px; margin-bottom:0; }

  .t-card-actions { display:flex; align-items:center; gap:2px; flex-shrink:0; }
  .t-icon-btn { width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:7px; cursor:pointer; background:transparent; border:none; transition:all 0.15s; color:#C8BFB5; }
  .t-icon-btn:hover { background:#F4F1ED; color:#3D3830; }
  .t-icon-btn.danger:hover { background:#FDF5F5; color:#B85050; }

  .t-text-content { font-family:'Geist',sans-serif; font-size:13px; color:#8A7D6E; line-height:1.75; white-space:pre-wrap; font-weight:300; }

  .t-text-card-footer { padding:10px 20px; border-top:1px solid #EAE6E1; display:flex; align-items:center; justify-content:space-between; background:#FAFAF8; }
  .t-footer-date { font-family:'Geist',sans-serif; font-size:10px; color:#C8BFB5; letter-spacing:0.04em; }
  .t-footer-edit { font-family:'Geist',sans-serif; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#C8BFB5; background:transparent; border:none; cursor:pointer; transition:color 0.15s; }
  .t-footer-edit:hover { color:#3D3830; }

  /* ── Empty / spinner ── */
  .t-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:64px 20px; background:#fff; border:1.5px dashed #EAE6E1; border-radius:10px; }
  .t-empty-text { font-family:'Geist',sans-serif; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#D4CFC9; margin-top:16px; }
  .t-spinner { width:26px; height:26px; border:1.5px solid #EAE6E1; border-top-color:#1A1816; border-radius:50%; }
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

  return (
    <>
      <style>{globalStyles}</style>

      <div className="t-root font-geist" style={{ background: "#F9F7F4", minHeight: "100vh", color: "#1A1816" }}>

        {/* Mobile overlay */}
        {sidebarOpen && <div className="t-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* ── Sidebar ── */}
        <aside className={`t-sidebar${sidebarOpen ? "" : " closed"}`}>
          <div className="t-sidebar-header">
            <div className="t-sidebar-logo">Vadim <em>Thevelin</em></div>
            <span className="t-sidebar-sub">Administration</span>
          </div>
          <nav className="t-nav">
            <span className="t-nav-label">Navigation</span>
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setSidebarOpen(false)} className="t-nav-link">
                {l.icon}{l.label}
              </Link>
            ))}
            <Link href="/admin/texts" onClick={() => setSidebarOpen(false)} className="t-nav-link active">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Textes
            </Link>
          </nav>
          <div className="t-sidebar-footer">
            <span className="t-status-dot" />
            <span className="t-status-text">Système opérationnel</span>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="lg:ml-[220px] min-h-screen flex flex-col">

          {/* Topbar */}
          <div className="t-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="t-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
                <span /><span /><span />
              </button>
              <div className="t-breadcrumb">
                <span>Admin</span>
                <span className="t-breadcrumb-sep">/</span>
                <span className="t-breadcrumb-current">Textes</span>
              </div>
            </div>
            <span className="t-badge-count">{tagTexts.length} texte{tagTexts.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Content */}
          <div className="t-content">

            <h1 className="t-page-title">Textes & <em>introspections</em></h1>
            <p className="t-page-sub">Associer des textes aux tags</p>

            {/* ── Form ── */}
            <div className="t-card">
              <span className="t-section-label">
                {editingId ? "Modifier le texte" : "Nouveau texte"}
              </span>

              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }} className="grid-cols-1 sm:grid-cols-2">
                  <div>
                    <span className="t-label">Tag <em>*</em></span>
                    <input
                      type="text"
                      placeholder="FWP, portrait, editorial..."
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      className="t-input"
                      required
                    />
                  </div>
                  <div>
                    <span className="t-label">Titre <em>· optionnel</em></span>
                    <input
                      type="text"
                      placeholder="Titre de l'introspection..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="t-input"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <span className="t-label">Contenu <em>*</em></span>
                  <textarea
                    placeholder="Écrivez votre texte ou introspection ici..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={7}
                    className="t-textarea"
                    required
                  />
                </div>

                <div className="t-form-actions">
                  <button type="submit" className="t-btn-primary">
                    {editingId ? "Mettre à jour" : "Ajouter le texte"}
                  </button>
                  {editingId && (
                    <button type="button" onClick={handleCancel} className="t-btn-ghost">
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* ── List ── */}
            <span className="t-list-label">
              {tagTexts.length} texte{tagTexts.length !== 1 ? "s" : ""} existant{tagTexts.length !== 1 ? "s" : ""}
            </span>

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "56px 0" }}>
                <div className="t-spinner spin-t" />
              </div>
            ) : tagTexts.length === 0 ? (
              <div className="t-empty">
                <svg style={{ width: 32, height: 32, stroke: "#D4CFC9" }} fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="t-empty-text">Aucun texte — ajoutez-en un ci-dessus</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tagTexts.map((text) => (
                  <div key={text.id} className={`t-text-card${editingId === text.id ? " editing" : ""}`}>
                    <div className="t-text-card-body">

                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
                        <div>
                          <span className="t-tag-pill">#{text.tag}</span>
                          {text.title && (
                            <p className="t-text-title">{text.title}</p>
                          )}
                        </div>
                        <div className="t-card-actions">
                          <button
                            onClick={() => handleEdit(text)}
                            title="Modifier"
                            className="t-icon-btn"
                          >
                            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(text.id)}
                            title="Supprimer"
                            className="t-icon-btn danger"
                          >
                            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <p className="t-text-content">{text.content}</p>
                    </div>

                    <div className="t-text-card-footer">
                      <span className="t-footer-date">
                        Mis à jour le {text.updatedAt.toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      <button onClick={() => handleEdit(text)} className="t-footer-edit">
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
    </>
  );
}