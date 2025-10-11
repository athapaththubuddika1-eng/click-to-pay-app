// main.js - localStorage DB and common utilities
const LS = {
  get(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){return null} },
  set(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
};
const DB = {
  key: 'ads_click_v2',
  load(){ const db = LS.get(this.key); if(db) return db;
    const init = { users: {}, tasks: [], withdraws: [], settings: { minWithdraw:0.1, watchReward:0.0001, captchaReward:0.0002, referralBonus:0.005, dailyWithdrawLimit:1 } };
    LS.set(this.key, init); return init;
  },
  save(db){ LS.set(this.key, db); }
};
let DBDATA = DB.load();

function uid(len=6){ return Math.random().toString(36).slice(2,2+len).toUpperCase(); }
function now(){ return new Date().toISOString(); }
function money(v){ return '$' + Number(v||0).toFixed(4); }
function currentUser(){ return JSON.parse(localStorage.getItem('acp_current')||'null'); }

// ensure admin user exists in local DB
(function ensureAdmin(){
  const adminEmail = 'hasanbuddika1@gmail.com';
  if(!DBDATA.users[adminEmail]){
    DBDATA.users[adminEmail] = { username:'Admin', email:adminEmail, password:'Aabbcc.123', balance:0, referralCode:'ADMINREF', referrer:null, referrals:[], banned:false, address:'', registeredAt: now() };
    DB.save(DBDATA);
  }
})();

function saveDB(){ DB.save(DBDATA); }

// Register / login
function register({username,email,password,referral}){
  email = email.toLowerCase();
  if(DBDATA.users[email]) throw new Error('Email already registered');
  const code = uid(6);
  DBDATA.users[email] = { username, email, password, balance:0, referralCode:code, referrer:null, referrals:[], banned:false, address:'', registeredAt: now() };
  if(referral){
    const refUser = Object.values(DBDATA.users).find(u => u.referralCode === referral);
    if(refUser){
      DBDATA.users[email].referrer = refUser.email;
      refUser.referrals = refUser.referrals || [];
      refUser.referrals.push(email);
      refUser.balance = Number(refUser.balance || 0) + Number(DBDATA.settings.referralBonus);
      DBDATA.users[email].balance = Number(DBDATA.users[email].balance || 0) + Number(DBDATA.settings.referralBonus);
    }
  }
  saveDB();
  notifyAdmin(`🆕 New registration\n${username} (${email})`);
  return true;
}

function login({email,password}){
  email = email.toLowerCase();
  const user = DBDATA.users[email];
  if(!user) throw new Error('No account');
  if(user.banned) throw new Error('Account banned');
  if(user.password !== password) throw new Error('Invalid password');
  localStorage.setItem('acp_current', JSON.stringify({ email: user.email, username: user.username }));
  return true;
}

function logout(){ localStorage.removeItem('acp_current'); window.location.href='index.html'; }

// Tasks
function addTask({title,url,amount}){ DBDATA.tasks.push({ id: uid(8), title, url, amount: Number(amount), createdAt: now() }); saveDB(); }
function removeTask(id){ DBDATA.tasks = DBDATA.tasks.filter(t=>t.id!==id); saveDB(); }

// Withdraw
function submitWithdraw({email,amount,address}){
  amount = Number(amount);
  if(amount < DBDATA.settings.minWithdraw) throw new Error('Below minimum');
  const user = DBDATA.users[email];
  if(!user) throw new Error('User not found');
  if(Number(user.balance) < amount) throw new Error('Insufficient balance');
  const today = new Date().toISOString().slice(0,10);
  const userToday = (DBDATA.withdraws||[]).filter(w=>w.email===email && (w.createdAt||'').slice(0,10)===today);
  if(userToday.length >= DBDATA.settings.dailyWithdrawLimit) throw new Error('Daily withdraw limit reached');
  const req = { id: uid(9), email, amount, address, status:'pending', createdAt: now() };
  DBDATA.withdraws.push(req); saveDB();
  notifyAdmin(`📥 New withdraw request\nUser: ${user.username}\nAmount: $${amount}\nAddress: ${address}\nStatus: pending`);
  return req;
}

function adminApproveWithdraw(id){
  const w = DBDATA.withdraws.find(x=>x.id===id);
  if(!w) throw new Error('Withdraw not found');
  if(w.status !== 'pending') throw new Error('Already processed');
  const user = DBDATA.users[w.email];
  if(!user) throw new Error('User not found');
  user.balance = Number(user.balance) - Number(w.amount);
  w.status = 'approved'; w.processedAt = now();
  saveDB();
  notifyAdmin(`✅ Withdraw Approved\nUser: ${user.username}\nAmount: $${w.amount}\nAddress: ${w.address}`);
  notifyUser(w.email, `✅ Your withdraw of $${w.amount} has been approved.`);
  return true;
}

function adminRejectWithdraw(id){
  const w = DBDATA.withdraws.find(x=>x.id===id);
  if(!w) throw new Error('Not found');
  w.status = 'rejected'; w.processedAt = now(); saveDB();
  notifyAdmin(`❌ Withdraw Rejected\nUser: ${w.email}\nAmount: $${w.amount}`);
  notifyUser(w.email, `❌ Your withdraw of $${w.amount} has been rejected.`);
  return true;
}

// Admin functions
function adminAddBalanceByEmail(email, amount){ email = email.toLowerCase(); const u = DBDATA.users[email]; if(!u) throw new Error('User not found'); u.balance = Number(u.balance) + Number(amount); saveDB(); notifyUser(email, `💰 Admin added ${money(amount)} to your account.`); return true; }
function banUser(email){ email = email.toLowerCase(); if(DBDATA.users[email]){ DBDATA.users[email].banned = true; saveDB(); } }
function unbanUser(email){ email = email.toLowerCase(); if(DBDATA.users[email]){ DBDATA.users[email].banned = false; saveDB(); } }

// Notifications - call serverless endpoint (Vercel)
function notifyAdmin(message){
  fetch('/api/sendTelegram.js',{method:'POST',headers:{'Content-Type':'application/json'},body: JSON.stringify({ message }) }).catch(()=>{});
}
function notifyUser(email, message){
  notifyAdmin(`User notify: ${email}\n${message}`);
}

// referral helper
function getReferralLinkFor(email){
  const u = DBDATA.users[email];
  if(!u) return '';
  const bot = localStorage.getItem('acp_bot_username') || 'adsclickpaybot';
  return `https://t.me/${bot}?start=${u.referralCode}`;
}

window.APP = { DBDATA, saveDB, register, login, logout, addTask, removeTask, submitWithdraw, adminApproveWithdraw, adminRejectWithdraw, adminAddBalanceByEmail, banUser, unbanUser, getReferralLinkFor, money, currentUser };
