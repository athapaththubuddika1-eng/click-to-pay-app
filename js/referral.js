document.addEventListener('DOMContentLoaded', ()=>{
  const cur = currentUser(); if(!cur) return location.href='login.html';
  const db = APP.loadDB(); const u = db.users.find(x=>x.email===cur.email);
  document.getElementById('code').innerText = u.referralCode || '—';
  const bot = 'adsclickpaybot';
  const link = `https://t.me/${bot}?start=${u.referralCode}`;
  document.getElementById('refLink').value = link;
  document.getElementById('refInfo').innerText = `You have ${ (u.referrals||[]).length } referrals`;
  document.getElementById('copyRef').addEventListener('click', ()=>{ navigator.clipboard.writeText(link); alert('Copied referral link'); });
});
