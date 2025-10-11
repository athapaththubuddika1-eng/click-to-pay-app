// js/withdraw.js
import { db, ref, get, push, set, update } from './firebase.js';
import { requireAuth, safeEmail } from './main.js';

export function initWithdraw() {
  const email = requireAuth();
  const safe = safeEmail(email);
  const min = 0.1;

  const btn = document.getElementById('withdrawBtn');
  btn.addEventListener('click', async ()=>{
    const amount = parseFloat(document.getElementById('amount').value);
    const wallet = document.getElementById('wallet').value.trim();
    if (!amount || !wallet) return alert('Fill fields');
    if (amount < min) return alert(`Minimum withdraw is $${min}`);
    const uRef = ref(db, `users/${safe}`);
    const uSnap = await get(uRef);
    if (!uSnap.exists()) return alert('User not found');
    const u = uSnap.val();
    if (Number(u.balance || 0) < amount) return alert('Not enough balance');

    // subtract balance immediately
    await update(uRef, { balance: Number(u.balance) - amount });

    // push withdraw request under withdraws/{safe}/{pushId}
    const wRef = ref(db, `withdraws/${safe}`);
    const newReqRef = push(wRef);
    await set(newReqRef, {
      amount,
      wallet,
      status: 'Pending',
      date: new Date().toLocaleString()
    });

    // send telegram notify (optional) via serverless API
    try {
      await fetch('/api/sendTelegram', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ text: `🟡 Withdraw Request\nUser: ${u.username || email}\nEmail: ${email}\nAmount: $${amount}\nWallet: ${wallet}\nStatus: pending` })
      });
    } catch(e) {
      console.warn('Telegram notify failed', e);
    }

    alert('Withdraw request submitted');
    window.location.href = 'withdraw_history.html';
  });
}
