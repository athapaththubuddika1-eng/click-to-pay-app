// admin page behavior
document.addEventListener('DOMContentLoaded',()=>{
  const adminForm = document.getElementById('adminLoginForm');
  const adminControls = document.getElementById('adminControls');
  const usersDiv = document.getElementById('adminUsers');
  const addBalanceForm = document.getElementById('addBalanceForm');
  const addTaskForm = document.getElementById('addTaskForm');
  const adminTasks = document.getElementById('adminTasks');
  const adminWithdraws = document.getElementById('adminWithdraws');

  let loggedAdmin = false;
  function renderUsers(){
    if(!usersDiv) return;
    usersDiv.innerHTML = '';
    Object.values(APP.DB.users).forEach(u=>{
      const el = document.createElement('div'); el.className='userRow';
      el.innerHTML = `<strong>${u.username}</strong> ${u.email} - Balance ${formatMoney(u.balance || 0)} - Referrals ${u.referrals?.length||0}
        <button data-email="${u.email}" class="banBtn">${u.banned?'Unban':'Ban'}</button>
      `;
      usersDiv.appendChild(el);
    });
    usersDiv.querySelectorAll('.banBtn').forEach(b=>{
      b.addEventListener('click',(ev)=>{
        const email = b.dataset.email; APP.DB.users[email].banned = !APP.DB.users[email].banned; APP.DB.save(); renderUsers();
      });
    });
  }

  function renderTasks(){
    if(!adminTasks) return;
    adminTasks.innerHTML = '';
    APP.DB.tasks = APP.DB.tasks || [];
    APP.DB.tasks.forEach((t,i)=>{
      const d = document.createElement('div'); d.innerHTML = `<strong>${t.title}</strong> (${t.url}) - reward ${t.reward} <button data-id="${i}" class="delTask">Remove</button>`;
      adminTasks.appendChild(d);
    });
    adminTasks.querySelectorAll('.delTask').forEach(btn=>{
      btn.addEventListener('click',()=>{ const id=btn.dataset.id; APP.DB.tasks.splice(id,1); APP.DB.save(); renderTasks(); });
    });
  }

  function renderWithdraws(){
    if(!adminWithdraws) return;
    adminWithdraws.innerHTML = '';
    APP.DB.withdraws.forEach((w,i)=>{
      const el = document.createElement('div');
      el.innerHTML = `<div><strong>${w.email}</strong> ${formatMoney(w.amount)} - ${w.address} - ${w.status || 'pending'} 
        <button data-id="${i}" class="approve">Approve</button><button data-id="${i}" class="reject">Reject</button></div>`;
      adminWithdraws.appendChild(el);
    });
    adminWithdraws.querySelectorAll('.approve').forEach(b=>{
      b.addEventListener('click',()=>{ const id=b.dataset.id; const w=APP.DB.withdraws[id]; if(!w) return;
        // mark approved, reduce user balance and notify
        w.status='approved'; APP.DB.withdraws[id]=w;
        if(APP.DB.users[w.email]) {
          APP.DB.users[w.email].balance = Number(APP.DB.users[w.email].balance || 0) - Number(w.amount || 0);
        }
        APP.DB.save(); renderWithdraws(); // notify via bot
        APP.notifyAdminBot(`✅ Withdraw Approved\nUser: ${APP.DB.users[w.email]?.username||w.email}\nAmount: ${w.amount}\nAddress: ${w.address}`);
      });
    });
    adminWithdraws.querySelectorAll('.reject').forEach(b=>{
      b.addEventListener('click',()=>{ const id=b.dataset.id; const w=APP.DB.withdraws[id]; if(!w) return;
        w.status='rejected'; APP.DB.withdraws[id]=w; APP.DB.save(); renderWithdraws();
        APP.notifyAdminBot(`❌ Withdraw Rejected\nUser: ${APP.DB.users[w.email]?.username||w.email}\nAmount: ${w.amount}`);
      });
    });
  }

  if(adminForm){
    adminForm.addEventListener('submit',(e)=>{
      e.preventDefault();
      const fd = new FormData(adminForm); const {email,password} = Object.fromEntries(fd.entries());
      if(email === ADMIN_CRED.email && password === ADMIN_CRED.password){
        loggedAdmin = true;
        adminForm.classList.add('hidden');
        adminControls.classList.remove('hidden');
        renderUsers(); renderTasks(); renderWithdraws();
      } else alert('Admin login required');
    });
  }

  if(addBalanceForm){
    addBalanceForm.addEventListener('submit',(e)=>{ e.preventDefault();
      const fd = new FormData(addBalanceForm); const {email,amount} = Object.fromEntries(fd.entries());
      if(APP.DB.users[email]){
        APP.DB.users[email].balance = Number(APP.DB.users[email].balance||0) + Number(amount);
        APP.DB.save(); alert('Added'); renderUsers();
      } else alert('User not found');
    });
  }

  if(addTaskForm){
    addTaskForm.addEventListener('submit',(e)=>{ e.preventDefault();
      const fd = new FormData(addTaskForm); const t=Object.fromEntries(fd.entries());
      APP.DB.tasks.push({title:t.title,url:t.url,reward:Number(t.reward||0.0002)});
      APP.DB.save(); renderTasks();
    });
  }

});
