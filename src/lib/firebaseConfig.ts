import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, Timestamp, getDoc } from "firebase/firestore";
import { getStorage, ref } from "firebase/storage";

// Firebase config — these are NEXT_PUBLIC_ vars, so they're bundled into the
// client. That's expected for Firebase web config (it's not a secret; access
// is controlled by Firebase Security Rules, not by hiding these values).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// getApps()/getApp() guard avoids "Firebase App named '[DEFAULT]' already
// exists" during Next.js hot reload / multiple client-component imports.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);
const firestore = getFirestore(app);

export {
  auth,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
  updateProfile,
  db,
  Timestamp,
  getDoc,
  GoogleAuthProvider,
  storage,
  ref,
  firestore,
};
