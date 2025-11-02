"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

interface TagData {
  id: string;
  tag: string;
  title: string;
  mainImage: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function PhotosPage() {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const snapshot = await getDocs(collection(db, "tagTexts"));
        const tagData: TagData[] = snapshot.docs.map((doc) => {
        const data = doc.data() as Partial<TagData>;
        const tag = data.tag ?? doc.id;

        const parseToDate = (
          val: unknown
        ): Date => {
          if (!val) return new Date();

          if (val instanceof Date) return val;

          // Firestore Timestamp has a toDate() method
          if (typeof val === "object" && val !== null && "toDate" in val) {
            const v = val as { toDate: () => Date };
            return v.toDate();
          }

          if (typeof val === "number" || typeof val === "string") {
            return new Date(val);
          }

          return new Date();
        };

          return {
            id: doc.id,
            tag: tag,
            title: data.title || tag.replaceAll("-", " "),
            mainImage: data.mainImage || "/default-placeholder.jpg",
            createdAt: parseToDate(data.createdAt),
            updatedAt: parseToDate(data.updatedAt),
          };
        });
        setTags(tagData);
      } catch (error) {
        console.error("Erreur lors du chargement des tags:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

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
    <>
      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/acid-grotesk');
        * {
          font-family: 'Acid Grotesk', sans-serif;
        }

        .collection-card {
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .collection-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            transparent 0%,
            rgba(0, 0, 0, 0.15) 50%,
            rgba(0, 0, 0, 0.35) 100%
          );
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 1;
        }

        .collection-card:hover::before {
          opacity: 1;
        }

        .collection-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .collection-image {
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .collection-card:hover .collection-image {
          transform: scale(1.08);
        }

        .collection-text {
          transform: translateY(8px);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .collection-card:hover .collection-text {
          transform: translateY(0);
          opacity: 1;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>

      <div className="min-h-screen bg-white pt-24 pb-16">
        <main className="px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            {tags.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {tags.map((tagItem, index) => (
                  <Link
                    key={tagItem.id}
                    href={`/photo/${tagItem.tag}`}
                    className="collection-card fade-in"
                    style={{
                      animationDelay: `${index * 0.08}s`,
                      aspectRatio: "4/3",
                    }}
                  >
                    <div className="relative w-full h-full bg-black">
                      <Image
                        src={tagItem.mainImage}
                        alt={tagItem.title}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="collection-image object-cover"
                        quality={85}
                        priority={index < 8}
                      />

                      <div className="absolute inset-0 flex flex-col items-center justify-center hover:bg-black/80 z-10 p-4 transition-colors duration-300">
                        <div className="collection-text text-center">
                          <h3
                            className="text-sm md:text-base font-bold uppercase text-white mb-1 tracking-tight"
                            style={{
                              textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                              fontWeight: 800,
                              fontSize: "1.5rem",
                            }}
                          >
                            {tagItem.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24">
                <p className="text-gray-400 text-base uppercase tracking-wider text-center font-light">
                  Aucune photo disponible
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
