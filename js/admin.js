// admin.js - client-side admin panel
document.addEventListener('DOMContentLoaded', ()=>{
  const adminForm = document.getElementById('adminLoginForm');
  if(adminForm){
    adminForm.addEventListener('submit', e=>{
      e.preventDefault();
      const em = adminForm.querySelector('[name="email"]').value.trim().toLowerCase();
      const pw = adminForm.querySelector('[name="password"]').value;
      // Basic client-side check; production should use server auth
      if(em === 'hasanbuddika1@gmail.com' && pw === 'Aabbcc.123'){
        document.getElementById('adminControls').hidden = false; adminForm.style.display='none'; loadAdminData();
      } else alert('Invalid admin credentials');
    });
  }

  document.getElementById && (function(){
    const addBalBtn = document.getElementById('adminAddBalanceBtn');
    if(addBalBtn) addBalBtn.addEventListener('click', ()=>{
      const email = document.getElementById('adminEmailTarget').value.trim().toLowerCase();
      const amount = Number(document.getElementById('adminAddAmount').value||0);
      const db = loadDB(); const u = db.users.find(x=>x.email===email);
      if(!u) return alert('User not found');
      u.balance = Number(u.balance||0) + amount; saveDB(db); alert('Balance added'); loadAdminData();
    });

    document.getElementById('addTaskBtn') && document.getElementById('addTaskBtn').addEventListener('click', ()=>{
      const title = document.getElementById('taskTitle').value.trim();
      const url = document.getElementById('taskUrl').value.trim();
      const amount = Number(document.getElementById('taskAmount').value||0);
      if(!title||!url||!amount) return alert('Fill task fields');
      const db = loadDB(); db.tasks.push({ id: uid(10), title, url, amount }); saveDB(db); loadAdminData();
    });
  })();

  window.loadAdminData = function(){
    const db = loadDB();
    const userListEl = document.getElementById('adminUserList'); userListEl.innerHTML='';
    db.users.forEach(u=>{
      const li=document.createElement('li');
      li.innerHTML = `<strong>${u.username}</strong> — ${u.email} — ${money(u.balance)} — Ref:${(u.referrals||[]).length} <button data-email="${u.email}" class="banBtn">${u.banned?'Unban':'Ban'}</button>`;
      userListEl.appendChild(li);
    });
    document.querySelectorAll('.banBtn').forEach(b=>b.addEventListener('click', e=>{
      const email = e.target.dataset.email; const db = loadDB(); const u = db.users.find(x=>x.email===email);
      u.banned = !u.banned; saveDB(db); loadAdminData();
    }));

    const wl = document.getElementById('adminWithdrawList'); wl.innerHTML='';
    db.withdraws.filter(w=>w.status==='pending').forEach(w=>{
      const li=document.createElement('li');
      li.innerHTML = `${w.createdAt.split('T')[0]} — ${w.email} — ${money(w.amount)} — ${w.address} <button data-id="${w.id}" class="approve">Approve</button> <button data-id="${w.id}" class="reject">Reject</button>`;
      wl.appendChild(li);
    });
    document.querySelectorAll('.approve').forEach(b=>b.addEventListener('click', e=>adminApprove(e.target.dataset.id)));
    document.querySelectorAll('.reject').forEach(b=>b.addEventListener('click', e=>adminReject(e.target.dataset.id)));

    const taskListEl = document.getElementById('adminTaskList'); taskListEl.innerHTML='';
    db.tasks.forEach((t, idx)=>{ const li=document.createElement('li'); li.innerHTML = `${t.title} — ${t.url} — ${money(t.amount)} <button data-idx="${idx}" class="delTask">Remove</button>`; taskListEl.appendChild(li); });
    document.querySelectorAll('.delTask').forEach(b=>b.addEventListener('click', e=>{ const idx=Number(e.target.dataset.idx); const db=loadDB(); db.tasks.splice(idx,1); saveDB(db); loadAdminData(); }));
  };

  function adminApprove(id){
    const db = loadDB(); const w = db.withdraws.find(x=>x.id===id); if(!w) return;
    w.status='approved'; w.processedAt = new Date().toISOString();
    // notify telegram
    fetch('/api/sendTelegram', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text:`✅ Withdraw Approved\nUser: ${w.email}\nAmount: ${money(w.amount)}\nAddress: ${w.address}` }) }).catch(()=>{});
    saveDB(db); loadAdminData(); alert('Approved');
  }
  function adminReject(id){
    const db = loadDB(); const w = db.withdraws.find(x=>x.id===id); if(!w) return;
    w.status='rejected'; w.processedAt = new Date().toISOString();
    const u = db.users.find(x=>x.email===w.email); if(u) u.balance = Number(u.balance||0) + Number(w.amount);
    saveDB(db); loadAdminData();
    fetch('/api/sendTelegram', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text:`❌ Withdraw Rejected\nUser: ${w.email}\nAmount: ${money(w.amount)}` }) }).catch(()=>{});
    alert('Rejected and refunded');
  }
});
