// api/sendTelegram.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    if(req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
    const { text } = req.body || {};
    if(!text) return res.status(400).json({ error: 'Missing text' });
    const token = process.env.BOT_TOKEN;
    const chatId = process.env.BOT_CHAT_ID;
    if(!token || !chatId) return res.status(500).json({ error: 'Missing env BOT_TOKEN or BOT_CHAT_ID' });
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });
    const data = await r.json();
    return res.status(200).json({ ok: data.ok, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
