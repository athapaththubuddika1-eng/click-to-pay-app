// js/admin.js
import { db } from "./firebase.js";
import { ref, get, update, remove, push } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

document.getElementById("addBalanceForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const amount = parseFloat(document.getElementById("amount").value);

  const snapshot = await get(ref(db, "users"));
  snapshot.forEach((child) => {
    if (child.val().email === email) {
      const userRef = ref(db, "users/" + child.key);
      const currentBalance = child.val().balance || 0;
      update(userRef, { balance: currentBalance + amount });
      alert("💰 Balance added!");
    }
  });
});
