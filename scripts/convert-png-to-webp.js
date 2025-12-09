import admin from "firebase-admin";
import fs from "fs";

// =====================================
// CONFIG
// =====================================
const BUCKET = "vath-portofolio.firebasestorage.app";
const COLLECTION = "photos";

// =====================================
// INIT FIREBASE ADMIN
// =====================================
const serviceAccount = JSON.parse(
  fs.readFileSync("serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// =====================================
// HELPERS
// =====================================

// Convertit n'importe quelle URL Storage → URL Firebase publique
function toFirebasePublicUrl(originalUrl) {
  if (!originalUrl) return null;

  // Déjà correcte → on ne touche pas
  if (originalUrl.includes("firebasestorage.googleapis.com")) {
    return originalUrl;
  }

  // Extrait le path depuis une URL storage.googleapis.com
  const match = originalUrl.match(
    /storage\.googleapis\.com\/[^/]+\/(.+?)(\?|$)/
  );

  if (!match) return originalUrl;

  const objectPath = decodeURIComponent(match[1]);
  const encodedPath = encodeURIComponent(objectPath);

  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodedPath}?alt=media`;
}

// =====================================
// MAIN
// =====================================
async function migrate() {
  console.log(`🚀 Migration Firestore → ${COLLECTION}`);
  const snapshot = await db.collection(COLLECTION).get();

  let updatedCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    let changed = false;

    const updatedFields = {};

    for (const field of ["url", "mediumUrl", "thumbnailUrl"]) {
      if (typeof data[field] === "string") {
        const fixed = toFirebasePublicUrl(data[field]);
        if (fixed !== data[field]) {
          updatedFields[field] = fixed;
          changed = true;
        }
      }
    }

    if (changed) {
      await doc.ref.update(updatedFields);
      updatedCount++;
      console.log(`✅ ${doc.id} mis à jour`);
    }
  }

  console.log(`🎉 Terminé : ${updatedCount} documents corrigés`);
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Erreur critique :", err);
    process.exit(1);
  });
