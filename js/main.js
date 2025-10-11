// main.js - helpers & DB init
const LS_KEY = 'acp_db_v1';
const CUR_USER = 'acp_user';

function loadDB(){
  const raw = localStorage.getItem(LS_KEY);
  if(raw) try{ return JSON.parse(raw); } catch(e){}
  const init = {
    users: [],
    tasks: [],
    withdraws: [],
    settings: { minWithdraw:0.1, watchReward:0.0001, captchaReward:0.0002, referralBonus:0.005, dailyWithdrawLimit:1 }
  };
  localStorage.setItem(LS_KEY, JSON.stringify(init));
  return init;
}
function saveDB(db){ localStorage.setItem(LS_KEY, JSON.stringify(db)); }
function uid(n=8){ return Math.random().toString(36).slice(2,2+n).toUpperCase(); }
function money(v){ return '$' + Number(v||0).toFixed(4); }
function currentUser(){ return JSON.parse(localStorage.getItem(CUR_USER) || 'null'); }
function setCurrentUser(u){ localStorage.setItem(CUR_USER, JSON.stringify(u)); }
function logout(){ localStorage.removeItem(CUR_USER); location.href='index.html'; }
function ensureLogged(){ const u=currentUser(); if(!u) { location.href='login.html'; return null; } return u; }

// quick UI functions
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

// Ensure admin user exists
(function ensureAdmin(){
  const db = loadDB();
  const adminEmail = 'hasanbuddika1@gmail.com';
  if(!db.users.find(u=>u.email===adminEmail)){
    db.users.push({
      username:'Admin', email:adminEmail, password:'Aabbcc.123', balance:0,
      referralCode:'REFADMIN', referrer:null, referrals:[], banned:false, address:'', tasksCompleted:0
    }); saveDB(db);
  }
})();
