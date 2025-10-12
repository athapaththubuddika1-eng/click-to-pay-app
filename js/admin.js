// js/admin.js - simple client-side admin actions (for demo). Use secure cloud functions in production.
import { db } from './firebase.js';
import { ref, onValue, get, update, push, set } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

const ADMIN_EMAIL = "hasanbuddika1@gmail.com";
const ADMIN_PASS = "Aabbcc.123";

const adminLoginBtn = document.getElementById('admin_login');
const adminLoginBox = document.getElementById('adminLoginBox');
const adminPanel = document.getElementById('adminPanel');
const adminUsers = document.getElementById('adminUsers');
const adminWithdraws = document.getElementById('adminWithdraws');
const taskAddBtn = document.getElementById('task_add');

adminLoginBtn.onclick = async ()=>{
  const em = document.getElementById('admin_email').value.trim();
  const pw = document.getElementById('admin_pass').value.trim();
  if(em === ADMIN_EMAIL && pw === ADMIN_PASS){
    adminLoginBox.classList.add('hidden'); adminPanel.classList.remove('hidden');
    loadUsers(); loadWithdraws();
  } else alert('Invalid admin credentials');
};

function loadUsers(){
  onValue(ref(db,'users'), snap=>{
    adminUsers.innerHTML = '';
    snap.forEach(child=>{ const id = child.key; const v = child.val();
      const el = document.createElement('div'); el.className='card';
      el.innerHTML = `<p><strong>${v.username||'—'}</strong> • ${v.email}</p><p>Balance: $${(v.balance||0).toFixed(6)} • RefBy: ${v.referredBy||'—'}</p><div style="display:flex;gap:8px"><input id="amt_${id}" class="input" placeholder="$ amt" style="width:130px"/><button class="btn" onclick="adminAddBalance('${id}')">Add</button><button class="btn" onclick="adminToggleBan('${id}')">${v.banned?'Unban':'Ban'}</button></div>`;
      adminUsers.appendChild(el);
    });
  });
}

window.adminAddBalance = async (uid)=>{
  const el = document.getElementById(`amt_${uid}`);
  const amt = parseFloat(el.value);
  if(!amt) return alert('Enter amount');
  const s = await get(ref(db, `users/${uid}`));
  if(!s.exists()) return alert('User not found');
  await update(ref(db, `users/${uid}`), { balance: (Number(s.val().balance||0) + amt) });
  alert('Balance added');
  el.value='';
};

window.adminToggleBan = async (uid)=>{
  const s = await get(ref(db, `users/${uid}`));
  if(!s.exists()) return alert('User not found');
  await update(ref(db, `users/${uid}`), { banned: !s.val().banned });
  alert('Updated');
};

function loadWithdraws(){
  onValue(ref(db,'withdraws'), snap=>{
    adminWithdraws.innerHTML = '';
    snap.forEach(child=>{ const id = child.key; const w = child.val();
      const el = document.createElement('div'); el.className='card';
      el.innerHTML = `<p><strong>${w.email}</strong> • $${w.amount} • ${w.status}</p><div style="display:flex;gap:8px"><button class="btn" onclick="approve('${id}')">Approve</button><button class="btn" onclick="reject('${id}')">Reject</button></div>`;
      adminWithdraws.appendChild(el);
    });
  });
}

window.approve = async (id)=>{
  const s = await get(ref(db, `withdraws/${id}`));
  if(!s.exists()) return;
  await update(ref(db, `withdraws/${id}`), { status:'Approved', processedAt: new Date().toISOString() });
  const w = s.val();
  // notify admin/user via telegram
  fetch('/api/sendTelegram', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text: `✅ Withdraw Approved\nUser: ${w.email}\nAmount: $${w.amount}\nAddress: ${w.address}` })});
  alert('Approved & notified');
};

window.reject = async (id)=>{
  const s = await get(ref(db, `withdraws/${id}`));
  if(!s.exists()) return;
  await update(ref(db, `withdraws/${id}`), { status:'Rejected', processedAt: new Date().toISOString() });
  const w = s.val();
  fetch('/api/sendTelegram', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text: `❌ Withdraw Rejected\nUser: ${w.email}\nAmount: $${w.amount}\nAddress: ${w.address}` })});
  alert('Rejected & notified');
};

taskAddBtn?.addEventListener('click', async ()=>{
  const t = document.getElementById('task_title').value.trim();
  const link = document.getElementById('task_link').value.trim();
  const amount = parseFloat(document.getElementById('task_amount').value);
  if(!t||!link||!amount) return alert('Fill task fields');
  const p = push(ref(db,'tasks'));
  await set(p, { title:t, link, amount });
  alert('Task added');
});
