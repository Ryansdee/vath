// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth, type User } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (évite la double initialisation)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ✨ Fonction helper pour récupérer le user avec token refresh
export const getCurrentUser = async (): Promise<User | null> => {
  const user = auth.currentUser;
  if (user) {
    try {
      await user.getIdToken(true); // Force refresh token
      return user;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return user;
    }
  }
  return null;
};

// ⚠️ Pour obtenir le user synchrone (sans token refresh)
export const getUser = () => auth.currentUser;

export default app;