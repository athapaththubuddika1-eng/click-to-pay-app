// js/tasks.js
import { db, ref, get, push, set, update } from './firebase.js';
import { requireAuth, safeEmail } from './main.js';

export async function loadTasksPage() {
  const email = requireAuth();
  const safe = safeEmail(email);

  async function loadTasks(){
    const tSnap = await get(ref(db,'tasks'));
    const list = document.getElementById('tasksList');
    list.innerHTML = '';
    if(!tSnap.exists()){ list.innerHTML = '<li class="small-muted">No tasks</li>'; return; }
    const tasks = tSnap.val();
    Object.entries(tasks).forEach(([k,t])=>{
      const li = document.createElement('li'); li.className='list-item';
      li.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><strong>${t.title}</strong><div class="small-muted">${t.link}</div></div>
          <div><button class="button btn-primary joinBtn" data-id="${k}" data-url="${t.link}" data-amt="${t.amount}">▶ Join</button></div>
        </div>
      `;
      list.appendChild(li);
    });

    document.querySelectorAll('.joinBtn').forEach(btn => btn.addEventListener('click', async (e)=>{
      const id = btn.dataset.id; const url = btn.dataset.url; const amt = Number(btn.dataset.amt || 0);
      window.open(url, '_blank');
      btn.disabled = true; btn.innerText = '⏳ Joined';
      await push(ref(db, `tasks_inprogress/${safe}`), { taskId: id, url, amount: amt, ts: new Date().toISOString(), status: 'joined' });
      setTimeout(()=>{ btn.innerText = '✅ Joined'; }, 800);
      loadMyTasks(); // refresh
    }));
  }

  async function loadMyTasks(){
    const snap = await get(ref(db, `tasks_inprogress/${safe}`));
    const list = document.getElementById('myTasks');
    list.innerHTML = '';
    if(!snap.exists()){ list.innerHTML = '<li class="small-muted">No tasks yet</li>'; return; }
    const obj = snap.val();
    for(const k in obj){
      const it = obj[k];
      const li = document.createElement('li'); li.className='list-item';
      li.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><strong>${it.taskId}</strong><div class="small-muted">${it.url}</div></div>
          <div><button data-key="${k}" class="button btn-primary claimBtn">Claim $${Number(it.amount||0)}</button></div>
        </div>
      `;
      list.appendChild(li);
    }
    document.querySelectorAll('.claimBtn').forEach(b => b.addEventListener('click', async (ev)=>{
      const key = ev.target.dataset.key;
      const snap = await get(ref(db, `tasks_inprogress/${safe}/${key}`));
      if(!snap.exists()) return alert('Task not found');
      const it = snap.val();
      const uRef = ref(db, `users/${safe}`);
      const uSnap = await get(uRef);
      const cur = Number(uSnap.val().balance || 0);
      await update(uRef, { balance: cur + Number(it.amount || 0) });
      await push(ref(db, `tasks_completed/${safe}`), { ...it, completedAt: new Date().toISOString() });
      await set(ref(db, `tasks_inprogress/${safe}/${key}`), null);
      alert('Claimed!');
      loadTasks(); loadMyTasks();
    }));
  }

  await loadTasks();
  await loadMyTasks();
}
