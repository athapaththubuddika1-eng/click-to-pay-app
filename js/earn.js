// js/earn.js
import { db } from "./firebase.js";
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const captchaInput = document.getElementById("captchaInput");
const submitBtn = document.getElementById("submitBtn");
const adFrame = document.getElementById("adFrame");
const rewardDisplay = document.getElementById("rewardDisplay");

let captchaCode = "";
let currentUserEmail = localStorage.getItem("userEmail");

function generateCaptcha() {
  captchaCode = Math.random().toString(36).substring(2, 8);
  document.getElementById("captchaText").textContent = captchaCode;
}

generateCaptcha();

submitBtn.addEventListener("click", async () => {
  const userValue = captchaInput.value.trim();
  if (userValue === captchaCode) {
    rewardDisplay.textContent = "✅ Captcha verified! Opening ad...";
    adFrame.src = "https://www.effectivegatecpm.com/dnm2jrcaj?key=c73c264e4447410ce55eb32960238eaa";

    // Wait 5 seconds to reward
    setTimeout(async () => {
      rewardDisplay.textContent = "🎉 You earned $0.0002 for captcha!";
      await updateBalance(0.0002);
      generateCaptcha();
    }, 5000);
  } else {
    rewardDisplay.textContent = "❌ Incorrect Captcha. Try again.";
    generateCaptcha();
  }
});

async function updateBalance(amount) {
  const usersRef = collection(db, "users");
  const users = await getDocs(usersRef);
  users.forEach(async (userDoc) => {
    if (userDoc.data().email === currentUserEmail) {
      const userRef = doc(db, "users", userDoc.id);
      await updateDoc(userRef, {
        balance: (userDoc.data().balance || 0) + amount
      });
    }
  });
}
