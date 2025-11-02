import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert("./serviceAccountKey.json"),
  });
}

const db = admin.firestore();

async function fixUrls() {
  const snap = await db.collection("photos").get();
  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.url.includes("%252F")) {
      const fixed = data.url.replaceAll("%252F", "%2F");
      await db.collection("photos").doc(doc.id).update({ url: fixed });
      console.log("✅ fixed:", doc.id);
    }
  }
  console.log("🎉 Done!");
}

fixUrls();
