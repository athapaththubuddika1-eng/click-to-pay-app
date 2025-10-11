// api/adminAuth.js
module.exports = (req,res) => {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASS = process.env.ADMIN_PASS;
  if(req.method !== 'POST') return res.status(405).json({ error:'POST only' });
  const { email, password } = req.body || {};
  if(email === ADMIN_EMAIL && password === ADMIN_PASS) return res.status(200).json({ ok:true });
  return res.status(401).json({ ok:false });
};
