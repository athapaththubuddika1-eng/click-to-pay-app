import { db, ref, set, get, child } from "./firebase.js";

document.getElementById("registerBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Referral code from Telegram link
  const params = new URLSearchParams(window.location.search);
  const referredBy = params.get("start") || null;

  const refCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const userRef = ref(db, "users/" + email.replace(/\./g, "_"));

  await set(userRef, {
    username,
    email,
    password,
    balance: 0.0,
    refCode,
    referredBy
  });

  alert("✅ Account created!");
  localStorage.setItem("currentUser", email);
  window.location.href = "dashboard.html";
});
