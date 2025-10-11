import { db, ref, get, update, onValue } from "./firebase.js";

const BOT_USERNAME = "adsclickpaybot";
const REWARD_PER_REFERRAL = 0.0005;

const currentEmail = localStorage.getItem("currentUser");
const userRef = ref(db, "users/" + currentEmail.replace(/\./g, "_"));

get(userRef).then(snapshot => {
  if (snapshot.exists()) {
    const user = snapshot.val();
    const referralLink = `https://t.me/${BOT_USERNAME}?start=${user.refCode}`;
    document.getElementById("referralLink").value = referralLink;

    // Realtime referrals listener
    onValue(ref(db, "users"), allSnap => {
      let count = 0;
      allSnap.forEach(child => {
        if (child.val().referredBy === user.refCode) count++;
      });

      const earnings = (count * REWARD_PER_REFERRAL).toFixed(5);

      document.getElementById("refCount").innerText = count;
      document.getElementById("refEarnings").innerText = earnings;

      update(userRef, { balance: parseFloat(user.balance) + parseFloat(earnings) });
    });
  }
});

// Copy button
document.getElementById("copyBtn").addEventListener("click", () => {
  const input = document.getElementById("referralLink");
  input.select();
  navigator.clipboard.writeText(input.value);
  alert("📋 Copied to clipboard!");
});

// Back
document.getElementById("homeBtn").addEventListener("click", () => {
  window.location.href = "dashboard.html";
});
