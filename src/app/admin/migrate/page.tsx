"use client";

import { useState } from "react";
import { db } from "../../../../lib/firebase";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";

export default function AdminMigratePage() {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<{
    total: number;
    success: number;
    errors: number;
  } | null>(null);

  const handleMigration = async () => {
    if (!confirm("Are you sure you want to migrate all 'personal-project' to 'diary'?")) {
      return;
    }

    setMigrating(true);
    setResult(null);

    try {
      // Récupérer tous les documents avec category "personal-project"
      const photosRef = collection(db, "photos");
      const q = query(photosRef, where("category", "==", "personal-project"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("No documents found with category 'personal-project'");
        setMigrating(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // Mettre à jour chaque document
      for (const docSnapshot of snapshot.docs) {
        try {
          const docRef = doc(db, "photos", docSnapshot.id);
          await updateDoc(docRef, {
            category: "diary"
          });
          successCount++;
        } catch (error) {
          console.error(`Error migrating ${docSnapshot.id}:`, error);
          errorCount++;
        }
      }

      setResult({
        total: snapshot.size,
        success: successCount,
        errors: errorCount,
      });

      alert(`Migration completed!\n✓ Success: ${successCount}\n✗ Errors: ${errorCount}`);
      
    } catch (error) {
      console.error("Migration failed:", error);
      alert("Migration failed. Check console for details.");
    } finally {
      setMigrating(false);
    }
  };

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
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-light uppercase tracking-[0.2em] text-black mb-2">
              Category Migration
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Migrate personal-project → diary
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 md:px-6 py-12">
          <div className="max-w-4xl mx-auto">
            
            {/* Warning Box */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 uppercase tracking-wider">
                    Warning
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>This action will update ALL photos with category "personal-project" to "diary".</p>
                    <p className="mt-1">This operation cannot be undone automatically.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Migration Info */}
            <div className="bg-gray-50 border border-gray-200 p-6 mb-8">
              <h2 className="text-sm uppercase tracking-[0.15em] font-light text-black mb-4">
                Migration Details
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">From:</span>
                  <span className="font-mono text-red-600">personal-project</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-mono text-green-600">diary</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Collection:</span>
                  <span className="font-mono">photos</span>
                </div>
              </div>
            </div>

            {/* Migration Button */}
            <button
              onClick={handleMigration}
              disabled={migrating}
              className="w-full bg-black text-white py-4 font-light text-xs uppercase tracking-[0.15em] hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {migrating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                  Migrating...
                </span>
              ) : (
                "Start Migration"
              )}
            </button>

            {/* Results */}
            {result && (
              <div className="mt-8 bg-white border-2 border-black p-6">
                <h3 className="text-sm uppercase tracking-[0.15em] font-light text-black mb-4">
                  Migration Results
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50">
                    <div className="text-2xl font-bold text-black mb-1">
                      {result.total}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-gray-600">
                      Total
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {result.success}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-green-600">
                      Success
                    </div>
                  </div>
                  <div className="text-center p-4 bg-red-50">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      {result.errors}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-red-600">
                      Errors
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Back Link */}
            <div className="mt-8 text-center">
              <a
                href="/admin"
                className="text-xs uppercase tracking-[0.15em] text-gray-600 hover:text-black transition-colors"
              >
                ← Back to Admin
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}