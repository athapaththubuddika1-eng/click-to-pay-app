document.addEventListener('DOMContentLoaded', ()=>{
  const watchBtn = document.getElementById('watchAdBtn');
  const adTimer = document.getElementById('adTimer');
  const captchaSubmit = document.getElementById('captchaSubmit');
  if(watchBtn){
    watchBtn.addEventListener('click', ()=>{
      const user = APP.currentUser();
      if(!user) return alert('Login required');
      const adUrl = localStorage.getItem('acp_ads_link') || (window.ADS_LINK || '');
      const w = window.open(adUrl, '_blank');
      if(!w) return alert('Popup blocked');
      let t=5; adTimer.textContent = 'Wait ' + t + 's...';
      const iv = setInterval(()=>{ t--; adTimer.textContent = 'Wait ' + t + 's...'; if(t<=0){ clearInterval(iv); adTimer.textContent='Done'; w.close();
        const db = APP.DBDATA; const u = db.users[user.email]; u.balance = Number(u.balance) + Number(db.settings.watchReward); APP.saveDB(APP.DBDATA); alert('Reward added ' + APP.money(db.settings.watchReward)); window.location.reload();
      } },1000);
    });
  }
  if(captchaSubmit){
    captchaSubmit.addEventListener('click', ()=>{
      const checked = document.getElementById('captchaBox').checked;
      if(!checked) return alert('Please check captcha');
      const user = APP.currentUser(); if(!user) return alert('Login required');
      const adUrl = localStorage.getItem('acp_ads_link') || (window.ADS_LINK || '');
      const w = window.open(adUrl, '_blank'); if(!w) return alert('Popup blocked');
      let t=5; const adTimer2 = document.getElementById('adTimer2'); adTimer2.textContent='Wait ' + t + 's...';
      const iv = setInterval(()=>{ t--; adTimer2.textContent='Wait ' + t + 's...'; if(t<=0){ clearInterval(iv); adTimer2.textContent='Done'; w.close();
        const db = APP.DBDATA; const u = db.users[user.email]; u.balance = Number(u.balance) + Number(db.settings.captchaReward); APP.saveDB(APP.DBDATA); alert('Reward added ' + APP.money(db.settings.captchaReward)); window.location.reload();
      } },1000);
    });
  }
});
