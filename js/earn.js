// js/earn.js (FINAL) ----------------------------------------------------
// Flow:
// 1) User types captcha and submits.
// 2) If captcha correct -> open ad in Telegram WebApp (or new tab fallback).
// 3) Start a 5s countdown on the original page.
// 4) When countdown completes -> award both captchaReward and adReward.
// 5) Persist in local DB (acp_db_v1) as micro-units (1 unit = $0.000001).

/* CONFIG */
const ADS_LINK = 'https://www.effectivegatecpm.com/dnm2jrcaj?key=c73c264e4447410ce55eb32960238eaa';

// Rewards in dollars
const CAPTCHA_USD = 0.0002;   // $0.0002
const AD_USD = 0.00015;       // $0.00015

// Convert to micro-units (integers) to avoid float errors: 1 USD = 1,000,000 micro-units
const MICRO = 1_000_000;
const CAPTCHA_MICRO = Math.round(CAPTCHA_USD * MICRO); // 200
const AD_MICRO = Math.round(AD_USD * MICRO);           // 150

const DB_KEY = 'acp_db_v1';
const USER_KEY = 'acp_user';

/* HELPERS */
function loadDB(){
  try{
    const raw = localStorage.getItem(DB_KEY);
    if(!raw) {
      const init = { users:[], tasks:[], withdraws:[], settings:{ minWithdraw:0.1, watchReward:AD_USD, captchaReward:CAPTCHA_USD, referralBonus:0.005, dailyWithdrawLimit:1 }};
      localStorage.setItem(DB_KEY, JSON.stringify(init));
      return init;
    }
    return JSON.parse(raw);
  }catch(e){
    return { users:[], tasks:[], withdraws:[], settings:{ minWithdraw:0.1, watchReward:AD_USD, captchaReward:CAPTCHA_USD, referralBonus:0.005, dailyWithdrawLimit:1 } };
  }
}
function saveDB(db){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }

function currentUser(){ try{ return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }catch(e){ return null; } }
function setCurrentUser(u){ localStorage.setItem(USER_KEY, JSON.stringify(u)); }

function microToUsdStr(m){ // show $0.000200 style
  const usd = (m / MICRO).toFixed(6);
  return '$' + Number(usd).toFixed(6);
}
function addMicroToUser(email, microAmount){
  const db = loadDB();
  const user = db.users.find(u => u.email === email);
  if(!user) return false;
  // ensure user.balanceMicro exists
  user.balanceMicro = Number(user.balanceMicro || 0) + Number(microAmount);
  // also keep a legacy float balance for compatibility (optional)
  user.balance = (Number(user.balanceMicro) / MICRO).toFixed(6);
  saveDB(db);
  const cu = currentUser();
  if(cu && cu.email === email) setCurrentUser({ email: user.email, username: user.username });
  return true;
}

/* TELEGRAM OPEN HELPER */
function openInTelegram(url){
  try{
    if(window.Telegram && window.Telegram.WebApp && typeof window.Telegram.WebApp.openLink === 'function'){
      // Preferred: open in Telegram in-app browser (keeps web app alive)
      window.Telegram.WebApp.openLink(url);
      return { method: 'telegram', success: true };
    }
  }catch(e){
    // ignore
  }
  // fallback: try to open new tab/window
  try{
    const w = window.open(url, '_blank');
    if(w) return { method: 'window.open', success: true, windowRef: w };
    // if popup blocked, fallback to same-window navigation
    window.location.href = url;
    return { method: 'location', success: true };
  }catch(e){
    // last resort: same-window
    window.location.href = url;
    return { method: 'location', success: true };
  }
}

/* CAPTCHA GENERATOR (simple) */
function generateCaptcha(targetId){
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = '';
  for(let i=0;i<5;i++) s += chars.charAt(Math.floor(Math.random()*chars.length));
  const el = document.getElementById(targetId);
  if(el) el.innerText = s;
  return s;
}

/* UI ELEMENTS */
const captchaValueEl = document.getElementById('captchaValue');
const reloadBtn = document.getElementById('reloadCaptcha');
const captchaInput = document.getElementById('captchaInput');
const submitBtn = document.getElementById('submitCaptcha');
const watchOnlyBtn = document.getElementById('watchOnly');
const statusEl = document.getElementById('status');

// init
if(captchaValueEl) generateCaptcha('captchaValue');
if(reloadBtn) reloadBtn.addEventListener('click', ()=> generateCaptcha('captchaValue'));

/* MAIN FLOW: Captcha submit => open ad => countdown in original page => reward */
if(submitBtn){
  submitBtn.addEventListener('click', function(evt){
    evt.preventDefault();
    const cu = currentUser();
    if(!cu){ alert('Please login first'); location.href = 'login.html'; return; }

    const typed = (captchaInput.value || '').trim().toUpperCase();
    const real = (captchaValueEl && captchaValueEl.innerText) ? captchaValueEl.innerText.trim().toUpperCase() : '';
    if(!typed){ alert('Please type the captcha shown'); return; }
    if(typed !== real){ alert('Wrong captcha — try again'); generateCaptcha('captchaValue'); captchaInput.value=''; return; }

    // disable UI
    submitBtn.disabled = true;
    submitBtn.innerText = '⏳ Opening ad...';

    // open ad in Telegram in-app or new tab (best-effort)
    const openResult = openInTelegram(ADS_LINK);

    // Start countdown in original page (5s)
    let time = 5;
    statusEl.innerText = `Watch ad — counting ${time}s...`;
    const iv = setInterval(()=>{
      time--;
      if(time >= 0) statusEl.innerText = `Watch ad — counting ${time}s...`;
      if(time < 0){
        clearInterval(iv);
        // Award both captcha + ad rewards (micro units)
        const totalMicro = CAPTCHA_MICRO + AD_MICRO; // e.g. 200 + 150 = 350
        const ok = addMicroToUser(cu.email, totalMicro);
        if(ok){
          statusEl.innerText = `✅ Earned ${microToUsdStr(totalMicro)} (captcha+ad).`;
          // optional notify serverless telegram
          try{
            fetch('/api/sendTelegram', {
              method:'POST', headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ text: `User ${cu.username || cu.email} watched ad and earned ${microToUsdStr(totalMicro)}.` })
            }).catch(()=>{});
          }catch(e){}
        } else {
          statusEl.innerText = '⚠️ Earn failed (user not found).';
        }

        // restore UI
        submitBtn.disabled = false;
        submitBtn.innerText = '▶ Submit & Open Ad';
        captchaInput.value = '';
        generateCaptcha('captchaValue');

        // update small visible balance fields if present
        try{
          const db = loadDB();
          const u = db.users.find(x => x.email === cu.email);
          if(u){
            const balEls = document.querySelectorAll('[data-balance-for]');
            balEls.forEach(el => {
              if(el.dataset.balanceFor === cu.email) el.innerText = microToUsdStr(u.balanceMicro || 0);
            });
          }
        }catch(e){}
      }
    }, 1000);
  });
}

/* WATCH-ONLY FLOW (no captcha) */
if(watchOnlyBtn){
  watchOnlyBtn.addEventListener('click', function(e){
    e.preventDefault();
    const cu = currentUser();
    if(!cu){ alert('Please login first'); location.href='login.html'; return; }
    watchOnlyBtn.disabled = true;
    let t = 5;
    statusEl.innerText = `Watching ad — ${t}s...`;
    const openResult = openInTelegram(ADS_LINK);
    const iv = setInterval(()=>{
      t--;
      statusEl.innerText = `Watching ad — ${t}s...`;
      if(t < 0){
        clearInterval(iv);
        // award ad reward only
        const ok = addMicroToUser(cu.email, AD_MICRO);
        if(ok){
          statusEl.innerText = `✅ Earned ${microToUsdStr(AD_MICRO)} for ad.`;
          try{
            fetch('/api/sendTelegram', {
              method:'POST', headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ text: `User ${cu.username || cu.email} watched ad (watch-only) and earned ${microToUsdStr(AD_MICRO)}.` })
            }).catch(()=>{});
          }catch(e){}
        } else statusEl.innerText = '⚠️ Earn failed (user not found).';
        setTimeout(()=>{ watchOnlyBtn.disabled = false; watchOnlyBtn.innerText = '▶ Watch Ad (No Captcha)'; }, 700);
      }
    }, 1000);
  });
}
