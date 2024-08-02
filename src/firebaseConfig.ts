// firebaseConfig.ts

import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  increment,
  query,
  where,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

console.log("Firebase Config:", JSON.stringify(firebaseConfig, null, 2));

let app: FirebaseApp;
let db: Firestore;

try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized successfully");

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
  doc,
  updateDoc,
  getDoc,
  getDocs,
  increment,
  query,
  where,
};
