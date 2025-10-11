// js/admin.js
import { db, ref, push, set, onValue, update, remove, get } from './firebase.js';

const ADMIN_EMAIL = 'hasanbuddika1@gmail.com';
const ADMIN_PASS = 'Aabbcc.123';

export function initAdmin() {
  // login elements
  const loginBtn = document.getElementById('loginAdmin');
  const logoutBtn = document.getElementById('logoutBtn');
  const loginBox = document.getElementById('loginBox');
  const panel = document.getElementById('panel');

  function showPanel() {
    loginBox.style.display = 'none';
    panel.style.display = 'block';
    loadTasks();
    loadWithdraws();
  }
  if (localStorage.getItem('isAdmin') === 'true') showPanel();

  loginBtn.addEventListener('click', ()=>{
    const email = document.getElementById('adminEmail').value.trim();
    const pass = document.getElementById('adminPass').value.trim();
    if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
      localStorage.setItem('isAdmin', 'true');
      showPanel();
    } else alert('Invalid admin credentials');
  });

  logoutBtn.addEventListener('click', ()=> {
    localStorage.removeItem('isAdmin');
    location.reload();
  });

  // Add Balance
  document.getElementById('addBalanceBtn').addEventListener('click', async ()=>{
    const email = document.getElementById('userEmail').value.trim().toLowerCase();
    const amount = parseFloat(document.getElementById('addAmount').value);
    if (!email || !amount) return alert('Fill fields');
    const safe = email.replaceAll('.', '_');
    const uRef = ref(db, `users/${safe}`);
    const snap = await get(uRef);
    if (!snap.exists()) return alert('User not found');
    const user = snap.val();
    await update(uRef, { balance: Number(user.balance || 0) + amount });
    alert('Balance added');
  });

  // Ban/unban
  document.getElementById('banBtn').addEventListener('click', ()=>{
    const email = document.getElementById('banEmail').value.trim().toLowerCase();
    if (!email) return;
    update(ref(db, `users/${email.replaceAll('.','_')}`), { banned: true });
    alert('User banned');
  });
  document.getElementById('unbanBtn').addEventListener('click', ()=>{
    const email = document.getElementById('banEmail').value.trim().toLowerCase();
    if (!email) return;
    update(ref(db, `users/${email.replaceAll('.','_')}`), { banned: false });
    alert('User unbanned');
  });

  // Tasks add
  document.getElementById('addTaskBtn').addEventListener('click', async ()=>{
    const title = document.getElementById('taskTitle').value.trim();
    const link = document.getElementById('taskLink').value.trim();
    const amount = parseFloat(document.getElementById('taskAmount').value);
    if (!title || !link || !amount) return alert('Fill task fields');
    const newT = push(ref(db, 'tasks'));
    await set(newT, { title, link, amount });
    alert('Task added');
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskLink').value = '';
    document.getElementById('taskAmount').value = '';
  });

  // load tasks
  window.removeTask = async (id) => {
    await remove(ref(db, `tasks/${id}`));
    alert('Removed');
  };

  async function loadTasks(){
    const tRef = ref(db, 'tasks');
    onValue(tRef, snap => {
      const list = document.getElementById('taskList');
      list.innerHTML = '';
      if (!snap.exists()) return list.innerHTML = '<p>No tasks</p>';
      Object.entries(snap.val()).forEach(([id, task]) => {
        const div = document.createElement('div');
        div.className = 'task-item';
        div.innerHTML = `<p>🧩 <b>${task.title}</b></p><p class="small-muted">${task.link}</p><p>💰 $${task.amount}</p><button onclick="removeTask('${id}')">❌ Remove</button>`;
        list.appendChild(div);
      });
    });
  }

  // load withdraws
  window.approve = async (email, id) => {
    await update(ref(db, `withdraws/${email}/${id}`), { status: 'Approved' });
    // Optionally notify via server
    try {
      await fetch('/api/sendTelegram', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text: `✅ Withdraw Approved\nUser: ${email.replaceAll('_','.')} \nId: ${id}` }) });
    } catch(e){ console.warn(e); }
    alert('Approved');
  };
  window.reject = async (email, id) => {
    await update(ref(db, `withdraws/${email}/${id}`), { status: 'Rejected' });
    try {
      await fetch('/api/sendTelegram', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text: `❌ Withdraw Rejected\nUser: ${email.replaceAll('_','.')} \nId: ${id}` }) });
    } catch(e){ console.warn(e); }
    alert('Rejected');
  };

  function loadWithdraws(){
    const refW = ref(db, 'withdraws');
    onValue(refW, snap => {
      const list = document.getElementById('withdrawList');
      list.innerHTML = '';
      if (!snap.exists()) return list.innerHTML = '<p>No withdraws</p>';
      Object.entries(snap.val()).forEach(([email, reqs]) => {
        Object.entries(reqs).forEach(([id, w]) => {
          const div = document.createElement('div');
          div.className = 'withdraw-item';
          div.innerHTML = `<p>👤 ${email.replaceAll('_', '.')}</p><p>💰 $${w.amount}</p><p>📅 ${w.date}</p><p>Status: ${w.status}</p><button onclick="approve('${email}','${id}')">✅ Approve</button><button onclick="reject('${email}','${id}')">❌ Reject</button>`;
          list.appendChild(div);
        });
      });
    });
  }
}
