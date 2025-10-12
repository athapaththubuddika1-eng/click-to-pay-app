// js/admin.js
import { db } from './firebase.js';
import { collection, onSnapshot, addDoc, setDoc, doc, getDoc, updateDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const adminEmailInput = document.getElementById('admin_email');
const adminPassInput = document.getElementById('admin_pass');
const adminLoginBtn = document.getElementById('admin_login');
const adminPanel = document.getElementById('adminPanel');
const adminLoginBox = document.getElementById('adminLoginBox');
const adminUsers = document.getElementById('adminUsers');
const adminWithdraws = document.getElementById('adminWithdraws');

const ADMIN_EMAIL = "hasanbuddika1@gmail.com";
const ADMIN_PASS = "Aabbcc.123";

adminLoginBtn?.addEventListener('click', async ()=>{
  const em = adminEmailInput.value.trim();
  const pw = adminPassInput.value.trim();
  if(em === ADMIN_EMAIL && pw === ADMIN_PASS){
    adminLoginBox.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    loadUsers(); loadWithdraws();
  } else alert('Invalid admin credentials');
});

function loadUsers(){
  onSnapshot(collection(db,'users'), snap=>{
    adminUsers.innerHTML='';
    snap.forEach(d=>{
      const u = d.data();
      const id = d.id;
      const el = document.createElement('div');
      el.className = 'card';
      el.innerHTML = `<p><strong>${u.username||'—'}</strong> • ${u.email}</p>
        <p>Balance: $${(u.balance||0).toFixed(6)} • Referrals: ${u.refCount||0} • ${u.banned?'<span style="color:#ff6b6b">BANNED</span>':'Active'}</p>
        <div style="display:flex;gap:8px">
          <input id="addAmt_${id}" placeholder="$ amt" class="input" style="width:120px"/>
          <button class="btn" onclick="window.adminAddBalance('${id}')">Add Balance</button>
          <button class="btn" onclick="window.adminToggleBan('${id}')">${u.banned?'Unban':'Ban'}</button>
        </div>`;
      adminUsers.appendChild(el);
    });
  });
}

window.adminAddBalance = async (uid) => {
  const amtInput = document.getElementById(`addAmt_${uid}`);
  const amt = parseFloat(amtInput.value);
  if(!amt) return alert('Enter amount');
  const uRef = doc(db,'users',uid);
  const s = await getDoc(uRef);
  if(!s.exists()) return alert('User not found');
  await updateDoc(uRef, { balance: (s.data().balance||0) + amt });
  alert('Balance added');
  amtInput.value='';
};

window.adminToggleBan = async (uid) => {
  const uRef = doc(db,'users',uid);
  const s = await getDoc(uRef);
  if(!s.exists()) return alert('User not found');
  await updateDoc(uRef, { banned: !s.data().banned });
  alert(s.data().banned ? 'Unbanned' : 'Banned');
};

function loadWithdraws(){
  onSnapshot(collection(db,'withdraws'), snap=>{
    adminWithdraws.innerHTML='';
    snap.forEach(d=>{
      const w = d.data(); const id = d.id;
      const el = document.createElement('div'); el.className='card';
      el.innerHTML = `<p><strong>${w.email}</strong> • $${w.amount} • ${w.status}</p>
        <div style="display:flex;gap:8px">
          <button class="btn" onclick="window.approveWithdraw('${id}')">Approve</button>
          <button class="btn" onclick="window.rejectWithdraw('${id}')">Reject</button>
        </div>`;
      adminWithdraws.appendChild(el);
    });
  });
}

window.approveWithdraw = async (id) => {
  await updateDoc(doc(db,'withdraws',id), { status:'Approved', processedAt: new Date().toISOString() });
  const w = (await getDoc(doc(db,'withdraws',id))).data();
  // notify via API
  fetch('/api/sendTelegram', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text: `✅ Withdraw Approved\nUser: ${w.email}\nAmount: $${w.amount}\nAddress: ${w.address}` })});
  alert('Approved & notified');
};

window.rejectWithdraw = async (id) => {
  await updateDoc(doc(db,'withdraws',id), { status:'Rejected', processedAt: new Date().toISOString() });
  const w = (await getDoc(doc(db,'withdraws',id))).data();
  fetch('/api/sendTelegram', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text: `❌ Withdraw Rejected\nUser: ${w.email}\nAmount: $${w.amount}\nAddress: ${w.address}` })});
  alert('Rejected & notified');
};
