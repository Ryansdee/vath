// scripts/migrate-category.ts
import { db } from "../lib/firebase";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";

async function migratePersonalProjectToDiary() {
  console.log("🔄 Starting migration: personal-project → diary");
  
  try {
    // Récupérer tous les documents avec category "personal-project"
    const photosRef = collection(db, "photos");
    const q = query(photosRef, where("category", "==", "personal-project"));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log("✓ No documents found with category 'personal-project'");
      return;
    }

    console.log(`📦 Found ${snapshot.size} document(s) to migrate`);
    
    let successCount = 0;
    let errorCount = 0;

    // Mettre à jour chaque document
    for (const docSnapshot of snapshot.docs) {
      try {
        const docRef = doc(db, "photos", docSnapshot.id);
        await updateDoc(docRef, {
          category: "diary"
        });
        console.log(`✓ Migrated: ${docSnapshot.id}`);
        successCount++;
      } catch (error) {
        console.error(`✗ Error migrating ${docSnapshot.id}:`, error);
        errorCount++;
      }
    }

    console.log("\n📊 Migration Summary:");
    console.log(`✓ Successfully migrated: ${successCount}`);
    console.log(`✗ Errors: ${errorCount}`);
    console.log(`📦 Total processed: ${snapshot.size}`);
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Exécuter la migration
migratePersonalProjectToDiary()
  .then(() => {
    console.log("\n✅ Migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed with error:", error);
    process.exit(1);
  });