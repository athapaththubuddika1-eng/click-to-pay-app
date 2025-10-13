// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmKgh8-ckZFy_9-VlvcHD_sNxejKeS3pA",
  authDomain: "adsclickpay-b4870.firebaseapp.com",
  databaseURL: "https://adsclickpay-b4870-default-rtdb.firebaseio.com",
  projectId: "adsclickpay-b4870",
  storageBucket: "adsclickpay-b4870.appspot.com",
  messagingSenderId: "315468866481",
  appId: "1:315468866481:web:3ab95661be3939b8d7d390"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };
