// js/main.js
// main UI helpers (splash, auth helpers, safeEmail)

export function hideSplash(delay = 600) {
  const s = document.getElementById('splash');
  if (!s) return;
  setTimeout(()=> {
    s.style.opacity = '0';
    setTimeout(()=> s.style.display='none', 400);
  }, delay);
}

export function requireAuth() {
  const email = localStorage.getItem('userEmail');
  if(!email) {
    window.location.href = 'login.html';
    throw new Error('Not logged in');
  }
  return email;
}

export function safeEmail(email) {
  return String(email).toLowerCase().replaceAll('.', '_');
}

export function fmtUSD(v, digits=6) {
  return '$' + Number(v || 0).toFixed(digits);
}
