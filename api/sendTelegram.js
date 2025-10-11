// api/sendTelegram.js
import fetch from 'node-fetch';
export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' });
  const BOT_TOKEN = process.env.TG_BOT_TOKEN; const CHAT_ID = process.env.TG_CHAT_ID;
  if(!BOT_TOKEN || !CHAT_ID) return res.status(500).json({ error:'Missing env vars' });
  try{
    const { text } = req.body; if(!text) return res.status(400).json({ error:'Missing text' });
    const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode:'HTML' })
    });
    const data = await resp.json();
    if(!data.ok) return res.status(500).json({ error:'Telegram error', details: data });
    return res.status(200).json({ ok:true });
  }catch(err){ console.error(err); return res.status(500).json({ error:'Server error', details: String(err) }); }
}
