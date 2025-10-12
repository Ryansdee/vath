"use client";

import { useState, useEffect } from "react";
import { db, storage } from "../../../../lib/firebase";
import { collection, getDocs, doc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";

interface PortalFile {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video' | 'file';
  size: number;
}

interface Portal {
  id: string;
  clientName: string;
  clientEmail: string;
  projectName: string;
  files: PortalFile[];
  createdAt: Timestamp;
}

export default function AdminPortalUpload() {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [selectedPortal, setSelectedPortal] = useState<Portal | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortals();
  }, []);

  const fetchPortals = async () => {
    try {
      const snapshot = await getDocs(collection(db, "portals"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Portal[];
      setPortals(data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    } catch (error) {
      console.error("Error fetching portals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !selectedPortal) return;

    const files = Array.from(event.target.files);
    setUploading(true);
    setUploadProgress([]);

    try {
      for (const file of files) {
        const fileName = `${selectedPortal.id}/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, `portals/${fileName}`);
        
        setUploadProgress(prev => [...prev, `Uploading ${file.name}...`]);
        
        // Upload le fichier
        await uploadBytes(storageRef, file);
        
        // Récupérer l'URL de téléchargement
        const downloadURL = await getDownloadURL(storageRef);
        
        // Déterminer le type de fichier
        const fileType: 'image' | 'video' | 'file' = file.type.startsWith('image/') ? 'image' : 
                        file.type.startsWith('video/') ? 'video' : 'file';
        
        // Ajouter le fichier au portail dans Firestore
        const portalRef = doc(db, "portals", selectedPortal.id);
        await updateDoc(portalRef, {
          files: arrayUnion({
            id: Date.now().toString(),
            url: downloadURL,
            name: file.name,
            type: fileType,
            size: file.size
          })
        });
        
        setUploadProgress(prev => [...prev, `✓ ${file.name} uploaded`]);
      }

      alert(`Successfully uploaded ${files.length} file(s)!`);
      
      // Rafraîchir la liste des portails
      await fetchPortals();
      
      // Re-sélectionner le portail pour voir les nouveaux fichiers
      const updatedPortal = portals.find(p => p.id === selectedPortal.id);
      if (updatedPortal) {
        setSelectedPortal(updatedPortal);
      }
      
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error uploading files. Check console for details.");
    } finally {
      setUploading(false);
      setUploadProgress([]);
    }
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
            Loading...
          </p>
        </div>
      </div>
    );
  }

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
              Admin - Portal Management
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Upload files to client portals
            </p>
            <a href="/admin" className="text-md text-black">&#8592; Go back </a>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 md:px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Liste des portails */}
              <div className="lg:col-span-1">
                <h2 className="text-sm uppercase tracking-[0.15em] font-light text-black mb-4">
                  Client Portals ({portals.length})
                </h2>
                
                <div className="space-y-2">
                  {portals.map((portal) => (
                    <button
                      key={portal.id}
                      onClick={() => setSelectedPortal(portal)}
                      className={`w-full text-left p-4 border transition-all ${
                        selectedPortal?.id === portal.id
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <p className="text-sm font-light text-black mb-1">
                        {portal.clientName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {portal.clientEmail}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {portal.files?.length || 0} files
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Zone d'upload */}
              <div className="lg:col-span-2">
                {selectedPortal ? (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-lg font-light uppercase tracking-[0.15em] text-black mb-2">
                        {selectedPortal.clientName}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {selectedPortal.clientEmail}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Portal ID: <span className="font-mono">{selectedPortal.id}</span>
                      </p>
                    </div>

                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 p-8 text-center mb-6">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="text-4xl mb-4">📤</div>
                        <p className="text-sm uppercase tracking-[0.15em] font-light text-black mb-2">
                          {uploading ? 'Uploading...' : 'Click to upload files'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Images and videos supported
                        </p>
                      </label>
                    </div>

                    {/* Upload Progress */}
                    {uploadProgress.length > 0 && (
                      <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
                        <h3 className="text-xs uppercase tracking-[0.15em] font-light text-black mb-2">
                          Upload Progress
                        </h3>
                        <div className="space-y-1">
                          {uploadProgress.map((msg, i) => (
                            <p key={i} className="text-xs text-gray-600">
                              {msg}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Files Grid */}
                    <div>
                      <h3 className="text-sm uppercase tracking-[0.15em] font-light text-black mb-4">
                        Files ({selectedPortal.files?.length || 0})
                      </h3>
                      
                      {selectedPortal.files?.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedPortal.files.map((file: PortalFile) => (
                            <div key={file.id} className="border border-gray-200 p-2">
                              {file.type === 'image' ? (
                                <div className="relative aspect-square bg-gray-100 mb-2">
                                  <Image
                                    src={file.url}
                                    alt={file.name}
                                    fill
                                    className="object-cover"
                                    sizes="200px"
                                  />
                                </div>
                              ) : (
                                <div className="aspect-square bg-gray-900 flex items-center justify-center mb-2">
                                  <span className="text-2xl">🎬</span>
                                </div>
                              )}
                              <p className="text-xs text-gray-600 truncate">
                                {file.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-8">
                          No files uploaded yet
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-gray-400 uppercase tracking-wider">
                      Select a portal to upload files
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}