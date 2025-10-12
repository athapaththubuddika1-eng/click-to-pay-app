// js/referral.js
import { db } from './firebase.js';
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const uid = localStorage.getItem('uid');
if(!uid) location.href='login.html';

const refInput = document.getElementById('refInput');
const copyBtn = document.getElementById('copyRef');
const openBtn = document.getElementById('openRef');
const refCount = document.getElementById('refCount');

async function init(){
  const uRef = doc(db,'users',uid);
  const snap = await getDoc(uRef);
  if(!snap.exists()) return;
  const code = snap.data().referralCode;
  const link = `https://t.me/adsclickpaybot?start=${code}`;
  if(refInput) refInput.value = link;
  if(copyBtn) copyBtn.onclick = ()=>{ navigator.clipboard.writeText(link); alert('Copied'); };
  if(openBtn) openBtn.onclick = ()=> window.open(link,'_blank');
  const q = query(collection(db,'users'), where('referredBy','==', code));
  const snaps = await getDocs(q);
  if(refCount) refCount.innerText = snaps.size;
}
init();
