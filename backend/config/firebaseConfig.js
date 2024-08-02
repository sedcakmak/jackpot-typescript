import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  increment,
  query,
  where,
} from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

console.log("Firebase Config:", JSON.stringify(firebaseConfig, null, 2));

let app;
let db;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig, "BACKEND_APP");
    console.log("Firebase app initialized successfully");
  } else {
    app = getApps()[0];
    console.log("Using existing Firebase app");
  }

  db = getFirestore(app);
  console.log("Firestore initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export {
  db,
  app,
  collection,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  increment,
  query,
  where,
};
