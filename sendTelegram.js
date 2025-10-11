const fetch = require('node-fetch');
module.exports = async (req, res) => {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const BOT_CHAT_ID = process.env.BOT_CHAT_ID;
  if (!BOT_TOKEN || !BOT_CHAT_ID) return res.status(500).json({error:'Bot not configured'});
  try {
    const { message } = req.body || {};
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const resp = await fetch(url, {
      method:'post', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ chat_id: BOT_CHAT_ID, text: message, parse_mode: 'HTML' })
    });
    const data = await resp.json();
    res.status(200).json({ok:true,data});
  } catch(err){ res.status(500).json({error:err.toString()}); }
};