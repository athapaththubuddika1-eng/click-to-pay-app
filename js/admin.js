document.addEventListener('DOMContentLoaded', ()=>{
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminPanel = document.getElementById('adminPanel');
  if(adminLoginForm){
    adminLoginForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(adminLoginForm); const data = Object.fromEntries(fd.entries());
      try{
        const res = await fetch('/api/adminAuth.js', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: data.email, password: data.password }) });
        const j = await res.json();
        if(j.ok){ adminLoginForm.classList.add('hidden'); adminPanel.classList.remove('hidden'); loadAdminData(); } else alert('Invalid admin creds');
      }catch(err){ alert('Admin auth error'); }
    });
  }

  const addTaskForm = document.getElementById('addTaskForm');
  if(addTaskForm){
    addTaskForm.addEventListener('submit',(e)=>{
      e.preventDefault();
      const fd = new FormData(addTaskForm); const t = Object.fromEntries(fd.entries());
      APP.addTask({ title:t.title, url:t.url, amount:t.amount }); alert('Task added'); loadAdminData();
    });
  }

  const addBalanceForm = document.getElementById('addBalanceForm');
  if(addBalanceForm){
    addBalanceForm.addEventListener('submit',(e)=>{
      e.preventDefault();
      const fd = new FormData(addBalanceForm); const d = Object.fromEntries(fd.entries());
      try{ APP.adminAddBalanceByEmail(d.email.toLowerCase(), Number(d.amount)); alert('Balance updated'); loadAdminData(); }catch(err){ alert(err.message); }
    });
  }

  function loadAdminData(){
    const usersWrap = document.getElementById('adminUsers'); usersWrap.innerHTML='';
    Object.values(APP.DBDATA.users).forEach(u=>{
      const div = document.createElement('div'); div.className='card';
      div.innerHTML = `<strong>${u.username}</strong> <small>${u.email}</small><div>Balance: ${APP.money(u.balance)} Referrals: ${u.referrals?.length||0}</div>
        <div style="margin-top:8px"><button class="btn" data-email="${u.email}" onclick="banUserAction('${u.email}')">${u.banned? 'Unban':'Ban'}</button></div>`;
      usersWrap.appendChild(div);
    });

    const wWrap = document.getElementById('adminWithdraws'); wWrap.innerHTML='';
    APP.DBDATA.withdraws.forEach(w=>{
      const d = document.createElement('div'); d.className='card';
      d.innerHTML = `<div><strong>${w.email}</strong> ${APP.money(w.amount)} - ${w.address} - ${w.status}</div>
        <div style="margin-top:8px"><button class="btn" onclick="approve('${w.id}')">Approve</button> <button class="btn" onclick="reject('${w.id}')">Reject</button></div>`;
      wWrap.appendChild(d);
    });

    const tWrap = document.getElementById('adminTasks'); tWrap.innerHTML='';
    APP.DBDATA.tasks.forEach(t=>{
      const el = document.createElement('div'); el.className='card';
      el.innerHTML = `<div><strong>${t.title}</strong> ${t.url} - ${t.amount} <button class="btn" onclick="removeTask('${t.id}')">Remove</button></div>`;
      tWrap.appendChild(el);
    });
  }

  window.loadAdminData = loadAdminData;
  window.removeTask = (id)=>{ APP.removeTask(id); loadAdminData(); }
  window.approve = (id)=>{ try{ APP.adminApproveWithdraw(id); loadAdminData(); alert('Approved'); }catch(e){ alert(e.message); } }
  window.reject = (id)=>{ try{ APP.adminRejectWithdraw(id); loadAdminData(); alert('Rejected'); }catch(e){ alert(e.message); } }
  window.banUserAction = (email)=>{ const u = APP.DBDATA.users[email]; if(!u) return; if(u.banned) APP.unbanUser(email); else APP.banUser(email); loadAdminData(); }
});
