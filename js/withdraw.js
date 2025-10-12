// js/withdraw.js
import { db } from './firebase.js';
import { collection, addDoc, onSnapshot, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const uid = localStorage.getItem('uid');
if(!uid) location.href='login.html';

const wBtn = document.getElementById('w_btn');
const wAmount = document.getElementById('w_amount');
const wAddress = document.getElementById('w_address');
const historyDiv = document.getElementById('withdrawHistory');

wBtn.addEventListener('click', async ()=>{
  const amt = parseFloat(wAmount.value);
  const addr = wAddress.value.trim();
  if(!amt || amt < 0.1) return alert('Minimum withdraw $0.10');
  const uRef = doc(db,'users',uid);
  const uSnap = await getDoc(uRef);
  if(!uSnap.exists()) return alert('User not found');
  if((uSnap.data().balance||0) < amt) return alert('Insufficient balance');
  await updateDoc(uRef, { balance: (uSnap.data().balance||0) - amt });
  const wRef = await addDoc(collection(db,'withdraws'), { uid, email: uSnap.data().email, amount: amt, address: addr, status: 'Pending', createdAt: new Date().toISOString() });
  // notify admin via API
  fetch('/api/sendTelegram', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text: `🔔 Withdraw Request\nUser: ${uSnap.data().email}\nAmount: $${amt}\nAddress: ${addr}\nStatus: Pending` })});
  alert('Withdraw requested');
  wAmount.value=''; wAddress.value='';
});

// show withdraws
onSnapshot(collection(db,'withdraws'), snap=>{
  historyDiv.innerHTML='';
  snap.forEach(s=>{
    const d = s.data();
    if(d.uid !== uid) return;
    const el = document.createElement('div'); el.className='card';
    el.innerHTML = `<p>Amount: $${d.amount}</p><p>Status: ${d.status}</p><p>${d.createdAt}</p>`;
    historyDiv.appendChild(el);
  });
});
