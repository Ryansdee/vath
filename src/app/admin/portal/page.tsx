"use client";

import { useState, useEffect } from "react";
import { db, storage } from "../../../../lib/firebase";
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";
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
  expiresAt?: Timestamp;
  portalCode: string;
}

export default function AdminPortalUpload() {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [selectedPortal, setSelectedPortal] = useState<Portal | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<PortalFile | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<PortalFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // États pour créer un nouveau portal
  const [showCreatePortal, setShowCreatePortal] = useState(false);
  const [newPortalName, setNewPortalName] = useState("");
  const [newPortalEmail, setNewPortalEmail] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  
  // État pour supprimer un portal
  const [showDeletePortalConfirm, setShowDeletePortalConfirm] = useState(false);
  const [portalToDelete, setPortalToDelete] = useState<Portal | null>(null);
  const [deletingPortal, setDeletingPortal] = useState(false);

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

  const handleCreatePortal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPortalName || !newPortalEmail || !newProjectName) {
      alert("Please fill in all fields");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/portal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: newPortalName,
          clientEmail: newPortalEmail,
          projectName: newProjectName,
          expiresInDays: 30,
          delayEmailMs: 300000, // 5 min
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `Portal created successfully!\n` +
          `Access Code: ${data.portalCode}\n` +
          `Email will be sent to ${newPortalEmail} in 5 minutes.\n\n` +
          `Portal URL: ${data.portalUrl}`
        );
        setNewPortalName("");
        setNewPortalEmail("");
        setNewProjectName("");
        setShowCreatePortal(false);
        await fetchPortals();
      } else {
        alert(`Error: ${data.error || 'Failed to create portal'}`);
      }
    } catch (error) {
      console.error("Error creating portal:", error);
      alert("Error creating portal. Check console for details.");
    } finally {
      setCreating(false);
    }
  };


  const handleDeletePortal = async (portal: Portal) => {
    setDeletingPortal(true);
    try {
      // Supprimer tous les fichiers du Storage
      if (portal.files && portal.files.length > 0) {
        for (const file of portal.files) {
          try {
            const url = new URL(file.url);
            const encodedPath = url.pathname.split('/o/')[1];
            const filePath = decodeURIComponent(encodedPath);
            const storageRef = ref(storage, filePath);
            await deleteObject(storageRef);
          } catch (err) {
            console.warn(`Could not delete file ${file.name}:`, err);
          }
        }
      }

      // Supprimer le dossier du portal dans Storage
      try {
        const folderRef = ref(storage, `portals/${portal.id}`);
        const fileList = await listAll(folderRef);
        await Promise.all(fileList.items.map(item => deleteObject(item)));
      } catch (err) {
        console.warn("Could not delete portal folder:", err);
      }

      // Supprimer le document Firestore
      await deleteDoc(doc(db, "portals", portal.id));

      alert(`Portal "${portal.projectName}" deleted successfully!`);
      
      // Si c'était le portal sélectionné, le déselectionner
      if (selectedPortal?.id === portal.id) {
        setSelectedPortal(null);
      }
      
      await fetchPortals();
      
    } catch (error) {
      console.error("Error deleting portal:", error);
      alert("Error deleting portal. Check console for details.");
    } finally {
      setDeletingPortal(false);
      setShowDeletePortalConfirm(false);
      setPortalToDelete(null);
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
        
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        const fileType: 'image' | 'video' | 'file' = file.type.startsWith('image/') ? 'image' : 
                        file.type.startsWith('video/') ? 'video' : 'file';
        
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
      await refreshPortalData();
      
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error uploading files. Check console for details.");
    } finally {
      setUploading(false);
      setUploadProgress([]);
    }
  };

  const handleDeleteFile = async (file: PortalFile) => {
    if (!selectedPortal) return;

    setDeleting(true);
    try {
      const url = new URL(file.url);
      const encodedPath = url.pathname.split('/o/')[1];
      const filePath = decodeURIComponent(encodedPath);
      
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);

      const portalRef = doc(db, "portals", selectedPortal.id);
      await updateDoc(portalRef, {
        files: arrayRemove(file)
      });

      alert(`File "${file.name}" deleted successfully!`);
      await refreshPortalData();
      
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file. Check console for details.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setFileToDelete(null);
    }
  };

  const handleRenameFile = async (file: PortalFile) => {
    if (!selectedPortal) return;

    const newName = prompt("Enter new file name:", file.name);
    if (!newName || newName === file.name) return;

    try {
      const portalRef = doc(db, "portals", selectedPortal.id);
      
      await updateDoc(portalRef, {
        files: arrayRemove(file)
      });

      await updateDoc(portalRef, {
        files: arrayUnion({
          ...file,
          name: newName
        })
      });

      alert(`File renamed to "${newName}" successfully!`);
      await refreshPortalData();
      
    } catch (error) {
      console.error("Error renaming file:", error);
      alert("Error renaming file. Check console for details.");
    }
  };

  const refreshPortalData = async () => {
    await fetchPortals();
    
    if (selectedPortal) {
      const updatedPortals = await getDocs(collection(db, "portals"));
      const updatedData = updatedPortals.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Portal[];
      const refreshedPortal = updatedData.find(p => p.id === selectedPortal.id);
      if (refreshedPortal) {
        setSelectedPortal(refreshedPortal);
        setPortals(updatedData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
      }
    }
  };

  const confirmDelete = (file: PortalFile) => {
    setFileToDelete(file);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePortal = (portal: Portal) => {
    setPortalToDelete(portal);
    setShowDeletePortalConfirm(true);
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="pt-12 pb-12 px-4 md:px-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-light uppercase tracking-[0.2em] text-black mb-2">
                Portal Management
              </h1>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">
                Create, manage, and delete client portals
              </p>
              <a href="/admin" className="text-md text-black hover:text-gray-600 transition-colors">
                &#8592; Go back
              </a>
            </div>
            
            <button
              onClick={() => setShowCreatePortal(true)}
              className="px-6 py-3 bg-black text-white text-xs uppercase tracking-[0.15em] font-light hover:bg-gray-800 transition-all"
            >
              + New Portal
            </button>
          </div>
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
                  <div
                    key={portal.id}
                    className={`border transition-all ${
                      selectedPortal?.id === portal.id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedPortal(portal)}
                      className="w-full text-left p-4"
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
                    
                    <div className="px-4 pb-4 flex gap-2">
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/portal/${portal.id}`;
                          navigator.clipboard.writeText(url);
                        }}
                        className="flex-1 px-3 py-1.5 text-[10px] uppercase tracking-wider border border-gray-300 text-gray-600 hover:border-black hover:text-black transition-colors"
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => confirmDeletePortal(portal)}
                        className="flex-1 px-3 py-1.5 text-[10px] uppercase tracking-wider border border-red-400 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Delete Portal
                      </button>
                    </div>
                  </div>
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
                    <button className="text-xs text-gray-500 underline mt-1 hover:cursor-pointer"
                    title={` ${selectedPortal.portalCode} `}
                    onClick={()=>{
                      navigator.clipboard.writeText(selectedPortal.portalCode);
                    }}>
                      COPY PORTAL CODE
                    </button>
                  </div>

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 p-8 text-center mb-6 hover:border-gray-400 transition-colors">
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
                          <div key={file.id} className="group relative border border-gray-200 p-2 hover:border-gray-400 transition-colors">
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
                            
                            <p className="text-xs text-gray-600 truncate mb-2">
                              {file.name}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedFile(file)}
                                className="flex-1 px-2 py-1 text-[10px] uppercase tracking-wider bg-black text-white hover:bg-gray-800 transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleRenameFile(file)}
                                className="flex-1 px-2 py-1 text-[10px] uppercase tracking-wider border border-gray-400 text-gray-700 hover:border-black hover:text-black transition-colors"
                              >
                                Rename
                              </button>
                              <button
                                onClick={() => confirmDelete(file)}
                                className="flex-1 px-2 py-1 text-[10px] uppercase tracking-wider border border-red-400 text-red-600 hover:bg-red-50 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
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
                    Select a portal to manage files
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Portal Modal */}
      {showCreatePortal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 max-w-md w-full">
            <h3 className="text-xl font-light uppercase tracking-[0.15em] text-black mb-6">
              Create New Portal
            </h3>
            
            <form onSubmit={handleCreatePortal} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  value={newPortalName}
                  onChange={(e) => setNewPortalName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
                  Client Email
                </label>
                <input
                  type="email"
                  value={newPortalEmail}
                  onChange={(e) => setNewPortalEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none"
                  required
                />
              </div>
              
              <p className="text-xs text-gray-500 italic">
                * Email will be sent to the client in 5 minutes
              </p>
              
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreatePortal(false);
                    setNewPortalName("");
                    setNewPortalEmail("");
                    setNewProjectName("");
                  }}
                  disabled={creating}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 text-xs uppercase tracking-wider hover:border-black hover:text-black transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-6 py-3 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Portal Confirmation Modal */}
      {showDeletePortalConfirm && portalToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 max-w-md w-full">
            <h3 className="text-xl font-light uppercase tracking-[0.15em] text-black mb-4">
              Delete Portal
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Are you sure you want to delete the portal for <strong>{portalToDelete.clientName}</strong>?
            </p>
            <p className="text-sm text-red-600 mb-6">
              This will delete all {portalToDelete.files?.length || 0} files and cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeletePortalConfirm(false);
                  setPortalToDelete(null);
                }}
                disabled={deletingPortal}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 text-xs uppercase tracking-wider hover:border-black hover:text-black transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePortal(portalToDelete)}
                disabled={deletingPortal}
                className="flex-1 px-6 py-3 bg-red-600 text-white text-xs uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deletingPortal ? 'Deleting...' : 'Delete Portal'}
              </button>
            </div>
          </div>
        </div>
      )}

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
          
          <div className="w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
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
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    handleRenameFile(selectedFile);
                    setSelectedFile(null);
                  }}
                  className="px-6 py-2 border border-white text-white text-xs uppercase tracking-wider font-light hover:bg-white hover:text-black transition-all"
                >
                  Rename
                </button>
                <button
                  onClick={() => {
                    confirmDelete(selectedFile);
                    setSelectedFile(null);
                  }}
                  className="px-6 py-2 border border-red-500 text-red-500 text-xs uppercase tracking-wider font-light hover:bg-red-500 hover:text-white transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete File Confirmation Modal */}
      {showDeleteConfirm && fileToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 max-w-md w-full">
            <h3 className="text-xl font-light uppercase tracking-[0.15em] text-black mb-4">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong>{fileToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setFileToDelete(null);
                }}
                disabled={deleting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 text-xs uppercase tracking-wider hover:border-black hover:text-black transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFile(fileToDelete)}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-red-600 text-white text-xs uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}