// js/referral.js - generate/copy referral link & count referrals
import { db } from './firebase.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

const uid = localStorage.getItem('uid');
if(!uid) location.href='login.html';

const refInput = document.getElementById('refInput');
const copyRef = document.getElementById('copyRef');
const openRef = document.getElementById('openRef');
const refCount = document.getElementById('refCount');

async function init(){
  const s = await get(ref(db, `users/${uid}`));
  if(!s.exists()) return;
  const code = s.val().referralCode;
  const link = `https://t.me/adsclickpaybot?start=${code}`;
  refInput.value = link;
  copyRef.onclick = ()=>{ navigator.clipboard.writeText(link); alert('Copied'); };
  openRef.onclick = ()=> window.open(link,'_blank');
  // count referrals
  const all = await get(ref(db,'users')); let cnt=0;
  all.forEach(child=>{ const v = child.val(); if(v.referredBy === code) cnt++; });
  refCount.innerText = cnt;
}
init();
