// auth.js - register / login / profile
document.addEventListener('DOMContentLoaded', ()=>{
  // Register page
  const regForm = document.getElementById('registerForm');
  if(regForm){
    regForm.addEventListener('submit', e=>{
      e.preventDefault();
      const username = regForm.querySelector('[name="username"]').value.trim();
      const email = regForm.querySelector('[name="email"]').value.trim().toLowerCase();
      const password = regForm.querySelector('[name="password"]').value;
      const referral = regForm.querySelector('[name="referral"]').value.trim();
      if(!username||!email||!password) return alert('Fill all fields');
      const db = loadDB();
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
      db.users.push(user); saveDB(db);
      setCurrentUser({ email:user.email, username:user.username });
      // notify admin of new registration
      fetch('/api/sendTelegram', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text:`🆕 New registration\n${user.username} (${user.email})` }) }).catch(()=>{});
      alert('Registered ✔'); location.href='dashboard.html';
    });
  }

  // Login page
  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', e=>{
      e.preventDefault();
      const email = loginForm.querySelector('[name="email"]').value.trim().toLowerCase();
      const password = loginForm.querySelector('[name="password"]').value;
      const db = loadDB();
      const u = db.users.find(x=>x.email===email && x.password===password);
      if(!u) return alert('Invalid credentials');
      if(u.banned) return alert('Account suspended');
      setCurrentUser({ email:u.email, username:u.username });
      alert('Login success'); location.href='dashboard.html';
    });
  }

  // Profile page
  const profileForm = document.getElementById('profileForm');
  if(profileForm){
    const cur = currentUser(); if(!cur) return location.href='login.html';
    const db = loadDB(); const u = db.users.find(x=>x.email===cur.email);
    profileForm.querySelector('[name="username"]').value = u.username || '';
    profileForm.querySelector('[name="email"]').value = u.email || '';
    profileForm.querySelector('[name="address"]').value = u.address || '';
    profileForm.addEventListener('submit', e=>{
      e.preventDefault();
      u.username = profileForm.querySelector('[name="username"]').value.trim();
      u.address = profileForm.querySelector('[name="address"]').value.trim();
      saveDB(db); setCurrentUser({ email:u.email, username:u.username });
      alert('Profile saved');
    });
  }
});
