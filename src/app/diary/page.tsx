"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  image?: string;
  date: Date;
  location?: string;
}

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const snapshot = await getDocs(collection(db, "diary"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as DiaryEntry));
        setEntries(data.sort((a, b) => b.date.getTime() - a.date.getTime()));
      } catch (error) {
        console.error("Erreur lors du chargement du diary:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-zinc-300 border-t-black animate-spin"></div>
          <p className="text-zinc-600 text-sm uppercase tracking-wider">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="pt-24 pb-12 md:pt-32 md:pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-center text-black mb-4">
            Diary
          </h1>
          <p className="text-center text-zinc-500 text-sm md:text-base uppercase tracking-wider mb-6">
            {entries.length} {entries.length > 1 ? 'Entrées' : 'Entrée'}
          </p>
          <div className="flex items-center justify-center gap-3 md:gap-4">
            <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-black to-transparent opacity-20"></div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 md:px-6 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto">
          {entries.length > 0 ? (
            <div className="space-y-12 md:space-y-16">
              {entries.map((entry, index) => (
                <article key={entry.id} className="relative">
                  {/* Date badge */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="border-4 border-black px-4 py-2 bg-white">
                      <time className="text-sm md:text-base font-black uppercase tracking-tight">
                        {new Date(entry.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </time>
                    </div>
                    {entry.location && (
                      <span className="text-xs md:text-sm text-zinc-500 uppercase tracking-wider">
                        📍 {entry.location}
                      </span>
                    )}
                  </div>

                  {/* Image si présente */}
                  {entry.image && (
                    <div className="mb-6 border-4 border-black overflow-hidden">
                      <Image
                        src={entry.image}
                        alt={entry.title}
                        width={1200}
                        height={600}
                        className="w-full h-64 md:h-96 object-cover"
                        quality={90}
                      />
                    </div>
                  )}

                  {/* Contenu */}
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black mb-4">
                    {entry.title}
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-base md:text-lg text-zinc-700 leading-relaxed whitespace-pre-line">
                      {entry.content}
                    </p>
                  </div>

                  {/* Séparateur */}
                  {index < entries.length - 1 && (
                    <div className="mt-12 md:mt-16 flex items-center justify-center gap-4">
                      <div className="h-px w-16 bg-black opacity-20"></div>
                      <div className="w-2 h-2 border border-black opacity-30"></div>
                      <div className="h-px w-16 bg-black opacity-20"></div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-20 h-20 border-4 border-zinc-300 flex items-center justify-center mb-8">
                <span className="text-3xl text-zinc-400 font-black">∅</span>
              </div>
              <p className="text-zinc-600 text-base uppercase tracking-wider">Aucune entrée disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}