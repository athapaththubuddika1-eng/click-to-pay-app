document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('adminLogin');
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const em = form.email.value.trim(), pw = form.password.value;
    // simple client-side check; serverless adminAuth endpoint can be used for production
    if(em === 'hasanbuddika1@gmail.com' && pw === 'Aabbcc.123'){
      document.getElementById('adminArea').style.display='block'; form.style.display='none'; loadAdmin();
    } else alert('Invalid admin credentials');
  });

  document.getElementById('addBalBtn').addEventListener('click', ()=>{
    const email = document.getElementById('abEmail').value.trim().toLowerCase(), amt = Number(document.getElementById('abAmount').value||0);
    const db = APP.loadDB(); const u = db.users.find(x=>x.email===email);
    if(!u) return alert('User not found');
    u.balance = Number(u.balance||0) + amt; APP.saveDB(db); alert('Added'); loadAdmin();
  });

  document.getElementById('addTask').addEventListener('click', ()=>{
    const t = document.getElementById('taskTitle').value.trim(), url=document.getElementById('taskUrl').value.trim(), amt=Number(document.getElementById('taskAmount').value||0);
    if(!t||!url||!amt) return alert('fill');
    const db = APP.loadDB(); db.tasks.push({ id: uid(8), title:t, url, amount:amt }); APP.saveDB(db); loadAdmin();
  });

  window.loadAdmin = function(){
    const db = APP.loadDB();
    // pending withdraws
    const pw = document.getElementById('pendingWithdraws'); pw.innerHTML='';
    db.withdraws.filter(w=>w.status==='pending').forEach(w=>{
      const li=document.createElement('li');
      li.innerHTML = `${w.createdAt.split('T')[0]} — ${w.email} — ${money(w.amount)} — ${w.address} <button data-id="${w.id}" class="approve">Approve</button> <button data-id="${w.id}" class="reject">Reject</button>`;
      pw.appendChild(li);
    });
    document.querySelectorAll('.approve').forEach(b=>b.addEventListener('click', e=>approve(e.target.dataset.id)));
    document.querySelectorAll('.reject').forEach(b=>b.addEventListener('click', e=>rejectW(e.target.dataset.id)));
    // tasks list
    const tl = document.getElementById('taskList'); tl.innerHTML='';
    db.tasks.forEach((t, idx)=>{ const li=document.createElement('li'); li.innerHTML = `${t.title} — ${t.url} — ${money(t.amount)} <button data-idx="${idx}" class="delTask">Remove</button>`; tl.appendChild(li); });
    document.querySelectorAll('.delTask').forEach(b=>b.addEventListener('click', e=>{ const db=APP.loadDB(); db.tasks.splice(Number(e.target.dataset.idx),1); APP.saveDB(db); loadAdmin(); }));
    // users
    const ul = document.getElementById('userList'); ul.innerHTML='';
    db.users.forEach(u=>{ const li=document.createElement('li'); li.innerHTML = `${u.username} — ${u.email} — ${money(u.balance)} — Referrals:${(u.referrals||[]).length} <button data-email="${u.email}" class="banBtn">${u.banned?'Unban':'Ban'}</button>`; ul.appendChild(li); });
    document.querySelectorAll('.banBtn').forEach(b=>b.addEventListener('click', e=>{ const db=APP.loadDB(); const user = db.users.find(x=>x.email===e.target.dataset.email); user.banned = !user.banned; APP.saveDB(db); loadAdmin(); }));
  };

  function approve(id){
    const db=APP.loadDB(); const w = db.withdraws.find(x=>x.id===id); if(!w) return;
    w.status='approved'; w.processedAt = new Date().toISOString();
    // already subtracted at request time
    APP.saveDB(db); loadAdmin();
    // notify via serverless
    fetch('/api/sendTelegram', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text:`✅ Withdraw Approved\nUser: ${w.email}\nAmount: $${w.amount}\nAddress: ${w.address}` }) }).catch(()=>{});
    // notify user (for demo just alert)
    alert('Approved');
  }
  function rejectW(id){
    const db=APP.loadDB(); const w = db.withdraws.find(x=>x.id===id); if(!w) return;
    w.status='rejected'; w.processedAt = new Date().toISOString();
    // refund user's balance
    const u = db.users.find(x=>x.email===w.email); if(u) u.balance = Number(u.balance||0) + Number(w.amount);
    APP.saveDB(db); loadAdmin();
    fetch('/api/sendTelegram', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text:`❌ Withdraw Rejected\nUser: ${w.email}\nAmount: $${w.amount}` }) }).catch(()=>{});
    alert('Rejected and refunded');
  }
});
