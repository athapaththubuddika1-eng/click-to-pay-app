/* admin.js
 - Admin client-side panel (localStorage DB)
 - Admin credentials (client-side): hasanbuddika1@gmail.com / Aabbcc.123
 - Functions: approve/reject withdraw, add balance, add/remove tasks, ban/unban
*/

const ADMIN_EMAIL = 'hasanbuddika1@gmail.com';
const ADMIN_PASS = 'Aabbcc.123';
const DB_KEY = 'acp_db_v1';
const USER_KEY = 'acp_user';

function loadDB(){ try{ return JSON.parse(localStorage.getItem(DB_KEY)) || {users:[],tasks:[],withdraws:[],settings:{minWithdraw:0.1,watchReward:0.00015,captchaReward:0.0002,referralBonus:0.005,dailyWithdrawLimit:1}} }catch(e){return {users:[],tasks:[],withdraws:[],settings:{minWithdraw:0.1,watchReward:0.00015,captchaReward:0.0002,referralBonus:0.005,dailyWithdrawLimit:1}} } }
function saveDB(db){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }
function setCurrentUser(u){ localStorage.setItem(USER_KEY, JSON.stringify(u)); }
function currentUser(){ return JSON.parse(localStorage.getItem(USER_KEY)||'null'); }
function money(v){ return '$' + Number(v||0).toFixed(6); }

const loginBtn = document.getElementById('adminLoginBtn');
const loginBox = document.getElementById('loginBox');
const panel = document.getElementById('panel');
const adminEmailShow = document.getElementById('adminEmailShow');

loginBtn.addEventListener('click', ()=> {
  const em = document.getElementById('adminEmail').value.trim().toLowerCase();
  const pw = document.getElementById('adminPass').value.trim();
  if(em === ADMIN_EMAIL && pw === ADMIN_PASS){
    // show panel
    loginBox.style.display = 'none'; panel.style.display = 'block';
    adminEmailShow.innerText = em;
    renderAll();
    localStorage.setItem('isAdminLogged','1');
  } else alert('Invalid admin credentials');
});

// logout admin
document.getElementById('logoutAdmin').addEventListener('click', ()=> {
  localStorage.removeItem('isAdminLogged');
  panel.style.display = 'none'; loginBox.style.display = 'block';
});

// add balance
document.getElementById('doAdd').addEventListener('click', ()=>{
  const email = document.getElementById('addEmail').value.trim().toLowerCase();
  const amount = Number(document.getElementById('addAmount').value || 0);
  if(!email || !amount) return alert('Fill fields');
  const db = loadDB();
  const u = db.users.find(x=>x.email===email);
  if(!u) return alert('User not found');
  u.balance = Number(u.balance||0) + amount;
  saveDB(db);
  alert('Balance added');
  renderAll();
});

// task add
document.getElementById('addTaskBtn').addEventListener('click', ()=>{
  const title = document.getElementById('taskTitle').value.trim();
  const url = document.getElementById('taskUrl').value.trim();
  const amount = Number(document.getElementById('taskAmt').value || 0);
  if(!title || !url || !amount) return alert('Fill task fields');
  const db = loadDB();
  const task = { id: 'T'+Math.random().toString(36).slice(2,10).toUpperCase(), title, url, amount };
  db.tasks = db.tasks || []; db.tasks.push(task); saveDB(db);
  document.getElementById('taskTitle').value=''; document.getElementById('taskUrl').value=''; document.getElementById('taskAmt').value='';
  renderAll();
});

// render functions
function renderAll(){
  const db = loadDB();

  // withdraws
  const wl = document.getElementById('withdrawList'); wl.innerHTML = '';
  (db.withdraws||[]).filter(w=>w.status==='pending').forEach(w=>{
    const li = document.createElement('li');
    li.innerHTML = `<div><strong>${w.email}</strong><div class="small">${w.createdAt.split('T')[0]}</div></div>
                    <div style="display:flex;gap:8px">
                      <button data-id="${w.id}" class="approve">✅</button>
                      <button data-id="${w.id}" class="reject">❌</button>
                    </div>`;
    wl.appendChild(li);
  });
  // hook approve/reject
  document.querySelectorAll('.approve').forEach(b=>b.addEventListener('click', e=>adminApprove(e.target.dataset.id)));
  document.querySelectorAll('.reject').forEach(b=>b.addEventListener('click', e=>adminReject(e.target.dataset.id)));

  // tasks list
  const tl = document.getElementById('taskList'); tl.innerHTML='';
  (db.tasks||[]).forEach((t, idx)=>{
    const li = document.createElement('li');
    li.innerHTML = `<div><strong>${t.title}</strong><div class="small">${t.url}</div></div><div><span class="small">${money(t.amount)}</span> <button data-idx="${idx}" class="delTask">🗑️</button></div>`;
    tl.appendChild(li);
  });
  document.querySelectorAll('.delTask').forEach(b=>b.addEventListener('click', e=>{
    const idx = Number(e.target.dataset.idx);
    const db2 = loadDB(); db2.tasks.splice(idx,1); saveDB(db2); renderAll();
  }));

  // users
  const ul = document.getElementById('userList'); ul.innerHTML = '';
  (db.users||[]).forEach(u=>{
    const li = document.createElement('li');
    li.innerHTML = `<div><strong>${u.username||u.email}</strong><div class="small">${u.email}</div></div>
                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
                      <div class="small">Bal: ${money(u.balance)}</div>
                      <div><button data-email="${u.email}" class="banBtn">${u.banned? 'Unban':'Ban'}</button></div>
                    </div>`;
    ul.appendChild(li);
  });
  document.querySelectorAll('.banBtn').forEach(b=>b.addEventListener('click', e=>{
    const email = e.target.dataset.email;
    const db3 = loadDB(); const u = db3.users.find(x=>x.email===email);
    if(!u) return;
    u.banned = !u.banned; saveDB(db3); renderAll();
  }));
}

// admin approve/reject functions
function adminApprove(id){
  const db = loadDB(); const w = db.withdraws.find(x=>x.id===id);
  if(!w) return alert('Not found');
  w.status = 'approved'; w.processedAt = new Date().toISOString();
  // send telegram notify (non-blocking)
  try{
    fetch('/api/sendTelegram', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text:`✅ Withdraw Approved\nUser: ${w.email}\nAmount: ${w.amount}\nAddress: ${w.address}` }) }).catch(()=>{});
  }catch(e){}
  saveDB(db); renderAll(); alert('Withdraw approved');
}

function adminReject(id){
  const db = loadDB(); const w = db.withdraws.find(x=>x.id===id); if(!w) return alert('Not found');
  w.status = 'rejected'; w.processedAt = new Date().toISOString();
  // refund the user
  const u = db.users.find(x=>x.email===w.email); if(u) u.balance = Number(u.balance||0) + Number(w.amount);
  try{
    fetch('/api/sendTelegram', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text:`❌ Withdraw Rejected\nUser: ${w.email}\nAmount: ${w.amount}` }) }).catch(()=>{});
  }catch(e){}
  saveDB(db); renderAll(); alert('Withdraw rejected and refunded');
}

// if admin already logged (persist)
if(localStorage.getItem('isAdminLogged') === '1'){
  loginBox.style.display = 'none'; panel.style.display = 'block'; adminEmailShow.innerText = ADMIN_EMAIL; renderAll();
}
