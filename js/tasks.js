// js/tasks.js - display tasks and claim
import { db } from './firebase.js';
import { ref, onValue, get, push, set } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

const uid = localStorage.getItem('uid');
const tasksUl = document.getElementById('tasksUl');
const myTasks = document.getElementById('myTasks');

function loadTasks(){
  onValue(ref(db,'tasks'), snap=>{
    tasksUl.innerHTML = '';
    snap.forEach(child=>{ const v = child.val(); const li = document.createElement('li'); li.className='list'; li.innerHTML = `<div style="display:flex;justify-content:space-between"><div><strong>${v.title}</strong><div class="small">${v.amount} USD</div></div><div><button class="btn btn-primary" onclick="joinTask('${child.key}')">▶ Join</button></div></div>`; tasksUl.appendChild(li); });
  });
}

window.joinTask = async (taskId)=>{
  const tSnap = await get(ref(db, `tasks/${taskId}`));
  if(!tSnap.exists()) return;
  const task = tSnap.val();
  // record join for user
  const uTaskRef = push(ref(db, `userTasks/${uid}`));
  await set(uTaskRef, { taskId, title: task.title, amount: task.amount, link: task.link, joinedAt: new Date().toISOString() });
  window.open(task.link,'_blank');
  loadMyTasks();
};

async function loadMyTasks(){
  myTasks.innerHTML = '';
  const snap = await get(ref(db, `userTasks/${uid}`));
  if(!snap.exists()) return;
  snap.forEach(child=>{ const v = child.val(); const el = document.createElement('li'); el.className='list'; el.innerHTML = `<div style="display:flex;justify-content:space-between"><div><strong>${v.title}</strong><div class="small">${v.amount} USD</div></div><div><button class="btn btn-primary" onclick="claimTask('${child.key}', ${v.amount})">✅ Claim</button></div></div>`; myTasks.appendChild(el); });
}
window.claimTask = async (key, amount)=>{
  const uRef = ref(db, `users/${uid}`);
  const s = await get(uRef);
  if(!s.exists()) return;
  await update(uRef, { balance: (Number(s.val().balance||0) + Number(amount)) });
  // remove user task
  await set(ref(db, `userTasks/${uid}/${key}`), null);
  alert('Claimed');
  loadMyTasks();
};

loadTasks(); loadMyTasks();
