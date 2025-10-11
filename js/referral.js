// referral.js
document.addEventListener('DOMContentLoaded', ()=>{
  const cur = currentUser(); if(!cur) return location.href='login.html';
  const db = loadDB(); const u = db.users.find(x=>x.email===cur.email);
  document.getElementById('refCode').textContent = u.referralCode || '—';
  const botUsername = 'adsclickpaybot';
  const link = `https://t.me/${botUsername}?start=${u.referralCode}`;
  document.getElementById('refLink').value = link;
  document.getElementById('refCount').textContent = `You have invited ${(u.referrals||[]).length} people.`;
  document.getElementById('copyRef').addEventListener('click', ()=>{ navigator.clipboard.writeText(link).then(()=>alert('Copied referral link')) });
});
