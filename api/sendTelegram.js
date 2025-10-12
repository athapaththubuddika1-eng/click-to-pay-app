// api/sendTelegram.js
import fetch from 'node-fetch';
export default async function handler(req, res){
  try{
    const body = req.body || {};
    const text = body.text || '';
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;
    if(!BOT_TOKEN || !CHAT_ID) return res.status(500).json({error:'Missing env vars BOT_TOKEN/CHAT_ID'});
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode:'HTML' })});
    const j = await r.json();
    return res.status(200).json(j);
  }catch(e){ console.error(e); res.status(500).json({error:e.message}); }
}
