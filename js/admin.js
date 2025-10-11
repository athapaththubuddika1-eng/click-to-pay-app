// Admin credentials
const ADMIN_EMAIL = "admin@adsclickpay.com";
const ADMIN_PASS = "12345";

const loginBox = document.getElementById("adminLogin");
const panelBox = document.getElementById("adminPanel");
const loginBtn = document.getElementById("adminLoginBtn");
const addTaskBtn = document.getElementById("addTaskBtn");
const removeTaskBtn = document.getElementById("removeTaskBtn");
const taskForm = document.getElementById("taskForm");

// --- Login handler ---
loginBtn.addEventListener("click", () => {
  const email = document.getElementById("adminEmail").value.trim();
  const pass = document.getElementById("adminPass").value.trim();

  if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
    localStorage.setItem("isAdmin", "true");
    loginBox.style.display = "none";
    panelBox.style.display = "block";
  } else {
    alert("❌ Invalid credentials!");
  }
});

// --- Add Task toggle ---
addTaskBtn.addEventListener("click", () => {
  taskForm.style.display = taskForm.style.display === "none" ? "block" : "none";
});

// --- Submit Task ---
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("taskTitle").value;
  const link = document.getElementById("taskLink").value;
  const amount = document.getElementById("taskAmount").value;

  const newTask = { title, link, amount };
  let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  tasks.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  alert("✅ Task Added!");
  taskForm.reset();
  taskForm.style.display = "none";
});

// --- Remove Task ---
removeTaskBtn.addEventListener("click", () => {
  localStorage.removeItem("tasks");
  alert("🗑️ All Tasks Removed!");
});
