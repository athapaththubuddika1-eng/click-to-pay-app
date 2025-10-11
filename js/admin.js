import { db, ref, get, set, update, onValue } from "./firebase.js";

const ADMIN_EMAIL = "hasanbuddika1@gmail.com";
const ADMIN_PASS = "Aabbcc.123";

const loginBox = document.getElementById("loginBox");
const adminPanel = document.getElementById("adminPanel");

const loginBtn = document.getElementById("adminLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");

loginBtn.addEventListener("click", () => {
  const email = document.getElementById("adminEmail").value;
  const pass = document.getElementById("adminPass").value;

  if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
    alert("✅ Admin Logged In!");
    loginBox.style.display = "none";
    adminPanel.style.display = "block";
    loadUsers();
    loadWithdraws();
  } else {
    alert("❌ Invalid credentials!");
  }
});

logoutBtn.addEventListener("click", () => {
  loginBox.style.display = "block";
  adminPanel.style.display = "none";
});

function loadUsers() {
  const userTable = document.querySelector("#userTable tbody");
  userTable.innerHTML = "";

  onValue(ref(db, "users"), (snapshot) => {
    userTable.innerHTML = "";
    snapshot.forEach((child) => {
      const user = child.val();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${user.email}</td>
        <td>${user.username}</td>
        <td>$${parseFloat(user.balance || 0).toFixed(5)}</td>
        <td>${user.refCode || "-"}</td>
        <td><button class="addBtn" data-email="${user.email}">Add $</button></td>
      `;
      userTable.appendChild(row);
    });

    document.querySelectorAll(".addBtn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const email = btn.dataset.email;
        const userRef = ref(db, "users/" + email.replace(/\./g, "_"));
        const snap = await get(userRef);
        if (snap.exists()) {
          const user = snap.val();
          const newBal = (parseFloat(user.balance) + 0.001).toFixed(5);
          await update(userRef, { balance: newBal });
          alert(`💰 Balance updated for ${email}`);
        }
      });
    });
  });
}

function loadWithdraws() {
  const withdrawTable = document.querySelector("#withdrawTable tbody");
  withdrawTable.innerHTML = "";

  onValue(ref(db, "withdraws"), (snapshot) => {
    withdrawTable.innerHTML = "";
    snapshot.forEach((child) => {
      const wd = child.val();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${wd.email}</td>
        <td>$${wd.amount}</td>
        <td>${wd.status}</td>
        <td>
          <button class="approveBtn" data-id="${child.key}">Approve</button>
          <button class="rejectBtn" data-id="${child.key}">Reject</button>
        </td>
      `;
      withdrawTable.appendChild(row);
    });

    document.querySelectorAll(".approveBtn").forEach(btn => {
      btn.addEventListener("click", async () => {
        await update(ref(db, "withdraws/" + btn.dataset.id), { status: "Approved" });
        alert("✅ Approved!");
      });
    });

    document.querySelectorAll(".rejectBtn").forEach(btn => {
      btn.addEventListener("click", async () => {
        await update(ref(db, "withdraws/" + btn.dataset.id), { status: "Rejected" });
        alert("❌ Rejected!");
      });
    });
  });
}

document.getElementById("addBalanceBtn").addEventListener("click", async () => {
  const email = document.getElementById("addEmail").value;
  const amount = parseFloat(document.getElementById("addAmount").value);

  const userRef = ref(db, "users/" + email.replace(/\./g, "_"));
  const snap = await get(userRef);
  if (snap.exists()) {
    const user = snap.val();
    const newBal = (parseFloat(user.balance) + amount).toFixed(5);
    await update(userRef, { balance: newBal });
    alert("💸 Balance Added Successfully!");
  } else {
    alert("❌ User not found!");
  }
});
