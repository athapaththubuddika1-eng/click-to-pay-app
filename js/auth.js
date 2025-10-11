// js/auth.js
import { db } from "./firebase.js";
import { ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  await set(ref(db, "users/" + username), {
    email,
    password,
    balance: 0,
    referrals: 0,
    tasksDone: [],
  });

  alert("🎉 Registered successfully!");
  window.location.href = "login.html";
});

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const snapshot = await get(ref(db, "users/" + username));
  if (snapshot.exists() && snapshot.val().password === password) {
    localStorage.setItem("currentUser", username);
    alert("✅ Login successful!");
    window.location.href = "dashboard.html";
  } else {
    alert("❌ Invalid credentials");
  }
});
