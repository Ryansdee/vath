"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  date: Date;
  readTime: number; // en minutes
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "blog"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as BlogPost));
        setPosts(data.sort((a, b) => b.date.getTime() - a.date.getTime()));
      } catch (error) {
        console.error("Erreur lors du chargement du blog:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const categories = Array.from(new Set(posts.map(p => p.category)));
  const filteredPosts = selectedCategory 
    ? posts.filter(p => p.category === selectedCategory)
    : posts;

  if (loading) {
    return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-blue-700 text-sm font-light uppercase tracking-wider">
          Loading...
        </p>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="pt-24 pb-12 md:pt-32 md:pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-center text-black mb-4">
            Blog
          </h1>
          <p className="text-center text-zinc-500 text-sm md:text-base uppercase tracking-wider mb-8">
            {filteredPosts.length} {filteredPosts.length > 1 ? 'Articles' : 'Article'}
          </p>

          {/* Filtres catégories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 text-xs uppercase tracking-wider font-bold transition-colors duration-200 ${
                  selectedCategory === null
                    ? 'bg-black text-white'
                    : 'border-2 border-black text-black hover:bg-black hover:text-white'
                }`}
              >
                Tous
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs uppercase tracking-wider font-bold transition-colors duration-200 ${
                    selectedCategory === cat
                      ? 'bg-black text-white'
                      : 'border-2 border-black text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 md:gap-4">
            <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-black to-transparent opacity-20"></div>
          </div>
        </div>
      </div>

      {/* Grid d'articles */}
      <div className="px-4 md:px-6 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] mb-4 border-4 border-black group-hover:border-zinc-400 transition-all duration-300 overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      quality={85}
                    />
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">
                      {new Date(post.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="text-xs text-zinc-400">•</span>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">
                      {post.readTime} min
                    </span>
                    <span className="text-xs text-zinc-400">•</span>
                    <span className="text-xs text-black font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>

                  {/* Titre */}
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-black mb-3 group-hover:text-zinc-600 transition-colors duration-300">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-sm md:text-base text-zinc-600 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Lire plus */}
                  <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-black group-hover:gap-4 transition-all duration-300">
                    <span>Lire plus</span>
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-20 h-20 border-4 border-zinc-300 flex items-center justify-center mb-8">
                <span className="text-3xl text-zinc-400 font-black">∅</span>
              </div>
              <p className="text-zinc-600 text-base uppercase tracking-wider">Aucun article disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}