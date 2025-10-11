document.addEventListener('DOMContentLoaded', ()=>{
  const regForm = document.getElementById('registerForm');
  if(regForm){
    regForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(regForm); const data = Object.fromEntries(fd.entries());
      try{ APP.register({ username:data.username, email:data.email, password:data.password, referral:data.referral }); localStorage.setItem('acp_current', JSON.stringify({ email:data.email, username:data.username })); window.location.href='dashboard.html'; }catch(err){ alert(err.message); }
    });
  }
  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit',(e)=>{
      e.preventDefault();
      const fd = new FormData(loginForm); const data = Object.fromEntries(fd.entries());
      try{ APP.login({ email:data.email, password:data.password }); window.location.href='dashboard.html'; }catch(err){ alert(err.message); }
    });
  }
});
