/* earn.js
   - Captcha + Ad flow
   - Rewards: captchaReward = 0.0002, adReward = 0.00015
   - LocalStorage DB key: acp_db_v1
   - current user stored as acp_user (object with email & username)
*/

const ADS_LINK = 'https://www.effectivegatecpm.com/dnm2jrcaj?key=c73c264e4447410ce55eb32960238eaa';
const CAPTCHA_REWARD = 0.0002;
const AD_REWARD = 0.00015;
const DB_KEY = 'acp_db_v1';
const USER_KEY = 'acp_user';

function loadDB(){ try{ return JSON.parse(localStorage.getItem(DB_KEY)) || {users:[],tasks:[],withdraws:[],settings:{minWithdraw:0.1,watchReward:AD_REWARD,captchaReward:CAPTCHA_REWARD,referralBonus:0.005,dailyWithdrawLimit:1}} }catch(e){return {users:[],tasks:[],withdraws:[],settings:{minWithdraw:0.1,watchReward:AD_REWARD,captchaReward:CAPTCHA_REWARD,referralBonus:0.005,dailyWithdrawLimit:1}} } }
function saveDB(db){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }
function currentUser(){ return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
function setCurrentUser(u){ localStorage.setItem(USER_KEY, JSON.stringify(u)); }
function money(v){ return '$' + Number(v||0).toFixed(6); }

// captcha generator
function genCaptcha(){
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for(let i=0;i<5;i++) s += chars.charAt(Math.floor(Math.random()*chars.length));
  document.getElementById('captchaValue').innerText = s;
}
document.getElementById('reloadCaptcha').addEventListener('click', genCaptcha);
genCaptcha();

// helpers for balance
function addToUserBalance(email, amount){
  const db = loadDB();
  const user = db.users.find(u=>u.email === email);
  if(!user) return false;
  user.balance = Number(user.balance || 0) + Number(amount);
  saveDB(db);
  // update acp_user if logged in
  const cu = currentUser();
  if(cu && cu.email === email){
    setCurrentUser({ email: user.email, username: user.username });
  }
  return true;
}

// UI bindings
const form = document.getElementById('earnForm');
const watchOnlyBtn = document.getElementById('watchOnly');
const status = document.getElementById('status');
const submitBtn = document.getElementById('submitCaptcha');

function setStatus(txt){ status.innerText = txt; setTimeout(()=>{ status.innerText = '' }, 5000); }

// submit captcha flow
form.addEventListener('submit', function(e){
  e.preventDefault();
  const cu = currentUser();
  if(!cu){ alert('Please login/register first'); location.href='login.html'; return; }

  const userInput = (document.getElementById('captchaInput').value || '').trim().toUpperCase();
  const real = (document.getElementById('captchaValue').innerText || '').trim().toUpperCase();
  if(!userInput){ alert('Type the captcha'); return; }
  if(userInput !== real){ alert('Invalid captcha — try again'); genCaptcha(); return; }

  // add captcha reward immediately
  addToUserBalance(cu.email, CAPTCHA_REWARD);
  setStatus(`+${CAPTCHA_REWARD.toFixed(6)} added for captcha`);

  // disable button & start 5s countdown then open ad
  submitBtn.disabled = true;
  let t = 5;
  const iv = setInterval(()=>{
    submitBtn.innerText = `⏳ Opening Ad in ${t}s...`;
    t--;
    if(t < 0){
      clearInterval(iv);
      // add ad reward BEFORE navigation (so it persists)
      addToUserBalance(cu.email, AD_REWARD);
      setStatus(`+${AD_REWARD.toFixed(6)} added for ad — opening...`);
      // send optional notify to serverless (non-blocking)
      try{
        fetch('/api/sendTelegram', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ text: `User ${cu.username || cu.email} opened an ad.` })
        }).catch(()=>{});
      }catch(e){}
      // navigate to ad link in same window (mini-app friendly)
      window.location.href = ADS_LINK;
      // note: if navigation is blocked, re-enable button
      setTimeout(()=>{ submitBtn.disabled = false; submitBtn.innerText = '▶ Submit & Open Ad'; }, 1500);
    }
  }, 1000);
});

// watch only (no captcha) flow: just open ad with 5s countdown, give adReward
watchOnlyBtn.addEventListener('click', ()=>{
  const cu = currentUser();
  if(!cu){ alert('Please login/register first'); location.href='login.html'; return; }

  watchOnlyBtn.disabled = true;
  let t = 5;
  const orig = watchOnlyBtn.innerText;
  const iv = setInterval(()=>{
    watchOnlyBtn.innerText = `⏳ Opening in ${t}s...`; t--;
    if(t < 0){
      clearInterval(iv);
      // give ad reward
      addToUserBalance(cu.email, AD_REWARD);
      setStatus(`+${AD_REWARD.toFixed(6)} added for ad`);
      try{
        fetch('/api/sendTelegram', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ text: `User ${cu.username || cu.email} watched an ad (watch-only).` })
        }).catch(()=>{});
      }catch(e){}
      window.location.href = ADS_LINK;
      setTimeout(()=>{ watchOnlyBtn.disabled = false; watchOnlyBtn.innerText = orig; }, 1500);
    }
  }, 1000);
});
