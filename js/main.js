// js/main.js - Dashboard & Profile
import { db, auth } from './firebase.js';
import { ref, onValue, get, update } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const uid = localStorage.getItem('uid');
const welcomeName = document.getElementById('welcomeName');
const userEmail = document.getElementById('userEmail');
const balanceVal = document.getElementById('balanceVal');
const totalWithdraws = document.getElementById('totalWithdraws');

if(uid){
  const uRef = ref(db, `users/${uid}`);
  onValue(uRef, snap=>{
    if(!snap.exists()) return;
    const data = snap.val();
    welcomeName.innerText = `Welcome, ${data.username || 'User'}`;
    userEmail.innerText = data.email || '';
    balanceVal.innerText = (Number(data.balance||0)).toFixed(6);
  });
  // withdraw count
  onValue(ref(db,'withdraws'), snap=>{
    let cnt = 0;
    snap.forEach(child=>{
      const v = child.val();
      if(v.uid === uid) cnt++;
    });
    totalWithdraws && (totalWithdraws.innerText = cnt);
  });
}

// profile save
document.getElementById('saveProfile')?.addEventListener('click', async ()=>{
  const username = document.getElementById('p_username').value.trim();
  const ton = document.getElementById('p_ton').value.trim();
  if(!uid) return location.href='login.html';
  await update(ref(db, `users/${uid}`), { username, ton });
  alert('Saved');
});
