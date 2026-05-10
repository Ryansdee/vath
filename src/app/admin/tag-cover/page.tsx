"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";
import {
  collection, getDocs, query, where,
  doc, getDoc, setDoc,
} from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

interface Photo {
  id: string; url: string; thumbnailUrl?: string;
  description?: string; tags: string[];
}

interface TagInfo { tag: string; count: number; }

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Geist:wght@300;400;500&display=swap');

  .tc-root * { box-sizing: border-box; }
  .tc-root h1,.tc-root h2,.tc-root p { margin:0; padding:0; }
  .font-serif { font-family: 'Cormorant Garamond', serif; }
  .font-geist { font-family: 'Geist', sans-serif; }

  @keyframes spin-tc { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .spin-tc { animation: spin-tc 0.8s linear infinite; }

  /* ── Sidebar ── */
  .tc-sidebar {
    position:fixed; top:0; left:0; height:100%; width:220px;
    background:#fff; border-right:1px solid #EAE6E1;
    display:flex; flex-direction:column; z-index:50;
    transition:transform 0.2s ease;
  }
  .tc-sidebar.closed { transform:translateX(-100%); }
  @media(min-width:1024px){ .tc-sidebar{ transform:translateX(0)!important; } }

  .tc-sidebar-header { padding:28px 22px 20px; border-bottom:1px solid #EAE6E1; flex-shrink:0; }
  .tc-sidebar-logo { font-family:'Cormorant Garamond',serif; font-size:17px; font-weight:300; color:#1A1816; letter-spacing:0.04em; line-height:1.2; }
  .tc-sidebar-logo em { font-style:italic; color:#8A7D6E; }
  .tc-sidebar-sub { font-family:'Geist',sans-serif; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:#C8BFB5; margin-top:4px; display:block; }

  .tc-nav { flex:1; padding:16px 10px; display:flex; flex-direction:column; gap:2px; overflow-y:auto; }
  .tc-nav-label { font-family:'Geist',sans-serif; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:#D4CFC9; padding:8px 12px 6px; display:block; }
  .tc-nav-link { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:7px; font-family:'Geist',sans-serif; font-size:13px; color:#9E9890; text-decoration:none; transition:all 0.15s; white-space:nowrap; }
  .tc-nav-link:hover { background:#F4F1ED; color:#3D3830; }
  .tc-nav-link.active { background:#1A1816; color:#F9F7F4; }
  .tc-nav-link.active svg { stroke:#F9F7F4; }

  .tc-sidebar-footer { padding:16px 22px; border-top:1px solid #EAE6E1; flex-shrink:0; display:flex; align-items:center; gap:8px; }
  .tc-status-dot { width:6px; height:6px; border-radius:50%; background:#5DBF8A; flex-shrink:0; }
  .tc-status-text { font-family:'Geist',sans-serif; font-size:11px; color:#C8BFB5; letter-spacing:0.04em; }

  .tc-overlay { position:fixed; inset:0; background:rgba(26,24,22,0.25); z-index:40; backdrop-filter:blur(2px); }

  /* ── Topbar ── */
  .tc-topbar { position:sticky; top:0; z-index:30; height:60px; background:#fff; border-bottom:1px solid #EAE6E1; padding:0 24px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
  .tc-breadcrumb { display:flex; align-items:center; gap:8px; font-family:'Geist',sans-serif; font-size:12px; color:#C8BFB5; letter-spacing:0.04em; }
  .tc-breadcrumb-sep { color:#E2DDD8; }
  .tc-breadcrumb-current { color:#3D3830; font-weight:500; }
  .tc-breadcrumb-btn { color:#C8BFB5; background:transparent; border:none; cursor:pointer; font-family:'Geist',sans-serif; font-size:12px; letter-spacing:0.04em; transition:color 0.15s; padding:0; }
  .tc-breadcrumb-btn:hover { color:#3D3830; }
  .tc-badge-count { font-family:'Geist',sans-serif; font-size:11px; color:#9E9890; letter-spacing:0.05em; padding:4px 12px; border:1px solid #EAE6E1; border-radius:100px; background:#F9F7F4; }
  .tc-hamburger { display:flex; flex-direction:column; justify-content:center; gap:5px; padding:4px; cursor:pointer; background:none; border:none; }
  .tc-hamburger span { width:18px; height:1px; background:#9E9890; display:block; }
  @media(min-width:1024px){ .tc-hamburger{ display:none; } }

  /* ── Content ── */
  .tc-content { padding:36px 24px 80px; width:100%; max-width:1100px; margin:0 auto; }
  @media(min-width:640px){ .tc-content{ padding:40px 32px 80px; } }
  @media(min-width:1024px){ .tc-content{ padding:48px 40px 80px; } }

  .tc-page-title { font-family:'Cormorant Garamond',serif; font-size:34px; font-weight:300; color:#1A1816; letter-spacing:-0.01em; line-height:1.1; margin-bottom:6px; }
  .tc-page-title em { font-style:italic; color:#8A7D6E; }
  .tc-page-sub { font-family:'Geist',sans-serif; font-size:11px; color:#C8BFB5; letter-spacing:0.14em; text-transform:uppercase; margin-bottom:36px; }

  /* ── Section label ── */
  .tc-section-label { font-family:'Geist',sans-serif; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:#C8BFB5; margin-bottom:14px; display:block; }

  /* ── Tag cards (step 1) ── */
  .tc-tag-card { background:#fff; border:1.5px solid #EAE6E1; border-radius:10px; padding:18px 20px; text-align:left; cursor:pointer; transition:all 0.15s; width:100%; }
  .tc-tag-card:hover { border-color:#C8BFB5; background:#FAFAF8; }
  .tc-tag-name { font-family:'Geist',sans-serif; font-size:13px; font-weight:500; color:#1A1816; letter-spacing:0.02em; margin-bottom:4px; text-transform:capitalize; }
  .tc-tag-count { font-family:'Geist',sans-serif; font-size:10px; color:#C8BFB5; letter-spacing:0.08em; text-transform:uppercase; }

  /* ── Empty state ── */
  .tc-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:64px 20px; background:#fff; border:1.5px dashed #EAE6E1; border-radius:10px; }
  .tc-empty-text { font-family:'Geist',sans-serif; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#D4CFC9; margin-top:14px; }

  /* ── Spinner ── */
  .tc-spinner { width:26px; height:26px; border:1.5px solid #EAE6E1; border-top-color:#1A1816; border-radius:50%; }

  /* ── Back button ── */
  .tc-back { display:flex; align-items:center; gap:8px; font-family:'Geist',sans-serif; font-size:11px; color:#9E9890; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:28px; cursor:pointer; background:transparent; border:none; transition:color 0.15s; }
  .tc-back:hover { color:#3D3830; }

  /* ── Current cover ── */
  .tc-current-label { font-family:'Geist',sans-serif; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:#C8BFB5; margin-bottom:12px; display:block; }
  .tc-current-wrap { position:relative; aspect-ratio:16/9; width:100%; max-width:480px; overflow:hidden; border-radius:10px; border:1.5px solid #EAE6E1; margin-bottom:36px; }
  .tc-current-badge { position:absolute; bottom:10px; left:14px; font-family:'Geist',sans-serif; font-size:9px; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.7); background:rgba(26,24,22,0.5); padding:3px 8px; border-radius:3px; }

  /* ── Photo grid ── */
  .tc-photo-item { position:relative; aspect-ratio:1; overflow:hidden; border-radius:8px; cursor:pointer; transition:all 0.15s; border:2px solid #EAE6E1; }
  .tc-photo-item:hover { border-color:#C8BFB5; }
  .tc-photo-item.selected { border-color:#1A1816; box-shadow:0 0 0 2px rgba(26,24,22,0.12); }

  .tc-check { position:absolute; top:8px; right:8px; width:20px; height:20px; background:#1A1816; border-radius:50%; display:flex; align-items:center; justify-content:center; }

  .tc-current-overlay { position:absolute; bottom:0; left:0; right:0; background:rgba(26,24,22,0.55); padding:5px 8px; }
  .tc-current-overlay-text { font-family:'Geist',sans-serif; font-size:9px; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.65); }

  /* ── Save bar ── */
  .tc-save-bar { display:flex; align-items:center; justify-content:flex-end; margin-top:32px; padding-top:24px; border-top:1px solid #EAE6E1; gap:16px; }
  .tc-selected-hint { font-family:'Geist',sans-serif; font-size:11px; color:#9E9890; letter-spacing:0.04em; margin-right:auto; }
  .tc-btn-save { display:flex; align-items:center; gap:8px; background:#1A1816; color:#F9F7F4; border:none; border-radius:8px; padding:13px 22px; font-family:'Geist',sans-serif; font-size:11px; font-weight:400; letter-spacing:0.1em; text-transform:uppercase; cursor:pointer; transition:background 0.15s; }
  .tc-btn-save:hover { background:#2D2A26; }
  .tc-btn-save:disabled { opacity:0.35; cursor:not-allowed; }
`;

export default function AdminTagCoverPage() {
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentCover, setCurrentCover] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const snapshot = await getDocs(collection(db, "photos"));
        const tagCount = new Map<string, number>();
        snapshot.docs.forEach((d) => {
          (d.data() as Photo).tags.forEach((tag) => tagCount.set(tag, (tagCount.get(tag) || 0) + 1));
        });
        setTags(Array.from(tagCount.entries()).map(([tag, count]) => ({ tag, count })).sort((a, b) => a.tag.localeCompare(b.tag)));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchTags();
  }, []);

  const loadPhotosForTag = async (tag: string) => {
    setSelectedTag(tag); setPhotos([]); setLoadingPhotos(true); setSelectedImage(null);
    try {
      const q = query(collection(db, "photos"), where("tags", "array-contains", tag));
      const snapshot = await getDocs(q);
      setPhotos(snapshot.docs.map((d) => ({ ...(d.data() as Photo), id: d.id })));
      const tagDoc = await getDoc(doc(db, "tagTexts", tag));
      setCurrentCover(tagDoc.exists() ? tagDoc.data().mainImage || null : null);
    } catch (e) { console.error(e); }
    finally { setLoadingPhotos(false); }
  };

  const handleSave = async () => {
    if (!selectedImage || !selectedTag) return alert("Choisis une image !");
    setSaving(true);
    try {
      const tagRef = doc(db, "tagTexts", selectedTag);
      const oldDoc = await getDoc(tagRef);
      await setDoc(tagRef, {
        ...(oldDoc.exists() ? oldDoc.data() : {}),
        tag: selectedTag,
        title: selectedTag.replaceAll("-", " "),
        mainImage: selectedImage,
        updatedAt: new Date(),
      });
      setCurrentCover(selectedImage);
      setSelectedImage(null);
    } catch (e) { console.error(e); alert("Erreur de sauvegarde."); }
    finally { setSaving(false); }
  };

  const navLinks = [
    { href: "/admin", label: "Upload", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> },
    { href: "/admin/portal", label: "Portails", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg> },
    { href: "/admin/texts", label: "Textes", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
    { href: "/admin/home-image", label: "Page d'accueil", icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  ];

  return (
    <>
      <style>{globalStyles}</style>

      <div className="tc-root font-geist" style={{ background: "#F9F7F4", minHeight: "100vh", color: "#1A1816" }}>

        {/* Mobile overlay */}
        {sidebarOpen && <div className="tc-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* ── Sidebar ── */}
        <aside className={`tc-sidebar${sidebarOpen ? "" : " closed"}`}>
          <div className="tc-sidebar-header">
            <div className="tc-sidebar-logo">Vadim <em>Thevelin</em></div>
            <span className="tc-sidebar-sub">Administration</span>
          </div>
          <nav className="tc-nav">
            <span className="tc-nav-label">Navigation</span>
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setSidebarOpen(false)} className="tc-nav-link">
                {l.icon}{l.label}
              </Link>
            ))}
            <Link href="/admin/tag-cover" onClick={() => setSidebarOpen(false)} className="tc-nav-link active">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
              Tag Cover
            </Link>
          </nav>
          <div className="tc-sidebar-footer">
            <span className="tc-status-dot" />
            <span className="tc-status-text">Système opérationnel</span>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="lg:ml-[220px] min-h-screen flex flex-col">

          {/* Topbar */}
          <div className="tc-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="tc-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
                <span /><span /><span />
              </button>
              <div className="tc-breadcrumb">
                <span>Admin</span>
                <span className="tc-breadcrumb-sep">/</span>
                {selectedTag ? (
                  <>
                    <button onClick={() => { setSelectedTag(null); setPhotos([]); }} className="tc-breadcrumb-btn">
                      Tag Cover
                    </button>
                    <span className="tc-breadcrumb-sep">/</span>
                    <span className="tc-breadcrumb-current" style={{ textTransform: "capitalize" }}>
                      {selectedTag.replaceAll("-", " ")}
                    </span>
                  </>
                ) : (
                  <span className="tc-breadcrumb-current">Tag Cover</span>
                )}
              </div>
            </div>
            <span className="tc-badge-count">{tags.length} tag{tags.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Content */}
          <div className="tc-content">

            <h1 className="tc-page-title">
              {selectedTag
                ? <><em style={{ fontStyle: "normal", color: "#1A1816" }}>{selectedTag.replaceAll("-", " ")}</em></>
                : <>Tag <em>Cover</em></>
              }
            </h1>
            <p className="tc-page-sub">
              {selectedTag ? "Sélectionner une image principale" : "Associer une image de couverture à chaque tag"}
            </p>

            {/* ── Loading ── */}
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
                <div className="tc-spinner spin-tc" />
              </div>

            /* ── Step 1: tag list ── */
            ) : !selectedTag ? (
              tags.length === 0 ? (
                <div className="tc-empty">
                  <svg style={{ width: 32, height: 32, stroke: "#D4CFC9" }} fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <p className="tc-empty-text">Aucun tag trouvé</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                  {tags.map((t) => (
                    <button
                      key={t.tag}
                      onClick={() => loadPhotosForTag(t.tag)}
                      className="tc-tag-card"
                    >
                      <p className="tc-tag-name">{t.tag.replaceAll("-", " ")}</p>
                      <p className="tc-tag-count">{t.count} photo{t.count !== 1 ? "s" : ""}</p>
                    </button>
                  ))}
                </div>
              )

            /* ── Step 2: image picker ── */
            ) : (
              <div>
                <button onClick={() => { setSelectedTag(null); setPhotos([]); }} className="tc-back">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Tous les tags
                </button>

                {/* Current cover */}
                {currentCover && (
                  <div style={{ marginBottom: 36 }}>
                    <span className="tc-current-label">Image principale actuelle</span>
                    <div className="tc-current-wrap">
                      <Image src={currentCover} alt="Cover actuelle" fill className="object-cover" />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,24,22,0.35) 0%, transparent 60%)" }} />
                      <span className="tc-current-badge">Actuelle</span>
                    </div>
                  </div>
                )}

                {/* Photo grid */}
                {loadingPhotos ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "56px 0" }}>
                    <div className="tc-spinner spin-tc" />
                  </div>
                ) : photos.length === 0 ? (
                  <div className="tc-empty">
                    <svg style={{ width: 32, height: 32, stroke: "#D4CFC9" }} fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    <p className="tc-empty-text">Aucune image pour ce tag</p>
                  </div>
                ) : (
                  <>
                    <span className="tc-section-label">{photos.length} image{photos.length !== 1 ? "s" : ""} disponibles</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                      {photos.map((photo) => {
                        const isSelected = selectedImage === photo.url;
                        const isCurrent = currentCover === photo.url;
                        return (
                          <div
                            key={photo.id}
                            onClick={() => setSelectedImage(photo.url)}
                            className={`tc-photo-item${isSelected ? " selected" : ""}`}
                          >
                            <Image
                              src={photo.thumbnailUrl || photo.url}
                              alt={photo.description || ""}
                              fill
                              sizes="(max-width:640px) 50vw, 160px"
                              style={{ objectFit: "cover", opacity: isSelected ? 1 : 0.85, transition: "opacity 0.15s" }}
                            />
                            {isSelected && (
                              <div className="tc-check">
                                <svg width="10" height="10" fill="none" stroke="#F9F7F4" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                            {isCurrent && !isSelected && (
                              <div className="tc-current-overlay">
                                <span className="tc-current-overlay-text">Actuelle</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Save bar */}
                    <div className="tc-save-bar">
                      {selectedImage && (
                        <span className="tc-selected-hint">1 image sélectionnée</span>
                      )}
                      <button
                        onClick={handleSave}
                        disabled={!selectedImage || saving}
                        className="tc-btn-save"
                      >
                        {saving ? (
                          <>
                            <svg className="spin-tc" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Sauvegarde...
                          </>
                        ) : (
                          <>
                            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Définir comme image principale
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}