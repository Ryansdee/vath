import { config } from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

// Charger les variables d'environnement
config({ path: ".env.local" });

// Vérifier que les variables sont chargées
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.error("❌ Erreur : Les variables d'environnement ne sont pas chargées.");
  console.error("Assurez-vous que le fichier .env.local existe à la racine du projet.");
  process.exit(1);
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log(`🔗 Connexion au projet Firebase : ${firebaseConfig.projectId}\n`);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migratePhotosCategory() {
  console.log("🚀 Début de la migration...\n");

  try {
    // Récupérer tous les documents de la collection "photos"
    const photosSnapshot = await getDocs(collection(db, "photos"));
    
    let updatedCount = 0;
    let skippedCount = 0;

    console.log(`📊 Nombre total de photos trouvées : ${photosSnapshot.size}\n`);

    // Parcourir chaque document
    for (const photoDoc of photosSnapshot.docs) {
      const data = photoDoc.data();
      
      // Si le champ "category" n'existe pas
      if (!data.category) {
        await updateDoc(doc(db, "photos", photoDoc.id), {
          category: "photo"
        });
        
        updatedCount++;
        console.log(`✅ Photo mise à jour : ${photoDoc.id} → category: "photo"`);
      } else {
        skippedCount++;
        console.log(`⏭️  Photo ignorée (category existe déjà) : ${photoDoc.id} → category: "${data.category}"`);
      }
    }

    console.log("\n✨ Migration terminée !");
    console.log(`📈 Photos mises à jour : ${updatedCount}`);
    console.log(`⏭️  Photos ignorées : ${skippedCount}`);
    
  } catch (error) {
    console.error("❌ Erreur lors de la migration :", error);
  }

  process.exit(0);
}

// Exécuter la migration
migratePhotosCategory();