import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBmKgh8-ckZFy_9-VlvcHD_sNxejKeS3pA",
  authDomain: "adsclickpay-b4870.firebaseapp.com",
  projectId: "adsclickpay-b4870",
  storageBucket: "adsclickpay-b4870.appspot.com",
  messagingSenderId: "315468866481",
  appId: "1:315468866481:web:3ab95661be3939b8d7d390"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 🌟 Utility function for messages
function showMessage(msg, type = "success") {
  const box = document.getElementById("messageBox");
  box.textContent = msg;
  box.className = type === "success" ? "success" : "error";
  box.style.display = "block";
  setTimeout(() => (box.style.display = "none"), 4000);
}

// 📝 Register Function
const regForm = document.getElementById("registerForm");
if (regForm) {
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    try {
      const userRef = ref(db, "users/" + btoa(email));
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        showMessage("⚠️ Email already exists!", "error");
      } else {
        await set(userRef, { email, password, balance: 0 });
        showMessage("✅ Registration Successful! Please log in.");
        setTimeout(() => (window.location.href = "login.html"), 2000);
      }
    } catch (err) {
      showMessage("❌ Error: " + err.message, "error");
    }
  });
}

// 🔑 Login Function
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    try {
      const userRef = ref(db, "users/" + btoa(email));
      const snapshot = await get(userRef);
      if (snapshot.exists() && snapshot.val().password === password) {
        showMessage("🎉 Welcome back!", "success");
        localStorage.setItem("userEmail", email);
        setTimeout(() => (window.location.href = "dashboard.html"), 2000);
      } else {
        showMessage("⚠️ Invalid email or password!", "error");
      }
    } catch (err) {
      showMessage("❌ " + err.message, "error");
    }
  });
}
