// js/referral.js
import { db, ref, get, onValue } from './firebase.js';
import { requireAuth, safeEmail } from './main.js';

export async function initReferral() {
  const email = requireAuth();
  const safe = safeEmail(email);
  const uSnap = await get(ref(db, `users/${safe}`));
  const code = uSnap.exists() ? uSnap.val().referralCode : safe.slice(0,6).toUpperCase();
  const link = `${location.origin}/register.html?ref=${code}`;
  document.getElementById('refLink').value = link;
  document.getElementById('copyRef').addEventListener('click', ()=>{
    navigator.clipboard.writeText(link);
    alert('Referral link copied');
  });
  onValue(ref(db, `users/${safe}/referrals`), s => {
    document.getElementById('copyRef').innerText = 'Copy Link';
  });
}
