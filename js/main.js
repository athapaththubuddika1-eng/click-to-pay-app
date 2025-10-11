// main.js - shared UI + local DB helpers
const LS = {
  get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},
  set(k,v){localStorage.setItem(k,JSON.stringify(v))},
  remove(k){localStorage.removeItem(k)}
};

const DB = {
  // users: { email: {username,email,password,balance,referralCode,referrer, banned:false, address, registeredAt, referrals:[] } }
  load(){
    this.users = LS.get('acp_users') || {};
    this.tasks = LS.get('acp_tasks') || [];
    this.withdraws = LS.get('acp_withdraws') || [];
    this.settings = LS.get('acp_settings') || {minWithdraw:0.1, watchReward:0.0001, captchaReward:0.0002, referralBonus:0.005};
  },
  save(){ LS.set('acp_users',this.users); LS.set('acp_tasks',this.tasks); LS.set('acp_withdraws',this.withdraws); LS.set('acp_settings',this.settings) }
};
DB.load();

// helpers
function uid(len=6){ return Math.random().toString(36).slice(2,2+len).toUpperCase();}
function formatMoney(n){ return '$'+Number(n||0).toFixed(4); }
function now(){ return new Date().toISOString() }

// create admin account hidden (do not display credentials on admin page)
const ADMIN_CRED = { email:'hasanbuddika1@gmail.com', password:'Aabbcc.123' };
if(!DB.users[ADMIN_CRED.email]){
  DB.users[ADMIN_CRED.email] = {
    username:'__ADMIN__', email:ADMIN_CRED.email, password:ADMIN_CRED.password,
    balance:0, referralCode:'ADMIN', referrer:null, banned:false, address:'', registeredAt:now(), referrals:[]
  };
  DB.save();
}

// UI init
document.addEventListener('DOMContentLoaded',()=>{
  // Global loading hide
  const gl = document.getElementById('globalLoading');
  if(gl) setTimeout(()=>gl.classList.add('hidden'),600);

  // fill summary on index
  const tm = document.getElementById('totalMembers');
  if(tm) tm.textContent = Object.keys(DB.users).length;
  const tw = document.getElementById('totalWithdraws');
  if(tw) tw.textContent = DB.withdraws.length;
  const twa = document.getElementById('totalWithdrawAmount');
  if(twa) twa.textContent = formatMoney(DB.withdraws.reduce((s,w)=>s+Number(w.amount||0),0));

  // referral page
  const refCodeEl = document.getElementById('myReferralCode');
  const refLinkEl = document.getElementById('myReferralLink');
  const copyBtn = document.getElementById('copyReferral');
  if(refCodeEl && refLinkEl){
    const user = currentUser();
    if(user){
      const code = user.referralCode || generateReferralFor(user);
      refCodeEl.textContent = code;
      // create telegram link format
      const botName = localStorage.getItem('acp_bot_username') || 'adsclickpaybot';
      const link = `https://t.me/${botName}?start=${code}`;
      refLinkEl.value = link;
      if(copyBtn) copyBtn.addEventListener('click',()=>{ navigator.clipboard.writeText(link).then(()=>alert('Referral link copied'))});
      const invitedCount = DB.users[user.email].referrals?.length||0;
      const inv = document.getElementById('invitedCount'); if(inv) inv.textContent = `You have invited ${invitedCount} people.`;
    } else {
      refCodeEl.textContent='-';
      refLinkEl.value='';
    }
  }

  // admin tab show/hide depending on admin login
  // etc...
});

// current logged-in user (email stored in localStorage 'acp_current')
function currentUser(){
  const email = localStorage.getItem('acp_current');
  if(!email) return null;
  return DB.users[email] || null;
}

// generate referral for user if not present
function generateReferralFor(user){
  if(!user) return null;
  if(!DB.users[user.email]) return null;
  if(!DB.users[user.email].referralCode){
    let c=uid(6);
    while(Object.values(DB.users).some(u=>u.referralCode===c)) c=uid(6);
    DB.users[user.email].referralCode=c;
    DB.save();
  }
  return DB.users[user.email].referralCode;
}

// register handler used in auth.js but helper here
function registerUser({username,email,password,referral}){
  email=email.toLowerCase();
  if(DB.users[email]) throw new Error('Email already registered');
  const code = uid(6);
  DB.users[email] = {
    username, email, password, balance:0, referralCode:code, referrer:null,
    banned:false, address:'', registeredAt:now(), referrals:[]
  };
  if(referral){
    // find referrer
    const refUser = Object.values(DB.users).find(u=>u.referralCode===referral);
    if(refUser){
      DB.users[email].referrer = refUser.email;
      DB.users[refUser.email].referrals = DB.users[refUser.email].referrals || [];
      DB.users[refUser.email].referrals.push(email);
      // give both bonuses
      DB.users[refUser.email].balance = Number(DB.users[refUser.email].balance || 0) + Number(DB.settings.referralBonus);
      DB.users[email].balance = Number(DB.users[email].balance || 0) + Number(DB.settings.referralBonus);
    }
  }
  DB.save();
  // send bot notify new registration
  notifyAdminBot(`🆕 New registration\n${username} (${email})`);
}

function notifyAdminBot(text){
  // Check env stored in localStorage for demo. In production set env on server or Vercel and call via serverless function.
  const token = localStorage.getItem('acp_bot_token');
  const chatId = localStorage.getItem('acp_bot_chatid');
  if(!token || !chatId) return;
  fetch(`https://api.telegram.org/bot${token}/sendMessage`,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ chat_id: chatId, text })
  }).catch(()=>{ /* ignore errors */});
}

// small helper to require login for certain pages
function requireLogin(redirectTo='login.html'){
  if(!currentUser()){
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

// Exports for other scripts
window.APP = {
  DB, LS, uid, formatMoney, currentUser, registerUser, notifyAdminBot, generateReferralFor
};
