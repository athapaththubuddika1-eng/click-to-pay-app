// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

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

export { app, auth, db };
