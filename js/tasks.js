// js/tasks.js
import { db } from './firebase.js';
import { collection, onSnapshot, addDoc, doc, getDoc, deleteDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const uid = localStorage.getItem('uid');
if(!uid) location.href='login.html';

const tasksUl = document.getElementById('tasksUl');
const myTasks = document.getElementById('myTasks');

function renderTaskItem(id,t){
  const li = document.createElement('li');
  li.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div><strong>${t.title}</strong><div class="small">${t.amount} USD</div></div><div><button class="btn btn-primary joinBtn" data-id="${id}" data-link="${t.link}" data-amt="${t.amount}">▶ Join</button></div></div>`;
  return li;
}

onSnapshot(collection(db,'tasks'), snap=>{
  tasksUl.innerHTML='';
  snap.forEach(d=> tasksUl.appendChild(renderTaskItem(d.id, d.data())) );
  document.querySelectorAll('.joinBtn').forEach(btn=>{
    btn.onclick = async ()=>{
      const link = btn.dataset.link; const amt = Number(btn.dataset.amt);
      await addDoc(collection(db, `user_tasks_${uid}`), { title: btn.closest('li').querySelector('strong').innerText, link, amount: amt, joinedAt: new Date().toISOString() });
      window.open(link,'_blank');
      btn.disabled = true; btn.innerText='Joined';
      loadMyTasks();
    };
  });
});

async function loadMyTasks(){
  myTasks.innerHTML='';
  const snaps = await getDocs(collection(db, `user_tasks_${uid}`));
  snaps.forEach(d=>{
    const it = d.data();
    const li = document.createElement('li');
    li.innerHTML = `<div style="display:flex;justify-content:space-between"><div><strong>${it.title}</strong><div class="small">${it.amount} USD</div></div><div><button class="btn btn-primary claimBtn" data-doc="${d.id}" data-amt="${it.amount}">Claim</button></div></div>`;
    myTasks.appendChild(li);
  });
  document.querySelectorAll('.claimBtn').forEach(btn=>{
    btn.onclick = async ()=>{
      const docId = btn.dataset.doc; const amt = Number(btn.dataset.amt);
      // credit
      const uRef = doc(db,'users',uid);
      const uSnap = await getDoc(uRef);
      await updateDoc(uRef, { balance: (uSnap.data().balance||0) + amt });
      await deleteDoc(doc(db, `user_tasks_${uid}`, docId));
      alert('Claimed!');
      loadMyTasks();
    };
  });
}
import { getDocs } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
loadMyTasks();
