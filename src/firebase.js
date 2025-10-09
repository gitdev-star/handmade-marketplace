// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyYWdl00SLLFL24GZGzObx4S16zxo1eC0",
  authDomain: "handmade-marketplace-58a2b.firebaseapp.com",
  projectId: "handmade-marketplace-58a2b",
  storageBucket: "handmade-marketplace-58a2b.appspot.com",
  messagingSenderId: "540132134687",
  appId: "1:540132134687:web:1d1da164c2f60ff1c2ea2a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
