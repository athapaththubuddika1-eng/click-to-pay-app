// earn.js - inline ad iframe + captcha flow
document.addEventListener('DOMContentLoaded', ()=>{
  const watchBtn = document.getElementById('watchBtn');
  const captchaForm = document.getElementById('captchaForm');
  const adModal = document.getElementById('adModal');
  const adFrame = document.getElementById('adFrame');
  const adCountdown = document.getElementById('adCountdown');
  const claimBtn = document.getElementById('claimReward');
  const closeBtn = document.getElementById('closeAd');
  const ADS_LINK = 'https://www.effectivegatecpm.com/dnm2jrcaj?key=c73c264e4447410ce55eb32960238eaa';

  function openAd(isCaptcha=false){
    const cur = currentUser(); if(!cur) return alert('Login first');
    adFrame.innerHTML = `<iframe src="${ADS_LINK}" style="width:100%;height:220px;border:0;border-radius:8px"></iframe>`;
    adModal.classList.add('show');
    let t = 5; adCountdown.innerText = t; claimBtn.disabled = true; claimBtn.dataset.ready = '';
    const iv = setInterval(()=>{
      t--; adCountdown.innerText = t;
      if(t<=0){ clearInterval(iv); claimBtn.disabled = false; claimBtn.dataset.ready = isCaptcha ? 'captcha' : 'watch'; }
    },1000);
  }

  if(watchBtn) watchBtn.addEventListener('click', ()=> openAd(false));
  if(captchaForm) captchaForm.addEventListener('submit', e=>{
    e.preventDefault();
    const val = document.getElementById('captchaInput').value.trim().toLowerCase();
    if(val !== 'human') return alert('Captcha wrong');
    openAd(true);
  });

  if(claimBtn) claimBtn.addEventListener('click', ()=>{
    const cur = currentUser(); if(!cur) return alert('Login first');
    const db = loadDB(); const u = db.users.find(x=>x.email===cur.email);
    const isCaptcha = claimBtn.dataset.ready === 'captcha';
    const reward = isCaptcha ? db.settings.captchaReward : db.settings.watchReward;
    u.balance = Number(u.balance||0) + Number(reward);
    saveDB(db); setCurrentUser({ email:u.email, username:u.username });
    alert('Reward added ' + money(reward));
    adModal.classList.remove('show'); location.href='dashboard.html';
  });
  if(closeBtn) closeBtn.addEventListener('click', ()=> adModal.classList.remove('show'));
});
