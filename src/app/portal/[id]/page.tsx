"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

interface PortalFile {
  id: string;
  url: string;
  name: string;
  type: "image" | "video";
  size?: number;
}

interface PortalData {
  clientName: string;
  clientEmail: string;
  files: PortalFile[];
  expiresAt?: Date;
  createdAt: Date;
  portalCode: string; // ✅ Ajout du code
}

export default function PortalPage() {
  const params = useParams();
  const portalId = params.id as string;

  const [portal, setPortal] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<PortalFile | null>(null);
  
  // ✅ États pour l'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");

  useEffect(() => {
    const fetchPortal = async () => {
      try {
        const portalDoc = await getDoc(doc(db, "portals", portalId));
        if (!portalDoc.exists()) {
          setError("Portal not found or expired");
          return;
        }

        const data = portalDoc.data() as PortalData;

        // Vérifier l'expiration
        if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
          setError("This portal has expired");
          return;
        }

        // Ajouter les paramètres de téléchargement
        const filesWithDownload = data.files.map((file) => {
          const finalUrl = file.url.includes("?")
            ? `${file.url}&alt=media&dl=1`
            : `${file.url}?alt=media&dl=1`;
          return { ...file, url: finalUrl };
        });

        setPortal({ ...data, files: filesWithDownload });
      } catch (err) {
        console.error("Error fetching portal:", err);
        setError("Error loading portal");
      } finally {
        setLoading(false);
      }
    };

    if (portalId) fetchPortal();
  }, [portalId]);

  // ✅ Fonction pour vérifier le code
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!portal) return;
    
    if (codeInput.toUpperCase() === portal.portalCode.toUpperCase()) {
      setIsAuthenticated(true);
      setCodeError("");
    } else {
      setCodeError("Invalid access code. Please try again.");
      setCodeInput("");
    }
  };

  const handleDownload = async (file: PortalFile) => {
    try {
      const apiUrl = `/api/download?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.name)}`;
      const link = document.createElement("a");
      link.href = apiUrl;
      link.setAttribute("download", file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleDownloadAll = async () => {
    if (!portal) return;

    const filesParam = encodeURIComponent(JSON.stringify(
      portal.files.map((f) => ({ url: f.url, name: f.name }))
    ));

    const zipUrl = `/api/download-zip?files=${filesParam}`;

    const link = document.createElement("a");
    link.href = zipUrl;
    link.setAttribute("download", "portal-files.zip");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-black text-sm font-light uppercase tracking-wider">
            Loading Portal...
          </p>
        </div>
      </div>
    );
  }

  if (error || !portal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-light uppercase tracking-[0.2em] text-black mb-4">
            Portal Not Found
          </h1>
          <p className="text-sm text-gray-600 font-light mb-8">
            {error || "This portal doesn't exist or has been removed."}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 border border-black text-black text-xs uppercase tracking-[0.15em] font-light hover:bg-black hover:text-white transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Écran de vérification du code
  if (!isAuthenticated) {
    return (
      <>
        <style jsx global>{`
          @import url('https://fonts.cdnfonts.com/css/acid-grotesk');
          * {
            font-family: 'Acid Grotesk', sans-serif;
          }
        `}</style>

        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-light uppercase tracking-[0.2em] text-black mb-2">
                Access Portal
              </h1>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Enter your access code
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 text-center text-2xl tracking-[0.3em] uppercase font-light focus:outline-none focus:border-black transition-colors"
                  required
                />
                {codeError && (
                  <p className="mt-2 text-xs text-red-600 text-center font-light">
                    {codeError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-black text-white text-xs uppercase tracking-[0.15em] font-light hover:bg-gray-800 transition-all"
              >
                Access Portal
              </button>
            </form>

            <p className="mt-6 text-xs text-center text-gray-500 font-light">
              Check your email for the access code
            </p>
          </div>
        </div>
      </>
    );
  }

  // ✅ Contenu du portail (après authentification)
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/acid-grotesk');
        * {
          font-family: 'Acid Grotesk', sans-serif;
        }
      `}</style>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="pt-24 pb-12 px-4 md:px-6 border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-light uppercase tracking-[0.2em] text-black mb-2">
              Your Portal
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Welcome, {portal.clientName}
            </p>
          </div>
        </header>

        {/* Files Section */}
        <main className="px-4 md:px-6 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="text-xs uppercase tracking-[0.15em] text-gray-600 font-light">
                {portal.files.length}{" "}
                {portal.files.length === 1 ? "file" : "files"} available
              </div>

              <button
                onClick={handleDownloadAll}
                className="px-6 py-2.5 bg-black text-white text-xs uppercase tracking-[0.15em] font-light hover:bg-gray-800 transition-all"
              >
                Download All
              </button>
            </div>

            {/* Files Grid */}
            {portal.files.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {portal.files.map((file) => (
                  <div
                    key={file.id}
                    className="group cursor-pointer"
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="relative aspect-square bg-gray-100 overflow-hidden mb-2">
                      {file.type === "image" ? (
                        <Image
                          src={file.url}
                          alt={file.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-black">
                          <span className="text-4xl">🎬</span>
                        </div>
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(file);
                          }}
                          className="opacity-0 group-hover:opacity-100 px-4 py-2 border border-white text-white text-[10px] uppercase tracking-wider font-light transition-opacity"
                        >
                          Download
                        </button>
                      </div>
                    </div>

                    <p className="text-[10px] uppercase tracking-wider text-gray-600 font-light truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-400 text-sm uppercase tracking-wider">
                  No files available yet
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Modal Preview */}
        {selectedFile && (
          <div
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedFile(null)}
          >
            <button
              className="absolute top-8 right-8 text-white text-3xl font-light hover:text-gray-400 transition-colors z-10"
              onClick={() => setSelectedFile(null)}
            >
              ×
            </button>

            <div
              className="w-full max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedFile.type === "image" ? (
                <div className="relative w-full aspect-video">
                  <Image
                    src={selectedFile.url}
                    alt={selectedFile.name}
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                </div>
              ) : (
                <video
                  src={selectedFile.url}
                  controls
                  className="w-full aspect-video bg-black"
                />
              )}

              <div className="mt-6 flex justify-between items-center">
                <p className="text-white text-xs uppercase tracking-wider font-light">
                  {selectedFile.name}
                </p>
                <button
                  onClick={() => handleDownload(selectedFile)}
                  className="px-6 py-2 border border-white text-white text-xs uppercase tracking-wider font-light hover:bg-white hover:text-black transition-all"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}