// js/withdraw_history.js
import { db, ref, onValue } from './firebase.js';
import { requireAuth, safeEmail } from './main.js';

export function initWithdrawHistory() {
  const email = requireAuth();
  const safe = safeEmail(email);
  const list = document.getElementById('list');
  const wRef = ref(db, `withdraws/${safe}`);
  onValue(wRef, snap => {
    if (!snap.exists()) { list.innerHTML = '<p class="small-muted">No history yet.</p>'; return; }
    list.innerHTML = '';
    Object.values(snap.val()).forEach(w => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <p>💵 Amount: $${w.amount}</p>
        <p>🪙 Wallet: ${w.wallet}</p>
        <p>🕒 ${w.date}</p>
        <p>Status: <strong>${w.status}</strong></p>
      `;
      list.appendChild(div);
    });
  });
}
