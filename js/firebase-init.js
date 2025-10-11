// js/firebase-init.js
// Use Firebase modular via CDN imports inside a module script.
// This file exports helpers to interact with Firebase.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmKgh8-ckZFy_9-VlvcHD_sNxejKeS3pA",
  authDomain: "adsclickpay-b4870.firebaseapp.com",
  projectId: "adsclickpay-b4870",
  storageBucket: "adsclickpay-b4870.firebasestorage.app",
  messagingSenderId: "315468866481",
  appId: "1:315468866481:web:3ab95661be3939b8d7d390",
  measurementId: "G-3ZZ9K97QWJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, onAuthStateChanged, signOut };
