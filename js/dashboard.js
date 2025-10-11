// js/dashboard.js
import { db, ref, onValue, get } from './firebase.js';
import { requireAuth, safeEmail, fmtUSD } from './main.js';

export function initDashboard() {
  const email = requireAuth();
  const safe = safeEmail(email);
  const userRef = ref(db, `users/${safe}`);

  // live profile
  onValue(userRef, snap => {
    if (!snap.exists()) return;
    const data = snap.val();
    document.getElementById('username').innerText = data.username || data.email;
    document.getElementById('userBalance').innerText = fmtUSD(data.balance || 0, 6);
    document.getElementById('myReferrals').innerText = data.referrals || 0;
  });

  // pending withdraws count
  const wRef = ref(db, `withdraws/${safe}`);
  onValue(wRef, snap => {
    document.getElementById('myWithdraws').innerText = snap.exists() ? Object.keys(snap.val()).length : 0;
  });

  // logout
  const btn = document.getElementById('logoutBtn');
  if (btn) btn.addEventListener('click', ()=>{
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
  });
}
