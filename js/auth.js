// auth.js - register/login/profile logic
document.addEventListener('DOMContentLoaded', ()=>{
  // register form if present
  const reg = document.getElementById('registerForm');
  if(reg){
    reg.addEventListener('submit', e=>{
      e.preventDefault();
      const username = reg.querySelector('[name="username"]').value.trim();
      const email = reg.querySelector('[name="email"]').value.trim().toLowerCase();
      const password = reg.querySelector('[name="password"]').value;
      const referral = reg.querySelector('[name="referral"]').value.trim();
      if(!username||!email||!password) return alert('Fill all fields');
      const db = APP.loadDB();
      if(db.users.find(u=>u.email===email)) return alert('Email already registered');
      const code = 'REF' + uid(5);
      const user = { username, email, password, balance:0, referralCode:code, referrer:null, referrals:[], banned:false, address:'', tasksCompleted:0 };
      if(referral){
        const refUser = db.users.find(u=>u.referralCode===referral);
        if(refUser){
          refUser.balance = Number(refUser.balance||0) + Number(db.settings.referralBonus);
          refUser.referrals = refUser.referrals || [];
          refUser.referrals.push(email);
          user.balance = Number(user.balance||0) + Number(db.settings.referralBonus);
          user.referrer = refUser.email;
        }
      }
      db.users.push(user); APP.saveDB(db); setCurrentUser({ email:user.email, username:user.username });
      alert('Registered ✔'); location.href='dashboard.html';
    });
  }

  const login = document.getElementById('loginForm');
  if(login){
    login.addEventListener('submit', e=>{
      e.preventDefault();
      const email = login.querySelector('[name="email"]').value.trim().toLowerCase();
      const password = login.querySelector('[name="password"]').value;
      const db = APP.loadDB();
      const u = db.users.find(x=>x.email===email && x.password===password);
      if(!u) return alert('Invalid credentials');
      if(u.banned) return alert('Account suspended');
      setCurrentUser({ email:u.email, username:u.username });
      location.href='dashboard.html';
    });
  }

  // profile save
  const profile = document.getElementById('profileForm');
  if(profile){
    const cur = currentUser(); if(!cur) return location.href='login.html';
    const db = APP.loadDB(); const u = db.users.find(x=>x.email===cur.email);
    profile.querySelector('[name="username"]').value = u.username || '';
    profile.querySelector('[name="email"]').value = u.email || '';
    profile.querySelector('[name="address"]').value = u.address || '';
    profile.addEventListener('submit', e=>{
      e.preventDefault();
      u.username = profile.querySelector('[name="username"]').value.trim();
      u.address = profile.querySelector('[name="address"]').value.trim();
      APP.saveDB(db);
      setCurrentUser({ email:u.email, username:u.username });
      alert('Saved');
    });
  }
});
function logout(){ localStorage.removeItem('acp_user'); location.href='index.html'; }
