// js/firebase.js
// Exports: dbRef helpers for Realtime Database
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, set, get, update, onValue, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Replace databaseURL with your project's Realtime DB URL (provided below)
const firebaseConfig = {
  apiKey: "AIzaSyBmKgh8-ckZFy_9-VlvcHD_sNxejKeS3pA",
  authDomain: "adsclickpay-b4870.firebaseapp.com",
  databaseURL: "https://adsclickpay-b4870-default-rtdb.firebaseio.com",
  projectId: "adsclickpay-b4870",
  storageBucket: "adsclickpay-b4870.firebasestorage.app",
  messagingSenderId: "315468866481",
  appId: "1:315468866481:web:3ab95661be3939b8d7d390",
  measurementId: "G-3ZZ9K97QWJ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, push, set, get, update, onValue, child };
