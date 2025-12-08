import admin from "firebase-admin";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

// -------------------------------
// 🔥 INITIALISATION FIREBASE
// -------------------------------
admin.initializeApp({
  credential: admin.credential.cert("./serviceAccountKey.json"),
  storageBucket: "vath-portofolio.firebasestorage.app"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();


// -------------------------------------------------------
// 🔄 FONCTION : remplacer .jpg/.JPG/.jpeg/.JPEG/.png/.PNG par .webp dans Firestore
// -------------------------------------------------------
/**
 * Remplace récursivement les extensions d'image (jpg, jpeg, png) par .webp, insensible à la casse.
 * @param {*} data - La donnée à inspecter (String, Array, Object).
 * @returns {*} La donnée avec les extensions mises à jour.
 */
function replaceExtensionsDeep(data) {
  // Expression régulière pour .jpg, .jpeg, ou .png (insensible à la casse 'i')
  const imageExtensionRegex = /\.(jpe?g|png)$/i;

  if (typeof data === "string") {
    // Remplace l'extension correspondante par .webp
    return data.replace(imageExtensionRegex, ".webp");
  }

  if (Array.isArray(data)) {
    return data.map(item => replaceExtensionsDeep(item));
  }

  if (data && typeof data === "object" && data !== null) {
    const out = {};
    for (const key in data) {
      // S'assurer que la clé appartient à l'objet (pas un prototype)
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        out[key] = replaceExtensionsDeep(data[key]);
      }
    }
    return out;
  }

  return data;
}


// -------------------------------------------------------
// 🔄 Parcourir récursivement toutes les collections Firestore
// -------------------------------------------------------
async function updateFirestoreCollection(path) {
  const collectionRef = db.collection(path);
  // Utilisation d'une transaction pour un traitement plus sûr
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(collectionRef);
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const updated = replaceExtensionsDeep(data);

      if (JSON.stringify(data) !== JSON.stringify(updated)) {
        console.log(`📝 Firestore mis à jour : ${path}/${doc.id}`);
        // Utiliser la transaction pour la mise à jour
        transaction.update(doc.ref, updated);
      }

      // Sous-collections
      // NOTE: Les transactions ne supportent pas listCollections. On repasse en mode normal ici.
      // L'approche ci-dessous est conservée pour la récursivité, même si l'idéal serait de séparer
      // la logique de transaction et la logique de parcours récursif.
      const subCollections = await doc.ref.listCollections();
      for (const sub of subCollections) {
        await updateFirestoreCollection(`${path}/${doc.id}/${sub.id}`);
      }
    }
  });
}


// -------------------------------------------------------
// 🔧 Fonction Windows-safe pour supprimer un fichier
// -------------------------------------------------------
async function safeUnlink(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    // Ignorer si le fichier n'existe pas (Enoent)
    if (err.code === "ENOENT") return; 

    // Gérer les erreurs de permission (EPERM) en réessayant
    if (err.code === "EPERM") {
      for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 100 + i * 150));
        try {
          await fs.unlink(filePath);
          return;
        } catch (retryErr) {
          if (retryErr.code !== "EPERM") throw retryErr;
        }
      }
      console.warn("⚠️ Impossible de supprimer après plusieurs tentatives:", filePath);
      return; // Évite de lancer une erreur fatale
    }
    
    throw err;
  }
}


// -------------------------------------------------------
// 🖼️ Conversion Storage : JPG/PNG → WEBP
// -------------------------------------------------------
async function convertStorageImages() {
  console.log("📸 Scan du dossier /photos dans Firebase Storage…");

  // Regex pour vérifier et capturer l'extension (insensible à la casse)
  const fileExtensionCheck = /\.(jpe?g|png)$/i;
  const [files] = await bucket.getFiles({ prefix: "photos/" });

  for (const file of files) {
    const name = file.name;

    // Condition pour n'inclure que les fichiers JPG, JPEG, ou PNG
    if (!fileExtensionCheck.test(name)) continue;

    // Remplacer l'extension originale par une chaîne vide, insensible à la casse
    const base = name.replace(fileExtensionCheck, ""); 

    // On utilise un chemin temporaire pour le fichier original
    const tempInput = path.join(process.cwd(), `tmp_input_${path.basename(name)}`);
    // On utilise un chemin temporaire pour le fichier WebP converti
    const tempOutput = path.join(process.cwd(), `tmp_output_${path.basename(base)}.webp`);

    console.log(`➡️ Conversion Storage : ${name}`);

    try {
      // Télécharger l’original
      await file.download({ destination: tempInput });

      // Conversion en WebP
      await sharp(tempInput)
        .webp({ quality: 80 })
        .toFile(tempOutput);

      // Upload WebP
      await bucket.upload(tempOutput, {
        destination: `${base}.webp`, // Utilise le chemin sans l'ancienne extension
        metadata: { contentType: "image/webp" }
      });

      // Supprimer l'ancien
      await file.delete();

      console.log(`✅ ${name} → ${base}.webp`);
    } catch (error) {
      console.error(`❌ Échec de la conversion pour ${name}:`, error.message);
    } finally {
      // Nettoyage local (doit être fait même en cas d'erreur)
      await safeUnlink(tempInput);
      await safeUnlink(tempOutput);
    }
  }

  console.log("🏁 Storage Converti !");
}


// -------------------------------------------------------
// 🚀 EXÉCUTION GLOBALE
// -------------------------------------------------------
async function run() {
  console.log("🔎 Mise à jour Firestore (jpg/jpeg/png → webp)…");

  const rootCollections = await db.listCollections();
  for (const col of rootCollections) {
    await updateFirestoreCollection(col.id);
  }

  console.log("🎉 Firestore mis à jour !");
  
 

  console.log("🔧 Conversion Storage…");
  await convertStorageImages();

  console.log("🏆 Tout est terminé !");
}

run().catch(error => {
  console.error("Une erreur fatale est survenue durant l'exécution:", error);
  process.exit(1);
});