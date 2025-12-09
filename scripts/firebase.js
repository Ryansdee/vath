// scripts/firebase.js
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Résolution des chemins en mode ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lecture du fichier serviceAccountKey.json manuellement (évite assert)
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./serviceAccountKey.json"), "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "vath-portofolio.firebasestorage.app",
});

export const db = admin.firestore();
export const bucket = admin.storage().bucket();
