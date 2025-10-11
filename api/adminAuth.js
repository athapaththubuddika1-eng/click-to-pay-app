module.exports = (req, res) => {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASS = process.env.ADMIN_PASS;
  if(!ADMIN_EMAIL || !ADMIN_PASS) return res.status(500).json({ error: 'Admin not configured' });
  const { email, password } = req.body || {};
  if(email === ADMIN_EMAIL && password === ADMIN_PASS) {
    return res.status(200).json({ ok: true, token: 'ADMIN_OK' });
  }
  return res.status(401).json({ ok: false });
};
