"use client";

import { useEffect, useState, useCallback } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

/* =========================
   TYPES
========================= */

type FirestoreDate = Date | Timestamp | null | undefined;

interface TagData {
  id: string;
  tag: string;
  title: string;
  mainImage: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TagTextFirestore {
  tag?: string;
  title?: string;
  mainImage?: string;
  createdAt?: FirestoreDate;
  updatedAt?: FirestoreDate;
}

/* =========================
   UTILS
========================= */

const normalizeToWebp = (url?: string): string => {
  if (!url) return "/default-placeholder.jpg";
  return url.replace(/\.jpe?g|\.png/gi, ".webp");
};

const parseFirestoreDate = (val: FirestoreDate): Date => {
  if (val instanceof Date) return val;
  if (val && typeof val === "object" && "toDate" in val) {
    return (val as Timestamp).toDate();
  }
  return new Date(0);
};

const sortTags = (tags: TagData[]): TagData[] =>
  [...tags].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

/* =========================
   CARD
========================= */

interface PhotoCardProps {
  tagItem: TagData;
  index: number;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ tagItem, index }) => (
  <Link
    href={`/photo/${tagItem.tag}`}
    className="group relative block w-full aspect-[4/3] overflow-hidden rounded-lg shadow-lg transition hover:shadow-2xl hover:-translate-y-1 fade-in"
    style={{ animationDelay: `${index * 0.08}s` }}
  >
    <Image
      src={tagItem.mainImage}
      alt={tagItem.title}
      fill
      sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw"
      className="object-cover transition-transform duration-500 group-hover:scale-110"
      priority={index < 8}
    />

    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/70 transition flex items-center justify-center">
      <div className="text-center opacity-0 group-hover:opacity-100 transition">
        <h3 className="text-2xl font-extrabold uppercase text-white">
          {tagItem.title}
        </h3>
        <span className="mt-2 inline-block text-xs text-gray-300 border rounded-full px-3 py-1 uppercase">
          Show photos
        </span>
      </div>
    </div>
  </Link>
);

/* =========================
   PAGE
========================= */

export default function PhotosPage() {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, "tagTexts"));

      const parsed: TagData[] = snapshot.docs.map((doc) => {
        const data = doc.data() as TagTextFirestore;

        const tag = data.tag ?? doc.id;
        const title = data.title ?? tag.replaceAll("-", " ");

        const createdAt = parseFirestoreDate(data.createdAt);
        const updatedAt = parseFirestoreDate(data.updatedAt) || createdAt;

        return {
          id: doc.id,
          tag,
          title,
          mainImage: normalizeToWebp(data.mainImage),
          createdAt,
          updatedAt,
        };
      });

      setTags(sortTags(parsed));
    } catch (err) {
      console.error("Erreur chargement tags :", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {tags.map((tag, i) => (
          <PhotoCard key={tag.id} tagItem={tag} index={i} />
        ))}
      </div>
    </div>
  );
}
