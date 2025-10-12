// js/auth.js - Register & Login (Firebase Auth + Realtime DB)
import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

function makeReferral(){ return Math.random().toString(36).substring(2,9).toUpperCase(); }

const registerBtn = document.getElementById('btnRegister');
const loginBtn = document.getElementById('btnLogin');

registerBtn?.addEventListener('click', async ()=>{
  const username = document.getElementById('r_username').value.trim();
  const email = document.getElementById('r_email').value.trim().toLowerCase();
  const pass = document.getElementById('r_pass').value;
  const referredBy = document.getElementById('r_ref').value.trim() || null;
  if(!username||!email||!pass) return alert('Please fill all fields');
  try{
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;
    const code = makeReferral();
    await set(ref(db, `users/${uid}`), { uid, username, email, balance:0.0, referralCode: code, referredBy: referredBy || null, banned:false, createdAt:new Date().toISOString() });
    // referral bonus if valid
    if(referredBy){
      const all = await get(child(ref(db), 'users'));
      if(all.exists()){
        const users = all.val();
        for(const k in users){
          if(users[k].referralCode === referredBy){
            // credit referred and owner
            await update(ref(db, `users/${k}`), { balance: (Number(users[k].balance||0) + 0.005) });
            await update(ref(db, `users/${uid}`), { balance: 0.005 });
            break;
          }
        }
      }
    }
    localStorage.setItem('uid', uid);
    location.href='dashboard.html';
  }catch(e){ console.error(e); alert(e.message || e); }
});

loginBtn?.addEventListener('click', async ()=>{
  const email = document.getElementById('l_email').value.trim().toLowerCase();
  const pass = document.getElementById('l_pass').value;
  if(!email||!pass) return alert('Please fill all fields');
  try{
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;
    const snap = await get(child(ref(db), `users/${uid}`));
    // check banned (we stored banned flag in DB)
    const userSnap = await get(ref(db, `users/${uid}`));
    if(userSnap.exists() && userSnap.val().banned){ alert('Your account is suspended'); return; }
    localStorage.setItem('uid', uid);
    location.href='dashboard.html';
  }catch(e){ console.error(e); alert('Invalid login'); }
});
