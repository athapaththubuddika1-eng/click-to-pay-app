// js/withdraw.js - request withdraw, min $0.10, daily limit 2
import { db } from './firebase.js';
import { ref, get, push, set, update } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

const uid = localStorage.getItem('uid');
if(!uid){ alert('Login first'); location.href='login.html'; }

const MIN_WITHDRAW = 0.1;
const DAILY_WITHDRAW_LIMIT = 2;

const wBtn = document.getElementById('w_btn');
const wAmount = document.getElementById('w_amount');
const wAddress = document.getElementById('w_address');
const withdrawMsg = document.getElementById('withdrawMsg');
const withdrawHistory = document.getElementById('withdrawHistory');

async function getUser(uid){ const s = await get(ref(db, `users/${uid}`)); return s.exists()?s.val():null; }

async function countWithdrawsToday(uid){
  const snap = await get(ref(db,'withdraws')); let cnt=0;
  const today = new Date().toISOString().split('T')[0];
  snap.forEach(child=>{ const v=child.val(); if(v.uid===uid && v.date===today) cnt++; });
  return cnt;
}

wBtn.onclick = async ()=>{
  const amt = parseFloat(wAmount.value);
  const addr = wAddress.value.trim();
  if(!amt || amt < MIN_WITHDRAW) return alert('Minimum withdraw $0.10');
  const user = await getUser(uid);
  if(!user) return alert('User not found');
  if((user.balance||0) < amt) return alert('Insufficient balance');
  const todayCount = await countWithdrawsToday(uid);
  if(todayCount >= DAILY_WITHDRAW_LIMIT) return alert('You reached daily withdraw limit (2)');
  // deduct immediately
  await update(ref(db, `users/${uid}`), { balance: (Number(user.balance||0) - amt) });
  const wRef = push(ref(db,'withdraws'));
  await set(wRef, { uid, email: user.email, amount: amt, address: addr, status:'Pending', ts: new Date().toISOString(), date: new Date().toISOString().split('T')[0] });
  // notify admin
  fetch('/api/sendTelegram', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text: `🔔 Withdraw Request\nUser: ${user.email}\nAmount: $${amt}\nAddress: ${addr}\nStatus: Pending` }) });
  withdrawMsg.innerText = 'Withdraw requested';
  wAmount.value=''; wAddress.value='';
  loadHistory();
};

async function loadHistory(){
  withdrawHistory.innerText = 'Loading...';
  const snap = await get(ref(db,'withdraws')); withdrawHistory.innerHTML = '';
  snap.forEach(child=>{ const v = child.val(); if(v.uid===uid){ const el = document.createElement('div'); el.className='card'; el.innerHTML = `<p>$${v.amount} • ${v.status}</p><p class="small">${v.ts}</p>`; withdrawHistory.appendChild(el); }});
}
loadHistory();
