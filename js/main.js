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

// --- Add to end of js/main.js to wire forms & pages ---
document.addEventListener('DOMContentLoaded', ()=>{

  // Dashboard update
  if(document.getElementById('welcomeMsg')){
    const u = currentUser();
    if(u){
      document.getElementById('welcomeMsg').textContent = `Welcome Back ${u.username} 👋`;
      document.getElementById('currentBalance').textContent = formatMoney(u.balance||0);
      document.getElementById('dashboardTotalWithdraw').textContent = formatMoney(DB.withdraws.filter(w=>w.status==='approved').reduce((s,w)=>s+Number(w.amount||0),0));
      document.getElementById('tasksCompleted').textContent = u.tasksCompleted || 0;
      document.getElementById('userReferrals').textContent = (u.referrals||[]).length;
    } else {
      // redirect if not logged in
    }
  }

  // Tasks rendering (tasks.html)
  const tasksContainer = document.getElementById('tasksContainer');
  if(tasksContainer){
    tasksContainer.innerHTML = '';
    DB.tasks.forEach((t,i)=>{
      const row = document.createElement('div');
      row.className = 'taskItem card';
      row.innerHTML = `<h4>${t.title}</h4><p>Reward: ${t.reward}</p><div class="task-buttons">
        <button class="btn join" data-id="${i}">Join</button>
        <button class="btn claim hidden" data-id="${i}">Claim</button>
      </div>`;
      tasksContainer.appendChild(row);
    });
    tasksContainer.querySelectorAll('.join').forEach(btn=>{
      btn.addEventListener('click',(e)=>{
        const id = btn.dataset.id;
        const task = DB.tasks[id];
        const w = window.open(task.url, '_blank');
        if(!w){ alert('Popup blocked, allow popups'); return; }
        // enable claim after 5s
        const claimBtn = btn.parentElement.querySelector('.claim');
        let t=5; btn.textContent=`Open - waiting ${t}s...`;
        const iv=setInterval(()=>{
          t--; btn.textContent=`Open - waiting ${t}s...`;
          if(t<=0){ clearInterval(iv); btn.classList.add('hidden'); claimBtn.classList.remove('hidden'); claimBtn.textContent='Claim';}
        },1000);
      });
    });
    tasksContainer.querySelectorAll('.claim').forEach(btn=>{
      btn.addEventListener('click',(e)=>{
        const id=btn.dataset.id;
        const user = currentUser();
        if(!user) return alert('Login');
        // add reward and remove task for this user (one time)
        DB.users[user.email].balance = Number(DB.users[user.email].balance || 0) + Number(DB.tasks[id].reward || 0);
        DB.users[user.email].tasksCompleted = (DB.users[user.email].tasksCompleted || 0) + 1;
        // remove the task globally (one-time tasks) if desired
        DB.tasks.splice(id,1);
        DB.save();
        alert('Reward added');
        window.location.reload();
      });
    });
  }

  // Withdraw submit
  const withdrawForm = document.getElementById('withdrawForm');
  if(withdrawForm){
    withdrawForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(withdrawForm); const {address,amount} = Object.fromEntries(fd.entries());
      const user = currentUser(); if(!user) return alert('Login required');
      // daily withdraw limit: check if user has withdraw requests today
      const today = (new Date()).toISOString().slice(0,10);
      const userWithdrawsToday = DB.withdraws.filter(w => w.email===user.email && (w.created_at||'').slice(0,10)===today);
      if(userWithdrawsToday.length >= 1) return alert('Daily withdraw limit reached (1 per day)');
      if(Number(amount) < DB.settings.minWithdraw) return alert('Amount below minimum');
      if(Number(amount) > Number(user.balance)) return alert('Not enough balance');
      const req = { id: uid(8), email:user.email, address, amount:Number(amount), status:'pending', created_at:now() };
      DB.withdraws.push(req); DB.save();
      notifyAdminBot(`💸 Withdraw Request\nUser: ${user.username}\nAmount: ${amount}\nAddress: ${address}\nStatus: pending`);
      alert('Withdraw request submitted');
      window.location.reload();
    });
  }

  // withdraw history display
  const hist = document.getElementById('withdrawHistory');
  if(hist){
    hist.innerHTML = '';
    DB.withdraws.filter(w=>w.email=== (currentUser()?.email)).reverse().forEach(w=>{
      const el = document.createElement('div'); el.className='withdrawRow';
      el.innerHTML = `<div>${formatMoney(w.amount)} — ${w.status} — ${w.created_at}</div>`;
      hist.appendChild(el);
    });
  }

  // profile save
  const profileForm = document.getElementById('profileForm');
  if(profileForm){
    const u = currentUser(); if(u){
      profileForm.username.value = u.username || '';
      profileForm.profileAddress.value = u.address || '';
    }
    profileForm.addEventListener('submit',(e)=>{ e.preventDefault();
      const fd = new FormData(profileForm); const {username, address} = Object.fromEntries(fd.entries());
      const u = currentUser(); if(!u) return alert('Login');
      DB.users[u.email].username = username; DB.users[u.email].address = address; DB.save();
      alert('Profile saved');
    });
  }

  // admin tasks and users rendering on admin page
  const adminTasksDiv = document.getElementById('adminTasks');
  const adminUsersDiv = document.getElementById('adminUsers');
  if(adminTasksDiv) {
    adminTasksDiv.innerHTML = '';
    DB.tasks.forEach((t,i)=> adminTasksDiv.insertAdjacentHTML('beforeend',`<div>${t.title} - ${t.url} - ${t.reward} <button data-id="${i}" class="del">Remove</button></div>`));
    adminTasksDiv.querySelectorAll('.del').forEach(b=>b.addEventListener('click',()=>{ DB.tasks.splice(b.dataset.id,1); DB.save(); location.reload(); }));
  }
  if(adminUsersDiv){
    adminUsersDiv.innerHTML=''; Object.values(DB.users).forEach(u=>{
      if(u.email===ADMIN_CRED.email) return;
      adminUsersDiv.insertAdjacentHTML('beforeend',`<div>${u.username} (${u.email}) - ${formatMoney(u.balance)} - <button data-email="${u.email}" class="ban">${u.banned?'Unban':'Ban'}</button></div>`);
    });
    adminUsersDiv.querySelectorAll('.ban').forEach(b=>b.addEventListener('click',()=>{ const e=b.dataset.email; DB.users[e].banned=!DB.users[e].banned; DB.save(); location.reload();}));
  }

});
