// tasks.js - list tasks and claim
document.addEventListener('DOMContentLoaded', ()=>{
  const cur = currentUser(); if(!cur) return location.href='login.html';
  const db = loadDB(); const list = document.getElementById('tasksList');
  if(!list) return;
  list.innerHTML = '';
  db.tasks.forEach(t=>{
    const li = document.createElement('li');
    li.innerHTML = `<strong>${t.title}</strong><div style="margin-top:8px">Reward: ${money(t.amount)} <button class="btn" data-url="${t.url}" data-id="${t.id}">Join ▶</button> <button class="btn hidden" data-claim="${t.id}">Claim ✅</button></div>`;
    list.appendChild(li);
  });
  document.querySelectorAll('[data-url]').forEach(b=>{
    b.addEventListener('click', e=>{
      const id = e.target.dataset.id; const url = e.target.dataset.url;
      // open in new tab (avoid popup block) but mobile miniapp behavior may embed; new tab is dependable
      window.open(url,'_blank');
      e.target.innerText = 'Waiting 5s...';
      let s = 5;
      const iv = setInterval(()=>{ s--; e.target.innerText = 'Wait ' + s + 's'; if(s<=0){ clearInterval(iv); e.target.style.display='none'; const claim = document.querySelector(`[data-claim="${id}"]`); claim.classList.remove('hidden'); claim.addEventListener('click', ()=> claimTask(id)); } },1000);
    });
  });

  function claimTask(id){
    const db = loadDB(); const cur = currentUser(); const u = db.users.find(x=>x.email===cur.email);
    const task = db.tasks.find(t=>t.id===id); if(!task) return alert('Task not available');
    u.balance = Number(u.balance||0) + Number(task.amount);
    u.tasksCompleted = (u.tasksCompleted||0) + 1;
    db.tasks = db.tasks.filter(t=>t.id!==id);
    saveDB(db); setCurrentUser({ email:u.email, username:u.username });
    alert('Task reward added ' + money(task.amount));
    location.href='dashboard.html';
  }
});
