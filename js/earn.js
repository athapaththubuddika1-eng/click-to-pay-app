// Earn page logic
document.addEventListener('DOMContentLoaded',()=>{
  const watchBtn = document.getElementById('watchAdBtn');
  const adCountdown = document.getElementById('adCountdown');
  const captchaWrap = document.getElementById('captchaWrap');
  const captchaBox = document.getElementById('captchaBox');
  const captchaSubmit = document.getElementById('captchaSubmit');

  if(watchBtn){
    watchBtn.addEventListener('click',()=>{
      // show captcha
      captchaWrap.classList.remove('hidden');
    });
  }

  if(captchaSubmit){
    captchaSubmit.addEventListener('click',()=>{
      if(!captchaBox.checked) return alert('Please check captcha');
      // open ad link in new tab (triggered by user click to avoid popup blocker)
      const adUrl = localStorage.getItem('acp_ad_url') || 'https://www.revenuecpmgate.com/dnm2jrcaj?key=c73c264e4447410ce55eb32960238eaa';
      const win = window.open(adUrl, '_blank');
      if(!win) { alert('Popup blocked. Allow popups for this site.'); return; }
      // countdown 5s then enable claim
      let t=5; adCountdown.textContent = `Ad open - wait ${t}s...`;
      const iv = setInterval(()=>{
        t--; adCountdown.textContent = `Ad open - wait ${t}s...`;
        if(t<=0){ clearInterval(iv); adCountdown.textContent = 'You may close the ad and your reward will be applied shortly.'; 
          // give reward to current user
          const user = APP.currentUser();
          if(!user){ alert('Login first'); return; }
          APP.DB.users[user.email].balance = Number(APP.DB.users[user.email].balance || 0) + Number(APP.DB.settings.watchReward);
          APP.DB.save();
          alert('Reward added: '+formatMoney(APP.DB.settings.watchReward));
          // refresh
          window.location.reload();
        }
      },1000);
    });
  }
});
