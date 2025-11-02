// scripts/generate-thumbnails.js
import fs from "fs";
import sharp from "sharp";
import fetch from "node-fetch";
import admin from "firebase-admin";

// 1️⃣ Initialisation du SDK Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert("./serviceAccountKey.json"),
    storageBucket: "vath-portofolio.firebasestorage.app", // <-- à adapter exactement à ton bucket
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function generateThumbnails() {
  const photosSnap = await db.collection("photos").get();

  for (const photoDoc of photosSnap.docs) {
    const data = photoDoc.data();
    const originalUrl = data.url;

    if (!originalUrl) {
      console.log(`⏭️ No URL for ${photoDoc.id}`);
      continue;
    }

    try {
      // 2️⃣ Télécharger l'image originale
      const response = await fetch(originalUrl);
      const buffer = Buffer.from(await response.arrayBuffer());

      // 3️⃣ Créer miniatures et versions intermédiaires
      const thumbBuffer = await sharp(buffer)
        .resize(200, null, { withoutEnlargement: true })
        .jpeg({ quality: 60 })
        .toBuffer();

      const mediumBuffer = await sharp(buffer)
        .resize(800, null, { withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toBuffer();

      // 4️⃣ Upload sur Firebase Storage
      const thumbPath = `thumbnails/${photoDoc.id}_thumb.jpg`;
      const mediumPath = `medium/${photoDoc.id}_medium.jpg`;

      await bucket.file(thumbPath).save(thumbBuffer, {
        contentType: "image/jpeg",
        metadata: { cacheControl: "public, max-age=31536000" },
      });
      await bucket.file(mediumPath).save(mediumBuffer, {
        contentType: "image/jpeg",
        metadata: { cacheControl: "public, max-age=31536000" },
      });

      // 5️⃣ Obtenir les URLs publiques
      const [thumbUrl] = await bucket.file(thumbPath).getSignedUrl({
        action: "read",
        expires: "2125-01-01",
      });
      const [mediumUrl] = await bucket.file(mediumPath).getSignedUrl({
        action: "read",
        expires: "2125-01-01",
      });

      // 6️⃣ Mettre à jour Firestore
      await db.collection("photos").doc(photoDoc.id).update({
        thumbnailUrl: thumbUrl,
        mediumUrl: mediumUrl,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Processed: ${photoDoc.id}`);
    } catch (error) {
      console.error(`❌ Error processing ${photoDoc.id}:`, error);
    }
  }

  console.log("🎉 All done!");
}

generateThumbnails();
