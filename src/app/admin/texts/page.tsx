"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../lib/firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";
import Link from "next/link";

interface TagText {
  id: string;
  tag: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminTextsPage() {
  const [tagTexts, setTagTexts] = useState<TagText[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    tag: "",
    title: "",
    content: ""
  });

  // Charger les textes
  useEffect(() => {
    fetchTagTexts();
  }, []);

  const fetchTagTexts = async () => {
    try {
      const q = query(collection(db, "tagTexts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const texts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as TagText[];
      setTagTexts(texts);
    } catch (error) {
      console.error("Error fetching texts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Ajouter ou modifier
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tag.trim() || !formData.content.trim()) {
      alert("Tag and content are required");
      return;
    }

    try {
      if (editingId) {
        // Modification
        await updateDoc(doc(db, "tagTexts", editingId), {
          ...formData,
          updatedAt: new Date()
        });
        alert("✓ Text updated");
      } else {
        // Ajout
        await addDoc(collection(db, "tagTexts"), {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        alert("✓ Text added");
      }
      
      setFormData({ tag: "", title: "", content: "" });
      setEditingId(null);
      fetchTagTexts();
    } catch (error) {
      console.error("Error:", error);
      alert("✗ Error");
    }
  };

  // Éditer
  const handleEdit = (text: TagText) => {
    setFormData({
      tag: text.tag,
      title: text.title,
      content: text.content
    });
    setEditingId(text.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Supprimer
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this text?")) return;
    
    try {
      await deleteDoc(doc(db, "tagTexts", id));
      alert("✓ Text deleted");
      fetchTagTexts();
    } catch (error) {
      console.error("Error:", error);
      alert("✗ Error");
    }
  };

  // Annuler l'édition
  const handleCancel = () => {
    setFormData({ tag: "", title: "", content: "" });
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="pt-32 pb-16 px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Admin
          </Link>
          
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-3 tracking-tight">
            Tag Texts
          </h1>
          <p className="text-gray-500 text-sm">
            Add introspections and descriptions for your tags
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Formulaire */}
          <div className="bg-gray-50 p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-black mb-6">
              {editingId ? "Edit Text" : "Add New Text"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag *
                </label>
                <input
                  type="text"
                  placeholder="FWP, DAMSO, portrait..."
                  value={formData.tag}
                  onChange={(e) => setFormData({...formData, tag: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (optional)
                </label>
                <input
                  type="text"
                  placeholder="Title of the introspection..."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  placeholder="Write your text or introspection here..."
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors resize-none text-gray-900"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-3 font-semibold hover:bg-gray-800 transition-colors"
                >
                  {editingId ? "Update Text" : "Add Text"}
                </button>
                
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Liste des textes */}
          <div>
            <h2 className="text-2xl font-bold text-black mb-6">
              Existing Texts ({tagTexts.length})
            </h2>
            
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                Loading...
              </div>
            ) : tagTexts.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border border-gray-200 bg-gray-50">
                No texts yet. Add your first one above.
              </div>
            ) : (
              <div className="space-y-4">
                {tagTexts.map((text) => (
                  <div 
                    key={text.id} 
                    className="bg-white border border-gray-200 p-6 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="inline-block px-3 py-1 bg-black text-white text-xs font-medium mb-2">
                          {text.tag}
                        </span>
                        {text.title && (
                          <h3 className="text-xl font-bold text-gray-900 mt-2">
                            {text.title}
                          </h3>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(text)}
                          className="p-2 text-gray-600 hover:text-black transition-colors"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(text.id)}
                          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {text.content}
                    </p>
                    
                    <div className="mt-4 text-xs text-gray-400">
                      Updated {text.updatedAt.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}