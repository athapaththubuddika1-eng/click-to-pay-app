// main.js - common helpers & local DB init
const LS_KEY = 'acp_db_v1';
function loadDB(){
  const raw = localStorage.getItem(LS_KEY);
  if(raw) try{return JSON.parse(raw)}catch(e){}
  const init = {
    users: [], // {username,email,password,balance,referralCode,referrer,referrals:[],banned,address,tasksCompleted}
    tasks: [], // {id,title,url,amount}
    withdraws: [], // {id,email,amount,address,status,createdAt,processedAt}
    settings: { minWithdraw:0.1, watchReward:0.0001, captchaReward:0.0002, referralBonus:0.005, dailyWithdrawLimit:1 }
  };
  localStorage.setItem(LS_KEY, JSON.stringify(init));
  return init;
}
function saveDB(db){ localStorage.setItem(LS_KEY, JSON.stringify(db)); }
window.APP = { loadDB, saveDB };

function uid(n=8){ return Math.random().toString(36).slice(2,2+n).toUpperCase(); }
function money(v){ return '$' + Number(v||0).toFixed(4); }
function currentUser(){ return JSON.parse(localStorage.getItem('acp_user')||'null'); }
function setCurrentUser(obj){ localStorage.setItem('acp_user', JSON.stringify(obj)); }
function ensureLogged(){ const u=currentUser(); if(!u) { location.href='login.html'; return null } return u; }

// quick UI
function showModal(html){
  let m = document.getElementById('globalModal');
  if(!m){
    m = document.createElement('div'); m.id='globalModal'; m.className='modal';
    m.innerHTML = `<div class="modal-card">${html}</div>`;
    document.body.appendChild(m);
  } else m.querySelector('.modal-card').innerHTML = html;
  m.classList.add('show');
}
function hideModal(){ const m=document.getElementById('globalModal'); if(m) m.classList.remove('show'); }

// init default admin user if none
(function ensureAdmin(){
  const db = loadDB();
  const adminEmail = 'hasanbuddika1@gmail.com';
  if(!db.users.find(u=>u.email===adminEmail)){
    db.users.push({ username:'Admin', email:adminEmail, password:'Aabbcc.123', balance:0, referralCode:'REFADMIN', referrer:null, referrals:[], banned:false, address:'', tasksCompleted:0 });
    saveDB(db);
  }
})();
