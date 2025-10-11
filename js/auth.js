// handles register and login forms
document.addEventListener('DOMContentLoaded',()=>{
  const reg = document.getElementById('registerForm');
  if(reg){
    reg.addEventListener('submit',async (e)=>{
      e.preventDefault();
      const fd = new FormData(reg);
      const data = Object.fromEntries(fd.entries());
      try{
        // show loading
        document.getElementById('modalLoading')?.classList.remove('hidden');
        APP.registerUser({ username:data.username, email:data.email, password:data.password, referral:data.referral });
        // mark logged in
        localStorage.setItem('acp_current', data.email.toLowerCase());
        // set referral code if any
        window.location.href = 'dashboard.html';
      }catch(err){
        alert(err.message||'Register failed');
      }finally{ document.getElementById('modalLoading')?.classList.add('hidden');}
    });
  }

  const login = document.getElementById('loginForm');
  if(login){
    login.addEventListener('submit',(e)=>{ e.preventDefault();
      const fd = new FormData(login); const {email,password} = Object.fromEntries(fd.entries());
      const user = APP.DB.users[email.toLowerCase()];
      if(!user) return alert('No account');
      if(user.banned) return alert('Account banned');
      if(user.password !== password) return alert('Invalid password');
      localStorage.setItem('acp_current', email.toLowerCase());
      window.location.href = 'dashboard.html';
    });
  }
});
