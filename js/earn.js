// js/earn.js
import { db } from './firebase.js';
import { doc, getDoc, updateDoc, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const AD_URL = "https://www.effectivegatecpm.com/dnm2jrcaj?key=c73c264e4447410ce55eb32960238eaa";
const WATCH_REWARD = 0.00015;
const CAPTCHA_REWARD = 0.0002;

const uid = localStorage.getItem('uid');
if(!uid) location.href='login.html';

const captchaTextEl = document.getElementById('captchaText');
const captchaInput = document.getElementById('captchaInput');
const captchaBtn = document.getElementById('captchaBtn');
const watchBtn = document.getElementById('watchAdBtn');
const capStatus = document.getElementById('capStatus');
const watchStatus = document.getElementById('watchStatus');
const countdownEl = document.getElementById('countdownEl');
const countTimer = document.getElementById('countTimer');

function genCaptcha(){
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s='';
  for(let i=0;i<5;i++) s+=chars.charAt(Math.floor(Math.random()*chars.length));
  captchaTextEl.innerText = s;
}
genCaptcha();

async function credit(amount, type){
  const uRef = doc(db,'users',uid);
  const snap = await getDoc(uRef);
  if(!snap.exists()) return;
  const newBal = (snap.data().balance||0) + Number(amount);
  await updateDoc(uRef, { balance: newBal });
  await addDoc(collection(db,'activities'), { uid, type, amount, ts: new Date().toISOString() });
  return newBal;
}

captchaBtn?.addEventListener('click', ()=>{
  const val = (captchaInput.value||'').trim().toUpperCase();
  const real = (captchaTextEl.innerText||'').trim().toUpperCase();
  if(!val) return alert('Type captcha');
  if(val !== real){ alert('Wrong captcha'); genCaptcha(); captchaInput.value=''; return; }
  window.open(AD_URL, '_blank');
  capStatus.innerText = 'Ad opened — waiting 5s...';
  let t=5; countdownEl.classList.remove('hidden'); countTimer.innerText = t;
  const iv = setInterval(async ()=>{
    t--; countTimer.innerText = t;
    if(t<=0){ clearInterval(iv); countdownEl.classList.add('hidden'); credit(WATCH_REWARD + CAPTCHA_REWARD, 'captcha+ad').then(()=>{ capStatus.innerText = `+ $${(WATCH_REWARD+CAPTCHA_REWARD).toFixed(6)} added`; captchaInput.value=''; genCaptcha(); }).catch(e=>{ capStatus.innerText='Error'; console.error(e)}); }
  },1000);
});

watchBtn?.addEventListener('click', ()=>{
  window.open(AD_URL,'_blank');
  watchStatus.innerText = 'Ad opened — waiting 5s...';
  let t=5; watchStatus.innerText = `Waiting ${t}s...`;
  const iv = setInterval(()=>{ t--; watchStatus.innerText = `Waiting ${t}s...`; if(t<=0){ clearInterval(iv); credit(WATCH_REWARD, 'watch_ad').then(()=>{ watchStatus.innerText = `+ $${WATCH_REWARD.toFixed(6)} added`; }).catch(e=>{ watchStatus.innerText='Error'; }) } },1000);
});
