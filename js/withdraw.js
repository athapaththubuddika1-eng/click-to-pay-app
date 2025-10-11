// js/withdraw.js
import { db } from "./firebase.js";
import { ref, push } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const username = localStorage.getItem("currentUser");

document.getElementById("withdrawForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const amount = document.getElementById("withdrawAmount").value;
  const method = document.getElementById("withdrawMethod").value;

  await push(ref(db, "withdrawRequests"), {
    username,
    amount,
    method,
    status: "Pending",
    date: new Date().toLocaleString(),
  });

  alert("✅ Withdraw request submitted!");
});
