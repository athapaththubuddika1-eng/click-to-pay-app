// js/main.js
import { db, auth } from './firebase.js';
import { doc, onSnapshot, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const uid = localStorage.getItem('uid');
if(uid){
  const uRef = doc(db,'users',uid);
  onSnapshot(uRef, snap=>{
    if(!snap.exists()) return;
    const data = snap.data();
    const name = data.username || 'User';
    const bal = (data.balance||0).toFixed(6);
    const welcome = document.getElementById('welcomeName');
    const balanceDisplay = document.getElementById('balanceDisplay');
    if(welcome) welcome.innerText = `Welcome, ${name}`;
    if(balanceDisplay) balanceDisplay.innerText = `Balance: $${bal}`;
    const p_email = document.getElementById('p_email');
    const p_username = document.getElementById('p_username');
    const p_ton = document.getElementById('p_ton');
    if(p_email) p_email.value = data.email || '';
    if(p_username) p_username.value = data.username || '';
    if(p_ton) p_ton.value = data.ton || '';
  });
}

document.getElementById('saveProfile')?.addEventListener('click', async ()=>{
  const uid = localStorage.getItem('uid');
  if(!uid) return location.href='login.html';
  const username = document.getElementById('p_username').value.trim();
  const ton = document.getElementById('p_ton').value.trim();
  await updateDoc(doc(db,'users',uid), { username, ton });
  alert('Saved');
});

document.getElementById('logoutBtn')?.addEventListener('click', async ()=>{
  await signOut(auth);
  localStorage.removeItem('uid');
  location.href='index.html';
});
