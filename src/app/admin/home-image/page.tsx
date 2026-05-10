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
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Geist:wght@300;400;500&display=swap');

  .hi-root * { box-sizing: border-box; }
  .hi-root h1,.hi-root h2,.hi-root p { margin:0; padding:0; }
  .font-serif { font-family: 'Cormorant Garamond', serif; }
  .font-geist { font-family: 'Geist', sans-serif; }

  @keyframes spin-hi { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .spin-hi { animation: spin-hi 0.8s linear infinite; }

  /* ── Sidebar ── */
  .hi-sidebar {
    position:fixed; top:0; left:0; height:100%; width:220px;
    background:#fff; border-right:1px solid #EAE6E1;
    display:flex; flex-direction:column; z-index:50;
    transition:transform 0.2s ease;
  }
  .hi-sidebar.closed { transform:translateX(-100%); }
  @media(min-width:1024px){ .hi-sidebar{ transform:translateX(0)!important; } }

  .hi-sidebar-header { padding:28px 22px 20px; border-bottom:1px solid #EAE6E1; flex-shrink:0; }
  .hi-sidebar-logo { font-family:'Cormorant Garamond',serif; font-size:17px; font-weight:300; color:#1A1816; letter-spacing:0.04em; line-height:1.2; }
  .hi-sidebar-logo em { font-style:italic; color:#8A7D6E; }
  .hi-sidebar-sub { font-family:'Geist',sans-serif; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:#C8BFB5; margin-top:4px; display:block; }

  .hi-nav { flex:1; padding:16px 10px; display:flex; flex-direction:column; gap:2px; overflow-y:auto; }
  .hi-nav-label { font-family:'Geist',sans-serif; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:#D4CFC9; padding:8px 12px 6px; display:block; }
  .hi-nav-link { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:7px; font-family:'Geist',sans-serif; font-size:13px; color:#9E9890; text-decoration:none; transition:all 0.15s; white-space:nowrap; }
  .hi-nav-link:hover { background:#F4F1ED; color:#3D3830; }
  .hi-nav-link.active { background:#1A1816; color:#F9F7F4; }
  .hi-nav-link.active svg { stroke:#F9F7F4; }

  .hi-sidebar-footer { padding:16px 22px; border-top:1px solid #EAE6E1; flex-shrink:0; display:flex; align-items:center; gap:8px; }
  .hi-status-dot { width:6px; height:6px; border-radius:50%; background:#5DBF8A; flex-shrink:0; }
  .hi-status-text { font-family:'Geist',sans-serif; font-size:11px; color:#C8BFB5; letter-spacing:0.04em; }

  .hi-overlay { position:fixed; inset:0; background:rgba(26,24,22,0.25); z-index:40; backdrop-filter:blur(2px); }

  /* ── Topbar ── */
  .hi-topbar { position:sticky; top:0; z-index:30; height:60px; background:#fff; border-bottom:1px solid #EAE6E1; padding:0 24px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
  .hi-breadcrumb { display:flex; align-items:center; gap:8px; font-family:'Geist',sans-serif; font-size:12px; color:#C8BFB5; letter-spacing:0.04em; }
  .hi-breadcrumb-sep { color:#E2DDD8; }
  .hi-breadcrumb-current { color:#3D3830; font-weight:500; }
  .hi-badge-count { font-family:'Geist',sans-serif; font-size:11px; color:#9E9890; letter-spacing:0.05em; padding:4px 12px; border:1px solid #EAE6E1; border-radius:100px; background:#F9F7F4; }
  .hi-hamburger { display:flex; flex-direction:column; justify-content:center; gap:5px; padding:4px; cursor:pointer; background:none; border:none; }
  .hi-hamburger span { width:18px; height:1px; background:#9E9890; display:block; }
  @media(min-width:1024px){ .hi-hamburger{ display:none; } }

  /* ── Content ── */
  .hi-content { padding:36px 24px 80px; width:100%; max-width:1100px; margin:0 auto; }
  @media(min-width:640px){ .hi-content{ padding:40px 32px 80px; } }
  @media(min-width:1024px){ .hi-content{ padding:48px 40px 80px; } }

  .hi-page-title { font-family:'Cormorant Garamond',serif; font-size:34px; font-weight:300; color:#1A1816; letter-spacing:-0.01em; line-height:1.1; margin-bottom:6px; }
  .hi-page-title em { font-style:italic; color:#8A7D6E; }
  .hi-page-sub { font-family:'Geist',sans-serif; font-size:11px; color:#C8BFB5; letter-spacing:0.14em; text-transform:uppercase; margin-bottom:36px; }

  /* ── Section label ── */
  .hi-section-label { font-family:'Geist',sans-serif; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:#C8BFB5; margin-bottom:12px; display:block; }

  /* ── Current images strip ── */
  .hi-current-wrap { margin-bottom:36px; }
  .hi-current-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:10px; }
  .hi-current-item { position:relative; aspect-ratio:16/9; border-radius:8px; overflow:hidden; border:1.5px solid #EAE6E1; }
  .hi-current-badge { position:absolute; bottom:8px; left:10px; font-family:'Geist',sans-serif; font-size:9px; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.7); background:rgba(26,24,22,0.45); padding:2px 7px; border-radius:3px; }

  /* ── Divider row ── */
  .hi-divider-row { display:flex; align-items:center; gap:16px; margin-bottom:20px; }
  .hi-divider-text { font-family:'Geist',sans-serif; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:#C8BFB5; white-space:nowrap; }
  .hi-divider-line { flex:1; height:1px; background:#EAE6E1; }
  .hi-divider-hint { font-family:'Geist',sans-serif; font-size:10px; color:#D4CFC9; white-space:nowrap; letter-spacing:0.06em; }

  /* ── Photo grid ── */
  .hi-photo-item { position:relative; aspect-ratio:1; overflow:hidden; border-radius:8px; cursor:pointer; transition:all 0.15s; border:2px solid #EAE6E1; }
  .hi-photo-item:hover { border-color:#C8BFB5; }
  .hi-photo-item.selected { border-color:#1A1816; box-shadow:0 0 0 2px rgba(26,24,22,0.1); }

  .hi-check { position:absolute; top:8px; right:8px; width:20px; height:20px; background:#1A1816; border-radius:50%; display:flex; align-items:center; justify-content:center; }
  .hi-current-overlay { position:absolute; bottom:0; left:0; right:0; background:rgba(26,24,22,0.5); padding:5px 8px; }
  .hi-current-overlay-text { font-family:'Geist',sans-serif; font-size:9px; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.65); }

  /* ── Empty state ── */
  .hi-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:64px 20px; background:#fff; border:1.5px dashed #EAE6E1; border-radius:10px; }
  .hi-empty-text { font-family:'Geist',sans-serif; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#D4CFC9; margin-top:14px; }

  /* ── Spinner ── */
  .hi-spinner { width:26px; height:26px; border:1.5px solid #EAE6E1; border-top-color:#1A1816; border-radius:50%; }

  /* ── Save bar ── */
  .hi-save-bar { display:flex; align-items:center; justify-content:space-between; margin-top:32px; padding-top:24px; border-top:1px solid #EAE6E1; gap:16px; flex-wrap:wrap; }
  .hi-save-hint { font-family:'Geist',sans-serif; font-size:11px; color:#9E9890; letter-spacing:0.04em; }
  .hi-btn-save { display:flex; align-items:center; gap:8px; background:#1A1816; color:#F9F7F4; border:none; border-radius:8px; padding:13px 22px; font-family:'Geist',sans-serif; font-size:11px; font-weight:400; letter-spacing:0.1em; text-transform:uppercase; cursor:pointer; transition:background 0.15s; }
  .hi-btn-save:hover { background:#2D2A26; }
  .hi-btn-save:disabled { opacity:0.35; cursor:not-allowed; }
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

      <div className="hi-root font-geist" style={{ background: "#F9F7F4", minHeight: "100vh", color: "#1A1816" }}>

        {/* Mobile overlay */}
        {sidebarOpen && <div className="hi-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* ── Sidebar ── */}
        <aside className={`hi-sidebar${sidebarOpen ? "" : " closed"}`}>
          <div className="hi-sidebar-header">
            <div className="hi-sidebar-logo">Vadim <em>Thevelin</em></div>
            <span className="hi-sidebar-sub">Administration</span>
          </div>
          <nav className="hi-nav">
            <span className="hi-nav-label">Navigation</span>
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setSidebarOpen(false)} className="hi-nav-link">
                {l.icon}{l.label}
              </Link>
            ))}
            <Link href="/admin/home-image" onClick={() => setSidebarOpen(false)} className="hi-nav-link active">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Page d'accueil
            </Link>
          </nav>
          <div className="hi-sidebar-footer">
            <span className="hi-status-dot" />
            <span className="hi-status-text">Système opérationnel</span>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="lg:ml-[220px] min-h-screen flex flex-col">

          {/* Topbar */}
          <div className="hi-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="hi-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
                <span /><span /><span />
              </button>
              <div className="hi-breadcrumb">
                <span>Admin</span>
                <span className="hi-breadcrumb-sep">/</span>
                <span className="hi-breadcrumb-current">Page d'accueil</span>
              </div>
            </div>
            <span className="hi-badge-count">
              {selected.length} sélectionnée{selected.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Content */}
          <div className="hi-content">

            <h1 className="hi-page-title">Images <em>d'accueil</em></h1>
            <p className="hi-page-sub">Sélectionner les images affichées sur la page d'accueil</p>

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
                <div className="hi-spinner spin-hi" />
              </div>
            ) : (
              <>
                {/* ── Current images ── */}
                {current.length > 0 && (
                  <div className="hi-current-wrap">
                    <span className="hi-section-label">
                      {current.length} image{current.length !== 1 ? "s" : ""} actuellement affichée{current.length !== 1 ? "s" : ""}
                    </span>
                    <div className="hi-current-grid">
                      {current.map((url, i) => (
                        <div key={i} className="hi-current-item">
                          <Image src={url} alt={`Image actuelle ${i + 1}`} fill style={{ objectFit: "cover", opacity: 0.85 }} />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,24,22,0.3) 0%, transparent 55%)" }} />
                          <span className="hi-current-badge">Actuelle</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Divider row ── */}
                <div className="hi-divider-row">
                  <span className="hi-divider-text">
                    {photos.length} photo{photos.length !== 1 ? "s" : ""} disponibles
                  </span>
                  <div className="hi-divider-line" />
                  <span className="hi-divider-hint">Cliquez pour sélectionner</span>
                </div>

                {/* ── Photo grid ── */}
                {photos.length === 0 ? (
                  <div className="hi-empty">
                    <svg style={{ width: 32, height: 32, stroke: "#D4CFC9" }} fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    <p className="hi-empty-text">Aucune photo disponible</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                    {photos.map((photo) => {
                      const isSelected = selected.includes(photo.url);
                      const isCurrent = current.includes(photo.url) && !isSelected;
                      return (
                        <div
                          key={photo.id}
                          onClick={() => toggleSelect(photo.url)}
                          className={`hi-photo-item${isSelected ? " selected" : ""}`}
                        >
                          <Image
                            src={photo.thumbnailUrl || photo.url}
                            alt={photo.description || ""}
                            fill
                            sizes="(max-width:640px) 50vw, 160px"
                            style={{ objectFit: "cover", opacity: isSelected ? 1 : 0.8, transition: "opacity 0.15s" }}
                          />
                          {isSelected && (
                            <>
                              <div style={{ position: "absolute", inset: 0, background: "rgba(26,24,22,0.15)" }} />
                              <div className="hi-check">
                                <svg width="10" height="10" fill="none" stroke="#F9F7F4" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </>
                          )}
                          {isCurrent && (
                            <div className="hi-current-overlay">
                              <span className="hi-current-overlay-text">Actuelle</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Save bar ── */}
                <div className="hi-save-bar">
                  <p className="hi-save-hint">
                    {selected.length === 0
                      ? "Aucune image sélectionnée"
                      : `${selected.length} image${selected.length !== 1 ? "s" : ""} sélectionnée${selected.length !== 1 ? "s" : ""}`}
                  </p>
                  <button
                    onClick={saveSelectedImages}
                    disabled={saving || selected.length === 0}
                    className="hi-btn-save"
                  >
                    {saving ? (
                      <>
                        <svg className="spin-hi" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
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