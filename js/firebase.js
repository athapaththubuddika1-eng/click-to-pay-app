// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, get, update, child, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmKgh8-ckZFy_9-VlvcHD_sNxejKeS3pA",
  authDomain: "adsclickpay-b4870.firebaseapp.com",
  databaseURL: "https://adsclickpay-b4870-default-rtdb.firebaseio.com",
  projectId: "adsclickpay-b4870",
  storageBucket: "adsclickpay-b4870.appspot.com",
  messagingSenderId: "315468866481",
  appId: "1:315468866481:web:3ab95661be3939b8d7d390",
  measurementId: "G-3ZZ9K97QWJ"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, set, get, update, child, onValue };
