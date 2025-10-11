// js/earn.js
import { db, ref, get, update, push } from './firebase.js';
import { requireAuth, safeEmail } from './main.js';

const ADS_LINK = 'https://www.effectivegatecpm.com/dnm2jrcaj?key=c73c264e4447410ce55eb32960238eaa';
const CAPTCHA_USD = 0.0002;
const AD_USD = 0.00015;

function openAd(url) {
  try {
    if (window.Telegram && window.Telegram.WebApp && typeof window.Telegram.WebApp.openLink === 'function') {
      window.Telegram.WebApp.openLink(url);
      return;
    }
  } catch(e) {}
  // fallback
  window.open(url, '_blank');
}

async function addBalance(safe, amount) {
  const uRef = ref(db, `users/${safe}`);
  const uSnap = await get(uRef);
  const cur = Number(uSnap.val().balance || 0);
  const newBal = cur + Number(amount);
  await update(uRef, { balance: newBal });
  // record activity
  await push(ref(db, 'activities'), { uid: safe, type: 'earn', amount, ts: new Date().toISOString() });
}

export function initEarn() {
  const email = requireAuth();
  const safe = safeEmail(email);

  // captcha generation
  const captchaEl = document.getElementById('captchaValue');
  const reloadBtn = document.getElementById('reloadCaptcha');
  const submitBtn = document.getElementById('submitCaptcha');
  const watchBtn = document.getElementById('watchBtn');
  const status = document.getElementById('status');
  const input = document.getElementById('captchaInput');

  function genCaptcha(){
    const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s='';
    for(let i=0;i<5;i++) s+=chars.charAt(Math.floor(Math.random()*chars.length));
    if(captchaEl) captchaEl.innerText = s;
  }
  genCaptcha();
  if(reloadBtn) reloadBtn.onclick = genCaptcha;

  if(submitBtn) submitBtn.addEventListener('click', async ()=>{
    const typed = (input.value || '').trim().toUpperCase();
    const real = (captchaEl.innerText || '').trim().toUpperCase();
    if(!typed) return alert('Type the captcha');
    if(typed !== real) { alert('Wrong captcha'); genCaptcha(); return; }
    openAd(ADS_LINK);
    status.innerText = '⏳ Ad opened — counting 5s...';
    submitBtn.disabled = true;
    let t = 5;
    const iv = setInterval(async ()=>{
      t--; status.innerText = `⏳ Counting ${t}s...`;
      if (t < 0) {
        clearInterval(iv);
        try {
          await addBalance(safe, CAPTCHA_USD + AD_USD);
          status.innerText = `✅ Earned $${(CAPTCHA_USD + AD_USD).toFixed(6)}!`;
          input.value = '';
          genCaptcha();
        } catch(e) {
          console.error(e);
          alert('Error awarding reward');
        } finally {
          submitBtn.disabled = false;
        }
      }
    }, 1000);
  });

  if(watchBtn) watchBtn.addEventListener('click', async ()=>{
    openAd(ADS_LINK);
    status.innerText = '⏳ Ad opened — counting 5s...';
    watchBtn.disabled = true;
    let t = 5;
    const iv = setInterval(async ()=>{
      t--; status.innerText = `⏳ Counting ${t}s...`;
      if (t < 0) {
        clearInterval(iv);
        try {
          await addBalance(safe, AD_USD);
          status.innerText = `✅ Earned $${AD_USD.toFixed(6)}!`;
        } catch(e) { console.error(e); alert('Error awarding'); }
        watchBtn.disabled = false;
      }
    }, 1000);
  });
}
