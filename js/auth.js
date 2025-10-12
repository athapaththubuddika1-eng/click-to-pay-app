// js/auth.js
import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { doc, setDoc, getDocs, collection, query, where, getDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const registerBtn = document.getElementById('btnRegister');
const loginBtn = document.getElementById('btnLogin');

function makeReferral(){
  return Math.random().toString(36).substring(2,9).toUpperCase();
}

if(registerBtn){
  registerBtn.addEventListener('click', async ()=>{
    const username = document.getElementById('r_username').value.trim();
    const email = document.getElementById('r_email').value.trim().toLowerCase();
    const pass = document.getElementById('r_pass').value;
    const referredBy = document.getElementById('r_ref').value.trim() || null;
    if(!username||!email||!pass) return alert('Fill all fields');
    try{
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const uid = cred.user.uid;
      const referralCode = makeReferral();
      await setDoc(doc(db,'users',uid), { uid, username, email, balance:0, referralCode, referredBy, banned:false, createdAt:new Date().toISOString() });
      // if referredBy present, credit both
      if(referredBy){
        const q = query(collection(db,'users'), where('referralCode','==', referredBy));
        const snaps = await getDocs(q);
        snaps.forEach(async s=>{
          const owner = s.data();
          await setDoc(doc(db,'users',owner.uid), { ...owner, balance:(owner.balance||0)+0.005 }, { merge:true });
          await setDoc(doc(db,'users',uid), { balance:0.005 }, { merge:true });
        });
      }
      localStorage.setItem('uid', uid);
      location.href='dashboard.html';
    }catch(e){ console.error(e); alert(e.message || e); }
  });
}

if(loginBtn){
  loginBtn.addEventListener('click', async ()=>{
    const email = document.getElementById('l_email').value.trim().toLowerCase();
    const pass = document.getElementById('l_pass').value;
    if(!email||!pass) return alert('Fill fields');
    try{
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const uid = cred.user.uid;
      // check banned
      const userSnap = await getDoc(doc(db,'users',uid));
      if(userSnap.exists() && userSnap.data().banned){ alert('Account is banned'); return; }
      localStorage.setItem('uid', uid);
      location.href='dashboard.html';
    }catch(e){ alert('Invalid login'); }
  });
}
