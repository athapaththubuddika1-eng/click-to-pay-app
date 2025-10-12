// js/earn.js - Captcha + Ad and Watch Ad flows (USD rewards)
import { db } from './firebase.js';
import { ref, get, update, push, set } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

const uid = localStorage.getItem('uid');
if(!uid){ alert('Please login'); location.href='login.html'; }

const AD_URL = "https://www.effectivegatecpm.com/dnm2jrcaj?key=c73c264e4447410ce55eb32960238eaa";
const WATCH_USD = 0.00015;
const CAPTCHA_USD = 0.0002;

const watchAdBtn = document.getElementById('watchAdBtn');
const watchStatus = document.getElementById('watchStatus');
const captchaText = document.getElementById('captchaText');
const captchaInput = document.getElementById('captchaInput');
const captchaBtn = document.getElementById('captchaBtn');
const capStatus = document.getElementById('capStatus');
const capCountdown = document.getElementById('capCountdown');
const capTimer = document.getElementById('capTimer');

function genCaptcha(){
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s=''; for(let i=0;i<5;i++) s+=chars.charAt(Math.floor(Math.random()*chars.length));
  captchaText.innerText = s;
}
genCaptcha();

async function credit(uid, amount, type){
  const uRef = ref(db, `users/${uid}`);
  const snap = await get(uRef);
  if(!snap.exists()) return;
  const data = snap.val();
  const newBal = (Number(data.balance||0) + Number(amount));
  await update(uRef, { balance: newBal });
  const h = push(ref(db,'earnHistory')); await set(h, { uid, amount, type, ts: new Date().toISOString() });
  return newBal;
}

// Watch Ad flow
watchAdBtn.onclick = async ()=>{
  watchAdBtn.disabled = true;
  window.open(AD_URL,'_blank');
  watchStatus.innerText = '⏳ Ad opened — waiting 5s...';
  await new Promise(r=>setTimeout(r,5000));
  try{
    await credit(uid, WATCH_USD, 'watch_ad');
    watchStatus.innerText = `+ $${WATCH_USD.toFixed(6)} added`;
  }catch(e){ console.error(e); watchStatus.innerText='Error'; }
  setTimeout(()=>watchAdBtn.disabled=false, 2000);
};

// Captcha + Ad flow
captchaBtn.onclick = async ()=>{
  const val = (captchaInput.value||'').trim().toUpperCase();
  const real = (captchaText.innerText||'').trim().toUpperCase();
  if(!val) return alert('Type captcha');
  if(val !== real){ alert('Wrong captcha'); genCaptcha(); captchaInput.value=''; return; }
  captchaBtn.disabled = true;
  window.open(AD_URL,'_blank');
  capStatus.innerText = '⏳ Ad opened — waiting 5s...';
  let t=5; capCountdown.classList.remove('hidden'); capTimer.innerText = t;
  const iv = setInterval(async ()=>{
    t--; capTimer.innerText = t;
    if(t<=0){
      clearInterval(iv); capCountdown.classList.add('hidden');
      try{ await credit(uid, CAPTCHA_USD, 'captcha_ad'); capStatus.innerText = `+ $${CAPTCHA_USD.toFixed(6)} added`; }catch(e){ capStatus.innerText='Error'; }
      captchaBtn.disabled = false; captchaInput.value=''; genCaptcha();
    }
  },1000);
};
