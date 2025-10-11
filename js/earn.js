// js/earn.js
import { db } from "./firebase.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const username = localStorage.getItem("currentUser");

async function rewardUser(amount) {
  const userRef = ref(db, "users/" + username);
  const snapshot = await get(userRef);
  if (snapshot.exists()) {
    const currentBalance = snapshot.val().balance || 0;
    await update(userRef, { balance: currentBalance + amount });
  }
}

// Watch Ads
document.getElementById("watchAdsBtn")?.addEventListener("click", () => {
  const adsUrl = "https://www.effectivegatecpm.com/dnm2jrcaj?key=c73c264e4447410ce55eb32960238eaa";
  window.open(adsUrl, "_blank");
  setTimeout(() => {
    rewardUser(0.00015);
    alert("✅ Ads watched, $0.00015 added!");
  }, 5000);
});

// Captcha
document.getElementById("captchaForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const answer = document.getElementById("captchaInput").value;
  const correct = document.getElementById("captchaText").textContent;
  if (answer === correct) {
    const adsUrl = "https://www.effectivegatecpm.com/dnm2jrcaj?key=c73c264e4447410ce55eb32960238eaa";
    window.open(adsUrl, "_blank");
    setTimeout(() => {
      rewardUser(0.0002);
      alert("🎯 Captcha complete, $0.0002 added!");
    }, 5000);
  } else {
    alert("❌ Wrong captcha!");
  }
});
